import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Fonts, MACRO_COLORS, MEAL_COLORS, Palette } from '../constants/theme';
import { MealCategory } from '../types';
import { useNutri } from '../context/NutriContext';

interface MealCardProps {
  category: MealCategory;
  onAddPress: (category: MealCategory) => void;
  onAIScanPress: (category: MealCategory) => void;
}

const MEAL_INFO: Record<MealCategory, { title: string; icon: string; empty: string }> = {
  breakfast: { title: 'Breakfast', icon: 'sunny', empty: 'Nothing yet. What did you start the day with?' },
  lunch: { title: 'Lunch', icon: 'partly-sunny', empty: 'Nothing yet. Add your lunch when you have it.' },
  dinner: { title: 'Dinner', icon: 'moon', empty: 'Nothing yet. Add dinner when you eat.' },
  snacks: { title: 'Snacks', icon: 'cafe', empty: 'Coffee, fruit, a protein shake: they all count.' },
};

export const MealCard: React.FC<MealCardProps> = ({ category, onAddPress, onAIScanPress }) => {
  const { summary, removeFoodItem, updateFoodItemServings } = useNutri();
  const [isExpanded, setIsExpanded] = useState(true);

  const meal = summary.mealBreakdown[category] || { calories: 0, protein: 0, carbs: 0, fat: 0, items: [] };
  const info = MEAL_INFO[category];
  const color = MEAL_COLORS[category];
  const hasItems = meal.items.length > 0;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`${info.title}, ${meal.calories} kcal`}
      >
        <View style={[styles.badge, { backgroundColor: hasItems ? color : 'transparent', borderColor: color }]}>
          <Ionicons name={info.icon as any} size={16} color={hasItems ? Palette.onMango : color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{info.title}</Text>
          <Text style={styles.subtitle}>
            {hasItems
              ? `${meal.items.length} ${meal.items.length === 1 ? 'item' : 'items'} · ${meal.protein}P  ${meal.carbs}C  ${meal.fat}F`
              : 'Not logged'}
          </Text>
        </View>
        <Text style={[styles.kcal, !hasItems && { color: Colors.dark.textMuted }]}>{meal.calories}</Text>
        <Text style={styles.kcalUnit}>kcal</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.dark.textMuted}
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.body}>
          {!hasItems ? (
            <Text style={styles.empty}>{info.empty}</Text>
          ) : (
            meal.items.map(item => {
              const kcal = Math.round(item.calories * item.servings);
              return (
                <View key={item.logId} style={styles.row}>
                  <View style={styles.sticker}>
                    <Text style={styles.emoji}>{item.icon || '🍽️'}</Text>
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.foodName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {item.aiGenerated && (
                        <View style={styles.aiPill}>
                          <Ionicons name="sparkles" size={9} color={Palette.ube} />
                          <Text style={styles.aiPillText}>AI</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.serving} numberOfLines={1}>
                      {item.servings} × {item.servingSize} {item.servingUnit}
                    </Text>
                    <Text style={styles.macros}>
                      <Text style={{ color: MACRO_COLORS.protein.primary }}>{Math.round(item.proteinG * item.servings)}P</Text>
                      {'  '}
                      <Text style={{ color: MACRO_COLORS.carbs.primary }}>{Math.round(item.carbsG * item.servings)}C</Text>
                      {'  '}
                      <Text style={{ color: MACRO_COLORS.fat.primary }}>{Math.round(item.fatG * item.servings)}F</Text>
                    </Text>
                  </View>

                  <View style={styles.right}>
                    <Text style={styles.foodKcal}>{kcal}</Text>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() =>
                          item.servings > 0.5
                            ? updateFoodItemServings(item.logId, item.servings - 0.5)
                            : removeFoodItem(item.logId)
                        }
                        accessibilityLabel={`Less ${item.name}`}
                      >
                        <Ionicons name="remove" size={13} color={Colors.dark.textSecondary} />
                      </TouchableOpacity>
                      <Text style={styles.stepCount}>{item.servings}×</Text>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => updateFoodItemServings(item.logId, item.servings + 0.5)}
                        accessibilityLabel={`More ${item.name}`}
                      >
                        <Ionicons name="add" size={13} color={Colors.dark.textPrimary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => removeFoodItem(item.logId)}
                        accessibilityLabel={`Remove ${item.name}`}
                      >
                        <Ionicons name="trash-outline" size={14} color={Palette.chili} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.addBtn} onPress={() => onAddPress(category)} activeOpacity={0.75}>
              <Ionicons name="add" size={16} color={Palette.mango} />
              <Text style={styles.addText}>Add food</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aiBtn} onPress={() => onAIScanPress(category)} activeOpacity={0.75}>
              <Ionicons name="sparkles" size={14} color={Palette.ube} />
              <Text style={styles.aiText}>Describe it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: Colors.dark.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
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
  kcal: {
    fontFamily: Fonts.display,
    fontSize: 22,
    color: Colors.dark.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  kcalUnit: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginLeft: -8,
    alignSelf: 'flex-end',
    marginBottom: 3,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  empty: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.dark.textMuted,
    paddingVertical: 4,
    paddingLeft: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 228, 200, 0.05)',
    gap: 12,
  },
  sticker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 19,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  foodName: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.dark.textPrimary,
    flexShrink: 1,
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(197, 155, 255, 0.14)',
  },
  aiPillText: {
    fontFamily: Fonts.extrabold,
    fontSize: 9,
    color: Palette.ube,
  },
  serving: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 1,
  },
  macros: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  foodKcal: {
    fontFamily: Fonts.displayBold,
    fontSize: 16,
    color: Colors.dark.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: Colors.dark.textSecondary,
    minWidth: 24,
    textAlign: 'center',
  },
  deleteBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 181, 71, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 181, 71, 0.22)',
  },
  addText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Palette.mango,
  },
  aiBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(197, 155, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 255, 0.22)',
  },
  aiText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Palette.ube,
  },
});
