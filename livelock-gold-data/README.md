# LIVELOCK Gold Standard Data

Updated 2026-08-13. Data only. No notebooks.

This folder is a git repo, separate from `LIVELOCK-EXP-Aug9`.

## Files

| File | Rows | What it is |
|------|------|------------|
| `2a_url_attack_GOLD.csv` | 3757 | 2A URL attack, 6 models |
| `2a_url_defense_GOLD.csv` | 7484 | 2A URL defense: Qwen 14B + Qwen 7B + Llama |
| `2b_rag_attack_GOLD.csv` | 1867 | 2B RAG attack: Gemma 12B + Qwen 7B + Llama |
| `2b_rag_defense_GOLD.csv` | 2560 | 2B RAG defense: Qwen 7B + Qwen 14B, 1280 each |

Do not concatenate 2A and 2B without aligning schemas.

## Not in gold (in-progress snapshots only)

- 2A URL defense Mistral: mid 1730 of ~2560. Mixed file also contains completed Qwen 7B rows. Do not treat as final.
- 2B RAG attack Mistral: mid 370 of 640. Mixed file also contains Qwen 7B and Llama.

## 2A URL attack

Unchanged. 3757 rows, 6 models.

## 2A URL defense

| Model | Rows | Notes |
|-------|------|-------|
| Qwen/Qwen2.5-14B-Instruct | 2364 | Colab. 2 task_ids, greedy |
| Qwen/Qwen2.5-7B-Instruct | 2560 | Bizon. Full 32-arm grid |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 2560 | Bizon. Full 32-arm grid |

## 2B RAG attack

| Model | Rows | Notes |
|-------|------|-------|
| unsloth/gemma-3-12b-it-bnb-4bit | 589 | 51 failed of 640 |
| Qwen/Qwen2.5-7B-Instruct | 640 | Full |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 638 | Conservative 59/60 each side |

## 2B RAG defense

| Model | Rows | Notes |
|-------|------|-------|
| Qwen/Qwen2.5-7B-Instruct | 1280 | Bizon. 40 per arm, 4 defenses |
| Qwen/Qwen2.5-14B-Instruct | 1280 | Colab. 40 per arm, 4 defenses. 1280/1280 |

## Progress matrix

| Model | 2A URL Attack | 2B RAG Attack | 2A URL Defense | 2B RAG Defense |
|-------|---------------|---------------|----------------|----------------|
| Qwen 7B | DONE | DONE | DONE | DONE |
| Qwen 14B | DONE | TODO (Colab) | DONE | DONE |
| Qwen3 4B | DONE | TODO | N/A | N/A |
| Llama 8B | DONE | DONE | DONE | N/A |
| Mistral 7B | DONE | ONGOING (370/640) | ONGOING (1730/~2560) | N/A |
| Gemma 12B | DONE | DONE | N/A | N/A |
| Gemma 4B | SMOKE only | unconfirmed | N/A | N/A |

DONE in this folder means the rows are in the CSVs above.
