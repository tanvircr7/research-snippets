/**
 * Drop-in replacement for Cursor's built-in `cursor/canvas` module.
 *
 * Cursor resolves `cursor/canvas` internally when it renders a canvas
 * component; outside Cursor it does not exist on npm. This file provides the
 * same component surface so the figure catalog runs in a normal Vite app.
 */
import React from "react";
import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart as RLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ── Theme ───────────────────────────────────────────────────────────────────

export type Tone =
  | "default"
  | "neutral"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "danger";

const TONE_COLOR: Record<Tone, string> = {
  default: "#4f46e5",
  neutral: "#94a3b8",
  secondary: "#6b7280",
  info: "#0ea5e9",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

/** Fallback series colors, used when a series has no explicit `tone`. */
const SERIES_PALETTE = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
];

export function useHostTheme() {
  // In Cursor this syncs with the editor theme. Here the CSS variables in
  // index.css already handle light/dark, so this only reports the mode.
  const [dark, setDark] = React.useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return { mode: dark ? ("dark" as const) : ("light" as const) };
}

// ── Layout ──────────────────────────────────────────────────────────────────

type WithChildren = { children?: React.ReactNode; style?: React.CSSProperties };

export function Stack({ gap = 12, children, style }: WithChildren & { gap?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>
      {children}
    </div>
  );
}

export function Row({
  gap = 12,
  align = "center",
  children,
  style,
}: WithChildren & { gap?: number; align?: React.CSSProperties["alignItems"] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: align,
        flexWrap: "wrap",
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Grid({
  columns = 2,
  gap = 16,
  children,
  style,
}: WithChildren & { columns?: number; gap?: number }) {
  return (
    <div
      className="canvas-grid"
      style={
        {
          gap,
          "--canvas-grid-cols": columns,
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

export function Divider() {
  return (
    <hr
      style={{
        border: 0,
        borderTop: "1px solid var(--border)",
        margin: 0,
        width: "100%",
      }}
    />
  );
}

// ── Typography ──────────────────────────────────────────────────────────────

export function H1({ children }: WithChildren) {
  return (
    <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
      {children}
    </h1>
  );
}

export function H2({ children }: WithChildren) {
  return (
    <h2 style={{ fontSize: 22, fontWeight: 650, letterSpacing: "-0.01em", margin: 0 }}>
      {children}
    </h2>
  );
}

export function H3({ children }: WithChildren) {
  return <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{children}</h3>;
}

export function Text({
  children,
  tone,
  size = "medium",
  weight = "normal",
  as = "p",
  style,
}: WithChildren & {
  tone?: Tone;
  size?: "small" | "medium" | "large";
  weight?: "normal" | "medium" | "semibold" | "bold";
  as?: "p" | "span" | "div";
}) {
  const Tag = as as React.ElementType;
  const fontSize = size === "small" ? 13 : size === "large" ? 17 : 15;
  const fontWeight =
    weight === "semibold" ? 600 : weight === "bold" ? 700 : weight === "medium" ? 500 : 400;

  return (
    <Tag
      style={{
        margin: 0,
        fontSize,
        fontWeight,
        lineHeight: 1.6,
        color:
          tone === "secondary" || tone === "neutral"
            ? "var(--fg-secondary)"
            : tone
            ? TONE_COLOR[tone]
            : "var(--fg)",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

// ── Surfaces ────────────────────────────────────────────────────────────────

export function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "14px 16px",
        background: "var(--surface)",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--fg-secondary)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

export function Card({ children }: WithChildren) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
        background: "var(--surface)",
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: WithChildren) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderBottom: "1px solid var(--border)",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

export function CardBody({ children }: WithChildren) {
  return <div style={{ padding: 14 }}>{children}</div>;
}

export function Callout({
  tone = "info",
  title,
  children,
}: WithChildren & { tone?: Tone; title?: string }) {
  const accent = TONE_COLOR[tone];
  return (
    <div
      style={{
        borderLeft: `3px solid ${accent}`,
        background: `color-mix(in srgb, ${accent} 8%, transparent)`,
        borderRadius: "0 8px 8px 0",
        padding: "12px 16px",
      }}
    >
      {title && (
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: accent }}>
          {title}
        </div>
      )}
      <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

// ── Charts ──────────────────────────────────────────────────────────────────

export type Series = { name: string; data: number[]; tone?: Tone };

type ChartProps = {
  categories: string[];
  series: Series[];
  valueSuffix?: string;
  yMax?: number;
  height?: number;
  showValues?: boolean;
};

function toRows(categories: string[], series: Series[]) {
  return categories.map((category, i) => {
    const row: Record<string, string | number> = { category };
    for (const s of series) row[s.name] = s.data[i];
    return row;
  });
}

function colorFor(s: Series, i: number) {
  return s.tone ? TONE_COLOR[s.tone] : SERIES_PALETTE[i % SERIES_PALETTE.length];
}

function axisProps(valueSuffix: string, yMax?: number) {
  return {
    tick: { fill: "var(--fg-secondary)", fontSize: 12 },
    stroke: "var(--border)",
    domain: yMax != null ? [0, yMax] : undefined,
    tickFormatter: (v: number) => `${v}${valueSuffix}`,
  } as const;
}

export function BarChart({
  categories,
  series,
  valueSuffix = "",
  yMax,
  height = 240,
  showValues = false,
}: ChartProps) {
  const data = toRows(categories, series);
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data} margin={{ top: 16, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fill: "var(--fg-secondary)", fontSize: 12 }}
            stroke="var(--border)"
          />
          <YAxis {...axisProps(valueSuffix, yMax)} />
          <Tooltip
            formatter={(v: number) => `${v}${valueSuffix}`}
            contentStyle={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {series.map((s, i) => (
            <Bar key={s.name} dataKey={s.name} fill={colorFor(s, i)} radius={[3, 3, 0, 0]}>
              {showValues && (
                <LabelList
                  dataKey={s.name}
                  position="top"
                  style={{ fill: "var(--fg-secondary)", fontSize: 10 }}
                  formatter={(v: number) => `${v}${valueSuffix}`}
                />
              )}
            </Bar>
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChart({
  categories,
  series,
  valueSuffix = "",
  yMax,
  height = 240,
  showValues = false,
}: ChartProps) {
  const data = toRows(categories, series);
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={data} margin={{ top: 16, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fill: "var(--fg-secondary)", fontSize: 12 }}
            stroke="var(--border)"
          />
          <YAxis {...axisProps(valueSuffix, yMax)} />
          <Tooltip
            formatter={(v: number) => `${v}${valueSuffix}`}
            contentStyle={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {series.map((s, i) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={colorFor(s, i)}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            >
              {showValues && (
                <LabelList
                  dataKey={s.name}
                  position="top"
                  style={{ fill: "var(--fg-secondary)", fontSize: 10 }}
                  formatter={(v: number) => `${v}${valueSuffix}`}
                />
              )}
            </Line>
          ))}
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}
