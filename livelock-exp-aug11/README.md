# Livelock experiment notebooks (Aug 2026 snapshot)

Canonical Colab / Bizon notebooks for Exp 2A (URL) and Exp 2B (RAG) attack + defense runs.

## Machine split

- **Colab:** heavier models (e.g. Qwen 2.5 14B defense), Drive checkpointing under `MyDrive/livelock_checkpoints/...`
- **Bizon:** Qwen 7B defense + Gemma attack notebooks (`*-Bizon.ipynb`), local disk, `CUDA_VISIBLE_DEVICES` pinned per notebook

## Notable files

- `exp2A-URL/defense/2A_URL_Defense_MAIN_fallout_qw14b.ipynb` — Colab-only Qwen 14B 2A URL defense (Drive first)
- `exp2B-RAG/defense/2B-RAG-Defense-Main.ipynb` — Colab Qwen 14B 2B RAG defense
- `exp2B-RAG/defense/2B-RAG-Defense-Main-Bizon.ipynb` — Bizon Qwen 7B 2B RAG defense

Do not commit Hugging Face tokens into these notebooks.
