# CommonScene — Product Feedback

Structured developer feedback for every Amazon and AWS tool, SDK, and API used during the development of CommonScene.

---

## 1. Vega OS & Vega Virtual Device (VVD)

**Date:** 2026-09-02  
**Version tested:** Vega CLI 1.3.4, Vega SDK 0.24.9914 (`vvrp-tv-x64`)  
**Task:** Setting up the Fire TV virtual device simulator and deploying React Native applications.  
**What worked well:**

- The QEMU-based virtual device (`VirtualDevice`) boots rapidly and provides realistic Fire TV hardware simulation.
- `vda` (Vega Debug Adapter) commands provide fast file pushing, shell execution, and lifecycle inspection.
- The QMP management socket enables automated headless UI inspection and remote key event automation (`screendump`, `send-key`).

**What was difficult or unclear:**

- Windows 11 and WSL 2 are marked as unsupported in documentation, despite WSL 2 with Linux 6.6 Kernel and KVM virtualization running VVD flawlessly with hardware acceleration.
- Initial Python pre-warm hooks failed on Ubuntu 24.04 due to missing `libjpeg62`.

**Suggested improvement:**

- Officially document and support WSL 2 + WSLg on Windows 11 with KVM acceleration.
- Include `libjpeg62` in the dependency installer script for Ubuntu 24.04 LTS.

**Priority:** High  
**Would you use this again?** Yes.

---

## 2. Kepler React Native on Vega OS

**Date:** 2026-09-02  
**Version tested:** `@amazon-devices/react-native-kepler` ~4.0.0, React Native 0.83.0, Hermes Engine  
**Task:** Building a 10-screen TV-native interface with directional D-pad focus management.  
**What worked well:**

- Standard React Native components (`View`, `Text`, `Pressable`, `ScrollView`, `BackHandler`) execute with high performance on the Hermes JavaScript engine.
- TV focus management using standard React state (`hasTVPreferredFocus`, `onFocus`, `onBlur`) maps directly to D-pad navigation.
- Release build bundling and Hermes bytecode generation integrate smoothly with `react-native build-vega`.

**What was difficult or unclear:**

- If the root registered component is undefined (e.g. named export instead of default export), the app silently hangs on `LCM_APP_TRANSITION: Creating surfaces` before throwing an ANR after 30 seconds, rather than logging an immediate JavaScript exception to console.

**Suggested improvement:**

- Surface early Hermes bundle execution errors and AppRegistry errors directly in the dev console / CLI during `launch-app`.

**Priority:** Medium  
**Would you use this again?** Yes.

---

## 3. Vega Packaging Tool (`vpt`) & `vpm`

**Date:** 2026-09-02  
**Version tested:** `vpt` 0.24.9914  
**Task:** Packaging React Native release builds into `.vpkg` bundles and installing them on devices.  
**What worked well:**

- `vpt pack` produces compact, digitally signed `.vpkg` packages with manifest validation.
- `vpm install` is fast and provides clear confirmation.

**What was difficult or unclear:**

- Running `vpt pack` directly on a 9p filesystem mount (`/mnt/c` from WSL) produced package digest mismatches due to Windows filesystem metadata. Staging in Linux `ext4` resolved the issue.

**Suggested improvement:**

- Normalize file timestamps and permissions in `vpt pack` regardless of underlying filesystem type.

**Priority:** Medium  
**Would you use this again?** Yes.

---

## 4. Amazon Bedrock Converse API

**Date:** 2026-09-02  
**Version tested:** `@aws-sdk/client-bedrock-runtime` 3.x with Anthropic Claude 3.5 Sonnet & Amazon Nova  
**Task:** Converting free-text user movie preferences into structured JSON and generating natural language group consensus explanations grounded in verified score data.  
**What worked well:**

- The `Converse` API provides a unified, structured interface across foundation models (Anthropic, Amazon Nova).
- Low latency when using low temperature (`0.1` - `0.3`) for deterministic JSON extraction.
- Integrating with Zod schemas ensures strict type safety and prompt grounding.

**What was difficult or unclear:**

- Models occasionally wrap JSON responses in markdown fences (`json ... `). Explicit regex sanitization before `JSON.parse` was required.

**Suggested improvement:**

- Support native JSON Schema / structured output mode in the Bedrock Converse API similar to OpenAI structured outputs.

**Priority:** Low  
**Would you use this again?** Yes.

---

## 5. AWS CDK v2 (`aws-cdk-lib`)

**Date:** 2026-09-02  
**Version tested:** `aws-cdk-lib` 2.154.0  
**Task:** Defining cloud infrastructure for CommonScene (DynamoDB with TTL, S3 + CloudFront PWA hosting, API Gateway, and Bedrock IAM).  
**What worked well:**

- High-level L2 constructs (`cloudfront.Distribution`, `s3.Bucket`, `dynamodb.Table`) enable clean, declarative infrastructure definitions in TypeScript.
- Automatic Origin Access Control (OAC) integration with `S3BucketOrigin.withOriginAccessControl` provides secure S3 bucket access.
- `cdk synth` produces clear, auditable CloudFormation templates.

**What was difficult or unclear:**

- Minor typing friction with `exactOptionalPropertyTypes: true` in strict TypeScript mode when passing `Bucket` to `S3BucketOrigin`.

**Suggested improvement:**

- Update AWS CDK TypeScript definitions to be fully compatible with `exactOptionalPropertyTypes: true`.

**Priority:** Low  
**Would you use this again?** Yes.

---

## Feature Requests

The following are feature requests for Amazon and AWS developer tools used during
this hackathon, ordered by urgency.

### FR-001 — WSL 2 first-class support for Vega Virtual Device

**Tool:** Vega CLI / Vega SDK  
**Urgency:** Critical  
**What:** Official documentation and CI testing for Vega Virtual Device running
inside WSL 2 on Windows 11 with KVM acceleration.  
**Why:** Windows is the most common desktop OS. Many developers use WSL 2 as
their primary Linux environment. VVD runs flawlessly on WSL 2 with KVM, but the
docs say "unsupported," which deters adoption.  
**How it would help:** Eliminates hesitation for the largest developer segment
and reduces friction log entries like FL-002 and FL-003.

### FR-002 — Bedrock Converse API structured JSON output mode

**Tool:** Amazon Bedrock Converse API  
**Urgency:** Important  
**What:** A native `responseFormat: { type: "json_schema", schema: {...} }`
parameter in the Converse API, similar to OpenAI's structured outputs.  
**Why:** Currently, models sometimes wrap JSON in markdown fences or add
preamble text, requiring regex sanitization before `JSON.parse`. A structured
output mode would guarantee valid JSON conforming to a provided schema.  
**How it would help:** Eliminates fragile post-processing and makes Zod
validation a pure safety net rather than a correction layer.

### FR-003 — Kepler React Native surface creation error reporting

**Tool:** `@amazon-devices/react-native-kepler`  
**Urgency:** Important  
**What:** Surface early Hermes bundle execution errors and `AppRegistry`
registration failures directly in the `vda` logs or device console during
`launch-app`.  
**Why:** When the root component is `undefined` (e.g. named export instead of
default export), the app silently hangs on `Creating surfaces` for 30 seconds
before ANR, with no JavaScript error visible.  
**How it would help:** Reduces debugging time from hours to seconds for a common
React Native configuration mistake.

### FR-004 — `vpt pack` cross-filesystem digest normalization

**Tool:** Vega Packaging Tool (`vpt`)  
**Urgency:** Nice-to-have  
**What:** Normalize file permissions, timestamps, and metadata when computing
SHA-384 digests in `vpt pack`, regardless of the underlying filesystem type.  
**Why:** Running `vpt pack` on a 9p mount (`/mnt/c` from WSL) produces digest
mismatches compared to native ext4, forcing developers to stage files in a
separate directory.  
**How it would help:** Eliminates a non-obvious workaround step in the
build-deploy cycle.

### FR-005 — AWS CDK `exactOptionalPropertyTypes` compatibility

**Tool:** `aws-cdk-lib`  
**Urgency:** Nice-to-have  
**What:** Update CDK TypeScript type definitions so that constructs like
`S3BucketOrigin.withOriginAccessControl` compile without casts when
`exactOptionalPropertyTypes: true` is enabled.  
**Why:** Strict TypeScript configurations are increasingly common, and the
workaround (`as unknown as s3.IBucket`) obscures type safety.  
**How it would help:** Better developer experience for teams using the strictest
TypeScript compiler settings.
