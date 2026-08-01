import React, { useState, useEffect } from 'react';
import { WifiAccessPoint, SavedDevice } from '../types';
import { pingSoundEngine } from '../utils/audioPing';
import {
  Wifi,
  Radio,
  Volume2,
  Signal,
  MapPin,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface WifiPingPanelProps {
  device: SavedDevice | null;
}

export const WifiPingPanel: React.FC<WifiPingPanelProps> = ({ device }) => {
  const [accessPoints, setAccessPoints] = useState<WifiAccessPoint[]>([
    {
      id: 'wifi-1',
      ssid: 'Home_Mesh_5G_Extender',
      bssid: '44:D9:E7:88:A1:02',
      rssi: -45,
      channel: 36,
      frequency: '5 GHz',
      distanceMeters: 2.1,
      security: 'WPA3-PSK',
      isTargetConnected: true,
      isPinging: false,
    },
    {
      id: 'wifi-2',
      ssid: 'Starbucks_Guest_Wi-Fi',
      bssid: '00:11:22:33:44:55',
      rssi: -68,
      channel: 6,
      frequency: '2.4 GHz',
      distanceMeters: 8.4,
      security: 'WPA2-Enterprise',
      isTargetConnected: false,
      isPinging: false,
    },
    {
      id: 'wifi-3',
      ssid: 'Office_Corporate_AP4',
      bssid: '88:77:66:55:44:33',
      rssi: -79,
      channel: 149,
      frequency: '5 GHz',
      distanceMeters: 14.2,
      security: 'WPA2-PSK',
      isTargetConnected: false,
      isPinging: false,
    },
  ]);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeBingMessage, setActiveBingMessage] = useState<string | null>(null);

  // Dynamic Wi-Fi signal fluctuation simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setAccessPoints((prev) =>
        prev.map((ap) => {
          const newRssi = Math.max(-90, Math.min(-35, ap.rssi + Math.floor((Math.random() - 0.5) * 4)));
          const estDist = Number(Math.pow(10, (-42 - newRssi) / (10 * 2.2)).toFixed(1));
          return {
            ...ap,
            rssi: newRssi,
            distanceMeters: Math.max(1, estDist),
          };
        })
      );
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const handleBingFromWifi = (apId: string, ssid: string) => {
    // 1. Play real multi-tone acoustic sonar sound
    pingSoundEngine.playWifiBing();

    // 2. Animate state
    setAccessPoints((prev) =>
      prev.map((ap) => (ap.id === apId ? { ...ap, isPinging: true } : ap))
    );

    setActiveBingMessage(`📡 Wi-Fi Bing sent via AP [${ssid}]. Acoustic sonar chime triggered on network!`);

    setTimeout(() => {
      setAccessPoints((prev) => prev.map((ap) => (ap.id === apId ? { ...ap, isPinging: false } : ap)));
    }, 3000);
  };

  const handleScanWifi = () => {
    setIsScanning(true);
    pingSoundEngine.playWifiBing();
    setTimeout(() => setIsScanning(false), 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Wifi className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Bing from Wi-Fi (BSSID Triangulation)
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Indoor Precision GPS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Trigger acoustic Wi-Fi network rings and triangulate indoor location coordinates.
            </p>
          </div>
        </div>

        <button
          onClick={handleScanWifi}
          disabled={isScanning}
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          Scan BSSID APs
        </button>
      </div>

      {activeBingMessage && (
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between animate-fade-in shadow-inner">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-400 animate-bounce" />
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

      {/* Access Point Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {accessPoints.map((ap) => (
          <div
            key={ap.id}
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all relative overflow-hidden ${
              ap.isPinging
                ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500/50 shadow-xl'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            {ap.isPinging && (
              <div className="absolute inset-0 bg-purple-500/10 animate-pulse pointer-events-none" />
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-purple-400" />
                  {ap.ssid}
                </span>
                {ap.isTargetConnected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Connected
                  </span>
                )}
              </div>

              <div className="text-[10px] font-mono text-slate-400 mb-2">BSSID: {ap.bssid} • Ch {ap.channel} ({ap.frequency})</div>

              {/* RSSI & Indoor Distance */}
              <div className="mt-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Signal Level:</span>
                  <span className="font-mono font-bold text-purple-400">{ap.rssi} dBm</span>
                </div>

                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
                    style={{ width: `${Math.max(10, 100 + ap.rssi)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-slate-400 font-semibold">Indoor Distance:</span>
                  <span className="font-mono font-black text-emerald-400">{ap.distanceMeters} meters</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleBingFromWifi(ap.id, ap.ssid)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Volume2 className="w-4 h-4 text-purple-300 animate-pulse" />
              Bing from Wi-Fi
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
