import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Fonts, Palette } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { formatFriendlyDate, getTodayISO } from '../utils/dateUtils';

interface HeaderProps {
  onOpenCalendar?: () => void;
  onOpenProfile?: () => void;
  onOpenAICoach?: () => void;
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const Header: React.FC<HeaderProps> = ({ onOpenCalendar, onOpenProfile }) => {
  const { streak, selectedDate, setSelectedDate, profile, nvidiaApiKey } = useNutri();
  const isToday = selectedDate === getTodayISO();
  const rawFirst = (profile.name || '').trim().split(/\s+/)[0];
  const firstName = /^(guest|athlete)$/i.test(rawFirst) ? '' : rawFirst;
  const initial = firstName ? firstName[0].toUpperCase() : '';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.eyebrow}>
          {isToday ? `${greeting()}${firstName ? `, ${firstName}` : ''}` : formatFriendlyDate(selectedDate)}
        </Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{isToday ? 'Today' : 'Looking back'}</Text>
          {!isToday && (
            <TouchableOpacity
              style={styles.backToday}
              onPress={() => setSelectedDate(getTodayISO())}
              accessibilityRole="button"
              accessibilityLabel="Go back to today"
            >
              <Ionicons name="arrow-undo" size={12} color={Palette.onMango} />
              <Text style={styles.backTodayText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <View
          style={[styles.streak, streak === 0 && styles.streakCold]}
          accessible
          accessibilityLabel={`${streak} day logging streak`}
        >
          <Ionicons name="flame" size={15} color={streak > 0 ? Palette.mango : Colors.dark.textMuted} />
          <Text style={[styles.streakText, streak === 0 && { color: Colors.dark.textMuted }]}>{streak}</Text>
        </View>

        {onOpenCalendar && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenCalendar}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Pick a date"
          >
            <Ionicons name="calendar-clear-outline" size={18} color={Colors.dark.textPrimary} />
          </TouchableOpacity>
        )}

        {onOpenProfile && (
          <TouchableOpacity
            style={styles.avatar}
            onPress={onOpenProfile}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Your goals and profile"
          >
            {initial ? (
              <Text style={styles.avatarText}>{initial}</Text>
            ) : (
              <Ionicons name="person" size={16} color={Palette.onMango} />
            )}
            {nvidiaApiKey && <View style={styles.aiDot} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 18,
    paddingBottom: 6,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  eyebrow: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
    color: Colors.dark.textPrimary,
  },
  backToday: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.mango,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  backTodayText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Palette.onMango,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 181, 71, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 181, 71, 0.28)',
  },
  streakCold: {
    backgroundColor: Colors.dark.card,
    borderColor: Colors.dark.cardBorder,
  },
  streakText: {
    fontFamily: Fonts.displayBold,
    fontSize: 15,
    color: Palette.mango,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.mango,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.display,
    fontSize: 17,
    color: Palette.onMango,
  },
  aiDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Palette.ube,
    borderWidth: 2,
    borderColor: Colors.dark.bg,
  },
});
