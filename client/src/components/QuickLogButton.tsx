import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logCigarettes, clearError } from '../store/cigLogSlice';
import { sendTargetWarningNotification } from '../store/notificationSlice';
import { RootState, AppDispatch } from '../store';
import { CigTrigger, TRIGGER_LABELS } from '../types/cigLog';

interface QuickLogButtonProps {
  onLogComplete?: () => void;
}

export const QuickLogButton: React.FC<QuickLogButtonProps> = ({ onLogComplete }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.cigLog);

  const [showModal, setShowModal] = useState(false);
  const [count, setCount] = useState('1');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [trigger, setTrigger] = useState<CigTrigger | undefined>(undefined);

  const handleQuickLog = () => {
    setShowModal(true);
    dispatch(clearError());
  };

  const handleSubmit = async () => {
    const parsedCount = parseInt(count);
    
    // Validate count
    if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 100) {
      Alert.alert('Invalid Input', 'Please enter a valid number between 1 and 100.');
      return;
    }

    const logData = {
      count: parsedCount,
      notes: notes.trim() || undefined,
      location: location.trim() || undefined,
      trigger,
    };

    try {
      const result = await dispatch(logCigarettes(logData)).unwrap();
      setShowModal(false);
      resetForm();
      onLogComplete?.();
      
      // Check if we should send a target warning notification
      if (result.dailyStats) {
        const remaining = result.dailyStats.remaining;
        const limit = result.dailyStats.limit;
        
        // Send notification if approaching limit (25% or less remaining, or 1 left)
        if (remaining <= Math.ceil(limit * 0.25) && remaining > 0) {
          dispatch(sendTargetWarningNotification({ remaining, limit }));
        }
      }
      
      Alert.alert(
        'Logged Successfully',
        `${logData.count} cigarette${logData.count > 1 ? 's' : ''} logged.`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      // Error is handled by Redux, but we can add additional user feedback here
      console.error('Failed to log cigarettes:', err);
    }
  };

  const resetForm = () => {
    setCount('1');
    setNotes('');
    setLocation('');
    setTrigger(undefined);
  };

  const handleCancel = () => {
    setShowModal(false);
    resetForm();
    dispatch(clearError());
  };

  const renderTriggerButtons = () => {
    const triggers: CigTrigger[] = ['stress', 'social', 'habit', 'boredom', 'alcohol', 'coffee', 'work', 'anxiety', 'other'];
    
    return (
      <View style={styles.triggerContainer}>
        <Text style={styles.label}>What triggered this? (optional)</Text>
        <View style={styles.triggerGrid}>
          {triggers.map((triggerOption) => (
            <TouchableOpacity
              key={triggerOption}
              style={[
                styles.triggerButton,
                trigger === triggerOption && styles.triggerButtonActive
              ]}
              onPress={() => setTrigger(trigger === triggerOption ? undefined : triggerOption)}
            >
              <Text style={[
                styles.triggerButtonText,
                trigger === triggerOption && styles.triggerButtonTextActive
              ]}>
                {TRIGGER_LABELS[triggerOption]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.quickLogButton} onPress={handleQuickLog}>
        <Text style={styles.quickLogButtonText}>+ Log Cigarettes</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Cigarettes</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>How many?</Text>
              <TextInput
                style={styles.input}
                value={count}
                onChangeText={setCount}
                keyboardType="numeric"
                placeholder="1"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location (optional)</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Home, Work, Bar"
                maxLength={100}
              />
            </View>

            {renderTriggerButtons()}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="How are you feeling? Any thoughts?"
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading || !count || parseInt(count) < 1}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Log</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  quickLogButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickLogButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  triggerContainer: {
    marginBottom: 16,
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  triggerButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  triggerButtonText: {
    fontSize: 14,
    color: '#666',
  },
  triggerButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});