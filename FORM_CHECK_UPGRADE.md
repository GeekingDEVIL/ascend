# ASCEND — Form Check Camera Upgrade Plan

> Master feature list for the AI-powered form analysis overhaul.
> Every feature maps to exact files, describes how it works technically,
> flags integration risks, and notes what the user needs to do (if anything).

---

## Architecture Principle: Video Never Leaves the Device

The form check system runs entirely client-side via MediaPipe Pose (33 body landmarks, WASM/WebGL).
Raw video frames are held in memory during recording, analyzed, then **discarded immediately**.
Only numeric results (scores, angles, tips) are persisted. This is a hard rule — no video upload, no video storage, no exceptions.

**Current files:**
- `app/components/FormCheckCamera.tsx` — Full-screen camera overlay component (lazy-loaded via `next/dynamic`)
- `app/lib/formAnalysis.ts` — Pose analysis engine (exercise detection, depth/symmetry/bar-path checks, scoring)
- `app/(main)/workout/page.tsx` — Wires the Form Check button into exercise cards

**What's built today:**
- Full-screen camera with real-time skeleton overlay
- Front/back camera flip
- Auto-detect exercise type (squat, deadlift, overhead press, bench, general)
- Squat depth analysis (knee angle vs 100° threshold)
- Left/right symmetry check (flags >8° difference)
- Bar path trajectory visualization
- Back rounding detection for deadlifts
- Bar path straightness check for overhead press/bench
- Overall score 0–100 with exercise-specific tips
- 60-second max recording with auto-stop
- Lazy-loaded — zero cost until user taps Form Check

---

## TIER 1 — High Impact (Build First)

These are the features that turn Form Check from a tech demo into an actual coach.

---

### 1.1 Real-Time Color Feedback on Skeleton

**What:** Skeleton changes color based on form quality **in real time** during recording. Green when form is correct, amber when borderline, red when breaking down. Color changes happen **per-joint** — if knees are caving but upper body is fine, only the knee joints and their connections go red.

**Where:**
- `app/components/FormCheckCamera.tsx` — `drawSkeleton()` function (currently line ~93). Currently uses hardcoded `#00ffaa` for all connections. Change to accept per-connection colors.
- `app/lib/formAnalysis.ts` — Add a `checkFormRealtime(landmarks, exerciseType)` function that returns per-joint status (green/amber/red) without needing full frame history.
- Color map: green `#00FFAA` (angles in safe range), amber `#FFB800` (approaching threshold), red `#FF4466` (past threshold).

**How it works:**
Each frame during recording, run angle checks on key joints based on the detected exercise type:
- **Squat:** knee angle (depth), knee-to-ankle lateral offset (valgus), hip-to-shoulder angle (back rounding)
- **Deadlift:** hip hinge angle, shoulder-below-hip check (back rounding)
- **Overhead press:** elbow angle, bar path lateral drift
- Map each check result to a color. Apply that color to the relevant connections in `drawSkeleton()`.

**Integration risks:**
- Performance: real-time checks run every frame at 30fps. Keep the check function under 1ms — use simple angle comparisons only, no loops over history.
- The existing `analyzeForm()` runs post-recording on all frames. Real-time checks are a separate, lighter function — don't merge them.
- Canvas drawing: each connection needs its own `strokeStyle` now instead of one global color. Refactor the draw loop.

**From user:** Nothing. Fully automatic.

---

### 1.2 3-2-1 Countdown Before Recording

**What:** When the user taps record, a 3-second countdown with large animated numerals gives them time to get into position. Each number scales from 1.5× to 1.0× and fades out, with a haptic pulse per tick. Recording begins automatically after "1" completes.

**Where:**
- `app/components/FormCheckCamera.tsx` — Add new phase `"countdown"` between `"ready"` and `"recording"` in the phase state type (line ~28).
- `startRecording()` function (line ~167) — Instead of immediately setting phase to "recording", set to "countdown" first.
- New countdown overlay rendered when `phase === "countdown"` — large centered numeral with CSS scale + opacity animation.
- After 3 seconds, auto-transition to "recording" phase and begin frame capture.

**How it works:**
```
User taps record → phase = "countdown" → 3...2...1 (800ms each, haptic per tick) → phase = "recording"
```
- `navigator.vibrate(50)` fires on each tick (works on Android Chrome, no-op on Safari — graceful)
- Skeleton overlay continues drawing during countdown so user can see their pose
- Cancel button available during countdown (sets phase back to "ready")

**Integration risks:**
- `processFrame()` callback (line ~130) checks `phase === "recording"` to push frames. Countdown frames should NOT be pushed. The check already handles this since phase is "countdown" not "recording".
- `useEffect` at line ~160 that starts RAF loop checks for `phase === "ready" || phase === "recording"`. Add `"countdown"` to this check so skeleton keeps drawing.
- `stopRecording()` should be no-op during countdown phase.

**From user:** Nothing. Replaces instant-start behavior.

---

### 1.3 Exercise-Specific Camera Guide

**What:** Different exercises need different camera angles for accurate analysis. Before recording, show a brief guide recommending phone placement with a matching body silhouette outline on the camera feed. The guide adapts per exercise since `exerciseName` is already passed as a prop.

**Angle mapping:**

| Exercise Category | Best Angle | Why | Silhouette |
|---|---|---|---|
| Squat, Goblet Squat, Front Squat | Side view (90°) | Depth, back angle, bar path | Side profile |
| Deadlift, RDL, Sumo Deadlift | Side view (90°) | Hip hinge, back rounding | Side profile |
| Overhead Press, Push Press | 45° angle | Bar path + symmetry | 3/4 view |
| Bench Press, Incline Press | Side view | Bar path, elbow angle | Side profile |
| Lunge, Bulgarian Split Squat | Front view | Knee cave, balance | Front profile |
| Pull-up, Lat Pulldown | Front view | Symmetry, ROM | Front profile |
| Barbell Row, Cable Row | Side view | Body sway, ROM | Side profile |
| General / Unknown | Any | Full body in frame | Generic outline |

**Where:**
- `app/components/FormCheckCamera.tsx` — New `CameraGuide` sub-component rendered in the "ready" phase (replaces current corner frame guides).
- New file `app/lib/formGuides.ts` — Exercise name → angle category mapping + SVG silhouette path data for each angle.
- Silhouettes are inline SVG `<path>` elements drawn semi-transparently on the camera feed at ~70% frame height.

**How it works:**
- Parse `exerciseName` prop to determine exercise category (fuzzy match — "Barbell Back Squat" → squat category)
- Show a small phone-placement diagram in a toast/card at the top: "Best angle: side view"
- Overlay the matching silhouette on the camera feed as a positioning guide
- Silhouette fades out when recording starts

**Distance estimation (bonus):**
- Use the pixel distance between left hip (landmark 23) and right hip (landmark 24) relative to canvas width
- If ratio < 0.15 → show "Step closer" text
- If ratio > 0.45 → show "Step back" text
- Otherwise → show nothing (good distance)

**Integration risks:**
- Exercise name matching must be fuzzy — names come from the exercises DB and vary ("Barbell Back Squat" vs "Back Squat" vs "Squat (Barbell)"). Use keyword matching, not exact match.
- The silhouette must not interfere with the skeleton overlay — render it below the overlay canvas or at low opacity (20-30%).

**From user:** Position phone as recommended. Guide is shown but not enforced — form check works from any angle, just with varying accuracy.

---

### 1.4 Auto Rep Counting + Per-Rep Scoring

**What:** Detect individual reps by tracking joint angles through their range of motion. Score each rep individually so users can see form degradation across a set. Display a live rep counter during recording. This is the #1 feature every competitor (Tempo, Kemtai, Onyx) has.

**Where:**
- `app/lib/formAnalysis.ts` — New `RepDetector` class with a state machine per exercise type. New `RepResult` type. Updated `FormAnalysisResult` with a `reps: RepResult[]` array.
- `app/components/FormCheckCamera.tsx` — Instantiate `RepDetector` during recording. Show "+1" badge animation on rep detection. Show running count in top corner.
- Results screen — horizontal row of colored circles (one per rep), each colored by that rep's score.

**How it works — state machine per exercise:**
```
Squat/Deadlift:
  "top" (knee angle > 150°) 
  → "descending" (angle decreasing) 
  → "bottom" (angle < threshold or starts increasing) 
  → "ascending" (angle increasing) 
  → "top" = 1 rep completed

Overhead Press:
  "bottom" (elbow angle < 100°) 
  → "pressing" (angle increasing) 
  → "top" (elbow angle > 160°) 
  → "lowering" (angle decreasing) 
  → "bottom" = 1 rep completed
```

Each rep captures:
- Depth angle (min knee/elbow angle reached)
- Symmetry (left vs right difference during that rep)
- Duration (eccentric + concentric timing)
- Per-rep score (0-100)

**Integration risks:**
- Rep detection runs during recording in `processFrame()`. Must be lightweight — just angle comparisons and state transitions, no heavy computation.
- The post-recording `analyzeForm()` should use per-rep data for more accurate overall scoring (weighted average of rep scores instead of frame-aggregate).
- Jittery landmarks can cause false rep detections. Require the angle to change by at least 15° before transitioning states. Add a minimum rep duration (0.8s) to filter spasms.
- The "+1" rep badge needs to animate without blocking the main thread — use CSS animation, not JS-driven.

**From user:** Nothing. Fully automatic. Rep count shown live during recording.

---

### 1.5 Knee Cave (Valgus) Detection

**What:** Detect when knees collapse inward during squats and lunges. Measures the lateral offset between knee and ankle landmarks from front view. High injury-prevention value — this is one of the most common and dangerous form errors.

**Where:**
- `app/lib/formAnalysis.ts` — New `analyzeKneeCave(frames)` function. New `KneeCaveCheck` type added to `FormAnalysisResult`.
- Integrate with real-time color feedback (1.1) — knee connections go red when valgus detected.
- Results screen — new metric card showing knee cave status.

**How it works:**
- From front view: compare knee X-position to ankle X-position for each leg
- Normalize the offset to hip width (distance between landmark 23 and 24) for body-size independence
- If knee moves inward past ankle by more than 8% of hip width → flag valgus
- Track per-rep if rep counting is active
- Also useful from 45° angle, less accurate from pure side view

**Integration risks:**
- Knee cave is most visible from front camera angle. If user is recording from the side, this check has lower accuracy — reduce its weight in the overall score when camera angle is estimated as "side view" (can estimate from shoulder-to-shoulder pixel distance being small).
- Don't double-penalize: if knee cave is detected, don't also flag it in the symmetry check. One penalty per issue.

**From user:** Front camera angle recommended for best detection. Side view can still catch severe cases.

---

### 1.6 Save Form Check History (Discard Video, Keep Results)

**What:** Save the analysis results (score, checks, tips, rep data) to a `form_checks` Supabase table after each form check. Raw video frames are discarded immediately after analysis — never stored, never uploaded. This enables form trends, personal bests, streaks, and achievements.

**Where:**
- New Supabase migration: `form_checks` table
- `app/components/FormCheckCamera.tsx` — After `analyzeForm()` returns results, INSERT into `form_checks`
- Need `useSupabase()` hook access in the component (or pass supabase client as prop)

**Table schema:**
```sql
CREATE TABLE form_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT NOT NULL,        -- squat, deadlift, overhead_press, bench, general
  overall_score INTEGER NOT NULL,     -- 0-100
  depth_angle INTEGER,                -- min knee angle (squats)
  symmetry_diff INTEGER,              -- L/R degree difference
  knee_cave_detected BOOLEAN,
  lockout_complete BOOLEAN,
  rep_count INTEGER,
  duration INTEGER,                   -- seconds
  frame_count INTEGER,
  tips JSONB DEFAULT '[]',            -- array of tip strings
  reps JSONB DEFAULT '[]',            -- array of per-rep scores
  camera_angle TEXT,                  -- side, front, 45deg
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_form_checks_user ON form_checks(user_id, created_at DESC);
CREATE INDEX idx_form_checks_exercise ON form_checks(user_id, exercise_name);
```

**Integration risks:**
- The component is lazy-loaded and doesn't currently have access to the Supabase client or user ID. Two options:
  - Pass `supabase` and `userId` as props from the workout page (cleanest)
  - Use `useSupabase()` inside the component (requires the hook to work inside the dynamic import boundary)
- Don't block the results screen on the DB write. Fire-and-forget with a `.then()` error handler.
- Privacy notice on the UI should be updated: "Video is never stored. Only your score and metrics are saved."

**From user:** Must be logged in. Data is private to the user.

---

### 1.7 Real-Time Haptic Cues During Recording

**What:** Short haptic vibrations alert users to form issues mid-set since they can't look at the screen while lifting. Different vibration patterns for different errors. Throttled to max 1 cue per 3 seconds to avoid spamming.

**Where:**
- `app/components/FormCheckCamera.tsx` — In `processFrame()`, after real-time form checks (from 1.1), fire haptics when errors persist.
- New throttle/cooldown ref to prevent spamming.

**Vibration patterns:**
```
Knee cave detected:    navigator.vibrate([50, 30, 50])        // double buzz
Go deeper (squat):     navigator.vibrate([100])                // single long
Back rounding:         navigator.vibrate([50, 30, 50, 30, 50]) // triple buzz
Rep completed:         navigator.vibrate([30])                  // short tap
Recording started:     navigator.vibrate([50])                  // single tap
Recording halfway:     navigator.vibrate([30, 20, 30])          // double tap
Recording done:        navigator.vibrate([100, 50, 100])        // long pattern
```

**How it works:**
- Each frame during recording, if a form error is detected AND the error has persisted for 3+ consecutive frames AND the cooldown timer (3 seconds) has expired → fire the matching vibration pattern
- Cooldown ref tracks last vibration timestamp. Reset per error type so different errors can fire independently.
- `navigator.vibrate()` is supported on Android Chrome. Safari/iOS does not support it — graceful no-op, no error.

**Integration risks:**
- Vibration during recording must not interfere with phone stability if propped up. The vibrations are very short (50-100ms) so this should be fine.
- Don't fire haptics during countdown or analyzing phases — only during active recording.
- Must be toggleable. Add a `hapticCues` setting (default: on) in the user's preferences or as a toggle on the form check UI itself.

**From user:** Phone must not be on silent/vibrate-off mode (Android). Can be toggled off if distracting.

---

## TIER 2 — Medium Impact (Build Next)

These features improve the quality feel and add depth to the analysis.

---

### 2.1 Landmark Jitter Smoothing (1-Euro Filter)

**What:** MediaPipe landmarks jitter frame-to-frame, making the skeleton look shaky on screen. A 1-Euro filter adaptively smooths slow movements (kills jitter) while letting fast movements through with minimal lag. Makes the skeleton overlay look dramatically more stable and professional.

**Where:**
- New utility: `app/lib/oneEuroFilter.ts` — The filter class (~30 lines)
- `app/components/FormCheckCamera.tsx` — Apply filter to all 33 landmarks in `processFrame()` before passing to `drawSkeleton()`

**How it works:**
```
Recommended parameters: minCutoff = 1.0, beta = 0.007, dCutoff = 1.0
```
- Create one filter instance per landmark per axis (33 landmarks × 3 axes = 99 filters)
- On each frame, pass raw landmark values through the filter before drawing
- The filter adapts: when movement is slow (standing still), it smooths heavily (kills jitter). When movement is fast (mid-rep), it lets the raw signal through (minimal lag).
- Alternative simpler approach: Exponential Moving Average with alpha=0.5, but this adds noticeable lag during fast reps.

**Integration risks:**
- Filters must be reset when camera flips or tracking is lost (landmarks jump to new positions). Reset when `flipCamera()` is called or when landmarks are absent for >0.5s.
- Apply filtering BEFORE drawing but use the RAW unfiltered landmarks for form analysis. Smoothed values could mask real form errors.
- Memory: 99 filter instances is trivial. Performance: one multiply + add per filter per frame is negligible.

**From user:** Nothing. Pure visual improvement.

---

### 2.2 Double-Pass Neon Skeleton Rendering

**What:** Draw each bone segment twice for a "Tron-like" neon look: first pass with large shadow blur for a soft outer glow, second pass with thin white/bright inner line for crisp definition. Reads well over any camera background (dark gym, bright outdoor, etc.).

**Where:**
- `app/components/FormCheckCamera.tsx` — `drawSkeleton()` function. Change from single-pass drawing to double-pass.

**How it works:**
```
Pass 1 (glow):  shadowBlur = 15, shadowColor = "rgba(0,255,170,0.6)", lineWidth = 6, strokeStyle = "#00ffaa"
Pass 2 (crisp): shadowBlur = 0, lineWidth = 2, strokeStyle = "#ffffff"
```
- Same path data drawn twice — first for the bloom, then for the sharp inner line
- Joint dots: filled circle at radius 5px, outer ring at radius 8px at 40% opacity
- Active measured joint (e.g., knee during squat): animate outer ring radius between 8px and 12px over 600ms

**Integration risks:**
- Double draw calls = ~2× canvas rendering cost. Test on low-end phones. If performance drops below 24fps, fall back to single-pass rendering.
- When combined with real-time color feedback (1.1), the glow color changes per-joint too. The inner white line stays white regardless — it's the glow that communicates the status.

**From user:** Nothing. Visual-only change.

---

### 2.3 Progress Ring Around Record Button

**What:** Replace the static record button with one that has an SVG arc filling around it over 60 seconds. User can see at a glance how much recording time remains without reading numbers.

**Where:**
- `app/components/FormCheckCamera.tsx` — The controls section (currently around line ~300). Wrap the record button in an SVG ring.

**How it works:**
- SVG circle with `stroke-dasharray` = circumference, `stroke-dashoffset` decreasing as elapsed increases
- Formula: `offset = circumference × (1 - elapsed / 60)`
- Ring is 3px wide in accent color (#00FFAA) with a subtle `drop-shadow(0 0 4px rgba(0,255,170,0.3))` filter
- Updates every second via the existing `elapsed` state

**Integration risks:**
- The record button already has `ring-4 ring-red-500/30` styling. The progress ring should be a separate SVG element positioned absolutely around the button, not replacing the existing ring.
- On the results screen, the ring is not shown (already hidden by `phase !== "results"` check).

**From user:** Nothing. Visual enhancement.

---

### 2.4 Animated Score Reveal on Results

**What:** When results appear, the score ring fills over 1.2 seconds with an ease-out curve while the number counts up from 0. A radial glow behind the ring pulses once. Makes the results screen feel satisfying and premium.

**Where:**
- `app/components/FormCheckCamera.tsx` — `ResultsView` component. Add animation on mount.

**How it works:**
- `useEffect` on mount: start a `requestAnimationFrame` loop
- Over 1200ms (ease-out timing), animate:
  - `stroke-dasharray` from `0 264` to `${(score/100)*264} 264`
  - Number display from 0 to final score
  - Background glow opacity: 0 → 0.6 → 0.3
- Sound effect (optional): a subtle "ding" at completion if not muted

**Integration risks:**
- The score ring SVG currently uses inline `strokeDasharray` prop. Need to switch to a state-driven value that animates on mount.
- Don't re-animate on re-renders — use a `hasAnimated` ref to run the animation only once.

**From user:** Nothing. Pure delight moment.

---

### 2.5 Lockout / Range of Motion Detection

**What:** Flag incomplete hip extension at the top of deadlifts, incomplete lockout on overhead press, or partial range of motion. Measures the max angle reached at the "top" position of each rep.

**Where:**
- `app/lib/formAnalysis.ts` — New `analyzeLockout(frames, exerciseType)` function. New `LockoutCheck` type.
- Integrates with rep detection (1.4) — check lockout at each rep's "top" position.

**Lockout thresholds:**
| Exercise | Joint | Full Lockout | Partial |
|---|---|---|---|
| Deadlift | Hip angle | > 170° | 150°-170° |
| Overhead Press | Elbow angle | > 165° | 140°-165° |
| Squat | Hip + Knee | Both > 160° | 140°-160° |
| Bench Press | Elbow angle | > 160° | 135°-160° |

**Integration risks:**
- Lockout check depends on rep detection (1.4) to know when the "top" position occurs. Build after rep counting.
- Some exercises intentionally avoid full lockout (e.g., continuous tension squats). Don't penalize heavily — flag as "note" not "error".

**From user:** Side camera angle gives best detection for press and deadlift lockout.

---

### 2.6 Rep Tempo / Speed Analysis

**What:** Measure eccentric (lowering) vs concentric (lifting) phase duration for each rep. Useful for hypertrophy-focused users who want controlled eccentrics. Displayed as "2.1s ↓ / 1.0s ↑" per rep.

**Where:**
- `app/lib/formAnalysis.ts` — Add timing to the `RepDetector` state machine (1.4). Each state transition records a timestamp.
- `RepResult` type gets `eccentricMs` and `concentricMs` fields.
- Results screen: show tempo in per-rep breakdown cards.

**How it works:**
Using the rep detection state machine timestamps:
- Eccentric duration = time from "top"/"bottom" start to "bottom"/"top" (direction depends on exercise)
- Concentric duration = time from "bottom"/"top" to "top"/"bottom"
- Flag if eccentric is under 1s (too fast for hypertrophy) or if concentric is over 4s (potential grind/failure)

**Integration risks:**
- Tempo analysis depends on rep detection (1.4). Build after.
- Landmark jitter can cause micro-oscillations at the top/bottom positions, making phase transitions noisy. Use the 1-Euro filtered landmarks or require angle change > 5° to confirm a phase transition.

**From user:** Nothing. Automatic measurement.

---

## TIER 3 — Polish & Delight (When Ready)

These features add gamification, social hooks, and edge-case handling.

---

### 3.1 Analyzing Phase — Scan Animation

**What:** Replace the generic spinner during the analysis phase with a "scanning" animation: a gradient line sweeps top-to-bottom over the last captured skeleton, with text cycling through "Analyzing depth..." → "Checking symmetry..." → "Evaluating bar path..."

**Where:**
- `app/components/FormCheckCamera.tsx` — The analyzing overlay (currently around line ~272).

**How it works:**
- When recording stops, freeze the last skeleton frame on the overlay canvas (don't clear it)
- Overlay a CSS gradient animation — a bright horizontal line that `translateY` from 0% to 100% over 2 seconds
- Rotate status text every 800ms through the analysis steps
- Transition to results when `analyzeForm()` completes

**From user:** Nothing. Makes the wait feel intentional rather than broken.

---

### 3.2 Form Gamification — Streaks, PBs, Achievements

**What:** Track form streaks (consecutive sessions scoring 70+), personal bests per exercise (gold animation when set), and unlock achievements tied into the existing achievement system.

**Achievements:**
| Achievement | Criteria | Rarity |
|---|---|---|
| Perfect Form | Score 95+ on any exercise | Rare |
| Symmetry Master | L/R delta under 3° | Uncommon |
| Deep Squatter | Below parallel 5 sessions | Uncommon |
| Consistency King | 10 form checks in 30 days | Rare |
| Iron Posture | Deadlift with 0 back rounding flags, 3 sessions | Rare |
| Rep Machine | 10+ reps in one form check with all scores 80+ | Epic |

**Where:**
- Depends on `form_checks` table (1.6)
- Query history on results screen to check for PBs and streaks
- Wire achievements into existing `achievements` table and `checkAchievements()` system
- Form trend sparkline: query last 5 form checks for the same exercise, render as mini SVG sparkline on results

**From user:** Must be logged in. Multiple form checks needed to unlock achievements and see trends.

---

### 3.3 Shareable Results Card

**What:** Generate a 1080×1920 image card (Instagram Story format) with the score ring, exercise name, date, rep count, and key metrics. User taps "Share" and gets the native share sheet. Subtle "Analyzed by Ascend" watermark = free marketing.

**Where:**
- `app/components/FormCheckCamera.tsx` — New `generateShareCard()` function in ResultsView.
- Share button added to the results action row.

**How it works:**
- Create an offscreen `<canvas>` at 1080×1920
- Draw: dark background, score ring (large), exercise name, date, metric cards (depth/symmetry/reps), tips, watermark
- `canvas.toBlob()` → `new File()` → `navigator.share({ files: [...] })`
- Fallback: if Web Share API unavailable, offer "Copy to clipboard" or download

**Integration risks:**
- `navigator.share()` with files requires HTTPS and user gesture (button click). Already satisfied since it's triggered by a button tap.
- Canvas rendering for the card should use hardcoded colors (not CSS variables) since it's an offscreen canvas — same lesson as the skeleton drawing fix.

**From user:** Tap "Share" button. Choose where to share.

---

### 3.4 Low Light Warning

**What:** Detect poor lighting conditions and show a non-blocking advisory banner. Never blocks usage — just warns that accuracy may be reduced.

**Where:**
- `app/components/FormCheckCamera.tsx` — In `processFrame()`, sample brightness every ~60 frames.

**How it works:**
- Every 60 frames (~2 seconds), sample a 50×50 pixel region from the center of the hidden canvas via `getImageData()`
- Calculate mean luminance: `(R + G + B) / 3` averaged across all sampled pixels
- If mean luminance < 40 (out of 255), show a small banner: "Low light — accuracy may be reduced"
- Banner auto-dismisses when light improves, or user can tap to dismiss

**From user:** Nothing. Advisory only — user can ignore or adjust lighting.

---

### 3.5 Form Trend Sparkline on Results

**What:** Show a mini sparkline on the results screen comparing the last 5 form check scores for this exercise. If the score improved, show encouragement: "Your squat form improved 8 points this month."

**Where:**
- `app/components/FormCheckCamera.tsx` — ResultsView component. Add sparkline below the score.
- Query `form_checks` WHERE `exercise_name` matches, ORDER BY `created_at` DESC, LIMIT 5.

**How it works:**
- On results mount, query the user's form check history for this exercise
- Render as a small SVG path (sparkline) with dots at each data point
- Current score highlighted with a larger dot
- If current > previous: green text "↑X points from last check"
- If current < previous: neutral text "X points below your best"
- If first time: "First form check for this exercise!"

**Depends on:** `form_checks` table (1.6)

**From user:** At least 2 form checks on the same exercise to see trend data.

---

## FUTURE IDEAS (Backlog)

These are bigger features that require significant work but would make Form Check best-in-class.

---

### Ghost Overlay / Ideal Form Comparison
Record an "ideal rep" or load a reference skeleton, then overlay it semi-transparently on the user's camera feed so they can match their movement to the ideal. Aligned at the hip. Requires solving body proportion normalization — a 5'2" user and a 6'4" user have very different landmark positions for the same correct form.

### Problem-Frame Replay with Timeline Scrubber
After recording, let users scrub through annotated frames. Color the timeline green/amber/red by form quality per frame. Tap any point to see the skeleton at that moment with angle labels overlaid. Requires saving canvas frame snapshots during recording (memory-intensive — ~500KB per frame × 1800 frames at 30fps = ~900MB for 60s). Would need to downsample to ~5fps for replay.

### Multi-Set Support
Allow recording across multiple sets with rest periods. Auto-detect rest (no significant movement for 30+ seconds) and segment the recording into sets. Show per-set and per-rep scores. "Your form dropped on set 4 — consider reducing weight."

### Velocity-Based Training (VBT) Metrics
Track the speed of the concentric phase. Display bar velocity in m/s. Useful for powerlifters — when velocity drops below a threshold, the set should end (velocity loss = fatigue indicator). Requires calibrating pixel-to-real-world distance using known body proportions.

### Coach Mode — Record Someone Else
The user holds the phone and records their training partner. Skeleton + real-time feedback shown on screen. The recorder can see cues and call them out verbally. Shared results sent to the lifter's account via QR code scan or friend link.

### Exercise Library Expansion
Add form checks for bodyweight exercises: pull-ups (shoulder engagement, chin over bar), push-ups (elbow angle, body alignment), planks (hip sag detection), dips (depth + forward lean), and yoga poses (hold stability). Each needs its own detection rules, angle thresholds, and silhouette guides.

### Warm-Up Form Check
Offer a quick form check during warm-up sets with lighter weight. Compare warm-up form to working set form — "Your depth decreased 12° between warm-up and working weight. You may need more warm-up sets or mobility work."

### Injury Risk Score
Combine knee cave, back rounding, asymmetry, and lockout data into an injury risk assessment. Highlight the body regions under stress on a body diagram. "High stress on lower back — 3 of 5 reps showed rounding beyond safe threshold."

### Orientation Lock
Lock screen to portrait via `screen.orientation.lock('portrait')` when Form Check opens. Fall back gracefully (some browsers restrict the API) with a "Rotate to portrait" overlay if landscape detected.

### Battery / Performance Guard
If `navigator.getBattery()` reports below 15%, show a warning that camera processing is battery-intensive. If frame processing time (measured via `performance.now()` around the MediaPipe `detectForVideo` call) exceeds 100ms consistently, auto-reduce canvas resolution to 480×360 to maintain smooth skeleton overlay.

---

## Build Order Summary

| Priority | Feature | Effort | Depends On |
|---|---|---|---|
| 1.1 | Real-time color feedback | Medium | — |
| 1.2 | 3-2-1 countdown | Small | — |
| 1.3 | Exercise camera guide | Medium | — |
| 1.4 | Auto rep counting | Large | — |
| 1.5 | Knee cave detection | Medium | 1.1 (for color) |
| 1.6 | DB persistence | Medium | — |
| 1.7 | Haptic cues | Small | 1.1 (for checks) |
| 2.1 | 1-Euro jitter filter | Small | — |
| 2.2 | Double-pass neon skeleton | Small | — |
| 2.3 | Progress ring | Small | — |
| 2.4 | Animated score reveal | Small | — |
| 2.5 | Lockout / ROM detection | Medium | 1.4 (rep counting) |
| 2.6 | Rep tempo analysis | Medium | 1.4 (rep counting) |
| 3.1 | Analyzing scan animation | Small | — |
| 3.2 | Form gamification | Medium | 1.6 (DB) |
| 3.3 | Shareable card | Medium | — |
| 3.4 | Low light warning | Small | — |
| 3.5 | Form trend sparkline | Small | 1.6 (DB) |
