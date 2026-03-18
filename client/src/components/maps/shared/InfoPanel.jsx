import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LAYER_INFO } from './layerInfoContent';
import { useAvaClimateStats } from '../../../hooks/useAvaClimateStats';

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
  stateName = null,
  mobileSheetMode = false,
  onAvaHover = null,
  dbSlug = null,       // DB slug (underscores) passed directly — avoids waiting for avaData.properties
}) => {
  const navigate = useNavigate();

  // Handle both Feature and FeatureCollection
  const props = avaData?.type === 'Feature'
    ? (avaData.properties || {})
    : (avaData?.features?.[0]?.properties || {});

  const layerInfo = activeLayer ? LAYER_INFO[activeLayer] : null;
  const showLayer = !!layerInfo;

  // ── Climate stats (DB-backed, Oregon only for now) ─────────────────────
  const avaSlug = dbSlug || props.slug || null;
  const { stats: climateStats, loading: climateLoading } = useAvaClimateStats(avaSlug, 2025);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');

  const fmtDate = (str) => {
    if (!str) return null;
    const d = new Date(str + 'T12:00:00Z');
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };

  const fmtCounty = (str) => {
    if (!str) return null;
    const parts = str.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return null;
    if (parts.length === 1) return `${parts[0]} County`;
    const last = parts[parts.length - 1];
    const rest = parts.slice(0, -1);
    return `${rest.join(', ')} & ${last} Counties`;
  };

  const fmtState = (str) => {
    if (!str) return null;
    const NAMES = {
      OR: 'Oregon', CA: 'California', WA: 'Washington', ID: 'Idaho',
      NY: 'New York', TX: 'Texas', VA: 'Virginia', PA: 'Pennsylvania',
      MI: 'Michigan', OH: 'Ohio', NC: 'North Carolina', MO: 'Missouri',
      CO: 'Colorado', NM: 'New Mexico', AZ: 'Arizona', MD: 'Maryland',
      NJ: 'New Jersey', MA: 'Massachusetts', CT: 'Connecticut',
      RI: 'Rhode Island', TN: 'Tennessee', KY: 'Kentucky', WI: 'Wisconsin',
      IL: 'Illinois', MN: 'Minnesota', IA: 'Iowa', IN: 'Indiana',
      LA: 'Louisiana', MS: 'Mississippi', AR: 'Arkansas', GA: 'Georgia',
      WV: 'West Virginia', HI: 'Hawaii',
    };
    const parts = str.split('|').map(s => s.trim()).filter(Boolean);
    const names = parts.map(s => NAMES[s] || s);
    if (names.length === 1) return names[0];
    const last = names[names.length - 1];
    return `${names.slice(0, -1).join(', ')} & ${last}`;
  };

  const fmtStat = (v) => (v == null || isNaN(v)) ? '—' : Number(v).toFixed(1);

  // ── Design tokens ─────────────────────────────────────────────────────────
  const T = {
    textPrimary:   '#ffffff',
    textSecondary: 'rgba(255,255,255,0.75)',
    textMuted:     'rgba(255,255,255,0.35)',
    textGreen:     '#6ee7b7',
    textCode:      '#bfdbfe',
    bgViolet:      'rgba(91,188,255,0.15)',
    borderViolet:  'rgba(91,188,255,0.28)',
    bgGreen:       'rgba(16,185,129,0.18)',
    borderGreen:   'rgba(52,211,153,0.35)',
    surfaceCode:   'rgba(0,0,0,0.25)',
    borderCode:    'rgba(91,188,255,0.25)',
  };

  // Apple-style card — plain object, never a component → no remount issues
  const card = {
    background:   'rgba(255,255,255,0.07)',
    border:       '1px solid rgba(255,255,255,0.11)',
    borderRadius: '12px',
    boxShadow:    '0 1px 4px rgba(0,0,0,0.25)',
    padding:      '12px 14px',
  };

  const lbl = {
    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '1px', color: 'rgba(255,255,255,0.45)', marginBottom: '4px',
  };

  const val = {
    fontSize: '13px', color: T.textPrimary, lineHeight: 1.55,
  };

  // ── AVA mode ──────────────────────────────────────────────────────────────
  // Normalize parents/children — DB returns arrays of {slug,name} objects;
  // legacy GeoJSON uses pipe-delimited strings in props.within / props.contains.
  const parents = (() => {
    if (Array.isArray(props.parents) && props.parents.length) return props.parents;
    if (props.within) return props.within.split('|').map(n => n.trim()).filter(Boolean).map(n => ({ name: n, slug: toSlug(n) }));
    return [];
  })();

  const children = (() => {
    if (Array.isArray(props.children) && props.children.length) return props.children;
    if (props.contains) return props.contains.split('|').map(n => n.trim()).filter(Boolean).map(n => ({ name: n, slug: toSlug(n) }));
    return [];
  })();

  // Normalize states — DB returns [{abbreviation, name}]; legacy is pipe string "OR|WA"
  const stateLabel = (() => {
    if (Array.isArray(props.states) && props.states.length) {
      const names = props.states.map(s => s.name);
      if (names.length === 1) return names[0];
      return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
    }
    return fmtState(props.state);
  })();

  // Normalize counties — DB returns [{name, state}]; legacy is pipe string "Yamhill"
  const countyLabel = (() => {
    if (Array.isArray(props.counties) && props.counties.length) {
      const names = props.counties.map(c => c.name);
      if (names.length === 1) return `${names[0]} County`;
      return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]} Counties`;
    }
    return fmtCounty(props.county);
  })();

  // Resolve parent navigation — DB parents have their own slug; legacy needs slug derived
  const parentNavSlug = (parent) => {
    // If parent.slug looks like DB format (underscores), convert to URL dashes
    if (parent.slug) return parent.slug.replace(/_/g, '-');
    return toSlug(parent.name);
  };

  // Expand toggles for parent / child lists
  const [parentsExpanded, setParentsExpanded] = useState(false);
  const [childrenExpanded, setChildrenExpanded] = useState(false);

  const AVAList = ({ items, expanded, onToggle }) => {
    const LIMIT = 5;
    const visible = expanded ? items : items.slice(0, LIMIT);
    const overflow = items.length - LIMIT;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
        {visible.map(item => (
          <button
            key={item.name}
            onClick={() => stateName && navigate(`/${stateName}/${parentNavSlug(item)}`)}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(56,189,248,0.12)';
              e.currentTarget.style.borderColor = 'rgba(56,189,248,0.40)';
              e.currentTarget.style.color = '#7dd3fc';
              if (onAvaHover) onAvaHover(item.slug || item.name.toLowerCase().replace(/\s+/g, '_'));
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.color = T.textSecondary;
              if (onAvaHover) onAvaHover(null);
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '8px 12px',
              borderRadius: '8px', border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.05)',
              color: T.textSecondary,
              fontSize: '12px', fontWeight: 500,
              cursor: stateName ? 'pointer' : 'default',
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              textAlign: 'left',
            }}
          >
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name}
            </span>
            <span style={{ fontSize: '13px', marginLeft: '8px', opacity: 0.55, flexShrink: 0 }}>↗</span>
          </button>
        ))}
        {!expanded && overflow > 0 && (
          <button
            onClick={() => onToggle(true)}
            onMouseEnter={e => { e.currentTarget.style.color = T.textSecondary; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; }}
            style={{
              background: 'none', border: 'none', padding: '2px 0',
              fontSize: '11px', fontWeight: 600, color: T.textMuted,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            + {overflow} more ↓
          </button>
        )}
        {expanded && overflow > 0 && (
          <button
            onClick={() => onToggle(false)}
            onMouseEnter={e => { e.currentTarget.style.color = T.textSecondary; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; }}
            style={{
              background: 'none', border: 'none', padding: '2px 0',
              fontSize: '11px', fontWeight: 600, color: T.textMuted,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            ↑ Show less
          </button>
        )}
      </div>
    );
  };

  const AVAContent = () => {
    const established = fmtDate(props.created);
    const cfr         = props.cfr_index ? `27 CFR §${props.cfr_index}` : null;
    const petitioner  = props.petitioner;

    return (
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {/* Card 1 — State + Location */}
        {(stateLabel || countyLabel) && (
          <div style={card}>
            {stateLabel && stateName && (
              <button
                onClick={() => navigate(`/${stateName}`)}
                style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.3px',
                  background: T.bgViolet, border: `1px solid ${T.borderViolet}`,
                  color: T.textPrimary, cursor: 'pointer', marginBottom: countyLabel ? '10px' : '0',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,188,255,0.28)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.bgViolet; }}
              >
                {stateLabel} AVA ↗
              </button>
            )}
            {stateLabel && !stateName && (
              <div style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.3px',
                background: T.bgViolet, border: `1px solid ${T.borderViolet}`,
                color: T.textPrimary, marginBottom: countyLabel ? '10px' : '0',
              }}>
                {stateLabel} AVA
              </div>
            )}
            {countyLabel && (
              <div>
                <div style={lbl}>Location</div>
                <div style={val}>{countyLabel}</div>
              </div>
            )}
          </div>
        )}

        {/* Card 2 — Established + CFR */}
        {(established || cfr) && (
          <div style={card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {established && (
                <div>
                  <div style={lbl}>Established</div>
                  <div style={val}>{established}</div>
                </div>
              )}
              {cfr && (
                <div>
                  <div style={lbl}>CFR Reference</div>
                  <div style={{ ...val, fontFamily: 'monospace', fontSize: '12px' }}>{cfr}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card 3 — Part of (parent AVAs) */}
        {parents.length > 0 && (
          <div style={card}>
            <div style={{ ...lbl, marginBottom: 0 }}>
              Part of
              <span style={{ marginLeft: '6px', fontWeight: 400, opacity: 0.6 }}>({parents.length})</span>
            </div>
            <AVAList items={parents} expanded={parentsExpanded} onToggle={setParentsExpanded} />
          </div>
        )}

        {/* Card 4 — Contains (sub-AVAs) */}
        {children.length > 0 && (
          <div style={card}>
            <div style={{ ...lbl, marginBottom: 0 }}>
              Contains
              <span style={{ marginLeft: '6px', fontWeight: 400, opacity: 0.6 }}>({children.length})</span>
            </div>
            <AVAList items={children} expanded={childrenExpanded} onToggle={setChildrenExpanded} />
          </div>
        )}

        {/* Card 5 — Petitioner */}
        {petitioner && (
          <div style={card}>
            <div style={lbl}>Petitioner</div>
            <div style={{ ...val, fontSize: '12px', color: T.textSecondary }}>{petitioner}</div>
          </div>
        )}

        {/* ── Climate Stats ─────────────────────────────────────────────── */}
        {climateLoading && (
          <div style={{ ...card, textAlign: 'center', color: T.textMuted, fontSize: '12px', padding: '16px' }}>
            Loading climate data…
          </div>
        )}

        {!climateLoading && climateStats && (() => {
          const CLIMATE_META = {
            gdd_winkler: { label: 'Winkler GDD',          icon: '☀️',  decimals: 0 },
            huglin:      { label: 'Huglin Index',          icon: '🌡️', decimals: 0 },
            gst:         { label: 'Growing Season Temp',   icon: '🌿',  decimals: 1 },
            ppt:         { label: 'Growing Season Precip', icon: '🌧️', decimals: 0 },
          };

          const entries = Object.entries(CLIMATE_META)
            .map(([key, meta]) => ({ key, meta, data: climateStats[key] }))
            .filter(e => e.data);

          if (!entries.length) return null;

          return (
            <>
              {/* Section divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '4px 2px',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.10)' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '1px', color: 'rgba(255,255,255,0.30)' }}>
                  2025 Growing Season
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.10)' }} />
              </div>

              {entries.map(({ key, meta, data }) => {
                const fmt = (v) => v == null ? '—' : Number(v).toFixed(meta.decimals);
                const range = data.max - data.min;
                // p10–p90 bar position within min–max range
                const barLeft  = range > 0 ? ((data.p10 - data.min) / range) * 100 : 0;
                const barWidth = range > 0 ? ((data.p90 - data.p10) / range) * 100 : 100;

                return (
                  <div key={key} style={card}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ fontSize: '15px' }}>{meta.icon}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.8px', color: 'rgba(255,255,255,0.45)' }}>
                          {meta.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: T.textMuted }}>{data.unit}</span>
                    </div>

                    {/* Mean */}
                    <div style={{ fontSize: '26px', fontWeight: 700, color: T.textPrimary,
                      letterSpacing: '-0.5px', lineHeight: 1, marginBottom: '10px' }}>
                      {fmt(data.mean)}
                    </div>

                    {/* Min–Max range bar with P10–P90 highlighted */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{
                        position: 'relative', height: '5px',
                        background: 'rgba(255,255,255,0.10)', borderRadius: '99px',
                      }}>
                        <div style={{
                          position: 'absolute', top: 0,
                          left: `${barLeft}%`, width: `${barWidth}%`,
                          height: '100%', borderRadius: '99px',
                          background: 'rgba(56,189,248,0.55)',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between',
                        marginTop: '4px', fontSize: '10px', color: T.textMuted }}>
                        <span>{fmt(data.min)}</span>
                        <span style={{ color: 'rgba(56,189,248,0.70)', fontSize: '9px' }}>
                          p10–p90: {fmt(data.p10)} – {fmt(data.p90)}
                        </span>
                        <span>{fmt(data.max)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          );
        })()}

      </div>
    );
  };

  // ── Layer mode ────────────────────────────────────────────────────────────

  // Map activeLayer id → DB variable key in ava_climate_stats
  const LAYER_TO_DB_VAR = {
    gdd_winkler_accumulated:  'gdd_winkler',
    gdd_winkler_classified:   'gdd_winkler',
    huglin:                   'huglin',
    huglin_classified:        'huglin',
    gst_smarthobday:          'gst',
    ppt:                      'ppt',
    ppt_growing_season_2025:  'ppt',
  };

  const LayerContent = () => {
    const info     = layerInfo;

    // DB-backed AVA stats (polygon-clipped, accurate)
    const dbVarKey  = activeLayer ? LAYER_TO_DB_VAR[activeLayer] : null;
    const dbStat    = dbVarKey && climateStats ? climateStats[dbVarKey] : null;

    // Fallback: Titiler viewport stats (whole-viewport, less accurate)
    const hasViewportStats = displayMin != null && displayMax != null && !isNaN(displayMin) && !isNaN(displayMax);

    return (
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {/* AVA hierarchy — Part of / Contains — also shown in layer mode */}
        {parents.length > 0 && (
          <div style={card}>
            <div style={{ ...lbl, marginBottom: 0 }}>
              Part of
              <span style={{ marginLeft: '6px', fontWeight: 400, opacity: 0.6 }}>({parents.length})</span>
            </div>
            <AVAList items={parents} expanded={parentsExpanded} onToggle={setParentsExpanded} />
          </div>
        )}

        {children.length > 0 && (
          <div style={card}>
            <div style={{ ...lbl, marginBottom: 0 }}>
              Contains
              <span style={{ marginLeft: '6px', fontWeight: 400, opacity: 0.6 }}>({children.length})</span>
            </div>
            <AVAList items={children} expanded={childrenExpanded} onToggle={setChildrenExpanded} />
          </div>
        )}

        {/* Card 1 — Icon + Why */}
        <div style={card}>
          <div style={{ fontSize: '26px', marginBottom: '8px' }}>{info.icon}</div>
          <p style={{ fontSize: '13px', color: T.textSecondary, lineHeight: 1.65, margin: 0 }}>
            {info.why}
          </p>
        </div>

        {/* Card 2 — AVA Statistics */}
        {dbStat ? (
          /* ── DB-backed polygon-clipped stats (preferred) ── */
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={lbl}>AVA Statistics</div>
              <div style={{
                fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.8px', color: 'rgba(110,231,183,0.70)',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.20)',
                borderRadius: '4px', padding: '2px 6px',
              }}>
                AVA-clipped · 2025
              </div>
            </div>

            {/* Min / Mean / Max row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              {[
                { label: 'Min',  v: dbStat.min  },
                { label: 'Mean', v: dbStat.mean },
                { label: 'Max',  v: dbStat.max  },
              ].map(({ label, v }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '8px', padding: '8px 4px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.8px', color: 'rgba(255,255,255,0.45)', marginBottom: '4px' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.3px' }}>
                    {fmtStat(v)}
                  </div>
                  <div style={{ fontSize: '10px', color: T.textMuted, marginTop: '1px' }}>{dbStat.unit}</div>
                </div>
              ))}
            </div>

            {/* P10–P90 range bar */}
            {(() => {
              const range    = dbStat.max - dbStat.min;
              const barLeft  = range > 0 ? ((dbStat.p10 - dbStat.min) / range) * 100 : 0;
              const barWidth = range > 0 ? ((dbStat.p90 - dbStat.p10) / range) * 100 : 100;
              return (
                <div>
                  <div style={{
                    position: 'relative', height: '5px',
                    background: 'rgba(255,255,255,0.10)', borderRadius: '99px',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0,
                      left: `${barLeft}%`, width: `${Math.max(barWidth, 4)}%`,
                      height: '100%', borderRadius: '99px',
                      background: 'rgba(56,189,248,0.55)',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    marginTop: '5px', fontSize: '10px', color: T.textMuted }}>
                    <span>{fmtStat(dbStat.min)}</span>
                    <span style={{ color: 'rgba(56,189,248,0.70)', fontSize: '9px' }}>
                      p10–p90: {fmtStat(dbStat.p10)} – {fmtStat(dbStat.p90)}
                    </span>
                    <span>{fmtStat(dbStat.max)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : hasViewportStats ? (
          /* ── Titiler viewport stats fallback ── */
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={lbl}>AVA Statistics</div>
              <div style={{
                fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.8px', color: 'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '4px', padding: '2px 6px',
              }}>
                Viewport range
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[
                { label: 'Min',  v: displayMin },
                { label: 'Mean', v: (displayMin + displayMax) / 2 },
                { label: 'Max',  v: displayMax },
              ].map(({ label, v }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '8px', padding: '8px 4px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.8px', color: 'rgba(255,255,255,0.45)', marginBottom: '4px' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.3px' }}>
                    {fmtStat(v)}
                  </div>
                  <div style={{ fontSize: '10px', color: T.textMuted, marginTop: '1px' }}>{unit}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Card 3 — Formula */}
        <div style={card}>
          <div style={lbl}>Formula</div>
          <div style={{
            fontFamily: 'monospace', fontSize: '11px', color: T.textCode,
            lineHeight: 1.8, background: T.surfaceCode, border: `1px solid ${T.borderCode}`,
            borderRadius: '8px', padding: '10px 12px',
            whiteSpace: typeof info.formula === 'string' ? 'pre-wrap' : 'normal',
            wordBreak: 'break-word', marginTop: '6px',
          }}>
            {info.formula}
          </div>
        </div>

        {/* Card 4 — Period + Data Source */}
        <div style={card}>
          <div style={{ marginBottom: '10px' }}>
            <div style={lbl}>Period</div>
            <div style={val}>{info.period}</div>
          </div>
          <div>
            <div style={lbl}>Data Source</div>
            <div style={{ ...val, fontSize: '12px', color: T.textSecondary }}>{info.source}</div>
          </div>
        </div>

        {/* Card 5 — Reference Ranges */}
        {info.ranges && (
          <div style={{ ...card, padding: '12px 14px 8px' }}>
            <div style={lbl}>Reference Ranges</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              {info.ranges.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '6px 8px', borderRadius: '7px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
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

  // ── Render ────────────────────────────────────────────────────────────────
  if (mobileSheetMode) {
    return showLayer ? LayerContent() : AVAContent();
  }

  return (
    <div style={{
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 80px)',
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(255,255,255,0.15) transparent',
    }}>
      {showLayer ? LayerContent() : AVAContent()}
    </div>
  );
};

export default InfoPanel;
