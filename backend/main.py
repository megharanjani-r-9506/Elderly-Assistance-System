from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime



app = FastAPI()

# -------------------- DB --------------------
engine = create_engine(
    "sqlite:///./elderly.db",
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# -------------------- MODELS --------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String)


class Elderly(Base):
    __tablename__ = "elderly"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    age = Column(Integer)
    condition = Column(String)
    user_email = Column(String)


class Routine(Base):
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True)
    elderly_id = Column(Integer)
    task = Column(String)
    time = Column(String)
    status = Column(String, default="pending")
    created_at = Column(String, default=lambda: datetime.now().isoformat())


class Emergency(Base):
    __tablename__ = "emergency"

    id = Column(Integer, primary_key=True)
    elderly_id = Column(Integer)
    message = Column(String)
    created_at = Column(String, default=lambda: datetime.now().isoformat())


Base.metadata.create_all(bind=engine)

# -------------------- SCHEMAS --------------------

class LoginSchema(BaseModel):
    email: str
    password: str


class RegisterSchema(BaseModel):
    email: str
    password: str


class ElderlyCreateSchema(BaseModel):
    name: str
    age: int
    condition: str
    email: str
    password: str


class RoutineSchema(BaseModel):
    elderly_id: int
    task: str
    time: str


class RoutineUpdateSchema(BaseModel):
    task: str
    time: str


class EmergencySchema(BaseModel):
    email: str
    message: str


# -------------------- AUTH --------------------

@app.post("/register")
def register(user: RegisterSchema):
    db = SessionLocal()

    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="User exists")

    db.add(User(email=user.email, password=user.password, role="caregiver"))
    db.commit()

    return {"message": "Caregiver registered"}


@app.post("/login")
def login(user: LoginSchema):
    db = SessionLocal()

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"email": db_user.email, "role": db_user.role}


# -------------------- ELDERLY --------------------

@app.post("/elderly")
def create_elderly(data: ElderlyCreateSchema):
    db = SessionLocal()

    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="User exists")

    db.add(User(email=data.email, password=data.password, role="elderly"))
    db.commit()

    db.add(Elderly(
        name=data.name,
        age=data.age,
        condition=data.condition,
        user_email=data.email
    ))
    db.commit()

    return {"message": "Elderly created"}


@app.get("/elderly")
def get_elderly():
    db = SessionLocal()
    return db.query(Elderly).all()


@app.delete("/elderly/{elder_id}")
def delete_elderly(elder_id: int):
    db = SessionLocal()

    elder = db.query(Elderly).filter(Elderly.id == elder_id).first()
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")

    db.query(Routine).filter(Routine.elderly_id == elder_id).delete()
    db.query(Emergency).filter(Emergency.elderly_id == elder_id).delete()
    db.query(User).filter(User.email == elder.user_email).delete()

    db.delete(elder)
    db.commit()

    return {"message": "Elder deleted"}


# -------------------- ROUTINES --------------------

# add routine
@app.post("/routine")
def add_routine(data: RoutineSchema):
    db = SessionLocal()

    db.add(Routine(
        elderly_id=data.elderly_id,
        task=data.task,
        time=data.time
    ))
    db.commit()

    return {"message": "Routine added"}


# caregiver view routines (FIXES 405)
@app.get("/routine/{elderly_id}")
def get_routines_for_caregiver(elderly_id: int):
    db = SessionLocal()
    return db.query(Routine).filter(Routine.elderly_id == elderly_id).all()


# elder view routines
@app.get("/routine/user/{email}")
def get_user_routines(email: str):
    db = SessionLocal()

    elder = db.query(Elderly).filter(Elderly.user_email == email).first()
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")

    return db.query(Routine).filter(Routine.elderly_id == elder.id).all()


# mark routine done
@app.put("/routine/{id}")
def mark_done(id: int):
    db = SessionLocal()

    task = db.query(Routine).filter(Routine.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "done"
    db.commit()

    return {"message": "Completed"}


# edit routine
@app.put("/routine/edit/{id}")
def edit_routine(id: int, data: RoutineUpdateSchema):
    db = SessionLocal()

    task = db.query(Routine).filter(Routine.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.task = data.task
    task.time = data.time
    db.commit()

    return {"message": "Routine updated"}


# delete routine
@app.delete("/routine/{id}")
def delete_routine(id: int):
    db = SessionLocal()

    task = db.query(Routine).filter(Routine.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Routine deleted"}


# -------------------- EMERGENCY --------------------

@app.post("/emergency")
def trigger_emergency(data: EmergencySchema):
    db = SessionLocal()

    elder = db.query(Elderly).filter(Elderly.user_email == data.email).first()
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")

    db.add(Emergency(
        elderly_id=elder.id,
        message=data.message
    ))
    db.commit()

    print(f"🚨 EMERGENCY from {elder.name}")

    return {"message": "Emergency stored"}


@app.get("/emergency")
def get_emergencies():
    db = SessionLocal()

    alerts = (
        db.query(Emergency, Elderly.name)
        .join(Elderly, Emergency.elderly_id == Elderly.id)
        .order_by(Emergency.id.desc())
        .all()
    )

    return [
        {
            "id": a.Emergency.id,
            "name": a.name,
            "message": a.Emergency.message,
            "time": a.Emergency.created_at
        }
        for a in alerts
    ]