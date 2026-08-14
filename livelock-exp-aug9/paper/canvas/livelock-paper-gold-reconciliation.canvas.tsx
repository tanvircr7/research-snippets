import {
  H1,
  H2,
  H3,
  Text,
  Stack,
  Row,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Table,
  Stat,
  Callout,
  Divider,
  Pill,
  BarChart,
  TodoListCard,
  type TodoItem,
  useHostTheme,
} from "cursor/canvas";

export default function LivelockPaperGoldReconciliation() {
  const theme = useHostTheme();

  const coverageRows: Array<[string, string, string, string, string]> = [
    ["Qwen 2.5 7B", "DONE", "DONE", "DONE", "DONE"],
    ["Qwen 2.5 14B", "DONE (shortfall)", "TODO (Colab)", "DONE", "DONE"],
    ["Qwen 3 4B", "DONE (null control)", "N/A (excluded)", "N/A (excluded)", "N/A (excluded)"],
    ["Llama 3.1 8B", "DONE", "DONE", "DONE", "N/A (no data)"],
    ["Mistral 7B", "DONE", "ONGOING (370/640)", "ONGOING (1730/~2560)", "N/A (no data)"],
    ["Gemma 3 12B", "DONE", "DONE", "N/A (excluded)", "N/A (excluded)"],
  ];

  const priorityTodos: TodoItem[] = [
    { id: "1", content: "Recompute Tables III, IV, V directly from the 4 gold CSVs — current .tex numbers do not match any pooling of current gold data", status: "pending" },
    { id: "2", content: "Drop Gemma-12B, Mistral-7B, Qwen3-4B from the defense table (Table V) — no defense rows exist for them in gold; keep Qwen3-4B only in the attack table as a footnoted null control", status: "pending" },
    { id: "3", content: "Add a caveat to Methods: 2 task instances per channel, greedy decoding; benign-condition trials mostly collapse to those 2 deterministic outcomes replicated N times", status: "pending" },
    { id: "4", content: "Reconcile Llama Baseline benign rate: attack-harness says 50% LF (n=100), defense-harness 'none' arm says 0% LF (n=100) — same model/regime/condition, two different numbers", status: "pending" },
    { id: "5", content: "Qualify the D-MTD headline claim by channel: reduces AILD to 0% on URL (2A) but only to 10-17.5% on RAG (2B) for Controller-only/Conservative — 'reduces to zero across the majority of configurations' is no longer accurate as a channel-blind claim", status: "pending" },
    { id: "6", content: "Add Wilson 95% CIs to every reported percentage (Tier 1) — now cheap, since gold CSVs have per-cell N up to 100", status: "pending" },
    { id: "7", content: "Run Fisher's exact / two-proportion z-tests with Holm-Bonferroni correction per AILD cell (Tier 2)", status: "pending" },
    { id: "8", content: "Fit the mixed-effects logistic regression (LF ~ condition*regime + channel_type + (1|model)) now that N supports it (Tier 5)", status: "pending" },
    { id: "9", content: "Explain Llama Prompt-only early-abort AILD = -40.0 at n=100 (well-powered, not noise) and d_mtd's small negative AILD values (-3 to -5) in Baseline/Prompt-only", status: "pending" },
  ];

  return (
    <Stack gap={20}>
      <Stack gap={4}>
        <H1>Livelock Paper vs. Current Gold Standard</H1>
        <Text tone="secondary" size="small">
          Source: `LIVELOCK-GOLD-DATA/*_GOLD.csv` (4 files, 15,668 rows total) and `agentic_livelock_threats.tex`. Computed 2026-08-13.
        </Text>
      </Stack>

      <Callout tone="success" title="Headline: Claude's Tier 4 problem is already solved">
        The beta review flagged Table V as N=10 per cell (Wilson CI as wide as [5.7%, 51.0%] for a 20% point estimate).
        The gold-standard defense data now sitting on disk has min N=40, max N=100, mean N≈78 per cell for the URL channel,
        and a flat N=40 per cell for the RAG channel. That is inside or above the review's own "N≥30-50" target for every cell except none.
        The paper's tables have not caught up to this data yet.
      </Callout>

      <Grid columns={4} gap={12}>
        <Stat value="15,668" label="Total gold-standard rows (4 CSVs)" />
        <Stat value="6 / 6" label="Models with attack data (2A + 2B)" tone="success" />
        <Stat value="3 / 6" label="Models with any defense data" tone="warning" />
        <Stat value="2" label="Distinct task instances per channel" tone="danger" />
      </Grid>

      <Divider />

      <Stack gap={8}>
        <H2>1. Per-cell N: before vs. now</H2>
        <Text tone="secondary" size="small">
          Left group is the review's reverse-engineered estimate for the paper's current Table V. Right group is the actual
          per-cell N in `2a_url_defense_GOLD.csv` and `2b_rag_defense_GOLD.csv` today, computed across all (model, regime, defense, condition) cells.
        </Text>
        <BarChart
          categories={["Table V as published (review estimate)", "2A URL defense (gold, now)", "2B RAG defense (gold, now)"]}
          series={[
            { name: "Min N per cell", data: [10, 40, 40], tone: "danger" },
            { name: "Mean N per cell", data: [10, 78, 40], tone: "info" },
            { name: "Max N per cell", data: [10, 100, 40], tone: "success" },
          ]}
          valueSuffix=""
          referenceLines={[{ value: 50, label: "Tier 4 target (N≥50)", tone: "warning" }]}
          height={260}
        />
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>2. Model coverage actually in the gold standard</H2>
        <Text tone="secondary" size="small">
          This is what the four gold CSVs contain right now, not what the notebooks are capable of running. The paper's current
          Table V lists all 6 models under defense; only 3 have any defense rows.
        </Text>
        <Table
          headers={["Model", "2A URL Attack", "2B RAG Attack", "2A URL Defense", "2B RAG Defense"]}
          rows={coverageRows}
          columnAlign={["left", "left", "left", "left", "left"]}
          rowTone={["success", "info", "neutral", "warning", "warning", "info"]}
          striped
        />
      </Stack>

      <Divider />

      <Grid columns={2} gap={16} align="start">
        <Card>
          <CardHeader trailing={<Pill size="sm">n=480, 0 failures</Pill>}>Decision: Qwen3-4B</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text size="small">
                Qwen3-4B shows exactly 0.0% liveness failure in every one of its 8 attack arms — Baseline (n=100/100),
                Prompt-only (n=100/100), Controller-only (n=60/60), Conservative (n=60/60), benign and adversarial alike.
                480 trials, 0 failures, both conditions.
              </Text>
              <Text size="small" weight="semibold">
                Team decision: stop investigating this as a harness bug. Keep Qwen3-4B in the 2A attack table only, footnoted
                as a null control excluded from pooled statistics and from all defense work due to low instruction-following.
              </Text>
              <Text tone="tertiary" size="small">
                This resolves review anomaly (a) by decision rather than further debugging.
              </Text>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader trailing={<Pill size="sm">real, n=100</Pill>}>Confirmed: Llama Baseline anomaly (b) is real</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text size="small">
                Review anomaly (b) — Llama3.1-8B hitting 100% AILD at Baseline when every other model treats Baseline as
                benign — is confirmed at full N in the defense gold file: benign 0% (n=100) vs adversarial 77% (n=100),
                Wilson CI [67.9%, 84.2%]. Worth its own paragraph, not a footnote.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Divider />

      <Stack gap={8}>
        <H2>3. New finding: benign trials are mostly not independent draws</H2>
        <Callout tone="warning" title="Not in the beta review — found while inspecting raw per-trial rows">
          All 4 channels use exactly 2 fixed task instances (`arith_37_42` / `count_r_strawberry` for URL,
          `deadline_policy` / `policy_applicability` for RAG) under greedy decoding. Under benign conditions
          the delegation channel is deterministic, so an entire cell of N trials collapses to the same 2 outcomes
          replicated N times. Under adversarial conditions the channel injects confidence jitter, so trials there
          are genuinely distinct draws.
        </Callout>
        <Table
          headers={["File", "Condition", "Cells that collapse to ≤2 unique outcomes", "Total cells"]}
          rows={[
            ["2a_url_attack_GOLD.csv", "benign", "24", "24"],
            ["2a_url_attack_GOLD.csv", "attacker_controlled", "4", "24"],
            ["2a_url_defense_GOLD.csv", "benign", "36", "48"],
            ["2a_url_defense_GOLD.csv", "attacker_controlled", "0", "48"],
            ["2b_rag_defense_GOLD.csv", "benign", "6", "32"],
            ["2b_rag_defense_GOLD.csv", "attacker_controlled", "0", "32"],
          ]}
          columnAlign={["left", "left", "right", "right"]}
        />
        <Text tone="secondary" size="small">
          Practical effect: N=60 for a benign cell is often really 2 unique task outcomes, replicated 30 times each — the
          effective sample size for CI purposes is closer to 2, not 60. Adversarial-condition N is not affected. This is a
          methods-section disclosure item (Tier 6, "state number of distinct task instances"), sharpened with the exact collapse counts above.
        </Text>
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>4. D-MTD's headline claim needs a channel qualifier</H2>
        <Text tone="secondary" size="small">
          AILD under D-MTD (`d_mtd` on URL, `rag_d_mtd` on RAG), Controller-only and Conservative regimes, pooled across the
          models that have defense data on each channel (Qwen 7B + Qwen 14B on both; Llama only on URL).
        </Text>
        <BarChart
          categories={["Controller-only", "Conservative"]}
          series={[
            { name: "2A URL — d_mtd (Qwen14B/Qwen7B/Llama)", data: [0.0, 0.0], tone: "success" },
            { name: "2B RAG — rag_d_mtd (Qwen14B)", data: [10.0, 17.5], tone: "warning" },
            { name: "2B RAG — rag_d_mtd (Qwen7B)", data: [12.5, 10.0], tone: "danger" },
          ]}
          valueSuffix="%"
          height={260}
        />
        <Callout tone="warning" title="Current .tex text">
          Section VII-B.4 states D-MTD "reduces degradation to zero in many cases" and the abstract says "reduces AILD to
          zero across the majority of model-regime configurations." True on URL. On RAG, D-MTD lands at 10-17.5% residual
          AILD in the two enforced regimes for both models with RAG defense data — a real, large reduction from 100%, but
          not zero. The claim needs the word "URL channel" or an explicit RAG caveat.
        </Callout>
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>5. Table-by-table changes needed in `agentic_livelock_threats.tex`</H2>
        <Grid columns={2} gap={12}>
          <Card>
            <CardHeader trailing={<Pill size="sm">stale</Pill>}>Table III / IV — attack results</CardHeader>
            <CardBody>
              <Text size="small">
                Current numbers (Baseline benign 4.55%, Controller-only adv 74.87%, overall benign 3.41% / adv 49.35%) do
                not reproduce from any pooling of the 6-model gold attack data tried so far (all-model pooled, Qwen3-4B
                excluded, single-model Qwen-7B). They predate the Aug 9-13 consolidation. Needs a full recompute from
                `2a_url_attack_GOLD.csv` + `2b_rag_attack_GOLD.csv`, stated per-model and pooled, with Qwen3-4B excluded
                from pooled numbers and footnoted separately.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader trailing={<Pill size="sm">stale + wrong models</Pill>}>Table V — defense results</CardHeader>
            <CardBody>
              <Text size="small">
                Lists Gemma3-12B, Mistral-7B, Qwen3-4B, none of which have defense rows in gold. Rebuild with only
                Qwen2.5-14B, Qwen2.5-7B, Llama3.1-8B (URL) and Qwen2.5-14B, Qwen2.5-7B (RAG), split by channel since
                D-MTD behaves differently per channel (see section 4 above). Add N and Wilson CI per cell.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader trailing={<Pill size="sm">needs a sentence</Pill>}>Section IV-D / VIII — model list</CardHeader>
            <CardBody>
              <Text size="small">
                Table II lists 6 evaluated LLMs uniformly. Add a column or footnote distinguishing attack-only
                (Qwen3-4B, Gemma3-12B) from attack+defense (Qwen2.5-7B/14B, Llama3.1-8B) coverage, and state the
                Qwen3-4B exclusion rationale (low instruction-following, 0/480 failures) once, near Table II.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader trailing={<Pill size="sm">new paragraph</Pill>}>Methods (V-A) — task diversity disclosure</CardHeader>
            <CardBody>
              <Text size="small">
                State N=2 task instances per channel under greedy decoding, and that benign-condition replication is
                largely deterministic while adversarial-condition replication reflects real channel-level stochasticity
                (confidence jitter / rotation). This is the Claude review's Tier 6 ask, now backed by exact numbers.
              </Text>
            </CardBody>
          </Card>
        </Grid>
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>6. Priority checklist for the next revision pass</H2>
        <TodoListCard todos={priorityTodos} defaultExpanded />
      </Stack>

      <Callout tone="info" title="Still open from the Claude review, not yet started">
        Tier 2 (per-cell significance tests + Holm-Bonferroni), Tier 5 (mixed-effects logistic regression with model as
        random intercept), and Tier 6 polish items (Cohen's h, Table IV caption fix) are unaffected by the data collected
        since the review and remain to be done on top of the recomputed tables above.
      </Callout>
    </Stack>
  );
}
