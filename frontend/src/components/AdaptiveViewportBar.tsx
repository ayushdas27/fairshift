import React from 'react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { ZoomIn, ZoomOut, RotateCcw, Globe, Building2 } from 'lucide-react';

interface Props {
  zoom: number;
  setZoom: (z: number) => void;
  lang: Language;
  setLang: (l: Language) => void;
  currentOrg?: string;
  onSwitchOrg?: (orgCode: string) => void;
}

export const AdaptiveViewportBar: React.FC<Props> = ({
  zoom,
  setZoom,
  lang,
  setLang,
  currentOrg,
  onSwitchOrg,
}) => {
  const t = translations[lang];

  const handleZoomChange = (delta: number) => {
    setZoom(Math.max(0.8, Math.min(1.5, Math.round((zoom + delta) * 100) / 100)));
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
  };

  return (
    <div className="bg-[#FAF9F6] border-b border-[#E7E5E0] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-[#5e5e5e] select-none sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium text-[#1b1c1c]">
          <span className="w-2 h-2 rounded-full bg-[#2e6930]"></span>
          <span>{t.systemOperational}</span>
          <span className="text-[#747878]">•</span>
          <span className="text-[#5e5e5e]">{t.zeroBiasAudited}</span>
        </div>

        {currentOrg && (
          <div className="hidden sm:flex items-center gap-1 text-[#1b1c1c] font-medium bg-[#f0eded] px-2 py-0.5 rounded border border-[#E7E5E0]">
            <Building2 className="w-3.5 h-3.5 text-[#5e5e5e]" />
            <span>{currentOrg}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Adaptive Viewport Zoom: Clamped between 80% and 150% */}
        <div className="flex items-center gap-2 bg-[#ffffff] px-2.5 py-1 rounded border border-[#E7E5E0]">
          <span className="font-semibold text-[#1b1c1c] uppercase tracking-wider text-[10px]">
            {t.zoomLevel}:
          </span>
          <button
            onClick={() => handleZoomChange(-0.1)}
            disabled={zoom <= 0.8}
            className="hover:text-[#1b1c1c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-0.5"
            title="Minimise (Min 80%)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="0.80"
            max="1.50"
            step="0.05"
            value={zoom}
            onChange={handleSlider}
            className="w-16 h-1 bg-[#f0eded] accent-[#141515] rounded cursor-pointer"
            title="Zoom slider (80% - 150%)"
          />

          <button
            onClick={() => handleZoomChange(0.1)}
            disabled={zoom >= 1.5}
            className="hover:text-[#1b1c1c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-0.5"
            title="Maximise (Max 150%)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <span className="font-tabular font-medium text-[#1b1c1c] min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          {zoom !== 1.0 && (
            <button
              onClick={() => setZoom(1.0)}
              className="text-[#747878] hover:text-[#1b1c1c] p-0.5"
              title="Reset Zoom to 100%"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-[#ffffff] px-2 py-1 rounded border border-[#E7E5E0]">
          <Globe className="w-3.5 h-3.5 text-[#5e5e5e]" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            aria-label={t.language}
            className="bg-transparent text-[#1b1c1c] font-medium focus:outline-none cursor-pointer"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिंदी (HI)</option>
            <option value="bn">বাংলা (BN)</option>
          </select>
        </div>

        {/* Industry switcher quick trigger */}
        {onSwitchOrg && (
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSwitchOrg('APEX-BLD')}
              className="px-2 py-0.5 rounded border border-[#E7E5E0] hover:bg-[#f0eded] text-[11px] font-medium"
            >
              Apex (Construction)
            </button>
            <button
              onClick={() => onSwitchOrg('METRO-UNI')}
              className="px-2 py-0.5 rounded border border-[#E7E5E0] hover:bg-[#f0eded] text-[11px] font-medium"
            >
              Metro (University)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
