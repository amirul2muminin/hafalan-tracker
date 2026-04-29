import { useMemo } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { Database } from "@/integrations/supabase/types";

type HafalanBaruLog = Database["public"]["Tables"]["hafalan_baru_logs"]["Row"];
type ExamResult = Database["public"]["Enums"]["exam_result"];
type ExamType = Database["public"]["Enums"]["exam_type"];

interface Range {
  start: Date;
  end: Date;
}

// =========================
// CONSTANTS
// =========================

const LINES_PER_PAGE = 15;

const IDEAL_DAYS: Record<string, number> = {
  quarter_juz: 2,
  half_juz: 4,
  one_juz: 7,
  five_juz: 14,
};

const EXAM_RESULTS: { value: ExamResult; label: string }[] = [
  { value: "mumtaz", label: "Mumtaz" },
  { value: "jayyid_jiddan_plus", label: "Jayyid Jiddan +" },
  { value: "jayyid_jiddan", label: "Jayyid Jiddan" },
  { value: "jayyid_plus", label: "Jayyid +" },
  { value: "jayyid", label: "Jayyid" },
  { value: "maqbul", label: "Maqbul" },
  { value: "rosib", label: "Rosib" },
];

const EXAM_TYPES: { value: ExamType; label: string }[] = [
  { value: "quarter_juz", label: "¼" },
  { value: "half_juz", label: "½" },
  { value: "one_juz", label: "1 Juz" },
  { value: "five_juz", label: "5 Juz" },
];

// =========================
// HELPERS
// =========================

const isInRange = (date: string, { start, end }: Range) => {
  const d = new Date(date);
  return d >= start && d <= end;
};

const getDaysDiff = ({ start, end }: Range) =>
  Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

const getPreviousRange = ({ start, end }: Range): Range => {
  const diff = end.getTime() - start.getTime();
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  return { start: new Date(prevEnd.getTime() - diff), end: prevEnd };
};

const calcCompare = (current: number, prev: number) => {
  if (prev === 0) return current > 0 ? 100 : 0;
  return ((current - prev) / prev) * 100;
};

const filterByStudentAndRange = <
  T extends { student_id: string; created_at: string },
>(
  logs: T[],
  studentId: string,
  range: Range,
) =>
  logs.filter(
    (l) => l.student_id === studentId && isInRange(l.created_at, range),
  );

const getUniqueDays = (logs: { created_at: string }[]) =>
  new Set(logs.map((l) => l.created_at.split("T")[0])).size;

const toAbsoluteLine = (page: number, line: number) =>
  (page - 1) * LINES_PER_PAGE + line;

const getProgressFromLogs = (logs: HafalanBaruLog[]) => {
  if (logs.length === 0) return 0;

  const sorted = [...logs].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  return Math.max(
    0,
    toAbsoluteLine(last.to_page, last.to_line) -
      toAbsoluteLine(first.from_page, first.from_line),
  );
};

const formatExamType = (type: string) =>
  EXAM_TYPES.find((t) => t.value === type)?.label ?? type;

const toDistribution = <T extends string>(
  items: { value: T; label: string }[],
  logs: { result?: string; exam_type?: string }[],
  key: "result" | "exam_type",
) => {
  const counts = Object.fromEntries(items.map((i) => [i.value, 0])) as Record<
    T,
    number
  >;
  logs.forEach((l) => {
    const v = l[key] as T;
    if (v in counts) counts[v]++;
  });
  return items.map(({ value, label }) => ({
    name: label,
    value: counts[value],
    key: value,
  }));
};

// =========================
// MAIN HOOK
// =========================

export const useAnalytics = (studentId: string, range: Range) => {
  const { hafalanBaruLogs, murojaahLogs, ujianLogs, persiapanUjianLogs } =
    useAppStore();

  return useMemo(() => {
    const days = getDaysDiff(range);
    const prevRange = getPreviousRange(range);

    // --- Hafalan ---
    const currentHafalan = filterByStudentAndRange(
      hafalanBaruLogs,
      studentId,
      range,
    );
    const prevHafalan = filterByStudentAndRange(
      hafalanBaruLogs,
      studentId,
      prevRange,
    );
    const totalProgress = getProgressFromLogs(currentHafalan);
    const prevProgress = getProgressFromLogs(prevHafalan);

    // --- Murojaah ---
    const currentMurojaah = filterByStudentAndRange(
      murojaahLogs,
      studentId,
      range,
    );
    const prevMurojaah = filterByStudentAndRange(
      murojaahLogs,
      studentId,
      prevRange,
    );
    const totalPages = currentMurojaah.reduce(
      (sum, l) => sum + l.total_pages,
      0,
    );
    const prevPages = prevMurojaah.reduce((sum, l) => sum + l.total_pages, 0);

    // --- Ujian ---
    const currentUjian = filterByStudentAndRange(ujianLogs, studentId, range);
    const prevUjian = filterByStudentAndRange(ujianLogs, studentId, prevRange);

    // --- Persiapan Ujian ---
    const currentPersiapan = filterByStudentAndRange(
      persiapanUjianLogs,
      studentId,
      range,
    );
    const prevPersiapan = filterByStudentAndRange(
      persiapanUjianLogs,
      studentId,
      prevRange,
    );
    const persiapanDays = getUniqueDays(currentPersiapan);
    const prevPersiapanDays = getUniqueDays(prevPersiapan);

    // --- Exam Efficiency (berbasis grouping persiapan dalam range) ---
    // Group by (juz_id, exam_type, juz_part), hitung unique days per group
    const persiapanGroups = new Map<
      string,
      { juz_id: number; exam_type: string; juz_part: number; days: Set<string> }
    >();

    currentPersiapan.forEach((l) => {
      const key = `${l.juz_id}-${l.exam_type}-${l.juz_part}`;
      if (!persiapanGroups.has(key)) {
        persiapanGroups.set(key, {
          juz_id: l.juz_id,
          exam_type: l.exam_type,
          juz_part: l.juz_part,
          days: new Set(),
        });
      }
      persiapanGroups.get(key)!.days.add(l.created_at.split("T")[0]);
    });

    const efficiencyData = Array.from(persiapanGroups.values()).map((g) => {
      const prepDays = g.days.size;
      const ideal = IDEAL_DAYS[g.exam_type] ?? 7;
      const partLabel =
        g.exam_type === "one_juz" || g.exam_type === "five_juz"
          ? ""
          : `ke-${g.juz_part}`;
      return {
        label: `${formatExamType(g.exam_type)} ${partLabel} (${g.juz_id})`,
        days: prepDays,
        ideal,
        efficiency: prepDays === 0 ? 0 : ideal / prepDays,
      };
    });

    // =========================
    // RESULT
    // =========================
    return {
      hafalan: {
        totalProgress,
        avgPerDay: totalProgress / days,
        compare: calcCompare(totalProgress, prevProgress),
      },
      murojaah: {
        totalPages,
        avgPerDay: totalPages / days,
        compare: calcCompare(totalPages, prevPages),
      },
      ujian: {
        total: currentUjian.length,
        compare: calcCompare(currentUjian.length, prevUjian.length),
        distribution: toDistribution(EXAM_RESULTS, currentUjian, "result"),
        typeDistribution: toDistribution(EXAM_TYPES, currentUjian, "exam_type"),
      },
      persiapanUjian: {
        totalDays: persiapanDays,
        compare: calcCompare(persiapanDays, prevPersiapanDays),
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
