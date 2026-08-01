import React, { useState } from 'react';
import { GeofenceZone, GeofenceAlert, Coordinates } from '../types';
import {
  Shield,
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Radius,
  Home,
  Briefcase,
  GraduationCap,
  Eye,
} from 'lucide-react';

interface GeofenceManagerProps {
  geofences: GeofenceZone[];
  alerts: GeofenceAlert[];
  onAddGeofence: (zone: GeofenceZone) => void;
  onRemoveGeofence: (id: string) => void;
  onToggleGeofence: (id: string) => void;
  selectedCoords?: Coordinates | null;
}

export const GeofenceManager: React.FC<GeofenceManagerProps> = ({
  geofences,
  alerts,
  onAddGeofence,
  onRemoveGeofence,
  onToggleGeofence,
  selectedCoords,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<GeofenceZone['type']>('home');
  const [radius, setRadius] = useState<number>(300);
  const [lat, setLat] = useState<number>(selectedCoords?.lat || 37.7749);
  const [lng, setLng] = useState<number>(selectedCoords?.lng || -122.4194);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newZone: GeofenceZone = {
      id: `geo-${Date.now()}`,
      name,
      type,
      center: { lat: Number(lat), lng: Number(lng) },
      radiusMeters: Number(radius),
      active: true,
      notifyOnEnter: true,
      notifyOnExit: true,
      color: type === 'home' ? '#10B981' : type === 'work' ? '#3B82F6' : '#8B5CF6',
    };

    onAddGeofence(newZone);
    setName('');
    setShowAddForm(false);
  };

  const getIconForType = (type: GeofenceZone['type']) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'school':
        return <GraduationCap className="w-4 h-4 text-purple-400" />;
      default:
        return <Shield className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Geofence Safety Zones
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {geofences.filter((g) => g.active).length} Active Zones
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Receive automatic alerts when tracked phones enter or exit boundary radiuses.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center gap-1 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" /> Add Zone
        </button>
      </div>

      {/* Add Zone Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-slate-950 p-3.5 border border-slate-800 rounded-xl flex flex-col gap-3 text-xs animate-fade-in">
          <div className="font-bold text-white flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" /> Define New Safety Boundary
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Zone Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Home, School, Office"
                className="w-full h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Zone Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-white"
              >
                <option value="home">Home (Green)</option>
                <option value="work">Work / Office (Blue)</option>
                <option value="school">School / Campus (Purple)</option>
                <option value="safe">Custom Safe Area (Amber)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Radius: <span className="text-emerald-400">{radius} meters</span>
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-end justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold"
              >
                Save Boundary
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Geofence List */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {geofences.map((zone) => (
          <div
            key={zone.id}
            className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
              zone.active
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-slate-950/30 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  {getIconForType(zone.type)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{zone.name}</div>
                  <div className="text-[10px] text-slate-400">Radius: {zone.radiusMeters} meters</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={zone.active}
                  onChange={() => onToggleGeofence(zone.id)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  title="Toggle zone active state"
                />
                <button
                  onClick={() => onRemoveGeofence(zone.id)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete zone"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Geofence Alert Log */}
      <div className="mt-1 bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2 text-xs">
        <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-amber-400">
            <Bell className="w-3.5 h-3.5 animate-bounce" /> Real-Time Boundary Activity Log
          </span>
          <span>{alerts.length} Trigger Events</span>
        </div>

        {alerts.length === 0 ? (
          <div className="text-slate-500 text-[11px] italic py-2 text-center">
            Monitoring active... No boundary crossings detected in the last session.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
            {alerts.slice(-5).reverse().map((alt) => (
              <div
                key={alt.id}
                className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                  alt.eventType === 'entered'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase text-[9px] px-1.5 py-0.5 rounded bg-black/40">
                    {alt.eventType}
                  </span>
                  <span className="font-semibold">{alt.deviceName}</span>
                  <span className="text-slate-400">➔ {alt.zoneName}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {new Date(alt.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
