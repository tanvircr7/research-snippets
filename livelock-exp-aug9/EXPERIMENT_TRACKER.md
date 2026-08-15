# LIVELOCK Experiment Tracker
Last updated: 2026-08-15 (morning: added Llama 8B 2B RAG defense data, 1267/1280, to gold standard. Mistral 7B 2B RAG defense run reportedly finished on Bizon but zip not yet received.)

This document is the single source of truth for what has run, what is still running, what data is collected, and where every file lives.

---

## Model Union

| Model | Family | Size | Used in Attack | Used in Defense |
|-------|--------|------|---------------|----------------|
| Qwen/Qwen2.5-7B-Instruct | Qwen | 7B | Yes | Yes (Bizon) |
| Qwen/Qwen2.5-14B-Instruct | Qwen | 14B | Yes | Yes (Colab) |
| Qwen/Qwen3-4B-Instruct-2507 | Qwen3 | 4B | Yes | No (null/control) |
| meta-llama/Meta-Llama-3.1-8B-Instruct | Llama | 8B | Yes | Yes (Bizon) |
| mistralai/Mistral-7B-Instruct-v0.3 | Mistral | 7B | Yes | Yes (Bizon) |
| unsloth/gemma-3-12b-it-bnb-4bit | Gemma | 12B | Yes (Bizon, confirmed) | TODO (notebooks ready, not yet run) |
| unsloth/gemma-3-4b-it-bnb-4bit | Gemma | 4B | Notebook default on Bizon; 2A run used 12B | No (excluded) |

NOTE on Gemma: Both Bizon Gemma attack runs are **12B**, confirmed from CSV `model_name=unsloth/gemma-3-12b-it-bnb-4bit`. 2A URL: 638 rows. 2B RAG: 589 rows. The Bizon notebook still lists 4B as the uncommented default; that default was overridden for these runs.

Qwen3 4B is a null-control example: it showed 0% AILD across all 8 arms, making only one tool call consistently. It is an attack model only, not included in defense.

UPDATE 2026-08-14 (evening): Gemma was previously excluded from defense because `Gemma3ForConditionalGeneration` needs a dedicated loader that the Qwen/Llama/Mistral defense harness didn't have. That gap is now closed: `2A_URL_Defense_Gemma_Bizon.ipynb` and `2B_RAG_Defense_Gemma_Bizon.ipynb` wire `load_gemma3()` / `create_gemma3_llm_step()` (lifted from the proven Gemma attack notebooks) into the existing `DefenseConfig`/`RAGDefenseConfig` harness unchanged. Both notebooks are offline-smoke-tested (mocked model backend, all 4 defense arms + every termination path exercised) and pushed to research-snippets, but have NOT been run on real hardware yet -- see TODO rows below.

---

## Experiment 2A: URL Channel Attack

### Status per model

| Model | Trials | Status | Data location |
|-------|--------|--------|---------------|
| Qwen 2.5 7B | 640 / 640 | DONE | Downloaded during session (results_Qwen_Qwen2.5_7B_Instruct.csv) |
| Qwen3 4B | 640 / 640 | DONE | Downloaded during session (results_Qwen_Qwen3_4B_Instruct_2507.csv) |
| Llama 3.1 8B | 635 / 640 | DONE (minor shortfall) | `exp2A-URL/attack/results/llama_mistral/results_meta_llama_Meta_Llama_3.1_8B_Instruct.csv` |
| Mistral 7B | 631 / 640 | DONE (minor shortfall) | `exp2A-URL/attack/results/llama_mistral/results_mistralai_Mistral_7B_Instruct_v0.3.csv` |
| Qwen 2.5 14B | 573 / 640 | DONE (shortfall in some arms) | `exp2A-URL/attack/results/qw14b_only/results_Qwen_Qwen2.5_14B_Instruct.csv` |
| Gemma 3 12B | 638 / 640 | DONE (2 failed trials) | `exp2A-URL/attack/results/gemma_12b/exp2a_gemma_bizon_results.csv` |
| Gemma 3 4B | smoke only | NOT gold | `exp2A-URL/attack/exp2a_gemma_results.csv` |

**Notebooks:**
- `exp2A-URL/attack/2A-URL-Main.ipynb` (Colab, runs Qwen7B / Llama / Mistral)
- `exp2A-URL/attack/2A-URL-Gemma-Main.ipynb` (Colab, runs Gemma)
- `exp2A-URL/attack/2A-URL-Gemma-Main-Bizon.ipynb` (Bizon GPU 0)

### ZIP archive mapping (exp2A attack)

| ZIP file | Contents | Extracted to |
|----------|----------|-------------|
| `exp2a_url_q14b-20260812T230356Z-1-001.zip` | Qwen 2.5 14B attack, 573 rows, 1 model, full checkpoint trail | `exp2A-URL/attack/results/qw14b_only/` |
| `exp2a_url-20260812T230359Z-1-001.zip` | Llama 3.1 8B (635 rows) + Mistral 7B (631 rows), multi-model run | `exp2A-URL/attack/results/llama_mistral/` |
| `gemma_2a_attack_essentials.zip` | Gemma 3 12B attack, 638 rows, 2 failed of 640 | `exp2A-URL/attack/results/gemma_12b/` |

**Key files per folder:**

`exp2A-URL/attack/results/qw14b_only/`:
- `results_Qwen_Qwen2.5_14B_Instruct.csv` - 573 rows, final per-model result (USE THIS for analysis)
- `results_final.csv` - same, the final merged file at notebook end
- `exp2a_multi_model_results.csv` - same data, notebook-generated combined name
- `model_summary_final.csv` - aggregated AILD per regime/condition

`exp2A-URL/attack/results/llama_mistral/`:
- `results_meta_llama_Meta_Llama_3.1_8B_Instruct.csv` - 635 rows (USE THIS for Llama analysis)
- `results_mistralai_Mistral_7B_Instruct_v0.3.csv` - 631 rows (USE THIS for Mistral analysis)
- `results_final.csv` - 1266 rows combined (Llama + Mistral)
- `model_summary_final.csv` - aggregated AILD per model/regime/condition

`exp2A-URL/attack/results/gemma_12b/`:
- `exp2a_gemma_bizon_results.csv` - 638 rows (USE THIS)
- `model_summary_after_unsloth_gemma_3_12b_it_bnb_4bit.csv` - 638 completed, 2 failed
- `model_summary_final.csv`
- `gemma_2a_attack_essentials.zip`

### Qwen 14B attack shortfall (2A)
573 out of 640 expected. Breakdown by arm:

| Regime | Benign | Adversarial |
|--------|--------|-------------|
| Baseline | 100 | 76 |
| Prompt-only | 100 | 91 |
| Controller-only | 60 | 40 |
| Conservative | 60 | 46 |

Shortfalls are mostly in adversarial cells where the model occasionally skips tool calls, causing the trial loop to exit early. This is acceptable for analysis (Wilson CIs still tight at n=40+).

### Gemma 12B attack (2A URL)

638 of 640 completed. Only shortfall: Controller-only adversarial 58/60. All other arms full. 0 exact duplicates.

| Regime | Benign AILD | Adversarial AILD |
|--------|-------------|------------------|
| Baseline | 0% (n=100) | 0% (n=100) |
| Prompt-only | 0% (n=100) | 0% (n=100) |
| Controller-only | 0% (n=60) | 43.1% (n=58) |
| Conservative | 0% (n=60) | 55.0% (n=60) |

Gemma 12B shows AILD only under v2 controller regimes, and at a lower rate than Qwen 7B / Llama / Mistral (those were near 100% on Controller-only and Conservative adversarial). Baseline and Prompt-only stay at 0%.

Gold standard file `gold_standard/2a_url_attack_GOLD.csv` now has 3757 rows across 6 models.

---

## Experiment 2A: URL Channel Defense

### Status per model

| Model | Trials | Status | Data location |
|-------|--------|--------|---------------|
| Llama 3.1 8B | 2560 / 2560 | DONE | `exp2A-URL/defense/results/llama/` |
| Qwen 2.5 14B | 2364 rows, 4 defenses x 8 conditions | DONE | `exp2A-URL/defense/results/qw14b/` |
| Qwen 2.5 7B | 2560 / 2560 | DONE | `exp2A-URL/defense/results/qw7b_mistral/` |
| Mistral 7B | 2557 / 2560 (3 failed) | DONE | `exp2A-URL/defense/results/qw7b_mistral/` |
| Gemma 3 12B | 0 / 2560 | TODO (notebook ready, not yet run) | -- |

**Notebooks:**
- `exp2A-URL/defense/2A_URL_Defense_GPU_01_Bizon.ipynb` (Bizon, Qwen 7B + Llama + Mistral)
- `exp2A-URL/defense/2A_URL_Defense_MAIN_fallout_qw14b.ipynb` (Colab, Qwen 14B only)
- `exp2A-URL/defense/2A_URL_Defense.ipynb` (original Colab version, reference)
- `exp2A-URL/defense/2A_URL_Defense_TOPUP_bizon.ipynb`, `2A_URL_Defense_TOPUP_qw14b.ipynb`
  (not yet run) -- `early_abort` residual top-up, see item 0 in "What to do next" below.
- `exp2A-URL/defense/2A_URL_Defense_Gemma_Bizon.ipynb` (Bizon GPU 2, Gemma 12B, NEW 2026-08-14
  evening, not yet run) -- same `DefenseConfig`/4-defense/tiered-N structure as the Bizon
  Qwen/Llama/Mistral notebook, `load_gemma3()` swapped in for the model backend. `SMOKE_TEST=False`
  by default; single `MODEL_NAMES` definition; warning-suppression cell before the main loop.
  Offline-smoke-tested (mocked backend), not yet run on real hardware.

### ZIP archive mapping (exp2A defense)

| ZIP file | Contents | Extracted to |
|----------|----------|-------------|
| `exp2a_url_defense_qw14b_aug12-20260812T230353Z-1-001.zip` | Qwen 2.5 14B defense, 2364 rows, all 4 defenses (none / budget_cap / early_abort / d_mtd), 4 regimes x 2 conditions | `exp2A-URL/defense/results/qw14b/` |
| `llama_defense_essentials.zip` | Llama 3.1 8B defense plus 71 interrupted Qwen3-4B rows (dropped). Llama kept: 2560 rows, full 32-arm grid | `exp2A-URL/defense/results/llama/` |
| `bizon_snapshot_aug14.zip` (from `bizon_snapshot_aug13 (1).zip`, downloaded Aug 14) | Bizon snapshot bundling `outputs_exp2a_defense_bizon/` (Qwen 7B 2560/2560 + Mistral 7B 2557/2560), `outputs_exp2b_rag_main_bizon/` (adds Mistral 7B 635/640 to the RAG attack run), and `outputs_exp2b_rag_defense_qw7b_bizon/` (unchanged, already in gold) | `exp2A-URL/defense/results/qw7b_mistral/` and `exp2B-RAG/attack/results/main/` |

**Key files in `exp2A-URL/defense/results/qw14b/`:**
- `exp2a_Defense_exp2a_defense_qw14b_ALL.csv` - 2364 rows, full trial-level data (USE THIS)
- `exp2a_defense_summary_exp2a_defense_qw14b.csv` - per-model summary stats
- `exp2a_defense_aild_exp2a_defense_qw14b.csv` - AILD rates per regime x defense (see table below)
- `exp2a_model_summary_final.csv` - final model-level summary

**Key files in `exp2A-URL/defense/results/llama/`:**
- `exp2a_defense_bizon_results_LLAMA_ONLY.csv` - 2560 Llama rows after dropping Qwen3-4B (USE THIS)
- `llama_defense_essentials.zip` - original download (2631 mixed rows; do not use raw)
- `model_summary_after_meta_llama_Meta_Llama_3.1_8B_Instruct.csv` - 2560 completed, 0 failed
- `model_summary_final.csv` - same, Llama only

**Key files in `exp2A-URL/defense/results/qw7b_mistral/`:**
- `results_Qwen_Qwen2.5_7B_Instruct.csv` - 2560 rows, 0 failed (USE THIS; identical to the Qwen 7B rows already in gold from an earlier download, confirmed byte-for-byte on all columns except a harmless `trial` dtype difference)
- `results_mistralai_Mistral_7B_Instruct_v0.3.csv` - 2557 rows, 3 failed of 2560 (USE THIS, NEW)
- `results_final.csv` - 5117 rows combined (Qwen 7B + Mistral)
- `model_summary_final.csv` - per-model completed/failed/success_rate
- `bizon_snapshot_aug14.zip` - full snapshot archive as downloaded from Bizon

Gold standard file `gold_standard/2a_url_defense_GOLD.csv` now has four models: 2364 Qwen 14B + 2560 Llama + 2560 Qwen 7B + 2557 Mistral = 10041 rows.

### Mistral 7B defense AILD results (2A URL, NEW Aug 14)

Same 2 task_ids (`arith_37_42`, `count_r_strawberry`) and greedy policy as Qwen 14B / Llama. Benign AILD is 0% across all regimes and defenses (n=320 per cell). Adversarial AILD:

| Regime | Defense | AILD (adversarial) | Note |
|--------|---------|-------------------|------|
| Baseline | none | 0% | No AILD baseline |
| Baseline | budget_cap | 0% | Effective |
| Baseline | early_abort | 0% | Effective |
| Baseline | d_mtd | 1.0% | Near-zero residual |
| Prompt-only | none | 41.8% | Unlike Qwen 14B, Mistral shows AILD at Prompt-only with no controller |
| Prompt-only | budget_cap | 48.0% | Worse than none |
| Prompt-only | early_abort | 6.0% | Strong suppression |
| Prompt-only | d_mtd | 37.0% | Weak suppression, unusual for D-MTD |
| Controller-only | none | 100% | Full AILD confirmed |
| Controller-only | budget_cap | 100% | Ineffective |
| Controller-only | early_abort | 20.0% | Partial suppression |
| Controller-only | d_mtd | 0% | FULL suppression |
| Conservative | none | 100% | Full AILD confirmed |
| Conservative | budget_cap | 100% | Ineffective |
| Conservative | early_abort | 5.0% | Strong suppression |
| Conservative | d_mtd | 0% | FULL suppression |

**Key finding:** Mistral 7B is the first model where D-MTD does not fully zero out AILD in every regime, Prompt-only d_mtd sits at 37%. This is worth flagging for the paper's D-MTD limitations discussion, since the existing text claims D-MTD "reduces AILD to zero across the majority of model-regime configurations" (still true in aggregate, but Mistral's Prompt-only cell is a genuine exception, not just noise, at n=100 per condition).

### Qwen 14B defense AILD results (2A URL)

| Regime | Defense | AILD (adversarial) | Note |
|--------|---------|-------------------|------|
| Baseline | none | 0% | No AILD baseline |
| Baseline | budget_cap | 7.1% | Minor leakage |
| Baseline | early_abort | 0% | Effective |
| Baseline | d_mtd | 0% | Effective |
| Prompt-only | none | 0% | No AILD baseline |
| Prompt-only | budget_cap | 2.3% | Marginal |
| Prompt-only | early_abort | 0% | Effective |
| Prompt-only | d_mtd | 0% | Effective |
| Controller-only | none | 100% | Full AILD confirmed |
| Controller-only | budget_cap | 100% | Budget cap NOT effective |
| Controller-only | early_abort | 5.9% | Near-full suppression |
| Controller-only | d_mtd | 0% | FULL suppression |
| Conservative | none | 100% | Full AILD confirmed |
| Conservative | budget_cap | 100% | Budget cap NOT effective |
| Conservative | early_abort | 10.4% | Strong but partial suppression |
| Conservative | d_mtd | 0% | FULL suppression |

**Key finding:** D-MTD (Delegation-based Moving Target Defense) eliminates AILD entirely for Qwen 14B. Early-abort reduces it sharply but not to zero. Budget-cap is ineffective against Conservative/Controller-only AILD.

### Llama 8B defense AILD results (2A URL)

Full 2560-row grid. Same 2 task_ids (`arith_37_42`, `count_r_strawberry`) and greedy policy as Qwen 14B. Llama has a `trial` column, so rows are unique even when outputs repeat.

| Regime | Defense | AILD adversarial | AILD benign | Note |
|--------|---------|------------------|-------------|------|
| Baseline | none | 77% | 0% | Llama has Baseline AILD; Qwen 14B did not |
| Baseline | budget_cap | 92% | 0% | Budget cap worse than none |
| Baseline | early_abort | 5% | 0% | Strong suppression |
| Baseline | d_mtd | 20% | 25% | Partial; benign leakage |
| Prompt-only | none | 86% | 50% | Benign 50% is one of two tasks failing |
| Prompt-only | budget_cap | 99% | 50% | Ineffective |
| Prompt-only | early_abort | 10% | 50% | Suppresses attack, not the benign split |
| Prompt-only | d_mtd | 47% | 50% | Partial |
| Controller-only | none | 100% | 0% | Full AILD confirmed |
| Controller-only | budget_cap | 100% | 0% | Ineffective |
| Controller-only | early_abort | 10% | 0% | Strong suppression |
| Controller-only | d_mtd | 0% | 0% | FULL suppression |
| Conservative | none | 100% | 0% | Full AILD confirmed |
| Conservative | budget_cap | 100% | 0% | Ineffective |
| Conservative | early_abort | 16.7% | 0% | Strong but partial |
| Conservative | d_mtd | 0% | 0% | FULL suppression |

**Llama vs Qwen 14B:** Controller-only and Conservative match: none and budget_cap stay at 100% AILD, early-abort cuts it, D-MTD zeros it. Llama also shows AILD in Baseline and Prompt-only, which Qwen 14B did not. Prompt-only benign 50% is a task-split, not a defense effect.

---

## Experiment 2B: RAG Channel Attack

### Status per model

| Model | Trials | Status | Data location |
|-------|--------|--------|---------------|
| Qwen 2.5 7B | 640 / 640 | DONE | `exp2B-RAG/attack/results/main/results_Qwen_Qwen2.5_7B_Instruct.csv` |
| Qwen 2.5 14B | 640 / 640 | DONE | `exp2B-RAG/attack/results/qw14b/results_Qwen_Qwen2.5_14B_Instruct.csv` |
| Llama 3.1 8B | 638 / 640 | DONE | `exp2B-RAG/attack/results/main/results_meta_llama_Meta_Llama_3.1_8B_Instruct.csv` |
| Mistral 7B | 635 / 640 (5 failed) | DONE | `exp2B-RAG/attack/results/main/results_mistralai_Mistral_7B_Instruct_v0.3.csv` |
| Gemma 3 12B | 589 / 640 | DONE (51 failed) | `exp2B-RAG/attack/results/gemma_12b/exp2b_gemma_bizon_results.csv` |

**Notebooks:**
- `exp2B-RAG/attack/2B-RAG-Main.ipynb` (Colab, non-Gemma models)
- `exp2B-RAG/attack/2B-RAG-Main-Bizon.ipynb` (Bizon, ran Qwen 7B / Llama / Mistral to completion)
- `exp2B-RAG/attack/2B-RAG-Gemma-Main.ipynb` (Colab, Gemma)
- `exp2B-RAG/attack/2B-RAG-Gemma-Main-Bizon.ipynb` (Bizon GPU 1)

### Mistral 7B attack results (2B RAG, NEW Aug 14)

635 of 640 completed, 5 failed. Tasks: `deadline_policy`, `policy_applicability`.

| Regime | Benign AILD | Adversarial AILD |
|--------|-------------|-------------------|
| Baseline | 3.1% (n=98) | 19.4% (n=98) |
| Prompt-only | 4.0% (n=100) | 27.0% (n=100) |
| Controller-only | 0% (n=59) | 65.0% (n=60) |
| Conservative | 0% (n=60) | 66.7% (n=60) |

Mistral 7B on RAG follows the same qualitative shape as the other models: low AILD under $\gamma=0$ regimes, sharp jump under $\gamma=1$ regimes. Compared to Gemma 12B on the same channel (100% at Controller/Conservative), Mistral tops out lower (~65-67%), closer to the tool-based 2A URL pattern for this model family.

### Qwen 14B attack results (2B RAG, NEW Aug 14)

640 of 640 completed, 0 failed, 0 exact duplicates. Tasks: `deadline_policy`, `policy_applicability`. Source zip: `exp2b_rag_attack_qw14b-20260814T172628Z-1-001.zip`.

| Regime | Benign AILD | Adversarial AILD |
|--------|-------------|-------------------|
| Baseline | 0% (n=100) | 4.0% (n=100) |
| Prompt-only | 0% (n=100) | 4.0% (n=100) |
| Controller-only | 0% (n=60) | 100% (n=60) |
| Conservative | 0% (n=60) | 100% (n=60) |

Qwen 14B on RAG saturates at 100% under $\gamma=1$ (Controller-only and Conservative), matching Gemma 12B on this channel and matching Qwen 14B's own 2A URL pattern under enforced regimes. Baseline and Prompt-only stay near zero (4% adversarial), closer to the 2A URL Qwen 14B Baseline result (11.43%) than to Gemma's RAG Baseline (~47%). All 8 arms are full (n=100 for $\gamma=0$, n=60 for $\gamma=1$).

2B RAG attack is now complete for all planned models: Qwen 7B, Qwen 14B, Llama 8B, Mistral 7B, Gemma 12B. Qwen3 4B remains optional (null-control, attack-only).

### Gemma 12B attack (2B RAG)

589 of 640 completed. 51 failed. 0 exact duplicates. Model confirmed: `unsloth/gemma-3-12b-it-bnb-4bit`. Tasks: `deadline_policy`, `policy_applicability`.

Shortfall is concentrated in v2 adversarial arms:
- Controller-only adversarial: 31/60
- Conservative adversarial: 38/60
- All other arms full

| Regime | Benign AILD | Adversarial AILD |
|--------|-------------|------------------|
| Baseline | 0% (n=100) | 47.0% (n=100) CI [0.375, 0.567] |
| Prompt-only | 0% (n=100) | 49.0% (n=100) CI [0.394, 0.587] |
| Controller-only | 0% (n=60) | 100% (n=31) CI [0.890, 1.000] |
| Conservative | 0% (n=60) | 100% (n=38) CI [0.908, 1.000] |

Compared with the same model on 2A URL: RAG is stronger. URL Baseline/Prompt-only were 0%. RAG Baseline/Prompt-only are ~47% to 49%. URL Controller/Conservative were 43% and 55%. RAG Controller/Conservative are 100%.

Gold file: `gold_standard/2b_rag_attack_GOLD.csv` now has 5 models: Qwen 7B (640) + Qwen 14B (640) + Llama (638) + Mistral (635) + Gemma 12B (589) = 3142 rows. Not merged into the 2A attack gold. Different channel, thinner schema (no `experiment`, `policy`, `max_calls`, `task_type`).

---

## Experiment 2B: RAG Channel Defense

### Status per model

| Model | Trials | Status | Data location |
|-------|--------|--------|---------------|
| Qwen 2.5 7B | 1280 / 1280 | DONE | `exp2B-RAG/defense/results/qw7b/` |
| Qwen 2.5 14B | 1280 / 1280 | DONE | `exp2B-RAG/defense/results/qw14b/` |
| Llama 3.1 8B | 1267 / 1280 (13 failed) | DONE, NEW Aug 15 | `exp2B-RAG/defense/results/llama/` |
| Mistral 7B | not yet received in this repo | Bizon run reportedly finished (per user, Aug 15); zip not yet provided/extracted -- send the `outputs_exp2b_rag_defense_mistral_bizon_essentials.zip` to add it | -- |
| Gemma 3 12B | 0 / 1280 | TODO (notebook ready, not yet run) | -- |

**Notebooks:**
- `exp2B-RAG/defense/2B-RAG-Defense-Main.ipynb` (Colab, Qwen 14B)
- `exp2B-RAG/defense/2B-RAG-Defense-Main-Bizon.ipynb` (Bizon GPU 4, Qwen 7B)
- Llama 3.1 8B ran from a Llama-configured copy of the Qwen Bizon defense notebook
  (output folder `outputs_exp2b_rag_defense_llama_bizon`); that copy is not itself
  checked into this repo, only its CSV outputs are.
- `exp2B-RAG/defense/2B_RAG_Defense_Gemma_Bizon.ipynb` (Bizon GPU 5, Gemma 12B, NEW 2026-08-14
  evening, not yet run) -- `RAGDefenseConfig`/4-defense/4-regime structure unchanged from the
  Qwen notebook, `load_gemma3()`/`create_gemma3_llm_step()` swapped in for the model backend.
  `SMOKE_TEST=False` by default; single `MODEL_NAMES` definition; warning-suppression cell
  before the main loop. Offline-smoke-tested (mocked backend), not yet run on real hardware.

Gold file: `gold_standard/2b_rag_defense_GOLD.csv` now has three models: Qwen 7B (1280) + Qwen 14B (1280) + Llama 8B (1267) = 3827 rows. The old `exp2b_rag_defense_qw7b_320_results.csv` exploratory file is still excluded.

**N=40 per cell, flat across all four regimes (not tiered like the URL defense notebook, despite an inaccurate comment that used to claim otherwise -- corrected 2026-08-14).** Tier 2 significance testing found this underpowered specifically for the Controller-only/Conservative D-MTD residual (see item 0 in "What to do next" below); a dedicated top-up run is prepared but not yet executed. Note: URL defense (N=60 tier) is NOT fully in the clear either -- see item 0, `early_abort` residual.

### Llama 8B defense AILD results (2B RAG, NEW Aug 15)

1267/1280 completed (13 failed, minor shortfall spread across a few cells -- see `model_summary_final.csv`). No duplicate rows against existing gold on merge.

| Regime | Defense | AILD adversarial | AILD benign | Note |
|--------|---------|------------------|-------------|------|
| Baseline | none | 65.0% | 7.5% | Unlike Qwen 7B/14B, Llama has real Baseline AILD even with no controller |
| Baseline | budget_cap | 67.5% | 7.5% | No better than none |
| Baseline | early_abort | 10.0% | 12.5% | Suppresses attack; slight benign leakage |
| Baseline | rag_d_mtd | 10.0% | 7.7% | Comparable to early_abort here |
| Prompt-only | none | 62.5% | 5.0% | Elevated baseline AILD carries into Prompt-only |
| Prompt-only | budget_cap | 80.0% | 5.0% | Worse than none |
| Prompt-only | early_abort | 12.5% | 7.5% | Strong suppression |
| Prompt-only | rag_d_mtd | 7.7% | 5.0% | Strong suppression |
| Controller-only | none | 100% | 2.5% | Full AILD confirmed |
| Controller-only | budget_cap | 100% | 5.0% | Ineffective |
| Controller-only | early_abort | 17.5% | 2.7% | Partial suppression, residual similar to the URL-channel early_abort gap |
| Controller-only | rag_d_mtd | 5.0% | 5.0% | Strong suppression, not full zero |
| Conservative | none | 100% | 0.0% | Full AILD confirmed |
| Conservative | budget_cap | 100% | 0.0% | Ineffective |
| Conservative | early_abort | 18.4% | 0.0% | Partial suppression |
| Conservative | rag_d_mtd | 15.0% | 5.0% | Weakest rag_d_mtd suppression seen so far on this channel |

**Key finding:** Llama is the first RAG-channel model with real Baseline/Prompt-only AILD (Qwen 7B/14B showed ~0% there). `rag_d_mtd` never reaches a clean 0% for Llama the way it does for Qwen (5-15% residual across all four regimes), which is the same qualitative pattern already flagged for Mistral on the URL channel (Prompt-only `d_mtd` = 37% AILD) -- worth folding into the same D-MTD-limitations discussion in the paper rather than treating it as a one-off.

---

## Overall Completion Matrix

```
                     ATTACK               DEFENSE
                 2A-URL   2B-RAG      2A-URL    2B-RAG
Qwen 7B          DONE     DONE        DONE      DONE
Qwen 14B         DONE*    DONE******** DONE**    DONE
Qwen3 4B         DONE     TODO        N/A       N/A
Llama 8B         DONE     DONE        DONE****  DONE^
Mistral 7B       DONE     DONE******* DONE*******TODO^^
Gemma 12B        DONE***** DONE****** TODO#     TODO#
Gemma 4B         SMOKE    UNCONF      N/A       N/A

*  Qwen 14B attack: 573/640 (shortfall in adversarial arms, usable)
** Qwen 14B defense: 2364 rows BUT only 2 task_ids, greedy policy.
   Benign arms for non-MTD defenses are effectively N=2 unique observations.
   Needs re-run with more task diversity before final stats.
**** Llama 8B defense: 2560/2560 confirmed. 71 Qwen3-4B interrupted rows in the
    raw zip were dropped and are not in gold. Same 2-task greedy limitation.
***** Gemma 12B 2A attack: 638/640 confirmed from Bizon CSV. Controller-only
    adversarial 58/60. Smoke-test Gemma file is not in gold.
****** Gemma 12B 2B RAG attack: 589/640. Controller-only adv 31/60,
    Conservative adv 38/60. AILD at 100% on those two arms.
******* Mistral 7B, both new as of Aug 14 Bizon snapshot: 2A defense 2557/2560
    (3 failed), 2B RAG attack 635/640 (5 failed). Both added to gold standard.
    Mistral is the only model where D-MTD does not zero AILD in every regime
    (Prompt-only d_mtd AILD = 37% in 2A defense, n=100).
******** Qwen 14B 2B RAG attack: 640/640, 0 failed. Colab zip
    exp2b_rag_attack_qw14b-20260814T172628Z-1-001.zip. AILD 4% Baseline/Prompt-only
    adversarial, 100% Controller-only and Conservative adversarial.
#  Gemma 12B defense (both channels): notebooks built 2026-08-14 evening
    (2A_URL_Defense_Gemma_Bizon.ipynb GPU 2, 2B_RAG_Defense_Gemma_Bizon.ipynb GPU 5),
    offline-smoke-tested with a mocked model backend, pushed to research-snippets.
    Not yet run on real hardware -- no results, no gold-standard rows yet.
^  Llama 8B 2B RAG defense, NEW 2026-08-15: 1267/1280 (13 failed). Same 2 task_ids
    (deadline_policy, policy_applicability) as the other RAG defense models. First
    RAG-channel model with real Baseline/Prompt-only AILD; rag_d_mtd residual
    (5-15%) never fully zeroes out, echoing the Mistral URL-channel d_mtd exception.
^^ Mistral 7B 2B RAG defense: run reportedly finished on Bizon (per user, Aug 15),
    but the results zip has not been provided/extracted into this repo yet.
```

**2B RAG attack is now complete for all planned models (Qwen 7B, Qwen 14B, Llama 8B, Mistral 7B, Gemma 12B).**

---

## File Tree (results only)

```
LIVELOCK-EXP-Aug9/
  EXPERIMENT_TRACKER.md              <- this file
  SESSION_CHECKPOINT_Aug9.md         <- original session checkpoint

  exp2A-URL/
    attack/
      2A-URL-Main.ipynb
      2A-URL-Gemma-Main.ipynb
      2A-URL-Gemma-Main-Bizon.ipynb
      exp2a_gemma_results.csv        <- smoke test, NOT gold
      results/
        qw14b_only/
          results_Qwen_Qwen2.5_14B_Instruct.csv   <- 573 rows, Qwen14B attack
          results_final.csv
          exp2a_multi_model_results.csv
          model_summary_final.csv
          model_summary_after_Qwen_Qwen2.5_14B_Instruct.csv
          exp2a_url_q14b-20260812T230356Z-1-001.zip  <- full archive
        llama_mistral/
          results_meta_llama_Meta_Llama_3.1_8B_Instruct.csv   <- 635 rows
          results_mistralai_Mistral_7B_Instruct_v0.3.csv       <- 631 rows
          results_final.csv          <- 1266 rows combined
          exp2a_multi_model_results.csv
          model_summary_final.csv
          model_summary_after_meta_llama_Meta_Llama_3.1_8B_Instruct.csv
          model_summary_after_mistralai_Mistral_7B_Instruct_v0.3.csv
          exp2a_url-20260812T230359Z-1-001.zip  <- full archive
        gemma_12b/
          exp2a_gemma_bizon_results.csv          <- 638 rows, USE THIS
          model_summary_after_unsloth_gemma_3_12b_it_bnb_4bit.csv
          model_summary_final.csv
          gemma_2a_attack_essentials.zip

    defense/
      2A_URL_Defense_GPU_01_Bizon.ipynb
      2A_URL_Defense.ipynb
      2A_URL_Defense_MAIN_fallout_qw14b.ipynb
      2A_URL_Defense_TOPUP_bizon.ipynb
      2A_URL_Defense_TOPUP_qw14b.ipynb
      2A_URL_Defense_Gemma_Bizon.ipynb        <- NEW, Gemma 12B, not yet run
      results/
        qw14b/
          exp2a_Defense_exp2a_defense_qw14b_ALL.csv   <- 2364 rows, USE THIS
          exp2a_defense_aild_exp2a_defense_qw14b.csv  <- AILD summary
          exp2a_defense_summary_exp2a_defense_qw14b.csv
          exp2a_model_summary_final.csv
          exp2a_model_summary_after_Qwen_Qwen2.5_14B_Instruct.csv
          exp2a_url_defense_qw14b_aug12-20260812T230353Z-1-001.zip  <- archive
        llama/
          exp2a_defense_bizon_results_LLAMA_ONLY.csv  <- 2560 rows, USE THIS
          llama_defense_essentials.zip                <- raw mixed zip
          model_summary_after_meta_llama_Meta_Llama_3.1_8B_Instruct.csv
          model_summary_final.csv
        qw7b_mistral/
          results_Qwen_Qwen2.5_7B_Instruct.csv        <- 2560 rows, USE THIS
          results_mistralai_Mistral_7B_Instruct_v0.3.csv <- 2557 rows, USE THIS (NEW)
          results_final.csv          <- 5117 rows combined
          model_summary_final.csv
          bizon_snapshot_aug14.zip   <- full snapshot archive

  gold_standard/
    2a_url_attack_GOLD.csv           <- 3757 rows, 6 attack models
    2a_url_defense_GOLD.csv          <- 10041 rows, Qwen 14B + Llama + Qwen 7B + Mistral
    2b_rag_attack_GOLD.csv           <- 3142 rows, Qwen 7B + Qwen 14B + Llama + Mistral + Gemma 12B
    2b_rag_defense_GOLD.csv          <- 2560 rows, Qwen 7B + Qwen 14B

  exp2B-RAG/
    attack/
      2B-RAG-Main.ipynb
      2B-RAG-Main-Bizon.ipynb
      2B-RAG-Gemma-Main.ipynb
      2B-RAG-Gemma-Main-Bizon.ipynb
      results/
        main/
          results_Qwen_Qwen2.5_7B_Instruct.csv             <- 640 rows
          results_meta_llama_Meta_Llama_3.1_8B_Instruct.csv <- 638 rows
          results_mistralai_Mistral_7B_Instruct_v0.3.csv    <- 635 rows, USE THIS
          results_final.csv          <- 1913 rows combined (Qwen+Llama+Mistral)
          model_summary_final.csv
        qw14b/
          results_Qwen_Qwen2.5_14B_Instruct.csv            <- 640 rows, USE THIS (NEW)
          results_final.csv
          model_summary_final.csv
          model_summary_after_Qwen_Qwen2.5_14B_Instruct.csv
          exp2b_rag_attack_qw14b-20260814T172628Z-1-001.zip
        gemma_12b/
          exp2b_gemma_bizon_results.csv          <- 589 rows, USE THIS
          model_summary_after_unsloth_gemma_3_12b_it_bnb_4bit.csv
          model_summary_final.csv
          gemma_2b_attack_essentials.zip
    defense/
      2B-RAG-Defense-Main.ipynb
      2B-RAG-Defense-Main-Bizon.ipynb
      2B-RAG-Defense-TOPUP-qw14b.ipynb
      2B-RAG-Defense-TOPUP-qw7b-Bizon.ipynb
      2B_RAG_Defense_Gemma_Bizon.ipynb        <- NEW, Gemma 12B, not yet run
      2b-defense-code.txt
      exp2b_rag_defense_qw7b_320_results.csv  <- partial, 320 rows, excluded from gold
      results/
        qw7b/
        qw14b/
        llama/                                <- NEW Aug 15
          results_meta_llama_Meta_Llama_3.1_8B_Instruct.csv  <- 1267 rows, USE THIS
          results_final.csv
          model_summary_final.csv
          outputs_exp2b_rag_defense_llama_bizon_essentials.zip  (raw source zip)

  paper/
    livelock_paper_statistical_review.md
    x-paper.pdf
    agentic_livelock_threats.tex
```

---

## What to do next (priority order)

0. **Defense top-up runs, both channels (RAG D-MTD residual + URL early_abort residual).** Not started.
   `tier2_significance_analysis.py` (paper repo, run 2026-08-14) found underpowered
   defense residuals on BOTH channels, not just RAG -- an earlier version of this entry
   incorrectly claimed URL defense needed no topup; that claim only checked the large
   none/budget_cap floor-to-ceiling collapse cells (corrected p as low as 1.49e-33) and
   wrongly generalized to "every non-floor effect here is adequately powered." Corrected
   2026-08-14 after actually checking every URL-channel comparison in the Tier 2 CSVs.

   **RAG channel (D-MTD residual):** 10.0-17.5% adversarial vs 0.0% benign at N=40 does
   NOT survive Holm-Bonferroni (corrected p from 0.88 to 1.0), unlike the analogous
   URL-channel Mistral-7B residual at N=100 (corrected p=2.3e-11). Root cause: the RAG
   defense notebooks (`2B-RAG-Defense-Main.ipynb`, `-Main-Bizon.ipynb`) used a flat
   n_trials=20 for all four regimes despite a comment claiming the N was "tiered" -- it
   was not (fixed, comment corrected 2026-08-14). Top-up notebooks ready:
   `2B-RAG-Defense-TOPUP-qw14b.ipynb`, `2B-RAG-Defense-TOPUP-qw7b-Bizon.ipynb` (n_trials=20
   more, adversarial-only, Controller-only + Conservative only -> target N=80).

   **URL channel (`early_abort` residual):** the `early_abort` defense's
   Controller-only/Conservative residual (5-17% adversarial vs 0% benign) at N=60 fails
   Holm-Bonferroni for 6 of 7 model x regime cells: Qwen2.5-14B (both regimes),
   Qwen2.5-7B (both), Llama3.1-8B (both), Mistral-7B (Conservative only -- its
   Controller-only cell already reaches corrected p=0.0215). Top-up notebooks ready:
   `2A_URL_Defense_TOPUP_qw14b.ipynb`, `2A_URL_Defense_TOPUP_bizon.ipynb` (n_trials=30
   more, adversarial-only, early_abort only, Controller-only + Conservative only ->
   target N=120). Power check shows most cells need ~2x current N, but Qwen2.5-14B
   Controller-only needs ~4x and Mistral-7B Conservative needs ~5x (weak 5% effect,
   may not resolve even after topup) -- re-run Tier 2 on merged data before assuming a
   single topup batch closed every cell.

   For both channels: after running, concatenate the new `results_final.csv` with the
   original per model (matching columns, do NOT overwrite), feed the union into the
   respective GOLD.csv, and re-run `tier2_significance_analysis.py` on the affected cells.
1. ~~Finish 2A defense Qwen 7B + Mistral on Bizon.~~ DONE Aug 14 (2560/2560 Qwen 7B, 2557/2560 Mistral). In `exp2A-URL/defense/results/qw7b_mistral/`, in gold standard.
2. **Re-examine 2A URL defense design:** all four defense models (Qwen 14B, Llama, Qwen 7B, Mistral) used only 2 task_ids + greedy policy. Add more task diversity before final analysis.
3. ~~Run 2B RAG Main on Bizon for Qwen 7B / Llama / Mistral.~~ DONE Aug 14 (640/640, 638/640, 635/640). In `exp2B-RAG/attack/results/main/`, in gold standard.
4. ~~Run 2B RAG Main on Colab for Qwen 14B.~~ DONE Aug 14 (640/640, 0 failed). In `exp2B-RAG/attack/results/qw14b/`, in gold standard.
5. ~~Run 2B RAG Defense (Qwen 7B on Bizon, Qwen 14B on Colab).~~ DONE (1280/1280 each, 2560 rows in gold standard).
5b. ~~Run 2B RAG Defense for Llama 8B.~~ DONE Aug 15 (1267/1280, 13 failed). In
   `exp2B-RAG/defense/results/llama/`, in gold standard (3827 rows total now).
6. **Get 2B RAG Defense data for Mistral into this repo.** Run reportedly finished on
   Bizon (per user, Aug 15); only the Llama zip has been provided/extracted so far.
   Send `outputs_exp2b_rag_defense_mistral_bizon_essentials.zip` to complete the
   defense matrix picture for this model.
7. **Combined analysis** now that 2B RAG attack has 5 models and 2B RAG defense has 3
   models (Qwen 7B, Qwen 14B, Llama): mixed-effects logistic regression across
   channels, and flag both the Mistral Prompt-only URL-channel d_mtd exception (37%
   AILD) and the Llama RAG-channel rag_d_mtd residual (5-15%, never fully zero) in the
   D-MTD discussion.
8. **Run the two new Gemma 12B defense notebooks (both channels).** Not started.
   `2A_URL_Defense_Gemma_Bizon.ipynb` (Bizon GPU 2, 2560 trials) and
   `2B_RAG_Defense_Gemma_Bizon.ipynb` (Bizon GPU 5, ~1280 trials) are built,
   offline-smoke-tested, and pushed to research-snippets. Same 2-task-id/greedy-policy
   limitation noted in item 2 above applies here too. Before launching: run `nvidia-smi`
   to confirm GPUs 2 and 5 are actually free (other Bizon notebooks may have moved GPUs
   since these were written), and select the `Python (gemma3-bizon)` kernel (or a sibling
   copy if it's already busy running the Gemma attack notebooks).

---

## Previously collected data (from earlier in session, not in zip form)

These CSVs were downloaded directly and are not in the LIVELOCK folder yet. Keep them safe:

| File | Model | Rows | Notes |
|------|-------|------|-------|
| results_Qwen_Qwen2.5_7B_Instruct.csv | Qwen 7B | 640 | Full 2A URL attack run |
| results_Qwen_Qwen3_4B_Instruct_2507.csv | Qwen3 4B | 640 | Full 2A URL attack, null control |
| results_after_Qwen_Qwen3_4B_Instruct_2507.csv | Qwen7B + Qwen3-4B | 1280 | Combined mid-session file |
| exp2b_rag_defense_qw7b_320_results.csv | Qwen 7B | ~320 | Partial 2B RAG defense (in folder already) |

Consider copying those three CSVs from Downloads into `exp2A-URL/attack/results/qw7b_q3_4b/` for completeness.
