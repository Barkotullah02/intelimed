# AI Assistant — Diagnosis & Fix (2026-09-05)

## TL;DR
**The backend AI works.** The problem is on the **mobile app side**: Gemini responses take
**7–25 seconds**, and the Flutter app makes the call with **no request timeout** and only a
"Thinking…" spinner. On a real phone a request that long is often dropped by the mobile
network/OS (or the user assumes it froze) — when it drops, the app's `catch` block shows
*"Sorry, I couldn't process that right now."* So the AI looks broken even though the server
answered.

---

## What I verified (live, against the VPS `http://91.98.154.10:8080`)

| Check | Result |
|---|---|
| `POST /api/chat` | ✅ **HTTP 200**, real Gemini answer (not the offline stub) |
| `GET /api/chat/history` | ✅ **HTTP 200** |
| Gemini API key loaded (`gemini.isConfigured()`) | ✅ yes — answers are generated, not the fallback |
| Response latency (short prompt) | ~**7 s** |
| Response latency (long prompt) | ~**25 s** |
| Backend read timeout | 45 s (`GeminiClient`) |
| App HTTP request timeout | ❌ **none** (`http.Client()` default = wait forever) |

The offline fallback text is *"…please consult your doctor or pharmacist — and seek emergency
care for anything urgent."* — I did **not** get that, so the real Gemini path is active.

## Root cause (ranked)
1. **High latency + no app-side timeout.** `lib/api/api_client.dart` `_send()` awaits
   `http.post` with no `.timeout(...)`. A 7–25 s request either feels frozen or is killed by the
   network, and the catch shows the generic error.
2. **`maxOutputTokens = 800`** in `GeminiClient.complete()` makes long answers slow (that's the
   25 s case). Lowering it roughly halves worst-case latency.

## What is NOT the cause (ruled out)
- ❌ Missing/!invalid API key — answers are real, generated content.
- ❌ Wrong endpoint / model 404 — `/chat` returns 200 with `gemini-3.6-flash`.
- ❌ Backend down — health is UP, other endpoints work.
- ❌ Cleartext HTTP blocked — other API calls (login, drugs, consultations) work from the app.

---

## Fixes

### A. App: add an HTTP timeout + clearer error  ✅ (applied in this change)
`lib/api/api_client.dart` — wrap requests in `.timeout(const Duration(seconds: 60))` and throw a
clear `ApiException('The server took too long to respond…')`. Prevents the infinite "Thinking…"
hang and gives an honest message. **Requires an app rebuild** (`flutter run` / reinstall).

### B. Backend: make Gemini faster  ✅ (applied in source — needs redeploy)
In `springRestApi/src/main/java/com/intellimeds/ai/client/GeminiClient.java`, `complete()`, lower the token cap:
```java
"generationConfig", Map.of(
    "temperature", 0.4,
    "maxOutputTokens", 500   // was 800
)
```
Then redeploy on the VPS:
```bash
cd ~/projects/intelimed/springRestApi && git pull && ./mvnw clean package -DskipTests && sudo systemctl restart intelimed
```

### C. Optional later: stream the response
Gemini supports `:streamGenerateContent`. Streaming tokens to the app would make it feel instant
even at 7 s+. Bigger change (SSE/WebSocket) — not needed to make it work, only to make it feel
fast.

---

## How to confirm it's fixed
1. Rebuild the app (fix A) and, if you deploy fix B, restart the backend.
2. In the app, open **Assistant**, ask "What is ibuprofen used for?", and **wait up to ~10 s**.
3. You should get a real answer. If you still get the error, check the phone is on a stable
   connection and run `journalctl -u intelimed -f` on the VPS while sending to watch the request
   arrive.
