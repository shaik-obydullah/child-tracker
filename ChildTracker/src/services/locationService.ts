import * as Location from 'expo-location';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Location as LocationType } from '../types';

export const requestLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentLocation = async () => {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission not granted');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return location;
};

export const saveLocation = async (childId: string, latitude: number, longitude: number, battery?: number) => {
  const docRef = await addDoc(collection(db, 'locations'), {
    childId,
    latitude,
    longitude,
    battery,
    timestamp: new Date(),
  });
  return docRef.id;
};

export const getChildLocations = async (childId: string, limitCount: number = 50): Promise<LocationType[]> => {
  const q = query(
    collection(db, 'locations'),
    where('childId', '==', childId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate(),
  })) as LocationType[];
};

export const getLatestLocation = async (childId: string): Promise<LocationType | null> => {
  const locations = await getChildLocations(childId, 1);
  return locations.length > 0 ? locations[0] : null;
};