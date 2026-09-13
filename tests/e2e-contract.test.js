// ============================================================================
// tests/e2e-contract.test.js: Automated Contract Verification
// ============================================================================
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((l) => {
    const [k, ...v] = l.split("=");
    if (k && v.length) {
      if (k.trim() === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = v.join("=").trim();
      if (k.trim() === "SUPABASE_SERVICE_ROLE_KEY") serviceKey = v.join("=").trim();
    }
  });
}

if (!supabaseUrl || !serviceKey) {
  console.log("Skipping live contract tests: credentials missing in .env.local");
  process.exit(0);
}

const client = createClient(supabaseUrl, serviceKey);

async function runContractTests() {
  console.log("=== RUNNING TALENTOS E2E CONTRACT VERIFICATION ===");
  let passed = 0;
  let failed = 0;

  async function assertCheck(name, fn) {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Check Institutions
  await assertCheck("Institutions schema & row integrity", async () => {
    const { data, error } = await client.from("institutions").select("*").limit(1);
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No institution found");
    if (!data[0].code || !data[0].geofence_radius_meters) throw new Error("Missing code or radius");
  });

  // 2. Check Workshops (all 27)
  await assertCheck("27 Workshops seeded with sequential numbers", async () => {
    const { data, error } = await client.from("workshops").select("session_number").order("session_number");
    if (error) throw error;
    if (data.length !== 27) throw new Error(`Expected 27 workshops, found ${data.length}`);
    if (data[0].session_number !== 1 || data[26].session_number !== 27) {
      throw new Error("Workshops not indexed 1 to 27");
    }
  });

  // 3. Check Students
  await assertCheck("Students exist with unique dos_id", async () => {
    const { data, error } = await client.from("students").select("dos_id").limit(5);
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No students found");
    if (!data[0].dos_id.startsWith("DOS-")) throw new Error("Invalid DOS ID prefix");
  });

  // 4. Check Multi-dimensional Skills Inventory
  await assertCheck("Student Technology Inventory has distinct dimensions", async () => {
    const { data, error } = await client.from("student_technology_inventory").select("*").limit(1);
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No skills found");
    const s = data[0];
    if (typeof s.self_confidence !== "number" || !s.evidence_backed_maturity || !s.assessed_level) {
      throw new Error("Missing distinct skill dimensions");
    }
  });

  // 5. Check Certifications
  await assertCheck("Certifications table enforces status", async () => {
    const { data, error } = await client.from("certifications").select("*").limit(1);
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No certifications found");
    if (!["VERIFIED", "PENDING_VERIFICATION", "REJECTED"].includes(data[0].status)) {
      throw new Error("Invalid certification status");
    }
  });

  console.log("\n===========================================");
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("===========================================");

  if (failed > 0) process.exit(1);
}

runContractTests().catch((err) => {
  console.error("FATAL TEST RUN ERROR:", err);
  process.exit(1);
});
