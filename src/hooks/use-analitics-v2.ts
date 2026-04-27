import { useMemo } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { HafalanBaruLog } from "@/types";

interface Range {
  start: Date;
  end: Date;
}

// =========================
// 🔥 HELPERS
// =========================

const LINES_PER_PAGE = 15;

const isInRange = (date: string, start: Date, end: Date) => {
  const d = new Date(date);
  return d >= start && d <= end;
};

const getDaysDiff = (start: Date, end: Date) => {
  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
};

const toAbsoluteLine = (page: number, line: number) => {
  return (page - 1) * LINES_PER_PAGE + line;
};

const getProgressFromLogs = (logs: HafalanBaruLog[]) => {
  if (logs.length === 0) return 0;

  const sorted = [...logs].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );

  if (sorted.length === 1) {
    const l = sorted[0];
    return Math.max(
      0,
      toAbsoluteLine(l.to_page, l.to_line) -
        toAbsoluteLine(l.from_page, l.from_line),
    );
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  return Math.max(
    0,
    toAbsoluteLine(last.to_page, last.to_line) -
      toAbsoluteLine(first.from_page, first.from_line),
  );
};

// 🔥 NEW
const getPreviousRange = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevStart = new Date(prevEnd.getTime() - diff);

  return { start: prevStart, end: prevEnd };
};

type ExamResult =
  | "mumtaz"
  | "jayyid_jiddan_plus"
  | "jayyid_jiddan"
  | "jayyid_plus"
  | "jayyid"
  | "maqbul"
  | "rosib";

const examResults: { value: ExamResult; label: string }[] = [
  { value: "mumtaz", label: "Mumtaz" },
  { value: "jayyid_jiddan_plus", label: "Jayyid Jiddan +" },
  { value: "jayyid_jiddan", label: "Jayyid Jiddan" },
  { value: "jayyid_plus", label: "Jayyid +" },
  { value: "jayyid", label: "Jayyid" },
  { value: "maqbul", label: "Maqbul" },
  { value: "rosib", label: "Rosib" },
];

// =========================
// 🚀 MAIN HOOK
// =========================

export const useAnalytics = (studentId: string, range: Range) => {
  const { hafalanBaruLogs, murojaahLogs, ujianLogs, persiapanUjianLogs } =
    useAppStore();

  return useMemo(() => {
    const days = getDaysDiff(range.start, range.end);
    const prevRange = getPreviousRange(range.start, range.end);

    // =========================
    // 🔥 HAFALAN (CURRENT)
    // =========================
    const currentLogs = hafalanBaruLogs.filter(
      (l) =>
        l.student_id === studentId &&
        isInRange(l.created_at, range.start, range.end),
    );

    const totalProgress = getProgressFromLogs(currentLogs);
    const avgPerDay = totalProgress / days;

    // =========================
    // 🔥 HAFALAN (PREVIOUS)
    // =========================
    const prevLogs = hafalanBaruLogs.filter(
      (l) =>
        l.student_id === studentId &&
        isInRange(l.created_at, prevRange.start, prevRange.end),
    );

    const prevProgress = getProgressFromLogs(prevLogs);

    const hafalanCompare =
      prevProgress === 0
        ? totalProgress > 0
          ? 100
          : 0
        : ((totalProgress - prevProgress) / prevProgress) * 100;

    // =========================
    // 🔥 MUROJAAH
    // =========================
    const currentMurojaah = murojaahLogs.filter(
      (l) =>
        l.student_id === studentId &&
        isInRange(l.created_at, range.start, range.end),
    );

    const totalPages = currentMurojaah.reduce(
      (sum, l) => sum + l.total_pages,
      0,
    );

    const avgPagesPerDay = totalPages / days;

    const prevMurojaah = murojaahLogs.filter(
      (l) =>
        l.student_id === studentId &&
        isInRange(l.created_at, prevRange.start, prevRange.end),
    );

    const prevPages = prevMurojaah.reduce((sum, l) => sum + l.total_pages, 0);

    const murojaahCompare =
      prevPages === 0
        ? totalPages > 0
          ? 100
          : 0
        : ((totalPages - prevPages) / prevPages) * 100;

    // =========================
    // 🧪 UJIAN
    // =========================
    const currentUjianLogs = ujianLogs.filter(
      (l) =>
        l.student_id === studentId &&
        isInRange(l.created_at, range.start, range.end),
    );

    const ujianCount = currentUjianLogs.length;

    // =========================
    // 🥧 DISTRIBUSI NILAI UJIAN (PIE)
    // =========================
    const resultMap: Record<ExamResult, number> = {
      mumtaz: 0,
      jayyid_jiddan_plus: 0,
      jayyid_jiddan: 0,
      jayyid_plus: 0,
      jayyid: 0,
      maqbul: 0,
      rosib: 0,
    };

    currentUjianLogs.forEach((l) => {
      const r = l.result as ExamResult;
      if (resultMap[r] !== undefined) {
        resultMap[r]++;
      }
    });

    const examDistribution = examResults.map((r) => ({
      name: r.label,
      value: resultMap[r.value],
      key: r.value,
    }));

    const prevUjianLogs = ujianLogs.filter(
      (l) =>
        l.student_id === studentId &&
        isInRange(l.created_at, prevRange.start, prevRange.end),
    );

    const prevUjianCount = prevUjianLogs.length;

    const ujianCompare =
      prevUjianCount === 0
        ? ujianCount > 0
          ? 100
          : 0
        : ((ujianCount - prevUjianCount) / prevUjianCount) * 100;

    // =========================
    // 🧠 PERSIAPAN UJIAN (UNIQUE DAY 🔥)
    // =========================
    const getUniqueDays = (logs: { created_at: string }[]) => {
      return new Set(logs.map((l) => l.created_at.split("T")[0])).size;
    };

    const currentPersiapanLogs = persiapanUjianLogs.filter(
      (l) =>
        l.student_id === studentId &&
        isInRange(l.created_at, range.start, range.end),
    );

    const persiapanDays = getUniqueDays(currentPersiapanLogs);

    const prevPersiapanLogs = persiapanUjianLogs.filter(
      (l) =>
        l.student_id === studentId &&
        isInRange(l.created_at, prevRange.start, prevRange.end),
    );

    const prevPersiapanDays = getUniqueDays(prevPersiapanLogs);

    const persiapanCompare =
      prevPersiapanDays === 0
        ? persiapanDays > 0
          ? 100
          : 0
        : ((persiapanDays - prevPersiapanDays) / prevPersiapanDays) * 100;

    // =========================
    // 🎯 FINAL
    // =========================
    return {
      hafalan: {
        totalProgress,
        avgPerDay,
        compare: hafalanCompare,
      },
      murojaah: {
        totalPages,
        avgPerDay: avgPagesPerDay,
        compare: murojaahCompare,
      },
      ujian: {
        total: ujianCount,
        compare: ujianCompare,
        distribution: examDistribution,
      },
      persiapanUjian: {
        totalDays: persiapanDays,
        compare: persiapanCompare,
      },
    };
  }, [
    studentId,
    range,
    hafalanBaruLogs,
    murojaahLogs,
    ujianLogs,
    persiapanUjianLogs,
  ]);
};
