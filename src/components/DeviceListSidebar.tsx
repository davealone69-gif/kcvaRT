import React, { useState } from 'react';
import { SavedDevice, Coordinates } from '../types';
import {
  Smartphone,
  Truck,
  Plus,
  Battery,
  Wifi,
  Navigation,
  Play,
  Pause,
  Trash2,
  ChevronRight,
  ShieldAlert,
  Clock,
  Radio,
  Share2,
} from 'lucide-react';

interface DeviceListSidebarProps {
  devices: SavedDevice[];
  selectedDeviceId: string | null;
  onSelectDevice: (id: string) => void;
  onToggleMovement: (id: string) => void;
  onAddDevice: (device: Partial<SavedDevice>) => void;
  onRemoveDevice: (id: string) => void;
}

export const DeviceListSidebar: React.FC<DeviceListSidebarProps> = ({
  devices,
  selectedDeviceId,
  onSelectDevice,
  onToggleMovement,
  onAddDevice,
  onRemoveDevice,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCarrier, setNewCarrier] = useState('Verizon 5G');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    onAddDevice({
      name: newName,
      phoneNumber: newPhone,
      carrier: newCarrier,
      country: 'United States',
      flag: '🇺🇸',
      battery: 85,
      signal: -70,
      avatarColor: 'from-blue-600 to-cyan-500',
      avatarIcon: 'smartphone',
      status: 'online',
      isSimulatedMovement: true,
      movementType: 'drive',
      currentLoc: {
        lat: 37.7749 + (Math.random() - 0.5) * 0.05,
        lng: -122.4194 + (Math.random() - 0.5) * 0.05,
        timestamp: new Date().toISOString(),
        address: 'San Francisco Metro Area',
        speed: 25,
        battery: 85,
        heading: 90,
        altitude: 20,
      },
      history: [],
    });

    setNewName('');
    setNewPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Tracked Devices
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {devices.length} Active
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Select target device to view real-time GPS telemetry.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-1 shadow-md shadow-blue-600/20"
          title="Track new phone number"
        >
          <Plus className="w-4 h-4" /> Add Phone
        </button>
      </div>

      {/* Device List */}
      <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1">
        {devices.map((dev) => {
          const isSelected = dev.id === selectedDeviceId;

          return (
            <div
              key={dev.id}
              onClick={() => onSelectDevice(dev.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col gap-2.5 ${
                isSelected
                  ? 'bg-slate-800/90 border-blue-500 ring-1 ring-blue-500 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`relative w-10 h-10 rounded-full bg-gradient-to-tr ${dev.avatarColor} text-white flex items-center justify-center font-black text-sm shadow-md ring-2 ring-white/10`}
                  >
                    <span>{dev.flag}</span>
                    {dev.status === 'moving' && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {dev.name}
                      <span className="text-[10px] font-semibold text-slate-400 font-mono">
                        {dev.phoneNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Radio className="w-3 h-3 text-blue-400" />
                      <span>{dev.carrier}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMovement(dev.id);
                    }}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      dev.isSimulatedMovement
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                    }`}
                    title={dev.isSimulatedMovement ? 'Pause live movement' : 'Resume live movement simulation'}
                  >
                    {dev.isSimulatedMovement ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveDevice(dev.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove device from list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status and Telemetry Sub-bar */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-300">
                <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                  <Navigation className="w-3 h-3 text-blue-400" />
                  <span className="font-semibold">{dev.currentLoc.speed} km/h</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                  <Battery className="w-3 h-3 text-amber-400" />
                  <span className="font-semibold">{dev.battery}%</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 truncate">
                  <Wifi className="w-3 h-3 text-purple-400" />
                  <span className="font-semibold truncate">{dev.signal} dBm</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-scale-up">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              Add Target Device to Track List
            </h3>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Device / Person Label</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dad's iPhone or Work Delivery Van"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +1 (415) 992-0192"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Carrier Network</label>
                <select
                  value={newCarrier}
                  onChange={(e) => setNewCarrier(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Verizon Wireless 5G">Verizon Wireless 5G</option>
                  <option value="AT&T Mobility">AT&T Mobility</option>
                  <option value="T-Mobile USA 5G">T-Mobile USA 5G</option>
                  <option value="Vodafone UK">Vodafone UK</option>
                  <option value="Orange France">Orange France</option>
                  <option value="Reliance Jio 5G">Reliance Jio 5G</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
