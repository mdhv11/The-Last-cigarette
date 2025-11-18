import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateQuitPlan, clearError } from '../store/planSlice';
import { RootState, AppDispatch } from '../store';
import { QuitPlanSetup } from '../types/plan';

interface PlanSettingsFormProps {
  onClose: () => void;
}

export const PlanSettingsForm: React.FC<PlanSettingsFormProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { quitPlan, isLoading, error } = useSelector((state: RootState) => state.plan);

  const [formData, setFormData] = useState<Partial<QuitPlanSetup>>({});
  const [errors, setErrors] = useState<Partial<QuitPlanSetup>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (quitPlan) {
      setFormData({
        startDate: quitPlan.startDate.split('T')[0],
        quitDate: quitPlan.quitDate.split('T')[0],
        initialDailyAmount: quitPlan.initialDailyAmount,
        reductionMethod: quitPlan.reductionMethod,
        cigaretteCost: quitPlan.cigaretteCost,
        packSize: quitPlan.packSize,
      });
    }
  }, [quitPlan]);

  const validateForm = (): boolean => {
    const newErrors: Partial<QuitPlanSetup> = {};

    if (formData.startDate && formData.quitDate) {
      if (new Date(formData.quitDate) <= new Date(formData.startDate)) {
        newErrors.quitDate = 'Quit date must be after start date';
      }
    }

    if (formData.initialDailyAmount && formData.initialDailyAmount < 1) {
      (newErrors as any).initialDailyAmount = 'Daily amount must be at least 1';
    }

    if (formData.cigaretteCost !== undefined && formData.cigaretteCost < 0) {
      (newErrors as any).cigaretteCost = 'Cigarette cost must be positive';
    }

    if (formData.packSize !== undefined && formData.packSize < 1) {
      (newErrors as any).packSize = 'Pack size must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof QuitPlanSetup, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Only send changed fields
    const changedFields: Partial<QuitPlanSetup> = {};
    Object.keys(formData).forEach(key => {
      const fieldKey = key as keyof QuitPlanSetup;
      if (formData[fieldKey] !== undefined && quitPlan) {
        // Convert dates for comparison
        let originalValue = quitPlan[fieldKey];
        let newValue = formData[fieldKey];
        
        if (fieldKey === 'startDate' || fieldKey === 'quitDate') {
          originalValue = (originalValue as string).split('T')[0];
        }
        
        if (originalValue !== newValue) {
          (changedFields as any)[fieldKey] = newValue;
        }
      }
    });

    if (Object.keys(changedFields).length === 0) {
      Alert.alert('No Changes', 'No changes were made to your quit plan.');
      return;
    }

    dispatch(clearError());
    
    try {
      await dispatch(updateQuitPlan(changedFields)).unwrap();
      Alert.alert(
        'Success!',
        'Your quit plan has been updated successfully.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (err) {
      // Error is handled by Redux
    }
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

  if (!quitPlan) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No quit plan found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Quit Plan</Text>
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

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.formContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={[styles.input, errors.startDate && styles.inputError]}
              value={formData.startDate || ''}
              onChangeText={(value) => handleInputChange('startDate', value)}
              placeholder="YYYY-MM-DD"
            />
            {errors.startDate && <Text style={styles.fieldError}>{errors.startDate}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Target Quit Date</Text>
            <TextInput
              style={[styles.input, errors.quitDate && styles.inputError]}
              value={formData.quitDate || ''}
              onChangeText={(value) => handleInputChange('quitDate', value)}
              placeholder="YYYY-MM-DD"
            />
            {errors.quitDate && <Text style={styles.fieldError}>{errors.quitDate}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smoking Habits</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Daily Amount</Text>
            <TextInput
              style={[styles.input, errors.initialDailyAmount && styles.inputError]}
              value={formData.initialDailyAmount?.toString() || ''}
              onChangeText={(value) => handleInputChange('initialDailyAmount', parseInt(value) || 0)}
              keyboardType="numeric"
              placeholder="20"
            />
            {errors.initialDailyAmount && <Text style={styles.fieldError}>{errors.initialDailyAmount}</Text>}
          </View>

          <View style={styles.methodContainer}>
            <Text style={styles.label}>Reduction Method</Text>
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  formData.reductionMethod === 'gradual' && styles.methodButtonActive
                ]}
                onPress={() => handleInputChange('reductionMethod', 'gradual')}
              >
                <Text style={[
                  styles.methodButtonText,
                  formData.reductionMethod === 'gradual' && styles.methodButtonTextActive
                ]}>
                  Gradual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  formData.reductionMethod === 'cold_turkey' && styles.methodButtonActive
                ]}
                onPress={() => handleInputChange('reductionMethod', 'cold_turkey')}
              >
                <Text style={[
                  styles.methodButtonText,
                  formData.reductionMethod === 'cold_turkey' && styles.methodButtonTextActive
                ]}>
                  Cold Turkey
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Tracking</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cost per Pack ($)</Text>
            <TextInput
              style={[styles.input, errors.cigaretteCost && styles.inputError]}
              value={formData.cigaretteCost?.toString() || ''}
              onChangeText={(value) => handleInputChange('cigaretteCost', parseFloat(value) || 0)}
              keyboardType="numeric"
              placeholder="10.00"
            />
            {errors.cigaretteCost && <Text style={styles.fieldError}>{errors.cigaretteCost}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cigarettes per Pack</Text>
            <TextInput
              style={[styles.input, errors.packSize && styles.inputError]}
              value={formData.packSize?.toString() || ''}
              onChangeText={(value) => handleInputChange('packSize', parseInt(value) || 20)}
              keyboardType="numeric"
              placeholder="20"
            />
            {errors.packSize && <Text style={styles.fieldError}>{errors.packSize}</Text>}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
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
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  formContainer: {
    padding: 16,
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
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
    padding: 16,
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
  methodContainer: {
    marginBottom: 16,
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  methodButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e8',
  },
  methodButtonText: {
    fontSize: 16,
    color: '#666',
  },
  methodButtonTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});