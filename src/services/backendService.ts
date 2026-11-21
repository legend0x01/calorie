import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayLog, UserProfile, WeightEntry } from '../types';

export function getUserStorageKey(userId: string, type: 'profile' | 'day_logs' | 'weights'): string {
  const safeId = userId.replace(/[^a-zA-Z0-9_]/g, '_');
  return `@nutripulse_v2_u_${safeId}_${type}`;
}

export async function loadBackendUserData(userId: string): Promise<{
  profile: UserProfile | null;
  dayLogs: Record<string, DayLog> | null;
  weightHistory: WeightEntry[] | null;
}> {
  try {
    const profileKey = getUserStorageKey(userId, 'profile');
    const logsKey = getUserStorageKey(userId, 'day_logs');
    const weightsKey = getUserStorageKey(userId, 'weights');

    const [profileJson, logsJson, weightsJson] = await Promise.all([
      AsyncStorage.getItem(profileKey),
      AsyncStorage.getItem(logsKey),
      AsyncStorage.getItem(weightsKey),
    ]);

    return {
      profile: profileJson ? JSON.parse(profileJson) : null,
      dayLogs: logsJson ? JSON.parse(logsJson) : null,
      weightHistory: weightsJson ? JSON.parse(weightsJson) : null,
    };
  } catch (e) {
    console.error('Failed to load user data from backend storage:', e);
    return { profile: null, dayLogs: null, weightHistory: null };
  }
}

export async function saveBackendUserData(
  userId: string,
  data: {
    profile?: UserProfile;
    dayLogs?: Record<string, DayLog>;
    weightHistory?: WeightEntry[];
  }
): Promise<void> {
  try {
    const writes: Record<string, string> = {};

    if (data.profile) {
      writes[getUserStorageKey(userId, 'profile')] = JSON.stringify(data.profile);
    }
    if (data.dayLogs) {
      writes[getUserStorageKey(userId, 'day_logs')] = JSON.stringify(data.dayLogs);
    }
    if (data.weightHistory) {
      writes[getUserStorageKey(userId, 'weights')] = JSON.stringify(data.weightHistory);
    }

    // AsyncStorage v3 removed multiSet(pairs) in favour of setMany(record).
    // Calling multiSet threw "is not a function", so nothing was ever saved.
    if (Object.keys(writes).length > 0) {
      await AsyncStorage.setMany(writes);
    }
  } catch (e) {
    console.error('Failed to save user data to backend storage:', e);
  }
}

export async function syncGuestDataToAccount(
  guestUserId: string,
  targetUserId: string
): Promise<void> {
  try {
    const guestData = await loadBackendUserData(guestUserId);
    if (!guestData.dayLogs && !guestData.weightHistory) {
      return;
    }

    const targetData = await loadBackendUserData(targetUserId);

    const mergedLogs = { ...(guestData.dayLogs || {}), ...(targetData.dayLogs || {}) };
    const mergedWeights = [...(targetData.weightHistory || []), ...(guestData.weightHistory || [])];

    await saveBackendUserData(targetUserId, {
      dayLogs: mergedLogs,
      weightHistory: mergedWeights,
    });
  } catch (e) {
    console.error('Failed to sync guest data to account:', e);
  }
}
