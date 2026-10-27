import React, { useState } from 'react';
import { api } from '../lib/api';
import { ShieldAlert, X, Send, CheckCircle2, Mic, MicOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AnonymousReportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [orgCode, setOrgCode] = useState('APEX-BLD');
  const [category, setCategory] = useState('Workplace Safety Hazard');
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const toggleVoice = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = 'en-US';
      rec.onstart = () => setIsListening(true);
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setDescription((prev) => (prev ? `${prev} ${text}` : text));
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.submitAnonymousGrievance({
        org_code: orgCode.trim(),
        category,
        severity,
        description,
      });
      setReceipt(res);
      setDescription('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#ffffff] border border-[#e7e5e0] rounded w-full max-w-lg p-6 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#e7e5e0] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#8c5e14]" />
            <h2 className="text-sm font-bold text-[#141515]">Submit Anonymous Safety Case (Zero Identity)</h2>
          </div>
          <button onClick={onClose} className="text-[#5e5e5e] hover:text-[#141515]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {receipt ? (
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-[#f2f0eb] border border-[#2e6930] rounded flex items-center gap-2 text-xs font-semibold text-[#2e6930]">
              <CheckCircle2 className="w-4 h-4" />
              <span>{receipt.message}</span>
            </div>
            <div className="p-3 bg-[#f6f3f2] rounded border border-[#e7e5e0] text-xs font-mono space-y-1">
              <div><strong>Tracking Reference:</strong> {receipt.tracking_number}</div>
              <div><strong>Secret Key:</strong> {receipt.tracking_secret}</div>
            </div>
            <p className="text-xs text-[#5e5e5e]">{receipt.instructions}</p>
            <button
              onClick={() => { setReceipt(null); onClose(); }}
              className="mt-2 py-2 bg-[#141515] text-white rounded text-xs font-semibold"
            >
              Done / Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#141515]">Facility Code</label>
                <input
                  type="text"
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                  required
                  placeholder="APEX-BLD"
                  className="p-2 border border-[#e7e5e0] bg-[#f6f3f2] rounded text-xs uppercase"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#141515]">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="p-2 border border-[#e7e5e0] bg-[#f6f3f2] rounded text-xs"
                >
                  <option value="Standard">Standard Priority</option>
                  <option value="High">High Hazard</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#141515]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-2 border border-[#e7e5e0] bg-[#f6f3f2] rounded text-xs"
              >
                <option value="Workplace Safety Hazard">Workplace Safety Hazard</option>
                <option value="Missing Protective Equipment">Missing Protective Equipment</option>
                <option value="Unsafe Machinery / Scaffolding">Unsafe Machinery / Scaffolding</option>
                <option value="Excessive Shifts / Fatigue">Excessive Shifts / Fatigue</option>
                <option value="Harassment or Unfair Treatment">Harassment or Unfair Treatment</option>
                <option value="Wage or Overtime Discrepancy">Wage or Overtime Discrepancy</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-[#141515]">Hazard Description</label>
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${
                    isListening ? 'bg-[#ba1a1a] text-white' : 'bg-[#f6f3f2] text-[#141515]'
                  }`}
                >
                  {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  <span>{isListening ? 'Listening...' : 'Voice'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe unsafe condition without attaching your name..."
                className="p-2 border border-[#e7e5e0] bg-[#f6f3f2] rounded text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="py-2.5 px-4 bg-[#141515] hover:bg-[#292929] text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Encrypting & Transmitting...' : 'Submit Anonymous Report'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
