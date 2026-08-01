import { SavedDevice, GeofenceZone, Coordinates } from '../types';

export interface CountryOption {
  name: string;
  code: string; // e.g. +1
  iso: string; // US
  flag: string;
  sampleCarrier: string;
  defaultCoords: Coordinates;
}

export const COUNTRIES: CountryOption[] = [
  { name: 'United States', code: '+1', iso: 'US', flag: '🇺🇸', sampleCarrier: 'Verizon Wireless', defaultCoords: { lat: 37.7749, lng: -122.4194 } },
  { name: 'United Kingdom', code: '+44', iso: 'GB', flag: '🇬🇧', sampleCarrier: 'Vodafone UK', defaultCoords: { lat: 51.5074, lng: -0.1278 } },
  { name: 'Canada', code: '+1', iso: 'CA', flag: '🇨🇦', sampleCarrier: 'Rogers Wireless', defaultCoords: { lat: 43.6532, lng: -79.3832 } },
  { name: 'France', code: '+33', iso: 'FR', flag: '🇫🇷', sampleCarrier: 'Orange France', defaultCoords: { lat: 48.8566, lng: 2.3522 } },
  { name: 'Germany', code: '+49', iso: 'DE', flag: '🇩🇪', sampleCarrier: 'Telekom Deutschland', defaultCoords: { lat: 52.5200, lng: 13.4050 } },
  { name: 'India', code: '+91', iso: 'IN', flag: '🇮🇳', sampleCarrier: 'Reliance Jio 5G', defaultCoords: { lat: 19.0760, lng: 72.8777 } },
  { name: 'Japan', code: '+81', iso: 'JP', flag: '🇯🇵', sampleCarrier: 'NTT Docomo', defaultCoords: { lat: 35.6762, lng: 139.6503 } },
  { name: 'Australia', code: '+61', iso: 'AU', flag: '🇦🇺', sampleCarrier: 'Telstra Mobile', defaultCoords: { lat: -33.8688, lng: 151.2093 } },
  { name: 'Brazil', code: '+55', iso: 'BR', flag: '🇧🇷', sampleCarrier: 'Claro Brasil', defaultCoords: { lat: -23.5505, lng: -46.6333 } },
  { name: 'Spain', code: '+34', iso: 'ES', flag: '🇪🇸', sampleCarrier: 'Movistar España', defaultCoords: { lat: 40.4168, lng: -3.7038 } },
  { name: 'Italy', code: '+39', iso: 'IT', flag: '🇮🇹', sampleCarrier: 'TIM Telecom Italia', defaultCoords: { lat: 41.9028, lng: 12.4964 } },
  { name: 'Mexico', code: '+52', iso: 'MX', flag: '🇲🇽', sampleCarrier: 'Telcel Mexico', defaultCoords: { lat: 19.4326, lng: -99.1332 } },
];

export const INITIAL_GEOFENCES: GeofenceZone[] = [
  {
    id: 'geo-1',
    name: 'Home Safe Zone',
    type: 'home',
    center: { lat: 37.7749, lng: -122.4194 },
    radiusMeters: 250,
    active: true,
    notifyOnEnter: true,
    notifyOnExit: true,
    color: '#10B981', // Green
  },
  {
    id: 'geo-2',
    name: 'Downtown Office Campus',
    type: 'work',
    center: { lat: 37.7885, lng: -122.4012 },
    radiusMeters: 400,
    active: true,
    notifyOnEnter: true,
    notifyOnExit: false,
    color: '#3B82F6', // Blue
  },
  {
    id: 'geo-3',
    name: 'Central Academy School',
    type: 'school',
    center: { lat: 37.7612, lng: -122.4350 },
    radiusMeters: 300,
    active: true,
    notifyOnEnter: true,
    notifyOnExit: true,
    color: '#8B5CF6', // Purple
  },
];

export const INITIAL_DEVICES: SavedDevice[] = [
  {
    id: 'dev-1',
    name: "Alex's iPhone 15 Pro",
    phoneNumber: '+1 (415) 892-3104',
    avatarColor: 'from-blue-500 to-indigo-600',
    avatarIcon: 'smartphone',
    status: 'moving',
    carrier: 'Verizon Wireless 5G Ultra',
    country: 'United States',
    flag: '🇺🇸',
    battery: 88,
    signal: -68,
    simStatus: 'Verified (eSIM)',
    isSimulatedMovement: true,
    movementType: 'drive',
    currentLoc: {
      lat: 37.7790,
      lng: -122.4120,
      timestamp: new Date().toISOString(),
      address: 'Market St & 8th St, San Francisco, CA',
      speed: 38,
      battery: 88,
      heading: 45,
      altitude: 18,
    },
    history: [
      { lat: 37.7749, lng: -122.4194, timestamp: new Date(Date.now() - 3600000).toISOString(), address: 'Civic Center Plaza', speed: 0, battery: 96, heading: 0, altitude: 15 },
      { lat: 37.7765, lng: -122.4160, timestamp: new Date(Date.now() - 2400000).toISOString(), address: 'Mission St & 9th', speed: 22, battery: 93, heading: 30, altitude: 16 },
      { lat: 37.7790, lng: -122.4120, timestamp: new Date(Date.now() - 60000).toISOString(), address: 'Market St & 8th St', speed: 38, battery: 88, heading: 45, altitude: 18 },
    ],
  },
  {
    id: 'dev-2',
    name: "Sarah's Pixel 8",
    phoneNumber: '+1 (415) 554-1920',
    avatarColor: 'from-emerald-500 to-teal-600',
    avatarIcon: 'smartphone',
    status: 'online',
    carrier: 'T-Mobile 5G',
    country: 'United States',
    flag: '🇺🇸',
    battery: 92,
    signal: -74,
    simStatus: 'Verified (Physical SIM)',
    isSimulatedMovement: false,
    movementType: 'static',
    currentLoc: {
      lat: 37.7885,
      lng: -122.4012,
      timestamp: new Date().toISOString(),
      address: 'Montgomery St Financial District, San Francisco',
      speed: 0,
      battery: 92,
      heading: 180,
      altitude: 42,
    },
    history: [
      { lat: 37.7885, lng: -122.4012, timestamp: new Date(Date.now() - 7200000).toISOString(), address: 'Montgomery St Financial District', speed: 0, battery: 98, heading: 180, altitude: 42 },
    ],
  },
  {
    id: 'dev-3',
    name: "Liam's Galaxy S24",
    phoneNumber: '+44 7700 900142',
    avatarColor: 'from-amber-500 to-orange-600',
    avatarIcon: 'smartphone',
    status: 'moving',
    carrier: 'Vodafone UK 5G',
    country: 'United Kingdom',
    flag: '🇬🇧',
    battery: 64,
    signal: -82,
    simStatus: 'Verified (eSIM)',
    isSimulatedMovement: true,
    movementType: 'walk',
    currentLoc: {
      lat: 51.5074,
      lng: -0.1278,
      timestamp: new Date().toISOString(),
      address: 'Trafalgar Square, London WC2N 5DN',
      speed: 5,
      battery: 64,
      heading: 120,
      altitude: 12,
    },
    history: [
      { lat: 51.5050, lng: -0.1300, timestamp: new Date(Date.now() - 1800000).toISOString(), address: 'Piccadilly Circus', speed: 4, battery: 70, heading: 110, altitude: 10 },
      { lat: 51.5074, lng: -0.1278, timestamp: new Date(Date.now() - 30000).toISOString(), address: 'Trafalgar Square', speed: 5, battery: 64, heading: 120, altitude: 12 },
    ],
  },
  {
    id: 'dev-4',
    name: "Express Courier #402",
    phoneNumber: '+33 6 12 34 56 78',
    avatarColor: 'from-purple-500 to-pink-600',
    avatarIcon: 'truck',
    status: 'moving',
    carrier: 'Orange France',
    country: 'France',
    flag: '🇫🇷',
    battery: 45,
    signal: -65,
    simStatus: 'Fleet Verified',
    isSimulatedMovement: true,
    movementType: 'drive',
    currentLoc: {
      lat: 48.8566,
      lng: 2.3522,
      timestamp: new Date().toISOString(),
      address: 'Place de l\'Hôtel de Ville, Paris',
      speed: 42,
      battery: 45,
      heading: 270,
      altitude: 35,
    },
    history: [
      { lat: 48.8500, lng: 2.3400, timestamp: new Date(Date.now() - 1200000).toISOString(), address: 'Boulevard Saint-Germain', speed: 35, battery: 52, heading: 260, altitude: 32 },
      { lat: 48.8566, lng: 2.3522, timestamp: new Date(Date.now() - 40000).toISOString(), address: 'Place de l\'Hôtel de Ville', speed: 42, battery: 45, heading: 270, altitude: 35 },
    ],
  },
];
