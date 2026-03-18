// GET /api/layers/[avaId]  — returns empty list (layers are managed client-side)
export default function handler(req, res) {
  res.json({ ava_id: req.query.avaId, layers: [] });
}
