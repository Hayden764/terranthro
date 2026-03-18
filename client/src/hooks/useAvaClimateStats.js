import { useState, useEffect } from 'react';

// Use relative URL so Vite's proxy handles it — no CORS issues regardless of dev port
const API_BASE = '';

/**
 * useAvaClimateStats(slug, year)
 *
 * Fetches pre-computed growing-season climate statistics for a single AVA
 * from GET /api/climate/:slug/stats?year=YYYY.
 *
 * Returns:
 *   { stats, loading, error }
 *
 * stats shape (when loaded):
 *   {
 *     gdd_winkler: { mean, min, max, std_dev, p10, p90, unit },
 *     huglin:      { … },
 *     gst:         { … },
 *     ppt:         { … },
 *   }
 */
export function useAvaClimateStats(slug, year = 2025) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!slug) {
      setStats(null);
      return;
    }

    let cancelled = false;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/api/climate/${slug}/stats?year=${year}`);

        if (!res.ok) {
          if (res.status === 404) {
            // No stats yet for this AVA — not an error, just no data
            setStats(null);
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
          return;
        }

        const json = await res.json();
        if (!cancelled) setStats(json.stats ?? null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    return () => { cancelled = true; };
  }, [slug, year]);

  return { stats, loading, error };
}
