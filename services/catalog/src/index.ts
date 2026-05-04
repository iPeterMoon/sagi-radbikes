import type { Request, Response } from "express";

const express = require("express");
const app = express();
app.use(express.json());

app.get("/health", (req: Request, res: Response) => res.json({ status: "ok", service: "catalog" }));

app.listen(3002, () => console.log("Catalog service running on :3002"));