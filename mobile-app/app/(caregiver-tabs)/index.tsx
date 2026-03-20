import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { API } from '../../services/api';

export default function Dashboard() {
  const [elderly, setElderly] = useState<any[]>([]);

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
      fetchElderly();
    } catch {
      alert('Delete failed');
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.age}>{item.age} yrs</Text>
      </View>

      {/* DETAILS */}
      <Text style={styles.label}>Condition</Text>
      <Text style={styles.condition}>{item.condition}</Text>

      {/* ACTION ROW 1 */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.editBtn]}
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

        <TouchableOpacity
          style={[styles.btn, styles.deleteBtn]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* ACTION ROW 2 */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.routineBtn]}
          onPress={() =>
            router.push({
              pathname: '/add-routine',
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.btnText}>Add Routine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.viewBtn]}
          onPress={() =>
            router.push({
              pathname: '/view-routine',
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.btnText}>View Routine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* PAGE HEADER */}
      <Text style={styles.title}>Caregiver Dashboard</Text>

      {/* ADD ELDERLY BUTTON */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push('/add-elderly')}
      >
        <Text style={styles.addText}>＋ Add Elderly</Text>
      </TouchableOpacity>

      {/* LIST */}
      <FlatList
        data={elderly}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No elderly added yet</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 10,
  },

  addBtn: {
    backgroundColor: '#2ecc71',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },

  addText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },

  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: 'gray',
  },

  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  age: {
    color: 'gray',
  },

  label: {
    fontSize: 12,
    color: '#888',
  },

  condition: {
    marginBottom: 10,
    fontSize: 15,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  btn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginRight: 6,
  },

  btnText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },

  editBtn: {
    backgroundColor: '#f39c12',
  },

  deleteBtn: {
    backgroundColor: '#e74c3c',
    marginRight: 0,
  },

  routineBtn: {
    backgroundColor: '#8e44ad',
  },

  viewBtn: {
    backgroundColor: '#2980b9',
    marginRight: 0,
  },
});