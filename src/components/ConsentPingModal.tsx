import React, { useState } from 'react';
import {
  Send,
  QrCode,
  ShieldCheck,
  CheckCircle,
  Copy,
  Clock,
  X,
  Smartphone,
  ExternalLink,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface ConsentPingModalProps {
  targetPhone: string;
  onClose: () => void;
  onSimulateApprove: (phone: string) => void;
}

export const ConsentPingModal: React.FC<ConsentPingModalProps> = ({
  targetPhone,
  onClose,
  onSimulateApprove,
}) => {
  const [copied, setCopied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const securityCode = Math.floor(100000 + Math.random() * 900000).toString();
  const consentUrl = `${window.location.origin}?track_ping=${securityCode}&phone=${encodeURIComponent(
    targetPhone
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(consentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    setIsApproved(true);
    setTimeout(() => {
      onSimulateApprove(targetPhone);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 text-slate-100 relative animate-scale-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Send Location Consent Request
            </h2>
            <p className="text-xs text-slate-400">
              Mutual GPS location sharing protocol for <span className="text-emerald-400 font-mono font-bold">{targetPhone}</span>
            </p>
          </div>
        </div>

        {!isApproved ? (
          <>
            {/* Security Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Mutual Consent & Legal Compliance
              </div>
              <p className="text-slate-300 leading-relaxed">
                An automated SMS invitation with a secure 1-click verification link and 6-digit PIN (<span className="font-mono font-bold text-white">{securityCode}</span>) is ready to send. Once approved by the recipient device, live encrypted GPS coordinates will be streamed to your map.
              </p>
            </div>

            {/* Generated Link Box */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Unique Location Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={consentUrl}
                  className="flex-1 h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none select-all"
                />
                <button
                  onClick={handleCopy}
                  className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Simulated Target Recipient Approval button */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Link expires in 15 minutes
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleApprove}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Simulate Target Approval
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white">Location Consent Granted!</h3>
            <p className="text-xs text-slate-300 max-w-xs">
              Target device <span className="font-mono text-emerald-400">{targetPhone}</span> has approved live GPS sharing. Calibrating real-time map telemetry...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
