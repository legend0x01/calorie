import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Fonts, Palette } from '../constants/theme';
import { useNutri } from '../context/NutriContext';

const GLASS_ML = 250;

/**
 * Water as a row of glasses. Tap an empty glass to fill up to it; tap the
 * last full glass to empty it. Each glass is 250 ml.
 */
export const WaterTracker: React.FC = () => {
  const { summary, addWaterIntake } = useNutri();

  const current = summary.waterIntakeMl;
  const target = summary.targetWaterMl || 3200;
  const glasses = Math.min(16, Math.max(4, Math.round(target / GLASS_ML)));
  const done = current >= target;

  const tapGlass = (i: number) => {
    const full = (i + 1) * GLASS_ML;
    const next = current >= full ? i * GLASS_ML : full;
    addWaterIntake(next - current);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Water</Text>
          <Text style={styles.subtitle}>
            {done ? 'You hit your water goal today.' : `${((target - current) / 1000).toFixed(2).replace(/0$/, '')} L to go · tap a glass`}
          </Text>
        </View>
        <Text style={styles.amount}>
          {(current / 1000).toFixed(2).replace(/0$/, '')}
          <Text style={styles.amountUnit}> / {(target / 1000).toFixed(1)} L</Text>
        </Text>
      </View>

      <View style={styles.glasses}>
        {Array.from({ length: glasses }).map((_, i) => {
          const level = Math.max(0, Math.min(1, (current - i * GLASS_ML) / GLASS_ML));
          return (
            <TouchableOpacity
              key={i}
              onPress={() => tapGlass(i)}
              activeOpacity={0.7}
              style={styles.glassHit}
              accessibilityRole="button"
              accessibilityLabel={`Glass ${i + 1}, ${level >= 1 ? 'full' : level > 0 ? 'partly full' : 'empty'}`}
            >
              <View style={[styles.glass, level >= 1 && styles.glassFull]}>
                <View style={[styles.water, { height: `${level * 100}%` }]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => addWaterIntake(500)} activeOpacity={0.7}>
          <Ionicons name="water" size={13} color={Palette.coconut} />
          <Text style={styles.quickText}>Bottle +500 ml</Text>
        </TouchableOpacity>
        {current > 0 && (
          <TouchableOpacity
            style={styles.undoBtn}
            onPress={() => addWaterIntake(-Math.min(GLASS_ML, current))}
            activeOpacity={0.7}
            accessibilityLabel="Remove 250 ml"
          >
            <Ionicons name="remove" size={16} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
    padding: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 18,
    color: Colors.dark.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 1,
  },
  amount: {
    fontFamily: Fonts.display,
    fontSize: 22,
    color: Palette.coconut,
    fontVariant: ['tabular-nums'],
  },
  amountUnit: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  glasses: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 14,
  },
  glassHit: {
    flex: 1,
    maxWidth: 30,
    paddingVertical: 4,
  },
  glass: {
    width: '100%',
    height: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(111, 211, 242, 0.35)',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  glassFull: {
    borderColor: Palette.coconut,
  },
  water: {
    width: '100%',
    backgroundColor: Palette.coconut,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(111, 211, 242, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(111, 211, 242, 0.22)',
  },
  quickText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Palette.coconut,
  },
  undoBtn: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: Colors.dark.cardElevated,
  },
});
