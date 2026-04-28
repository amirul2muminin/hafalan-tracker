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
} from "recharts";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
  { month: "July", desktop: 214 },
  { month: "August", desktop: 214 },
  { month: "September", desktop: 214 },
  { month: "October", desktop: 214 },
  { month: "November", desktop: 214 },
  { month: "December", desktop: 214 },
];

// 🔥 config utama
const BAR_SIZE = 28;
const GAP = 12;
const chartHeight = chartData.length * (BAR_SIZE + GAP);

export default function EfficientcyChart() {
  return (
    <div className="w-full rounded-2xl border bg-white shadow-sm">
      {/* HEADER */}
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold">Efficiency Chart</h2>
        <p className="text-sm text-gray-500">January - December 2024</p>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="max-h-[400px] overflow-y-auto">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ right: 16, left: 8, bottom: 16 }}
            >
              <CartesianGrid horizontal={false} />

              <YAxis type="category" dataKey="month" hide />

              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              <Tooltip />

              <Bar
                dataKey="desktop"
                fill="#3b82f6"
                radius={6}
                barSize={BAR_SIZE} // 🔥 fixed height
              >
                <LabelList
                  dataKey="month"
                  position="insideLeft"
                  offset={10}
                  fill="#fff"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t text-sm text-gray-500">
        Showing total performance data
      </div>
    </div>
  );
}
