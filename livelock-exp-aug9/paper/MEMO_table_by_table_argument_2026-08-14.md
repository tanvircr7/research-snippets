# Memo: Table-by-table argument for the livelock paper, using gold data current as of 2026-08-14 (afternoon)

Date: 2026-08-14
Scope: `LIVELOCK-GOLD-DATA/*_GOLD.csv` (4 files, current state) vs. `agentic_livelock_threats.tex` (the version last edited 2026-08-13)
Purpose: not a reconciliation memo. This one argues, table by table, why each table belongs in the paper, why the numbers look the way they do, what the confidence intervals say about how much weight the number can bear, and whether the result helps or hurts the paper's central claims.

**Headline finding of this pass, stated first per your request:** the gold standard changed again since the tex was last synced (2026-08-13 to 2026-08-14 afternoon: Mistral-7B added to 2A URL defense, Qwen2.5-14B and Mistral-7B added to 2B RAG attack). Two consequences fall directly out of that:

1. **D-MTD does not zero AILD on the URL channel.** The current `.tex` claims D-MTD reaches 0.0% in every Qwen cell and three of four Llama cells, computed over 3 URL-defense models. With Mistral-7B now in the URL defense gold (2557 rows), D-MTD's adversarial-side failure rate is **37.0%** at Prompt-only (n=100, Wilson 95% CI [28.18, 46.78]) and 1.0% at Baseline (n=100, CI [0.18, 5.45]) for Mistral. Pooled across all 320 Mistral D-MTD adversarial trials, D-MTD's failure rate is 11.88% (38/320); pooled across all 320 Llama D-MTD adversarial trials it is 20.94% (67/320, driven by the already-flagged benign-instability issue, see Table V section below). Only the two Qwen models reach a clean 0/300 and 0/320. The "D-MTD zeros AILD on URL" framing needs to change from a channel-level claim to a **2-of-4-models** claim.
2. **The URL-vs-RAG channel comparison is no longer confounded.** 2B RAG attack now has the exact same 5 models as 2A URL attack (Qwen2.5-7B, Qwen2.5-14B, Llama3.1-8B, Mistral-7B, Gemma3-12B; Qwen3-4B excluded from both as the null control). The "unequal coverage" caveat in the current `.tex` paragraph on cross-channel comparison is resolved. The matched comparison is now a real, well-powered finding, not a preliminary one (see Section 5 below).

Both are argued in full below. The `.tex` needs a second sync pass after this memo; that is a separate, mechanical follow-up, not part of this brainstorming exercise.

---

## 1. Table II (LLM list + coverage) — should it exist, and does the coverage story change?

**The number:** coverage is now 6 models attack-side (5 pooled + Qwen3-4B null control), 4 models URL-defense-side (was 3), 2 models RAG-defense-side (unchanged).

**Why this table should exist.** Every downstream percentage in the paper is meaningless without knowing which models it was computed over and why some models are missing from some tables. A reviewer's first question on any AILD number is "pooled over what?" This table is the answer key, and without it, the negative-AILD and D-MTD-residual findings below look like errors rather than disclosed, real coverage gaps.

**Why the data is the way it is.** Confirmed from `docs`/tracker: Gemma-12B is attack-only by design (its loader is architecturally different — `Gemma3ForConditionalGeneration`, not an engineering-priority decision about the model itself). Qwen3-4B is attack-only by team decision (Section 0 of the prior reconciliation memo) — a null-control classification, not a missing-data gap. Mistral's URL defense run has now finished (2557/2560, 3 failed trials) and should move from "incomplete" to "complete, minor shortfall" in the table footnote. RAG defense coverage (2 models) is unchanged and is the thinnest cell in the matrix — it is a real scope limit, not an oversight, and should stay flagged as such rather than implied to be complete.

**Confidence angle.** This table carries no statistical claims itself, so there's no CI to argue. Its job is to bound the reader's trust in every CI that follows: e.g., a reader should discount the RAG-defense D-MTD numbers below to "2 models' worth of evidence," not "the D-MTD result."

**Does it help or hurt the thesis?** Helps, unconditionally. A coverage table that undersells completeness is more defensible than one a reviewer catches shrinking model counts silently between tables (which is exactly what the pre-Aug-13 draft did with Table V).

---

## 2. Table III equivalent (pooled attack results by regime) — the core "livelock is real" table

**The number, recomputed on current gold (2A + 2B combined, 5 models, Qwen3-4B excluded):**

| Regime | Benign LF% (N) | Adv LF% (N) | AILD |
|---|---|---|---|
| Baseline | 6.01% (998) | 15.84% (972) | 9.83 |
| Prompt-only | 5.70% (1000) | 22.48% (983) | 16.78 |
| Controller-only | 5.01% (599) | 79.85% (546) | 74.84 |
| Conservative | 0.00% (599) | 83.45% (562) | 83.45 |

(Versus the numbers currently in the `.tex`: 7.12/16.93/9.81, 6.62/24.27/17.65, 6.25/79.11/72.86, 0.00/83.48/83.48 — close but not identical, because N grew by roughly 400 to 600 per regime once Qwen2.5-14B RAG and Mistral RAG were added. This is exactly why the memo opens by saying the `.tex` needs a second sync, not because the prior sync was wrong.)

**Why this table should exist.** This is the table that has to carry the paper's single most important claim: that adversarial delegation causes liveness failure, and that the effect is not uniform but regime-dependent. Without it, "controller enforcement is the dominant driver" (the paper's headline mechanism claim) has no evidentiary anchor.

**Why the data is the way it is.** Two confirmed structural facts drive the shape: (1) the Conservative benign row is exactly 0.00% across 599 trials — every benign-channel confidence value in this regime clears $\tau=0.90$ deterministically by construction (the benign channel is designed to converge), so a 0% floor here is expected, not a finding about model behavior. (2) The jump from Prompt-only (22.48% adversarial) to Controller-only (79.85%) is the single largest step in the table — a roughly 3.5x increase in adversarial LF from one regime to the next, coinciding exactly with $\gamma$ flipping from 0 to 1. Both facts are read directly off the aggregation; neither requires an unverified causal claim.

**Confidence angle, argued properly.** The Controller-only and Conservative adversarial cells (N=546, N=562) carry Wilson CIs of roughly ±3.5 points ([76.3, 83.0] and [80.2, 86.3] respectively) — tight enough that "the enforced-regime effect is real" is not resting on a small-N fluke. The unenforced-regime adversarial cells (N=972-983) carry CIs of roughly ±2.3 to ±2.5 points, similarly tight. The benign-side CIs are the weak link: the paper's own Methods disclosure (already in the `.tex`) states benign trials collapse to ~2 unique task outcomes replicated N times, so the "N=998" implies far less independent information than a naive Wilson interval assumes. Practical read: the AILD point estimates on the enforced-regime rows are trustworthy at face value; the benign-side denominators overstate precision, which is already disclosed but is worth restating here because it is the one caveat that could make a skeptical reviewer discount the whole table if it isn't visibly acknowledged near the table itself, not just once in Methods.

**Does it help or hurt the thesis?** Helps. Even with the benign-side caveat, the adversarial-side numbers (which carry legitimate per-trial variation from the confidence-jitter mechanism) show the regime-dependent pattern cleanly and with tight CIs. This table is the strongest evidence in the paper for the core claim.

---

## 3. Per-model AILD breakdown (attack) — the table that walks back the "capability scaling" story

**The number:** Baseline AILD ranges from 0.0% (Qwen2.5-14B, Qwen2.5-7B, Mistral-7B, Gemma3-12B) to 17.35% (Llama3.1-8B, n=98 adversarial, CI [57.56, 75.82] on the adversarial LF itself). At Controller-only, the range is 43.1% (Gemma3-12B) to 100.0% (Qwen2.5-14B, Llama3.1-8B, Mistral-7B).

**Why this table should exist.** The pooled Table III number (74.84% AILD at Controller-only) is an average over models that range from 43% to 100%. A reviewer who only sees the pooled number will assume uniformity; this table is what lets the paper honestly say "the direction is universal, the magnitude is not," which is a stronger and more defensible claim than either "livelock affects all models equally" or "livelock affects some models."

**Why the data is the way it is.** Confirmed, not speculated: Gemma3-12B is the one model that never saturates at 100% AILD even under Conservative (55.0%, n=60, CI on adversarial LF [42.49, 66.91]) — this is a real, reproducible ceiling below 100%, not a small-N artifact, since the CI's upper bound (66.9%) still sits well below the 93-100% range every other model reaches at Conservative. Qwen2.5-7B's Controller-only AILD (50.0%) is exactly half of every other model's Controller-only AILD in this regime (all 100%) — worth flagging as a genuine outlier cell rather than averaging past it, and it is currently unexplained (no root cause has been checked against the raw per-trial logs, so this is an open item, not resolved).

**Confidence angle.** Most adversarial-side CIs in this table are usefully tight (N=40-100 per cell, half-widths of roughly 5-12 points at LF rates near 0% or 100%, wider — up to ±11 points — in the mid-range cells like Gemma3-12B's Controller-only 43.1% [31.18, 55.88]). The mid-range cells are exactly the ones doing the most argumentative work (they're the counter-examples to "controller enforcement always saturates AILD"), and they're also the cells with the widest CIs. That is worth stating plainly: the paper's most interesting per-model finding (heterogeneity, not saturation) is also its least statistically crisp finding.

**Does it help or hurt the thesis?** Cuts both ways, and the paper should say so rather than pick a side implicitly. It hurts the strongest version of the "controller enforcement is dominant and uniform" claim (Gemma3-12B and Qwen2.5-7B are real counter-examples). It helps the paper's overall credibility, because a table that shows heterogeneity and still supports the regime-level pattern is more convincing than one that suspiciously shows six models behaving identically.

---

## 4. Table IV equivalent (overall benign vs. adversarial) — the two-number summary

**The number, recomputed on current gold:** benign 4.60% (N=3196, CI [3.93, 5.38]) vs. adversarial 41.79% (N=3063, CI [40.05, 43.55]); hit-budget rate 4.57% vs. 41.95%, almost identical to the LF rates in both conditions.

(Versus the `.tex`'s current 5.47%/42.35% — again, close but stale by about 600 to 650 trials' worth of newly added RAG-channel data.)

**Why this table should exist.** It is the paper's single quotable number for the abstract and introduction ("liveness failure rises from X% to Y%"). Every other table in the paper is a decomposition of this one number; it earns its place by being the thing a reader who reads only the abstract will remember.

**Why the data is the way it is.** The hit-budget-rate/LF-rate near-identity (4.57% vs. 4.60%, 41.95% vs. 41.79%) is a mechanically clean result: it says an agent that exhausts its budget essentially always liveness-fails, and an agent that liveness-fails essentially always did so by exhausting budget. That correspondence is a coherence check on the metric definitions, not an independent finding — it confirms LF and hit-budget are measuring the same underlying event rather than two different things that happen to correlate.

**Confidence angle.** At N>3000 per condition, both CIs are under ±1 point wide. This is the tightest-CI table in the paper. There is no statistical-power argument against this table; the only caveat is the same benign-side determinism issue as Table III, inherited from the same source data.

**Does it help or hurt the thesis?** Helps, cleanly. This is the one number in the paper that needs no qualification beyond the standing benign-side task-diversity caveat.

---

## 5. URL-vs-RAG channel comparison — now a real finding, not a preliminary one

**The number, on the newly-matched 5-model comparison (URL and RAG now share the identical model set):**

| Regime | URL AILD | RAG AILD | Which channel is higher |
|---|---|---|---|
| Baseline | 3.92% | 15.66% | RAG |
| Prompt-only | 16.71% | 17.00% | RAG (roughly tied) |
| Controller-only | 78.00% | 71.59% | URL |
| Conservative | 90.18% | 76.53% | URL |

**Why this table/figure should exist.** The paper's contribution claim explicitly says the attack framework "unifies tool calls, RAG, and multi-agent delegation." A cross-channel comparison is the one piece of evidence that the unification claim is more than definitional — that the same attack mechanism produces comparable (if not identical) degradation across genuinely different delegation surfaces.

**Why the data is the way it is.** This is now a clean, non-confounded comparison — as of today's gold update, both channels have the exact same 5 models, so the direction reversal (RAG ahead in unenforced regimes, URL ahead in enforced regimes) cannot be explained by "different models were in each channel," which was the confound in the version already in the `.tex`. What is still unconfirmed is *why* the reversal happens — that requires reading the RAG and URL delegation-channel implementations to see whether they differ in something like retrieval-response verbosity or endpoint pool size, which has not been checked in this pass. This memo is not asserting a mechanism.

**Confidence angle.** All eight cells (2 channels × 4 regimes) have N between 271 and 500, giving CIs in the same tight-to-moderate range as the per-model tables above. The Prompt-only "roughly tied" cell (16.71% vs. 17.00%) is the one comparison genuinely inside noise — a 0.29-point gap on N≈480-500 per side is well within a single Wilson CI half-width (~3-4 points), so "roughly tied" is the right characterization, not "RAG wins." The Baseline gap (3.92% vs. 15.66%, an 11.7-point difference) and both enforced-regime gaps (6.4 and 13.65 points) are large enough relative to their CI widths to be real, not noise.

**Does it help or hurt the thesis?** Helps the unification claim (the same qualitative attack pattern — low AILD unenforced, high AILD enforced — holds on both channels) while complicating the "channel doesn't matter" framing the paper would like to make. The honest version of this finding is: the attack generalizes across channels, but the *channel's* interaction with controller enforcement is itself regime-dependent, which is a more interesting and more defensible claim than either "RAG is worse" or "channels are equivalent."

---

## 6. Table V, URL-channel defense — the table that most changed today

**The number:** with Mistral-7B added, D-MTD's adversarial-side failure rate is no longer 0% everywhere. Pooled across all 320 Mistral D-MTD adversarial trials: 11.88% (38/320). Pooled across all 320 Llama D-MTD adversarial trials: 20.94% (67/320). Qwen2.5-14B and Qwen2.5-7B remain at a clean 0/300 and 0/320. The single largest D-MTD residual cell is Mistral-7B, Prompt-only: 37.0% (n=100, CI [28.18, 46.78]).

**Why this table should exist.** This is the paper's evidence for its proposed defense, which makes it the highest-stakes table in the paper — a defense paper whose defense table is wrong or stale is a worse failure mode than an attack table being stale, because the defense claim is the paper's contribution, not just its observation. It has to be right, or explicitly qualified where it isn't.

**Why the data is the way it is.** Two separate, confirmed phenomena, and they should not be merged into one explanation: (1) Llama's residual is concentrated in Baseline (20 failures) and Prompt-only (47 failures) — the same two unenforced regimes where Llama already shows a non-zero *benign*-condition failure rate (already flagged in the existing memo as an unresolved harness discrepancy). Some or all of Llama's D-MTD residual is plausibly the same underlying benign-instability issue leaking into the D-MTD row, not a D-MTD-specific weakness — but this is not confirmed, only plausible, and should be stated as such. (2) Mistral's residual is different in character: Mistral's *benign* condition is a clean 0% across the board (100/100, 100/100 at Baseline/Prompt-only), so Mistral's 37% Prompt-only D-MTD residual cannot be explained by benign contamination the way Llama's can. Mistral's D-MTD failure is a genuine adversarial-side phenomenon and needs its own explanation, which has not yet been investigated (raw per-trial channel-selection and confidence-history logs would need to be read before asserting a mechanism).

**Confidence angle.** N=100 with a CI half-width of about 9-10 points (Mistral Prompt-only: [28.18, 46.78]) is well-powered by this paper's own standards elsewhere in the table — this is not a thin-N artifact the way the original pre-review Table V was. The claim "D-MTD does not fully protect Mistral at Prompt-only" is defensible at this N.

**Does it help or hurt the thesis?** Hurts the strongest form of the D-MTD claim ("reduces AILD to zero across the majority of configurations") in a way the paper needs to absorb rather than paper over: it is no longer true that D-MTD zeros AILD on the URL channel uniformly. It is true that D-MTD zeros AILD for 2 of 4 URL-channel models and reduces it substantially (from 100% under `none`) for the other 2. That is a materially weaker but more honest and more defensible claim, and it should replace the "URL channel: zero everywhere" framing that is currently in the abstract, contributions, and Section 7 discussion.

---

## 7. Table V, RAG-channel defense — unchanged this pass, still the thinnest table

**The number:** unchanged from the prior sync — D-MTD residual of 10.0-17.5% in the two enforced regimes for both Qwen2.5-7B and Qwen2.5-14B; 0% in Baseline/Prompt-only for both.

**Why this table should exist.** It is the direct RAG-channel counterpart to the URL table above, and the paper cannot claim channel-agnostic defense generality (Section 6, "Generality") without showing the defense evaluated on more than one channel.

**Why the data is the way it is.** No new information this pass — the RAG defense gold file (2560 rows, Qwen 7B + Qwen 14B only) has not changed since the last sync. The residual pattern (present in enforced regimes, absent in unenforced ones) is the same qualitative shape as the URL-channel residual just discussed for Llama and Mistral, which is a mild point in favor of a shared mechanism across channels — but with only 2 models here versus 4 on URL, this table alone cannot establish that; it is consistent with it.

**Confidence angle.** N=40 per cell throughout, giving wider CIs than the URL table (e.g., Qwen2.5-14B Conservative rag\_d\_mtd: 17.5%, CI [8.75, 31.95] — a 23-point-wide interval). This is the statistically weakest defense table in the paper. The point estimates are usable for a qualitative claim ("D-MTD reduces but does not eliminate RAG-channel AILD in enforced regimes") but not for a precise magnitude claim ("exactly 10-17.5%") without acknowledging the width.

**Does it help or hurt the thesis?** Net helps, because it is honest about a limitation rather than silent about it, and the qualitative direction (residual in enforced regimes only) is consistent enough with the newly-found URL-channel residual (Section 6) that the two tables now tell a coherent, if incomplete, story: D-MTD's weak point is enforced regimes on channels/models where the verifier pool or benign-channel behavior is somehow less favorable to it. That is a hypothesis, not a confirmed mechanism, and should be labeled as one.

---

## 8. Cross-channel benign-instability note — a new pattern, not yet in the paper at all

**The number:** on the RAG channel, Llama3.1-8B's benign LF is 7.0% at Baseline and 3.0% at Prompt-only (n=100 each); Mistral-7B's benign LF is 3.06% at Baseline (n=98). Every other RAG-channel model/regime combination has 0.0% benign LF. On the URL channel, the same two models (Llama, Mistral) are the only ones with elevated benign or defense-`none` failure rates at Baseline/Prompt-only (Llama: 50%/50% attack-side benign, 0%/50% defense-side benign; Mistral: 0%/0% attack-side, 0%/0% defense-side, i.e., Mistral is actually clean on URL benign).

**Why this should become a table or at least a explicit callout, not stay buried in per-model rows.** Right now the "Llama benign instability" discussion in the `.tex` (Section 7.3, `sec:llama-anomaly`) treats this as a URL-channel-only, Llama-only anomaly. The RAG data shows Llama's benign instability recurs on a second, independent channel (smaller in magnitude: 7%/3% vs. 50%/50%), which argues against "harness bug specific to the URL attack-vs-defense discrepancy" being the *whole* explanation, since the RAG channel has its own separate harness and still shows non-zero Llama benign LF. Mistral showing a small RAG-side benign anomaly (3.06%) that does not appear on its URL side is the opposite pattern and equally unexplained.

**Confidence angle.** These are small-N, low-rate cells (3-7% on n=98-100), so the CIs are wide relative to the point estimate (e.g., a 7% rate on n=100 has a Wilson CI of roughly [3.4%, 13.8%] by the same formula used throughout this memo) — small enough that "this is real but small" is defensible, "this is exactly 7%" is not.

**Does it help or hurt the thesis?** Neutral-to-helpful if disclosed, actively harmful if left implicit. It does not touch the attack's core claim (adversarial channel still shows much larger, well-powered effects than these benign-side blips). It does complicate the existing "Llama's benign instability is a URL harness discrepancy" framing, which should be broadened to "recurs on both channels, magnitude differs, root cause not yet isolated" rather than narrowed to one channel.

---

## What this memo recommends, in priority order

1. **Fix the D-MTD claim first.** This is the paper's contribution, and it is currently overstated in the abstract, the contributions list, and Section 7 relative to the 4-model URL-defense gold standard. Change "zero across the URL channel" to "zero for 2 of 4 URL-channel models (Qwen2.5-7B, Qwen2.5-14B); reduces but does not eliminate AILD for the other 2 (Llama3.1-8B, Mistral-7B), with Mistral's Prompt-only residual (37.0%, n=100) being the largest and least explained."
2. **Re-run the channel comparison as a confirmed, matched-model finding**, not a "preliminary, coverage-limited" one — the coverage limitation that motivated the hedge is gone as of today's gold update.
3. **Resync every pooled number** (Tables III, IV, the abstract's headline percentages) to the current N, which grew by roughly 15-20% since the last tex pass purely from the newly added RAG-channel rows.
4. **Add the RAG-channel benign-instability finding** (Section 8 above) as a short paragraph near the existing Llama URL anomaly discussion, broadening rather than replacing it.
5. Tiers 2 (significance testing) and 5 (mixed-effects model) from the original Claude review remain untouched by this pass and are now more urgent given how much the per-model heterogeneity (Section 3) and the D-MTD residual (Section 6) are doing the paper's most interesting argumentative work while resting only on Wilson CIs and eyeballed comparisons.

This memo intentionally stops short of re-editing `agentic_livelock_threats.tex`. That is a mechanical follow-up once you've decided which of the above framings you want to keep, sharpen, or argue differently — say so and the sync pass is quick.
