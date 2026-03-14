import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/ava-list-panel.css';

/**
 * Build a hierarchy from a flat list of AVA features.
 *
 * Strategy — "deepest ancestor in this state":
 *   For each AVA, split its `within` field (pipe-delimited) to get all
 *   declared parents. Keep only those that also exist in this state's
 *   feature set. Among those, pick the one that itself has a parent in
 *   the set (i.e. is deeper in the tree). If there's still a tie, use
 *   the last entry in the `within` string (TTB lists most-specific last).
 *
 * Returns an array of top-level nodes, each with a `children` array.
 * Top-level = AVAs whose canonical parent is null (no `within`, or all
 * declared parents are outside this state).
 */
function buildHierarchy(features) {
  const nameSet = new Set(features.map(f => f.properties.name));

  // For each feature, resolve canonical parent (deepest in-state ancestor)
  const canonicalParent = new Map(); // name → parent name | null
  for (const f of features) {
    const raw = f.properties.within;
    if (!raw) { canonicalParent.set(f.properties.name, null); continue; }

    const candidates = raw.split('|').map(s => s.trim()).filter(s => nameSet.has(s));
    if (candidates.length === 0) { canonicalParent.set(f.properties.name, null); continue; }

    // Prefer the candidate that itself has a parent in the set (more specific)
    // If multiple, take the last one in the pipe list (TTB convention: most specific last)
    // Simple heuristic: pick the candidate whose own `within` has in-state matches
    let best = candidates[candidates.length - 1];
    for (const c of candidates) {
      const parentFeature = features.find(g => g.properties.name === c);
      if (!parentFeature) continue;
      const parentWithin = parentFeature.properties.within;
      if (parentWithin) {
        const parentCandidates = parentWithin.split('|').map(s => s.trim()).filter(s => nameSet.has(s));
        if (parentCandidates.length > 0) { best = c; break; }
      }
    }
    canonicalParent.set(f.properties.name, best);
  }

  // Build children map
  const childrenOf = new Map(); // parent name → child features[]
  for (const f of features) {
    const p = canonicalParent.get(f.properties.name);
    if (p) {
      if (!childrenOf.has(p)) childrenOf.set(p, []);
      childrenOf.get(p).push(f);
    }
  }

  // Sort helper
  const byName = (a, b) => (a.properties.name || '').localeCompare(b.properties.name || '');

  // Build tree nodes recursively
  const buildNode = (f, depth) => ({
    feature: f,
    depth,
    hasChildren: childrenOf.has(f.properties.name),
    children: (childrenOf.get(f.properties.name) || [])
      .sort(byName)
      .map(child => buildNode(child, depth + 1)),
  });

  // Top-level = no canonical parent
  const roots = features
    .filter(f => canonicalParent.get(f.properties.name) === null)
    .sort(byName)
    .map(f => buildNode(f, 0));

  return roots;
}

/** Flatten a tree into a depth-annotated list for rendering */
function flattenTree(nodes) {
  const result = [];
  const walk = (nodes) => {
    for (const node of nodes) {
      result.push(node);
      walk(node.children);
    }
  };
  walk(nodes);
  return result;
}

/**
 * AVA List Panel Component
 * Displays hierarchical list of AVAs (parent → sub-AVA tree) with
 * bi-directional hover interaction with the map.
 */
const AVAListPanel = ({ avaData, stateName, onAVAHover }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  if (!avaData || !avaData.features) return null;

  const features = avaData.features;

  // Build hierarchy once per render (features list is stable per page load)
  const tree = buildHierarchy(features);
  const flatTree = flattenTree(tree);

  // Total count always reflects all AVAs in this state
  const totalCount = features.length;

  // When searching, flatten back to a simple alphabetical list
  const isSearching = searchTerm.trim().length > 0;
  const searchResults = isSearching
    ? [...features]
        .sort((a, b) => (a.properties.name || '').localeCompare(b.properties.name || ''))
        .filter(f => f.properties.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : null;

  const handleAVAClick = (avaName) => {
    const avaSlug = avaName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/${stateName}/${avaSlug}`);
  };

  const handleMouseEnter = (avaName) => { if (onAVAHover) onAVAHover(avaName, true); };
  const handleMouseLeave = (avaName) => { if (onAVAHover) onAVAHover(avaName, false); };

  // Indent constants
  const INDENT_PX = 14;

  const renderTreeItem = (node) => {
    const { feature, depth, hasChildren } = node;
    const name = feature.properties.name;
    const indent = depth * INDENT_PX;
    const isTopLevel = depth === 0;

    return (
      <div
        key={name}
        className="ava-list-item"
        style={{ paddingLeft: `${18 + indent}px` }}
        onClick={() => handleAVAClick(name)}
        onMouseEnter={() => handleMouseEnter(name)}
        onMouseLeave={() => handleMouseLeave(name)}
      >
        {/* Sub-AVA left connector line */}
        {depth > 0 && (
          <span style={{
            display: 'inline-block',
            width: '10px',
            flexShrink: 0,
            marginRight: '5px',
            color: 'rgba(255,255,255,0.2)',
            fontSize: '11px',
            lineHeight: 1,
            userSelect: 'none',
          }}>└</span>
        )}

        <span className="ava-list-item-name">
          {name}
        </span>

        <span className="ava-list-item-arrow">→</span>
      </div>
    );
  };

  const renderSearchItem = (feature, index) => {
    const name = feature.properties.name;
    return (
      <div
        key={index}
        className="ava-list-item"
        onClick={() => handleAVAClick(name)}
        onMouseEnter={() => handleMouseEnter(name)}
        onMouseLeave={() => handleMouseLeave(name)}
      >
        <span className="ava-list-item-name">{name}</span>
        <span className="ava-list-item-arrow">→</span>
      </div>
    );
  };

  return (
    <div className={`ava-list-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="ava-list-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <button
          className="ava-list-toggle"
          aria-label={isCollapsed ? 'Expand AVA list' : 'Collapse AVA list'}
        >
          <span className={`toggle-arrow ${isCollapsed ? '' : 'expanded'}`}>▶</span>
        </button>
        <h3 className="ava-list-title">
          AVAs
          <span className="ava-count">({totalCount})</span>
        </h3>
      </div>

      {!isCollapsed && (
        <div className="ava-list-content">
          {features.length > 5 && (
            <div className="ava-search">
              <input
                type="text"
                className="ava-search-input"
                placeholder="Search AVAs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="ava-search-clear"
                  onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
                  aria-label="Clear search"
                >×</button>
              )}
            </div>
          )}

          <div className="ava-list-items">
            {isSearching ? (
              searchResults.length > 0
                ? searchResults.map(renderSearchItem)
                : <div className="ava-list-empty">No AVAs match "{searchTerm}"</div>
            ) : (
              flatTree.map(renderTreeItem)
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AVAListPanel;
