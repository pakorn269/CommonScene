# AGENTS.md

## Project Overview

CommonScene is a Fire TV-first group movie recommendation experience built for
the Build, Ship, Shape: Amazon Developer Hackathon.

The application helps families and friends find a movie everyone can enjoy.
Participants join a room from their phones, submit preferences and constraints,
and receive fair, explainable recommendations on the TV.

Primary hackathon track:

- Fire TV
- Priority categories: AI-enhanced viewing and family entertainment

Mini challenges:

- AWS Builder
- Open Source

## Core Product Principles

1. Build for the television first.
2. Every TV interaction must work with D-pad, Select, and Back.
3. Hard constraints must never be overridden by AI.
4. Movie ranking must be deterministic and testable.
5. AI may parse preferences and explain results, but it must not invent catalog
   entries.
6. The demo must work without external movie or streaming APIs.
7. The application must have a graceful fallback when AWS or Bedrock is
   unavailable.
8. Do not use copyrighted posters, trailers, music, logos, or movie footage.
9. Use the fictional catalog and original project artwork in demos and
   screenshots.
10. Prefer a reliable, polished MVP over additional features.

## Technology Stack

| Area                     | Technology                             |
| ------------------------ | -------------------------------------- |
| Language                 | TypeScript                             |
| Package manager          | npm                                    |
| Monorepo                 | npm workspaces                         |
| TV application           | React Native targeting Vega OS         |
| Mobile application       | React, Vite, PWA                       |
| API service              | Node.js, Fastify                       |
| Local realtime transport | WebSocket                              |
| Cloud realtime transport | API Gateway WebSocket API              |
| Validation               | Zod                                    |
| Local persistence        | In-memory repository or DynamoDB Local |
| Cloud persistence        | Amazon DynamoDB                        |
| AI                       | Amazon Bedrock                         |
| Infrastructure           | AWS CDK                                |
| Unit tests               | Vitest                                 |
| End-to-end tests         | Playwright                             |
| Formatting               | Prettier                               |
| Linting                  | ESLint                                 |

Do not replace core technologies unless an incompatibility with Vega OS or the
hackathon environment is documented.

## Repository Layout

```text
commonscene/
├── apps/
│   ├── mobile/                 # React/Vite participant PWA
│   └── tv/                     # React Native Vega OS application
├── services/
│   └── api/                    # Fastify API and WebSocket server
├── packages/
│   ├── catalog/                # Fictional movie catalog and schemas
│   ├── consensus/              # Deterministic recommendation engine
│   ├── contracts/              # Shared request/event/domain schemas
│   ├── test-fixtures/          # Shared test rooms and preferences
│   └── ui-tokens/              # Colors, typography, and spacing
├── infrastructure/
│   └── cdk/                    # AWS deployment definitions
├── docs/
│   ├── architecture.md
│   ├── friction-log.md
│   ├── product-feedback.md
│   └── submission-checklist.md
├── AGENTS.md
├── MVP-PHASE-PLAN.md
├── README.md
├── LICENSE
├── package.json
├── npm-lock.yaml
└── npm-workspace.yaml
```

## Domain Model

### Room

A room represents one movie-selection session.

Required properties:

```ts
type RoomStatus =
    | 'lobby'
    | 'collecting_preferences'
    | 'ranking'
    | 'voting'
    | 'complete'
    | 'expired';

interface Room {
    id: string;
    code: string;
    status: RoomStatus;
    hostParticipantId: string;
    participantIds: string[];
    candidateMovieIds: string[];
    createdAt: string;
    expiresAt: string;
}
```

### Participant

```ts
interface Participant {
    id: string;
    roomId: string;
    displayName: string;
    avatarId: string;
    isHost: boolean;
    hasSubmittedPreferences: boolean;
    joinedAt: string;
}
```

Do not collect email addresses, phone numbers, precise locations, or legal
names.

### Preference Profile

```ts
interface PreferenceProfile {
    participantId: string;
    preferredGenres: string[];
    excludedGenres: string[];
    moods: string[];
    maximumRuntimeMinutes: number | null;
    maximumContentRating: string | null;
    avoidContentTags: string[];
    freeText: string | null;
}
```

The following fields are hard constraints:

- `maximumRuntimeMinutes`
- `maximumContentRating`
- `excludedGenres`, when explicitly marked as an exclusion
- `avoidContentTags`

The following fields are soft preferences:

- `preferredGenres`
- `moods`
- Optional free-text preferences after validation

### Catalog Entry

```ts
interface Movie {
    id: string;
    title: string;
    synopsis: string;
    runtimeMinutes: number;
    releaseYear: number;
    genres: string[];
    moods: string[];
    contentRating: string;
    contentTags: string[];
    artworkKey: string;
}
```

Only recommend movies present in the local catalog.

## Consensus Algorithm

The ranking engine must remain deterministic.

For each eligible movie $m$:

$$
Score(m)=0.45Avg(m)+0.35Min(m)+0.20Coverage(m)-Penalty(m)
$$

Where:

- `Avg(m)` is the average participant satisfaction.
- `Min(m)` is the lowest participant satisfaction.
- `Coverage(m)` is the percentage of soft preferences satisfied.
- `Penalty(m)` represents non-fatal conflicts.
- Any hard-constraint violation makes the movie ineligible.

Implementation requirements:

- Normalize component scores to the range $0$ through $1$.
- Return component scores with every recommendation.
- Return reasons for exclusion during development and testing.
- Use stable sorting for ties.
- Break final ties by catalog ID, not randomly.
- Never call an LLM to calculate the authoritative score.
- Include at least one fairness-focused unit test for each scoring rule.

Expected result shape:

```ts
interface RankedMovie {
    movieId: string;
    score: number;
    averageSatisfaction: number;
    minimumSatisfaction: number;
    preferenceCoverage: number;
    penalty: number;
    matchedPreferenceKeys: string[];
    tradeoffs: string[];
}
```

## AI Responsibilities

Amazon Bedrock may be used for:

- Converting free-text preferences into structured candidate values
- Producing a short group-consensus summary
- Producing recommendation explanations from verified score data
- Rephrasing deterministic explanations into natural English

Amazon Bedrock must not:

- Add movies to the catalog
- Override hard constraints
- Calculate authoritative rankings
- Claim streaming availability
- Generate unsupported movie facts
- Receive unnecessary personal information

All model responses must be validated with Zod.

Example structured parsing result:

```json
{
    "moods": ["lighthearted"],
    "preferredGenres": ["comedy", "adventure"],
    "excludedGenres": ["horror"],
    "maximumRuntimeMinutes": 105,
    "avoidContentTags": ["graphic violence"]
}
```

If parsing fails:

1. Log a non-sensitive error.
2. Ignore the AI interpretation.
3. Preserve structured preferences entered through the UI.
4. Continue with deterministic template explanations.

## API Conventions

Base path:

```text
/api/v1
```

Initial endpoints:

| Method | Path                                                       | Purpose                |
| ------ | ---------------------------------------------------------- | ---------------------- |
| `POST` | `/rooms`                                                   | Create a room          |
| `GET`  | `/rooms/:roomCode`                                         | Get room state         |
| `POST` | `/rooms/:roomCode/participants`                            | Join a room            |
| `PUT`  | `/rooms/:roomCode/participants/:participantId/preferences` | Submit preferences     |
| `POST` | `/rooms/:roomCode/rank`                                    | Generate candidates    |
| `GET`  | `/rooms/:roomCode/recommendations`                         | Read ranked candidates |
| `POST` | `/rooms/:roomCode/votes`                                   | Submit a vote          |
| `POST` | `/rooms/:roomCode/finalize`                                | Finalize the winner    |
| `GET`  | `/health`                                                  | Service health check   |

WebSocket path:

```text
/ws/rooms/:roomCode
```

Initial event names:

```text
room.snapshot
participant.joined
participant.updated
preferences.submitted
ranking.started
recommendations.ready
vote.submitted
room.completed
room.error
```

Every request, response, and event must use a shared schema from
`packages/contracts`.

## TV Interaction Requirements

Every interactive TV component must:

- Be reachable with directional navigation.
- Show an obvious focused state.
- Support Select/Enter activation.
- Support Back without trapping the user.
- Avoid hover-only interactions.
- Avoid text input unless absolutely necessary.
- Remain readable at television viewing distance.
- Respect TV-safe margins.
- Avoid placing more than three recommendation cards on one screen.

Required TV screens:

1. Welcome
2. Room creation
3. QR and room-code lobby
4. Waiting for preferences
5. Ranking progress
6. Recommendation results
7. Final voting
8. Winner
9. Recoverable error
10. Demo mode

Do not treat browser keyboard navigation as final verification. The flow must be
tested in the Fire TV or Vega simulator.

## Mobile Requirements

The mobile PWA must:

- Work without account creation.
- Allow room-code entry if QR scanning is unavailable.
- Request only a nickname.
- Present structured preference controls before free text.
- Show submission confirmation.
- Allow preferences to be edited before ranking starts.
- Support final voting.
- Work at common mobile widths starting at 320 pixels.

## Accessibility

- Maintain WCAG AA contrast where practical.
- Never communicate state using color alone.
- Give focus indicators at least 3 pixels of visual prominence.
- Add accessible labels to mobile controls.
- Respect reduced-motion preferences.
- Keep TV animations short and non-blocking.
- Use plain language in explanations and errors.

## Security and Privacy

- Validate all input at service boundaries.
- Normalize room codes before lookup.
- Rate-limit room creation, joining, and AI parsing.
- Never expose AWS credentials to TV or mobile clients.
- Keep Bedrock calls server-side.
- Store only session data required for the demo.
- Expire rooms automatically.
- Avoid logging free-text preferences in production.
- Do not commit `.env`, credentials, private keys, or generated deployment
  outputs.
- Treat room codes as temporary shared secrets, not authentication credentials.
- Prevent one participant from modifying another participant's preferences.

## Testing Requirements

Before merging a feature:

- Run type checking.
- Run linting.
- Run relevant unit tests.
- Add or update tests for domain behavior.
- Manually test impacted TV focus paths.
- Verify the offline or no-Bedrock fallback when AI code changes.

Required consensus tests:

- Runtime hard constraint
- Content-rating hard constraint
- Excluded genre
- Avoided content tag
- Average satisfaction calculation
- Minimum satisfaction fairness component
- Preference coverage calculation
- Stable tie-breaking
- Empty preference profile
- One participant
- Multiple conflicting participants
- No eligible movies
- Bedrock unavailable

Target commands:

```bash
npm install
npm lint
npm typecheck
npm test
npm test:e2e
npm build
```

## Coding Conventions

- Use strict TypeScript.
- Avoid `any`; use `unknown` and validate it.
- Keep domain logic independent of UI and AWS SDKs.
- Prefer pure functions in the consensus package.
- Use dependency injection for repositories and AI clients.
- Keep files focused and reasonably small.
- Use named exports for shared packages.
- Add comments for decisions, not obvious syntax.
- Use UTC ISO 8601 timestamps.
- Use integer minutes for runtime.
- Use integer basis points internally if floating-point scores become unstable.
- Never hide a failing test by weakening its assertion.

## Change Workflow

For every meaningful change:

1. Read `README.md`, `MVP-PHASE-PLAN.md`, and relevant package documentation.
2. Identify the smallest vertical slice.
3. Update shared contracts before clients and services.
4. Implement deterministic domain behavior.
5. Add tests.
6. Integrate UI or infrastructure.
7. Run validation commands.
8. Update documentation if setup, behavior, architecture, or limitations
   changed.
9. Add relevant SDK friction to `docs/friction-log.md`.
10. Summarize changed files and outstanding risks.

## Definition of Done

A task is done only when:

- The behavior works end to end or is clearly marked as isolated groundwork.
- Type checking passes.
- Relevant tests pass.
- Error and loading states exist.
- No secrets or copyrighted assets were added.
- TV navigation remains usable.
- Documentation reflects user-facing or setup changes.
- The implementation has a safe fallback when it depends on AI.

## Scope Control

Do not implement these before the core submission flow is complete:

- User accounts
- Social graphs
- Watch history
- Real streaming-provider availability
- Payments
- Production-grade personalization
- Voice recognition
- Trailer playback
- External copyrighted movie catalogs
- Multiple languages
- Alexa+, Ring, or Bee integrations
- Native mobile applications

Record desirable out-of-scope features in an issue or roadmap section instead.

## Demo Reliability

The repository must include a demo mode that:

- Uses a fixed fictional catalog.
- Can create three sample participants.
- Uses predictable preference profiles.
- Demonstrates a meaningful disagreement.
- Produces the same top three results on every run.
- Works without Bedrock.
- Can complete within 90 seconds.
- Clearly runs inside the Fire TV or Vega simulator.

The live multi-device flow remains the primary demo. Demo mode is the fallback.

---

## AWS Guidance

- Prefer the AWS MCP Server for AWS interactions — it provides sandboxed
  execution, observability, and audit logging. If unavailable, use the
  AWS CLI directly.
- Before starting a task, check whether a relevant AWS skill is available.
  Load the skill with `retrieve_skill` and prefer its guidance over
  general knowledge.
- When uncertain about specific AWS details (API parameters, permissions,
  limits, error codes), verify against documentation rather than guessing.
  State uncertainty explicitly if you cannot confirm.
- When creating infrastructure, prefer infrastructure-as-code (AWS CDK or
  CloudFormation) over direct CLI commands.
- When working with infrastructure, follow AWS Well-Architected Framework
  principles.
- Do not use em dashes in AWS resource names or descriptions. Use
  hyphens instead.

### Secret Safety

- MUST load the `aws-secrets-manager` skill first for any secret,
  credential, API key, token, or password task. MUST NOT call
  `secretsmanager get-secret-value` or `batch-get-secret-value`, and MUST
  NOT hit the Secrets Manager Agent daemon directly. MUST use
  `{{resolve:secretsmanager:secret-id:SecretString:json-key}}` with
  `asm-exec` so the secret resolves at runtime without entering context.
