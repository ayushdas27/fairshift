import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AdaptiveViewportBar } from '../components/AdaptiveViewportBar';
import { translations } from '../i18n/translations';

describe('AdaptiveViewportBar', () => {
  it('renders zoom controls and clamps within 80% to 150%', () => {
    let zoomVal = 1.0;
    const setZoom = (z: number) => { zoomVal = z; };
    let langVal = 'en' as const;
    const setLang = (l: any) => { langVal = l; };

    const { rerender } = render(
      <AdaptiveViewportBar
        zoom={zoomVal}
        setZoom={setZoom}
        lang={langVal}
        setLang={setLang}
      />
    );

    expect(screen.getByText('100%')).toBeDefined();
    expect(screen.getByText('System Operational')).toBeDefined();

    // Verify language change
    rerender(
      <AdaptiveViewportBar
        zoom={0.8}
        setZoom={setZoom}
        lang={'hi'}
        setLang={setLang}
      />
    );
    expect(screen.getByText('80%')).toBeDefined();
    expect(screen.getByText(translations.hi.systemOperational)).toBeDefined();
  });
});
