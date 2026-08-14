# Statistical Rigor Review — "Agentic System Livelock Threats"

**Purpose:** identify exactly what a reviewer will flag statistically, and rank the fixes by effort vs. payoff, given a ~2 week runway.

---

## Bottom line up front

Your paper's *ideas* are in good shape — the threat model, the four-regime formalization, and D-MTD are all coherent contributions. The thing that will sink you in review is that **every result is a bare percentage with no N, no confidence interval, and no significance test.** AILD is defined as a subtraction of two proportions (Eq. 1) but nowhere is it tested against the null that the subtraction is zero. That's the single fix with the highest reviewer-credibility-per-hour.

Second, I reverse-engineered your sample sizes from the decimal precision in your own tables, and it tells a clear story:

- **Table V (defense results) is almost certainly N=10 per cell.** Every single value in that table — 0, 10, 20, 30, 40, 50, 70, 100, and the negative ones (-10, -50) — is an exact multiple of 10. That's not a coincidence at that density; it's what you get from x/10.
- **Tables III/IV (attack results) use a much larger, non-round N** (the decimals like 4.55%, 25.58%, 74.87% don't reduce to small denominators), so that part of your paper is probably fine.

This matters because **your headline defense claim — "D-MTD reduces AILD to zero across the majority of model-regime configurations" — rests on the thinnest data in the paper.** That's exactly where a reviewer will push first. See Tier 4 below for what to do about it; it's fixable in the time you have.

---

## 1. Two data anomalies to resolve before you touch the prose

These aren't styling issues — they're internal inconsistencies a careful reviewer (or you, on a second pass) will catch, and they're cheap to check against your logs.

**a) Qwen3-4B shows AILD = 0.0 in all 16 cells of Table V** — every regime, every defense, including *No Defense* under *Conservative* (your worst-case regime for every other model). Meanwhile Section V's narrative ("the attack scales with model capability," "susceptibility is strongly regime-dependent") never mentions this model behaving differently. Two possibilities, and you need to know which before you submit:
  - **Real finding:** Qwen3-4B is genuinely immune (e.g., it doesn't parse/trust the structured confidence field the way larger models do, or terminates on a different signal entirely). If so, this is worth a paragraph — it's actually an interesting result, not a nuisance.
  - **Harness bug:** something in your delegation-schema parsing or chat template isn't working for this model, so it's not actually being exposed to the attack. If a model shows *zero variance across 16 independent cells*, that's the more likely explanation statistically, and you should check the raw transcripts for that model before trusting any of its rows.

**b) Llama3.1-8B hits AILD = 100 in the *Baseline* regime** (No Defense and Budget-cap) — the regime every other model treats as close to benign. Table III's aggregate Baseline AILD is only 21.04%, which means Llama is a massive outlier pulling that mean up, and nothing in the text discusses it. Worth a sentence explaining why Llama is uniquely fragile even without controller enforcement, or a check that this isn't a labeling/logging error.

Fixing these costs you an afternoon of log-reading, not new experiments, and it's the kind of thing that determines whether a reviewer trusts your data at all.

---

## 2. The core statistical gap, made concrete

I ran the numbers your paper is missing so you can see exactly what's at stake.

### 2.1 Wilson 95% CIs at n=10 (i.e., what Table V's numbers actually mean)

| Count (x/10) | Point estimate | Wilson 95% CI |
|---|---|---|
| 0/10 | 0% | [0.0%, 27.8%] |
| 2/10 | 20% | [5.7%, 51.0%] |
| 5/10 | 50% | [23.7%, 76.3%] |
| 8/10 | 80% | [49.0%, 94.3%] |
| 10/10 | 100% | [72.2%, 100.0%] |

A point estimate of "20%" at n=10 has a confidence interval running from under 6% to over half. Right now Table V reports only the point estimate — a reviewer who does this same back-of-envelope calculation (and security reviewers often do) will immediately discount the precision of every per-model AILD number.

### 2.2 The AILD=100 cells are actually fine; the small/negative ones are not

- The AILD=100 cells (10/10 adversarial-fail vs. 0/10 benign-fail) are statistically **rock solid** even at n=10 — Fisher's exact test gives p ≈ 1×10⁻⁵. Don't worry about these.
- The AILD=−50 cell (Llama3.1-8B, Prompt-only, Early-abort) is the one to actually go check. Enumerating every (benign-fail, adversarial-fail) pair out of 10 consistent with a −50pp gap, Fisher's exact p-values range from **0.033 to 0.070** — i.e., some of the plausible underlying counts are "significant in the wrong direction" at α=0.05. That's not something to paper over with a confidence interval; it's worth pulling the actual transcripts for that cell and confirming it isn't a bug or a genuinely strange model behavior worth a footnote.

### 2.3 The power problem: n=10 can't see the effect you claim in unenforced regimes

This is the finding I'd lead with in your revision plan. I simulated power (Fisher's exact, α=0.05, two-sided) for detecting your two claimed effects at n=10 per arm, benign rate fixed at 5%:

| Comparison | True effect | Power at n=10 |
|---|---|---|
| Unenforced regimes (benign 5% vs. adversarial ~26%, i.e. your Baseline/Prompt-only story) | 21pp gap | **~5.6%** (essentially can't detect it) |
| Enforced regimes (benign 5% vs. adversarial ~75%, i.e. your Controller/Conservative story) | 70pp gap | **~87%** (solid) |

**In plain terms:** at n=10 per cell, you have almost no statistical power to support any *per-model* claim about the Baseline/Prompt-only regimes (the ρ effect, and cross-model comparisons like "Qwen2.5-14B reaches higher AILD under Baseline than Qwen2.5-7B"), even if the underlying effect is completely real. You only have power where the effect is already huge (enforced regimes). This is precisely backwards from what your narrative needs, since your secondary claim — that risk framing (ρ) provides "a modest amplification effect" — is exactly the small-effect regime where n=10 is blind.

Required N to actually detect the unenforced-regime effect at 80% power: **~50 trials per arm** (see table below). To detect it with a CI tight enough to support "X% vs Y%" language (±10pp or better), you want more like 50–100.

| Target | n per arm needed |
|---|---|
| 80% power to detect 5% vs 26% (unenforced regimes) | ~50 |
| 80% power to detect 5% vs 75% (enforced regimes) | ~10–15 (already fine) |
| CI width ±11pp around a 25% estimate | ~50 |
| CI width ±8pp around a 25% estimate | ~100 |

---

## 3. The fixes, ranked by effort vs. payoff

### Tier 1 — Do this first (≈1 day, no new experiments, largest credibility gain)
Report **N per cell** everywhere (Tables III, IV, V) and add a **Wilson 95% CI** to every proportion. This alone signals to a reviewer that you know what you're doing, and it's pure bookkeeping — you already have the raw pass/fail counts in your logs, this is just arithmetic (formula below).

### Tier 2 — Significance tests (≈1–2 days)
For every AILD(r) cell, run a test of benign-vs-adversarial:
- **If trials are paired** (same task instance/seed run once under Dbenign and once under Dadv) → use **McNemar's test**, which is more powerful and the statistically correct choice for paired binary outcomes.
- **If trials are independent** → use **Fisher's exact test** for small N (Table V) and a **two-proportion z-test** for the larger N in Tables III/IV.
- Apply **Holm–Bonferroni correction** within each family of tests (e.g., the 4 regimes × 6 models = 24 tests in Table V, done separately per defense). This is a trivial addition (sort p-values, compare to staged thresholds) and reviewers will ask about multiple comparisons the moment they see 96+ cells being compared.

Report results as: *"AILD(Controller-only) = 70.3 pp [95% CI: 58–81], Fisher's exact p < 0.001, significant after Holm correction."* — not just "70.33%."

### Tier 3 — Resolve the two anomalies (≈半 day–1 day)
Pull the raw transcripts for Qwen3-4B and Llama3.1-8B Baseline. Either explain them in the text (a sentence or two each) or fix a harness bug. Do this before Tier 4 — no point re-running experiments on top of a possible bug.

### Tier 4 — Raise N where power is thin (≈3–5 days, the actual bottleneck, highest scientific payoff)
This is where your remaining time should mostly go. Your tasks are cheap (arithmetic/string-counting) and your models are small open-source ones, so this is very likely feasible in days, not weeks. Priorities, in order:
1. **Table V cells for Controller-only and Conservative** (your D-MTD headline claim) — get these to N≥30 minimum, N≥50 if compute allows. These currently have decent power but weak CI precision.
2. **Table V cells for Baseline and Prompt-only** — get to N≥50, since this is where n=10 currently has ~5% power to detect anything.
3. Re-derive Table III/IV from the same larger-N runs so the two tables are internally consistent (right now it looks like Table III/IV and Table V may come from different-sized runs, which itself invites a reviewer question).

### Tier 5 — Replace the letter-subsections with one statistical model (≈2–3 days, highest *scientific* leverage)
Section V-B's subsections (c), (d), (e) currently argue "γ is the dominant driver," "ρ has a smaller effect," "the interaction is asymmetric" by eyeballing percentage-point gaps. You can replace all three with a single, reviewer-legible result:

**Mixed-effects logistic regression:**
```
LF ~ condition * regime + channel_type + (1 | model)
```
(`condition` = benign/adversarial, `regime` = your 4-level ρ×γ factor, `model` as a random intercept to account for between-model heterogeneity instead of averaging over it). Fit in R (`lme4::glmer(..., family=binomial)`) or Python (`statsmodels` GEE, or `pymer4`/Bambi if you want a drop-in glmer equivalent). This gives you:
- An **odds ratio with a CI and p-value for γ** — directly substantiating "controller enforcement is the dominant predictor."
- An **odds ratio for ρ** — substantiating "secondary amplification" as an actual number instead of a percentage-point eyeball comparison.
- The **condition × regime interaction term** — this *is* your "interaction effect is asymmetric" claim, formally.
- Random-intercept variance for `model` — tells you (and reviewers) how much of the variance is between-model heterogeneity, which also naturally resolves the "should we average percentages or pool counts" ambiguity that currently sits under Table III/IV.

This single model likely takes less time to run than it took to write subsections (c)–(e), and it's the difference between "we observed X% vs Y%" and "we show that γ significantly predicts liveness failure (OR=…, 95% CI […], p<…), controlling for model identity" — the latter is what gets a security/ML venue reviewer to stop asking "but is this just noise?"

### Tier 6 — Polish (≈1 day)
- Add error bars (Wilson CIs) to Figures 2 and 3.
- Report **Cohen's h** effect size alongside each AILD, standard practice for two-proportion comparisons in security/HCI venues.
- Fix Table IV's caption ("aggregated by delegation" vs. its actual row variable, condition) — clarify what's pooled over and what's broken out.
- State the number of distinct task instances (arithmetic/string-counting) and whether generations are sampled at temperature >0 with repeats — you already argue non-determinism is central to the threat model, so the paper should quantify it, not just assert it.

---

## 4. Formulas you can paste straight into a notebook

**Wilson 95% CI** for x successes out of n:
```python
from statsmodels.stats.proportion import proportion_confint
lo, hi = proportion_confint(x, n, alpha=0.05, method='wilson')
```

**Fisher's exact test** (small N, e.g. Table V):
```python
from scipy.stats import fisher_exact
odds, p = fisher_exact([[adv_fail, adv_ok], [benign_fail, benign_ok]])
```

**Two-proportion z-test** (larger N, e.g. Table III/IV):
```python
from statsmodels.stats.proportion import proportions_ztest
z, p = proportions_ztest([x_adv, x_benign], [n_adv, n_benign])
```

**McNemar's test** (if trials are paired by task/seed):
```python
from statsmodels.stats.contingency_tables import mcnemar
result = mcnemar([[both_pass, benign_only_pass],[adv_only_pass, both_fail]], exact=True)
```

**Holm–Bonferroni correction:**
```python
from statsmodels.stats.multitest import multipletests
reject, p_adj, _, _ = multipletests(p_values, alpha=0.05, method='holm')
```

**Cohen's h** (effect size for two proportions):
```python
import numpy as np
h = 2*np.arcsin(np.sqrt(p1)) - 2*np.arcsin(np.sqrt(p2))
```

**Mixed-effects logistic regression** (R, most reviewer-recognizable form):
```r
library(lme4)
m <- glmer(LF ~ condition * regime + channel_type + (1 | model),
           data = df, family = binomial)
summary(m)
confint(m, method = "Wald")
```

---

## 5. A "Statistical Methodology" paragraph you can adapt for Section V-A

> For each (model, regime, channel-type, condition) cell we ran N = [X] independent episodes [state whether paired or independent, and the sampling temperature]. We report Wilson score 95% confidence intervals for all failure-rate estimates. Significance of AILD(r) was assessed via [Fisher's exact test / McNemar's test], with Holm–Bonferroni correction applied within each family of comparisons. To evaluate the independent contributions of controller enforcement (γ) and risk framing (ρ) to liveness failure while accounting for between-model heterogeneity, we additionally fit a mixed-effects logistic regression with model identity as a random intercept (Eq. X); we report odds ratios with 95% confidence intervals.

Drop this in, adjust bracketed items, and most of your "how do I make this rigorous" problem is solved structurally — the rest is executing Tiers 1–5 above.

---

## 6. A 2-week schedule

| Days | Task |
|---|---|
| 1 | Recover per-cell N from your logs; compute Wilson CIs for everything you already have (Tier 1) — zero new experiments needed |
| 2 | Pull transcripts for Qwen3-4B (all-zero anomaly) and Llama3.1-8B Baseline (saturated anomaly); resolve or explain (Tier 3) |
| 3–4 | Run significance tests + Holm correction on existing data (Tier 2); this tells you exactly which cells are underpowered and need more trials |
| 5–9 | Re-run the underpowered cells, prioritizing Controller-only/Conservative (your D-MTD claim) then Baseline/Prompt-only (Tier 4) — aim for N≥30–50 per cell |
| 10–11 | Fit the mixed-effects logistic regression on the full dataset; rewrite Section V-B subsections (c)–(e) and VII-B around it (Tier 5) |
| 12 | Add CIs/error bars to figures, effect sizes, fix Table IV caption (Tier 6) |
| 13–14 | Buffer, internal read-through, tighten prose around the new numbers |

---

## 7. If you want to go further

If you can export your raw per-episode logs (task ID, model, regime, channel-type, condition, pass/fail, confidence trace) as a CSV, I can actually run all of Tiers 1–2 and the Tier 5 mixed-effects model on your real data rather than the illustrative numbers above — that would take this from "here's the method" to "here are your actual corrected tables," which is probably worth more to you than the schedule at this point given the timeline.
