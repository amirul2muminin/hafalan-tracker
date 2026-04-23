# 📊 Qur'an Memorization Analytics & Metrics Documentation (Structured)

---

# 🎯 PURPOSE

This document defines a **structured metric system** across 3 levels:

- 👤 Student (individual performance)
- 👨‍🏫 Class (wali kelas)
- 🏫 School (admin / kepala sekolah)

All metrics are grouped into **3 core categories**:

- Hafalan Baru
- Murojaah
- Persiapan Ujian

---

# 🧠 CORE PRINCIPLES

- Use **line (baris)** as source of truth
- Metrics must support:
  - Growth
  - Consistency
  - Efficiency

- Data must be:
  - comparable over time
  - aggregatable (weekly, monthly, semester, yearly)
  - persistent (lifetime tracking)

---

# 📏 BASE UNITS

```text
1 halaman = 15 baris
1 juz ≈ 20 halaman (use mapping)
```

---

# 👤 1. STUDENT METRICS (PER CATEGORY)

---

## 📈 A. HAFALAN BARU

### Growth Metrics

```text
total_lines
lines_per_day
lines_per_week
lines_per_month
lines_per_semester
lines_per_year
```

---

### Growth Comparison

```text
current_week vs last_week
current_month vs last_month
```

---

### Trend

```text
4–8 period trend → up | down | stable
```

---

### Speed Metric

```text
time_per_1/4_juz
```

---

### Consistency

```text
active_days_per_week
streak_days
consistency_score
```

---

### Achievement

```text
best_week_lines
longest_streak
```

---

### Alerts

```text
- growth turun 2x berturut-turut
- active_days < 3
- tidak setor > 3 hari
```

---

## 🔄 B. MUROJAAH

### Volume

```text
avg_murojaah_pages
murojaah_pages_per_week
```

---

### Cycle Discipline

```text
completed_cycles / total_cycles
```

---

### Consistency

```text
murojaah_active_days
```

---

### Quality Indicator

```text
apakah mencapai 20 halaman secara konsisten
```

---

### Alerts

```text
- jarang murojaah
- sering reset sebelum 20 halaman
```

---

## ⚡ C. PERSIAPAN UJIAN

### Duration

```text
prep_days
avg_prep_days
min_prep_days
max_prep_days
```

---

### Efficiency

```text
efficiency = total_lines_exam / prep_days
```

---

### Trend

```text
prep_trend → improving | stable | declining
```

---

### Stagnation

```text
stagnation_days = prep_days
```

---

### Benchmark

```text
2–3 hari  : excellent
3–5 hari  : normal
6–7 hari  : slow
>7 hari   : critical
```

---

### Alerts

```text
- prep > 5 hari
- prep meningkat terus
- prep lama + gagal ujian
```

---

# ⚖️ D. BALANCE (CROSS CATEGORY)

```text
hafalan_lines / murojaah_lines
```

Interpretation:

- balanced → healthy
- hafalan tinggi, murojaah rendah → risk lupa
- murojaah tinggi, hafalan rendah → stagnan

---

# 🎯 E. TARGET (INDIVIDUAL)

### Automatic Target

```text
1/4 juz (5 halaman)
```

---

### Manual Target

```text
semester / yearly target
```

---

### Metrics

```text
progress %
status: completed | on-track | late
deviation
```

---

# 👨‍🏫 2. CLASS METRICS (WALI KELAS)

---

## 📊 A. Student Comparison

Ranking:

```text
- hafalan (lines/week)
- consistency
- prep efficiency
```

---

## 📈 B. Distribution

```text
top 20% | middle 60% | bottom 20%
```

---

## ⚖️ C. Gap Analysis

```text
selisih top vs bottom student
```

---

## 📉 D. Class Trend

```text
average lines_per_week
average prep_days
```

---

## 🚨 E. Alert Group

Students with:

```text
- declining performance
- low consistency
- slow preparation
```

---

## 🔄 F. Category Summary

### Hafalan

```text
avg_lines_per_week
```

### Murojaah

```text
avg_murojaah_pages
```

### Preparation

```text
avg_prep_days
```

---

# 🏫 3. SCHOOL METRICS (ADMIN)

---

## 🏆 A. Class Comparison

```text
- avg growth per class
- avg prep efficiency per class
- avg consistency per class
```

---

## 📊 B. System Distribution

```text
fast | normal | slow | critical (prep)
high | medium | low (growth)
```

---

## 📉 C. System Health

```text
% active students
% declining students
% stagnant students
```

---

## 🎯 D. Global Target Achievement

```text
% students mencapai target
```

---

## 📈 E. Cross-Class Trend

```text
class A vs class B vs class C
```

---

## 🔍 F. Drill Down Navigation

Admin can:

```text
→ lihat statistik per kelas (seperti wali kelas)
→ lihat statistik per individu
```

---

# 📊 4. TIME AGGREGATION

All metrics must support:

```text
daily
weekly
monthly
semester
yearly
```

---

## Comparison

```text
current_period vs previous_period
```

---

# ⚠️ 5. GLOBAL EARLY WARNING SYSTEM

Trigger if:

```text
- growth turun 2 periode
- active_days < 3
- tidak setor > 3 hari
- target < 70%
- prep > 5 hari
- prep makin lama
```

---

# 🧠 6. STRATEGIC INSIGHTS

## Consistency > Quantity

Progress kecil tapi rutin lebih baik.

---

## Efficiency > Volume

Banyak hafalan tapi lama persiapan = kualitas rendah.

---

## Balance is Critical

Hafalan & murojaah harus seimbang.

---

## Early Decline Detection

```text
trend turun perlahan
```

---

# 🚀 FINAL STRUCTURE

## Student Detail

- Hafalan Baru
- Murojaah
- Persiapan Ujian

---

## Wali Kelas

- Statistik seluruh murid
- Perbandingan & ranking
- Alert list

---

## Admin / Kepala Sekolah

- Statistik seluruh kelas
- Perbandingan antar kelas
- Drill down:
  - → per kelas
  - → per murid

---

END OF DOCUMENT
