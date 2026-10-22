import { db } from "hatchable";

export const access = "member";
export const methods = ["GET", "POST"];

export default async function (req, res) {
  if (req.method === "POST") {
    await db.query(
      "INSERT INTO kv (k, v, updated_at) VALUES ('state', $1::jsonb, now()) ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v, updated_at = now()",
      [JSON.stringify(req.body || {})]
    );
    return res.json({ ok: true });
  }
  const { rows } = await db.query("SELECT v FROM kv WHERE k = 'state'");
  res.json(rows[0] ? rows[0].v : null);
}