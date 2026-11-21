import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Fonts } from '../constants/theme';
import { useNutri } from '../context/NutriContext';

interface NvidiaApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NVIDIA_BUILD_URL = 'https://build.nvidia.com';

export const NvidiaApiKeyModal: React.FC<NvidiaApiKeyModalProps> = ({
  visible,
  onClose,
}) => {
  const { nvidiaApiKey, saveNvidiaApiKey, dismissApiKeyPrompt } = useNutri();
  const [keyInput, setKeyInput] = useState(nvidiaApiKey || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenNvidiaWebsite = async () => {
    try {
      await Linking.openURL(NVIDIA_BUILD_URL);
    } catch (e) {
      setErrorMsg('Could not open web link. Please visit build.nvidia.com manually.');
    }
  };

  const handleSaveKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setErrorMsg('Please enter or paste a valid NVIDIA API key');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await saveNvidiaApiKey(trimmed);
      setLoading(false);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save API key');
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    await dismissApiKeyPrompt();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent backdropColor="rgba(0,0,0,0.85)">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header Badge */}
          <View style={styles.badgeContainer}>
            <View style={styles.nvidiaBadge}>
              <Ionicons name="hardware-chip" size={24} color="#C59BFF" />
            </View>
          </View>

          <Text style={styles.title}>NVIDIA AI Key Required</Text>
          <Text style={styles.description}>
            NutriPulse uses the <Text style={styles.highlight}>NVIDIA Nemotron AI Brain</Text> for ultra-accurate food calorie estimation, macro breakdown, and nutritional insights.
          </Text>

          {/* Dedicated Link to NVIDIA Website */}
          <TouchableOpacity
            style={styles.nvidiaLinkBtn}
            onPress={handleOpenNvidiaWebsite}
            activeOpacity={0.8}
          >
            <Ionicons name="open-outline" size={16} color="#C59BFF" />
            <Text style={styles.nvidiaLinkText}>Get Free Key at build.nvidia.com</Text>
          </TouchableOpacity>

          {/* API Key Input */}
          <View style={styles.inputBox}>
            <Ionicons name="key-outline" size={18} color={Colors.dark.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Paste nvapi-... key here"
              placeholderTextColor={Colors.dark.textMuted}
              value={keyInput}
              onChangeText={(text) => {
                setKeyInput(text);
                if (errorMsg) setErrorMsg(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={false}
            />
            {keyInput.length > 0 && (
              <TouchableOpacity onPress={() => setKeyInput('')}>
                <Ionicons name="close-circle" size={18} color={Colors.dark.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {errorMsg && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={15} color="#FF6F61" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#FFB547" />
            <Text style={styles.securityText}>
              Your API key is saved locally in app storage and used exclusively for food & calorie analysis.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonStack}>
            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.btnDisabled]}
              onPress={handleSaveKey}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={18} color="#000000" />
                  <Text style={styles.saveBtnText}>Save API Key & Activate</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipBtnText}>Continue with Local Analysis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 14, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.dark.modalBg,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#C59BFF',
    shadowColor: '#C59BFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  nvidiaBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(197, 155, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C59BFF',
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.display,
    color: Colors.dark.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: 13, fontFamily: Fonts.regular,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  highlight: {
    color: '#C59BFF',
    fontFamily: Fonts.extrabold,
  },
  nvidiaLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(197, 155, 255, 0.12)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(197, 155, 255, 0.3)',
  },
  nvidiaLinkText: {
    color: '#C59BFF',
    fontSize: 13,
    fontFamily: Fonts.extrabold,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 10,
    marginBottom: 10,
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
    marginBottom: 10,
  },
  errorText: {
    color: '#FF8A7A',
    fontSize: 12,
    fontFamily: Fonts.semibold,
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  securityText: {
    fontSize: 11, fontFamily: Fonts.regular,
    color: Colors.dark.textMuted,
    flex: 1,
    lineHeight: 15,
  },
  buttonStack: {
    gap: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C59BFF',
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: Fonts.black,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipBtnText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: Fonts.semibold,
  },
});
