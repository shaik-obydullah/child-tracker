import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Location as LocationType } from '../types';

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const result = await Geolocation.requestAuthorization('whenInUse');
    return result === 'granted';
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location for child tracking.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  }

  return false;
};

export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        reject(new Error(error.message));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
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
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp instanceof Date ? data.timestamp : data.timestamp.toDate(),
    };
  }) as LocationType[];
};

export const getLatestLocation = async (childId: string): Promise<LocationType | null> => {
  const locations = await getChildLocations(childId, 1);
  return locations.length > 0 ? locations[0] : null;
};