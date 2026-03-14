import { useState } from 'react';
import { LAYER_INFO } from './layerInfoContent';

/**
 * InfoPanel
 * Shows AVA metadata when no layer is active, or layer explanation/stats
 * when a data layer is selected.
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

  const fmtDate = (str) => {
    if (!str) return null;
    const d = new Date(str + 'T12:00:00Z');
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };

  const fmtCounty = (str) => {
    if (!str) return null;
    const parts = str.split('|').map(s => s.trim());
    if (parts.length === 1) return `${parts[0]} County`;
    const last = parts.pop();
    return `${parts.join(', ')} & ${last} ${parts.length > 0 ? 'Counties' : 'County'}`;
  };

  const fmtStat = (v) => {
    if (v == null || isNaN(v)) return '—';
    return Number(v).toFixed(1);
  };

  // ── Design tokens local to InfoPanel ─────────────────────────────────────
  // Coloured accents kept; neutral text pushed to bright whites for contrast.
  const T = {
    // Text — bright whites, matching --text-on-glass but pushed higher
    textPrimary:  '#ffffff',                 // pure white — body text
    textSecondary:'rgba(255,255,255,0.82)',  // bright white, slightly stepped back
    textMuted:    'rgba(255,255,255,0.55)',  // clearly muted but still legible
    textAccent:   '#a78bfa',                 // violet accent (UPPERCASE labels)
    textGreen:    '#6ee7b7',                 // parent-AVA badge
    textCode:     '#bfdbfe',                 // formula block — light blue

    // Surfaces — match site glass tokens exactly
    surfaceRow:      'var(--glass-bg)',
    surfaceCode:     'var(--glass-bg-input)',
    surfaceStatCard: 'var(--glass-bg-medium)',

    // Borders — match site glass tokens
    divider:      'var(--glass-border-light)',
    borderCard:   'var(--glass-border)',
    borderCode:   'rgba(139,92,246,0.30)',
    borderGreen:  'rgba(52,211,153,0.35)',
    borderViolet: 'rgba(139,92,246,0.35)',

    // Badge backgrounds
    bgViolet:     'rgba(109,40,217,0.25)',
    bgGreen:      'rgba(16,185,129,0.18)',
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: T.textAccent,
    marginBottom: '5px',
  };

  const valueStyle = {
    fontSize: '13px',
    color: T.textPrimary,
    lineHeight: 1.55,
  };

  const sectionStyle = {
    borderBottom: `1px solid ${T.divider}`,
    paddingBottom: '14px',
    marginBottom: '14px',
  };

  const innerPad = '0 16px';

  // ── AVA mode ──────────────────────────────────────────────────────────────
  const AVAContent = () => {
    const established = fmtDate(props.created);
    const county = fmtCounty(props.county);
    const parentAVA = props.within;
    const subAVAs = props.contains;
    const cfr = props.cfr_index ? `27 CFR §${props.cfr_index}` : null;
    const petitioner = props.petitioner;

    return (
      <div style={{ padding: '16px 0 8px', display: 'flex', flexDirection: 'column' }}>

        {/* State badge + county */}
        <div style={{ ...sectionStyle, padding: innerPad, paddingBottom: '14px', marginBottom: '14px' }}>
          {props.state && (
            <div style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              background: T.bgViolet,
              border: `1px solid ${T.borderViolet}`,
              color: T.textPrimary,
              letterSpacing: '0.3px',
              marginBottom: '10px',
            }}>
              {props.state === 'OR' ? 'Oregon' : props.state === 'CA' ? 'California' :
               props.state === 'WA' ? 'Washington' : props.state} AVA
            </div>
          )}
          {county && (
            <div>
              <div style={labelStyle}>Location</div>
              <div style={valueStyle}>{county}</div>
            </div>
          )}
        </div>

        {/* Established + CFR */}
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
            <div style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              background: T.bgGreen,
              border: `1px solid ${T.borderGreen}`,
              color: T.textGreen,
            }}>
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
            <div style={{ ...valueStyle, fontSize: '12px', color: T.textSecondary }}>{petitioner}</div>
          </div>
        )}
      </div>
    );
  };

  // ── Layer mode ────────────────────────────────────────────────────────────
  const LayerContent = () => {
    const info = layerInfo;
    const hasStats = displayMin != null && displayMax != null && !isNaN(displayMin) && !isNaN(displayMax);
    const mean = hasStats ? ((displayMin + displayMax) / 2) : null;

    return (
      <div style={{ padding: '16px 0 8px', display: 'flex', flexDirection: 'column' }}>

        {/* Icon + why */}
        <div style={{ padding: innerPad, ...sectionStyle }}>
          <div style={{ fontSize: '26px', marginBottom: '8px' }}>{info.icon}</div>
          <p style={{ fontSize: '13px', color: T.textSecondary, lineHeight: 1.65, margin: 0 }}>
            {info.why}
          </p>
        </div>

        {/* Stats — Min / Mean / Max */}
        {hasStats && (
          <div style={{ padding: innerPad, ...sectionStyle }}>
            <div style={labelStyle}>AVA Statistics</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '6px' }}>
              {[
                { label: 'Min', val: fmtStat(displayMin) },
                { label: 'Mean', val: fmtStat(mean) },
                { label: 'Max', val: fmtStat(displayMax) },
              ].map(({ label, val }) => (
                <div key={label} style={{
                  background: T.surfaceStatCard,
                  border: `1px solid ${T.borderCard}`,
                  borderRadius: '10px',
                  padding: '8px 4px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: T.textAccent, marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.3px' }}>{val}</div>
                  <div style={{ fontSize: '10px', color: T.textMuted, marginTop: '1px' }}>{unit}</div>
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
            color: T.textCode,
            lineHeight: 1.75,
            background: T.surfaceCode,
            border: `1px solid ${T.borderCode}`,
            borderRadius: '8px',
            padding: '10px 12px',
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
          <div style={{ ...valueStyle, fontSize: '12px', color: T.textSecondary }}>{info.source}</div>
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
                  gap: '10px',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  background: T.surfaceRow,
                  border: `1px solid ${T.borderCard}`,
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: T.textPrimary, minWidth: '90px', flexShrink: 0 }}>{r.label}</span>
                  <span style={{ fontSize: '11px', color: T.textSecondary, lineHeight: 1.45 }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Mobile sheet mode ─────────────────────────────────────────────────────
  if (mobileSheetMode) {
    return showLayer ? <LayerContent /> : <AVAContent />;
  }

  // ── Desktop mode ──────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative' }}>
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
