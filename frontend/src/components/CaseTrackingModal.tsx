import React, { useState } from 'react';
import { api } from '../lib/api';
import { Search, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CaseTrackingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [trackingNumber, setTrackingNumber] = useState('FS-91044');
  const [trackingSecret, setTrackingSecret] = useState('SEC-demo-secret-2');
  const [caseData, setCaseData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.trackGrievance({
        tracking_number: trackingNumber.trim(),
        tracking_secret: trackingSecret.trim(),
      });
      setCaseData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid tracking credentials.');
      setCaseData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#ffffff] border border-[#e7e5e0] rounded w-full max-w-md p-6 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#e7e5e0] pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#141515]" />
            <h2 className="text-sm font-bold text-[#141515]">Track Case Anonymously</h2>
          </div>
          <button onClick={onClose} className="text-[#5e5e5e] hover:text-[#141515]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleTrack} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#141515]">Tracking Reference</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              required
              placeholder="e.g. FS-91044"
              className="p-2 border border-[#e7e5e0] bg-[#f6f3f2] rounded text-xs uppercase"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#141515]">Secret Key</label>
            <input
              type="password"
              value={trackingSecret}
              onChange={(e) => setTrackingSecret(e.target.value)}
              required
              placeholder="SEC-..."
              className="p-2 border border-[#e7e5e0] bg-[#f6f3f2] rounded text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="py-2 bg-[#141515] hover:bg-[#292929] text-white rounded text-xs font-semibold"
          >
            {isLoading ? 'Verifying...' : 'Look Up Status'}
          </button>
        </form>

        {errorMsg && (
          <div className="p-2.5 bg-[#ffdad6] text-[#93000a] text-xs rounded">
            {errorMsg}
          </div>
        )}

        {caseData && (
          <div className="pt-3 border-t border-[#e7e5e0] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono">{caseData.tracking_number}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#f2f0eb] text-[#2e6930]">
                {caseData.status}
              </span>
            </div>
            <div className="text-xs font-medium text-[#141515]">{caseData.category}</div>
            <p className="text-xs text-[#5e5e5e]">{caseData.description}</p>
            {caseData.resolution_notes && (
              <div className="p-2.5 bg-[#f2f0eb] border border-[#2e6930] rounded text-xs text-[#2e6930]">
                <strong>Resolution Note:</strong> {caseData.resolution_notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
