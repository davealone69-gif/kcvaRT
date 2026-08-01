import React, { useState, useEffect } from 'react';
import {
  SavedDevice,
  GeofenceZone,
  GeofenceAlert,
  PhoneLookupResult,
  Coordinates,
} from './types';
import { INITIAL_DEVICES, INITIAL_GEOFENCES } from './data/phoneData';
import { InteractiveMap } from './components/InteractiveMap';
import { PhoneLookupPanel } from './components/PhoneLookupPanel';
import { DeviceListSidebar } from './components/DeviceListSidebar';
import { GeofenceManager } from './components/GeofenceManager';
import { ConsentPingModal } from './components/ConsentPingModal';
import { GeminiLocationAI } from './components/GeminiLocationAI';
import { LocationHistoryModal } from './components/LocationHistoryModal';
import { BluetoothPingPanel } from './components/BluetoothPingPanel';
import { WifiPingPanel } from './components/WifiPingPanel';
import { RemoteZeroInstallPanel } from './components/RemoteZeroInstallPanel';

import {
  Navigation,
  Shield,
  Smartphone,
  Sparkles,
  Clock,
  Layers,
  Bell,
  MapPin,
  Radio,
  Eye,
  Plus,
  RefreshCw,
  Bluetooth,
  Wifi,
  Zap,
} from 'lucide-react';


// Haversine formula to compute distance between two lat/lng points in meters
function getDistanceMeters(c1: Coordinates, c2: Coordinates): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function App() {
  const [devices, setDevices] = useState<SavedDevice[]>(INITIAL_DEVICES);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>('dev-1');
  const [geofences, setGeofences] = useState<GeofenceZone[]>(INITIAL_GEOFENCES);
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const [searchTarget, setSearchTarget] = useState<{
    coordinates: Coordinates;
    label: string;
    phone: string;
  } | null>(null);

  // Modals & UI View Toggles
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [consentTargetPhone, setConsentTargetPhone] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState<boolean>(true);
  const [showGeofences, setShowGeofences] = useState<boolean>(true);
  const [mapTileStyle, setMapTileStyle] = useState<'dark' | 'light' | 'satellite' | 'streets'>('dark');
  const [activeTab, setActiveTab] = useState<'map' | 'geofences' | 'ai' | 'bluetooth' | 'wifi' | 'remote_stealth'>('map');
  const [isLoading, setIsLoading] = useState<boolean>(false);


  // Selected device object
  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0] || null;

  // Real-time GPS Telemetry & Movement Simulation Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prevDevices) =>
        prevDevices.map((device) => {
          if (!device.isSimulatedMovement) return device;

          // Compute small movement delta based on speed & heading
          const speedKmH = device.currentLoc.speed || 30;
          const speedMetersPerSec = (speedKmH * 1000) / 3600;
          const deltaSec = 2.5; // Interval time
          const distanceMovedMeters = speedMetersPerSec * deltaSec;

          // Convert meters to lat/lng delta
          const latDelta = (distanceMovedMeters / 111000) * Math.cos((device.currentLoc.heading * Math.PI) / 180);
          const lngDelta =
            (distanceMovedMeters / (111000 * Math.cos((device.currentLoc.lat * Math.PI) / 180))) *
            Math.sin((device.currentLoc.heading * Math.PI) / 180);

          // Add slight noise to heading for natural curvature
          const newHeading = (device.currentLoc.heading + (Math.random() - 0.5) * 15 + 360) % 360;
          const newLat = device.currentLoc.lat + latDelta;
          const newLng = device.currentLoc.lng + lngDelta;

          const newPoint = {
            lat: newLat,
            lng: newLng,
            timestamp: new Date().toISOString(),
            address: device.currentLoc.address,
            speed: Math.max(5, Math.min(80, Math.floor(speedKmH + (Math.random() - 0.5) * 4))),
            battery: Math.max(10, device.battery),
            heading: Math.floor(newHeading),
            altitude: device.currentLoc.altitude,
          };

          // Check Geofences
          geofences.forEach((zone) => {
            if (!zone.active) return;
            const prevDist = getDistanceMeters(device.currentLoc, zone.center);
            const currDist = getDistanceMeters({ lat: newLat, lng: newLng }, zone.center);

            if (prevDist > zone.radiusMeters && currDist <= zone.radiusMeters && zone.notifyOnEnter) {
              // Entered zone
              const alert: GeofenceAlert = {
                id: `alt-${Date.now()}-${Math.random()}`,
                deviceName: device.name,
                phoneNumber: device.phoneNumber,
                zoneName: zone.name,
                eventType: 'entered',
                timestamp: new Date().toISOString(),
                coordinates: { lat: newLat, lng: newLng },
              };
              setAlerts((a) => [...a, alert]);
            } else if (prevDist <= zone.radiusMeters && currDist > zone.radiusMeters && zone.notifyOnExit) {
              // Exited zone
              const alert: GeofenceAlert = {
                id: `alt-${Date.now()}-${Math.random()}`,
                deviceName: device.name,
                phoneNumber: device.phoneNumber,
                zoneName: zone.name,
                eventType: 'exited',
                timestamp: new Date().toISOString(),
                coordinates: { lat: newLat, lng: newLng },
              };
              setAlerts((a) => [...a, alert]);
            }
          });

          // Keep history to last 15 points
          const updatedHistory = [...device.history, newPoint].slice(-15);

          return {
            ...device,
            currentLoc: newPoint,
            history: updatedHistory,
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [geofences]);

  // Handle Phone Number Search Result from Lookup Panel
  const handleSearchResult = (result: PhoneLookupResult) => {
    setSearchTarget({
      coordinates: result.coordinates,
      label: `${result.city}, ${result.carrier}`,
      phone: result.phoneNumber,
    });

    // Check if device already exists in list, or add it
    const existing = devices.find((d) => d.phoneNumber === result.phoneNumber);
    if (!existing) {
      const newDev: SavedDevice = {
        id: `dev-${Date.now()}`,
        name: `Phone ${result.phoneNumber}`,
        phoneNumber: result.phoneNumber,
        carrier: result.carrier,
        country: result.country,
        flag: result.flag,
        battery: result.batteryLevel,
        signal: result.signalStrength,
        avatarColor: 'from-purple-600 to-indigo-600',
        avatarIcon: 'smartphone',
        status: 'online',
        simStatus: result.simSwapStatus,
        isSimulatedMovement: true,
        movementType: 'drive',
        currentLoc: {
          lat: result.coordinates.lat,
          lng: result.coordinates.lng,
          timestamp: new Date().toISOString(),
          address: `${result.city}, ${result.region}`,
          speed: result.speed,
          battery: result.batteryLevel,
          heading: result.heading,
          altitude: result.altitude,
        },
        history: [],
      };

      setDevices((prev) => [newDev, ...prev]);
      setSelectedDeviceId(newDev.id);
    } else {
      setSelectedDeviceId(existing.id);
    }
  };

  // Browser Geolocation: "Use My Device GPS"
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        const { latitude, longitude } = position.coords;

        const myPhone = '+1 (Device GPS)';
        const myDev: SavedDevice = {
          id: 'dev-my-gps',
          name: 'My Current Device',
          phoneNumber: myPhone,
          carrier: 'Live Browser GPS',
          country: 'Local',
          flag: '📍',
          battery: 95,
          signal: -65,
          avatarColor: 'from-emerald-500 to-teal-600',
          avatarIcon: 'smartphone',
          status: 'online',
          simStatus: 'Verified (Browser GPS)',
          isSimulatedMovement: false,
          currentLoc: {
            lat: latitude,
            lng: longitude,
            timestamp: new Date().toISOString(),
            address: 'Your Real-Time Browser GPS Position',
            speed: 0,
            battery: 95,
            heading: 0,
            altitude: 10,
          },
          history: [],
        };

        // Add or update
        setDevices((prev) => {
          const filtered = prev.filter((d) => d.id !== 'dev-my-gps');
          return [myDev, ...filtered];
        });

        setSelectedDeviceId('dev-my-gps');
        setSearchTarget({
          coordinates: { lat: latitude, lng: longitude },
          label: 'Your Current GPS Position',
          phone: myPhone,
        });
      },
      (error) => {
        setIsLoading(false);
        alert(`Geolocation error: ${error.message}`);
      }
    );
  };

  // Open Consent Ping Modal
  const handleSendConsentPing = (phone: string) => {
    setConsentTargetPhone(phone);
    setShowConsentModal(true);
  };

  // Simulate Approval for Consent Ping
  const handleSimulateApprove = (phone: string) => {
    // Enable movement for target device
    setDevices((prev) =>
      prev.map((d) => (d.phoneNumber === phone ? { ...d, isSimulatedMovement: true, status: 'moving' } : d))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header Navigation */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-[1100]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                GeoPulse <span className="text-blue-500">Tracker</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Live GPS
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Phone Number Triangulation, Carrier Analysis & Real-Time Map Telemetry
              </p>
            </div>
          </div>

          {/* Quick Action Toggles */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setShowBreadcrumbs(!showBreadcrumbs)}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                showBreadcrumbs
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle historical breadcrumb polylines on map"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Trails</span>
            </button>

            <button
              onClick={() => setShowGeofences(!showGeofences)}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                showGeofences
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle geofence radius circles on map"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Zones</span>
            </button>

            {selectedDevice && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                title="View detailed location history log"
              >
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">History Log</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto w-full p-4 flex-1 flex flex-col gap-5">
        {/* Phone Lookup & Carrier Intelligence Top Section */}
        <PhoneLookupPanel
          onSearchResult={handleSearchResult}
          onSendConsentPing={handleSendConsentPing}
          onUseMyLocation={handleUseMyLocation}
          isLoading={isLoading}
        />

        {/* View Navigation Tabs (Mobile/Desktop) */}
        <div className="flex flex-wrap items-center justify-between bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80 gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="w-4 h-4" /> Live Map
            </button>

            <button
              onClick={() => setActiveTab('bluetooth')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'bluetooth'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Bluetooth className="w-4 h-4 text-blue-400" /> Bing from Bluetooth
            </button>

            <button
              onClick={() => setActiveTab('wifi')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'wifi'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Wifi className="w-4 h-4 text-purple-400" /> Bing from Wi-Fi
            </button>

            <button
              onClick={() => setActiveTab('remote_stealth')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'remote_stealth'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-400" /> Remote Zero-Install
            </button>

            <button
              onClick={() => setActiveTab('geofences')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'geofences'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Shield className="w-4 h-4" /> Zones ({geofences.length})
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'ai'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" /> Gemini AI
            </button>
          </div>

          {alerts.length > 0 && (
            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
              <Bell className="w-3.5 h-3.5" />
              {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
            </div>
          )}
        </div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left Column: Sidebar with Tracked Device List */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <DeviceListSidebar
              devices={devices}
              selectedDeviceId={selectedDeviceId}
              onSelectDevice={(id) => setSelectedDeviceId(id)}
              onToggleMovement={(id) => {
                setDevices((prev) =>
                  prev.map((d) => (d.id === id ? { ...d, isSimulatedMovement: !d.isSimulatedMovement } : d))
                );
              }}
              onAddDevice={(newDev) => {
                const fullDev = {
                  id: `dev-${Date.now()}`,
                  name: newDev.name || 'New Phone',
                  phoneNumber: newDev.phoneNumber || '+1 000 000 0000',
                  avatarColor: newDev.avatarColor || 'from-blue-600 to-indigo-600',
                  avatarIcon: 'smartphone',
                  status: 'online',
                  carrier: newDev.carrier || 'Verizon 5G',
                  country: newDev.country || 'United States',
                  flag: newDev.flag || '🇺🇸',
                  battery: newDev.battery || 85,
                  signal: newDev.signal || -70,
                  simStatus: 'Verified',
                  isSimulatedMovement: true,
                  movementType: 'drive',
                  currentLoc: newDev.currentLoc || {
                    lat: 37.7749,
                    lng: -122.4194,
                    timestamp: new Date().toISOString(),
                    address: 'San Francisco, CA',
                    speed: 30,
                    battery: 85,
                    heading: 90,
                    altitude: 15,
                  },
                  history: [],
                } as SavedDevice;

                setDevices((prev) => [fullDev, ...prev]);
                setSelectedDeviceId(fullDev.id);
              }}
              onRemoveDevice={(id) => {
                setDevices((prev) => prev.filter((d) => d.id !== id));
                if (selectedDeviceId === id) {
                  setSelectedDeviceId(devices.find((d) => d.id !== id)?.id || null);
                }
              }}
            />
          </div>

          {/* Right Column: Main View (Map / Geofences / AI Context) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {activeTab === 'map' && (
              <div className="h-[560px] w-full">
                <InteractiveMap
                  devices={devices}
                  selectedDeviceId={selectedDeviceId}
                  onSelectDevice={(id) => setSelectedDeviceId(id)}
                  geofences={geofences}
                  searchTarget={searchTarget}
                  showBreadcrumbs={showBreadcrumbs}
                  showGeofences={showGeofences}
                  mapTileStyle={mapTileStyle}
                  onChangeTileStyle={(style) => setMapTileStyle(style)}
                  onMapClick={(coords) => {
                    // Quick add search target at map click point
                    setSearchTarget({
                      coordinates: coords,
                      label: 'Custom Map Pin',
                      phone: 'Map Selection',
                    });
                  }}
                />
              </div>
            )}

            {activeTab === 'bluetooth' && (
              <BluetoothPingPanel
                device={selectedDevice}
                onUpdateDeviceLoc={(lat, lng) => {
                  if (selectedDevice) {
                    setDevices((prev) =>
                      prev.map((d) =>
                        d.id === selectedDevice.id
                          ? { ...d, currentLoc: { ...d.currentLoc, lat, lng } }
                          : d
                      )
                    );
                  }
                }}
              />
            )}

            {activeTab === 'wifi' && <WifiPingPanel device={selectedDevice} />}

            {activeTab === 'remote_stealth' && (
              <RemoteZeroInstallPanel
                device={selectedDevice}
                onLocationLocked={(lat, lng) => {
                  setSearchTarget({
                    coordinates: { lat, lng },
                    label: 'Remote Zero-Install Stealth Lock',
                    phone: selectedDevice?.phoneNumber || '+1 (415) 892-3104',
                  });
                }}
              />
            )}

            {activeTab === 'geofences' && (
              <GeofenceManager
                geofences={geofences}
                alerts={alerts}
                onAddGeofence={(zone) => setGeofences((prev) => [...prev, zone])}
                onRemoveGeofence={(id) => setGeofences((prev) => prev.filter((g) => g.id !== id))}
                onToggleGeofence={(id) =>
                  setGeofences((prev) => prev.map((g) => (g.id === id ? { ...g, active: !g.active } : g)))
                }
                selectedCoords={selectedDevice?.currentLoc}
              />
            )}


            {activeTab === 'ai' && <GeminiLocationAI device={selectedDevice} />}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showConsentModal && (
        <ConsentPingModal
          targetPhone={consentTargetPhone}
          onClose={() => setShowConsentModal(false)}
          onSimulateApprove={handleSimulateApprove}
        />
      )}

      {showHistoryModal && selectedDevice && (
        <LocationHistoryModal device={selectedDevice} onClose={() => setShowHistoryModal(false)} />
      )}
    </div>
  );
}
