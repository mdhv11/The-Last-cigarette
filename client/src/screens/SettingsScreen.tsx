import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { 
  PlanSettingsForm, 
  NotificationSettings, 
  PunishmentSettings, 
  RewardsSettings 
} from '../components';
import { getCurrentPlan } from '../store/planSlice';
import { RootState, AppDispatch } from '../store';

type SettingsView = 'main' | 'plan' | 'notifications' | 'punishment' | 'rewards';

export const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { quitPlan, isLoading } = useSelector((state: RootState) => state.plan);
  const [currentView, setCurrentView] = useState<SettingsView>('main');

  useEffect(() => {
    // Fetch current plan when screen loads
    dispatch(getCurrentPlan());
  }, [dispatch]);

  const handlePlanSettingsPress = () => {
    if (!quitPlan) {
      Alert.alert(
        'No Plan Found',
        'You need to set up a quit plan first.',
        [{ text: 'OK' }]
      );
      return;
    }
    setCurrentView('plan');
  };

  const handleCloseSubView = () => {
    setCurrentView('main');
  };

  // Render sub-views
  if (currentView === 'plan') {
    return (
      <SafeAreaView style={styles.container}>
        <PlanSettingsForm onClose={handleCloseSubView} />
      </SafeAreaView>
    );
  }

  if (currentView === 'notifications') {
    return (
      <SafeAreaView style={styles.container}>
        <NotificationSettings onClose={handleCloseSubView} />
      </SafeAreaView>
    );
  }

  if (currentView === 'punishment') {
    return (
      <SafeAreaView style={styles.container}>
        <PunishmentSettings onClose={handleCloseSubView} />
      </SafeAreaView>
    );
  }

  if (currentView === 'rewards') {
    return (
      <SafeAreaView style={styles.container}>
        <RewardsSettings onClose={handleCloseSubView} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quit Plan</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handlePlanSettingsPress}
            disabled={isLoading}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Modify Quit Plan</Text>
              <Text style={styles.settingDescription}>
                Update your quit date, daily targets, and reduction method
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          {quitPlan && (
            <View style={styles.planSummary}>
              <Text style={styles.planSummaryTitle}>Current Plan</Text>
              <View style={styles.planDetail}>
                <Text style={styles.planDetailLabel}>Start Date:</Text>
                <Text style={styles.planDetailValue}>
                  {new Date(quitPlan.startDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.planDetail}>
                <Text style={styles.planDetailLabel}>Quit Date:</Text>
                <Text style={styles.planDetailValue}>
                  {new Date(quitPlan.quitDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.planDetail}>
                <Text style={styles.planDetailLabel}>Daily Amount:</Text>
                <Text style={styles.planDetailValue}>
                  {quitPlan.initialDailyAmount} cigarettes
                </Text>
              </View>
              <View style={styles.planDetail}>
                <Text style={styles.planDetailLabel}>Method:</Text>
                <Text style={styles.planDetailValue}>
                  {quitPlan.reductionMethod === 'gradual' ? 'Gradual Reduction' : 'Cold Turkey'}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setCurrentView('notifications')}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Notification Preferences</Text>
              <Text style={styles.settingDescription}>
                Manage reminders and alerts
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accountability</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setCurrentView('punishment')}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Punishment Settings</Text>
              <Text style={styles.settingDescription}>
                Configure donation amounts for exceeding limits
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setCurrentView('rewards')}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Rewards List</Text>
              <Text style={styles.settingDescription}>
                Customize your personal treats and rewards
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingArrow: {
    fontSize: 24,
    color: '#ccc',
    marginLeft: 12,
  },
  planSummary: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  planSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  planDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  planDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  planDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});