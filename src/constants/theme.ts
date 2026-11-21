// NutriPulse "night kitchen" palette: a warm aubergine base with produce
// colours for the data. Each macro is named after a food that is rich in it,
// so the colour carries meaning (pomegranate = protein, blueberry = carbs,
// avocado = fat, coconut water = hydration, mango = your calorie budget).
export const Palette = {
  aubergine: '#140E1A', // page background
  plumSkin: '#1F1726', // cards
  plumFlesh: '#2A2033', // raised surfaces, inputs
  ricePaper: '#FBF3EA', // primary text
  mango: '#FFB547', // calories, primary actions
  mangoDeep: '#E8932A',
  pomegranate: '#FF6F8A', // protein
  blueberry: '#8EA4FF', // carbs
  avocado: '#9ED36A', // fat
  coconut: '#6FD3F2', // water
  chili: '#FF6F61', // burned calories, over budget, delete
  ube: '#C59BFF', // AI features
  ubeDeep: '#8A5CF0',
  onMango: '#24160C', // text on mango buttons
};

export const Colors = {
  dark: {
    bg: Palette.aubergine,
    card: Palette.plumSkin,
    cardElevated: Palette.plumFlesh,
    cardBorder: 'rgba(255, 228, 200, 0.08)',
    textPrimary: Palette.ricePaper,
    textSecondary: '#C2B4C6',
    textMuted: '#8A7A93',
    accent: Palette.mango,
    accentLight: '#FFCB7A',
    accentDark: Palette.mangoDeep,
    accentGlow: 'rgba(255, 181, 71, 0.22)',
    onAccent: Palette.onMango,

    calories: Palette.mango,
    protein: Palette.pomegranate,
    carbs: Palette.blueberry,
    fat: Palette.avocado,
    water: Palette.coconut,
    burn: Palette.chili,
    ai: Palette.ube,

    inputBg: '#251C2D',
    modalBg: '#1A1320',
    tabBar: Palette.plumSkin,
    tabBarBorder: 'rgba(255, 228, 200, 0.08)',
    badgeSuccess: 'rgba(158, 211, 106, 0.16)',
    badgeWarning: 'rgba(255, 181, 71, 0.16)',
    badgeError: 'rgba(255, 111, 97, 0.16)',
  },
  light: {
    bg: '#FBF6F0',
    card: '#FFFFFF',
    cardElevated: '#F4ECE4',
    cardBorder: 'rgba(40, 20, 50, 0.08)',
    textPrimary: '#1E1424',
    textSecondary: '#5B4B62',
    textMuted: '#8A7A93',
    accent: Palette.mangoDeep,
    accentLight: Palette.mango,
    accentDark: '#C47414',
    accentGlow: 'rgba(232, 147, 42, 0.15)',
    onAccent: Palette.onMango,

    calories: Palette.mangoDeep,
    protein: '#E04F6C',
    carbs: '#5D74E0',
    fat: '#6FA83C',
    water: '#2BA6CC',
    burn: '#E04A3C',
    ai: Palette.ubeDeep,

    inputBg: '#F4ECE4',
    modalBg: '#FFFFFF',
    tabBar: '#FFFFFF',
    tabBarBorder: 'rgba(40, 20, 50, 0.08)',
    badgeSuccess: '#E6F4D8',
    badgeWarning: '#FFF0D6',
    badgeError: '#FFE1DD',
  },
};

// Figtree for reading, Bricolage Grotesque for numbers and headlines.
// Each weight is its own family so Android and web never fake a bold.
export const Fonts = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
  black: 'Figtree_900Black',
  displayMedium: 'BricolageGrotesque_600SemiBold',
  displayBold: 'BricolageGrotesque_700Bold',
  display: 'BricolageGrotesque_800ExtraBold',
};

// Meals run from dawn to night: each meal's slice of the plate, its dot on
// the meal card and its legend chip share one colour.
export const MEAL_COLORS = {
  breakfast: '#FFE0A3',
  lunch: Palette.mango,
  dinner: '#FF8A5B',
  snacks: '#B596E8',
} as const;

const tint = (rgb: string, a: number) => `rgba(${rgb}, ${a})`;

export const MACRO_COLORS = {
  calories: {
    primary: Palette.mango,
    gradient: ['#FFCB7A', Palette.mango] as const,
    bg: tint('255, 181, 71', 0.14),
  },
  protein: {
    primary: Palette.pomegranate,
    gradient: ['#FF93A8', Palette.pomegranate] as const,
    bg: tint('255, 111, 138', 0.14),
  },
  carbs: {
    primary: Palette.blueberry,
    gradient: ['#B3C2FF', Palette.blueberry] as const,
    bg: tint('142, 164, 255', 0.14),
  },
  fat: {
    primary: Palette.avocado,
    gradient: ['#BDE592', Palette.avocado] as const,
    bg: tint('158, 211, 106', 0.14),
  },
  water: {
    primary: Palette.coconut,
    gradient: ['#A3E4F7', Palette.coconut] as const,
    bg: tint('111, 211, 242', 0.14),
  },
  burn: {
    primary: Palette.chili,
    gradient: ['#FF9A8F', Palette.chili] as const,
    bg: tint('255, 111, 97', 0.14),
  },
};
