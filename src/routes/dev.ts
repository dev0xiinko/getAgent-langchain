import { Router, type Request, type Response } from "express";
import { UserMeta } from "../models/UserMeta";

/**
 * DEV-ONLY helpers for the test client. Mounted only when NODE_ENV !== 'production'.
 * Lets the browser client create/update a UserMeta record so auth passes without mongosh.
 */
export const devRouter = Router();

devRouter.post("/seed-user", async (req: Request, res: Response) => {
  const { uid, role = "Member", labels = [], team } = req.body ?? {};
  if (!uid) return res.status(400).json({ error: "uid required" });
  await UserMeta.updateOne(
    { uid },
    { $set: { uid, role, labels: Array.isArray(labels) ? labels : [], team } },
    { upsert: true },
  );
  const user = await UserMeta.findOne({ uid }).lean();
  res.json({ ok: true, user });
});
