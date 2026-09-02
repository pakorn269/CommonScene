# CommonScene — Submission Checklist

Derived from the Build, Ship, Shape: Amazon Developer Hackathon requirements.

---

## 1. Repository Governance & Licensing

- [x] Apache-2.0 license is present as `LICENSE`
- [x] `README.md` includes complete setup instructions for Windows/WSL 2 and Vega OS with logo banner
- [x] `AGENTS.md` is present and details architectural constraints, consensus formula, and safety boundaries
- [x] No secrets, AWS credentials, or private keys are committed
- [x] No copyrighted posters, trailers, logos, or music are included (100% original fictional catalog and project tokens)
- [x] Phase-based Git commit history (8 logical commits) reflecting development progression

## 2. Source Code & Monorepo Architecture

- [x] TV application source is in `apps/tv` (React Native targeting Vega OS runtime)
- [x] Mobile PWA source is in `apps/mobile` (React 19 + Vite PWA)
- [x] API service source is in `services/api` (Fastify REST + WebSocket server)
- [x] Consensus engine source is in `packages/consensus` (Pure deterministic TypeScript algorithm)
- [x] Movie catalog source is in `packages/catalog` (10 original fictional movie entries)
- [x] Shared schemas are in `packages/contracts` (Zod schemas and TypeScript contracts)
- [x] CDK infrastructure is in `infrastructure/cdk` (AWS CDK v2 stack)
- [x] `npm install` passes cleanly across all workspaces
- [x] `npm run lint` passes with 0 errors and 0 warnings
- [x] `npm run typecheck` passes with strict TypeScript checks
- [x] `npm test` passes (33 unit and integration tests)
- [x] `npm run build` succeeds across all packages and apps

## 3. Television Experience (Fire TV Track)

- [x] TV application packaged (`tv_x86_64.vpkg`) and running in Vega Virtual Device simulator (`VirtualDevice` `vvrp-tv-x64`)
- [x] Full 10-screen TV lifecycle implemented: Welcome, Create Room, Lobby, Collecting Preferences, Ranking Progress, Recommendations, Voting, Winner, Demo Mode, and Recoverable Error
- [x] D-pad remote navigation with visual focus indicator (≥3px border and 1.04x scale transform)
- [x] TV-safe margins (5% viewport insets) respected across all screens
- [x] Back button (Escape key / `BackHandler`) handles back navigation without trapping the user
- [x] Multi-participant join via 4-letter room code and QR join URL (`commonscene.tv`)
- [x] Offline 90-second Demo Mode completes in under 90 seconds

## 4. Deterministic Consensus Engine

- [x] Formula: $\text{Score}(m) = 0.45 \cdot \text{Avg}(m) + 0.35 \cdot \text{Min}(m) + 0.20 \cdot \text{Coverage}(m) - \text{Penalty}(m)$
- [x] Hard constraints strictly eliminate invalid movies (runtime, content rating, excluded genres, avoid tags)
- [x] Exactly 3 top consensus recommendations returned with component score breakdowns
- [x] Stable tie-breaking by catalog ID (never random)
- [x] Explanation generation details satisfied genres, moods, and tradeoffs

## 5. Amazon Bedrock AI Integration & Safety Boundaries

- [x] Server-side Bedrock Converse API integration (`services/api/src/ai/bedrock.ts`)
- [x] Natural language preference parsing extracts structured JSON
- [x] AI consensus explanations and group summary grounded strictly in verified score data
- [x] All model outputs validated with Zod schemas (`BedrockPreferenceParseSchema`, `BedrockExplanationSchema`)
- [x] Hard constraints and rankings are never overridden by AI
- [x] 100% reliable zero-error offline fallback when Bedrock is unavailable

## 6. AWS CDK Cloud Infrastructure

- [x] `CommonSceneStack` in `infrastructure/cdk/src/stack.ts`
- [x] Amazon DynamoDB `RoomsTable` with partition key `id`, GSI `code`, and TTL `expiresAt`
- [x] Amazon S3 bucket with CloudFront Distribution and Origin Access Control (OAC)
- [x] Amazon Bedrock IAM least-privilege policies
- [x] Amazon CloudWatch log groups and monitoring metrics
- [x] `cdk synth` produces valid CloudFormation template

## 7. Documentation & Deliverables

- [x] System Architecture documented in `docs/architecture.md`
- [x] Vega OS Setup Guide documented in `docs/phase1-setup.md`
- [x] Friction Log with 6 documented technical entries in `docs/friction-log.md` (eligible for up to 10% judging bonus)
- [x] Structured Product Feedback for 5 tools in `docs/product-feedback.md`
- [x] 5 Feature Requests with urgency ratings in `docs/product-feedback.md`
- [x] Devpost submission draft & timed 2:45 video script in `docs/devpost-submission.md`
- [x] Submission checklist completed in `docs/submission-checklist.md`

## 8. Final Submission Action Items

- [ ] Push local `main` branch to public GitHub repository (`git push -u origin main`)
- [ ] Configure GitHub repository "About" section with description, topics, and Apache-2.0 license tag
- [ ] Record and upload 3-minute demo video to YouTube/Vimeo following `docs/devpost-submission.md`
- [ ] Complete Devpost submission form using `docs/devpost-submission.md` and `docs/product-feedback.md`
