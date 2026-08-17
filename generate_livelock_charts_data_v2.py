"""
generate_livelock_charts_data_v2.py

Reads the 4 LIVELOCK gold CSVs and produces 3 chart-ready CSVs in the
exact "wide" layout used previously for the Google Sheets charts:

  1. Figure2_AILD_Tool_vs_RAG.csv
     Columns: Regime, Tool Benign, Tool Adversarial, RAG Benign, RAG Adversarial
     Source: 2a_url_attack_GOLD.csv (Tool) + 2b_rag_attack_GOLD.csv (RAG)

  2. Figure3_wide_for_excel_all10.csv
     Columns: Regime, <Model> Adversarial, <Model> Benign  (x4 models)
     Models: Qwen2.5-7B, Qwen2.5-14B, Gemma3-12B, Mistral-7B
     Source: 2b_rag_attack_GOLD.csv only

  3. figure6_liveness_success_wide.csv
     Columns: Surface, Defense, Liveness Restored Attacker,
              Liveness Restored Benign, Task Success Attacker, Task Success Benign
     Source: 2a_url_defense_GOLD.csv (Tool) + 2b_rag_defense_GOLD.csv (RAG)

Expects to be run from the repo root, alongside a `livelock-gold-data/`
folder containing the 4 GOLD CSVs (plus README.md and .gitignore). Output
is written to a `Graph-CSV-Data/` folder created at the repo root.

Usage (defaults, run from repo root):
    python generate_livelock_charts_data_v2.py

Usage (custom paths):
    python generate_livelock_charts_data_v2.py --data-dir /path/to/csvs --out-dir /path/to/output
"""

import argparse
import csv
import os
from collections import defaultdict

REGIME_ORDER = ["Baseline", "Prompt-only", "Controller-only", "Conservative"]

DEFENSE_LABELS = {
    "none": "No Defense",
    "budget_cap": "Budget Cap",
    "early_abort": "Early Abort",
    "d_mtd": "D-MTD",
    "rag_d_mtd": "D-MTD",
}
DEFENSE_ORDER = ["No Defense", "Budget Cap", "Early Abort", "D-MTD"]

CHANNEL_LABELS = {"url": "Tool", "rag": "RAG"}

MODEL_SHORT_NAMES = {
    "Qwen/Qwen2.5-7B-Instruct": "Qwen2.5-7B",
    "Qwen/Qwen2.5-14B-Instruct": "Qwen2.5-14B",
    "meta-llama/Meta-Llama-3.1-8B-Instruct": "Llama3.1-8B",
    "mistralai/Mistral-7B-Instruct-v0.3": "Mistral-7B",
    "unsloth/gemma-3-12b-it-bnb-4bit": "Gemma3-12B",
    "Qwen/Qwen3-4B-Instruct-2507": "Qwen3-4B",
}

# Preferred column order for Figure 3 (matches original reference file order).
# Any additional models found in the data that aren't in this list are
# appended after these, in the order first encountered.
FIGURE3_PREFERRED_MODEL_ORDER = ["Qwen2.5-7B", "Qwen2.5-14B", "Gemma3-12B", "Mistral-7B"]


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def to_bool_int(value):
    """Handle liveness_failure/liveness_restored/success style fields as 0/1 or True/False."""
    if value is None:
        return 0
    v = str(value).strip().lower()
    if v in ("1", "true", "t", "yes"):
        return 1
    return 0


def pct(numer, denom):
    return round(100.0 * numer / denom, 2) if denom else 0


# ---------------------------------------------------------------------------
# Figure 2: AILD, Tool vs RAG (wide)
# ---------------------------------------------------------------------------
def build_figure2(url_attack_rows, rag_attack_rows, out_path):
    # (regime, channel_label, condition) -> [fail_sum, n]
    agg = defaultdict(lambda: [0, 0])

    def add_rows(rows, channel_key):
        channel_label = CHANNEL_LABELS[channel_key]
        for r in rows:
            regime = r.get("regime")
            cond = "Adversarial" if r.get("condition") == "attacker_controlled" else "Benign"
            key = (regime, channel_label, cond)
            agg[key][0] += to_bool_int(r.get("liveness_failure"))
            agg[key][1] += 1

    add_rows(url_attack_rows, "url")
    add_rows(rag_attack_rows, "rag")

    fieldnames = ["Regime", "Tool Benign", "Tool Adversarial", "RAG Benign", "RAG Adversarial"]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for regime in REGIME_ORDER:
            row = {"Regime": regime}
            for channel in ["Tool", "RAG"]:
                for cond in ["Benign", "Adversarial"]:
                    s, n = agg[(regime, channel, cond)]
                    row[f"{channel} {cond}"] = pct(s, n)
            writer.writerow(row)
    print(f"Wrote {out_path}")


# ---------------------------------------------------------------------------
# Figure 3: per-model failure rate across regimes (wide, RAG attack only)
# ---------------------------------------------------------------------------
def build_figure3(rag_attack_rows, out_path):
    # (model_label, regime, condition) -> [fail_sum, n]
    agg = defaultdict(lambda: [0, 0])
    models_seen_order = []  # preserves first-seen order for any models outside the preferred list

    for r in rag_attack_rows:
        model_label = MODEL_SHORT_NAMES.get(r.get("model_name"), r.get("model_name"))
        if model_label not in models_seen_order:
            models_seen_order.append(model_label)
        regime = r.get("regime")
        cond = "Adversarial" if r.get("condition") == "attacker_controlled" else "Benign"
        key = (model_label, regime, cond)
        agg[key][0] += to_bool_int(r.get("liveness_failure"))
        agg[key][1] += 1

    # Preferred models first (matches original template order), then any
    # extra models found in the data that weren't in the original template.
    extra_models = [m for m in models_seen_order if m not in FIGURE3_PREFERRED_MODEL_ORDER]
    known_models_present = [m for m in FIGURE3_PREFERRED_MODEL_ORDER if m in models_seen_order]
    figure3_models = known_models_present + extra_models

    if extra_models:
        print(f"NOTE: found model(s) in the data not in the original Figure 3 template: {extra_models}. "
              f"They have been appended as extra columns.")
    else:
        print("NOTE: no extra models beyond the original Figure 3 template were found in the data.")

    fieldnames = ["Regime"]
    for model in figure3_models:
        fieldnames.append(f"{model}  Adversarial")
        fieldnames.append(f"{model}  Benign")

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for regime in REGIME_ORDER:
            row = {"Regime": regime}
            for model in figure3_models:
                s_adv, n_adv = agg[(model, regime, "Adversarial")]
                s_ben, n_ben = agg[(model, regime, "Benign")]
                row[f"{model}  Adversarial"] = pct(s_adv, n_adv)
                row[f"{model}  Benign"] = pct(s_ben, n_ben)
            writer.writerow(row)
    print(f"Wrote {out_path}")


# ---------------------------------------------------------------------------
# Figure 6: Liveness Restored / Task Success (wide)
# ---------------------------------------------------------------------------
def build_figure6(url_defense_rows, rag_defense_rows, out_path):
    # (surface_label, defense_label, condition) -> [restored_sum, success_sum, n]
    agg = defaultdict(lambda: [0, 0, 0])

    def add_rows(rows, channel_key):
        surface_label = CHANNEL_LABELS[channel_key]
        for r in rows:
            defense_label = DEFENSE_LABELS.get(r.get("defense_name", "none"), r.get("defense_name"))
            cond = "Attacker" if r.get("condition") == "attacker_controlled" else "Benign"
            key = (surface_label, defense_label, cond)
            agg[key][0] += to_bool_int(r.get("liveness_restored"))
            agg[key][1] += to_bool_int(r.get("success"))
            agg[key][2] += 1

    add_rows(url_defense_rows, "url")
    add_rows(rag_defense_rows, "rag")

    fieldnames = [
        "Surface", "Defense",
        "Liveness Restored Attacker", "Liveness Restored Benign",
        "Task Success Attacker", "Task Success Benign",
    ]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for defense in DEFENSE_ORDER:
            for surface in ["RAG", "Tool"]:
                restored_sum, success_sum, n = agg[(surface, defense, "Attacker")]
                restored_sum_b, success_sum_b, n_b = agg[(surface, defense, "Benign")]
                writer.writerow({
                    "Surface": surface,
                    "Defense": defense,
                    "Liveness Restored Attacker": pct(restored_sum, n),
                    "Liveness Restored Benign": pct(restored_sum_b, n_b),
                    "Task Success Attacker": pct(success_sum, n),
                    "Task Success Benign": pct(success_sum_b, n_b),
                })
    print(f"Wrote {out_path}")


def main():
    parser = argparse.ArgumentParser(description="Build LIVELOCK wide chart CSVs from gold data.")
    parser.add_argument(
        "--data-dir",
        default="livelock-gold-data",
        help="Folder containing the 4 GOLD CSVs, README, and .gitignore (default: livelock-gold-data)",
    )
    parser.add_argument(
        "--out-dir",
        default="Graph-CSV-Data",
        help="Folder to write the 3 output CSVs (default: Graph-CSV-Data, created at repo root)",
    )
    args = parser.parse_args()

    url_attack = load_csv(os.path.join(args.data_dir, "2a_url_attack_GOLD.csv"))
    url_defense = load_csv(os.path.join(args.data_dir, "2a_url_defense_GOLD.csv"))
    rag_attack = load_csv(os.path.join(args.data_dir, "2b_rag_attack_GOLD.csv"))
    rag_defense = load_csv(os.path.join(args.data_dir, "2b_rag_defense_GOLD.csv"))

    os.makedirs(args.out_dir, exist_ok=True)

    build_figure2(
        url_attack, rag_attack,
        os.path.join(args.out_dir, "Figure2_AILD_Tool_vs_RAG.csv"),
    )
    build_figure3(
        rag_attack,
        os.path.join(args.out_dir, "Figure3_wide_for_excel_all10.csv"),
    )
    build_figure6(
        url_defense, rag_defense,
        os.path.join(args.out_dir, "figure6_liveness_success_wide.csv"),
    )


if __name__ == "__main__":
    main()