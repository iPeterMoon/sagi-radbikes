#!/usr/bin/env node
/** Wrapper para ejecutar el smoke test con escrituras habilitadas. */
process.env.SMOKE_WRITE = "1";
await import("./smoke-test.mjs");
