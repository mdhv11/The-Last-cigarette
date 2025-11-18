import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

interface PunishmentConfig {
  enabled: boolean;
  donationAmount: number;
  charityName: string;
  triggerThreshold: number;
}

interface PunishmentSettingsProps {
  onClose: () => void;
}

export const PunishmentSettings: React.FC<PunishmentSettingsProps> = ({ onClose }) => {
  const [config, setConfig] = useState<PunishmentConfig>({
    enabled: true,
    donationAmount: 5,
    charityName: 'American Cancer Society',
    triggerThreshold: 3,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PunishmentConfig, string>>>({});

  const handleInputChange = (field: keyof PunishmentConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PunishmentConfig, string>> = {};

    if (config.enabled) {
      if (config.donationAmount < 1) {
        newErrors.donationAmount = 'Donation amount must be at least $1';
      }
      if (config.donationAmount > 1000) {
        newErrors.donationAmount = 'Donation amount seems too high';
      }
      if (!config.charityName.trim()) {
        newErrors.charityName = 'Please enter a charity name';
      }
      if (config.triggerThreshold < 1) {
        newErrors.triggerThreshold = 'Threshold must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call - in real implementation, save to backend
    setTimeout(() => {
      setIsLoading(false);
      setHasChanges(false);
      Alert.alert(
        'Success',
        'Punishment settings saved successfully!',
        [{ text: 'OK', onPress: onClose }]
      );
    }, 500);
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose }
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Punishment Settings</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💪 Accountability System</Text>
          <Text style={styles.infoText}>
            Set up a donation commitment to help you stay accountable. When you exceed your daily target, you'll be reminded to donate to your chosen charity.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Enable Punishment System</Text>
            <TouchableOpacity
              style={[styles.toggle, config.enabled && styles.toggleActive]}
              onPress={() => handleInputChange('enabled', !config.enabled)}
            >
              <View style={[styles.toggleThumb, config.enabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {config.enabled && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Donation Details</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Donation Amount per Overage ($)</Text>
                <TextInput
                  style={[styles.input, errors.donationAmount && styles.inputError]}
                  value={config.donationAmount.toString()}
                  onChangeText={(value) => handleInputChange('donationAmount', parseFloat(value) || 0)}
                  keyboardType="numeric"
                  placeholder="5.00"
                />
                {errors.donationAmount && (
                  <Text style={styles.fieldError}>{errors.donationAmount}</Text>
                )}
                <Text style={styles.inputHint}>
                  You'll donate this amount for each cigarette over your daily target
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Charity Name</Text>
                <TextInput
                  style={[styles.input, errors.charityName && styles.inputError]}
                  value={config.charityName}
                  onChangeText={(value) => handleInputChange('charityName', value)}
                  placeholder="American Cancer Society"
                />
                {errors.charityName && (
                  <Text style={styles.fieldError}>{errors.charityName}</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trigger Settings</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Cigarettes Over Target</Text>
                <TextInput
                  style={[styles.input, errors.triggerThreshold && styles.inputError]}
                  value={config.triggerThreshold.toString()}
                  onChangeText={(value) => handleInputChange('triggerThreshold', parseInt(value) || 0)}
                  keyboardType="numeric"
                  placeholder="3"
                />
                {errors.triggerThreshold && (
                  <Text style={styles.fieldError}>{errors.triggerThreshold}</Text>
                )}
                <Text style={styles.inputHint}>
                  You'll be reminded to donate after exceeding your target by this amount
                </Text>
              </View>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>Example:</Text>
              <Text style={styles.exampleText}>
                If your daily target is 10 cigarettes and you smoke 13, you'll be reminded to donate ${(config.donationAmount * 3).toFixed(2)} to {config.charityName}.
              </Text>
            </View>

            <View style={styles.charityList}>
              <Text style={styles.charityListTitle}>Suggested Charities:</Text>
              <TouchableOpacity 
                style={styles.charityItem}
                onPress={() => handleInputChange('charityName', 'American Cancer Society')}
              >
                <Text style={styles.charityName}>American Cancer Society</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.charityItem}
                onPress={() => handleInputChange('charityName', 'American Lung Association')}
              >
                <Text style={styles.charityName}>American Lung Association</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.charityItem}
                onPress={() => handleInputChange('charityName', 'Truth Initiative')}
              >
                <Text style={styles.charityName}>Truth Initiative</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
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
  inputError: {
    borderColor: '#f44336',
  },
  fieldError: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 4,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  exampleBox: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#EF6C00',
    lineHeight: 20,
  },
  charityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  charityListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  charityItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  charityName: {
    fontSize: 14,
    color: '#4CAF50',
  },
});
