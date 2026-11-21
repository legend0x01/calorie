import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { Colors, Fonts, MACRO_COLORS, MEAL_COLORS, Palette } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { useEntrance } from '../utils/useEntrance';
import { MealCategory } from '../types';

const MEALS: { key: MealCategory; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snacks', label: 'Snacks' },
];

export const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// Point on a circle, angle in radians measured clockwise from 12 o'clock.
const polar = (c: number, r: number, a: number) => ({ x: c + r * Math.sin(a), y: c - r * Math.cos(a) });

const arcPath = (c: number, r: number, a0: number, a1: number) => {
  const end = Math.min(a1, a0 + Math.PI * 2 - 0.0001);
  const p0 = polar(c, r, a0);
  const p1 = polar(c, r, Math.max(end, a0 + 0.0001));
  const large = end - a0 > Math.PI ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
};

/**
 * Today's plate: each meal fills its own slice of the rim, in proportion to
 * the day's calorie budget (target + calories burned). The centre shows what
 * is left to eat. Over budget, the rim turns chili.
 */
export const TodayPlate: React.FC = () => {
  const { summary, profile, selectedDate } = useNutri();
  const { width } = useWindowDimensions();
  const p = useEntrance(selectedDate, 1100);

  const plate = Math.max(220, Math.min(width - 72, 280));
  const canvas = plate + 56;
  const c = canvas / 2;
  const rimR = plate / 2;
  const ringR = rimR * 0.8;
  const stroke = rimR * 0.14;
  const gap = 0.07; // radians between slices

  const budget = Math.max(1, summary.targetCalories + summary.burnedCalories);
  const consumed = summary.consumedCalories;
  const over = summary.remainingCalories < 0;
  const scale = consumed > budget ? budget / consumed : 1;

  // Build slices, then reveal them in order as the entrance progresses.
  const total = Math.PI * 2;
  let cursor = 0;
  const slices = MEALS.map(m => {
    const kcal = summary.mealBreakdown[m.key]?.calories || 0;
    const sweep = (kcal / budget) * scale * total;
    const slice = { ...m, kcal, start: cursor, sweep };
    cursor += sweep;
    return slice;
  }).filter(s => s.kcal > 0);
  const filled = cursor * p;
  const capAngle = stroke / ringR; // round caps add half a stroke at each end

  const shown = Math.round(Math.abs(summary.remainingCalories) * p);
  const goalLabel =
    profile.goalType === 'lose_weight' ? 'fat loss' : profile.goalType === 'gain_weight' ? 'muscle gain' : 'maintenance';

  return (
    <View style={styles.wrap}>
      <View style={{ width: canvas, height: canvas }}>
        <Svg width={canvas} height={canvas}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={over ? Palette.chili : Palette.mango} stopOpacity={0.2} />
              <Stop offset="70%" stopColor={over ? Palette.chili : Palette.mango} stopOpacity={0.04} />
              <Stop offset="100%" stopColor={Palette.mango} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={c} cy={c} r={c} fill="url(#glow)" />

          {/* The plate: rim, dotted glaze line, and the well */}
          <Circle cx={c} cy={c} r={rimR} fill="#211829" stroke="rgba(255, 228, 200, 0.10)" strokeWidth={1} />
          <Circle
            cx={c}
            cy={c}
            r={rimR - 6}
            fill="none"
            stroke="rgba(255, 228, 200, 0.10)"
            strokeWidth={1.5}
            strokeDasharray="0.5 7"
            strokeLinecap="round"
          />
          <Circle cx={c} cy={c} r={ringR - stroke / 2 - 8} fill="#180F1E" stroke="rgba(0, 0, 0, 0.35)" strokeWidth={2} />

          {/* Track for the slices */}
          <Circle cx={c} cy={c} r={ringR} fill="none" stroke="rgba(255, 228, 200, 0.06)" strokeWidth={stroke} />

          {slices.map(s => {
            if (filled <= s.start) return null;
            const visible = Math.min(s.sweep, filled - s.start);
            const a0 = s.start + gap / 2 + capAngle / 2;
            const a1 = Math.max(a0, s.start + visible - gap / 2 - capAngle / 2);
            return (
              <Path
                key={s.key}
                d={arcPath(c, ringR, a0, a1)}
                stroke={MEAL_COLORS[s.key]}
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
              />
            );
          })}

          {over && (
            <Circle
              cx={c}
              cy={c}
              r={rimR - 1}
              fill="none"
              stroke={Palette.chili}
              strokeWidth={2.5}
              strokeOpacity={0.4 + 0.6 * p}
            />
          )}
        </Svg>

        <View style={styles.center} pointerEvents="none">
          <Text style={[styles.bigNumber, over && { color: Palette.chili }]}>{fmt(shown)}</Text>
          <Text style={styles.bigLabel}>{over ? 'kcal over' : 'kcal left'}</Text>
          <Text style={styles.ofLabel}>
            of {fmt(budget)} · {goalLabel}
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        {MEALS.map(m => {
          const kcal = summary.mealBreakdown[m.key]?.calories || 0;
          return (
            <View key={m.key} style={[styles.legendChip, kcal === 0 && styles.legendChipEmpty]}>
              <View style={[styles.legendDot, { backgroundColor: kcal > 0 ? MEAL_COLORS[m.key] : 'transparent', borderColor: MEAL_COLORS[m.key] }]} />
              <Text style={styles.legendText}>{m.label}</Text>
              <Text style={styles.legendKcal}>{kcal > 0 ? fmt(kcal) : '–'}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <Stat label="Eaten" value={fmt(consumed)} color={Colors.dark.textPrimary} />
        <View style={styles.statDivider} />
        <Stat
          label="Burned"
          value={fmt(summary.burnedCalories)}
          color={summary.burnedCalories > 0 ? Palette.chili : Colors.dark.textPrimary}
        />
        <View style={styles.statDivider} />
        <Stat label="Goal" value={fmt(summary.targetCalories)} color={Colors.dark.textPrimary} />
      </View>
    </View>
  );
};

const Stat = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={styles.stat}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MACROS = [
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'fat', label: 'Fat' },
] as const;

/** Protein, carbs and fat as thick bars with grams left to go. */
export const MacroBars: React.FC = () => {
  const { summary, selectedDate } = useNutri();
  const p = useEntrance(selectedDate, 900);

  const values = {
    protein: [summary.consumedProtein, summary.targetProtein],
    carbs: [summary.consumedCarbs, summary.targetCarbs],
    fat: [summary.consumedFat, summary.targetFat],
  } as const;

  return (
    <View style={styles.macroCard}>
      {MACROS.map(m => {
        const [eaten, target] = values[m.key];
        const pct = Math.min(1, eaten / (target || 1));
        const left = Math.round(target - eaten);
        const color = MACRO_COLORS[m.key].primary;
        return (
          <View key={m.key} style={styles.macroRow}>
            <View style={styles.macroTop}>
              <Text style={styles.macroLabel}>{m.label}</Text>
              <Text style={styles.macroValue}>
                <Text style={{ color }}>{Math.round(eaten)}</Text>
                <Text style={styles.macroTarget}> / {target} g</Text>
              </Text>
            </View>
            <View style={styles.macroTrack}>
              <View style={[styles.macroFill, { width: `${pct * 100 * p}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.macroHint}>
              {left > 0 ? `${left} g to go` : left === 0 ? 'Right on target' : `${-left} g over`}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: {
    fontFamily: Fonts.display,
    fontSize: 58,
    lineHeight: 62,
    letterSpacing: -2,
    color: Colors.dark.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  bigLabel: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: -2,
  },
  ofLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
    paddingHorizontal: 16,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  legendChipEmpty: {
    opacity: 0.6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  legendText: {
    fontFamily: Fonts.semibold,
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  legendKcal: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.dark.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: Colors.dark.cardBorder,
  },
  macroCard: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 14,
    padding: 16,
    gap: 14,
    backgroundColor: Colors.dark.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  macroRow: {
    gap: 6,
  },
  macroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  macroLabel: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.dark.textPrimary,
  },
  macroValue: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  macroTarget: {
    fontFamily: Fonts.medium,
    color: Colors.dark.textMuted,
  },
  macroTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 228, 200, 0.06)',
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: 5,
  },
  macroHint: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
});
