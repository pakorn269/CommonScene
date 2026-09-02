# CommonScene — Friction Log

Record every meaningful Amazon or AWS tooling issue encountered during
development. One entry per issue. Do not include credentials, personal
information, or sensitive paths.

See the template in `MVP-PHASE-PLAN.md § Friction Log Template`.

---

<!-- Entries are added chronologically. Most recent at the bottom. -->

## FL-001 — ESLint v9 flat config incompatible with some React Native tooling

**Date:** 2026-09-01\
**Tool or SDK:** ESLint v9, `@typescript-eslint`\
**Task attempted:** Configure root ESLint to lint all TypeScript workspaces\
**Environment:** Windows 11, Node 20 LTS\
**Steps taken:**

1. Installed ESLint v9 with `@eslint/js` and `@typescript-eslint/eslint-plugin`.
2. Created `eslint.config.js` (flat config format).
3. Noted that React Native's community ESLint config
   (`@react-native/eslint-config`) does not yet support ESLint v9 flat config
   format.

**Expected result:** Single ESLint config lint all workspaces\
**Actual result:** `apps/tv` will require a separate `.eslintrc` or a
compatibility shim when React Native dependencies are added in Phase 1\
**Severity:** Low\
**Workaround:** Excluded `apps/tv` from the flat config until Phase 1 resolves
the RN toolchain version. Added note in `apps/tv/tsconfig.json`.\
**Time lost:** ~20 minutes\
**Suggested improvement:** React Native team should publish an ESLint
v9-compatible config package.\
**Evidence:** N/A — anticipated friction based on known ecosystem status.

---

## FL-002 — TypeScript composite project references do not accept noEmit

**Date:** 2026-09-01\
**Tool or SDK:** TypeScript 5.5, `tsc --build`\
**Task attempted:** Configure a root `tsconfig.json` with project references spanning
both emitting packages and noEmit app bundles\
**Environment:** Windows 11, Node 20 LTS\
**Steps taken:**

1. Created root `tsconfig.json` with `"files": []` and `"references"` to all
   workspaces.
2. Ran `tsc --build --noEmit`.
3. Received `TS6310: Referenced project may not disable emit` for every
   composite package (packages, services, infrastructure).
4. Received `TS6059: File is not under rootDir` for apps/mobile and apps/tv
   because `rootDir: ./src` inherited from the base was resolved relative to
   the base file path, not the consuming tsconfig.

**Expected result:** Single `tsc --build --noEmit` validates all workspaces\
**Actual result:** Composite projects cannot be referenced if `noEmit` is
set at the command level; app bundles that use `noEmit` cannot be composite
project references\
**Severity:** Low\
**Workaround:**

- Removed `rootDir`/`outDir`/`declaration` from `tsconfig.base.json`;
  each emitting package declares them explicitly.
- Removed `apps/mobile` and `apps/tv` from root project references.
- Updated `typecheck` script to `tsc --build && tsc -p apps/mobile/tsconfig.json --noEmit && tsc -p apps/tv/tsconfig.json --noEmit`.\

**Time lost:** ~25 minutes\
**Suggested improvement:** TypeScript could provide clearer guidance on mixing
composite and noEmit projects in a monorepo via `--build`.\
**Evidence:** Error outputs documented above.

---

## FL-003 — Vega Developer Tools do not support Windows or WSL

**Date:** 2026-09-01\
**Tool or SDK:** Vega Developer Tools (VDT), Vega Virtual Device (VVD)\
**Task attempted:** Install VDT and start the Vega Virtual Device on the
primary development machine (Windows 11)\
**Environment:** Windows 11, Node 20 LTS\
**Steps taken:**

1. Reviewed official Vega OS documentation.
2. Confirmed supported host operating systems: macOS 10.15+ and Ubuntu
   20.04 / 22.04 / 24.04.
3. Confirmed that Windows and WSL are explicitly **not supported** by Amazon.
4. Noted that nested virtualisation (running VVD inside a Hyper-V VM) may
   also be unreliable due to hardware virtualisation being consumed by the
   host hypervisor.

**Expected result:** VDT installs and VVD starts on Windows 11\
**Actual result:** VDT installer script requires Linux; running inside WSL 2
Ubuntu 24.04 with native KVM nested virtualization resolved the blocker\
**Severity:** Low (Resolved)\
**Workaround:** Use WSL 2 on Windows 11 with Ubuntu 24.04 LTS. Linux Kernel
6.6 provides `/dev/kvm` hardware virtualization out-of-the-box.\
**Time lost:** ~30 minutes of research\
**Suggested improvement:** Amazon should document WSL 2 with WSLg and KVM
as a supported Windows development setup in official docs.\
**Evidence:** `kvm-ok` confirms KVM acceleration; VVD running as `emulator-5554`.

---

## FL-004 — Package digest mismatch when running `vpt pack` on Windows 9p filesystem

**Date:** 2026-09-02\
**Tool or SDK:** Vega Packaging Tool (`vpt`), `vpm`\
**Task attempted:** Package and install `tv_x86_64.vpkg` built on `/mnt/c` mount\
**Environment:** WSL 2 (Ubuntu 24.04) mounting Windows NTFS `/mnt/c`\
**Steps taken:**

1. Built React Native for Vega app via `npx react-native build-vega`.
2. Attempted `vpm install /tmp/tv_x86_64.vpkg` on VirtualDevice.
3. `vpm` rejected package with `error (Package digest mismatch)`.

**Expected result:** Package installs on device\
**Actual result:** Package digest check failed due to NTFS/9p file metadata\
**Severity:** Medium\
**Workaround:** Stage build artifacts in native Linux ext4 filesystem (e.g.
`/tmp/tv_stage`) before invoking `vpt pack`.\
**Time lost:** ~15 minutes\
**Suggested improvement:** `vpt pack` should normalize file permissions and
timestamps across filesystem types when computing SHA-384 digests.\
**Evidence:** Staged ext4 `.vpkg` installs with `...success`.

---

## FL-005 — Vega SDK missing `libjpeg62` runtime dependency on Ubuntu 24.04

**Date:** 2026-09-02\
**Tool or SDK:** Vega SDK (`0.24.9914`), `KeplerPerfCLI`\
**Task attempted:** Pre-warm dependencies during `vega sdk install`\
**Environment:** Ubuntu 24.04 LTS (noble)\
**Steps taken:**

1. Executed `vega sdk install --non-interactive`.
2. Python pre-warm logged `ImportError: libjpeg.so.62: cannot open shared object file`.

**Expected result:** Clean SDK installation without missing library warnings\
**Actual result:** `libjpeg.so.62` missing on fresh Ubuntu 24.04 image\
**Severity:** Low\
**Workaround:** Run `sudo apt install -y libjpeg62` before SDK installation.\
**Time lost:** ~5 minutes\
**Suggested improvement:** Amazon SDK installer should check for `libjpeg62` in
prerequisite check (`_001_check_prereqs`).\
**Evidence:** `apt install libjpeg62` resolves the import error.

---

## FL-006 — Fastify CORS preflight reflection with mobile PWA dev server

**Date:** 2026-09-02\
**Tool or SDK:** `@fastify/cors` 9.x, Fastify 4.x\
**Task attempted:** Connect Vite Mobile PWA (`http://localhost:5173`) to Fastify API server (`http://localhost:3001`)\
**Environment:** Windows 11, Node 20 LTS, Vite 5.4\
**Steps taken:**

1. Mobile PWA sent `POST /api/v1/rooms/:code/participants` with `Content-Type: application/json`.
2. Browser triggered an `OPTIONS` preflight request.
3. Fastify `@fastify/cors` plugin with `origin: true` required dynamic callback reflection and explicit preflight headers to handle all Vite local dev ports.

**Expected result:** Browser preflight passes with 204 status and `Access-Control-Allow-Origin`\
**Actual result:** Dynamic origin callback reflection with `credentials: true` and explicit `allowedHeaders` resolves all cross-origin requests cleanly\
**Severity:** Low\
**Workaround:** Configured `origin: (_origin, cb) => cb(null, true)` with explicit allowed methods and headers in `services/api/src/server.ts`.\
**Time lost:** ~10 minutes\
**Suggested improvement:** Document standard multi-port full-stack CORS setup in Fastify TypeScript template.\
**Evidence:** Browser automated tests verified `Preflight Status: 204` with full request roundtrips.
