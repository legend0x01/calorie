import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAccount } from '../types';

const AUTH_KEYS = {
  ACTIVE_USER: '@nutripulse_auth_active_user',
  USERS_DB: '@nutripulse_auth_registered_users_db',
};

interface StoredCredentials {
  account: UserAccount;
  passwordHash: string;
}

export async function getActiveUserSession(): Promise<UserAccount | null> {
  try {
    const json = await AsyncStorage.getItem(AUTH_KEYS.ACTIVE_USER);
    if (json) {
      return JSON.parse(json) as UserAccount;
    }
  } catch (e) {
    console.error('Failed to get active auth session:', e);
  }
  return null;
}

export async function loginWithEmail(emailInput: string, passwordInput: string): Promise<UserAccount> {
  const email = emailInput.trim().toLowerCase();
  if (!email || !passwordInput) {
    throw new Error('Please enter both email and password');
  }

  const dbJson = await AsyncStorage.getItem(AUTH_KEYS.USERS_DB);
  const usersDb: Record<string, StoredCredentials> = dbJson ? JSON.parse(dbJson) : {};

  if (usersDb[email]) {
    const userCred = usersDb[email];
    if (userCred.passwordHash !== passwordInput) {
      throw new Error('Incorrect password. Please try again.');
    }
    await AsyncStorage.setItem(AUTH_KEYS.ACTIVE_USER, JSON.stringify(userCred.account));
    return userCred.account;
  }

  // If user doesn't exist yet, auto-register for seamless user experience!
  const nameFromEmail = email.split('@')[0];
  const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
  const newAccount: UserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    email,
    displayName: formattedName,
    createdAt: new Date().toISOString(),
    isGuest: false,
  };

  usersDb[email] = {
    account: newAccount,
    passwordHash: passwordInput,
  };

  await AsyncStorage.setItem(AUTH_KEYS.USERS_DB, JSON.stringify(usersDb));
  await AsyncStorage.setItem(AUTH_KEYS.ACTIVE_USER, JSON.stringify(newAccount));

  return newAccount;
}

export async function registerWithEmail(
  nameInput: string,
  emailInput: string,
  passwordInput: string
): Promise<UserAccount> {
  const name = nameInput.trim();
  const email = emailInput.trim().toLowerCase();

  if (!name) {
    throw new Error('Please enter your full name');
  }
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address');
  }
  if (!passwordInput || passwordInput.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const dbJson = await AsyncStorage.getItem(AUTH_KEYS.USERS_DB);
  const usersDb: Record<string, StoredCredentials> = dbJson ? JSON.parse(dbJson) : {};

  if (usersDb[email]) {
    throw new Error('An account with this email already exists. Please log in.');
  }

  const newAccount: UserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    email,
    displayName: name,
    createdAt: new Date().toISOString(),
    isGuest: false,
  };

  usersDb[email] = {
    account: newAccount,
    passwordHash: passwordInput,
  };

  await AsyncStorage.setItem(AUTH_KEYS.USERS_DB, JSON.stringify(usersDb));
  await AsyncStorage.setItem(AUTH_KEYS.ACTIVE_USER, JSON.stringify(newAccount));

  return newAccount;
}

export async function loginWithGoogle(): Promise<UserAccount> {
  const googleAccount: UserAccount = {
    id: `usr_google_${Date.now()}`,
    email: 'alex.hunter.fitness@gmail.com',
    displayName: 'Alex Hunter',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date().toISOString(),
    isGuest: false,
  };

  await AsyncStorage.setItem(AUTH_KEYS.ACTIVE_USER, JSON.stringify(googleAccount));
  return googleAccount;
}

export async function loginAsGuest(): Promise<UserAccount> {
  const guestAccount: UserAccount = {
    id: 'usr_guest_default',
    email: 'guest@nutripulse.local',
    displayName: 'Guest Athlete',
    createdAt: new Date().toISOString(),
    isGuest: true,
  };

  await AsyncStorage.setItem(AUTH_KEYS.ACTIVE_USER, JSON.stringify(guestAccount));
  return guestAccount;
}

export async function logoutUserSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_KEYS.ACTIVE_USER);
  } catch (e) {
    console.error('Error logging out:', e);
  }
}
