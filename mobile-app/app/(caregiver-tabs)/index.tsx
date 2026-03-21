import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { API } from '../../services/api';

export default function Dashboard() {
  const [elderly, setElderly] = useState([]);

  const fetchElderly = async () => {
    try {
      const res = await API.get('/elderly');
      setElderly(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchElderly();
    }, [])
  );

  const handleDelete = async (id: number) => {
    try {
      await API.delete(`/elderly/${id}`);
      Alert.alert("Deleted", "Elder removed successfully");
      fetchElderly();
    } catch (err: any) {
      console.log("Delete error:", err?.response?.data || err);
      Alert.alert("Error", "Could not delete elder");
    }
  };

  const confirmDelete = (id: number) => {
    Alert.alert(
      "Delete Elder",
      "This will remove the elder and all associated data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(id)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Caregiver Dashboard</Text>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push('/add-elderly')}
      >
        <Text style={styles.text}>+ Add Elderly</Text>
      </TouchableOpacity>

      <FlatList
        data={elderly}
        keyExtractor={(item: any) => item.id.toString()}
        ListEmptyComponent={<Text>No elderly added</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Age: {item.age}</Text>
            <Text>Condition: {item.condition}</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => confirmDelete(item.id)}
              >
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  router.push({
                    pathname: '/edit-elderly',
                    params: {
                      id: item.id,
                      name: item.name,
                      age: item.age,
                      condition: item.condition,
                    },
                  })
                }
              >
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.routineBtn}
                onPress={() =>
                  router.push({
                    pathname: '/add-routine',
                    params: { id: item.id }
                  })
                }
              >
                <Text style={styles.btnText}>Add Routine</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() =>
                  router.push({
                    pathname: '/view-routine',
                    params: { id: item.id }
                  })
                }
              >
                <Text style={styles.btnText}>View Routine</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  addBtn: { backgroundColor: 'green', padding: 15, marginBottom: 10 },
  text: { color: 'white', textAlign: 'center' },
  card: {
    backgroundColor: '#eee',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginTop: 10 },
  deleteBtn: {
    backgroundColor: 'red',
    padding: 10,
    marginRight: 10
  },
  editBtn: {
    backgroundColor: 'orange',
    padding: 10
  },
  routineBtn: {
    backgroundColor: 'purple',
    padding: 10,
    marginRight: 10
  },
  viewBtn: {
    backgroundColor: 'blue',
    padding: 10
  },
  btnText: { color: 'white' }
});