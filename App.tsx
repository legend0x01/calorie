import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
  Figtree_900Black,
} from '@expo-google-fonts/figtree';
import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { NutriProvider, useNutri } from './src/context/NutriContext';
import { TodayScreen } from './src/screens/TodayScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AICoachScreen } from './src/screens/AICoachScreen';
import { GoalsProfileScreen } from './src/screens/GoalsProfileScreen';
import { OnboardingModal } from './src/screens/OnboardingModal';
import { NvidiaApiKeyModal } from './src/components/NvidiaApiKeyModal';
import { AuthModal } from './src/screens/AuthModal';
import { Colors, Fonts, Palette } from './src/constants/theme';

type TabName = 'today' | 'history' | 'ai_coach' | 'goals';

const TABS: { key: TabName; label: string; icon: string; activeIcon: string }[] = [
  { key: 'today', label: 'Today', icon: 'restaurant-outline', activeIcon: 'restaurant' },
  { key: 'history', label: 'History', icon: 'bar-chart-outline', activeIcon: 'bar-chart' },
  { key: 'ai_coach', label: 'Coach', icon: 'sparkles-outline', activeIcon: 'sparkles' },
  { key: 'goals', label: 'Plan', icon: 'flag-outline', activeIcon: 'flag' },
];

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabName>('today');
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const { isApiKeyModalOpen, closeApiKeyModal, isAuthModalOpen, closeAuthModal } = useNutri();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.column}>
        {activeTab === 'today' && (
          <TodayScreen
            onNavigateToProfile={() => setActiveTab('goals')}
            onNavigateToAICoach={() => setActiveTab('ai_coach')}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}
        {activeTab === 'history' && <HistoryScreen onNavigateToToday={() => setActiveTab('today')} />}
        {activeTab === 'ai_coach' && <AICoachScreen />}
        {activeTab === 'goals' && <GoalsProfileScreen />}
      </View>

      {/* Floating tab dock */}
      <View style={styles.dockWrap} pointerEvents="box-none">
        <View style={styles.dock} accessibilityRole="tablist">
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            const isCoach = tab.key === 'ai_coach';
            const tint = active ? (isCoach ? Palette.ube : Palette.mango) : Colors.dark.textMuted;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && (isCoach ? styles.tabActiveCoach : styles.tabActive)]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.75}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={tab.label}
              >
                <Ionicons name={(active ? tab.activeIcon : tab.icon) as any} size={20} color={tint} />
                <Text style={[styles.tabLabel, { color: tint }, active && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <NvidiaApiKeyModal visible={isApiKeyModalOpen} onClose={closeApiKeyModal} />
      <AuthModal visible={isAuthModalOpen} onClose={closeAuthModal} />
      <OnboardingModal visible={onboardingVisible} onClose={() => setOnboardingVisible(false)} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
    Figtree_900Black,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <NutriProvider>
      <MainApp />
    </NutriProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  // On wide screens the app reads as a centred column instead of stretching.
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  dockWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 24 : 14,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dock: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 440,
    padding: 6,
    gap: 4,
    borderRadius: 30,
    backgroundColor: 'rgba(31, 23, 38, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255, 228, 200, 0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
    borderRadius: 24,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 181, 71, 0.13)',
  },
  tabActiveCoach: {
    backgroundColor: 'rgba(197, 155, 255, 0.14)',
  },
  tabLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 11,
  },
  tabLabelActive: {
    fontFamily: Fonts.extrabold,
  },
});
