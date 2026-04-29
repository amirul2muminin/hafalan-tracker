import { useMemo } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { Database } from '@/integrations/supabase/types';
type Student = Database['public']['Tables']['students']['Row'];

interface StagnantStudent {
  student: Student;
  yesterdayPosition: { juz: number; page: number; line: number } | null;
  todayPosition: { juz: number; page: number; line: number } | null;
}

interface TopProgressStudent {
  student: Student;
  progress: number;
}

export function useHomePage() {
  const students = useAppStore((s) => s.students);
  const hafalanBaruLogs = useAppStore((s) => s.hafalanBaruLogs);
  const murojaahLogs = useAppStore((s) => s.murojaahLogs);

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const todayHafalanLogs = useMemo(
    () => hafalanBaruLogs.filter((l) => l.created_at.startsWith(today)),
    [hafalanBaruLogs, today],
  );
  const yesterdayHafalanLogs = useMemo(
    () => hafalanBaruLogs.filter((l) => l.created_at.startsWith(yesterday)),
    [hafalanBaruLogs, yesterday],
  );
  const todayMurojaahLogs = useMemo(
    () => murojaahLogs.filter((l) => l.created_at.startsWith(today)),
    [murojaahLogs, today],
  );
  const yesterdayMurojaahLogs = useMemo(
    () => murojaahLogs.filter((l) => l.created_at.startsWith(yesterday)),
    [murojaahLogs, yesterday],
  );

  // Students who didn't add hafalan today
  const belumHafalan = useMemo(() => {
    const studentsWithHafalanToday = new Set(
      todayHafalanLogs.map((l) => l.student_id),
    );
    return students.filter((s) => !studentsWithHafalanToday.has(s.id));
  }, [students, todayHafalanLogs]);

  // Students who didn't add murojaah today
  const belumMurojaah = useMemo(() => {
    const studentsWithMurojaahToday = new Set(
      todayMurojaahLogs.map((l) => l.student_id),
    );
    return students.filter((s) => !studentsWithMurojaahToday.has(s.id));
  }, [students, todayMurojaahLogs]);

  // Helper: convert position to absolute line
  const positionToAbsoluteLine = (pos: {
    juz: number;
    page: number;
    line: number;
  }) => {
    const LINES_PER_PAGE = 15; // adjust kalau beda
    const PAGES_PER_JUZ = 20; // rata-rata Qur'an Madinah

    return (
      pos.juz * PAGES_PER_JUZ * LINES_PER_PAGE +
      pos.page * LINES_PER_PAGE +
      pos.line
    );
  };

  // Helper: get last hafalan position (highest to_page:to_line)
  const getLastPosition = (
    logs: typeof hafalanBaruLogs,
  ): { juz: number; page: number; line: number } | null => {
    if (logs.length === 0) return null;
    let best: (typeof logs)[0] | null = null;
    for (const log of logs) {
      if (!best) {
        best = log;
        continue;
      }
      if (log.juz_id > best.juz_id) {
        best = log;
        continue;
      }
      if (log.juz_id === best.juz_id && log.to_page > best.to_page) {
        best = log;
        continue;
      }
      if (
        log.juz_id === best.juz_id &&
        log.to_page === best.to_page &&
        log.to_line > best.to_line
      ) {
        best = log;
      }
    }
    return best
      ? { juz: best.juz_id, page: best.to_page, line: best.to_line }
      : null;
  };

  const topHafalan = useMemo(() => {
    const result: TopProgressStudent[] = [];

    for (const student of students) {
      const yesterdayLogs = yesterdayHafalanLogs.filter(
        (l) => l.student_id === student.id,
      );
      const todayLogs = todayHafalanLogs.filter(
        (l) => l.student_id === student.id,
      );

      if (todayLogs.length === 0) continue;

      const yesterdayPos = getLastPosition(yesterdayLogs);
      const todayPos = getLastPosition(todayLogs);

      let progress = 0;

      if (yesterdayPos && todayPos) {
        progress =
          positionToAbsoluteLine(todayPos) -
          positionToAbsoluteLine(yesterdayPos);
      } else {
        progress = todayLogs.reduce((sum, l) => sum + (l.total_lines ?? 0), 0);
      }

      if (progress > 0) {
        result.push({ student, progress });
      }
    }

    return result.sort((a, b) => b.progress - a.progress).slice(0, 3);
  }, [students, yesterdayHafalanLogs, todayHafalanLogs]);

  // Top Murojaah: progress based on total_pages increased from yesterday
  const topMurojaah = useMemo(() => {
    const result: TopProgressStudent[] = [];

    for (const student of students) {
      const yesterdayLogs = yesterdayMurojaahLogs.filter(
        (l) => l.student_id === student.id,
      );
      const todayLogs = todayMurojaahLogs.filter(
        (l) => l.student_id === student.id,
      );

      if (todayLogs.length === 0) continue;

      const yesterdayPages = yesterdayLogs.reduce(
        (sum, l) => sum + (l.total_pages ?? 0),
        0,
      );
      const todayPages = todayLogs.reduce(
        (sum, l) => sum + (l.total_pages ?? 0),
        0,
      );
      const progress = todayPages - yesterdayPages;

      if (progress > 0) {
        result.push({ student, progress });
      }
    }

    return result.sort((a, b) => b.progress - a.progress).slice(0, 3);
  }, [students, yesterdayMurojaahLogs, todayMurojaahLogs]);

  // Stagnant Murojaah: students who had murojaah yesterday but no progress today
  const stagnantMurojaah = useMemo(() => {
    const result: TopProgressStudent[] = [];

    for (const student of students) {
      const yesterdayLogs = yesterdayMurojaahLogs.filter(
        (l) => l.student_id === student.id,
      );
      const todayLogs = todayMurojaahLogs.filter(
        (l) => l.student_id === student.id,
      );

      // Harus ada murojaah kemarin
      if (yesterdayLogs.length === 0) continue;

      // ❗ FIX: kalau hari ini belum murojaah → jangan dianggap stagnant
      if (todayLogs.length === 0) continue;

      const yesterdayPages = yesterdayLogs.reduce(
        (sum, l) => sum + (l.total_pages ?? 0),
        0,
      );
      const todayPages = todayLogs.reduce(
        (sum, l) => sum + (l.total_pages ?? 0),
        0,
      );

      // stagnant jika tidak ada peningkatan
      if (todayPages <= yesterdayPages) {
        result.push({ student, progress: todayPages });
      }
    }

    return result;
  }, [students, yesterdayMurojaahLogs, todayMurojaahLogs]);

  // Stagnant: students who had hafalan yesterday but position didn't advance today
  const stagnant = useMemo((): StagnantStudent[] => {
    const result: StagnantStudent[] = [];

    for (const student of students) {
      const studentYesterdayLogs = yesterdayHafalanLogs.filter(
        (l) => l.student_id === student.id,
      );
      const studentTodayLogs = todayHafalanLogs.filter(
        (l) => l.student_id === student.id,
      );

      // Harus ada hafalan kemarin
      if (studentYesterdayLogs.length === 0) continue;

      // ❗ FIX: kalau hari ini belum setor sama sekali → jangan dianggap stagnant
      if (studentTodayLogs.length === 0) continue;

      const yesterdayPos = getLastPosition(studentYesterdayLogs);
      const todayPos = getLastPosition(studentTodayLogs);

      let isStagnant = false;

      if (yesterdayPos && todayPos) {
        // Compare posisi (tidak maju / mundur)
        if (
          todayPos.juz < yesterdayPos.juz ||
          (todayPos.juz === yesterdayPos.juz &&
            todayPos.page < yesterdayPos.page) ||
          (todayPos.juz === yesterdayPos.juz &&
            todayPos.page === yesterdayPos.page &&
            todayPos.line <= yesterdayPos.line)
        ) {
          isStagnant = true;
        }
      }

      if (isStagnant) {
        result.push({
          student,
          yesterdayPosition: yesterdayPos,
          todayPosition: todayPos,
        });
      }
    }

    return result;
  }, [students, yesterdayHafalanLogs, todayHafalanLogs]);

  return {
    belumHafalan,
    belumMurojaah,
    topHafalan,
    topMurojaah,
    stagnant,
    stagnantMurojaah,
    todayHafalanCount: todayHafalanLogs.length,
    todayMurojaahCount: todayMurojaahLogs.length,
  };
}
