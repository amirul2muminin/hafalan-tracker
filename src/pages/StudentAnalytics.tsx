"use client";

import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { useAnalytics } from "@/hooks/use-analitics-v2";

type RangeType = "7d" | "30d" | "90d";

const getRange = (type: RangeType) => {
  const end = new Date();
  const start = new Date();

  if (type === "7d") start.setDate(end.getDate() - 6);
  if (type === "30d") start.setDate(end.getDate() - 29);
  if (type === "90d") start.setDate(end.getDate() - 89);

  return { start, end };
};

const format = (n: number) =>
  new Intl.NumberFormat("id-ID").format(Math.round(n));

export default function StudentAnalytics() {
  const { studentId } = useParams<{ studentId: string }>();
  const {
    students,
    hafalanBaruLogs,
    murojaahLogs,
    ujianLogs,
    persiapanUjianLogs,
  } = useAppStore();
  const student = students.find((s) => s.id === studentId);

  const [rangeType, setRangeType] = useState<RangeType>("7d");
  const range = getRange(rangeType);

  const analytics = useAnalytics(studentId || "", range);

  // =========================
  // 📈 CHART DATA
  // =========================
  const chartData = useMemo(() => {
    if (!studentId) return [];

    const dates = generateDateRange(range.start, range.end);

    return dates.map((date) => {
      // hafalan (progress harian)
      const hafalanLogs = hafalanBaruLogs.filter(
        (l) => l.student_id === studentId && groupByDate(l.created_at) === date,
      );

      // hafalan
      const hafalan = hafalanLogs.reduce(
        (sum, l) =>
          sum +
          (toAbsoluteLine(l.to_page, l.to_line) -
            toAbsoluteLine(l.from_page, l.from_line)),
        0,
      );

      // murojaah
      const murojaah = murojaahLogs
        .filter(
          (l) =>
            l.student_id === studentId && groupByDate(l.created_at) === date,
        )
        .reduce((sum, l) => sum + l.total_pages, 0);

      // ujian
      const ujian = ujianLogs.filter(
        (l) => l.student_id === studentId && groupByDate(l.created_at) === date,
      ).length;

      // persiapan ujian
      const persiapan = persiapanUjianLogs.filter(
        (l) => l.student_id === studentId && groupByDate(l.created_at) === date,
      ).length;

      return {
        date: date.slice(5),
        hafalan,
        murojaah,
        ujian,
        persiapan,
      };
    });
  }, [
    studentId,
    range,
    hafalanBaruLogs,
    murojaahLogs,
    ujianLogs,
    persiapanUjianLogs,
  ]);

  if (!student) {
    return <div className="p-4">Murid tidak ditemukan</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title={student.name} subtitle="Analytics" back />

      <div className="p-4 flex flex-col gap-4">
        {/* ========================= */}
        {/* RANGE */}
        {/* ========================= */}
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((r) => (
            <Button
              key={r}
              size="sm"
              variant={rangeType === r ? "secondary" : "ghost"}
              onClick={() => setRangeType(r as RangeType)}
              className="text-xs px-3 rounded-full"
            >
              {r}
            </Button>
          ))}
        </div>

        {/* ========================= */}
        {/* 📈 CHART */}
        {/* ========================= */}
        <div className="bg-card border rounded-2xl p-3">
          <p className="text-xs text-muted-foreground mb-2">Aktivitas Harian</p>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="hafalan"
                stroke="hsl(var(--hafalan))"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="murojaah"
                stroke="hsl(var(--murojaah))"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="ujian"
                stroke="hsl(var(--ujian))"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="persiapan"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ========================= */}
        {/* STAT */}
        {/* ========================= */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Hafalan"
            value={`${format(analytics.hafalan.totalProgress)} baris`}
            subtitle={`${format(analytics.hafalan.avgPerDay)} / hari`}
            compare={analytics.hafalan.compare}
          />

          <StatCard
            title="Murojaah"
            value={`${format(analytics.murojaah.totalPages)} hlm`}
            subtitle={`${format(analytics.murojaah.avgPerDay)} / hari`}
            compare={analytics.murojaah.compare}
          />

          <StatCard
            title="Persiapan Ujian"
            value={`${analytics.persiapanUjian.totalDays} hari`}
          />

          <StatCard title="Ujian" value={`${analytics.ujian.total} kali`} />
        </div>

        {/* ========================= */}
        {/* INSIGHT */}
        {/* ========================= */}
        <div className="bg-card border rounded-2xl p-4 text-sm">
          <p className="text-xs text-muted-foreground mb-1">Insight</p>

          <p>
            {analytics.hafalan.compare > 20
              ? "Performa hafalan sangat baik 🚀"
              : analytics.hafalan.compare < -20
                ? "Perlu peningkatan hafalan ⚠️"
                : "Performa stabil"}
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

const groupByDate = (date: string) => date.split("T")[0];

const generateDateRange = (start: Date, end: Date) => {
  const dates: string[] = [];
  const d = new Date(start);

  while (d <= end) {
    dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }

  return dates;
};

const LINES_PER_PAGE = 15;

const toAbsoluteLine = (page: number, line: number) =>
  (page - 1) * LINES_PER_PAGE + line;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-xl border bg-card p-3 text-xs shadow-sm">
      <p className="font-medium mb-2">{label}</p>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Hafalan</span>
          <span className="font-medium">{data.hafalan} baris</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Murojaah</span>
          <span className="font-medium">{data.murojaah} halaman</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Ujian</span>
          <span className="font-medium">{data.ujian} kali</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Persiapan</span>
          <span className="font-medium">{data.persiapan} sesi</span>
        </div>
      </div>
    </div>
  );
};
