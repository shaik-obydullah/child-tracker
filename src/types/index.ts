export interface Child {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  createdAt: Date;
}

export interface Location {
  id: string;
  childId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  battery?: number;
}