"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ExamStatCardProps {
  data: { name: string; value: number }[];
}

const COLORS = [
  "#22c55e", // Mumtaz
  "#4ade80",
  "#86efac",
  "#facc15",
  "#fbbf24",
  "#fb923c",
  "#ef4444", // Rosib
];

export function ExamStatCard({ data }: ExamStatCardProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-card border rounded-2xl p-3">
      <p className="text-xs text-muted-foreground mb-2">Hasil Ujian</p>

      <div className="flex flex-col items-center gap-3">
        {/* Donut */}
        <div className="w-24 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={28}
                outerRadius={40}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend compact */}
        <div className="flex flex-col gap-1 text-xs">
          {data.map((d, i) =>
            d.value > 0 ? (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: COLORS[i] }}
                />
                <span className="truncate">
                  {d.name} ({d.value})
                </span>
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* Total */}
      <p className="text-[11px] text-muted-foreground mt-2">
        Total {total} ujian
      </p>
    </div>
  );
}
