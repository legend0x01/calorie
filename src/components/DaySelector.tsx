import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Fonts, Palette } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { formatDayNumber, formatDayOfWeek, getDaysAround, getTodayISO } from '../utils/dateUtils';

const DAY_W = 46;
const DAY_GAP = 8;

export const DaySelector: React.FC = () => {
  const { selectedDate, setSelectedDate, allDayLogs, profile } = useNutri();
  const scrollRef = useRef<ScrollView>(null);
  const [stripWidth, setStripWidth] = useState(0);
  const today = getTodayISO();
  const days = getDaysAround(selectedDate, 15);

  // Keep the selected day in the middle of the strip.
  useEffect(() => {
    if (!stripWidth) return;
    const idx = days.indexOf(selectedDate);
    const x = 16 + idx * (DAY_W + DAY_GAP) - stripWidth / 2 + DAY_W / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, x), animated: false });
  }, [selectedDate, stripWidth]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
      onLayout={e => setStripWidth(e.nativeEvent.layout.width)}
      style={styles.scroller}
    >
      {days.map(dateStr => {
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === today;
        const isFuture = dateStr > today;
        const log = allDayLogs[dateStr];
        const logged = !!log && log.foods.length > 0;

        // Dot: avocado = within 15% of target, chili = over, mango = under.
        let dot = 'transparent';
        if (logged) {
          const kcal = log.foods.reduce((sum, f) => sum + f.calories * f.servings, 0);
          const diff = Math.abs(kcal - profile.targetCalories);
          dot = diff < profile.targetCalories * 0.15 ? Palette.avocado : kcal > profile.targetCalories ? Palette.chili : Palette.mango;
        }

        return (
          <TouchableOpacity
            key={dateStr}
            style={[styles.day, isToday && !isSelected && styles.dayToday, isSelected && styles.daySelected]}
            onPress={() => setSelectedDate(dateStr)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${formatDayOfWeek(dateStr)} ${formatDayNumber(dateStr)}${logged ? ', logged' : ''}`}
          >
            <Text style={[styles.weekday, isSelected && styles.textSelected, isFuture && styles.future]}>
              {formatDayOfWeek(dateStr).slice(0, 3)}
            </Text>
            <Text style={[styles.dayNum, isSelected && styles.textSelected, isFuture && styles.future]}>
              {formatDayNumber(dateStr)}
            </Text>
            <View style={[styles.dot, { backgroundColor: isSelected && logged ? Palette.onMango : dot }]} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroller: {
    flexGrow: 0,
  },
  strip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: DAY_GAP,
  },
  day: {
    width: DAY_W,
    height: 66,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 181, 71, 0.5)',
  },
  daySelected: {
    backgroundColor: Palette.mango,
    shadowColor: Palette.mango,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  weekday: {
    fontFamily: Fonts.semibold,
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  dayNum: {
    fontFamily: Fonts.displayBold,
    fontSize: 18,
    color: Colors.dark.textPrimary,
  },
  textSelected: {
    color: Palette.onMango,
  },
  future: {
    opacity: 0.45,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
});
