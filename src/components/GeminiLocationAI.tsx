import React, { useState } from 'react';
import { SavedDevice } from '../types';
import { Sparkles, Shield, MapPin, Compass, AlertCircle, RefreshCw, Send } from 'lucide-react';

interface GeminiLocationAIProps {
  device: SavedDevice | null;
}

export const GeminiLocationAI: React.FC<GeminiLocationAIProps> = ({ device }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('');

  const fetchAIAnalysis = async (queryOverride?: string) => {
    if (!device) return;
    setLoading(true);

    try {
      const response = await fetch('/api/ai/location-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: device.currentLoc,
          address: device.currentLoc.address,
          phoneNumber: device.phoneNumber,
          city: device.country,
          country: device.country,
          question: queryOverride,
        }),
      });

      const data = await response.json();
      setAnalysis(data.analysis || 'Analysis generated successfully.');
    } catch (err) {
      console.error(err);
      setAnalysis('Failed to contact Gemini AI Location Intelligence service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Gemini AI Location Intelligence
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Server-Side AI
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {device
                ? `Safety & area context report for ${device.name}`
                : 'Select a target device to evaluate location safety.'}
            </p>
          </div>
        </div>

        {device && (
          <button
            onClick={() => fetchAIAnalysis()}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Analyze Area
          </button>
        )}
      </div>

      {device ? (
        <div className="flex flex-col gap-3 text-xs">
          {/* Target Location Card */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="font-bold text-white">{device.currentLoc.address || 'GPS Coordinates'}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {device.currentLoc.lat.toFixed(4)}, {device.currentLoc.lng.toFixed(4)} • Speed {device.currentLoc.speed} km/h
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Text Display */}
          {analysis ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 text-slate-200 leading-relaxed whitespace-pre-line text-xs font-sans shadow-inner">
              {analysis}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-slate-400 text-center flex flex-col items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-400/60" />
              <p className="max-w-xs">
                Click <span className="text-purple-300 font-semibold">"Analyze Area"</span> to generate an AI neighborhood safety, emergency services, and transit connectivity overview for this GPS coordinate.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-slate-500 text-xs italic">
          No device selected. Select a tracked phone from the sidebar to inspect its location with Gemini AI.
        </div>
      )}
    </div>
  );
};
