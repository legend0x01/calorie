import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
  Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, MACRO_COLORS } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { ActivityLevel, DietType, GoalType } from '../types';
import { ACTIVITY_LABELS, GOAL_LABELS } from '../utils/bmrCalculator';
import { NVIDIA_BUILD_URL } from '../components/NvidiaApiKeyModal';

export const GoalsProfileScreen: React.FC = () => {
  const {
    profile,
    updateProfile,
    resetAllData,
    seedDemoHistory,
    nvidiaApiKey,
    openApiKeyModal,
    currentUser,
    isLoggedIn,
    logout,
    openAuthModal,
  } = useNutri();

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(String(profile.age));
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(profile.gender);
  const [heightCm, setHeightCm] = useState(String(profile.heightCm));
  const [currentWeight, setCurrentWeight] = useState(String(profile.currentWeightKg));
  const [targetWeight, setTargetWeight] = useState(String(profile.targetWeightKg));
  const [goalType, setGoalType] = useState<GoalType>(profile.goalType);
  const [goalRate, setGoalRate] = useState<number>(profile.goalRateKgPerWeek || 0.5);
  const [activity, setActivity] = useState<ActivityLevel>(profile.activityLevel);
  const [dietType, setDietType] = useState<DietType>(profile.dietType);
  const [apiKey, setApiKey] = useState(nvidiaApiKey || profile.apiKey || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleOpenNvidiaWebsite = async () => {
    try {
      await Linking.openURL(NVIDIA_BUILD_URL);
    } catch (e) {
      Alert.alert('Link Error', 'Could not open build.nvidia.com in browser.');
    }
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      name: name.trim() || 'User',
      age: Number(age) || 25,
      gender,
      heightCm: Number(heightCm) || 175,
      currentWeightKg: parseFloat(currentWeight) || 75,
      targetWeightKg: parseFloat(targetWeight) || 70,
      goalType,
      goalRateKgPerWeek: goalRate,
      activityLevel: activity,
      dietType,
      apiKey: apiKey.trim() || undefined,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Goals & Profile</Text>
        <Text style={styles.subtitle}>Account backup, body metrics & calorie targets</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Account / Cloud Sync Card */}
        <View style={styles.accountCard}>
          <View style={styles.accountHeader}>
            {currentUser?.photoUrl ? (
              <Image source={{ uri: currentUser.photoUrl }} style={styles.userAvatarImage} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
            )}

            <View style={{ flex: 1 }}>
              <View style={styles.userNameRow}>
                <Text style={styles.accountName}>
                  {currentUser?.displayName || profile.name || 'Athlete User'}
                </Text>
                <View style={[styles.statusBadge, isLoggedIn ? styles.statusBadgeOnline : styles.statusBadgeGuest]}>
                  <Ionicons
                    name={isLoggedIn ? 'cloud-done' : 'cloud-offline'}
                    size={11}
                    color={isLoggedIn ? '#10B981' : '#F59E0B'}
                  />
                  <Text style={[styles.statusBadgeText, isLoggedIn ? styles.statusBadgeTextOnline : styles.statusBadgeTextGuest]}>
                    {isLoggedIn ? 'Cloud Sync On' : 'Guest Account'}
                  </Text>
                </View>
              </View>
              <Text style={styles.accountEmail}>
                {currentUser?.email || 'guest@nutripulse.local'}
              </Text>
            </View>
          </View>

          {isLoggedIn ? (
            <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={15} color={Colors.dark.textSecondary} />
              <Text style={styles.logoutBtnText}>Log Out Account</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginCtaBtn} onPress={openAuthModal} activeOpacity={0.8}>
              <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
              <Text style={styles.loginCtaText}>Sign In / Register to Back Up Data</Text>
            </TouchableOpacity>
          )}
        </View>

        {saveSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.successText}>Targets and BMR updated successfully!</Text>
          </View>
        )}

        {/* Hero Targets Computed Card */}
        <View style={styles.targetsCard}>
          <View style={styles.targetCardHeader}>
            <Text style={styles.targetCardTitle}>Current Daily Targets</Text>
            <View style={styles.tdeePill}>
              <Text style={styles.tdeePillText}>TDEE: {profile.tdee} kcal</Text>
            </View>
          </View>

          <View style={styles.targetCaloriesRow}>
            <Text style={styles.targetCaloriesNumber}>{profile.targetCalories}</Text>
            <Text style={styles.targetCaloriesUnit}>kcal / day</Text>
          </View>

          <View style={styles.macroPillsGrid}>
            <View style={[styles.macroPill, { borderColor: MACRO_COLORS.protein.primary }]}>
              <Text style={[styles.macroPillGrams, { color: MACRO_COLORS.protein.primary }]}>
                {profile.targetProteinG}g
              </Text>
              <Text style={styles.macroPillName}>Protein</Text>
            </View>

            <View style={[styles.macroPill, { borderColor: MACRO_COLORS.carbs.primary }]}>
              <Text style={[styles.macroPillGrams, { color: MACRO_COLORS.carbs.primary }]}>
                {profile.targetCarbsG}g
              </Text>
              <Text style={styles.macroPillName}>Carbs</Text>
            </View>

            <View style={[styles.macroPill, { borderColor: MACRO_COLORS.fat.primary }]}>
              <Text style={[styles.macroPillGrams, { color: MACRO_COLORS.fat.primary }]}>
                {profile.targetFatG}g
              </Text>
              <Text style={styles.macroPillName}>Fat</Text>
            </View>

            <View style={[styles.macroPill, { borderColor: MACRO_COLORS.water.primary }]}>
              <Text style={[styles.macroPillGrams, { color: MACRO_COLORS.water.primary }]}>
                {profile.targetWaterMl}ml
              </Text>
              <Text style={styles.macroPillName}>Water</Text>
            </View>
          </View>
        </View>

        {/* NVIDIA Nemotron API Key Card */}
        <Text style={styles.sectionHeading}>NVIDIA AI Engine Settings</Text>
        <View style={styles.nvidiaCard}>
          <View style={styles.nvidiaCardHeader}>
            <View style={styles.nvidiaIconBox}>
              <Ionicons name="hardware-chip" size={20} color="#76B900" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nvidiaCardTitle}>NVIDIA Nemotron API Key</Text>
              <Text style={styles.nvidiaCardSub}>
                {nvidiaApiKey ? 'Active - Calorie & Detail Analysis Enabled' : 'Not configured'}
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.nvidiaInput}
            placeholder="nvapi-..."
            placeholderTextColor={Colors.dark.textMuted}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.nvidiaActionsRow}>
            <TouchableOpacity style={styles.nvidiaLinkBtn} onPress={handleOpenNvidiaWebsite}>
              <Ionicons name="open-outline" size={14} color="#76B900" />
              <Text style={styles.nvidiaLinkBtnText}>Get Key at build.nvidia.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nvidiaModalBtn} onPress={openApiKeyModal}>
              <Ionicons name="key-outline" size={14} color="#FFFFFF" />
              <Text style={styles.nvidiaModalBtnText}>Key Setup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Goal Selector */}
        <Text style={styles.sectionHeading}>Primary Fitness Goal</Text>
        <View style={styles.goalsContainer}>
          {(['lose_weight', 'gain_weight', 'maintain_weight'] as GoalType[]).map((g) => {
            const info = GOAL_LABELS[g];
            const isSelected = goalType === g;

            return (
              <TouchableOpacity
                key={g}
                style={[
                  styles.goalOptionCard,
                  isSelected && { borderColor: info.color, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                ]}
                onPress={() => setGoalType(g)}
                activeOpacity={0.8}
              >
                <View style={[styles.goalIconBox, { backgroundColor: `${info.color}20` }]}>
                  <Ionicons name={info.icon as any} size={22} color={info.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.goalTitle, isSelected && { color: info.color }]}>
                    {info.title}
                  </Text>
                  <Text style={styles.goalSubtitle}>{info.subtitle}</Text>
                </View>
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={isSelected ? info.color : Colors.dark.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Goal Pace / Rate */}
        {goalType !== 'maintain_weight' && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>
              {goalType === 'lose_weight' ? 'Target Weight Loss Rate' : 'Target Weight Gain Rate'}
            </Text>
            <View style={styles.rateButtonsRow}>
              {[0.25, 0.5, 0.75, 1.0].map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[styles.rateBtn, goalRate === rate && styles.rateBtnActive]}
                  onPress={() => setGoalRate(rate)}
                >
                  <Text style={[styles.rateBtnTitle, goalRate === rate && styles.rateBtnTitleActive]}>
                    {rate} kg / wk
                  </Text>
                  <Text style={styles.rateBtnSub}>
                    {goalType === 'lose_weight' ? `-${Math.round((rate * 7700) / 7)}` : `+${Math.round((rate * 7700) / 7)}`} kcal
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Target Weight & Current Weight Inputs */}
        <Text style={styles.sectionHeading}>Body Metrics</Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Current Weight (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={currentWeight}
                onChangeText={setCurrentWeight}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Target Weight (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={targetWeight}
                onChangeText={setTargetWeight}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={heightCm}
                onChangeText={setHeightCm}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Biological Sex (for BMR calculation)</Text>
          <View style={styles.genderRow}>
            {(['male', 'female', 'other'] as const).map((gen) => (
              <TouchableOpacity
                key={gen}
                style={[styles.genderBtn, gender === gen && styles.genderBtnActive]}
                onPress={() => setGender(gen)}
              >
                <Text style={[styles.genderBtnText, gender === gen && styles.genderBtnTextActive]}>
                  {gen.charAt(0).toUpperCase() + gen.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Level */}
        <Text style={styles.sectionHeading}>Daily Activity Level</Text>
        <View style={styles.card}>
          {(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'] as ActivityLevel[]).map(
            (lvl) => {
              const info = ACTIVITY_LABELS[lvl];
              const isSelected = activity === lvl;

              return (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.activityOption, isSelected && styles.activityOptionActive]}
                  onPress={() => setActivity(lvl)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityTitle, isSelected && styles.activityTitleActive]}>
                      {info.title}
                    </Text>
                    <Text style={styles.activityDesc}>{info.desc}</Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isSelected ? '#10B981' : Colors.dark.textMuted}
                  />
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* Diet Style */}
        <Text style={styles.sectionHeading}>Diet & Macro Style</Text>
        <View style={styles.card}>
          <View style={styles.dietRow}>
            {[
              { type: 'high_protein' as DietType, name: 'High Protein', desc: '35% P • 40% C • 25% F' },
              { type: 'balanced' as DietType, name: 'Balanced', desc: '25% P • 50% C • 25% F' },
              { type: 'keto' as DietType, name: 'Keto / Low Carb', desc: '25% P • 5% C • 70% F' },
              { type: 'low_fat' as DietType, name: 'Low Fat', desc: '30% P • 55% C • 15% F' },
            ].map((d) => (
              <TouchableOpacity
                key={d.type}
                style={[styles.dietCard, dietType === d.type && styles.dietCardActive]}
                onPress={() => setDietType(d.type)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dietName, dietType === d.type && styles.dietNameActive]}>
                  {d.name}
                </Text>
                <Text style={styles.dietDesc}>{d.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveMainBtn} onPress={handleSaveProfile}>
          <Ionicons name="save-outline" size={18} color="#FFFFFF" />
          <Text style={styles.saveMainBtnText}>Save & Recalculate Targets</Text>
        </TouchableOpacity>

        {/* Reset / Demo seed controls */}
        <View style={styles.dangerZone}>
          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() => {
              seedDemoHistory();
              Alert.alert('Demo Seeded', 'Loaded 7 days of realistic nutrition and weight records!');
            }}
          >
            <Ionicons name="refresh" size={16} color="#10B981" />
            <Text style={styles.demoBtnText}>Reload 7-Day Demo Records</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() => {
              Alert.alert('Reset All Data', 'Are you sure you want to clear all diary entries?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear All', style: 'destructive', onPress: resetAllData },
              ]);
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.dangerBtnText}>Reset Diary</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  accountCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    marginBottom: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  userAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  accountEmail: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  statusBadgeOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusBadgeGuest: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadgeTextOnline: {
    color: '#10B981',
  },
  statusBadgeTextGuest: {
    color: '#F59E0B',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    paddingVertical: 9,
    gap: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  loginCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 11,
    gap: 8,
    marginTop: 12,
  },
  loginCtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  },
  targetsCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 18,
  },
  targetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  tdeePill: {
    backgroundColor: Colors.dark.cardElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tdeePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  targetCaloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 8,
    gap: 6,
  },
  targetCaloriesNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#10B981',
  },
  targetCaloriesUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  macroPillsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  macroPill: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  macroPillGrams: {
    fontSize: 14,
    fontWeight: '800',
  },
  macroPillName: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },
  nvidiaCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#76B900',
    marginBottom: 16,
  },
  nvidiaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  nvidiaIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(118, 185, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nvidiaCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  nvidiaCardSub: {
    fontSize: 11,
    color: '#76B900',
    marginTop: 1,
    fontWeight: '600',
  },
  nvidiaInput: {
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 12,
    padding: 12,
    color: Colors.dark.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    marginBottom: 10,
  },
  nvidiaActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nvidiaLinkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(118, 185, 0, 0.12)',
    borderRadius: 10,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(118, 185, 0, 0.3)',
  },
  nvidiaLinkBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#76B900',
  },
  nvidiaModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 5,
  },
  nvidiaModalBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
  },
  goalsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  goalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    gap: 12,
  },
  goalIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  goalSubtitle: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    marginBottom: 10,
  },
  rateButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rateBtn: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  rateBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  rateBtnTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.dark.textSecondary,
  },
  rateBtnTitleActive: {
    color: '#10B981',
  },
  rateBtnSub: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 12,
    padding: 12,
    color: Colors.dark.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  genderBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  genderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  genderBtnTextActive: {
    color: '#10B981',
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  activityOptionActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
  },
  activityTitleActive: {
    color: '#10B981',
  },
  activityDesc: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  dietRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietCard: {
    width: '48%',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  dietCardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  dietName: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  dietNameActive: {
    color: '#10B981',
  },
  dietDesc: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    marginTop: 3,
  },
  saveMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  saveMainBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  dangerZone: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  dangerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  dangerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
});
