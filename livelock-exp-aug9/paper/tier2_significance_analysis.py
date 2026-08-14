"""
Tier 2 significance testing for the LIVELOCK livelock/AILD paper.

Design locked in with the user on 2026-08-14:
  - Test: Fisher's exact test (two-sided), not a normal-approximation z-test,
    because many cells sit at the 0%/100% boundary.
  - Correction: Holm-Bonferroni, applied within two SEPARATE families:
      Family A: benign-vs-adversarial comparisons (does the attack cause
                liveness failure at all, with or without a defense applied).
      Family B: defense-vs-no-defense comparisons (does a given defense
                reduce the adversarial-condition failure rate relative to
                having no defense, same model/regime/channel).
  - Alpha: 0.05, two-sided.

Inputs: the four gold-standard CSVs in LIVELOCK-GOLD-DATA.
Output: tier2_significance_results.csv (one row per comparison, both
families, with raw and Holm-corrected p-values) plus a printed summary.
"""

import pandas as pd
from scipy.stats import fisher_exact
from statsmodels.stats.multitest import multipletests

GOLD_DIR = "/Users/tanvir/Documents/LIVELOCK-GOLD-DATA"

MODEL_SHORT = {
    "Qwen/Qwen2.5-14B-Instruct": "Qwen2.5-14B",
    "Qwen/Qwen2.5-7B-Instruct": "Qwen2.5-7B",
    "Qwen/Qwen3-4B-Instruct-2507": "Qwen3-4B",
    "meta-llama/Meta-Llama-3.1-8B-Instruct": "Llama3.1-8B",
    "mistralai/Mistral-7B-Instruct-v0.3": "Mistral-7B",
    "unsloth/gemma-3-12b-it-bnb-4bit": "Gemma3-12B",
}

REGIMES = ["Baseline", "Prompt-only", "Controller-only", "Conservative"]
NON_NULL_MODELS = [
    "Qwen/Qwen2.5-14B-Instruct",
    "Qwen/Qwen2.5-7B-Instruct",
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "unsloth/gemma-3-12b-it-bnb-4bit",
]

url_attack = pd.read_csv(f"{GOLD_DIR}/2a_url_attack_GOLD.csv")
url_defense = pd.read_csv(f"{GOLD_DIR}/2a_url_defense_GOLD.csv")
rag_attack = pd.read_csv(f"{GOLD_DIR}/2b_rag_attack_GOLD.csv")
rag_defense = pd.read_csv(f"{GOLD_DIR}/2b_rag_defense_GOLD.csv")

for df in (url_attack, url_defense, rag_attack, rag_defense):
    df["condition"] = df["condition"].replace({"attacker_controlled": "adversarial"})


def counts(df, **filters):
    """Return (n_fail, n_total) for liveness_failure under the given filters."""
    mask = pd.Series(True, index=df.index)
    for k, v in filters.items():
        mask &= df[k] == v
    sub = df[mask]
    n = len(sub)
    if n == 0:
        return None
    x = int(sub["liveness_failure"].sum())
    return x, n


def fisher(a_x, a_n, b_x, b_n):
    table = [[a_x, a_n - a_x], [b_x, b_n - b_x]]
    _, p = fisher_exact(table, alternative="two-sided")
    return p


family_a = []  # benign vs adversarial
family_b = []  # defense vs no-defense


# ---- Family A: pooled headline claims (Table III, per regime; Table IV, overall) ----
pooled_attack = pd.concat(
    [url_attack[url_attack.model_name.isin(NON_NULL_MODELS)],
     rag_attack[rag_attack.model_name.isin(NON_NULL_MODELS)]]
)

for regime in REGIMES:
    b = counts(pooled_attack, regime=regime, condition="benign")
    a = counts(pooled_attack, regime=regime, condition="adversarial")
    if a and b:
        p = fisher(a[0], a[1], b[0], b[1])
        family_a.append({
            "family": "A_benign_vs_adversarial",
            "scope": "pooled_table_III",
            "model": "pooled_5_models",
            "channel": "both",
            "regime": regime,
            "defense": "none",
            "benign_x": b[0], "benign_n": b[1],
            "adv_x": a[0], "adv_n": a[1],
            "adv_rate": round(100 * a[0] / a[1], 2),
            "benign_rate": round(100 * b[0] / b[1], 2),
            "raw_p": p,
        })

b_all = counts(pooled_attack, condition="benign")
a_all = counts(pooled_attack, condition="adversarial")
p_all = fisher(a_all[0], a_all[1], b_all[0], b_all[1])
family_a.append({
    "family": "A_benign_vs_adversarial",
    "scope": "pooled_table_IV_overall",
    "model": "pooled_5_models", "channel": "both", "regime": "all", "defense": "none",
    "benign_x": b_all[0], "benign_n": b_all[1],
    "adv_x": a_all[0], "adv_n": a_all[1],
    "adv_rate": round(100 * a_all[0] / a_all[1], 2),
    "benign_rate": round(100 * b_all[0] / b_all[1], 2),
    "raw_p": p_all,
})

# ---- Family A: per-model x channel x regime, raw attack data (no defense) ----
for channel_name, attack_df in [("url", url_attack), ("rag", rag_attack)]:
    for model in attack_df.model_name.unique():
        for regime in REGIMES:
            b = counts(attack_df, model_name=model, regime=regime, condition="benign")
            a = counts(attack_df, model_name=model, regime=regime, condition="adversarial")
            if a and b:
                p = fisher(a[0], a[1], b[0], b[1])
                family_a.append({
                    "family": "A_benign_vs_adversarial",
                    "scope": "per_model_channel_regime_raw",
                    "model": MODEL_SHORT.get(model, model),
                    "channel": channel_name,
                    "regime": regime,
                    "defense": "none",
                    "benign_x": b[0], "benign_n": b[1],
                    "adv_x": a[0], "adv_n": a[1],
                    "adv_rate": round(100 * a[0] / a[1], 2),
                    "benign_rate": round(100 * b[0] / b[1], 2),
                    "raw_p": p,
                })

# ---- Family A: per-model x channel x regime x defense-arm, benign vs adversarial WITHIN that defense ----
for channel_name, defense_df in [("url", url_defense), ("rag", rag_defense)]:
    for model in defense_df.model_name.unique():
        for regime in REGIMES:
            for defense_name in defense_df.defense_name.unique():
                b = counts(defense_df, model_name=model, regime=regime, condition="benign", defense_name=defense_name)
                a = counts(defense_df, model_name=model, regime=regime, condition="adversarial", defense_name=defense_name)
                if a and b:
                    p = fisher(a[0], a[1], b[0], b[1])
                    family_a.append({
                        "family": "A_benign_vs_adversarial",
                        "scope": "per_model_channel_regime_within_defense",
                        "model": MODEL_SHORT.get(model, model),
                        "channel": channel_name,
                        "regime": regime,
                        "defense": defense_name,
                        "benign_x": b[0], "benign_n": b[1],
                        "adv_x": a[0], "adv_n": a[1],
                        "adv_rate": round(100 * a[0] / a[1], 2),
                        "benign_rate": round(100 * b[0] / b[1], 2),
                        "raw_p": p,
                    })

# ---- Family B: defense vs no-defense, adversarial condition only ----
for channel_name, defense_df in [("url", url_defense), ("rag", rag_defense)]:
    real_defenses = [d for d in defense_df.defense_name.unique() if d != "none"]
    for model in defense_df.model_name.unique():
        for regime in REGIMES:
            none_a = counts(defense_df, model_name=model, regime=regime, condition="adversarial", defense_name="none")
            if not none_a:
                continue
            for defense_name in real_defenses:
                def_a = counts(defense_df, model_name=model, regime=regime, condition="adversarial", defense_name=defense_name)
                if def_a:
                    p = fisher(def_a[0], def_a[1], none_a[0], none_a[1])
                    family_b.append({
                        "family": "B_defense_vs_no_defense",
                        "scope": "adversarial_condition_only",
                        "model": MODEL_SHORT.get(model, model),
                        "channel": channel_name,
                        "regime": regime,
                        "defense": defense_name,
                        "none_x": none_a[0], "none_n": none_a[1],
                        "defense_x": def_a[0], "defense_n": def_a[1],
                        "none_rate": round(100 * none_a[0] / none_a[1], 2),
                        "defense_rate": round(100 * def_a[0] / def_a[1], 2),
                        "raw_p": p,
                    })

df_a = pd.DataFrame(family_a)
df_b = pd.DataFrame(family_b)

_, p_corr_a, _, _ = multipletests(df_a["raw_p"], alpha=0.05, method="holm")
df_a["holm_p"] = p_corr_a
df_a["significant_holm_0.05"] = df_a["holm_p"] < 0.05

_, p_corr_b, _, _ = multipletests(df_b["raw_p"], alpha=0.05, method="holm")
df_b["holm_p"] = p_corr_b
df_b["significant_holm_0.05"] = df_b["holm_p"] < 0.05

df_a.to_csv("/Users/tanvir/Documents/LIVELOCK-EXP-Aug9/paper/tier2_family_A_benign_vs_adversarial.csv", index=False)
df_b.to_csv("/Users/tanvir/Documents/LIVELOCK-EXP-Aug9/paper/tier2_family_B_defense_vs_no_defense.csv", index=False)

print("=" * 80)
print(f"FAMILY A (benign vs adversarial): {len(df_a)} comparisons")
print(f"  Significant after Holm-Bonferroni (alpha=0.05): {df_a['significant_holm_0.05'].sum()} / {len(df_a)}")
print(f"  NOT significant after correction: {(~df_a['significant_holm_0.05']).sum()}")
print()
print("Family A comparisons that FAIL to reach significance after correction:")
print(df_a[~df_a["significant_holm_0.05"]][["scope", "model", "channel", "regime", "defense", "benign_rate", "adv_rate", "benign_n", "adv_n", "raw_p", "holm_p"]].to_string(index=False))
print()
print("=" * 80)
print(f"FAMILY B (defense vs no-defense): {len(df_b)} comparisons")
print(f"  Significant after Holm-Bonferroni (alpha=0.05): {df_b['significant_holm_0.05'].sum()} / {len(df_b)}")
print(f"  NOT significant after correction: {(~df_b['significant_holm_0.05']).sum()}")
print()
print("Family B comparisons that FAIL to reach significance after correction (defense NOT proven to differ from no-defense):")
print(df_b[~df_b["significant_holm_0.05"]][["model", "channel", "regime", "defense", "none_rate", "defense_rate", "none_n", "defense_n", "raw_p", "holm_p"]].to_string(index=False))
print()
print("=" * 80)
print("Headline Table III (pooled by regime) results:")
print(df_a[df_a["scope"] == "pooled_table_III"][["regime", "benign_rate", "adv_rate", "benign_n", "adv_n", "raw_p", "holm_p", "significant_holm_0.05"]].to_string(index=False))
print()
print("Table IV (fully pooled) result:")
print(df_a[df_a["scope"] == "pooled_table_IV_overall"][["benign_rate", "adv_rate", "benign_n", "adv_n", "raw_p", "holm_p", "significant_holm_0.05"]].to_string(index=False))
print()
print("=" * 80)
print("Key defense-table cells (Mistral-7B D-MTD, all models' D-MTD rows) in Family A (within-defense benign vs adv):")
key = df_a[(df_a["scope"] == "per_model_channel_regime_within_defense") & (df_a["defense"].isin(["d_mtd", "rag_d_mtd"]))]
print(key[["model", "channel", "regime", "defense", "benign_rate", "adv_rate", "benign_n", "adv_n", "raw_p", "holm_p", "significant_holm_0.05"]].to_string(index=False))
