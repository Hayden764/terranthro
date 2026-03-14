import { useState } from 'react';
import { LAYER_INFO } from './layerInfoContent';

/**
 * InfoPanel
 * Shows AVA metadata when no layer is active, or layer explanation/stats
 * when a data layer is selected.
 *
 * Props:
 *   avaData      {object|null}  — GeoJSON FeatureCollection with one feature
 *   activeLayer  {string|null}  — layer id key (e.g. 'tdmean', 'elevation')
 *   displayMin   {number|null}  — computed min stat for active layer
 *   displayMax   {number|null}  — computed max stat for active layer
 *   unit         {string}       — unit label for active layer
 *   currentMonth {number}       — 1–12, for PRISM monthly layers
 *   mobileSheetMode {boolean}   — when true, no outer wrapper (sheet handles it)
 */
const InfoPanel = ({
  avaData,
  activeLayer,
  displayMin,
  displayMax,
  unit = '',
  currentMonth,
  mobileSheetMode = false,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const props = avaData?.features?.[0]?.properties || {};
  const layerInfo = activeLayer ? LAYER_INFO[activeLayer] : null;
  const showLayer = !!layerInfo;

  // Format a date string "2006-08-16" → "August 2006"
  const fmtDate = (str) => {
    if (!str) return null;
    const d = new Date(str + 'T12:00:00Z');
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };

  // Format county pipe-separated list → "Polk & Yamhill Counties"
  const fmtCounty = (str) => {
    if (!str) return null;
    const parts = str.split('|').map(s => s.trim());
    if (parts.length === 1) return `${parts[0]} County`;
    const last = parts.pop();
    return `${parts.join(', ')} & ${last} ${parts.length > 0 ? 'Counties' : 'County'}`;
  };

  // Format stat value
  const fmtStat = (v) => {
    if (v == null || isNaN(v)) return '—';
    return Number(v).toFixed(1);
  };

  // Pill/badge style
  const badgeStyle = {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    background: 'rgba(139,92,246,0.18)',
    border: '1px solid rgba(139,92,246,0.35)',
    color: 'rgba(200,180,255,0.95)',
    letterSpacing: '0.3px',
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: 'var(--text-on-glass-dim)',
    marginBottom: '4px',
  };

  const valueStyle = {
    fontSize: '13px',
    color: 'var(--text-on-glass)',
    lineHeight: 1.5,
  };

  const sectionStyle = {
    borderBottom: '1px solid var(--glass-border-light)',
    paddingBottom: '14px',
    marginBottom: '14px',
  };

  const innerPad = mobileSheetMode ? '0 16px' : '0 16px';

  // ── AVA mode content ──────────────────────────────────────────────────────
  const AVAContent = () => {
    const established = fmtDate(props.created);
    const county = fmtCounty(props.county);
    const parentAVA = props.within;
    const subAVAs = props.contains;
    const cfr = props.cfr_index ? `27 CFR §${props.cfr_index}` : null;
    const petitioner = props.petitioner;

    return (
      <div style={{ padding: '16px 0 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Header */}
        <div style={{ ...sectionStyle, padding: innerPad, paddingBottom: '14px', marginBottom: '14px' }}>
          {/* State badge */}
          {props.state && (
            <div style={{ ...badgeStyle, marginBottom: '10px' }}>
              {props.state === 'OR' ? 'Oregon' : props.state === 'CA' ? 'California' :
               props.state === 'WA' ? 'Washington' : props.state} AVA
            </div>
          )}

          {/* County */}
          {county && (
            <div>
              <div style={labelStyle}>Location</div>
              <div style={valueStyle}>{county}</div>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div style={{ padding: innerPad, ...sectionStyle }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {established && (
              <div>
                <div style={labelStyle}>Established</div>
                <div style={valueStyle}>{established}</div>
              </div>
            )}
            {cfr && (
              <div>
                <div style={labelStyle}>CFR Reference</div>
                <div style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '12px' }}>{cfr}</div>
              </div>
            )}
          </div>
        </div>

        {/* Parent AVA */}
        {parentAVA && (
          <div style={{ padding: innerPad, ...sectionStyle }}>
            <div style={labelStyle}>Part of</div>
            <div style={{ ...badgeStyle, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: 'rgba(110,231,183,0.95)' }}>
              {parentAVA}
            </div>
          </div>
        )}

        {/* Sub-AVAs */}
        {subAVAs && (
          <div style={{ padding: innerPad, ...sectionStyle }}>
            <div style={labelStyle}>Contains</div>
            <div style={valueStyle}>{subAVAs}</div>
          </div>
        )}

        {/* Petitioner */}
        {petitioner && (
          <div style={{ padding: innerPad, paddingBottom: '8px' }}>
            <div style={labelStyle}>Petitioner</div>
            <div style={{ ...valueStyle, fontSize: '12px', opacity: 0.75 }}>{petitioner}</div>
          </div>
        )}
      </div>
    );
  };

  // ── Layer mode content ────────────────────────────────────────────────────
  const LayerContent = () => {
    const info = layerInfo;
    const hasStats = displayMin != null && displayMax != null && !isNaN(displayMin) && !isNaN(displayMax);
    const mean = hasStats ? ((displayMin + displayMax) / 2) : null;

    return (
      <div style={{ padding: '16px 0 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Icon + description */}
        <div style={{ padding: innerPad, ...sectionStyle }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>{info.icon}</div>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-on-glass)',
            lineHeight: 1.6,
            margin: 0,
            opacity: 0.9,
          }}>
            {info.why}
          </p>
        </div>

        {/* Stats row */}
        {hasStats && (
          <div style={{ padding: innerPad, ...sectionStyle }}>
            <div style={labelStyle}>AVA Statistics</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '6px' }}>
              {[
                { label: 'Min', val: fmtStat(displayMin) },
                { label: 'Mean', val: fmtStat(mean) },
                { label: 'Max', val: fmtStat(displayMax) },
              ].map(({ label, val }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border-light)',
                  borderRadius: '10px',
                  padding: '8px 6px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-on-glass-dim)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-on-glass)', letterSpacing: '-0.3px' }}>{val}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)', marginTop: '1px' }}>{unit}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formula */}
        <div style={{ padding: innerPad, ...sectionStyle }}>
          <div style={labelStyle}>Formula</div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'rgba(200,200,255,0.85)',
            lineHeight: 1.7,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--glass-border-light)',
            borderRadius: '8px',
            padding: '8px 10px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {info.formula}
          </div>
        </div>

        {/* Period */}
        <div style={{ padding: innerPad, ...sectionStyle }}>
          <div style={labelStyle}>Period</div>
          <div style={valueStyle}>{info.period}</div>
        </div>

        {/* Data source */}
        <div style={{ padding: innerPad, ...sectionStyle }}>
          <div style={labelStyle}>Data Source</div>
          <div style={{ ...valueStyle, fontSize: '12px', opacity: 0.8 }}>{info.source}</div>
        </div>

        {/* Reference ranges */}
        {info.ranges && (
          <div style={{ padding: innerPad, paddingBottom: '8px' }}>
            <div style={labelStyle}>Reference Ranges</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              {info.ranges.map((r, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border-light)',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-on-glass)', minWidth: '90px', flexShrink: 0 }}>{r.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-on-glass-dim)', lineHeight: 1.4 }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Mobile sheet mode — no wrapper, no collapse toggle ────────────────────
  if (mobileSheetMode) {
    return showLayer ? <LayerContent /> : <AVAContent />;
  }

  // ── Desktop mode — collapsible side panel ─────────────────────────────────
  return (
    <div style={{ position: 'relative' }}>
      {/* Collapse toggle — sits on left edge of panel */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          position: 'absolute',
          left: '-18px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '18px',
          height: '36px',
          background: 'var(--glass-bg-medium)',
          border: '1px solid var(--glass-border)',
          borderRight: 'none',
          borderRadius: '6px 0 0 6px',
          color: 'var(--text-on-glass-dim)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          padding: 0,
        }}
        aria-label={collapsed ? 'Expand info panel' : 'Collapse info panel'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 1L2 6l4 5" />
        </svg>
      </button>

      <div style={{
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 80px)',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.15) transparent',
      }}>
        {showLayer ? <LayerContent /> : <AVAContent />}
      </div>
    </div>
  );
};

export default InfoPanel;
