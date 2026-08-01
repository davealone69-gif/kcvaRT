import React from 'react';
import { SavedDevice, LocationPoint } from '../types';
import { Clock, MapPin, Download, Battery, Navigation, X, Shield } from 'lucide-react';

interface LocationHistoryModalProps {
  device: SavedDevice;
  onClose: () => void;
}

export const LocationHistoryModal: React.FC<LocationHistoryModalProps> = ({ device, onClose }) => {
  const exportCSV = () => {
    const headers = ['Timestamp', 'Latitude', 'Longitude', 'Speed (km/h)', 'Battery (%)', 'Address'];
    const rows = device.history.map((pt) => [
      pt.timestamp,
      pt.lat,
      pt.lng,
      pt.speed,
      pt.battery,
      `"${pt.address || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${device.name.replace(/\s+/g, '_')}_location_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-xl w-full shadow-2xl flex flex-col gap-4 text-slate-100 relative animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Location History Log
              </h2>
              <p className="text-xs text-slate-400">
                24-Hour breadcrumb trail for <span className="text-white font-semibold">{device.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 hover:border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Timeline list */}
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
          {device.history.length === 0 ? (
            <div className="text-slate-500 text-xs italic py-6 text-center">
              No historical breadcrumb points recorded yet.
            </div>
          ) : (
            device.history.map((pt, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>

                <div className="flex-1 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{pt.address || 'Recorded GPS Coordinate'}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(pt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-3">
                    <span>Lat: {pt.lat.toFixed(4)}, Lng: {pt.lng.toFixed(4)}</span>
                    <span>• Speed: {pt.speed} km/h</span>
                    <span>• Battery: {pt.battery}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
