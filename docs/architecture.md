# CommonScene — Architecture

## System Overview

```text
┌──────────────────────────────────────────────────────────────────┐
│  Fire TV / Vega Simulator                                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  apps/tv  (React Native)                                    │ │
│  │  • Welcome → Room creation → Lobby → Results → Vote → Win  │ │
│  │  • D-pad navigation, TV-safe margins, no text input         │ │
│  └──────────────────────┬──────────────────────────────────────┘ │
└─────────────────────────│────────────────────────────────────────┘
                          │ WebSocket + REST
              ┌───────────▼──────────────────────┐
              │  services/api  (Fastify)          │
              │  • Room lifecycle REST endpoints  │
              │  • WebSocket room subscriptions   │
              │  • Consensus engine integration   │
              │  • Bedrock AI provider (optional) │
              │  • In-memory / DynamoDB repo      │
              └───────────┬──────────────────────┘
                          │
          ┌───────────────┼───────────────────────┐
          │               │                       │
          ▼               ▼                       ▼
  packages/consensus  packages/catalog  packages/contracts
  (pure TypeScript)   (fictional data)  (Zod schemas)
          │
          │ optional
          ▼
   Amazon Bedrock
   (preference parsing,
    explanation text)
          │
┌─────────▼──────────────────────────────────────────────────────┐
│  Participant Phones (browser)                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  apps/mobile  (React + Vite PWA)                          │ │
│  │  • QR scan / room-code entry → Nickname → Preferences     │ │
│  │  • Submission confirmation → Wait → Vote                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### apps/tv

- Hosts the room and controls session progression.
- Renders recommendation results on the TV screen.
- Communicates via WebSocket to receive realtime participant updates.
- Never processes preferences directly — delegates to the API.

### apps/mobile

- Stateless participant client; no account, no persistent storage.
- Submits structured preference forms and casts final votes.
- Receives room state updates via WebSocket.

### services/api

- Single source of truth for room state.
- Applies all business rules at the service boundary (validation, rate
  limiting).
- Invokes `@commonscene/consensus` synchronously; never delegates ranking to AI.
- Calls Bedrock for text generation only after scores are computed.

### packages/consensus

- Pure TypeScript, zero runtime dependencies on AWS or UI.
- Implements the scoring formula:
  `0.45·Avg + 0.35·Min + 0.20·Coverage - Penalty`.
- Deterministic: same input → same output, always.
- Returns component scores alongside every recommendation.

### packages/catalog

- Fictional movie records only. No copyrighted metadata.
- Validates at build time. Rejects duplicate IDs and titles.
- Artwork is original SVG or generated shapes — no real posters.

### packages/contracts

- All Zod schemas for requests, responses, events, and domain types.
- Imported by every other package. Updated before any client or service change.

### infrastructure/cdk

- AWS CDK stacks for production deployment (Phase 7).
- API Gateway (HTTP + WebSocket), Lambda, DynamoDB, S3, CloudFront, CloudWatch.

## Data Flow — Recommendation Cycle

```text
1.  Host presses "Start ranking" on TV
2.  TV → POST /api/v1/rooms/:code/rank
3.  API locks preferences, transitions room to "ranking"
4.  API broadcasts ranking.started via WebSocket
5.  API calls consensus.rank(catalog, preferences)
6.  consensus filters by hard constraints (runtime, rating, tags, genres)
7.  consensus scores each eligible movie (Avg, Min, Coverage, Penalty)
8.  consensus returns top-N RankedMovie[] sorted by score
9.  (optional) API calls Bedrock to enhance explanation text
10. API stores results, transitions room to "voting"
11. API broadcasts recommendations.ready via WebSocket
12. TV receives event and renders top-3 recommendation cards
```

## Local Development Topology

```text
localhost:5173  →  apps/mobile (Vite dev server)
localhost:3001  →  services/api (Fastify)
  /api/*        →  REST handlers
  /ws/*         →  WebSocket upgrade
```

## Deployment Topology (Phase 7)

```text
CloudFront → S3        (apps/mobile static files)
CloudFront → API GW    (HTTP + WebSocket APIs)
API GW     → Lambda    (services/api handlers)
Lambda     → DynamoDB  (room state)
Lambda     → Bedrock   (optional AI calls, server-side only)
```
