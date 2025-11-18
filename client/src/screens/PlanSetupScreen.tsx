import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { PlanSetupWizard } from '../components/PlanSetupWizard';

export const PlanSetupScreen: React.FC = () => {
  const handlePlanComplete = () => {
    // Navigation will automatically switch to AppNavigator
    // when hasSetupPlan becomes true in Redux state
    console.log('Plan setup completed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <PlanSetupWizard onComplete={handlePlanComplete} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});