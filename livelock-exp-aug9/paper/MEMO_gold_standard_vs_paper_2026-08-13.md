# Memo: Reconciling `agentic_livelock_threats.tex` with the current gold standard

Date: 2026-08-13
Scope: `LIVELOCK-GOLD-DATA/*_GOLD.csv` (4 files) vs. `LIVELOCK-EXP-Aug9/paper/agentic_livelock_threats.tex`
Prior input: `LIVELOCK-EXP-Aug9/paper/livelock_paper_statistical_review.md` (Claude's beta statistical review)

All numbers below were computed directly from the four gold CSVs on 2026-08-13. Where a claim could not be verified from the data on disk, that is stated explicitly rather than assumed.

**Status as of this revision:** the eight `.tex` edits listed at the bottom of this memo (Section "Summary of required `.tex` edits") have been applied to `agentic_livelock_threats.tex`. Tables II, III, IV, and V are rebuilt from the gold CSVs with real N and, where space allowed, Wilson CIs; Table V is split into URL-channel and RAG-channel sub-tables; the Qwen3-4B null-control decision, the Llama Baseline harness discrepancy, and the negative-AILD cells are called out explicitly in new subsections. Sentences that require a judgment call rather than a number (claim strength, root-cause explanation, how to characterize a gap) are left in the `.tex` as `[FILL IN: ...]` placeholders describing the direction of the point, for you to write in your own words. Tiers 2, 5, and 6 from the Claude review (significance tests, mixed-effects model, Cohen's h / error bars) are still open and are not addressed by this revision — see item 8 below.

---

## 0. Decision on the table: Qwen3-4B

Qwen3-4B shows 0.0% liveness failure in all 8 attack arms (Baseline n=100/100, Prompt-only n=100/100, Controller-only n=60/60, Conservative n=60/60, benign and adversarial), 480 trials total, 0 failures.

The Claude review flagged this as anomaly (a) and recommended checking whether it is a real finding or a harness bug before trusting the rows. Team decision, per this session: do not investigate further. Keep Qwen3-4B in the 2A URL attack table only, as a footnoted null control, with the stated reason being low instruction-following rather than a resolved technical root cause. Exclude it from:
- All pooled/aggregate attack statistics (Tables III/IV equivalents)
- The defense evaluation entirely (already the case in the gold data: no Qwen3-4B rows exist in either defense CSV)
- The mixed-effects model recommended in Tier 5

This is a closed item. It does not need further engineering time.

---

## 1. Headline: the review's Tier 4 problem (thin N in Table V) is already solved by data collected since the review

The review reverse-engineered Table V as N=10 per cell from the decimal precision of its published values, and used that to argue the D-MTD headline claim rests on the thinnest data in the paper.

Computed directly from the two defense gold files today:

| File | Min N per cell | Mean N per cell | Max N per cell |
|---|---|---|---|
| `2a_url_defense_GOLD.csv` (Qwen14B, Qwen7B, Llama × 4 regimes × 4 defenses × 2 conditions) | 40 | 78.0 | 100 |
| `2b_rag_defense_GOLD.csv` (Qwen14B, Qwen7B × 4 regimes × 4 defenses × 2 conditions) | 40 | 40.0 | 40 |

This clears the review's own Tier 4 target ("N≥30-50 minimum, N≥50 if compute allows") for effectively every defense cell in the current dataset. The work to get here (2A defense Llama/Qwen7B/Qwen14B, 2B defense Qwen7B/Qwen14B) is done and sitting in `gold_standard/`. **The paper's Table V has not been regenerated from it.**

Action: rebuild Table V directly from `2a_url_defense_GOLD.csv` and `2b_rag_defense_GOLD.csv`, reporting N and Wilson 95% CI per cell (Tier 1), which is now pure bookkeeping since the counts are already in the CSVs.

---

## 2. The paper's current Table III/IV/V numbers do not reproduce from the current gold standard

I tried reproducing the paper's published numbers against the gold data using several plausible poolings:

- All 6 attack models pooled (2A URL only): Baseline benign 8.33%, adv 11.5%; Controller-only benign 8.33%, adv 72.24%. Paper says 4.55% / 25.58% and 4.55% / 74.87%.
- Same, excluding Qwen3-4B: Baseline benign 10.0%, adv 13.92%; Controller-only benign 10.0%, adv 88.0%.
- 2A + 2B combined, excluding Qwen3-4B: Baseline benign 7.12%, adv 16.93%; Controller-only benign 6.25%, adv 79.11%.
- Qwen2.5-7B alone (2A URL, matching the paper's stated "default model"): Controller-only benign 50.0% (not 4.55%), adv 100.0%.
- Table IV's overall benign/adversarial (3.41% / 49.35%): closest attempt (2A+2B combined, excl. Qwen3-4B) gives 4.86% overall benign-side hit-budget rate across all conditions, not a clean match either.

None of these reproduce the published table. This is not a claim that the published numbers are wrong for the dataset they were computed on — it is a statement that **the current gold standard is a materially different (larger, more model-complete) dataset than whatever produced the current `.tex` tables**, most likely an earlier snapshot from before the Aug 9-13 consolidation (Gemma, Qwen 14B, Llama, Mistral, and Qwen3-4B were added to the attack pool over that window, per `EXPERIMENT_TRACKER.md`).

Action: Tables III, IV, and V need a full, traceable recompute script run against the four gold CSVs, not a patch of the existing numbers. Treat the current `.tex` table values as placeholders to be replaced, not as a baseline to reconcile against.

---

## 3. Model coverage: Table V lists three models that have no defense data

The gold standard's defense coverage is narrower than the paper's Table V model list:

| Model | 2A URL Attack | 2B RAG Attack | 2A URL Defense | 2B RAG Defense |
|---|---|---|---|---|
| Qwen2.5-7B | in gold | in gold | in gold (n=2560) | in gold (n=1280) |
| Qwen2.5-14B | in gold (573/640) | not yet run (Colab TODO) | in gold (n=2364) | in gold (n=1280) |
| Qwen3-4B | in gold, null control | not run, excluded by decision | **no data** | **no data** |
| Llama3.1-8B | in gold | in gold | in gold (n=2560) | **no data** |
| Mistral-7B | in gold | in progress (370/640), not gold | in progress (1730/~2560), not gold | **no data** |
| Gemma3-12B | in gold | in gold | **excluded by design** (needs `Gemma3ForConditionalGeneration`) | **excluded by design** |

Table V currently reports AILD for all 6 models under a defense column. Only 3 models (Qwen2.5-14B, Qwen2.5-7B, Llama3.1-8B) have any defense rows at all, and only 2 of those 3 (both Qwen sizes) have RAG-channel defense rows. Llama has no RAG defense; no model has both defenses AND is Gemma or Mistral.

Action: Table V should be split into two sub-tables (URL-channel defense, RAG-channel defense) with only the models that actually have rows in each. Do not present a single 6-model table.

---

## 4. D-MTD's headline claim needs a channel qualifier

The abstract and Section VII-B.4 claim D-MTD "reduces AILD to zero across the majority of model-regime configurations." Checked against both defense gold files, restricted to the two regimes where the attack is strong (Controller-only, Conservative):

**URL channel (`d_mtd`), Controller-only / Conservative:**

| Model | Controller-only AILD | Conservative AILD |
|---|---|---|
| Qwen2.5-14B | 0.0% | 0.0% |
| Qwen2.5-7B | 0.0% | 0.0% |
| Llama3.1-8B | 0.0% | 0.0% |

**RAG channel (`rag_d_mtd`), Controller-only / Conservative:**

| Model | Controller-only AILD | Conservative AILD |
|---|---|---|
| Qwen2.5-14B | 10.0% | 17.5% |
| Qwen2.5-7B | 12.5% | 10.0% |

D-MTD is a large, real improvement on RAG too (100% AILD under `none`/`budget_cap` drops to 10-17.5%), but it is not zero, and the two models with RAG defense data are the only two that are also fully zeroed on URL. The claim as written ("reduces AILD to zero across the majority of model-regime configurations") is true only if URL-channel configurations dominate the count, which they currently do only because RAG defense coverage is thinner (2 models vs. 3, no Llama).

Action: qualify the claim by channel in the abstract, Section VII-B.4, and the conclusion. Suggested wording direction: "D-MTD eliminates AILD entirely across all evaluated URL-channel configurations and reduces RAG-channel AILD from 100% to 10-17.5% in the two enforced regimes" — accurate to both channels rather than only the stronger one.

---

## 5. New finding not in the Claude review: benign-condition trials are mostly deterministic replicates, not independent draws

This was found by inspecting raw per-trial rows rather than the aggregated tables the review had access to.

All four gold CSVs use exactly 2 fixed task instances per channel (`arith_37_42`, `count_r_strawberry` for URL; `deadline_policy`, `policy_applicability` for RAG), decoded greedily (`policy` column is uniformly `"greedy"` in every attack/defense row that has the column). Checking whether a full (model, regime, condition) cell collapses to ≤2 unique outcomes when the `trial` index is dropped:

| File | Condition | Cells collapsing to ≤2 unique outcomes | Total cells |
|---|---|---|---|
| `2a_url_attack_GOLD.csv` | benign | 24 of 24 | 24 |
| `2a_url_attack_GOLD.csv` | attacker_controlled | 4 of 24 | 24 |
| `2a_url_defense_GOLD.csv` | benign | 36 of 48 | 48 |
| `2a_url_defense_GOLD.csv` | attacker_controlled | 0 of 48 | 48 |
| `2b_rag_defense_GOLD.csv` | benign | 6 of 32 | 32 |
| `2b_rag_defense_GOLD.csv` | attacker_controlled | 0 of 32 | 32 |

Example: Qwen2.5-7B, Controller-only, benign, 2A URL attack — 60 rows, but only 2 unique rows once `trial` is dropped (`arith_37_42` always succeeds with `last_conf=0.95`, `count_r_strawberry` always fails with `last_conf=0.20`). Adversarial cells for the same model/regime show genuine per-trial variation in `last_conf` (0.87, 0.89, 0.86, ...), consistent with the adversarial channel's designed confidence jitter — so this issue is specific to the benign side, where the channel is deterministic by design and there is nothing to vary trial-to-trial beyond which of the 2 tasks was drawn.

Practical consequence: an "N=60, benign LF=50%" cell is really "1 of 2 fixed tasks always fails," replicated 30 times each. The point estimate is still meaningful at the task level, but a Wilson CI computed on N=60 overstates precision — the informative sample size on the benign side is closer to the number of distinct task instances (2) than to the trial count. Adversarial-side CIs are not affected by this specific issue.

Action: add this as an explicit disclosure in the Methods section (this is exactly what the review's Tier 6 asked for — "state the number of distinct task instances" — but now with the exact collapse counts to back it up). Consider whether benign-side CIs should be reported at the task level or flagged as illustrative rather than inferential.

---

## 6. Confirmed real: Llama3.1-8B's Baseline anomaly (review anomaly b) — plus a new harness inconsistency

The review's anomaly (b) — Llama hitting saturated AILD at Baseline, the regime every other model treats as benign — is confirmed at full power in the defense gold file: `2a_url_defense_GOLD.csv`, Llama, Baseline, `none` defense: benign 0% (n=100), adversarial 77% (n=100), Wilson CI on the adversarial side [67.9%, 84.2%]. This is real and deserves its own paragraph, as the review suggested.

While checking this, a separate inconsistency turned up: the **attack** gold file gives a different benign-side number for the identical model/regime/condition. `2a_url_attack_GOLD.csv`, Llama, Baseline, benign: 50% LF (n=100), vs. the **defense** file's `none`-defense arm for the same model/regime/condition: 0% LF (n=100). The adversarial side also differs (67.35% in the attack file vs. 77% in the defense file's `none` arm). Since the defense harness's `none` condition is supposed to reproduce the plain attack harness, these two numbers should match and currently do not.

This was not visible to the Claude review, which only had the published table values, not the two source harnesses' raw benign rates side by side.

Action: before recomputing Tables III/IV/V, resolve whether the attack notebook (`2A-URL-Main.ipynb`) and the defense notebook's `none`-defense arm (`2A_URL_Defense_GPU_01_Bizon.ipynb`) are running the same benign-channel logic for Llama. If they genuinely differ (e.g., different prompt template, different benign-channel confidence schedule), Table III (attack) and Table V (defense) cannot be presented as using a consistent Baseline reference, and the paper needs to say so.

---

## 7. Also confirmed real at full N, previously unremarked: two more large defense anomalies

Found while pulling exact AILD values for the Table V rebuild, at N=100 (well-powered, not the n=10 regime the review worried about):

- Llama3.1-8B, Prompt-only, `early_abort`: AILD = **-40.0%** (benign 50% LF vs. adversarial 10% LF, both n=100). Early-abort is making liveness *better* under adversarial conditions than under benign ones for this specific model/regime — the opposite direction of every other early-abort cell.
- Llama3.1-8B, `d_mtd`, Baseline and Prompt-only: AILD = -5.0% and -3.0% respectively — small, but consistently negative, meaning D-MTD's benign-side failure rate is slightly higher than its adversarial-side rate for Llama specifically in the unenforced regimes.

The first of these matches the review's Tier 2.2 discussion of large-magnitude negative AILD cells needing a Fisher's exact check rather than being papered over with a CI, except this one is at n=100 rather than n=10, so it is not a low-power artifact — it needs an explanation in the text, not just a wider confidence interval.

---

## 8. What remains untouched from the Claude review

The data collected since the review resolves Tier 3 (partially — Qwen3-4B by decision, Llama Baseline confirmed real) and Tier 4 (N is now adequate). It does **not** address:

- **Tier 2** — no significance tests (Fisher's exact / two-proportion z-test) or Holm-Bonferroni correction have been run on any cell yet.
- **Tier 5** — no mixed-effects logistic regression (`LF ~ condition*regime + channel_type + (1|model)`) has been fit. This is now well-supported by the data (6 models attack-side, 3-5 models defense-side, N in the tens to hundreds per cell) and should replace Section V-B's percentage-point eyeballing as the review recommended.
- **Tier 6 polish** — Cohen's h effect sizes, Table IV's caption mismatch, error bars on Figures 2/3, are all still open.

---

## Summary of required `.tex` edits

1. **Table III / IV** (attack results): full recompute from `2a_url_attack_GOLD.csv` + `2b_rag_attack_GOLD.csv`, Qwen3-4B excluded from pooled numbers, N and Wilson CI added to every cell.
2. **Table V** (defense results): full recompute, split into URL-channel (Qwen2.5-14B, Qwen2.5-7B, Llama3.1-8B) and RAG-channel (Qwen2.5-14B, Qwen2.5-7B) sub-tables. Remove Gemma3-12B, Mistral-7B, Qwen3-4B from this table — they have no defense rows in gold.
3. **Abstract + Section VII-B.4 + Conclusion**: qualify the D-MTD "reduces AILD to zero" claim by channel (zero on URL, 10-17.5% residual on RAG for the two enforced regimes).
4. **Table II** (model list): footnote Qwen3-4B as an attack-only null control (0/480 failures, excluded for low instruction-following) and mark which models have defense coverage.
5. **Methods (Section V-A)**: add the task-diversity disclosure (2 task instances per channel, greedy decoding, benign-side determinism vs. adversarial-side jitter).
6. **New paragraph near the Baseline discussion**: address Llama's Baseline anomaly as confirmed-real, and flag/resolve the attack-vs-defense harness discrepancy on Llama's benign rate before using both tables side by side.
7. **New paragraph or footnote near Table V**: address the two large, well-powered negative-AILD Llama cells (early-abort Prompt-only, d_mtd Baseline/Prompt-only).
8. Carry forward Tiers 1, 2, 5, 6 from the original review, now applied to the recomputed tables above rather than the current ones.

---

See also: [livelock-paper-gold-reconciliation.canvas.tsx](/Users/tanvir/.cursor/projects/Users-tanvir-Desktop-legal-ai-pipeline/canvases/livelock-paper-gold-reconciliation.canvas.tsx) for the visual walkthrough of the same findings.
