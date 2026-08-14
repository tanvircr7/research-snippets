# LIVELOCK Gold Standard Data

Updated 2026-08-14 (afternoon). Data only. No notebooks.

This folder is a git repo, separate from `LIVELOCK-EXP-Aug9`.

## Files

| File | Rows | What it is |
|------|------|------------|
| `2a_url_attack_GOLD.csv` | 3757 | 2A URL attack, 6 models |
| `2a_url_defense_GOLD.csv` | 10041 | 2A URL defense: Qwen 14B + Llama + Qwen 7B + Mistral |
| `2b_rag_attack_GOLD.csv` | 3142 | 2B RAG attack: Qwen 7B + Qwen 14B + Llama + Mistral + Gemma 12B |
| `2b_rag_defense_GOLD.csv` | 2560 | 2B RAG defense: Qwen 7B + Qwen 14B, 1280 each |

Do not concatenate 2A and 2B without aligning schemas.

## Not in gold

- 2B RAG defense Mistral: not run, not planned in current scope.
- 2B RAG defense exploratory Qwen 7B file (`exp2b_rag_defense_qw7b_320_results.csv`, 320 rows, old schema): excluded, superseded by the full 1280-row run.

## 2A URL attack

Unchanged. 3757 rows, 6 models.

## 2A URL defense

| Model | Rows | Notes |
|-------|------|-------|
| Qwen/Qwen2.5-14B-Instruct | 2364 | Colab. 2 task_ids, greedy |
| Qwen/Qwen2.5-7B-Instruct | 2560 | Bizon. Full 32-arm grid, 0 failed |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 2560 | Bizon. Full 32-arm grid |
| mistralai/Mistral-7B-Instruct-v0.3 | 2557 | Bizon. 3 failed of 2560 |

Mistral is the only model where D-MTD does not fully zero AILD in every regime: Prompt-only d_mtd AILD is 37% (n=100), versus 0% for the other three models' d_mtd cells outside Baseline/Prompt-only near-zero.

## 2B RAG attack

| Model | Rows | Notes |
|-------|------|-------|
| Qwen/Qwen2.5-7B-Instruct | 640 | Full |
| Qwen/Qwen2.5-14B-Instruct | 640 | Full. Colab. NEW Aug 14 afternoon. 0 failed |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 638 | Conservative 59/60 each side |
| mistralai/Mistral-7B-Instruct-v0.3 | 635 | 5 failed of 640 |
| unsloth/gemma-3-12b-it-bnb-4bit | 589 | 51 failed of 640 |

Qwen 14B 2B RAG AILD: Baseline/Prompt-only adversarial 4% (n=100), Controller-only and Conservative adversarial 100% (n=60). Benign 0% across all regimes. 2B RAG attack is complete for all planned models.

## 2B RAG defense

| Model | Rows | Notes |
|-------|------|-------|
| Qwen/Qwen2.5-7B-Instruct | 1280 | Bizon. 40 per arm, 4 defenses |
| Qwen/Qwen2.5-14B-Instruct | 1280 | Colab. 40 per arm, 4 defenses. 1280/1280 |

## Progress matrix

| Model | 2A URL Attack | 2B RAG Attack | 2A URL Defense | 2B RAG Defense |
|-------|---------------|---------------|----------------|----------------|
| Qwen 7B | DONE | DONE | DONE | DONE |
| Qwen 14B | DONE | DONE | DONE | DONE |
| Qwen3 4B | DONE | TODO | N/A | N/A |
| Llama 8B | DONE | DONE | DONE | N/A |
| Mistral 7B | DONE | DONE | DONE | N/A (not planned) |
| Gemma 12B | DONE | DONE | N/A | N/A |
| Gemma 4B | SMOKE only | unconfirmed | N/A | N/A |

DONE in this folder means the rows are in the CSVs above.
