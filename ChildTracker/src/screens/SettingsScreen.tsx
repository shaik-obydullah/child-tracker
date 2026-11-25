import React, { useState } from 'react';
import { View, StyleSheet, Text, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';

export default function SettingsScreen() {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [backgroundTracking, setBackgroundTracking] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'Are you sure you want to reset all tracking data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => Alert.alert('Done', 'Data has been reset') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tracking</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Enable Tracking</Text>
            <Text style={styles.settingDescription}>Track child's location</Text>
          </View>
          <Switch
            value={trackingEnabled}
            onValueChange={setTrackingEnabled}
            trackColor={{ false: '#ddd', true: '#34C759' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Background Tracking</Text>
            <Text style={styles.settingDescription}>Track when app is closed</Text>
          </View>
          <Switch
            value={backgroundTracking}
            onValueChange={setBackgroundTracking}
            trackColor={{ false: '#ddd', true: '#34C759' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>Get alerts for location updates</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#ddd', true: '#34C759' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <TouchableOpacity style={styles.dangerButton} onPress={handleResetData}>
          <Text style={styles.dangerButtonText}>Reset All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Child Tracker v1.0.0</Text>
        <Text style={styles.footerText}>Made with care for your family's safety</Text>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flex: 1,
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
  dangerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff3b30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
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