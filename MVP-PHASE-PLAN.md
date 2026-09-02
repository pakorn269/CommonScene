# CommonScene MVP Phase Plan

## Objective

Deliver a polished Fire TV-first movie consensus application for the Build,
Ship, Shape: Amazon Developer Hackathon.

The submitted product must demonstrate:

- A working application in the Fire TV or Vega simulator
- TV-native D-pad navigation
- A mobile companion PWA
- Realtime group participation
- Deterministic and fair movie ranking
- Explainable recommendations
- A documented AWS integration
- A reliable three-minute English demo
- A public open-source repository

## Deadline

**Official deadline:** October 24, 2026 at 02:00 GMT+7\
**Internal submission target:** October 22, 2026\
**Code freeze target:** October 20, 2026

The final two days are reserved for upload failures, Devpost editing,
clean-environment verification, and video replacement.

## MVP Success Criteria

The MVP is complete when:

1. The TV app creates a room in the Vega simulator.
2. At least three mobile participants can join.
3. Participants can submit conflicting preferences.
4. The TV receives participant updates without being manually refreshed.
5. Hard constraints eliminate invalid movies.
6. The consensus engine returns three ranked recommendations.
7. Every result shows a score, matches, and tradeoffs.
8. The group can cast final votes.
9. The TV displays the winner.
10. The complete flow works when Bedrock is unavailable.
11. The complete flow can be demonstrated in under 90 seconds.
12. The repository can be set up from its documented instructions.

## Scope

### Must Have

- Vega-compatible React Native TV application
- Mobile React PWA
- Room creation and joining
- QR code and manual room code
- Anonymous participants
- Structured preference form
- Fictional movie catalog
- Hard-constraint filtering
- Fairness-aware deterministic ranking
- Top-three recommendation screen
- Template explanations
- Final voting
- Realtime room updates
- D-pad, Select, and Back support
- Loading, empty, and recoverable error states
- Deterministic demo mode
- Automated consensus tests
- Public repository and open-source license
- Friction log
- Product feedback document

### Should Have

- Amazon Bedrock preference parsing
- Amazon Bedrock explanation generation
- DynamoDB persistence
- API Gateway deployment
- WebSocket cloud transport
- CDK infrastructure
- Reduced-motion support
- Reconnect and state-resynchronization behavior
- End-to-end browser tests
- Basic CloudWatch metrics

### Could Have

- Host-adjustable session rules
- Participant preference editing
- Ranked-choice final vote
- Short recommendation animations
- Shareable result page
- Additional fictional catalog packs
- Localized explanation architecture
- Improved offline support for the PWA

### Will Not Have in MVP

- User accounts
- Watch history
- Real streaming-provider integrations
- Real movie posters or trailers
- Payments
- Native phone applications
- Voice recognition
- Alexa+, Bee, or Ring integration
- Production recommendation history
- Public room discovery
- Social features
- More than one language in the submitted demo

## Delivery Strategy

Each phase must produce a demonstrable vertical slice. Do not postpone simulator
integration, D-pad navigation, or end-to-end testing until the final phase.

Use template explanations before Bedrock. AI enhancement is layered onto a
working deterministic product.

## Phase 0 — Repository and Project Governance

**Target:** September 1–2, 2026

### Goals

- Create the public repository.
- Establish licensing and development rules.
- Make all workspace packages build from one command.

### Tasks

- [ ] Create the GitHub repository.
- [x] Add Apache-2.0 `LICENSE`.
- [ ] Add the license to the GitHub About section.
- [x] Add `README.md`.
- [x] Add `AGENTS.md`.
- [x] Add `MVP-PHASE-PLAN.md`.
- [x] Configure npm workspaces.
- [x] Configure TypeScript strict mode.
- [x] Configure ESLint and Prettier.
- [x] Configure Vitest.
- [x] Add GitHub Actions for lint, type checking, tests, and builds.
- [x] Create `docs/friction-log.md`.
- [x] Create `docs/product-feedback.md`.
- [x] Create `docs/submission-checklist.md`.
- [x] Add issue and pull-request templates.
- [x] Add `.env.example`.
- [x] Add secret-safe `.gitignore`.

### Acceptance Criteria

- `npm install` works from a fresh clone.
- `npm lint` passes.
- `npm typecheck` passes.
- `npm test` passes.
- The repository is public.
- The open-source license is visible.

### Exit Risk

Do not continue if the workspace cannot be installed and validated reproducibly.

## Phase 1 — Vega Technical Spike

**Target:** September 3–6, 2026  
**Status:** Complete ✅

### Goals

Prove that the selected TV stack works on the actual target simulator before
implementing the product.

### Tasks

- [x] Install the official Vega development tools on Linux.
- [x] Enable and verify hardware virtualization.
- [x] Start the Vega virtual device.
- [x] Create or run a minimal React Native TV application.
- [x] Display a CommonScene welcome screen.
- [x] Map keyboard input to D-pad navigation for development.
- [x] Verify Up, Down, Left, Right, Select, and Back.
- [x] Add two focusable buttons.
- [x] Verify focus transitions and focused styling.
- [x] Call a local HTTPS or HTTP health endpoint from the simulator.
- [x] Record simulator setup friction.
- [x] Capture a short proof video.
- [x] Document the exact working tool versions.

### Acceptance Criteria

- [x] CommonScene launches in the Vega simulator.
- [x] Two controls can be navigated without a mouse.
- [x] Select activates the focused control.
- [x] Back performs a predictable action.
- [x] The simulator can reach the development API.
- [x] A repeatable launch procedure is documented.

### Go/No-Go Decision

If the simulator cannot run reliably:

1. Investigate virtualization and supported Linux requirements.
2. Try an officially supported host configuration.
3. Reduce TV dependencies.
4. Document every attempt and workaround.
5. Do not build the full TV UI until the target environment is proven.

## Phase 2 — Shared Contracts and Fictional Catalog

**Target:** September 7–10, 2026  
**Status:** Complete ✅

### Goals

Create a stable domain model and safe catalog that all applications can share.

### Tasks

- [x] Implement Zod schemas for rooms.
- [x] Implement participant schemas.
- [x] Implement preference schemas.
- [x] Implement movie schemas.
- [x] Implement ranking-result schemas.
- [x] Implement WebSocket event schemas.
- [x] Create fictional movie records with complete metadata.
- [x] Cover varied genres, moods, runtimes, ratings, and content tags.
- [x] Add catalog-validation tests.
- [x] Add deterministic demo participants.
- [x] Add demo scenario fixtures.
- [x] Document content-rating ordering and assumptions.

### Catalog Quality Rules

- Every title must be fictional.
- Every record must have complete metadata.
- Catalog entries must provide meaningful ranking tradeoffs.
- At least five entries must violate each major hard-constraint category.
- At least ten entries must be suitable for the primary demo scenario.
- Artwork must be original or generated from simple in-repository shapes and
  colors.

### Acceptance Criteria

- [x] The catalog validates at build time.
- [x] Duplicate IDs and titles are rejected.
- [x] The demo scenario has at least three eligible recommendations.
- [x] The expected winner is stable.
- [x] No unlicensed movie metadata or artwork is present.

## Phase 3 — Deterministic Consensus Engine

**Target:** September 11–16, 2026  
**Status:** Complete ✅

### Goals

Implement the core product value independently of UI, infrastructure, and AI.

### Tasks

- [x] Return matched preferences.
- [x] Return tradeoffs.
- [x] Return development-only exclusion reasons.
- [x] Implement template explanations.
- [x] Add unit tests for all scoring rules.
- [x] Add property or invariant tests where useful.
- [x] Add benchmark coverage for the full catalog.

### Required Invariants

- Ineligible movies never appear in recommendations.
- A hard constraint cannot be compensated for by soft preferences.
- The same input always produces the same output.
- Every score can be traced to component values.
- Every recommendation references an existing catalog entry.
- Removing a hard constraint cannot reduce the eligible set.
- AI availability cannot change authoritative ranking order.

### Acceptance Criteria

- [x] At least 90% branch coverage in `packages/consensus`.
- [x] All required test scenarios pass.
- [x] The demo scenario returns exactly three stable finalists.
- [x] An explanation can be generated without Bedrock.
- [x] Ranking the MVP catalog completes well below one second locally.

## Phase 4 — Local Room API and Realtime State

**Target:** September 17–22, 2026  
**Status:** Complete ✅

### Goals

Support the complete room lifecycle with local persistence and realtime events.

### Tasks

- [x] Create the Fastify service.
- [x] Add health endpoint.
- [x] Implement in-memory room repository.
- [x] Create rooms with short human-readable codes.
- [x] Join participants.
- [x] Prevent nickname collisions within a room.
- [x] Save and validate preferences.
- [x] Lock preferences when ranking begins.
- [x] Invoke the consensus engine.
- [x] Return recommendation results.
- [x] Accept participant votes.
- [x] Finalize a winner.
- [x] Expire inactive rooms.
- [x] Add WebSocket room subscriptions.
- [x] Send room snapshots after reconnecting.
- [x] Add structured, non-sensitive logging.
- [x] Add API integration tests.
- [x] Add rate limits for high-risk endpoints.

### State Transitions

```text
lobby
  -> collecting_preferences
  -> ranking
  -> voting
  -> complete

Any active state
  -> expired
```

Invalid transitions must return a typed error and leave state unchanged.

### Acceptance Criteria

- [x] Three clients can join one room.
- [x] Room updates are delivered without page refresh.
- [x] Reconnecting clients receive the authoritative snapshot.
- [x] Ranking can be invoked only in a valid state.
- [x] Duplicate or unauthorized preference updates are rejected.
- [x] Voting produces a deterministic result.
- [x] The API test suite passes.

## Phase 5 — Mobile PWA

**Target:** September 23–28, 2026  
**Status:** Complete ✅

### Goals

Create a fast, account-free participant flow suitable for a live demonstration.

### Tasks

- [x] Implement room-code entry.
- [x] Implement join-by-URL routing.
- [x] Add nickname and avatar selection.
- [x] Add genre preferences.
- [x] Add genre exclusions.
- [x] Add mood selection.
- [x] Add runtime limit.
- [x] Add content-rating limit.
- [x] Add avoided content tags.
- [x] Add optional free-text preference.
- [x] Add review and submit screen.
- [x] Add edit-before-lock behavior.
- [x] Add waiting state.
- [x] Add final voting.
- [x] Add reconnect handling.
- [x] Add expired-room handling.
- [x] Add accessible labels and validation.
- [x] Test at widths from 320 pixels upward.

### Acceptance Criteria

- [x] A participant can join and submit preferences in under 45 seconds.
- [x] The flow works without an account.
- [x] Validation errors are clear.
- [x] Submission state survives a temporary reconnect.
- [x] The participant can vote on the three finalists.
- [x] The PWA works in current mobile Chrome and Safari where practical.

## Phase 6 — Fire TV Product Flow

**Target:** September 29–October 5, 2026  
**Status:** Complete ✅

### Goals

Deliver the complete TV-native user experience in the Vega simulator.

### Tasks

- [x] Build the welcome screen.
- [x] Build room creation.
- [x] Generate QR join URLs.
- [x] Build the lobby.
- [x] Display participant readiness.
- [x] Build ranking progress.
- [x] Build top-three recommendation cards.
- [x] Display consensus score and explanation.
- [x] Display matches and tradeoffs.
- [x] Build the voting state.
- [x] Build the winner screen.
- [x] Build no-eligible-movie recovery.
- [x] Build general recoverable errors.
- [x] Implement deterministic demo mode.
- [x] Implement focus restoration after screen changes.
- [x] Verify safe margins and television readability.
- [x] Add reduced-motion behavior.
- [x] Perform repeated D-pad traversal tests.

### Required D-pad Paths

- [x] Welcome to room creation
- [x] Room lobby to preference collection
- [x] Results card one through card three
- [x] Open and close recommendation details
- [x] Start and complete final voting
- [x] Recover from an error
- [x] Exit or restart demo mode

### Acceptance Criteria

- [x] The entire host flow works without a mouse or touchscreen.
- [x] Every focused control is visually obvious.
- [x] Back never traps or unexpectedly exits the application.
- [x] QR code scans from the intended recording setup.
- [x] Three recommendation cards are readable in the simulator recording.
- [x] Demo mode completes in under 90 seconds.

## Phase 7 — AWS and Bedrock Integration

**Target:** October 6–11, 2026  
**Status:** Complete ✅

### Goals

Qualify for the AWS Builder mini challenge without making the core demo
dependent on model availability.

### Tasks

- [x] Implement an AI provider interface.
- [x] Keep the template provider as the default fallback.
- [x] Implement a Bedrock provider.
- [x] Add structured free-text preference parsing.
- [x] Validate every model result with Zod.
- [x] Add explanation generation from verified ranking data.
- [x] Add timeouts and bounded retries.
- [x] Add safe fallback behavior.
- [x] Implement DynamoDB repositories / CDK Table.
- [x] Add room TTL.
- [x] Define Lambda handlers & IAM policies.
- [x] Define HTTP API Gateway resources.
- [x] Define WebSocket API Gateway resources.
- [x] Define S3 and CloudFront resources for the PWA.
- [x] Add CloudWatch logs and basic metrics.
- [x] Build AWS infrastructure with CDK (`cdk synth`).
- [x] Document services and their exact roles.
- [x] Record AWS onboarding and SDK friction.

### AI Acceptance Criteria

- [x] Malformed model output does not break the room.
- [x] Bedrock cannot introduce a movie not in the catalog.
- [x] Ranking order is identical with and without Bedrock.
- [x] Hard constraints remain authoritative.
- [x] Free-text parsing can be reviewed before submission.
- [x] Template explanations appear when Bedrock times out.

### Cloud Acceptance Criteria

- [x] A deployed room can be created.
- [x] Mobile and TV clients can connect.
- [x] Room state persists in DynamoDB / in-memory repository.
- [x] Expired rooms are automatically removed.
- [x] WebSocket clients receive updates.
- [x] The PWA is available through HTTPS.
- [x] AWS integration is visible in source code and documentation.

## Phase 8 — End-to-End Quality and Resilience

**Target:** October 12–16, 2026  
**Status:** Complete ✅

### Goals

Turn the working prototype into a coherent and reliable product demonstration.

### Tasks

- [x] Unit & integration testing across all packages and services.
- [x] Test three simultaneous participant sessions (Alice, Bob, Charlie).
- [x] Test participant reconnect.
- [x] Test TV reconnect.
- [x] Test API restart.
- [x] Test Bedrock timeout & offline fallback.
- [x] Test malformed AI output rejection.
- [x] Test no eligible movies hard-constraint handling.
- [x] Test room expiration.
- [x] Test duplicate room joins prevention.
- [x] Test rapid duplicate votes prevention.
- [x] Audit TV focus navigation and visual indicators.
- [x] Audit logs for sensitive data.
- [x] Verify all original asset sources.
- [x] Document friction-log items and product feedback.

### Acceptance Criteria

- [x] The primary flow passes all automated tests.
- [x] Demo mode completes in under 90 seconds.
- [x] No critical or high-severity defects remain open.
- [x] Bedrock failure does not prevent completion.
- [x] Automated checks pass across the entire monorepo (`lint`, `typecheck`, `test`, `build`).

## Phase 9 — Submission Materials

**Target:** October 17–19, 2026

### Goals

Prepare all required hackathon materials before code freeze.

### Tasks

- [x] Write the Devpost project description (`docs/devpost-submission.md`).
- [x] Explain the customer problem and target audience.
- [x] Explain why Fire TV is central to the experience.
- [x] Document the consensus algorithm.
- [x] Document AWS services used.
- [x] Complete product feedback for every tool, API, and SDK (`docs/product-feedback.md`).
- [x] Complete the friction log (`docs/friction-log.md` - 6 entries).
- [x] Add optional feature requests with urgency (FR-001 through FR-005).
- [x] Prepare AWS Builder challenge fields.
- [x] Prepare Open Source challenge fields.
- [x] Add contribution URL and GitHub username.
- [x] Verify repository structure and governance.
- [x] Create architecture visuals without third-party trademarks (`README.md`, `docs/architecture.md`).
- [x] Draft the English narration (`docs/devpost-submission.md`).
- [x] Create the shot list (`docs/devpost-submission.md`).
- [x] Rehearse to a maximum of 2 minutes 45 seconds.

### Three-Minute Video Plan

|      Time | Content                                     |
| --------: | ------------------------------------------- |
| 0:00–0:12 | Show the movie-night decision problem       |
| 0:12–0:25 | Introduce CommonScene                       |
| 0:25–0:50 | Create a room in the Vega simulator         |
| 0:50–1:15 | Join from phones and submit preferences     |
| 1:15–1:45 | Show fair recommendations and explanations  |
| 1:45–2:05 | Complete the final vote                     |
| 2:05–2:30 | Explain deterministic consensus and Bedrock |
| 2:30–2:45 | Show architecture and repository            |
| 2:45–2:55 | State impact and closing line               |

The video must visibly establish that the TV application is running in the Fire
TV or Vega simulator.

## Phase 10 — Code Freeze and Submission

**Target:** October 20–22, 2026

### October 20 — Code Freeze

- [ ] Stop adding features.
- [ ] Tag a release candidate.
- [ ] Run all checks.
- [ ] Test from a clean clone.
- [ ] Verify deployed services.
- [ ] Verify room expiry behavior.
- [ ] Verify demo mode.
- [ ] Close or defer non-critical issues.

### October 21 — Final Recording

- [ ] Record simulator footage.
- [ ] Record mobile participation footage.
- [ ] Record architecture and repository footage.
- [ ] Use only original or permitted audio and visuals.
- [ ] Edit the video below three minutes.
- [ ] Add readable English captions.
- [ ] Upload privately for verification.
- [ ] Check video quality on desktop and mobile.
- [ ] Make the final video public.

### October 22 — Submit

- [ ] Paste the final description into Devpost.
- [ ] Add the public repository.
- [ ] Add the public video.
- [ ] Select Fire TV as the primary track.
- [ ] Select AWS Builder.
- [ ] Select Open Source.
- [ ] Complete all required extra fields.
- [ ] Submit product feedback.
- [ ] Submit friction logs.
- [ ] Verify every link in an incognito window.
- [ ] Save screenshots and confirmation of submission.

### October 23 — Buffer

Use only for:

- Broken links
- Upload failures
- Critical deployment failures
- Submission-form corrections
- Video visibility problems

Do not plan feature work for this day.

## Demo Scenario

### Participants

| Name   | Preferences                      | Constraints                                 |
| ------ | -------------------------------- | ------------------------------------------- |
| Maya   | Comedy, adventure, lighthearted  | Maximum 110 minutes; avoid graphic violence |
| Jordan | Science fiction, imaginative     | Exclude horror; maximum 120 minutes         |
| Sam    | Warm, relaxing, character-driven | Maximum 100 minutes; avoid intense content  |

### Desired Demonstration

The top recommendation should:

- Fit the strictest runtime limit.
- Avoid horror and graphic violence.
- Match at least one preference from every participant.
- Not be the first genre choice of every participant.
- Win because it is the fairest compromise.

The explanation should resemble:

> This 96-minute lighthearted adventure fits everyone's time limit, avoids the
> group's content exclusions, and gives each participant at least one strong
> match.

The exact output must be generated from verified catalog and score data.

## Risk Register

| Risk                                           | Probability |   Impact | Mitigation                                                       |
| ---------------------------------------------- | ----------: | -------: | ---------------------------------------------------------------- |
| Vega simulator fails on the host               |      Medium | Critical | Complete Phase 1 first; use supported Linux and virtualization   |
| React Native package is incompatible with Vega |      Medium |     High | Minimize dependencies and verify each native package early       |
| D-pad focus becomes unstable                   |      Medium |     High | Use simple screen layouts and test navigation every phase        |
| Bedrock access is delayed                      |      Medium |   Medium | Keep template provider and mock AI adapter                       |
| WebSocket cloud deployment is complex          |      Medium |   Medium | Complete local realtime first; retain polling fallback if needed |
| QR code is difficult to scan in video          |         Low |   Medium | Use high contrast, large size, and manual code fallback          |
| Catalog produces weak recommendations          |      Medium |     High | Design catalog against explicit test scenarios                   |
| AI hallucinates movie facts                    |      Medium |     High | Provide verified data only and validate output                   |
| Demo network fails                             |      Medium | Critical | Maintain local deterministic demo mode                           |
| Video exceeds three minutes                    |      Medium |     High | Script for 2:50 and lead with the working product                |
| Copyright issue in footage                     |         Low | Critical | Use fictional titles, original artwork, and no commercial music  |
| Scope expansion delays polish                  |        High |     High | Enforce Must/Should/Could/Will Not scope                         |

## Friction Log Template

Create one entry for every meaningful Amazon or AWS tooling issue.

```markdown
## FL-000 — Short title

**Date:** YYYY-MM-DD\
**Tool or SDK:**\
**Task attempted:**\
**Environment:**\
**Steps taken:**\

1.  2.  3.

**Expected result:**\
**Actual result:**\
**Severity:** Critical / High / Medium / Low\
**Workaround:**\
**Time lost:**\
**Suggested improvement:**\
**Evidence:** Screenshot, log excerpt, or issue link
```

Do not include credentials, personal information, or sensitive paths in
friction-log evidence.

## Weekly Review Questions

At the end of each week, answer:

1. Does the product still work in the Vega simulator?
2. Can the core flow run without Bedrock?
3. Is D-pad navigation complete for every new screen?
4. Did the deterministic ranking behavior change?
5. Are all catalog assets safe to publish?
6. Can a new contributor follow the README?
7. What is the highest remaining demo risk?
8. What can be removed to improve reliability?
9. Was Amazon or AWS friction documented?
10. Can the current build be demonstrated in under three minutes?

## Final Definition of Done

The hackathon submission is done only when:

- The working application is visibly demonstrated in the Vega simulator.
- The video is public, in English, and under three minutes.
- The repository is public and includes all required source code.
- The license is present and visible.
- Setup instructions have been tested from a clean clone.
- Fire TV controls work with D-pad, Select, and Back.
- The movie catalog contains no unlicensed assets.
- Ranking is deterministic, fair, and explainable.
- Bedrock integration is real, documented, and safely bounded.
- The product remains usable if Bedrock fails.
- Product feedback is complete.
- Friction logs are complete.
- AWS Builder requirements are complete.
- Open Source challenge requirements are complete.
- Every submitted URL works without authentication.
- Devpost confirms successful submission.
