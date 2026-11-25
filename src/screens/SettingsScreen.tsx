import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { startTracking, stopTracking, isTracking, getDeviceIdentity } from '../services/trackingService';

export default function SettingsScreen() {
  const [deviceName, setDeviceName] = useState('this phone');
  const [tracking, setTracking] = useState(isTracking());

  useEffect(() => {
    getDeviceIdentity().then(info => setDeviceName(info.name)).catch(() => {});
  }, []);

  const handleToggleTracking = async () => {
    if (tracking) {
      stopTracking();
      setTracking(false);
      return;
    }

    const started = await startTracking(
      name => setDeviceName(name),
      msg => Alert.alert('Tracking', msg)
    );
    setTracking(started);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Phone</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Device name</Text>
            <Text style={styles.settingDescription}>Tracked on the map by this name</Text>
          </View>
          <Text style={styles.deviceName}>{deviceName}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tracking</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {tracking ? 'Tracking active' : 'Tracking stopped'}
            </Text>
            <Text style={styles.settingDescription}>
              Sends location to the map every few seconds
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, tracking ? styles.toggleOn : styles.toggleOff]}
            onPress={handleToggleTracking}
          >
            <Text style={styles.toggleText}>{tracking ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Keeping tracking alive</Text>
        <Text style={styles.helpText}>
          1. Keep the Child Tracker app open on this phone.{'\n'}
          2. Disable battery optimisation for Child Tracker:{'\n'}
          Settings {'>'} Apps {'>'} Child Tracker {'>'} Battery {'>'} No restrictions.{'\n'}
          3. Each phone needs internet to send its location.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Child Tracker v1.0.0</Text>
        <Text style={styles.footerText}>OpenStreetMap data, no Google required</Text>
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
  section: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 10,
    borderRadius: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 3,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    maxWidth: 150,
  },
  toggleButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toggleOn: {
    backgroundColor: '#34C759',
  },
  toggleOff: {
    backgroundColor: '#c7c7cc',
  },
  toggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 5,
  },
});