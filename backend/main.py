from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

app = FastAPI()

# -------------------- DB --------------------
engine = create_engine("sqlite:///./elderly.db", connect_args={"check_same_thread": False})
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
    time = Column(String)  # HH:MM
    status = Column(String, default="pending")
    created_at = Column(String, default=lambda: datetime.now().isoformat())  # 🔥 NEW


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


# -------------------- AUTH --------------------

@app.post("/register")
def register(user: RegisterSchema):
    db = SessionLocal()

    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        email=user.email,
        password=user.password,
        role="caregiver"
    )

    db.add(new_user)
    db.commit()

    return {"message": "Caregiver registered"}


@app.post("/login")
def login(user: LoginSchema):
    db = SessionLocal()

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "email": db_user.email,
        "role": db_user.role
    }


# -------------------- ELDERLY --------------------

@app.post("/elderly")
def create_elderly(data: ElderlyCreateSchema):
    db = SessionLocal()

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    # create login
    new_user = User(
        email=data.email,
        password=data.password,
        role="elderly"
    )
    db.add(new_user)
    db.commit()

    # create profile
    new_elder = Elderly(
        name=data.name,
        age=data.age,
        condition=data.condition,
        user_email=data.email
    )
    db.add(new_elder)
    db.commit()

    return {"message": "Elderly + account created"}


@app.get("/elderly")
def get_elderly():
    db = SessionLocal()
    return db.query(Elderly).all()


# -------------------- ROUTINES --------------------

@app.post("/routine")
def add_routine(data: RoutineSchema):
    db = SessionLocal()

    new_task = Routine(
        elderly_id=data.elderly_id,
        task=data.task,
        time=data.time,
        status="pending",
        created_at=datetime.now().isoformat()
    )

    db.add(new_task)
    db.commit()

    return {"message": "Routine added"}


# 🔵 Elder view (by email)
@app.get("/routine/user/{email}")
def get_user_routines(email: str):
    db = SessionLocal()

    elder = db.query(Elderly).filter(Elderly.user_email == email).first()

    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")

    tasks = db.query(Routine).filter(Routine.elderly_id == elder.id).all()

    return tasks


# 🔵 Caregiver view (by elderly id)
@app.get("/routine/{elderly_id}")
def get_routines_by_elderly(elderly_id: int):
    db = SessionLocal()

    tasks = db.query(Routine).filter(Routine.elderly_id == elderly_id).all()

    return tasks


# -------------------- MARK DONE --------------------

@app.put("/routine/{id}")
def mark_done(id: int):
    db = SessionLocal()

    task = db.query(Routine).filter(Routine.id == id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "done"
    db.commit()

    return {"message": "Completed"}


# -------------------- ALERT SYSTEM --------------------

@app.post("/alert")
def alert_caregiver(data: dict):
    """
    Called when elder misses task
    """
    print("🚨 ALERT: Elder missed task:", data)

    return {"message": "Caregiver alerted"}