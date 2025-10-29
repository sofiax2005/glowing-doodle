// backend/src/index.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";

// Load .env variables
dotenv.config();

// Set up app and port
const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.POSTGRES_USER || 'normaldb'}:${process.env.POSTGRES_PASSWORD || 'normaldb_secret'}@localhost:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'normaldb'}`,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Import normalization engine classes
import FunctionalDependency from "./services/normalization/FunctionalDependency.js";
import CandidateKeyFinder from "./services/normalization/CandidateKeyFinder.js";
import NormalFormChecker from "./services/normalization/NormalFormChecker.js";
import SchemaDecomposer from "./services/normalization/SchemaDecomposer.js";

// Normalization API endpoint
app.post("/api/normalize", async (req, res) => {
  try {
    const { data, tableName } = req.body;

    // Step 1: Detect FDs
    const fdDetector = new FunctionalDependency(data);
    const fds = fdDetector.detectAll();

    // Step 2: Find candidate keys
    const attributes = Object.keys(data[0]);
    const keyFinder = new CandidateKeyFinder(attributes, fds);
    const candidateKeys = keyFinder.findCandidateKeys();

    // Step 3: Check normal forms
    const nfChecker = new NormalFormChecker({ tableName, attributes }, fds, candidateKeys);
    const analysis = nfChecker.analyzeAllForms(data);

    // Step 4: Decompose schema
    const decomposer = new SchemaDecomposer({ tableName, attributes }, fds, candidateKeys);
    const normalized = decomposer.normalizeComplete();

    res.json({
      functionalDependencies: fds,
      candidateKeys,
      normalFormAnalysis: analysis,
      normalizedSchemas: normalized,
    });
  } catch (error) {
    console.error("Normalization error:", error);
    res.status(500).json({ error: error.message });
  }
});

// (Optional demo endpoint)
// Test DB connectivity at /dbtest
app.get("/dbtest", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ dbTime: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: "Database not reachable" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 NormalDB Backend running on port ${PORT}`);
  console.log(`📊 PostgreSQL: ${process.env.DATABASE_URL?.split('@')[1] || "localhost"}`);
});

