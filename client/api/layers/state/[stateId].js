// GET /api/layers/state/[stateId]  — returns empty list (layers are managed client-side)
export default function handler(req, res) {
  res.json({ state_id: req.query.stateId, layers: [] });
}
