import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { formatFriendlyDate, getTodayISO } from '../utils/dateUtils';

interface HeaderProps {
  onOpenCalendar?: () => void;
  onOpenProfile?: () => void;
  onOpenAICoach?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCalendar,
  onOpenProfile,
  onOpenAICoach,
}) => {
  const { streak, selectedDate, setSelectedDate, profile, nvidiaApiKey } = useNutri();
  const isToday = selectedDate === getTodayISO();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="flash" size={18} color="#10B981" />
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>NutriPulse</Text>
            {nvidiaApiKey && (
              <View style={styles.nvidiaPill}>
                <Ionicons name="hardware-chip" size={10} color="#76B900" />
                <Text style={styles.nvidiaPillText}>AI ACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            {formatFriendlyDate(selectedDate)}
            {!isToday && (
              <Text
                style={styles.jumpToday}
                onPress={() => setSelectedDate(getTodayISO())}
              >
                {'  '}• Today
              </Text>
            )}
          </Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Streak pill */}
        <View style={styles.streakPill}>
          <Ionicons name="flame" size={15} color="#F59E0B" />
          <Text style={styles.streakText}>{streak}d</Text>
        </View>

        {/* AI Quick Button */}
        {onOpenAICoach && (
          <TouchableOpacity
            style={styles.aiButton}
            onPress={onOpenAICoach}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Calendar Picker Button */}
        {onOpenCalendar && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenCalendar}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.dark.textPrimary} />
          </TouchableOpacity>
        )}

        {/* Profile Avatar Button */}
        {onOpenProfile && (
          <TouchableOpacity
            style={[
              styles.avatarButton,
              {
                borderColor:
                  profile.goalType === 'gain_weight'
                    ? '#38BDF8'
                    : profile.goalType === 'lose_weight'
                    ? '#F87171'
                    : '#A78BFA',
              },
            ]}
            onPress={onOpenProfile}
            activeOpacity={0.8}
          >
            <Ionicons name="person" size={16} color="#F8FAFC" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 10,
    backgroundColor: Colors.dark.bg,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.dark.textPrimary,
    letterSpacing: -0.5,
  },
  nvidiaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 185, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(118, 185, 0, 0.3)',
  },
  nvidiaPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#76B900',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginTop: 1,
  },
  jumpToday: {
    color: '#10B981',
    fontWeight: '800',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 4,
  },
  streakText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '800',
  },
  aiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
