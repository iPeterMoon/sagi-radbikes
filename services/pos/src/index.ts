import express from "express";
import type { Request, Response } from "express";

const app = express();
app.use(express.json());

app.get("/health", (req: Request, res: Response) => res.json({ status: "ok", service: "pos" }));

app.listen(3003, () => console.log("POS service running on :3003"));