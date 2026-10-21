import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveChild = async () => {
    if (!name.trim() || !age.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'children'), {
        name: name.trim(),
        age: parseInt(age),
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Child profile created!');
      setName('');
      setAge('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Child Profile</Text>
        <Text style={styles.subtitle}>Track your child's location</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Child's Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter child's name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Enter age"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSaveChild}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>
          1. Add your child's profile{'\n'}
          2. Install the app on your child's device{'\n'}
          3. Start location tracking{'\n'}
          4. View their location in real-time
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  form: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});