import Geolocation from 'react-native-geolocation-service';
import { getAndroidId, getDeviceName, getModel } from 'react-native-device-info';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { requestLocationPermission } from './locationService';

let watchId: number | null = null;
let identity: { deviceId: string; name: string; model: string } | null = null;

export const getDeviceIdentity = async () => {
  if (identity) return identity;

  let deviceId = 'unknown';
  let name = 'Unknown phone';
  try {
    deviceId = await getAndroidId();
  } catch (e) {}

  try {
    const deviceName = await getDeviceName();
    if (deviceName) name = deviceName;
  } catch (e) {}

  identity = { deviceId, name, model: getModel() };
  return identity;
};

export const isTracking = (): boolean => watchId !== null;

export const startTracking = async (onStart?: (name: string) => void, onError?: (msg: string) => void): Promise<boolean> => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    if (onError) onError('Location permission is required for tracking.');
    return false;
  }

  if (watchId !== null) return true;

  const info = await getDeviceIdentity();

  watchId = Geolocation.watchPosition(
    async position => {
      const { latitude, longitude } = position.coords;
      const battery = position.coords.accuracy;

      try {
        await setDoc(
          doc(db, 'devices', info.deviceId),
          {
            name: info.name,
            model: info.model,
            latitude,
            longitude,
            battery,
            timestamp: new Date(),
          },
          { merge: true }
        );
        console.log('[tracking] location uploaded for', info.name, latitude.toFixed(5), longitude.toFixed(5));
      } catch (e) {
        console.log('[tracking] UPLOAD FAILED:', e instanceof Error ? e.message : e);
        if (onError) onError('Could not upload location. Create the Firestore database in test mode.');
      }
    },
    error => {
      if (onError) onError(`Location error: ${error.message}`);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 15,
      interval: 15000,
      fastestInterval: 10000,
      accuracy: { android: 'high' },
    }
  );

  if (onStart) onStart(info.name);
  return true;
};

export const stopTracking = () => {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
};