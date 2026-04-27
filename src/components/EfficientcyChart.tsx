"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  data: {
    label: string;
    days: number;
    efficiency: number;
    ideal: number;
  }[];
}

const getColor = (d: { days: number; ideal: number }) => {
  if (d.days <= d.ideal) return "hsl(var(--success))"; // ✅ lebih cepat dari target
  if (d.days <= d.ideal * 1.5) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
};

export function EfficiencyChart({ data }: Props) {
  if (!data.length) {
    return (
      <Card>
        <CardContent className="p-4 text-xs text-muted-foreground">
          Belum ada data
        </CardContent>
      </Card>
    );
  }

  // 🔥 sort: terbaik di atas
  const sorted = [...data].sort((a, b) => a.days - b.days);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Efisiensi Persiapan Ujian</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-64 w-full px-2 pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ left: 10, right: 10 }}
            >
              <XAxis type="number" hide />

              <YAxis
                dataKey="label"
                type="category"
                width={120}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />

              {/* 🔥 Target line (IDEAL) */}
              <ReferenceLine
                x={sorted[0]?.ideal}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
              />

              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const d = payload[0].payload;

                  return (
                    <div className="rounded-xl border bg-card p-3 text-xs shadow-sm">
                      <p className="font-medium mb-1">{d.label}</p>
                      <p>Durasi: {d.days} hari</p>
                      <p>Target: {d.ideal} hari</p>
                      <p>
                        Efisiensi:{" "}
                        <span className="font-medium">
                          {d.efficiency.toFixed(2)}x
                        </span>
                      </p>
                    </div>
                  );
                }}
              />

              <Bar dataKey="days" radius={[8, 8, 8, 8]} barSize={14}>
                {sorted.map((entry, i) => (
                  <Cell key={i} fill={getColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🔥 Legend Meaningful */}
        <div className="flex justify-center gap-4 text-[10px] pb-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
            <span>Lebih cepat</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))]" />
            <span>Sesuai</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--destructive))]" />
            <span>Terlambat</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
