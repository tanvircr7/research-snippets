import {
  BarChart,
  LineChart,
  Stack,
  Row,
  Grid,
  H1,
  H2,
  H3,
  Text,
  Stat,
  Divider,
  Callout,
  Card,
  CardHeader,
  CardBody,
  useHostTheme,
} from "cursor/canvas";

// ────────────────────────────────────────────────────────────────────────────
// Inline aggregates — computed 2026-08-16/17 from LIVELOCK-GOLD-DATA gold CSVs
// ────────────────────────────────────────────────────────────────────────────

const REGIMES = ["Baseline", "Prompt-only", "Controller-only", "Conservative"];

// ── Attack aggregates ────────────────────────────────────────────────────────

// A1: regime-level effect, pooled 5 models + both channels
const a1Adv = [15.8, 22.5, 79.9, 83.5];
const a1Ben = [6.0,  5.7,  5.0,  0.0];

// A2: per-model adversarial AILD by regime, pooled both channels
const MODELS_ATK = ["Gemma 12B", "Llama 8B", "Mistral 7B", "Qwen 14B", "Qwen 7B"];
const a2ByRegime: Record<string, number[]> = {
  "Baseline":        [23.5, 40.9,  9.6,  2.3,  1.5],
  "Prompt-only":     [24.5, 51.5, 33.9,  2.1,  0.0],
  "Controller-only": [62.9, 52.1, 82.5, 100.0, 100.0],
  "Conservative":    [72.4, 62.2, 82.4, 100.0, 100.0],
};

// A3: pooled channel comparison (5-model avg)
const a3URL = [13.9, 26.7, 88.0, 90.2];
const a3RAG = [17.7, 18.4, 71.6, 76.5];

// A3b: per-model adversarial AILD by regime, split by channel
// Rows: Gemma 12B, Llama 8B, Mistral 7B, Qwen 14B, Qwen 7B
// Cols: Baseline, Prompt-only, Controller-only, Conservative
const a3bURLByModel: Record<string, number[]> = {
  "Gemma 12B":  [0.0,  0.0,  43.1,  55.0],
  "Llama 8B":   [67.3, 91.0, 100.0, 100.0],
  "Mistral 7B": [0.0,  41.3, 100.0,  98.3],
  "Qwen 14B":   [0.0,  0.0,  100.0, 100.0],
  "Qwen 7B":    [0.0,  0.0,  100.0, 100.0],
};
const a3bRAGByModel: Record<string, number[]> = {
  "Gemma 12B":  [47.0, 49.0, 100.0, 100.0],
  "Llama 8B":   [15.0, 12.0,   6.7,  23.7],  // note: anomalous pattern
  "Mistral 7B": [19.4, 27.0,  65.0,  66.7],
  "Qwen 14B":   [ 4.0,  4.0, 100.0, 100.0],
  "Qwen 7B":    [ 3.0,  0.0, 100.0, 100.0],
};

// ── Defense aggregates ───────────────────────────────────────────────────────

const MODELS_DEF = ["Llama 8B", "Mistral 7B", "Qwen 14B", "Qwen 7B"];

// D1: URL defense adversarial AILD, pooled regimes
const d1DefLabels = ["none", "budget_cap", "early_abort", "d_mtd"];
const d1ByDef: Record<string, number[]> = {
  "none":        [88.4, 50.6, 33.6, 37.5],
  "budget_cap":  [97.2, 52.5, 39.4, 38.1],
  "early_abort": [ 9.7,  6.6,  3.0,  5.0],
  "d_mtd":       [20.9, 11.9,  0.0,  0.0],
};

// D2: RAG defense adversarial AILD, pooled regimes
const d2DefLabels = ["none", "budget_cap", "early_abort", "rag_d_mtd"];
const d2ByDef: Record<string, number[]> = {
  "none":        [81.3, 55.4, 51.2, 51.2],
  "budget_cap":  [86.9, 68.8, 70.0, 63.7],
  "early_abort": [14.6,  6.7,  4.4,  7.5],
  "rag_d_mtd":   [ 9.4,  8.2,  6.9,  5.6],
};

// D-URL-regime: per-model URL defense AILD by regime (adversarial)
const dUrlRegime: Record<string, Record<string, number[]>> = {
  "Llama 8B":   { none: [77.0, 86.0, 100.0, 100.0], budget_cap: [92.0, 99.0, 100.0, 100.0], early_abort: [5.0, 10.0, 10.0, 16.7], d_mtd: [20.0, 47.0, 0.0, 0.0] },
  "Mistral 7B": { none: [0.0, 41.8, 100.0, 100.0],  budget_cap: [0.0, 48.0, 100.0, 100.0],  early_abort: [0.0, 6.0, 20.0, 5.0],   d_mtd: [1.0, 37.0, 0.0, 0.0] },
  "Qwen 14B":   { none: [0.0, 0.0, 100.0, 100.0],   budget_cap: [7.1, 2.3, 100.0, 100.0],   early_abort: [0.0, 0.0, 5.9, 10.4],   d_mtd: [0.0, 0.0, 0.0, 0.0] },
  "Qwen 7B":    { none: [0.0, 0.0, 100.0, 100.0],   budget_cap: [0.0, 2.0, 100.0, 100.0],   early_abort: [0.0, 0.0, 11.7, 15.0],  d_mtd: [0.0, 0.0, 0.0, 0.0] },
};

// D-RAG-regime: per-model RAG defense AILD by regime (adversarial)
const dRagRegime: Record<string, Record<string, number[]>> = {
  "Llama 8B":   { none: [65.0, 62.5, 100.0, 100.0], budget_cap: [67.5, 80.0, 100.0, 100.0], early_abort: [10.0, 12.5, 17.5, 18.4], rag_d_mtd: [10.0, 7.7, 5.0, 15.0] },
  "Mistral 7B": { none: [33.3, 10.0, 100.0, 100.0], budget_cap: [37.5, 37.5, 100.0, 100.0], early_abort: [2.6, 12.5, 8.8, 2.7],    rag_d_mtd: [5.1, 5.0, 15.0, 7.7] },
  "Qwen 14B":   { none: [2.5, 2.5, 100.0, 100.0],   budget_cap: [37.5, 42.5, 100.0, 100.0], early_abort: [0.0, 0.0, 12.5, 5.0],    rag_d_mtd: [0.0, 0.0, 10.0, 17.5] },
  "Qwen 7B":    { none: [5.0, 0.0, 100.0, 100.0],   budget_cap: [25.0, 30.0, 100.0, 100.0], early_abort: [0.0, 0.0, 12.5, 17.5],   rag_d_mtd: [0.0, 0.0, 12.5, 10.0] },
};

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function ChartCaption({ children }: { children: string }) {
  return <Text tone="secondary" size="small">{children}</Text>;
}

function SectionLabel({ fig, type, note }: { fig: string; type: string; note: string }) {
  return (
    <Row align="center" gap={10}>
      <H3>{fig}</H3>
      <Text tone="secondary" size="small">{type} · {note}</Text>
    </Row>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export default function LivelockGraphCatalog() {
  useHostTheme(); // ensures theme tokens are active

  return (
    <Stack gap={32} style={{ padding: 24, maxWidth: 1024, margin: "0 auto" }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Stack gap={6}>
        <H1>Livelock Paper — Figure Catalog (Draft)</H1>
        <Text tone="secondary">
          All chart candidates from{" "}
          <Text as="span" weight="semibold">GRAPH_PLAN_2026-08-16.md</Text>.{" "}
          Tier-1 (A1, A2, A3, A3b, D1, D2, D-URL-regime, D-RAG-regime) rendered from
          real gold-standard aggregates. Tier-2 data tables are in the memo.
          Source: LIVELOCK-GOLD-DATA · 2026-08-16/17.
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="5" label="Attack models" />
        <Stat value="4" label="Defense models" />
        <Stat value="2" label="Channels (URL + RAG)" />
        <Stat value="21,012" label="Total trials" />
      </Grid>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════════ */}
      <H2>Attack</H2>

      {/* ── A1 ─────────────────────────────────────────────────────────── */}
      <Stack gap={8}>
        <SectionLabel fig="A1 — Regime-level effect" type="Grouped bar" note="Tier 1 · Fig: liveness_degradation (candidate)" />
        <ChartCaption>
          Adversarial vs. benign AILD% · pooled across 5 models and both channels.
          Source: 2a_url_attack_GOLD + 2b_rag_attack_GOLD · 2026-08-16
        </ChartCaption>
        <BarChart
          categories={REGIMES}
          series={[
            { name: "Adversarial", data: a1Adv, tone: "danger" },
            { name: "Benign",      data: a1Ben, tone: "neutral" },
          ]}
          valueSuffix="%" yMax={100} height={240} showValues
        />
        <ChartCaption>
          Y: AILD rate (%). The 4x jump from Prompt-only (22.5%) to Controller-only
          (79.9%) is the paper's core finding. Benign stays flat or falls to 0%.
        </ChartCaption>
      </Stack>

      <Divider />

      {/* ── A2 ─────────────────────────────────────────────────────────── */}
      <Stack gap={8}>
        <SectionLabel fig="A2 — Per-model vulnerability" type="Grouped bar" note="Tier 1 · adversarial only · pooled both channels" />
        <ChartCaption>
          Adversarial AILD% per model, broken out by regime.
          Source: 2a_url_attack_GOLD + 2b_rag_attack_GOLD · 2026-08-16
        </ChartCaption>
        <BarChart
          categories={MODELS_ATK}
          series={REGIMES.map((r) => ({ name: r, data: a2ByRegime[r] }))}
          valueSuffix="%" yMax={100} height={260}
        />
        <ChartCaption>
          Y: adversarial AILD rate (%). Qwen 7B / 14B near-zero until the controller
          engages, then flip to 100%. Llama 8B is elevated across all regimes.
          Gemma 12B tops out at ~72% even at Conservative.
        </ChartCaption>
      </Stack>

      <Divider />

      {/* ── A3 ─────────────────────────────────────────────────────────── */}
      <Stack gap={8}>
        <SectionLabel fig="A3 — Channel comparison (pooled)" type="Line graph" note="Tier 1 · Fig: across-delegation-types (candidate)" />
        <ChartCaption>
          Mean adversarial AILD% for URL vs. RAG channels, matched 5-model pool.
          Source: 2a_url_attack_GOLD + 2b_rag_attack_GOLD · 2026-08-16
        </ChartCaption>
        <LineChart
          categories={REGIMES}
          series={[
            { name: "URL channel", data: a3URL, tone: "info" },
            { name: "RAG channel", data: a3RAG, tone: "warning" },
          ]}
          valueSuffix="%" yMax={100} height={240} showValues
        />
        <ChartCaption>
          Y: mean adversarial AILD rate (%). RAG leads at Baseline (17.7% vs. 13.9%);
          URL dominates at Controller-only (88% vs. 72%) and Conservative (90% vs. 77%).
          Crossover at enforcement boundary is the key narrative shape.
        </ChartCaption>
      </Stack>

      <Divider />

      {/* ── A3b ────────────────────────────────────────────────────────── */}
      <Stack gap={8}>
        <SectionLabel fig="A3b — Per-model channel comparison" type="Two line charts" note="Tier 1 · adversarial only · supports per-model paragraphs" />
        <ChartCaption>
          Adversarial AILD% per model across regimes, split by channel. Each line = one
          model. Reveals model-specific channel profiles masked by A3's pooling.
          Source: 2a_url_attack_GOLD + 2b_rag_attack_GOLD · 2026-08-16
        </ChartCaption>
        <Grid columns={2} gap={20}>
          <Stack gap={6}>
            <Text weight="semibold">URL channel</Text>
            <LineChart
              categories={REGIMES}
              series={MODELS_ATK.map((m) => ({ name: m, data: a3bURLByModel[m] }))}
              valueSuffix="%" yMax={100} height={250}
            />
            <ChartCaption>
              Qwen 14B / 7B: sharp binary flip at Controller-only.
              Llama 8B: already at 67% Baseline, saturates to 100% from Prompt-only.
              Mistral 7B: near-zero Baseline, rises from Prompt-only.
              Gemma 12B: lowest ceiling (~55%), never reaches 100%.
            </ChartCaption>
          </Stack>
          <Stack gap={6}>
            <Text weight="semibold">RAG channel</Text>
            <LineChart
              categories={REGIMES}
              series={MODELS_ATK.map((m) => ({ name: m, data: a3bRAGByModel[m] }))}
              valueSuffix="%" yMax={100} height={250}
            />
            <ChartCaption>
              Qwen 14B / 7B: same binary flip as URL. Gemma 12B: elevated Baseline
              (47%) and saturates at Controller-only. Mistral 7B: gradual rise.
              Llama 8B: anomalous — AILD does not escalate with enforcement on RAG
              (15%, 12%, 6.7%, 23.7%); flagged as a harness investigation item.
            </ChartCaption>
          </Stack>
        </Grid>
        <Callout tone="warning" title="Llama 8B RAG anomaly">
          Llama 8B is the only model where adversarial AILD on the RAG channel does not
          escalate with controller enforcement (Baseline 15%, Prompt-only 12%, Controller-only
          6.7%, Conservative 23.7%). Every other model follows the expected monotone increase.
          This pattern is flagged in the plan as a harness discrepancy requiring log inspection
          before drawing a narrative conclusion. Do not include the Llama RAG line in A3b
          without a footnote or until the root cause is resolved.
        </Callout>
      </Stack>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════════ */}
      <H2>Defense</H2>

      {/* ── D1 ─────────────────────────────────────────────────────────── */}
      <Stack gap={8}>
        <SectionLabel fig="D1 — URL defense overview" type="Grouped bar" note="Tier 1 · adversarial · pooled regimes" />
        <ChartCaption>
          Adversarial AILD% per model and defense, pooled across 4 regimes.
          Source: 2a_url_defense_GOLD (10 041 rows) · 2026-08-16
        </ChartCaption>
        <BarChart
          categories={MODELS_DEF}
          series={d1DefLabels.map((d) => ({ name: d, data: d1ByDef[d] }))}
          valueSuffix="%" yMax={100} height={250} showValues
        />
        <ChartCaption>
          d_mtd reaches 0% for Qwen 14B and Qwen 7B. Llama 8B d_mtd residual is 20.9%.
          budget_cap is never better than none and reaches 97.2% for Llama 8B.
        </ChartCaption>
      </Stack>

      <Divider />

      {/* ── D2 ─────────────────────────────────────────────────────────── */}
      <Stack gap={8}>
        <SectionLabel fig="D2 — RAG defense overview" type="Grouped bar" note="Tier 1 · adversarial · pooled regimes · uses NEW Aug 15 data" />
        <ChartCaption>
          Adversarial AILD% per model and defense, pooled across 4 regimes.
          Source: 2b_rag_defense_GOLD (5 072 rows, all 4 models) · 2026-08-16
        </ChartCaption>
        <BarChart
          categories={MODELS_DEF}
          series={d2DefLabels.map((d) => ({ name: d, data: d2ByDef[d] }))}
          valueSuffix="%" yMax={100} height={250} showValues
        />
        <ChartCaption>
          rag_d_mtd wins but never reaches 0% (5.6 to 9.4% across models).
          budget_cap backfire is much larger on RAG — Qwen 14B +18.8 pp vs. +5.8 pp on URL.
        </ChartCaption>
      </Stack>

      <Divider />

      {/* ── D-URL-regime ────────────────────────────────────────────────── */}
      <Stack gap={8}>
        <SectionLabel fig="D-URL-regime — URL defense by regime, per model" type="4× line chart" note="Tier 1 · adversarial · supports per-model paper paragraphs" />
        <ChartCaption>
          For each model: adversarial AILD% across the 4 regimes for each defense arm.
          Shows how defense effectiveness varies with controller enforcement level.
          Source: 2a_url_defense_GOLD · 2026-08-16
        </ChartCaption>
        <Grid columns={2} gap={20}>
          <Card>
            <CardHeader>Llama 8B — URL defense</CardHeader>
            <CardBody>
              <LineChart categories={REGIMES} valueSuffix="%" yMax={100} height={200}
                series={d1DefLabels.map((d) => ({ name: d, data: dUrlRegime["Llama 8B"][d] }))} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Mistral 7B — URL defense</CardHeader>
            <CardBody>
              <LineChart categories={REGIMES} valueSuffix="%" yMax={100} height={200}
                series={d1DefLabels.map((d) => ({ name: d, data: dUrlRegime["Mistral 7B"][d] }))} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Qwen 14B — URL defense</CardHeader>
            <CardBody>
              <LineChart categories={REGIMES} valueSuffix="%" yMax={100} height={200}
                series={d1DefLabels.map((d) => ({ name: d, data: dUrlRegime["Qwen 14B"][d] }))} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Qwen 7B — URL defense</CardHeader>
            <CardBody>
              <LineChart categories={REGIMES} valueSuffix="%" yMax={100} height={200}
                series={d1DefLabels.map((d) => ({ name: d, data: dUrlRegime["Qwen 7B"][d] }))} />
            </CardBody>
          </Card>
        </Grid>
        <ChartCaption>
          Y: adversarial AILD rate (%). X: regime in enforcement order.
          Key pattern: d_mtd and early_abort both collapse AILD sharply from Controller-only
          onward for Qwen models. For Llama 8B, d_mtd has a pronounced Prompt-only residual
          (47%) before dropping to 0% at Controller-only. Mistral 7B has the same d_mtd
          Prompt-only spike (37%) — the paper's main D-MTD exception.
        </ChartCaption>
      </Stack>

      <Divider />

      {/* ── D-RAG-regime ────────────────────────────────────────────────── */}
      <Stack gap={8}>
        <SectionLabel fig="D-RAG-regime — RAG defense by regime, per model" type="4× line chart" note="Tier 1 · adversarial · supports per-model paper paragraphs" />
        <ChartCaption>
          For each model: adversarial AILD% across the 4 regimes for each RAG defense arm.
          Source: 2b_rag_defense_GOLD · 2026-08-16
        </ChartCaption>
        <Grid columns={2} gap={20}>
          <Card>
            <CardHeader>Llama 8B — RAG defense</CardHeader>
            <CardBody>
              <LineChart categories={REGIMES} valueSuffix="%" yMax={100} height={200}
                series={d2DefLabels.map((d) => ({ name: d, data: dRagRegime["Llama 8B"][d] }))} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Mistral 7B — RAG defense</CardHeader>
            <CardBody>
              <LineChart categories={REGIMES} valueSuffix="%" yMax={100} height={200}
                series={d2DefLabels.map((d) => ({ name: d, data: dRagRegime["Mistral 7B"][d] }))} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Qwen 14B — RAG defense</CardHeader>
            <CardBody>
              <LineChart categories={REGIMES} valueSuffix="%" yMax={100} height={200}
                series={d2DefLabels.map((d) => ({ name: d, data: dRagRegime["Qwen 14B"][d] }))} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Qwen 7B — RAG defense</CardHeader>
            <CardBody>
              <LineChart categories={REGIMES} valueSuffix="%" yMax={100} height={200}
                series={d2DefLabels.map((d) => ({ name: d, data: dRagRegime["Qwen 7B"][d] }))} />
            </CardBody>
          </Card>
        </Grid>
        <ChartCaption>
          Y: adversarial AILD rate (%). X: regime in enforcement order.
          rag_d_mtd stays flat and low across regimes for all four models (5–15%),
          unlike the URL-channel d_mtd which has model-specific Prompt-only spikes.
          budget_cap in the RAG channel causes severe backfire at Baseline and Prompt-only
          for models that started near zero (Qwen 14B: 2.5% → 37.5% at Baseline).
        </ChartCaption>
      </Stack>

      <Divider />

      {/* ── Figure budget recommendation ────────────────────────────────── */}
      <Stack gap={10}>
        <H3>Figure budget recommendation</H3>
        <Text>
          <Text as="span" weight="semibold">Core 4 (fills both placeholder slots):</Text>{" "}
          A1, A3, D1, D2. These tell the complete pooled attack and defense stories and
          replace the two existing figure placeholders in the .tex file.
        </Text>
        <Text>
          <Text as="span" weight="semibold">Add for per-model depth (supports per-model paragraphs):</Text>{" "}
          A3b (side-by-side per-model channel lines), D-URL-regime, D-RAG-regime (2x2 grids).
          These three together give the paper the material to write a dedicated
          "model-level analysis" section. A2 (grouped bar per model) is a compact alternative
          to A3b if page space is tight.
        </Text>
        <Text>
          <Text as="span" weight="semibold">Resolve first before including A3b:</Text>{" "}
          The Llama 8B RAG anomaly (AILD does not escalate with enforcement on RAG) needs a
          footnote or a root-cause paragraph. Including the line without explanation would raise
          reviewer questions. Either resolve it, flag it as a limitation, or exclude the Llama
          line from the RAG panel of A3b for now.
        </Text>
        <Text tone="secondary" size="small">
          Tier-2 candidates D3 (budget-cap backfire cells), D4 (Mistral cross-channel d_mtd),
          D5 (pooled summary bar) are catalogued with computed values in GRAPH_PLAN_2026-08-16.md.
        </Text>
      </Stack>

    </Stack>
  );
}
