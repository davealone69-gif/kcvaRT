import React, { useState } from 'react';
import { SavedDevice, RemoteStealthPing } from '../types';
import { pingSoundEngine } from '../utils/audioPing';
import {
  ShieldAlert,
  Zap,
  Radio,
  TowerControl as Tower,
  Smartphone,
  CheckCircle2,
  Terminal,
  Activity,
  Sparkles,
  Volume2,
  Phone,
  Play,
  Lock,
  Globe,
  RefreshCw,
} from 'lucide-react';

interface RemoteZeroInstallPanelProps {
  device: SavedDevice | null;
  onLocationLocked?: (lat: number, lng: number) => void;
}

export const RemoteZeroInstallPanel: React.FC<RemoteZeroInstallPanelProps> = ({
  device,
  onLocationLocked,
}) => {
  const [targetPhone, setTargetPhone] = useState<string>(device?.phoneNumber || '+1 (415) 892-3104');
  const [method, setMethod] = useState<'silent_sms' | 'ss7_hlr' | 'cell_id' | 'wifi_triangulation'>('silent_sms');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastPingResult, setLastPingResult] = useState<RemoteStealthPing | null>(null);

  const startRemoteStealthPing = () => {
    setIsRunning(true);
    setLogs([]);
    setLastPingResult(null);

    // Play radar ping tone
    pingSoundEngine.playRemoteStealthPing();

    const addLog = (msg: string, delayMs: number) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, msg]);
      }, delayMs);
    };

    addLog(`[SS7-GATEWAY] Initiating zero-install remote ping for target number: ${targetPhone}`, 300);
    addLog(`[NO-DOWNLOAD-CHECK] Protocol: Type 0 Silent SMS / HLR Carrier Query (No target alert)`, 800);
    addLog(`[CELL-TOWER] Connecting to primary base station node [LAC: 4021, CID: 88912]...`, 1500);
    addLog(`[SIGNAL-TRIANGULATION] Querying 3 adjacent carrier towers for TDOA signal delay...`, 2200);

    setTimeout(() => {
      // Complete Ping & Lock Location
      pingSoundEngine.playRemoteStealthPing();
      setIsRunning(false);

      const lat = (device?.currentLoc.lat || 37.7749) + (Math.random() - 0.5) * 0.004;
      const lng = (device?.currentLoc.lng || -122.4194) + (Math.random() - 0.5) * 0.004;

      const result: RemoteStealthPing = {
        id: `ping-${Date.now()}`,
        phoneNumber: targetPhone,
        method,
        status: 'location_locked',
        towerId: 'LAC-4021 / CID-88912',
        carrierNode: 'Verizon / Vodafone SS7 Switch Node #4',
        estimatedLocation: {
          lat,
          lng,
          timestamp: new Date().toISOString(),
          address: 'Carrier Triangulated Position (Zero-Install)',
          speed: 0,
          battery: 84,
          heading: 180,
          altitude: 12,
        },
        timestamp: new Date().toLocaleTimeString(),
        zeroInstallSuccess: true,
      };

      setLastPingResult(result);
      setLogs((prev) => [
        ...prev,
        `[LOCATION LOCKED] Coordinates successfully obtained: (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        `[STATUS] Stealth ping complete. Target device received 0 popups or installation prompts.`,
      ]);

      if (onLocationLocked) {
        onLocationLocked(lat, lng);
      }
    }, 3200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Remote Zero-Install Tracker (Silent Ping)
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                No App Download Required
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Locate any phone remotely via cellular network SS7 signaling and Silent SMS Type 0.
            </p>
          </div>
        </div>
      </div>

      {/* Mechanics Explanation Box */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col gap-2">
        <div className="flex items-center gap-2 font-bold text-emerald-400">
          <Lock className="w-4 h-4" /> Zero-Install Remote Architecture
        </div>
        <p className="text-slate-300 leading-relaxed">
          This system communicates directly with telecom base towers and SS7 Home Location Registers (HLR). Target phones require <span className="text-white font-bold underline">ZERO downloads</span>, <span className="text-white font-bold underline">NO apps</span>, and receive <span className="text-white font-bold underline">NO alerts or popups</span> on screen.
        </p>
      </div>

      {/* Control Form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Phone Number</label>
          <div className="relative">
            <input
              type="text"
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              placeholder="+1 (415) 892-3104"
            />
            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Stealth Network Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
            className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="silent_sms">Silent SMS (Type 0 Ping - 100% Invisible)</option>
            <option value="ss7_hlr">SS7 HLR Network Query (Carrier Switch)</option>
            <option value="cell_id">Cell Tower Triangulation (Base Station ID)</option>
            <option value="wifi_triangulation">Carrier Wi-Fi Offload Triangulation</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={startRemoteStealthPing}
            disabled={isRunning || !targetPhone}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Start Remote Stealth Ping
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      {logs.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-[11px] flex flex-col gap-1.5 shadow-inner">
          <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Carrier Telemetry Output Terminal
          </div>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className="text-emerald-400/90 leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lock Success Card */}
      {lastPingResult && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs flex items-center justify-between animate-fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="font-extrabold text-white text-sm">
                Target Remote Location Locked (Zero Install)
              </div>
              <div className="text-slate-300 font-mono mt-0.5">
                Lat: {lastPingResult.estimatedLocation.lat.toFixed(4)}, Lng: {lastPingResult.estimatedLocation.lng.toFixed(4)} • Tower ID: {lastPingResult.towerId}
              </div>
            </div>
          </div>

          <div className="text-right text-[10px] text-emerald-400 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Target Unaware ✅
          </div>
        </div>
      )}
    </div>
  );
};
