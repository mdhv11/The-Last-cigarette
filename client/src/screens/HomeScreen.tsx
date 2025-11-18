import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { QuickLogButton } from '../components/QuickLogButton';
import { ConsumptionTracker } from '../components/ConsumptionTracker';
import { CravingSOS } from '../components/CravingSOS';
import { AchievementBadge } from '../components/AchievementBadge';
import { AchievementNotification } from '../components/AchievementNotification';
import { PunishmentReminder } from '../components/PunishmentReminder';
import {
  fetchAchievements,
  checkAchievements,
  checkPunishment,
  dismissPunishment,
  Achievement,
} from '../store/achievementsSlice';
import { sendAchievementNotification } from '../store/notificationSlice';

export const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [sosVisible, setSOSVisible] = useState(false);
  const [achievementNotificationVisible, setAchievementNotificationVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [punishmentVisible, setPunishmentVisible] = useState(false);

  const { todayStats } = useAppSelector((state) => state.cigLog);
  const { data: savingsData } = useAppSelector((state) => state.stats.savings);
  const { earned, recentAchievements, punishmentStatus } = useAppSelector(
    (state) => state.achievements
  );

  // Fetch achievements on mount
  useEffect(() => {
    dispatch(fetchAchievements());
  }, [dispatch]);

  // Check for new achievements after logging
  useEffect(() => {
    if (todayStats) {
      dispatch(checkAchievements()).then((result: any) => {
        if (result.payload?.newAchievements?.length > 0) {
          const newAchievement = result.payload.newAchievements[0];
          setCurrentAchievement(newAchievement);
          setAchievementNotificationVisible(true);
          
          // Send push notification for achievement
          dispatch(sendAchievementNotification({
            name: newAchievement.title,
            description: newAchievement.description,
          }));
        }
      });
      dispatch(checkPunishment());
    }
  }, [todayStats, dispatch]);

  // Show punishment reminder if triggered
  useEffect(() => {
    if (punishmentStatus?.triggered && !punishmentVisible) {
      setPunishmentVisible(true);
    }
  }, [punishmentStatus]);

  const handleLogComplete = () => {
    // Refresh data is handled automatically by the ConsumptionTracker
    console.log('Cigarettes logged successfully');
    // Check for new achievements
    dispatch(checkAchievements());
    dispatch(checkPunishment());
  };

  const handleDismissPunishment = () => {
    setPunishmentVisible(false);
    dispatch(dismissPunishment());
  };

  // Calculate user progress for SOS
  const userProgress = {
    daysSinceStart: savingsData?.daysSinceStart,
    moneySaved: savingsData?.totalSaved,
    cigarettesAvoided: savingsData?.cigarettesSaved,
  };

  // Get top 3 recent achievements to display
  const topAchievements = earned.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Quit Journey</Text>
          <Text style={styles.subtitle}>Track your progress day by day</Text>
        </View>

        <ConsumptionTracker />

        {topAchievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsList}
            >
              {topAchievements.map((achievement: Achievement) => (
                <AchievementBadge
                  key={achievement.type}
                  icon={achievement.icon}
                  title={achievement.title}
                  size="medium"
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.actionContainer}>
          <QuickLogButton onLogComplete={handleLogComplete} />
          
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => setSOSVisible(true)}
          >
            <Text style={styles.sosButtonIcon}>🆘</Text>
            <Text style={styles.sosButtonText}>Need Help with Cravings?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CravingSOS
        visible={sosVisible}
        onClose={() => setSOSVisible(false)}
        userProgress={userProgress}
      />

      <AchievementNotification
        achievement={currentAchievement}
        visible={achievementNotificationVisible}
        onClose={() => {
          setAchievementNotificationVisible(false);
          setCurrentAchievement(null);
        }}
      />

      <PunishmentReminder
        punishment={punishmentStatus}
        visible={punishmentVisible}
        onDismiss={handleDismissPunishment}
      />
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actionContainer: {
    marginTop: 24,
  },
  sosButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sosButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  achievementsSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  achievementsList: {
    paddingRight: 20,
    gap: 12,
  },
});