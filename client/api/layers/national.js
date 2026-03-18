// GET /api/layers/national  — returns empty list (layers are managed client-side)
export default function handler(req, res) {
  res.json({ layers: [] });
}
