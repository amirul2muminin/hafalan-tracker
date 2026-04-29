"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ExamData = {
  label: string;
  days: number;
  efficiency: number;
  ideal: number;
};

interface Props {
  perExam: ExamData[];
  title?: string;
  description?: string;
}

// 🔥 config utama
const BAR_SIZE = 50;
const GAP = 16;

const getColor = (eff: number) => {
  if (eff >= 1) return "#22c55e";
  if (eff >= 0.75) return "#eab308";
  return "#ef4444";
};

export default function EfficiencyChartCard({
  perExam,
  title = "Efisiensi Persiapan Ujian",
  description,
}: Props) {
  const chartHeight = perExam.length * (BAR_SIZE + GAP);

  return (
    <div className="w-full rounded-2xl border bg-white shadow-sm">
      {/* HEADER */}
      <div className="p-4 border-b">
        <h2 className="text-xs text-muted-foreground">{title}</h2>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="max-h-[400px] overflow-y-auto">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={perExam}
              layout="vertical"
              margin={{ right: 16, left: 8, bottom: 16 }}
            >
              <CartesianGrid horizontal={false} />

              {/* hide karena kita pakai label di dalam bar */}
              <YAxis type="category" dataKey="label" hide />

              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              <Tooltip formatter={(value: number) => `${value} days`} />

              <Bar dataKey="days" barSize={BAR_SIZE} radius={6}>
                {/* 🔥 dynamic color */}
                {perExam.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColor(entry.efficiency)}
                  />
                ))}

                {/* 🔥 label: label + days */}
                <LabelList
                  content={({ x, y, width, height, value, index }) => {
                    const item = perExam[index!];
                    return (
                      <text
                        x={(x as number) + 10}
                        y={(y as number) + (height as number) / 2}
                        fill="#fff"
                        fontSize={12}
                        dominantBaseline="middle"
                      >
                        {item.label}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {perExam.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* bulatan warna */}
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getColor(item.efficiency) }}
              />

              {/* label + days */}
              <span className="text-gray-700">
                {item.label} • {item.days} hari
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
