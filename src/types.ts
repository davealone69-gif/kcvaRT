export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
  address?: string;
  speed: number; // in km/h
  battery: number; // percentage
  heading: number; // degrees
  altitude?: number; // meters
}

export interface PhoneLookupResult {
  phoneNumber: string;
  formatted: string;
  country: string;
  countryCode: string;
  flag: string;
  carrier: string;
  lineType: string;
  region: string;
  city: string;
  coordinates: Coordinates;
  spamScore: string;
  simSwapStatus: string;
  signalStrength: number; // -dBm
  accuracyRadius: number; // meters
  batteryLevel: number; // %
  speed: number; // km/h
  heading: number; // deg
  altitude: number; // meters
  lastSeenTimestamp: string;
  isLive: boolean;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'home' | 'work' | 'school' | 'safe' | 'restricted';
  center: Coordinates;
  radiusMeters: number;
  active: boolean;
  notifyOnEnter: boolean;
  notifyOnExit: boolean;
  color?: string;
}

export interface SavedDevice {
  id: string;
  name: string;
  phoneNumber: string;
  avatarColor: string;
  avatarIcon: string;
  status: 'online' | 'moving' | 'idle' | 'offline';
  currentLoc: LocationPoint;
  history: LocationPoint[];
  carrier: string;
  country: string;
  flag: string;
  battery: number;
  signal: number;
  simStatus: string;
  isSimulatedMovement: boolean;
  movementType?: 'drive' | 'walk' | 'static' | 'flight';
}

export interface ConsentPing {
  id: string;
  phoneNumber: string;
  code: string;
  status: 'pending' | 'approved' | 'declined' | 'expired';
  requestedAt: string;
  expiresAt: string;
  sharedLocation?: Coordinates;
}

export interface GeofenceAlert {
  id: string;
  deviceName: string;
  phoneNumber: string;
  zoneName: string;
  eventType: 'entered' | 'exited';
  timestamp: string;
  coordinates: Coordinates;
}

export interface BluetoothBeacon {

  id: string;
  name: string;
  macAddress: string;
  rssi: number; // dBm
  distanceMeters: number;
  batteryLevel?: number;
  uuid?: string;
  isPinging: boolean;
  lastPingTime?: string;
}

export interface WifiAccessPoint {
  id: string;
  ssid: string;
  bssid: string;
  rssi: number; // dBm
  channel: number;
  frequency: string; // e.g., '5 GHz'
  distanceMeters: number;
  security: string;
  isTargetConnected: boolean;
  isPinging: boolean;
}

export interface RemoteStealthPing {
  id: string;
  phoneNumber: string;
  method: 'silent_sms' | 'ss7_hlr' | 'cell_id' | 'wifi_triangulation' | 'bt_le_beacon';
  status: 'initiating' | 'pinging_tower' | 'response_received' | 'location_locked';
  towerId: string;
  carrierNode: string;
  estimatedLocation: LocationPoint;
  timestamp: string;
  zeroInstallSuccess: boolean;
}
