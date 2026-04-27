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

type ExamType = "quarter_juz" | "half_juz" | "one_juz" | "five_juz";

const examTypes: { value: ExamType; label: string }[] = [
  { value: "quarter_juz", label: "¼ Juz" },
  { value: "half_juz", label: "½ Juz" },
  { value: "one_juz", label: "1 Juz" },
  { value: "five_juz", label: "5 Juz" },
];

const PASSING: Record<string, number> = {
  mumtaz: 7,
  jayyid_jiddan_plus: 6,
  jayyid_jiddan: 5,
  jayyid_plus: 4,
  jayyid: 3,
  maqbul: 2,
  rosib: 1,
};

const isPass = (result: string) => {
  return PASSING[result] >= PASSING["maqbul"];
};

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

    // =========================
    // 📊 DISTRIBUSI TIPE UJIAN
    // =========================
    const typeMap: Record<ExamType, number> = {
      quarter_juz: 0,
      half_juz: 0,
      one_juz: 0,
      five_juz: 0,
    };

    currentUjianLogs.forEach((l) => {
      const t = l.exam_type as ExamType;
      if (typeMap[t] !== undefined) {
        typeMap[t]++;
      }
    });

    const examTypeDistribution = examTypes.map((t) => ({
      name: t.label,
      value: typeMap[t.value],
      key: t.value,
    }));

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
    // 🔁 BUILD EXAM CYCLES
    // =========================

    const sortedUjian = [...ujianLogs]
      .filter((l) => l.student_id === studentId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    const sortedPersiapan = [...persiapanUjianLogs]
      .filter((l) => l.student_id === studentId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    let pIndex = 0;
    let currentPersiapan: typeof sortedPersiapan = [];

    const cycles: {
      type: string;
      juz: number;
      attempt: number;
      days: number;
      ideal: number;
      efficiency: number;
    }[] = [];

    let attemptCounter: Record<string, number> = {};

    for (let i = 0; i < sortedUjian.length; i++) {
      const exam = sortedUjian[i];
      const examDate = new Date(exam.created_at);

      // kumpulkan persiapan sebelum ujian ini
      while (
        pIndex < sortedPersiapan.length &&
        new Date(sortedPersiapan[pIndex].created_at) <= examDate
      ) {
        currentPersiapan.push(sortedPersiapan[pIndex]);
        pIndex++;
      }

      const pass = isPass(exam.result);

      // increment attempt per type+juz
      const key = `${exam.exam_type}-${exam.juz_id}`;
      if (!attemptCounter[key]) attemptCounter[key] = 1;

      if (pass) {
        const days = getUniqueDays(currentPersiapan);

        const IDEAL_DAYS: Record<string, number> = {
          quarter_juz: 2,
          half_juz: 4,
          one_juz: 7,
          five_juz: 14,
        };

        const ideal = IDEAL_DAYS[exam.exam_type] || 7;

        cycles.push({
          type: exam.exam_type,
          juz: exam.juz_id,
          attempt: attemptCounter[key],
          days,
          ideal,
          efficiency: days === 0 ? 0 : ideal / days,
        });

        // reset untuk cycle berikutnya
        currentPersiapan = [];
        attemptCounter[key] += 1;
      }
    }

    const formatType = (type: string) => {
      if (type === "quarter_juz") return "¼ Juz";
      if (type === "half_juz") return "½ Juz";
      if (type === "one_juz") return "1 Juz";
      if (type === "five_juz") return "5 Juz";
      return type;
    };

    const efficiencyData = cycles.map((c) => ({
      label: `${formatType(c.type)} ke-${c.attempt} (Juz ${c.juz})`,
      days: c.days,
      efficiency: c.efficiency,
      ideal: c.ideal, // ✅ WAJIB
    }));
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
        typeDistribution: examTypeDistribution,
      },
      persiapanUjian: {
        totalDays: persiapanDays,
        compare: persiapanCompare,
      },
      efficiency: {
        perExam: efficiencyData,
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
