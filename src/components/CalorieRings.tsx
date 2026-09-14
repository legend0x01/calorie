import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, MACRO_COLORS } from '../constants/theme';
import { useNutri } from '../context/NutriContext';

const { width } = Dimensions.get('window');

export const CalorieRings: React.FC = () => {
  const { summary, profile } = useNutri();

  const caloriePct = Math.min(100, Math.round((summary.consumedCalories / (summary.targetCalories || 1)) * 100));
  const proteinPct = Math.min(100, Math.round((summary.consumedProtein / (summary.targetProtein || 1)) * 100));
  const carbsPct = Math.min(100, Math.round((summary.consumedCarbs / (summary.targetCarbs || 1)) * 100));
  const fatPct = Math.min(100, Math.round((summary.consumedFat / (summary.targetFat || 1)) * 100));

  const isOver = summary.remainingCalories < 0;

  return (
    <View style={styles.cardContainer}>
      {/* Top Row: Goal Status & Net Calories */}
      <View style={styles.topRow}>
        <View style={styles.goalTag}>
          <Ionicons
            name={
              profile.goalType === 'gain_weight'
                ? 'barbell'
                : profile.goalType === 'lose_weight'
                ? 'flame'
                : 'shield-checkmark'
            }
            size={13}
            color={
              profile.goalType === 'gain_weight'
                ? '#38BDF8'
                : profile.goalType === 'lose_weight'
                ? '#F87171'
                : '#A78BFA'
            }
          />
          <Text style={styles.goalTagText}>
            {profile.goalType === 'lose_weight'
              ? `FAT LOSS • Target ${profile.targetCalories} kcal`
              : profile.goalType === 'gain_weight'
              ? `MUSCLE GAIN • Target ${profile.targetCalories} kcal`
              : `MAINTENANCE • Target ${profile.targetCalories} kcal`}
          </Text>
        </View>

        <View style={styles.netPill}>
          <Text style={styles.netKcalLabel}>Net:</Text>
          <Text style={styles.netKcalValue}>{summary.netCalories} kcal</Text>
        </View>
      </View>

      {/* Hero Remaining Calorie Display */}
      <View style={styles.heroSection}>
        <Text style={styles.calorieNumber}>
          {Math.abs(summary.remainingCalories)}
        </Text>
        <Text style={[styles.calorieLabel, isOver && styles.calorieLabelOver]}>
          {isOver ? 'KCAL OVER TARGET' : 'KCAL REMAINING TODAY'}
        </Text>

        {/* Main Progress Bar */}
        <View style={styles.mainProgressBarBg}>
          <View
            style={[
              styles.mainProgressBarFill,
              {
                width: `${Math.min(100, caloriePct)}%`,
                backgroundColor: isOver ? '#EF4444' : '#10B981',
              },
            ]}
          />
        </View>
      </View>

      {/* Equation Breakdown Row */}
      <View style={styles.equationRow}>
        <View style={styles.equationItem}>
          <Text style={styles.equationValue}>{summary.targetCalories}</Text>
          <Text style={styles.equationLabel}>Budget</Text>
        </View>
        <Text style={styles.equationOperator}>-</Text>
        <View style={styles.equationItem}>
          <Text style={[styles.equationValue, { color: '#F8FAFC' }]}>{summary.consumedCalories}</Text>
          <Text style={styles.equationLabel}>Food</Text>
        </View>
        <Text style={styles.equationOperator}>+</Text>
        <View style={styles.equationItem}>
          <Text style={[styles.equationValue, { color: '#EF4444' }]}>{summary.burnedCalories}</Text>
          <Text style={styles.equationLabel}>Burned</Text>
        </View>
        <Text style={styles.equationOperator}>=</Text>
        <View style={styles.equationItem}>
          <Text style={[styles.equationValue, { color: isOver ? '#EF4444' : '#10B981' }]}>
            {summary.remainingCalories}
          </Text>
          <Text style={styles.equationLabel}>Left</Text>
        </View>
      </View>

      {/* 3 Macro Cards Grid */}
      <View style={styles.macrosContainer}>
        {/* Protein */}
        <View style={[styles.macroCard, { borderColor: 'rgba(99, 102, 241, 0.25)' }]}>
          <View style={styles.macroHeader}>
            <View style={[styles.macroDot, { backgroundColor: MACRO_COLORS.protein.primary }]} />
            <Text style={styles.macroTitle}>Protein</Text>
            <View style={[styles.macroBadge, { backgroundColor: 'rgba(99, 102, 241, 0.18)' }]}>
              <Text style={[styles.macroPct, { color: MACRO_COLORS.protein.primary }]}>{proteinPct}%</Text>
            </View>
          </View>
          <Text style={styles.macroGrams}>
            <Text style={styles.macroGramsConsumed}>{summary.consumedProtein}</Text>
            <Text style={styles.macroGramsTarget}> / {summary.targetProtein}g</Text>
          </Text>
          <View style={styles.macroBarBg}>
            <View
              style={[
                styles.macroBarFill,
                { width: `${proteinPct}%`, backgroundColor: MACRO_COLORS.protein.primary },
              ]}
            />
          </View>
        </View>

        {/* Carbs */}
        <View style={[styles.macroCard, { borderColor: 'rgba(245, 158, 11, 0.25)' }]}>
          <View style={styles.macroHeader}>
            <View style={[styles.macroDot, { backgroundColor: MACRO_COLORS.carbs.primary }]} />
            <Text style={styles.macroTitle}>Carbs</Text>
            <View style={[styles.macroBadge, { backgroundColor: 'rgba(245, 158, 11, 0.18)' }]}>
              <Text style={[styles.macroPct, { color: MACRO_COLORS.carbs.primary }]}>{carbsPct}%</Text>
            </View>
          </View>
          <Text style={styles.macroGrams}>
            <Text style={styles.macroGramsConsumed}>{summary.consumedCarbs}</Text>
            <Text style={styles.macroGramsTarget}> / {summary.targetCarbs}g</Text>
          </Text>
          <View style={styles.macroBarBg}>
            <View
              style={[
                styles.macroBarFill,
                { width: `${carbsPct}%`, backgroundColor: MACRO_COLORS.carbs.primary },
              ]}
            />
          </View>
        </View>

        {/* Fat */}
        <View style={[styles.macroCard, { borderColor: 'rgba(236, 72, 153, 0.25)' }]}>
          <View style={styles.macroHeader}>
            <View style={[styles.macroDot, { backgroundColor: MACRO_COLORS.fat.primary }]} />
            <Text style={styles.macroTitle}>Fat</Text>
            <View style={[styles.macroBadge, { backgroundColor: 'rgba(236, 72, 153, 0.18)' }]}>
              <Text style={[styles.macroPct, { color: MACRO_COLORS.fat.primary }]}>{fatPct}%</Text>
            </View>
          </View>
          <Text style={styles.macroGrams}>
            <Text style={styles.macroGramsConsumed}>{summary.consumedFat}</Text>
            <Text style={styles.macroGramsTarget}> / {summary.targetFat}g</Text>
          </Text>
          <View style={styles.macroBarBg}>
            <View
              style={[
                styles.macroBarFill,
                { width: `${fatPct}%`, backgroundColor: MACRO_COLORS.fat.primary },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
    padding: 18,
    backgroundColor: '#111827',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  goalTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.dark.textSecondary,
    letterSpacing: 0.3,
  },
  netPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardElevated,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  netKcalLabel: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontWeight: '600',
  },
  netKcalValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  calorieNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.8,
    lineHeight: 56,
  },
  calorieLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1.2,
    marginTop: 2,
    marginBottom: 12,
  },
  calorieLabelOver: {
    color: '#EF4444',
  },
  mainProgressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  mainProgressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  equationItem: {
    alignItems: 'center',
  },
  equationValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.dark.textSecondary,
  },
  equationLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  equationOperator: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  macrosContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    flex: 1,
    marginLeft: 4,
  },
  macroBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  macroPct: {
    fontSize: 10,
    fontWeight: '800',
  },
  macroGrams: {
    fontSize: 12,
    marginBottom: 6,
  },
  macroGramsConsumed: {
    fontWeight: '900',
    color: Colors.dark.textPrimary,
  },
  macroGramsTarget: {
    fontWeight: '600',
    color: Colors.dark.textMuted,
    fontSize: 10,
  },
  macroBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
