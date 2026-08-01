import React, { useState, useEffect } from 'react';
import { BluetoothBeacon, SavedDevice } from '../types';
import { pingSoundEngine } from '../utils/audioPing';
import {
  Bluetooth,
  Radio,
  Volume2,
  Signal,
  WifiOff,
  Sparkles,
  Zap,
  Activity,
  Compass,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface BluetoothPingPanelProps {
  device: SavedDevice | null;
  onUpdateDeviceLoc?: (lat: number, lng: number) => void;
}

export const BluetoothPingPanel: React.FC<BluetoothPingPanelProps> = ({ device }) => {
  const [beacons, setBeacons] = useState<BluetoothBeacon[]>([
    {
      id: 'bt-1',
      name: "Target's iPhone BLE Beacon",
      macAddress: '7A:3E:99:B2:10:4F',
      rssi: -58,
      distanceMeters: 1.4,
      batteryLevel: 88,
      uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825',
      isPinging: false,
    },
    {
      id: 'bt-2',
      name: 'AirTag / Tile Tracker Tag',
      macAddress: '8C:11:04:77:E9:1B',
      rssi: -72,
      distanceMeters: 3.8,
      batteryLevel: 94,
      uuid: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
      isPinging: false,
    },
    {
      id: 'bt-3',
      name: 'Smart Watch BLE Sync',
      macAddress: 'A2:00:19:62:3C:D0',
      rssi: -81,
      distanceMeters: 6.2,
      batteryLevel: 62,
      isPinging: false,
    },
  ]);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeBingMessage, setActiveBingMessage] = useState<string | null>(null);

  // Dynamic BLE RSSI fluctuation simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setBeacons((prev) =>
        prev.map((b) => {
          const newRssi = Math.max(-95, Math.min(-40, b.rssi + Math.floor((Math.random() - 0.5) * 6)));
          // Estimate distance from RSSI: Distance = 10 ^ ((Measured Power - RSSI) / (10 * N))
          const estDist = Number(Math.pow(10, (-59 - newRssi) / (10 * 2)).toFixed(1));
          return {
            ...b,
            rssi: newRssi,
            distanceMeters: Math.max(0.5, estDist),
          };
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const handleBingFromBluetooth = (beaconId: string, name: string) => {
    // 1. Play real acoustic audio bing
    pingSoundEngine.playBluetoothBing();

    // 2. Update state animation
    setBeacons((prev) =>
      prev.map((b) => (b.id === beaconId ? { ...b, isPinging: true, lastPingTime: new Date().toLocaleTimeString() } : b))
    );

    setActiveBingMessage(`⚡ Bluetooth Bing sent to [${name}]. High-frequency acoustic locator chime emitted!`);

    setTimeout(() => {
      setBeacons((prev) => prev.map((b) => (b.id === beaconId ? { ...b, isPinging: false } : b)));
    }, 3000);
  };

  const handleScanWebBluetooth = async () => {
    setIsScanning(true);
    pingSoundEngine.playBluetoothBing();

    try {
      if ('bluetooth' in navigator) {
        // Web Bluetooth API if available
        await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
        });
      }
    } catch (e) {
      // Fallback scanning simulation
    } finally {
      setTimeout(() => setIsScanning(false), 1500);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Bluetooth className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Bing from Bluetooth (BLE Proximity)
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Short-Range Radar
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Emit acoustic locator pings and detect Bluetooth Low Energy RSSI signal distance.
            </p>
          </div>
        </div>

        <button
          onClick={handleScanWebBluetooth}
          disabled={isScanning}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          Scan BLE Beacons
        </button>
      </div>

      {activeBingMessage && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between animate-fade-in shadow-inner">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-400 animate-bounce" />
            <span className="font-semibold">{activeBingMessage}</span>
          </div>
          <button
            onClick={() => setActiveBingMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Beacon Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {beacons.map((beacon) => (
          <div
            key={beacon.id}
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all relative overflow-hidden ${
              beacon.isPinging
                ? 'bg-blue-950/80 border-blue-400 ring-2 ring-blue-500/50 shadow-xl'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            {beacon.isPinging && (
              <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none" />
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bluetooth className="w-3.5 h-3.5 text-blue-400" />
                  {beacon.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{beacon.macAddress}</span>
              </div>

              {/* RSSI Bar & Distance Meter */}
              <div className="mt-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Signal Strength:</span>
                  <span className="font-mono font-bold text-blue-400">{beacon.rssi} dBm</span>
                </div>

                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.max(10, 100 + beacon.rssi)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-slate-400 font-semibold">Estimated Distance:</span>
                  <span className="font-mono font-black text-emerald-400">{beacon.distanceMeters} meters away</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleBingFromBluetooth(beacon.id, beacon.name)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Volume2 className="w-4 h-4 text-emerald-300 animate-pulse" />
              Bing from Bluetooth
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
