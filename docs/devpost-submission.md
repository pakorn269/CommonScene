# CommonScene — Devpost Hackathon Submission Draft

**Hackathon Track:** Fire TV (Primary)  
**Priority Categories:** AI-Enhanced Viewing, Family Entertainment  
**Mini Challenges:** AWS Builder, Open Source

---

## 🎬 Project Title & Tagline

- **Title:** CommonScene
- **Tagline:** A Fire TV-first group movie recommendation engine that turns household movie-night paralysis into instant, fair consensus.
- **Devpost Project:** [https://devpost.com/software/commonscene](https://devpost.com/software/commonscene)
- **Demo Video:** [https://youtu.be/8_Ttd3JLErE](https://youtu.be/8_Ttd3JLErE)
- **GitHub Repo:** [https://github.com/pakorn269/CommonScene](https://github.com/pakorn269/CommonScene)

---

## 💡 The Problem

Every family and friend group knows the "30-minute scroll" — sitting on the couch endlessly browsing streaming menus, arguing over genres, runtimes, and ratings until everyone loses interest. Individual recommendation algorithms optimize for a single profile, ignoring the group dynamic, hard time constraints (e.g. "kids must sleep by 9 PM"), and content boundaries.

## 🚀 The Solution

**CommonScene** brings democratic harmony to group movie decisions right on the living room television:

1. **Fire TV Host:** The TV launches CommonScene, displaying a large 4-letter room code (and QR join link).
2. **Instant Mobile Participation:** Up to dozens of viewers join on their phones without account creation or app installation (via mobile PWA).
3. **Structured & Free-Text Preferences:** Participants select preferred genres, moods, maximum runtime, rating caps, and content tags — or type natural language preferences.
4. **Deterministic Fairness Engine:** Computes an un-gameable consensus score balancing average satisfaction, minimum viewer happiness, and group preference coverage:
   $$\text{Score}(m) = 0.45 \cdot \text{Avg}(m) + 0.35 \cdot \text{Min}(m) + 0.20 \cdot \text{Coverage}(m) - \text{Penalty}(m)$$
5. **Amazon Bedrock AI Enhancement:** Extracts structured preferences from free-text and generates conversational consensus explanations grounded strictly in verified score data.
6. **Live Living Room Vote:** TV showcases the top 3 finalists. Everyone casts a quick vote on their phone, and the TV reveals the crowned winner with cinema fanfare!

---

## 📺 Why Fire TV is Central

Television is the shared canvas of the living room. CommonScene is designed from the ground up for Fire TV:

- **10-foot UI & D-pad Navigation:** Operates 100% via remote D-pad directional keys with prominent visual focus indicators (≥ 3px focus border, 1.04x scale transform).
- **TV-Safe Margins:** 5% viewport overscan protection ensures readability on all television sets.
- **Zero-Friction Group Onboarding:** Big-screen QR code and 4-letter room code let guests join in seconds.
- **Vega OS & Hermes Performance:** Native React Native for Vega OS bundle running on high-efficiency Hermes JavaScript engine.

---

## 🛠️ Technology Stack & AWS Integration

- **Fire TV Native App (`apps/tv`):** React Native targeting Vega OS runtime with Hermes bytecode.
- **Mobile Participant PWA (`apps/mobile`):** React 19 + Vite + TypeScript PWA hosted via Amazon S3 and CloudFront.
- **Backend Service (`services/api`):** Fastify + TypeScript server with low-latency WebSocket hub for bidirectional live room sync.
- **Deterministic Consensus Package (`packages/consensus`):** Pure TypeScript mathematical ranking engine with 100% deterministic test coverage.
- **Amazon Bedrock AI:** Server-side Converse API (Anthropic Claude 3.5 Sonnet / Amazon Nova) for natural language preference parsing and grounded score explanations, with zero-error offline fallback.
- **AWS CDK (`infrastructure/cdk`):** Declarative Infrastructure as Code defining Amazon DynamoDB (with TTL), S3 + CloudFront with OAC, API Gateway, and Bedrock IAM policies.

---

## 🔒 Safety, Privacy & Governance

- **Hard Constraints are Inviolable:** Runtimes, rating ceilings, and excluded genres are strictly enforced by code — never overridden by AI.
- **Zero Catalog Hallucination:** Recommendations come exclusively from verified catalog entries.
- **Privacy First:** No personal names, emails, phone numbers, or passwords collected.
- **100% Offline Demo Mode:** Built-in 90-second offline demo mode runs completely independent of external cloud services or network connectivity.

---

## 🎥 3-Minute Video Script & Shot List (Target: 2m 45s)

| Timestamp       | Visual (Shot List)                                                                                                                              | Voiceover Narration                                                                                                                                                                                   |
| :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0:00 - 0:15** | Split screen: frustrated friends arguing on couch over streaming menu.                                                                          | _"We've all been there: it's movie night, and after 30 minutes of endless scrolling and arguing, you still haven't picked a movie."_                                                                  |
| **0:15 - 0:35** | TV screen launching CommonScene in Vega Virtual Device simulator. Big room code `E4H5` appears.                                                 | _"Introducing CommonScene — the Fire TV-first group recommendation experience that turns movie-night paralysis into instant, fair consensus."_                                                        |
| **0:35 - 1:00** | Three mobile phone screens joining with nicknames and selecting preferences (Alice: Comedy/Family, Bob: Sci-Fi, Charlie: Animation under 100m). | _"The host launches CommonScene on Fire TV. Everyone in the room scans the QR code or enters the 4-letter code from their phones. No accounts or app installs needed."_                               |
| **1:00 - 1:25** | TV screen transitions to "Ranking Progress" with animated fairness calculation.                                                                 | _"With one click on the remote, our deterministic consensus engine runs. It checks hard runtime and rating limits, and calculates the optimal balance of average satisfaction and minimum fairness."_ |
| **1:25 - 1:55** | TV displays Top 3 Recommendation Cards with match scores, rating badges, and Bedrock-grounded explanations.                                     | _"In seconds, Fire TV presents the top three consensus finalists with natural explanations powered by Amazon Bedrock — explaining exactly how the movie satisfies everyone's tastes."_                |
| **1:55 - 2:20** | Mobile phones tapping vote buttons; TV voting tallies update live; TV crowns _The Clockwork Bakery_ as winner!                                  | _"The group casts a 1-tap vote on their phones. Fire TV tallies votes in real time and crowns the winning movie with cinematic fanfare!"_                                                             |
| **2:20 - 2:45** | Architecture diagram in `docs/architecture.md`, CDK code, and GitHub repository overview.                                                       | _"Built with React Native for Vega OS, Amazon Bedrock, and AWS CDK. CommonScene is fully open source under the Apache-2.0 license. Stop scrolling, start watching — with CommonScene."_               |
