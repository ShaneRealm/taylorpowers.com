#!/usr/bin/env node
// The docs harness: checks a repository's documentation against its code, every commit and every push,
// so the docs stay true without waiting for the daily audit. It finds three kinds of drift:
//   stale    — the docs name something that's gone: a file path, a function, an npm script, a link target
//   missing  — the code has something the docs never mention: a source file, an npm script, a rule's values
//   outdated — required docs absent, a doc with no "Last verified" line or one far older than the code,
//              a released version the CHANGELOG doesn't have
// Repository rules in docs/harness.json add checks of their own (forbid, require, mirror); the daily audit
// adds a rule whenever it catches by hand a drift this missed, so the harness learns.
//
// Reference copy: handbook/tools/docs-harness/docs-check.mjs. Every repository's scripts/docs-check.mjs is
// a byte-identical copy (handbook/tools/docs-harness/sync.sh). Plain Node, no dependencies.
//
//   node scripts/docs-check.mjs            report; exit 1 on errors when docs/harness.json says "enforce"
//   node scripts/docs-check.mjs --json     the findings as JSON
//   node scripts/docs-check.mjs --record   also record when each rule last fired (docs/harness-stats.json)
//   node scripts/docs-check.mjs --root DIR check another repository
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, statSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, basename, resolve, relative } from "node:path";

export const VERSION = "1.5.0";
// A file exists only with this exact spelling: macOS matches "docs/architecture.md" for "docs/ARCHITECTURE.md",
// Linux (CI) doesn't, so the check would pass here and fail in GitHub Actions
export function existsExact(root, rel) {
  let dir = root;
  for (const part of rel.replace(/\/$/, "").split("/").filter((x) => x && x !== ".")) {
    if (part === "..") { dir = dirname(dir); continue; }
    let names; try { names = readdirSync(dir); } catch { return false; }
    if (!names.includes(part)) return false;
    dir = join(dir, part);
  }
  return true;
}

const DEFAULTS = {
  mode: "warn",
  /** Docs every repository has (handbook STANDARDS §1); "migrations": true adds docs/MIGRATIONS.md. */
  required: ["README.md", "AGENTS.md", "CLAUDE.md", "CHANGELOG.md", "docs/README.md", "docs/GOALS.md", "docs/ARCHITECTURE.md", "docs/IMPLEMENTATION.md", "docs/USER-GUIDE.md", "docs/OPERATIONS.md", "docs/AUDIT-LOG.md"],
  migrations: false,
  /** The documentation the checks read. */
  docs: ["README.md", "AGENTS.md", "CHANGELOG.md", "docs/**/*.md"],
  /** Docs that must carry "> Last verified against the code: YYYY-MM-DD". */
  verified: ["AGENTS.md", "docs/*.md"],
  /** Logs are history, not claims about now: no "Last verified" line, no path checks. */
  logs: ["docs/AUDIT-LOG.md", "docs/RELEASE-LOG.md", "docs/INCIDENTS.md"],
  /** The code every file of which the docs must mention (by path, name or a folder above it). */
  source: ["**/*.{ts,tsx,js,mjs,cjs,jsx,go,py,rs,sql,sh,vue,svelte}"],
  ignore: ["node_modules/**", "dist/**", "build/**", "release/**", "**/*.d.ts", "**/*.min.js", "docs/**", ".github/**", "**/vendor/**", "**/*.test.*", "test/**", "tests/**", "scripts/docs-check.mjs"],
  /** Docs about the reader's own files (a CLI's user guide): their paths aren't checked. */
  readerDocs: [],
  /** Paths the docs may name that aren't in the repository (built output, other machines). */
  external: ["dist/**", "release/**", "node_modules/**", "~/**", "/**"],
  /** Names in `name()` form the docs may use that aren't defined here (browser and library APIs). */
  knownCalls: ["fetch", "normalize", "fork", "spawn", "exec", "getAnimations", "brightness", "blur", "calc", "clamp", "minmax", "repeat", "var", "url", "env", "attr", "fit-content", "rgba", "translate", "rotate", "scale", "matchMedia", "requestAnimationFrame", "setTimeout", "setInterval", "structuredClone", "postMessage", "addEventListener", "querySelector", "getContext", "toFixed", "parseInt", "encodeURIComponent", "decodeURIComponent", "stringify", "randomUUID", "digest", "waitUntil", "prepare", "bind", "first", "require", "import", "describe", "expect", "assert"],
  /** Env vars and bindings the docs needn't list (the shell's, CI's, the platform's, shared tools'). */
  configExcept: ["PATH", "HOME", "SHELL", "USER", "PWD", "TMPDIR", "NODE_ENV", "CI", "NO_COLOR", "FORCE_COLOR", "TERM", "ANATOMY_KIT", "GITHUB_TOKEN", "GITHUB_SHA", "GITHUB_REF", "CF_PAGES", "CF_PAGES_BRANCH", "CF_PAGES_COMMIT_SHA", "CF_PAGES_URL", "CF_VERSION", "CF_VERSION_METADATA", "RUNNER_TEMP", "VITEST", "DEBUG"],
  /** How much older than the latest code change a "Last verified" date may be. */
  maxAgeDays: 14,
  rules: [],
};

// ---------- files ----------
function git(root, args) { try { return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 << 20 }); } catch { return ""; } }
function globRe(g) {
  let re = "", i = 0;
  while (i < g.length) {
    const c = g[i];
    if (c === "*" && g[i + 1] === "*") { re += g[i + 2] === "/" ? "(?:.*/)?" : ".*"; i += g[i + 2] === "/" ? 3 : 2; continue; }
    if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else if (c === "{") { const j = g.indexOf("}", i); re += `(?:${g.slice(i + 1, j).split(",").map((s) => s.replace(/[.+^$()|[\]\\]/g, "\\$&")).join("|")})`; i = j; }
    else re += c.replace(/[.+^$()|[\]\\]/g, "\\$&");
    i++;
  }
  return new RegExp(`^${re}$`);
}
const matcher = (globs) => { const res = globs.map(globRe); return (p) => res.some((r) => r.test(p)); };

// ---------- the checks ----------
export function check(rootIn, opts = {}) {
  const root = resolve(rootIn);
  const cfgPath = join(root, "docs/harness.json");
  const user = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, "utf8")) : {};
  const cfg = { ...DEFAULTS, ...user, ignore: [...DEFAULTS.ignore, ...(user.ignore ?? [])], external: [...DEFAULTS.external, ...(user.external ?? [])], knownCalls: [...DEFAULTS.knownCalls, ...(user.knownCalls ?? [])] };
  const tracked = git(root, ["ls-files", "-z"]).split("\0").filter(Boolean).filter((p) => existsSync(join(root, p)));
  const trackedSet = new Set(tracked);
  const dirs = new Set(); for (const p of tracked) { let d = dirname(p); while (d && d !== ".") { dirs.add(d); d = dirname(d); } }
  const findings = [];
  const add = (f) => findings.push({ level: "error", ...f });

  const isDoc = matcher(cfg.docs);
  const docFiles = tracked.filter(isDoc);
  const docs = docFiles.map((p) => ({ path: p, text: readFileSync(join(root, p), "utf8") }));
  const allDocs = docs.map((d) => d.text).join("\n");
  const lineOf = (text, idx) => text.slice(0, idx).split("\n").length;

  // 1. required docs
  for (const r of [...cfg.required, ...(cfg.migrations ? ["docs/MIGRATIONS.md"] : [])]) if (!existsExact(root, r)) add({ check: "required", kind: "outdated", file: r, msg: `${r} is missing (handbook STANDARDS §1)` });
  if (existsSync(join(root, "CLAUDE.md")) && !/@AGENTS\.md/.test(readFileSync(join(root, "CLAUDE.md"), "utf8"))) add({ check: "required", kind: "outdated", file: "CLAUDE.md", msg: "CLAUDE.md doesn't include @AGENTS.md" });

  // 2. "Last verified" lines, and how old they are next to the code
  const isVerified = matcher(cfg.verified);
  const codeTime = Number(git(root, ["log", "-1", "--format=%ct", "--", ".", ":!docs", ":!*.md"]).trim()) || 0;
  const isLog = matcher(cfg.logs ?? []);
  for (const d of docs.filter((x) => isVerified(x.path) && !isLog(x.path))) {
    const m = d.text.split("\n").slice(0, 8).join("\n").match(/^> Last (?:verified against the code|processed): (\d{4}-\d{2}-\d{2})/m);
    if (!m) { add({ check: "verified", kind: "outdated", file: d.path, line: 1, msg: `no "> Last verified against the code: YYYY-MM-DD" line under the title` }); continue; }
    const age = (codeTime * 1000 - Date.parse(m[1])) / 86400000;
    if (codeTime && age > cfg.maxAgeDays) add({ check: "verified", kind: "outdated", level: "warn", file: d.path, line: 1, msg: `last verified ${m[1]}, ${Math.floor(age)} days before the latest code change (allowed ${cfg.maxAgeDays})` });
  }

  // 3. stale paths: `a/path` in the docs that no longer exists
  const isExternal = matcher(cfg.external);
  // what's in git, or what git is told to ignore (.dev.vars, built output: local by design); never just
  // whatever happens to be on this disk, so the check gives the same answer here and in CI
  const ignoredByGit = (p) => { try { execFileSync("git", ["check-ignore", "-q", "--no-index", p], { cwd: root, stdio: "ignore" }); return true; } catch { return false; } };
  const exists = (p) => trackedSet.has(p) || dirs.has(p.replace(/\/$/, "")) || ignoredByGit(p);
  const top = new Set(tracked.map((p) => p.split("/")[0]));
  const isReaderDoc = matcher(cfg.readerDocs ?? []); // guides about the reader's own files: their paths aren't this repository's
  const history = (p) => p === "CHANGELOG.md" || /AUDIT-LOG\.md$|RELEASE-LOG\.md$|LOG\.md$/.test(p); // what was true then
  const bareExt = /\.(ts|tsx|mjs|cjs|go|sql|sh)$/;
  const fileExt = /\.(ts|tsx|js|jsx|mjs|cjs|json|jsonc|toml|ya?ml|md|sql|sh|go|mod|sum|py|rs|css|html|svg|png|jpe?g|webp|ico|txt|wasm|lock|vue|svelte|plist|cjs|env)$/i;
  const placeholder = /(^|[/_.-])(N+|name|Name|NAME|thing|Thing|x{3,}|X{3,}|example|your-\w+|<[^>]+>)([/_.-]|$)|\dN+_|N{2,}/;
  // sibling repositories on this computer (~/Strange/*): a path into one of them is checked there; in CI, where
  // there are none, such a path is left alone
  const parent = dirname(root);
  let siblings = [];
  try { siblings = execFileSync("ls", ["-1", parent], { encoding: "utf8" }).split("\n").filter((n) => n && n !== basename(root) && existsSync(join(parent, n, ".git"))); } catch { /* none */ }
  const inSibling = (t) => siblings.some((n) => existsSync(join(parent, n, t)) || (t.startsWith(n + "/") && existsSync(join(parent, t))));
  for (const d of docs) {
    if (!history(d.path) && !isReaderDoc(d.path)) for (const m of d.text.matchAll(/`([^`\n]{2,200})`/g)) {
      let t = m[1].trim().replace(/[:#](L?\d+(-\d+)?)$/, "").replace(/#.*$/, "");
      if (!/^[\w.~\-/]+$/.test(t) || t.startsWith("/") || t.startsWith("~") || t.startsWith(".") && !t.startsWith("./") && !t.startsWith("../")) continue; // routes, home paths, extensions
      if (isExternal(t) || /^\d+(\.\d+)+$/.test(t) || placeholder.test(t)) continue;
      const parts = t.replace(/^\.\//, "").split("/");
      const hasExt = fileExt.test(parts[parts.length - 1]);
      if (parts.length === 1) { if (!bareExt.test(t)) continue; } // a bare name: only code files are checked
      else if (parts[0].includes(".") && !parts[0].startsWith(".")) continue; // a domain or a column (github.com/…, table.col/…)
      else if (!hasExt && !top.has(parts[0]) && !t.startsWith("../")) continue; // a MIME type, a package, a prefix: not a path here
      const cands = [t, join(dirname(d.path), t)].map((p) => p.replace(/^\.\//, ""));
      if (cands.some(exists)) continue;
      // a line that says it's absent ("site/og.png is missing"), or that it's an example or the reader's own file
      const lineText = d.text.slice(d.text.lastIndexOf("\n", m.index) + 1, (d.text.indexOf("\n", m.index) + 1 || d.text.length + 1) - 1);
      if (/\b(missing|doesn'?t exist|does not exist|isn'?t there|not (yet )?(there|added|created|made)|no longer|was removed|to do|todo|known gap|e\.g\.|for example|your (own )?(clone|repo|app|project|folder)|in a clone|<clone>)\b/i.test(lineText) || /\b(if|when|unless)\b.{0,80}\bexists?\b/i.test(lineText)) continue;
      const tail = "/" + t.replace(/^\.\//, "").replace(/\/$/, "");
      if (tracked.some((p) => p.endsWith(tail) || ("/" + p).endsWith(tail) || p.startsWith(t.replace(/^\.\//, ""))) || [...dirs].some((x) => ("/" + x).endsWith(tail))) continue; // written relative to a folder (lib/auth.ts under src/)
      // not in one of this repository's folders: another repository's file (checked there when it's on this
      // computer and named by it, `okaylogin/scripts/x.sh`), a bucket key or a URL path: not judged here,
      // so the answer is the same on this computer and in CI
      if (parts.length > 1 && !top.has(parts[0]) && !(siblings.includes(parts[0]) && !inSibling(t))) continue;
      add({ check: "paths", kind: "stale", file: d.path, line: lineOf(d.text, m.index), msg: `names \`${t}\`, which doesn't exist` });
    }
    // 4. links
    for (const m of d.text.matchAll(/\]\(([^)\s]+)\)/g)) {
      const href = m[1];
      if (/^(https?:|mailto:|#|tel:)/.test(href)) continue;
      let target = href.split("#")[0]; try { target = decodeURIComponent(target); } catch { /* as written */ }
      if (target.startsWith("/") || !target) continue; // a route on the site, not a file
      const p = join(dirname(d.path), target);
      if (!existsExact(root, p)) add({ check: "links", kind: "stale", file: d.path, line: lineOf(d.text, m.index), msg: `links to ${href}, which doesn't exist` });
    }
  }

  // 5. source files the docs never mention
  const isSource = matcher(cfg.source), isIgnored = matcher(cfg.ignore);
  const mentioned = (p) => {
    if (allDocs.includes(p)) return true;
    const b = basename(p);
    if (new RegExp(`(^|[\\s\`'"(/])${b.replace(/[.+^$()|[\]\\]/g, "\\$&")}([\\s\`'"),:.]|$)`, "m").test(allDocs)) return true;
    let dd = dirname(p);
    // a folder named on its own (`site/migrations/`) covers what's in it; `src/` inside `src/a.ts` doesn't
    while (dd && dd !== ".") { if (new RegExp(`(^|[\\s\`'"(])${dd.replace(/[.+^$()|[\]\\]/g, "\\$&")}/?(?=[\\s\`'"),|]|$)`, "m").test(allDocs)) return true; dd = dirname(dd); }
    return false;
  };
  for (const p of tracked) if (isSource(p) && !isIgnored(p) && !mentioned(p)) add({ check: "coverage", kind: "missing", file: p, msg: `${p} isn't mentioned in any doc (say what it does in docs/IMPLEMENTATION.md, or ignore it in docs/harness.json)` });

  // 6. npm scripts: every one documented, every documented one real
  // a script another repository has ("run npm run okaypanda in gitpanda.ai"): real if a sibling on this
  // computer has it; in CI, where there are none, a line that names another repository isn't judged
  const siblingScripts = new Set();
  for (const n of siblings) { try { for (const k of Object.keys(JSON.parse(readFileSync(join(parent, n, "package.json"), "utf8")).scripts ?? {})) siblingScripts.add(k); } catch { /* none */ } }
  const inSiblingScripts = (s, text, at) => {
    if (siblings.length) return siblingScripts.has(s);
    const line = text.slice(text.lastIndexOf("\n", at) + 1, text.indexOf("\n", at) === -1 ? undefined : text.indexOf("\n", at));
    return /\b[\w-]+\.(ai|com|co|io|dev|app|net|org)\b|\brepo(sitory)?\b/i.test(line);
  };
  const pkgs = tracked.filter((p) => basename(p) === "package.json" && !p.includes("node_modules"));
  const scripts = new Map();
  for (const p of pkgs) { try { for (const s of Object.keys(JSON.parse(readFileSync(join(root, p), "utf8")).scripts ?? {})) scripts.set(s, p); } catch { /* not JSON */ } }
  if (existsSync(join(root, "package.json"))) {
    const own = Object.keys(JSON.parse(readFileSync(join(root, "package.json"), "utf8")).scripts ?? {});
    for (const s of own) {
      const re = s === "test" || s === "start" ? new RegExp(`npm (run )?${s}\\b`) : new RegExp(`npm run ${s.replace(/[.:+^$()|[\]\\]/g, "\\$&")}(?![\\w:-])`);
      if (!re.test(allDocs)) add({ check: "scripts", kind: "missing", file: "package.json", msg: `the npm script "${s}" isn't documented (README or docs/OPERATIONS.md)` });
    }
  }
  for (const d of docs) for (const m of d.text.matchAll(/npm run ([\w:.-]+)/g)) {
    if (history(d.path)) continue; // the CHANGELOG and the logs may name scripts since removed
    const s = m[1].replace(/[.:]$/, "");
    if (scripts.size && !scripts.has(s) && !inSiblingScripts(s, d.text, m.index)) add({ check: "scripts", kind: "stale", file: d.path, line: lineOf(d.text, m.index), msg: `\`npm run ${s}\` isn't a script in any package.json` });
  }

  // 7. functions the docs name in `name()` form that the code no longer has
  const code = tracked.filter((p) => isSource(p) && !p.includes("node_modules")).map((p) => { try { return readFileSync(join(root, p), "utf8"); } catch { return ""; } }).join("\n");
  const known = new Set(cfg.knownCalls);
  for (const d of docs) {
    if (history(d.path)) continue;
    for (const m of d.text.matchAll(/`(?:[\w$]+\.)*([A-Za-z_$][\w$]{3,})\(([^`]*)\)`/g)) {
      const name = m[1];
      if (known.has(name) || !code || /^(xxx|foo|bar|your|my)/i.test(name)) continue;
      if (!new RegExp(`\\b${name.replace(/\$/g, "\\$")}\\b`).test(code)) add({ check: "names", kind: "stale", file: d.path, line: lineOf(d.text, m.index), msg: `names \`${name}()\`, which isn't in the code` });
    }
  }

  // 8. configuration the docs must name: Worker bindings and vars (wrangler.toml / .jsonc) and every env var or
  // secret the code reads (env.X, process.env.X), so a new secret or binding can't go undocumented
  const except = new Set([...DEFAULTS.configExcept, ...(user.configExcept ?? [])]);
  const cfgVals = new Map(); // name → where it's from
  const note = (v, from) => { if (v && !except.has(v) && !cfgVals.has(v)) cfgVals.set(v, from); };
  for (const p of tracked.filter((x) => /(^|\/)wrangler\.(toml|jsonc?)$/.test(x) && !isIgnored(x))) {
    const t = readFileSync(join(root, p), "utf8");
    for (const m of t.matchAll(/binding"?\s*[:=]\s*"([A-Za-z_][\w]*)"/g)) note(m[1], p);
    if (p.endsWith(".toml")) {
      let inVars = false;
      for (const line of t.split("\n")) {
        const h = line.match(/^\s*\[([^\]]+)\]/); if (h) { inVars = /(^|\.)vars$/.test(h[1].trim()); continue; }
        const k = inVars && line.match(/^\s*([A-Za-z_]\w*)\s*=/); if (k) note(k[1], p);
      }
    } else for (const v of t.matchAll(/"vars"\s*:\s*\{([^}]*)\}/g)) for (const k of v[1].matchAll(/"([A-Za-z_]\w*)"\s*:/g)) note(k[1], p);
  }
  for (const p of tracked.filter((x) => isSource(x) && !isIgnored(x))) {
    let t = ""; try { t = readFileSync(join(root, p), "utf8"); } catch { continue; }
    for (const m of t.matchAll(/(?<!meta\.)\b(?:process\.)?env\.([A-Z][A-Z0-9_]{2,})\b/g)) note(m[1], p);
  }
  for (const [v, from] of cfgVals) if (!new RegExp(`\\b${v}\\b`).test(allDocs)) add({ check: "config", kind: "missing", file: from, msg: `\`${v}\` (a binding, var or env var the code uses) isn't in the docs: say what it is and where it's set (docs/OPERATIONS.md)` });

  // 9. the CHANGELOG has the version package.json says
  if (existsSync(join(root, "package.json")) && existsSync(join(root, "CHANGELOG.md"))) {
    const v = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
    const log = readFileSync(join(root, "CHANGELOG.md"), "utf8");
    if (v && v !== "0.0.0" && !new RegExp(`^## \\[?${v.replace(/\./g, "\\.")}\\b`, "m").test(log)) add({ check: "changelog", kind: "outdated", file: "CHANGELOG.md", msg: `package.json is ${v}, which has no "## ${v}" entry` });
  }

  // 10. the repository's own rules, learned over time
  for (const r of cfg.rules) {
    const scope = r.docs ? docs.filter((d) => matcher(r.docs)(d.path)) : docs;
    const lvl = r.level ?? "error";
    if (r.kind === "forbid") {
      const re = new RegExp(r.pattern, r.flags ?? "g");
      for (const d of scope) for (const m of d.text.matchAll(re)) add({ check: `rule:${r.id}`, kind: "stale", level: lvl, file: d.path, line: lineOf(d.text, m.index), msg: `${r.why} (found "${m[0]}")`, rule: r.id });
    } else if (r.kind === "require") {
      const re = new RegExp(r.pattern, r.flags ?? "m");
      if (!scope.some((d) => re.test(d.text))) add({ check: `rule:${r.id}`, kind: "missing", level: lvl, file: r.docs?.join(", ") ?? "docs", msg: r.why, rule: r.id });
    } else if (r.kind === "mirror") {
      // every value the code has (group 1 of `extract` in `source` files) appears in the docs
      const src = tracked.filter(matcher(r.source));
      const re = new RegExp(r.extract, "g"), skip = new Set(r.except ?? []);
      const text = scope.map((d) => d.text).join("\n");
      const seen = new Set();
      for (const p of src) for (const m of readFileSync(join(root, p), "utf8").matchAll(re)) {
        const v = m[1]; if (!v || skip.has(v) || seen.has(v)) continue; seen.add(v);
        if (!text.includes(v)) add({ check: `rule:${r.id}`, kind: "missing", level: lvl, file: p, msg: `${r.why}: "${v}" isn't in the docs`, rule: r.id });
      }
    }
  }

  if (cfg.mode !== "enforce") for (const f of findings) if (f.level === "error") f.level = "warn";
  return { root, mode: cfg.mode, version: VERSION, findings, rules: cfg.rules.map((r) => r.id) };
}

// ---------- the command ----------
const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const args = process.argv.slice(2);
  const ri = args.indexOf("--root");
  const root = ri >= 0 ? args[ri + 1] : process.cwd();
  const res = check(root);
  if (args.includes("--record")) {
    const p = join(res.root, "docs/harness-stats.json");
    const stats = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : { runs: [], rules: {} };
    const today = new Date().toISOString().slice(0, 10);
    const by = {}; for (const f of res.findings) by[f.check] = (by[f.check] ?? 0) + 1;
    stats.runs = [...(stats.runs ?? []).filter((r) => r.date !== today), { date: today, total: res.findings.length, by }].slice(-120);
    for (const id of res.rules) { const hit = res.findings.some((f) => f.rule === id); stats.rules[id] = { ...(stats.rules[id] ?? { added: today }), lastChecked: today, ...(hit ? { lastHit: today } : {}) }; }
    writeFileSync(p, JSON.stringify(stats, null, 2) + "\n");
  }
  if (args.includes("--json")) { console.log(JSON.stringify(res, null, 2)); }
  else {
    const rel = relative(process.cwd(), res.root) || ".";
    if (!res.findings.length) console.log(`docs harness ${VERSION}: ${rel}: the docs match the code (${res.mode})`);
    else {
      const order = { stale: 0, missing: 1, outdated: 2 };
      for (const f of res.findings.sort((a, b) => order[a.kind] - order[b.kind] || a.file.localeCompare(b.file))) console.log(`${f.level === "error" ? "✖" : "!"} ${f.kind.padEnd(8)} ${f.file}${f.line ? `:${f.line}` : ""}  ${f.msg}  [${f.check}]`);
      const e = res.findings.filter((f) => f.level === "error").length;
      console.log(`\ndocs harness ${VERSION}: ${res.findings.length} finding(s), ${e} error(s), mode ${res.mode}${res.mode === "enforce" ? "" : " (warnings only until docs/harness.json says \"enforce\")"}`);
    }
  }
  process.exit(res.findings.some((f) => f.level === "error") ? 1 : 0);
}
