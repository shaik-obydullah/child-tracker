import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { startTracking, getDeviceIdentity } from '../services/trackingService';

interface DeviceMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timestamp?: Date;
}

export default function MapScreen() {
  const [devices, setDevices] = useState<DeviceMarker[]>([]);
  const [myName, setMyName] = useState('this phone');
  const [tracking, setTracking] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: () => void = () => {};

    (async () => {
      try {
        const info = await getDeviceIdentity();
        if (mounted) setMyName(info.name);
        console.log('[map] this device:', info.deviceId, info.name);
      } catch (e) {
        console.log('[map] device info failed:', e);
      }

      const started = await startTracking(
        name => {
          if (mounted) {
            setMyName(name);
            setTracking(true);
          }
        },
        msg => {
          if (mounted) Alert.alert('Tracking', msg);
        }
      );

      if (!started) {
        if (mounted) {
          setLoading(false);
          Alert.alert('Permission Denied', 'Location permission is required to track this phone.');
        }
        return;
      }

      unsubscribe = onSnapshot(
        collection(db, 'devices'),
        snapshot => {
          if (!mounted) return;
          const list: DeviceMarker[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
              list.push({
                id: docSnap.id,
                name: data.name || 'Unknown phone',
                latitude: data.latitude,
                longitude: data.longitude,
                timestamp: data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : undefined,
              });
            }
          });
          console.log('[map] devices seen:', list.length, list.map(d => d.name).join(', '));
          setDevices(list);
          setLoading(false);
        },
        error => {
          console.log('[map] FIRESTORE READ FAILED:', error.message);
          if (mounted) {
            setLoading(false);
            Alert.alert('Database error', 'Could not read tracked phones. Create the Firestore database and set it to test mode.');
          }
        }
      );
    })();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const firstDevice = devices[0];

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Starting location tracking...</Text>
        </View>
      ) : (
        <Map
          style={styles.map}
          androidView="texture"
          mapStyle="https://tiles.openfreemap.org/styles/positron"
          onDidFinishLoadingMap={() => setMapReady(true)}
        >
          {firstDevice && (
            <Camera center={[firstDevice.longitude, firstDevice.latitude]} zoom={14} />
          )}
          {devices.map(device => (
            <Marker key={device.id} id={device.id} lngLat={[device.longitude, device.latitude]}>
              <View style={styles.markerContainer}>
                <View style={styles.marker}>
                  <View style={styles.markerInner} />
                </View>
                <View style={styles.markerLabel}>
                  <Text style={styles.markerLabelText} numberOfLines={1}>
                    {device.name}
                  </Text>
                </View>
              </View>
            </Marker>
          ))}
        </Map>
      )}

      <View style={styles.statusBanner}>
        <View style={[styles.dot, tracking ? styles.dotOn : styles.dotOff]} />
        <Text style={styles.statusText} numberOfLines={1}>
          {tracking ? `Tracking ${myName}` : 'Tracking stopped'}
        </Text>
        <Text style={styles.statusCount}>{devices.length} on map</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerTracked: {},
  markerLabel: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 2,
    maxWidth: 160,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  markerLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  statusBanner: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: '#999',
  },
  dotOn: {
    backgroundColor: '#34C759',
  },
  dotOff: {
    backgroundColor: '#ff3b30',
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusCount: {
    fontSize: 13,
    color: '#999',
  },
});