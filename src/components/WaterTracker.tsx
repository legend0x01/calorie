import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';
import { useNutri } from '../context/NutriContext';

export const WaterTracker: React.FC = () => {
  const { summary, addWaterIntake } = useNutri();

  const current = summary.waterIntakeMl;
  const target = summary.targetWaterMl || 3200;
  const pct = Math.min(100, Math.round((current / target) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="water" size={20} color="#06B6D4" />
          </View>
          <View>
            <Text style={styles.title}>Hydration Tracker</Text>
            <Text style={styles.subtitle}>
              {pct >= 100 ? 'Hydration Target Reached! 💧' : `${Math.max(0, target - current)}ml remaining today`}
            </Text>
          </View>
        </View>

        <View style={styles.counterRight}>
          <Text style={styles.currentAmount}>{current}</Text>
          <Text style={styles.targetAmount}> / {target} ml</Text>
        </View>
      </View>

      {/* Water Fill Bar */}
      <View style={styles.waterBarBg}>
        <View style={[styles.waterBarFill, { width: `${pct}%` }]} />
      </View>

      {/* Quick Add Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => addWaterIntake(250)}
          activeOpacity={0.7}
        >
          <Ionicons name="water-outline" size={14} color="#06B6D4" />
          <Text style={styles.quickBtnText}>+250 ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => addWaterIntake(500)}
          activeOpacity={0.7}
        >
          <Ionicons name="water-outline" size={14} color="#06B6D4" />
          <Text style={styles.quickBtnText}>+500 ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => addWaterIntake(750)}
          activeOpacity={0.7}
        >
          <Ionicons name="water-outline" size={14} color="#06B6D4" />
          <Text style={styles.quickBtnText}>+750 ml</Text>
        </TouchableOpacity>

        {current > 0 && (
          <TouchableOpacity
            style={styles.minusBtn}
            onPress={() => addWaterIntake(-250)}
            activeOpacity={0.7}
          >
            <Ionicons name="remove-circle-outline" size={18} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#111827',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  counterRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#06B6D4',
  },
  targetAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  waterBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    marginVertical: 12,
    overflow: 'hidden',
  },
  waterBarFill: {
    height: '100%',
    backgroundColor: '#06B6D4',
    borderRadius: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 12,
    paddingVertical: 8,
    gap: 4,
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#06B6D4',
  },
  minusBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
