import type { Request, Response } from "express";

const express = require("express");
const app = express();
app.use(express.json());

app.get("/health", (req: Request, res: Response) => res.json({ status: "ok", service: "auth" }));

app.listen(3001, () => console.log("Auth service running on :3001"));