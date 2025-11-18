import React, { useState } from 'react';
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
import { setupQuitPlan, clearError } from '../store/planSlice';
import { RootState, AppDispatch } from '../store';
import { QuitPlanSetup } from '../types/plan';

interface PlanSetupWizardProps {
  onComplete: () => void;
}

export const PlanSetupWizard: React.FC<PlanSetupWizardProps> = ({ onComplete }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.plan);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuitPlanSetup>({
    startDate: new Date().toISOString().split('T')[0],
    quitDate: '',
    initialDailyAmount: 20,
    reductionMethod: 'gradual',
    cigaretteCost: 10,
    packSize: 20,
  });

  const [errors, setErrors] = useState<Partial<QuitPlanSetup>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<QuitPlanSetup> = {};

    switch (step) {
      case 1:
        if (!formData.startDate) {
          newErrors.startDate = 'Start date is required';
        }
        if (!formData.quitDate) {
          newErrors.quitDate = 'Target quit date is required';
        } else if (new Date(formData.quitDate) <= new Date(formData.startDate)) {
          newErrors.quitDate = 'Quit date must be after start date';
        }
        break;
      case 2:
        if (!formData.initialDailyAmount || formData.initialDailyAmount < 1) {
          (newErrors as any).initialDailyAmount = 'Daily amount must be at least 1';
        }
        break;
      case 3:
        if (!formData.cigaretteCost || formData.cigaretteCost < 0) {
          (newErrors as any).cigaretteCost = 'Cigarette cost must be positive';
        }
        if (!formData.packSize || formData.packSize < 1) {
          (newErrors as any).packSize = 'Pack size must be at least 1';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    dispatch(clearError());
    
    try {
      await dispatch(setupQuitPlan(formData)).unwrap();
      Alert.alert(
        'Success!',
        'Your quit plan has been created. You\'re ready to start your journey!',
        [{ text: 'Continue', onPress: onComplete }]
      );
    } catch (err) {
      // Error is handled by Redux
    }
  };

  const handleInputChange = (field: keyof QuitPlanSetup, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>When do you want to start?</Text>
            <Text style={styles.stepDescription}>
              Choose your start date and target quit date
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={[styles.input, errors.startDate && styles.inputError]}
                value={formData.startDate}
                onChangeText={(value) => handleInputChange('startDate', value)}
                placeholder="YYYY-MM-DD"
              />
              {errors.startDate && <Text style={styles.fieldError}>{errors.startDate}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Target Quit Date</Text>
              <TextInput
                style={[styles.input, errors.quitDate && styles.inputError]}
                value={formData.quitDate}
                onChangeText={(value) => handleInputChange('quitDate', value)}
                placeholder="YYYY-MM-DD"
              />
              {errors.quitDate && <Text style={styles.fieldError}>{errors.quitDate}</Text>}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Current smoking habits</Text>
            <Text style={styles.stepDescription}>
              How many cigarettes do you smoke per day on average?
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Daily Amount</Text>
              <TextInput
                style={[styles.input, errors.initialDailyAmount && styles.inputError]}
                value={formData.initialDailyAmount.toString()}
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
                    Gradual Reduction
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
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Cost tracking</Text>
            <Text style={styles.stepDescription}>
              Help us calculate your savings by providing cigarette costs
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cost per Pack ($)</Text>
              <TextInput
                style={[styles.input, errors.cigaretteCost && styles.inputError]}
                value={formData.cigaretteCost.toString()}
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
        );

      case 4:
        const totalDays = Math.ceil(
          (new Date(formData.quitDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        const costPerCigarette = formData.cigaretteCost / (formData.packSize || 20);
        const dailySavings = formData.initialDailyAmount * costPerCigarette;

        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Review your plan</Text>
            <Text style={styles.stepDescription}>
              Here's a summary of your quit smoking plan
            </Text>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Start Date:</Text>
                <Text style={styles.summaryValue}>{formData.startDate}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quit Date:</Text>
                <Text style={styles.summaryValue}>{formData.quitDate}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryValue}>{totalDays} days</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Daily Amount:</Text>
                <Text style={styles.summaryValue}>{formData.initialDailyAmount} cigarettes</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Method:</Text>
                <Text style={styles.summaryValue}>
                  {formData.reductionMethod === 'gradual' ? 'Gradual Reduction' : 'Cold Turkey'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Daily Savings:</Text>
                <Text style={styles.summaryValue}>${dailySavings.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Set Up Your Quit Plan</Text>
        <Text style={styles.stepIndicator}>Step {currentStep} of 4</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {renderStep()}

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={handleBack}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.nextButton, isLoading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === 4 ? 'Create Plan' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#666',
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
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
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
  summaryContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});