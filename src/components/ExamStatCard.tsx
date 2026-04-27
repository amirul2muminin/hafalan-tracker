"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ExamStatCardProps {
  resultData: { name: string; value: number }[];
  typeData: { name: string; value: number }[];
}

const COLORS = [
  "#22c55e",
  "#4ade80",
  "#86efac",
  "#facc15",
  "#fbbf24",
  "#fb923c",
  "#ef4444",
];

export function ExamStatCard({ resultData, typeData }: ExamStatCardProps) {
  const [mode, setMode] = useState<"type" | "result">("type");

  const rawData = mode === "type" ? typeData : resultData;
  const data = rawData.filter((d) => d.value > 0);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="bg-card border rounded-2xl p-3 text-xs text-muted-foreground">
        Belum ada ujian
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-2xl p-3">
      {/* HEADER + TOGGLE */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">Ujian</p>

        <div className="flex gap-1 bg-muted p-1 rounded-full">
          <button
            onClick={() => setMode("type")}
            className={`px-2 py-0.5 text-[10px] rounded-full ${
              mode === "type" ? "bg-background" : "opacity-60"
            }`}
          >
            Tipe
          </button>
          <button
            onClick={() => setMode("result")}
            className={`px-2 py-0.5 text-[10px] rounded-full ${
              mode === "result" ? "bg-background" : "opacity-60"
            }`}
          >
            Nilai
          </button>
        </div>
      </div>

      {/* PIE */}
      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND */}
      <div className="text-xs">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span>
              {d.name} ({d.value})
            </span>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <p className="text-[11px] text-muted-foreground mt-2 text-center">
        Total {total} ujian
      </p>
    </div>
  );
}
