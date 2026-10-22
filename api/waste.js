import { db } from "hatchable";

export const access = "member";
export const methods = ["GET", "POST", "DELETE"];

export default async function (req, res) {
  if (req.method === "POST") {
    const b = req.body || {};
    const qty = Number(b.qty), cost = Number(b.cost) || 0;
    if (!b.day || !b.item || !(qty > 0)) return res.status(400).json({ error: "day, item and qty are required" });
    const { rows } = await db.query(
      "INSERT INTO waste_log (day, item, qty, reason, cost) VALUES ($1::date, $2, $3, $4, $5) RETURNING id",
      [b.day, String(b.item).slice(0, 120), qty, String(b.reason || "").slice(0, 200), cost]
    );
    return res.json({ ok: true, id: rows[0].id });
  }
  if (req.method === "DELETE") {
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ error: "id is required" });
    await db.query("DELETE FROM waste_log WHERE id = $1::uuid", [id]);
    return res.json({ ok: true });
  }
  const { rows } = await db.query(
    "SELECT id, to_char(day, 'YYYY-MM-DD') AS day, item, qty::float8 AS qty, reason, cost::float8 AS cost FROM waste_log ORDER BY day DESC, created_at DESC LIMIT 200"
  );
  res.json(rows);
}