import { useState } from 'react';
import {
  CONTINUOUS_COLORMAPS,
  WINKLER_COLORMAP, WINKLER_LABELS,
  HUGLIN_COLORMAP,  HUGLIN_LABELS,
} from './climateConfig';

/**
 * ScalePanel
 * Unified scale / legend panel anchored bottom-right.
 * mobileSheetMode=true  → bare body content (MobileDock provides shell)
 * mobileSheetMode=false → full absolute floating panel (desktop)
 */
const ScalePanel = ({
  isVisible = false,
  layerLabel = '',
  unit = '°C',
  isClassified = false,
  colormapData = null,
  colormap = 'plasma',
  onColormapChange,
  displayMin = null,
  displayMax = null,
  isLoading = false,
  error = null,
  onAutoAdjust,
  showAutoAdjust = true,
  readOnlyColormap = false,
  mobileSheetMode = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRampPicker, setShowRampPicker] = useState(false);

  const disabled = !isVisible;

  const activeCmap = CONTINUOUS_COLORMAPS.find(c => c.id === colormap) || CONTINUOUS_COLORMAPS[0];
  const hasRange = displayMin !== null && displayMax !== null;

  const classEntries = (() => {
    if (!isClassified || !colormapData) return [];
    const cmapObj = colormapData === 'winkler' ? WINKLER_COLORMAP : HUGLIN_COLORMAP;
    const labelsObj = colormapData === 'winkler' ? WINKLER_LABELS : HUGLIN_LABELS;
    return Object.entries(cmapObj).map(([k, rgba]) => ({
      key: k,
      color: `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`,
      label: labelsObj[k] || `Class ${k}`,
    }));
  })();

  const spinCss = `@keyframes sp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;

  const BodyContent = () => (
    <div style={{ overflowY: 'auto', flex: 1, padding: '10px 12px 12px' }}>
      {!isClassified && (
        <>
          {/* Gradient bar */}
          <div style={{ width: '100%', height: '14px', borderRadius: '4px', background: activeCmap.gradient, marginBottom: '4px' }} />

          {/* Range labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-on-glass-dim)', marginBottom: '8px' }}>
            {hasRange ? (
              <>
                <span>{displayMin.toFixed(1)}{unit}</span>
                <span style={{ color: 'var(--text-on-glass-label)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {readOnlyColormap ? 'min – max' : 'p2 – p98'}
                </span>
                <span>{displayMax.toFixed(1)}{unit}</span>
              </>
            ) : (
              <>
                <span style={{ fontStyle: 'italic' }}>—</span>
                <span style={{ color: 'var(--text-on-glass-label)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>global scale</span>
                <span style={{ fontStyle: 'italic' }}>—</span>
              </>
            )}
          </div>

          {/* Color ramp picker toggle */}
          {!readOnlyColormap && (
            <button onClick={() => setShowRampPicker(p => !p)}
              style={{ width: '100%', marginBottom: '8px', padding: '5px 8px', borderRadius: '7px', border: '1px solid var(--glass-border)', background: showRampPicker ? 'var(--accent-medium)' : 'var(--glass-bg-light)', color: showRampPicker ? 'var(--accent-text)' : 'var(--text-on-glass)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', transition: 'all 0.15s' }}>
              <span>Color Ramp</span>
              <div style={{ flex: 1, height: '8px', borderRadius: '3px', background: activeCmap.gradient, margin: '0 4px' }} />
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showRampPicker ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {/* Ramp picker grid */}
          {!readOnlyColormap && showRampPicker && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px', padding: '8px', background: 'var(--glass-bg-light)', borderRadius: '8px', border: '1px solid var(--glass-border-light)', maxHeight: '120px', overflowY: 'auto' }}>
              {CONTINUOUS_COLORMAPS.map(cmap => (
                <button key={cmap.id} onClick={() => { onColormapChange?.(cmap.id); setShowRampPicker(false); }} title={cmap.label}
                  style={{ padding: '4px 6px', borderRadius: '6px', border: cmap.id === colormap ? '1.5px solid var(--accent-border)' : '1px solid var(--glass-border-light)', background: cmap.id === colormap ? 'var(--accent-dim)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '3px', transition: 'all 0.12s' }}>
                  <div style={{ height: '8px', borderRadius: '3px', background: cmap.gradient }} />
                  <span style={{ fontSize: '9px', fontWeight: 600, color: cmap.id === colormap ? 'var(--accent-text)' : 'var(--text-on-glass-dim)', letterSpacing: '0.04em', textAlign: 'left' }}>{cmap.label}</span>
                </button>
              ))}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--glass-border-light)', marginBottom: '8px' }} />

          {/* Auto Adjust */}
          {showAutoAdjust && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={onAutoAdjust} disabled={isLoading}
                style={{ flex: 1, padding: '6px 0', borderRadius: '8px', border: '1px solid var(--accent-border)', background: isLoading ? 'var(--accent-dim)' : 'var(--accent-medium)', color: 'var(--accent-text)', fontSize: '11px', fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.15s ease' }}>
                {isLoading ? (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ animation: 'sp-spin 0.8s linear infinite', flexShrink: 0 }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Adjusting…
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10" />
                      <polyline points="23 20 23 14 17 14" />
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                    Auto Adjust
                  </>
                )}
              </button>
              <button title="Auto Adjust calculates the color scale from data in the current viewport using the 2nd and 98th percentiles (p2–p98)."
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--glass-bg-medium)', color: 'var(--text-on-glass-muted)', fontSize: '12px', fontWeight: 700, cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Georgia, serif' }}>
                ⓘ
              </button>
            </div>
          )}
        </>
      )}

      {/* Classified mode */}
      {isClassified && classEntries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {classEntries.map(entry => (
            <div key={entry.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: entry.color, flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }} />
              <span style={{ fontSize: '10px', color: 'var(--text-on-glass)', letterSpacing: '0.02em', lineHeight: '1.2' }}>{entry.label}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '8px', padding: '6px 8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', fontSize: '10px', color: '#fca5a5', lineHeight: '1.4' }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );

  // Mobile sheet mode — bare body only
  if (mobileSheetMode) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', opacity: disabled ? 0.38 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
        <BodyContent />
        <style>{spinCss}</style>
      </div>
    );
  }

  // Desktop — full absolute panel
  return (
    <div style={{
      position: 'absolute', bottom: '52px', right: '16px', zIndex: 40,
      width: '252px',
      background: 'var(--glass-bg-medium)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      borderRadius: '12px',
      boxShadow: 'var(--glass-shadow)',
      fontFamily: 'Inter, sans-serif',
      maxHeight: 'calc(100vh - 16px - 52px - 32px)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      opacity: disabled ? 0.38 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      transition: 'opacity 0.3s ease',
    }}>
      {/* Header */}
      <div onClick={() => setIsExpanded(p => !p)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: isExpanded ? '1px solid var(--glass-border-light)' : 'none', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          {isClassified ? (
            <div style={{ width: '18px', height: '10px', borderRadius: '3px', background: 'linear-gradient(to right, #3b82f6, #60a5fa, #86efac, #fde047, #fb923c, #ef4444, #b91c1c)', border: '1px solid var(--glass-border-light)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '18px', height: '10px', borderRadius: '3px', background: activeCmap.gradient, border: '1px solid var(--glass-border-light)', flexShrink: 0 }} />
          )}
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-on-glass)', textTransform: 'uppercase', letterSpacing: '0.6px', maxWidth: '165px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {layerLabel || 'Scale'}
          </span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-on-glass-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && <BodyContent />}
      <style>{spinCss}</style>
    </div>
  );
};

export default ScalePanel;
