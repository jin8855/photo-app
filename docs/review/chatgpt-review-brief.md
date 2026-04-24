# ChatGPT Review Brief: Photo Caption Local App

## 1. Review Purpose

Please review this project as an external beta-readiness review.

The app lets a user upload a photo, analyzes the mood/style of the image, generates Korean phrases, captions, hashtags, and creates a downloadable social image with text overlay.

Production URL:

- https://photo-app-web-ruddy.vercel.app

The project should remain usable without a paid OpenAI API key. The current production path uses rule-based/mock analysis and Supabase-backed storage/database.

## 2. What To Focus On

Please evaluate:

- First-time user UX clarity
- Whether the result screen naturally guides the next action
- Whether generated Korean copy matches the actual photo mood
- Whether action/speed photos avoid quiet emotional copy
- Performance of filter/font/content preview controls
- Readability of generated image/result UI on desktop and tablet
- Deployment readiness for external beta users
- Architecture boundaries between UI, service, repository, storage, and provider layers
- Maintainability of MSSQL to Postgres/Supabase switching

## 3. Current Product Flow

1. User uploads a photo.
2. The file is stored through a storage adapter.
3. Photo metadata is saved to DB.
4. Analysis runs.
5. Analysis returns scene, mood, style type, reviews, phrases, captions, hashtags, and scores.
6. User can select a phrase/caption/hashtag set.
7. User can create a downloadable image with text overlay.
8. User can copy caption/hashtags and revisit previous history.

## 4. Current Runtime Strategy

### Production

- `DB_PROVIDER=postgres`
- Supabase Postgres
- `STORAGE_PROVIDER=supabase-storage`
- Supabase Storage bucket: `images`

### Local / Legacy Support

- `DB_PROVIDER=mssql`
- `STORAGE_PROVIDER=local-public`
- SQLite code still exists as legacy/local support code, but it is not the official production path.

### Important Storage Rule

The DB should store only file paths and metadata. Image binary files should not be stored directly in the DB.

## 5. Architecture Summary

The project is intended to keep these layers separated:

- UI components
- Feature-level message selectors/i18n
- Services
- Analysis providers
- Phrase engine strategies
- Repository interfaces
- MSSQL/Postgres repository adapters
- Storage interface
- Local/Supabase storage adapters

The goal is that UI and service layers do not know whether the app is using MSSQL, Postgres, local storage, or Supabase Storage.

## 6. Key Files For Review

### Upload / Result UI

- `features/upload/components/analysis-result-viewer.tsx`
- `features/upload/components/analysis-result-panel.tsx`
- `features/upload/components/analysis-phrase-list.tsx`
- `features/upload/i18n/upload-page-messages.ts`
- `i18n/messages/ko.json`

### Analysis

- `lib/types/analysis.ts`
- `services/analyses/photo-analysis-service.ts`
- `services/analyses/providers/mock-photo-analysis-provider.ts`
- `services/analyses/providers/openai-photo-analysis-provider.ts`
- `services/analyses/providers/mock-visual-style-resolver.ts`
- `services/analyses/providers/analysis-preset.ts`

### Phrase Engine

- `services/analyses/providers/phrase-engine/strategy-registry.ts`
- `services/analyses/providers/phrase-engine/strategies/action-speed-strategy.ts`
- `services/analyses/providers/phrase-engine/strategies/emotional-landscape-strategy.ts`
- `services/analyses/providers/phrase-engine/strategies/healing-strategy.ts`
- `services/analyses/providers/phrase-engine/strategies/reflective-strategy.ts`
- `services/analyses/providers/phrase-engine/strategies/travel-strategy.ts`

### Content Image Generation

- `services/content/content-image-renderer.ts`
- `services/content/content-service.ts`
- `services/content/content-client.ts`
- `app/api/content-set/route.ts`

### Repository / DB Provider

- `repositories/repository-factory.ts`
- `repositories/interfaces/photo-repository.ts`
- `repositories/interfaces/analysis-repository.ts`
- `repositories/interfaces/history-repository.ts`
- `repositories/postgres/*`
- `repositories/mssql/*`

### Storage

- `services/storage/photo-storage.ts`
- `services/storage/storage-factory.ts`
- `services/storage/photo-preview-url.ts`
- `services/storage/adapters/local/*`
- `services/storage/adapters/supabase/*`

## 7. Supported `photo_style_type` Values

The app currently distinguishes photo copy strategy using `photo_style_type`.

Supported types:

- `emotional_landscape`
- `spring_healing`
- `lonely_night`
- `reflective_fog`
- `travel_korean`
- `natural_healing`
- `action_speed`
- `sports_energy`
- `urban_mood`
- `other`

## 8. Copy Strategy Rules

### Common Rules

- No translated-sounding Korean
- No explanatory photo descriptions
- No awkward sentences that are grammatically valid but unnatural
- Keep phrases short and realistic
- Prefer emotional impact over abstract poetic language
- Captions should use a 3-line structure when generated as captions:
  1. One emotional line
  2. One empathy/expansion line
  3. One short closing/blank-space line

### Emotional / Quiet Photos

Goal:

- empathy
- lingering feeling
- realistic short Korean

Good examples:

- 오늘은 괜히 더 조용하다
- 아무 일 없는데 마음이 무거운 날 있잖아
- 그냥 그런 날

### Spring / Healing Photos

Goal:

- warm
- light
- comfortable
- recovery mood

Good examples:

- 이제는 조금 괜찮아질 거야
- 아무 일 없어도 좋은 날
- 그냥 오늘이 좋다

### Reflective / Fog Photos

Goal:

- questions
- direction
- thought
- quiet uncertainty

Good examples:

- 어디로 가고 있는 걸까
- 답은 없는데 계속 걷게 된다
- 지금 나는 어디쯤일까

### Travel / Korean Space Photos

Goal:

- memory
- place
- experience
- quiet atmosphere

Good examples:

- 여기서는 시간이 느리다
- 괜히 오래 머물고 싶은 곳
- 이 순간이 기억에 남는다

### Action / Speed Photos

Goal:

- short and strong
- speed
- control
- thrill
- aggression
- realistic speech

Good examples:

- 멈출 생각 없어
- 끝까지 밀어붙인다
- 이게 내가 사는 방식이다
- 브레이크는 늦을수록 재밌다
- 선을 넘는 순간이 제일 좋다

Forbidden for action/speed:

- 괜찮아
- 버텨
- 생각나는 밤
- 이별, 고요, 혼자, 위로 중심 문장
- 설명형 문장
- 번역체 문장
- 사진과 무관한 우울/서정 문장

## 9. Important Recent Fixes

### Drift Photo Misclassification

Previous issue:

- A drift/motorsports photo was classified as `night_solitude`.
- The generated output mentioned breakup, solitude, lonely night, and quiet emotional copy.

Expected behavior now:

- Drift/motorsports photos should resolve to action-oriented metadata.
- Example target:
  - `photo_style_type=action_speed`
  - `scene_type=drift_speed`
  - `mood_category=speed_control`
- Action hashtags should not inherit night/solitude hashtags.

### History Images Not Showing

Previous issue:

- History list used stored object path directly as an image URL.
- Supabase Storage paths such as `uploads/...` cannot be rendered directly by browser.

Fix:

- Added preview URL resolution.
- History cards should use `previewUrl`.
- Supabase object paths should resolve to public Storage URLs.

### Slow Filter / Font Preview

Previous issue:

- Every font/filter/style change triggered server rendering and DB persistence.
- This made preview controls feel slow.

Fix:

- Preview rendering is now client-side.
- The image is read once as a data URL.
- SVG preview is generated locally on style changes.
- Server persistence is kept for explicit content-set generation actions.

### Action Result UI Readability

Previous issue:

- Action-style result cards used dark/gradient visuals, but some text had poor contrast.

Fix:

- Action result text/card colors were adjusted for better readability.
- Please still verify on desktop/tablet because this was recently changed.

## 10. Known Risks

1. Mock image classification is heuristic.
   It is improved for drift/action photos, but it is not as reliable as a real vision AI model.

2. OpenAI image analysis path exists but may not be enabled in production.
   The app must still work without `OPENAI_API_KEY`.

3. UI may still feel feature-heavy.
   First-time users may not immediately know whether to copy text, download image, or regenerate.

4. Client-side preview may have edge cases.
   If public image fetch or CORS fails, preview rendering may break or fall back poorly.

5. History persistence behavior may need UX review.
   Local preview changes are fast, but not every preview change should necessarily create history.

6. Korean copy quality is the core product risk.
   Even when architecture works, mismatched tone can break user trust immediately.

## 11. GPT Evaluation Summary Already Received

The previous GPT review judged that this is not a structurally broken project. It is closer to a beta-ready product that needs UX trust, result clarity, and copy-quality improvements.

Main recommendations from that review:

- Prioritize result screen CTA clarity.
- Reduce information overload on the result screen.
- Make the next action obvious after analysis.
- Add photo improvement tips as a differentiated feature.
- Keep paid AI optional.
- Keep i18n/resource-file usage.
- Preserve provider/repository/storage separation.
- Continue improving mobile/tablet UX.
- Avoid full rewrites and focus on narrow beta-readiness changes.

## 12. Questions For The Reviewer

Please answer these directly:

1. Is the current architecture clean enough for external beta deployment?
2. Are UI/service/repository/storage/provider boundaries separated well enough?
3. Is the fallback rule-based visual classifier acceptable for beta without paid AI?
4. Where is the highest-risk bug likely to appear next?
5. Is the phrase-engine strategy pattern justified, or is it too much complexity?
6. Does action/speed Korean copy feel natural and strong?
7. Does the result UI make the next action obvious?
8. Should generated content-set previews be saved automatically or only after an explicit user action?
9. What should be fixed before inviting real users?
10. What should be postponed until after beta?

## 13. Requested Review Output Format

Please provide the review in this structure:

1. Critical issues
2. UX issues
3. Architecture issues
4. Performance risks
5. DB/storage risks
6. Copy-generation risks
7. Recommended next fixes in priority order
8. What is already good enough for beta

## 14. Constraints For Any Suggested Fixes

Please respect these project constraints:

- Do not recommend a full rewrite.
- Do not require a paid OpenAI API for the base beta flow.
- Do not hardcode Korean UI text in components.
- Keep UI text in resource/message files.
- Keep UI/service/repository/storage separation.
- Keep current MSSQL support while supporting Postgres/Supabase production.
- Do not store image files directly in DB.
- Avoid excessive abstraction.
- Favor changes that improve real user confidence quickly.
