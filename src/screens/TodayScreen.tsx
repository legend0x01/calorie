import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, SafeAreaView, StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Fonts, Palette } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { MealCategory } from '../types';
import { Header } from '../components/Header';
import { DaySelector } from '../components/DaySelector';
import { TodayPlate, MacroBars } from '../components/TodayPlate';
import { MealCard } from '../components/MealCard';
import { WaterTracker } from '../components/WaterTracker';
import { ExerciseTracker } from '../components/ExerciseTracker';
import { QuickAddModal } from '../components/QuickAddModal';
import { AIFoodScannerModal } from '../components/AIFoodScannerModal';
import { CalendarDatePickerModal } from '../components/CalendarDatePickerModal';
import { WeightLogModal } from '../components/WeightLogModal';

interface TodayScreenProps {
  onNavigateToProfile?: () => void;
  onNavigateToAICoach?: () => void;
  onNavigateToHistory?: () => void;
}

const MEALS: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

// The meal someone is most likely logging right now.
const mealForNow = (): MealCategory => {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 22) return 'dinner';
  return 'snacks';
};

export const TodayScreen: React.FC<TodayScreenProps> = ({
  onNavigateToProfile,
  onNavigateToAICoach,
  onNavigateToHistory,
}) => {
  const { dayLog } = useNutri();

  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [category, setCategory] = useState<MealCategory>(mealForNow());
  const [aiScannerVisible, setAiScannerVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [weightVisible, setWeightVisible] = useState(false);

  const openAdd = (cat: MealCategory) => {
    setCategory(cat);
    setQuickAddVisible(true);
  };
  const openAI = (cat: MealCategory) => {
    setCategory(cat);
    setAiScannerVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Header
          onOpenCalendar={() => setCalendarVisible(true)}
          onOpenProfile={onNavigateToProfile}
          onOpenAICoach={onNavigateToAICoach}
        />
        <DaySelector />

        <TodayPlate />
        <MacroBars />

        <TouchableOpacity
          style={styles.aiCard}
          onPress={() => openAI(mealForNow())}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Log a meal by describing it"
        >
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={18} color={Palette.onMango} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>Ate something? Describe it.</Text>
            <Text style={styles.aiBody}>"Two eggs, toast and a coffee" becomes calories and macros.</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Palette.ube} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meals</Text>
          <Text style={styles.sectionMeta}>
            {dayLog.foods.length === 0
              ? 'Nothing logged yet'
              : `${dayLog.foods.length} ${dayLog.foods.length === 1 ? 'item' : 'items'} logged`}
          </Text>
        </View>

        {MEALS.map(m => (
          <MealCard key={m} category={m} onAddPress={openAdd} onAIScanPress={openAI} />
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Body</Text>
        </View>

        <WaterTracker />
        <ExerciseTracker />

        <View style={styles.linkRow}>
          <TouchableOpacity style={styles.linkTile} onPress={() => setWeightVisible(true)} activeOpacity={0.75}>
            <Ionicons name="scale-outline" size={18} color={Palette.avocado} />
            <View style={{ flex: 1 }}>
              <Text style={styles.linkLabel}>Weight</Text>
              <Text style={styles.linkValue}>{dayLog.weightKg ? `${dayLog.weightKg} kg` : 'Log today'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkTile} onPress={onNavigateToHistory} activeOpacity={0.75}>
            <Ionicons name="trending-up" size={18} color={Palette.blueberry} />
            <View style={{ flex: 1 }}>
              <Text style={styles.linkLabel}>Trends</Text>
              <Text style={styles.linkValue}>See your week</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <QuickAddModal
        visible={quickAddVisible}
        category={category}
        onClose={() => setQuickAddVisible(false)}
        onOpenAIScan={cat => {
          setCategory(cat);
          setAiScannerVisible(true);
        }}
      />
      <AIFoodScannerModal
        visible={aiScannerVisible}
        initialCategory={category}
        onClose={() => setAiScannerVisible(false)}
      />
      <CalendarDatePickerModal visible={calendarVisible} onClose={() => setCalendarVisible(false)} />
      <WeightLogModal visible={weightVisible} onClose={() => setWeightVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(197, 155, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 255, 0.28)',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.ube,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 16,
    color: Colors.dark.textPrimary,
  },
  aiBody: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: 24,
    letterSpacing: -0.5,
    color: Colors.dark.textPrimary,
  },
  sectionMeta: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.dark.textMuted,
  },
  linkRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
  },
  linkTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  linkLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  linkValue: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.dark.textPrimary,
  },
});
