import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Fonts } from '../constants/theme';
import { useNutri } from '../context/NutriContext';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const { login, register, loginWithGoogle, loginAsGuest } = useNutri();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register(name, email, password);
      }
      setLoading(false);
      handleClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      setLoading(false);
      handleClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    try {
      await loginAsGuest();
      setLoading(false);
      handleClose();
    } catch (e: any) {
      setLoading(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setLoading(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%' }}
        >
          <View style={styles.modalCard}>
            {/* Header Bar */}
            <View style={styles.headerBar}>
              <View style={styles.logoRow}>
                <View style={styles.logoBadge}>
                  <Ionicons name="flash" size={18} color="#FFB547" />
                </View>
                <Text style={styles.logoTitle}>NutriPulse Cloud Auth</Text>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Ionicons name="close" size={20} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Tab Selector */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabBtn, mode === 'signin' && styles.tabBtnActive]}
                  onPress={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                >
                  <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, mode === 'register' && styles.tabBtnActive]}
                  onPress={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                >
                  <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.welcomeText}>
                {mode === 'signin'
                  ? 'Sign in to sync your calorie logs, targets & weight analytics across devices.'
                  : 'Create a free NutriPulse account to securely save your daily nutrition records.'}
              </Text>

              {/* Form Inputs */}
              {mode === 'register' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="person-outline" size={18} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Alex Hunter"
                      placeholderTextColor={Colors.dark.textMuted}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="mail-outline" size={18} color={Colors.dark.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor={Colors.dark.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.dark.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.dark.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              {mode === 'register' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={Colors.dark.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </View>
                </View>
              )}

              {errorMsg && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color="#FF6F61" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Main Auth Button */}
              <TouchableOpacity
                style={[styles.mainSubmitBtn, loading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#24160C" />
                ) : (
                  <>
                    <Ionicons
                      name={mode === 'signin' ? 'log-in-outline' : 'person-add-outline'}
                      size={18}
                      color="#24160C"
                    />
                    <Text style={styles.mainSubmitBtnText}>
                      {mode === 'signin' ? 'Sign In & Sync Data' : 'Create Account'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social / Guest options */}
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleSignIn}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.guestBtn}
                onPress={handleGuestSignIn}
                activeOpacity={0.7}
              >
                <Text style={styles.guestBtnText}>Continue as Guest (Offline Mode)</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 14, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.dark.modalBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    maxHeight: '90%',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 181, 71, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: 16,
    fontFamily: Fonts.extrabold,
    color: Colors.dark.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    paddingVertical: 14,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFB547',
  },
  tabText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.dark.textMuted,
  },
  tabTextActive: {
    color: '#24160C',
    fontFamily: Fonts.extrabold,
  },
  welcomeText: {
    fontSize: 12, fontFamily: Fonts.regular,
    color: Colors.dark.textSecondary,
    lineHeight: 17,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.dark.textSecondary,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  input: {
    flex: 1,
    color: Colors.dark.textPrimary,
    fontSize: 13, fontFamily: Fonts.regular,
    padding: 0,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 111, 97, 0.15)',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#FF8A7A',
    fontSize: 12,
    fontFamily: Fonts.semibold,
    flex: 1,
  },
  mainSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB547',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  mainSubmitBtnText: {
    fontSize: 15,
    fontFamily: Fonts.extrabold,
    color: '#24160C',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: Colors.dark.textMuted,
    marginHorizontal: 12,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  googleBtnText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.dark.textPrimary,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  guestBtnText: {
    fontSize: 12,
    fontFamily: Fonts.semibold,
    color: Colors.dark.textMuted,
  },
});
