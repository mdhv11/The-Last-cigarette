import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { PunishmentStatus } from '../store/achievementsSlice';

interface PunishmentReminderProps {
  punishment: PunishmentStatus | null;
  visible: boolean;
  onDismiss: () => void;
  onDonate?: () => void;
}

export const PunishmentReminder: React.FC<PunishmentReminderProps> = ({
  punishment,
  visible,
  onDismiss,
  onDonate,
}) => {
  if (!punishment || !punishment.triggered) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Daily Target Exceeded</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Target</Text>
                <Text style={styles.statValue}>{punishment.dailyTarget}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Actual</Text>
                <Text style={[styles.statValue, styles.exceededValue]}>
                  {punishment.dailyCount}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Over By</Text>
                <Text style={[styles.statValue, styles.exceededValue]}>
                  +{punishment.overage}
                </Text>
              </View>
            </View>

            <Text style={styles.message}>{punishment.message}</Text>

            {punishment.donationAmount && punishment.charityName && (
              <View style={styles.donationBox}>
                <Text style={styles.donationText}>
                  Suggested Donation: ${punishment.donationAmount}
                </Text>
                <Text style={styles.charityText}>
                  to {punishment.charityName}
                </Text>
              </View>
            )}

            <Text style={styles.encouragement}>
              Don't be too hard on yourself. Tomorrow is a new day to get back on
              track! 💪
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            {onDonate && (
              <TouchableOpacity
                style={[styles.button, styles.donateButton]}
                onPress={onDonate}
              >
                <Text style={styles.buttonText}>Make Donation</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={onDismiss}
            >
              <Text style={[styles.buttonText, styles.dismissButtonText]}>
                I Understand
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  exceededValue: {
    color: '#FF6B6B',
  },
  message: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  donationBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  donationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 4,
  },
  charityText: {
    fontSize: 14,
    color: '#666',
  },
  encouragement: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  donateButton: {
    backgroundColor: '#FF9800',
  },
  dismissButton: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
  dismissButtonText: {
    color: '#666',
  },
});
