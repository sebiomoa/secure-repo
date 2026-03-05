#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");
const FREE_DIR = path.join(TEMPLATES_DIR, "free");

// TODO: Replace with your actual Gumroad product ID after creating the product
const GUMROAD_PRODUCT_ID = "secure-repo-pro";

const PRO_ZIP_URL = "https://github.com/sebiomoa/secure-repo/releases/latest/download/secure-repo-pro.zip";

const args = process.argv.slice(2);
const command = args[0];

// Files that a secure repo should have
const RECOMMENDED_FILES = [
  { file: "SECURITY.md", category: "security", severity: "high" },
  { file: "AUTH.md", category: "security", severity: "high" },
  { file: "API.md", category: "security", severity: "high" },
  { file: "DATABASE.md", category: "security", severity: "medium" },
  { file: "DEPLOYMENT.md", category: "operations", severity: "medium" },
  { file: "INCIDENT_RESPONSE.md", category: "operations", severity: "medium" },
  { file: "ENV_VARIABLES.md", category: "security", severity: "high" },
  { file: "CONTRIBUTING.md", category: "process", severity: "low" },
];

// Known dangerous patterns to scan for
const DANGER_PATTERNS = [
  { pattern: /sk_live_[a-zA-Z0-9]+/, label: "Stripe live secret key" },
  { pattern: /sk_test_[a-zA-Z0-9]+/, label: "Stripe test secret key" },
  { pattern: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+/, label: "JWT token" },
  { pattern: /SUPABASE_SERVICE_ROLE_KEY/, label: "Supabase service role key reference" },
  { pattern: /password\s*[:=]\s*['"][^'"]+['"]/, label: "Hardcoded password" },
  { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/, label: "Hardcoded API key" },
];

function printHelp() {
  console.log(`
  secure-repo - Production-grade security standards for your repo

  Usage:
    npx secure-repo init              Add free security templates
    npx secure-repo init --key <key>  Add free + pro templates (requires license key)
    npx secure-repo audit             Scan your repo for security issues
    npx secure-repo import <file>     Import pro templates from a zip file (offline)
    npx secure-repo check             Check which templates are outdated
    npx secure-repo list              Show available free templates

  Options:
    --key      Your Gumroad license key (from purchase)
    --force    Overwrite existing files
    --output   Output directory (default: current directory)

  Free templates (always included):
    SECURITY.md   Secrets management, attack surface, enforced architecture
    AUTH.md        Token handling, session rules, password policy, roles
    API.md         Input validation, rate limiting, error handling

  Pro templates (purchase at https://sebiomoa.gumroad.com):
    30 additional files — templates, audit checklist, stack presets, examples
    Install with: npx secure-repo init --key <your-license-key>
  `);
}

function listTemplates() {
  console.log("\n  Free templates (included):\n");
  if (fs.existsSync(FREE_DIR)) {
    fs.readdirSync(FREE_DIR).forEach((f) => console.log(`    ${f}`));
  }

  console.log("\n  Pro templates (sold separately):\n");
  const proFiles = [
    "DATABASE.md", "DEPLOYMENT.md", "INCIDENT_RESPONSE.md", "OBSERVABILITY.md",
    "TESTING.md", "ENV_VARIABLES.md", "PAYMENTS.md", "DATA_PRIVACY.md",
    "FILE_UPLOADS.md", "RATE_LIMITING.md", "THIRD_PARTY.md", "ACCESS_CONTROL.md",
    "LOGGING_PII.md", "PR_CHECKLIST.md", "THREAT_MODEL.md",
    "VULNERABILITY_REPORTING.md", "CONTRIBUTING_SECURITY.md", "POLICY_INDEX.md",
  ];
  proFiles.forEach((f) => console.log(`    ${f}`));

  console.log("\n  Premium:\n");
  console.log("    FULL_AUDIT_CHECKLIST.md (100+ point security audit)");

  console.log("\n  Stack presets:\n");
  console.log("    supabase/  (6 files)");
  console.log("    firebase/  (3 files)");

  console.log("\n  Code examples:\n");
  console.log("    next-route-handler.ts, rate-limit.ts, zod-validate.ts");
  console.log("    supabase-rls.sql, firebase-rules.txt");

  console.log("\n  Get pro: https://sebiomoa.gumroad.com\n");
}

function getArg(flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

function copyFiles(srcDir, destDir, force) {
  if (!fs.existsSync(srcDir)) return { copied: 0, skipped: 0 };
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir);
  let copied = 0;
  let skipped = 0;

  files.forEach((file) => {
    const srcPath = path.join(srcDir, file);
    if (fs.statSync(srcPath).isDirectory()) return;

    const destPath = path.join(destDir, file);
    if (fs.existsSync(destPath) && !force) {
      console.log(`    [skip] ${file} (use --force to overwrite)`);
      skipped++;
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`    [done] ${file}`);
      copied++;
    }
  });

  return { copied, skipped };
}

// ============================================================
// Gumroad license verification
// ============================================================
function verifyLicense(licenseKey) {
  return new Promise((resolve, reject) => {
    const postData = `product_id=${GUMROAD_PRODUCT_ID}&license_key=${encodeURIComponent(licenseKey)}`;

    const req = https.request(
      {
        hostname: "api.gumroad.com",
        path: "/v2/licenses/verify",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.success) {
              resolve(json);
            } else {
              reject(new Error(json.message || "Invalid license key"));
            }
          } catch {
            reject(new Error("Failed to verify license"));
          }
        });
      }
    );

    req.on("error", (err) => reject(new Error(`Network error: ${err.message}`)));
    req.write(postData);
    req.end();
  });
}

// ============================================================
// Download file from URL
// ============================================================
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    function follow(url) {
      https.get(url, (res) => {
        // Follow redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          follow(res.headers.location);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Download failed (HTTP ${res.statusCode})`));
          return;
        }

        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      }).on("error", (err) => {
        fs.unlink(destPath, () => {});
        reject(new Error(`Download error: ${err.message}`));
      });
    }

    follow(url);
  });
}

// ============================================================
// Extract zip and install pro templates
// ============================================================
function installFromZip(zipPath, outputDir, force) {
  const tempDir = path.join(outputDir, ".secure-repo-temp");

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    execSync(`unzip -o "${zipPath}" -d "${tempDir}"`, { stdio: "pipe" });

    let totalCopied = 0;
    let totalSkipped = 0;

    // Copy pro templates
    const proDir = path.join(tempDir, "pro");
    if (fs.existsSync(proDir)) {
      console.log("\n  Pro templates:");
      const r = copyFiles(proDir, outputDir, force);
      totalCopied += r.copied;
      totalSkipped += r.skipped;
    }

    // Copy premium templates
    const premiumDir = path.join(tempDir, "premium");
    if (fs.existsSync(premiumDir)) {
      console.log("\n  Premium:");
      const r = copyFiles(premiumDir, outputDir, force);
      totalCopied += r.copied;
      totalSkipped += r.skipped;
    }

    // Copy presets
    const presetsDir = path.join(tempDir, "presets");
    if (fs.existsSync(presetsDir)) {
      const presets = fs.readdirSync(presetsDir).filter((f) =>
        fs.statSync(path.join(presetsDir, f)).isDirectory()
      );
      presets.forEach((preset) => {
        const presetDest = path.join(outputDir, `${preset}-preset`);
        console.log(`\n  Preset: ${preset} (-> ${preset}-preset/)`);
        const r = copyFiles(path.join(presetsDir, preset), presetDest, force);
        totalCopied += r.copied;
        totalSkipped += r.skipped;
      });
    }

    // Copy examples
    const examplesDir = path.join(tempDir, "examples");
    if (fs.existsSync(examplesDir)) {
      const examplesDest = path.join(outputDir, "examples");
      console.log("\n  Code examples (-> examples/):");
      const r = copyFiles(examplesDir, examplesDest, force);
      totalCopied += r.copied;
      totalSkipped += r.skipped;
    }

    return { copied: totalCopied, skipped: totalSkipped };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// ============================================================
// INIT — install templates (free, or free + pro with --key)
// ============================================================
async function init() {
  const force = args.includes("--force");
  const outputDir = getArg("--output") || process.cwd();
  const licenseKey = getArg("--key");

  if (licenseKey) {
    // Pro install: verify key, download, extract
    console.log("\n  secure-repo - Installing pro templates\n");
    console.log("  Verifying license key...");

    try {
      await verifyLicense(licenseKey);
      console.log("  License valid!\n");
    } catch (err) {
      console.log(`\n  License verification failed: ${err.message}`);
      console.log("  Purchase at: https://sebiomoa.gumroad.com\n");
      process.exit(1);
    }

    // Install free templates first
    console.log("  Free templates:");
    const freeResult = copyFiles(FREE_DIR, outputDir, force);

    // Download and install pro templates
    const zipPath = path.join(outputDir, ".secure-repo-pro.zip");
    console.log("\n  Downloading pro templates...");

    try {
      await downloadFile(PRO_ZIP_URL, zipPath);
      const proResult = installFromZip(zipPath, outputDir, force);

      const totalCopied = freeResult.copied + proResult.copied;
      const totalSkipped = freeResult.skipped + proResult.skipped;

      console.log(`\n  Done! ${totalCopied} files installed, ${totalSkipped} skipped.`);
      console.log("\n  Next steps:");
      console.log("    1. Customize the templates for your project");
      console.log("    2. Run: npx secure-repo audit");
      console.log();
    } catch (err) {
      console.log(`\n  Download failed: ${err.message}`);
      console.log("  Try offline install: npx secure-repo import <zip-file>\n");
      process.exit(1);
    } finally {
      // Clean up downloaded zip
      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    }
  } else {
    // Free install
    console.log("\n  secure-repo - Adding production standards to your project\n");

    console.log("  Free templates:");
    const result = copyFiles(FREE_DIR, outputDir, force);

    console.log(`\n  Done! ${result.copied} files added, ${result.skipped} skipped.`);
    console.log("\n  Next steps:");
    console.log("    1. Customize the templates for your project");
    console.log("    2. Run: npx secure-repo audit");
    console.log("    3. Get pro templates: npx secure-repo init --key <your-key>");
    console.log("       Purchase at: https://sebiomoa.gumroad.com");
    console.log();
  }
}

// ============================================================
// IMPORT — import pro templates from zip (offline fallback)
// ============================================================
function importPack() {
  const zipPath = args[1];

  if (!zipPath) {
    console.log("\n  Usage: npx secure-repo import <path-to-zip>\n");
    console.log("  Offline alternative to: npx secure-repo init --key <key>");
    console.log("  Get the pro pack at: https://sebiomoa.gumroad.com\n");
    return;
  }

  const resolvedPath = path.resolve(zipPath);

  if (!fs.existsSync(resolvedPath)) {
    console.log(`\n  File not found: ${resolvedPath}\n`);
    process.exit(1);
  }

  const force = args.includes("--force");
  const outputDir = getArg("--output") || process.cwd();

  console.log("\n  secure-repo - Importing pro templates\n");

  // Install free templates too
  console.log("  Free templates:");
  const freeResult = copyFiles(FREE_DIR, outputDir, force);

  try {
    const proResult = installFromZip(resolvedPath, outputDir, force);

    const totalCopied = freeResult.copied + proResult.copied;
    const totalSkipped = freeResult.skipped + proResult.skipped;

    console.log(`\n  Done! ${totalCopied} files imported, ${totalSkipped} skipped.\n`);
  } catch (err) {
    console.log(`\n  Failed to extract zip: ${err.message}\n`);
    process.exit(1);
  }
}

// ============================================================
// AUDIT — scan repo for security issues (the viral command)
// ============================================================
function audit() {
  const targetDir = getArg("--output") || process.cwd();

  console.log("\n  secure-repo audit\n");
  console.log("  Scanning repository for security issues...\n");

  let issues = 0;
  let warnings = 0;
  let passed = 0;

  // --- Check for recommended files ---
  console.log("  Policy files:");
  RECOMMENDED_FILES.forEach(({ file, severity }) => {
    const filePath = path.join(targetDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`    [pass] ${file}`);
      passed++;
    } else if (severity === "high") {
      console.log(`    [FAIL] ${file} — missing (high priority)`);
      issues++;
    } else {
      console.log(`    [warn] ${file} — missing`);
      warnings++;
    }
  });

  // --- Check .gitignore for .env ---
  console.log("\n  Environment files:");
  const gitignorePath = path.join(targetDir, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, "utf8");
    if (gitignore.includes(".env")) {
      console.log("    [pass] .env is in .gitignore");
      passed++;
    } else {
      console.log("    [FAIL] .env is NOT in .gitignore");
      issues++;
    }
  } else {
    console.log("    [FAIL] No .gitignore found");
    issues++;
  }

  // --- Check for committed .env files ---
  const envFiles = [".env", ".env.local", ".env.production"];
  envFiles.forEach((envFile) => {
    const envPath = path.join(targetDir, envFile);
    if (fs.existsSync(envPath)) {
      console.log(`    [FAIL] ${envFile} exists in repo — may contain secrets`);
      issues++;
    }
  });

  // --- Check for .env.example ---
  const envExamplePath = path.join(targetDir, ".env.example");
  if (fs.existsSync(envExamplePath)) {
    console.log("    [pass] .env.example exists");
    passed++;
  } else {
    console.log("    [warn] .env.example missing — document required env vars");
    warnings++;
  }

  // --- Scan for hardcoded secrets in common files ---
  console.log("\n  Secret scanning:");
  const scanExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".env.example"];
  let secretsFound = 0;

  function scanDir(dir, depth) {
    if (depth > 5) return;
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir);
    entries.forEach((entry) => {
      if (entry.startsWith(".") || entry === "node_modules" || entry === ".next" || entry === "bin" || entry === "lib") return;
      const fullPath = path.join(dir, entry);

      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath, depth + 1);
        } else if (scanExtensions.some((ext) => entry.endsWith(ext))) {
          const content = fs.readFileSync(fullPath, "utf8");
          DANGER_PATTERNS.forEach(({ pattern, label }) => {
            if (pattern.test(content)) {
              const relative = path.relative(targetDir, fullPath);
              console.log(`    [FAIL] ${relative} — ${label}`);
              secretsFound++;
              issues++;
            }
          });
        }
      } catch {
        // skip unreadable files
      }
    });
  }

  scanDir(targetDir, 0);

  if (secretsFound === 0) {
    console.log("    [pass] No obvious secrets found in source files");
    passed++;
  }

  // --- Check for HTTPS enforcement (look for http:// in env example) ---
  console.log("\n  Configuration:");
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, "utf8");
    if (envExample.includes("http://") && !envExample.includes("localhost")) {
      console.log("    [warn] .env.example contains http:// URLs (should be https://)");
      warnings++;
    } else {
      console.log("    [pass] No insecure URLs in .env.example");
      passed++;
    }
  }

  // --- Check for package-lock.json or equivalent ---
  const lockFiles = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb"];
  const hasLockFile = lockFiles.some((f) => fs.existsSync(path.join(targetDir, f)));
  if (hasLockFile) {
    console.log("    [pass] Dependency lock file exists");
    passed++;
  } else if (fs.existsSync(path.join(targetDir, "package.json"))) {
    console.log("    [warn] No lock file found — pin your dependencies");
    warnings++;
  }

  // --- Summary ---
  console.log("\n  ────────────────────────────────────");
  console.log(`  Results: ${passed} passed, ${warnings} warnings, ${issues} issues`);
  console.log("  ────────────────────────────────────");

  if (issues > 0) {
    console.log(`\n  ${issues} issue(s) found. Fix these before shipping.`);
    console.log("  Run: npx secure-repo init    (adds missing policy files)");
  } else if (warnings > 0) {
    console.log("\n  No critical issues. Some improvements recommended.");
  } else {
    console.log("\n  Looking good! Your repo meets basic security standards.");
  }

  console.log();
  return issues;
}

// ============================================================
// CHECK — compare local templates against latest version
// ============================================================
function check() {
  const destDir = process.cwd();

  console.log("\n  Checking installed templates...\n");

  if (!fs.existsSync(FREE_DIR)) {
    console.log("  Could not find template source files.\n");
    return;
  }

  fs.readdirSync(FREE_DIR).forEach((file) => {
    const localPath = path.join(destDir, file);
    if (!fs.existsSync(localPath)) {
      console.log(`    [missing] ${file}`);
      return;
    }
    const local = fs.readFileSync(localPath, "utf8");
    const latest = fs.readFileSync(path.join(FREE_DIR, file), "utf8");
    if (local === latest) {
      console.log(`    [current] ${file}`);
    } else {
      console.log(`    [outdated] ${file} — run init --force to update`);
    }
  });

  console.log();
}

// ============================================================
// Main
// ============================================================
switch (command) {
  case "init":
    init();
    break;
  case "audit":
    audit();
    break;
  case "import":
    importPack();
    break;
  case "list":
    listTemplates();
    break;
  case "check":
    check();
    break;
  case "help":
  case "--help":
  case "-h":
    printHelp();
    break;
  default:
    printHelp();
    break;
}
