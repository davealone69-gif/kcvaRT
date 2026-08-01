import React, { useState } from 'react';
import { PhoneLookupResult } from '../types';
import { COUNTRIES, CountryOption } from '../data/phoneData';
import {
  Search,
  Phone,
  Globe,
  Radio,
  ShieldCheck,
  Battery,
  Wifi,
  Navigation,
  Send,
  UserCheck,
  Smartphone,
  AlertCircle,
  Sparkles,
  MapPin,
  Clock,
  Zap,
} from 'lucide-react';

interface PhoneLookupPanelProps {
  onSearchResult: (result: PhoneLookupResult) => void;
  onSendConsentPing: (phone: string) => void;
  onUseMyLocation: () => void;
  isLoading: boolean;
}

export const PhoneLookupPanel: React.FC<PhoneLookupPanelProps> = ({
  onSearchResult,
  onSendConsentPing,
  onUseMyLocation,
  isLoading,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [rawNumber, setRawNumber] = useState<string>('(415) 892-3104');
  const [lookupResult, setLookupResult] = useState<PhoneLookupResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const fullPhone = `${selectedCountry.code} ${rawNumber}`.trim();
    if (!rawNumber || rawNumber.trim().length < 5) {
      setErrorMsg('Please enter a valid phone number (at least 7 digits)');
      return;
    }

    try {
      const response = await fetch('/api/phone/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      });

      if (!response.ok) {
        throw new Error('Failed to query phone number carrier database');
      }

      const data: PhoneLookupResult = await response.json();
      setLookupResult(data);
      onSearchResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Unable to reach phone intelligence server. Please try again.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Phone Location Search
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Carrier Triangulation
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Enter any target phone number to analyze carrier network & live location.
            </p>
          </div>
        </div>

        <button
          onClick={onUseMyLocation}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 hover:border-blue-500/40 transition-all flex items-center gap-1.5 shadow-sm"
          title="Share your own device GPS to test tracking"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          Use My Device GPS
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
        {/* Country Code Dropdown */}
        <div className="relative sm:w-48">
          <select
            value={selectedCountry.code}
            onChange={(e) => {
              const matched = COUNTRIES.find((c) => c.code === e.target.value);
              if (matched) setSelectedCountry(matched);
            }}
            className="w-full h-11 pl-3 pr-8 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            {COUNTRIES.map((country, idx) => (
              <option key={`${country.code}-${idx}`} value={country.code} className="bg-slate-900 text-white">
                {country.flag} {country.name} ({country.code})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400 text-xs">▼</div>
        </div>

        {/* Number Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={rawNumber}
            onChange={(e) => setRawNumber(e.target.value)}
            placeholder="e.g. (415) 892-3104 or 07700 900142"
            className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4" />
              Track Number
            </>
          )}
        </button>
      </form>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Live Carrier & Telemetry Intelligence Card */}
      {lookupResult && (
        <div className="mt-2 bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3 animate-fade-in shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{lookupResult.flag}</span>
              <div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  {lookupResult.phoneNumber}
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {lookupResult.country} ({lookupResult.countryCode})
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-slate-200 font-semibold">{lookupResult.carrier}</span> • {lookupResult.lineType} Line
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSendConsentPing(lookupResult.phoneNumber)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-emerald-600/20"
                title="Send mutual SMS location approval request link"
              >
                <Send className="w-3.5 h-3.5" />
                Consent Ping
              </button>
            </div>
          </div>

          {/* Grid of Telemetry Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400" /> Geocoded Region
              </div>
              <div className="font-semibold text-white truncate">
                {lookupResult.city}, {lookupResult.region}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> SIM & Risk Check
              </div>
              <div className="font-semibold text-emerald-400 truncate">
                {lookupResult.simSwapStatus}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <Wifi className="w-3 h-3 text-purple-400" /> Cell Signal
              </div>
              <div className="font-semibold text-white">
                {lookupResult.signalStrength} dBm (Accuracy ±{lookupResult.accuracyRadius}m)
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <Battery className="w-3 h-3 text-amber-400" /> Battery & Speed
              </div>
              <div className="font-semibold text-white">
                ⚡ {lookupResult.batteryLevel}% • {lookupResult.speed} km/h
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
