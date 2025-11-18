import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Achievement {
  type: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  earned: boolean;
  progress: number;
  earnedAt?: string;
}

interface AchievementsListProps {
  earned: Achievement[];
  upcoming: Achievement[];
  stats: {
    totalEarned: number;
    totalAvailable: number;
    currentStreak: number;
    moneySaved: number;
  };
}

// Memoized achievement card component
const AchievementCard = memo<{ achievement: Achievement; isEarned: boolean }>(
  ({ achievement, isEarned }) => {
    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
      <View style={styles.achievementCard}>
        <View style={styles.achievementHeader}>
          <Text style={[styles.achievementIcon, !isEarned && styles.lockedIcon]}>
            {achievement.icon}
          </Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
            {isEarned && achievement.earnedAt && (
              <Text style={styles.earnedDate}>
                Earned on {formatDate(achievement.earnedAt)}
              </Text>
            )}
            {!isEarned && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${achievement.progress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{achievement.progress}%</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }
);

AchievementCard.displayName = 'AchievementCard';

export const AchievementsList: React.FC<AchievementsListProps> = memo(({
  earned,
  upcoming,
  stats,
}) => {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Achievements</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalEarned}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>${stats.moneySaved.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>

      {earned.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Earned Achievements</Text>
          {earned.map((achievement) => (
            <AchievementCard
              key={achievement.type}
              achievement={achievement}
              isEarned={true}
            />
          ))}
        </View>
      )}

      {upcoming.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Upcoming Achievements</Text>
          {upcoming.slice(0, 5).map((achievement) => (
            <AchievementCard
              key={achievement.type}
              achievement={achievement}
              isEarned={false}
            />
          ))}
        </View>
      )}

      {earned.length === 0 && upcoming.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Start your quit journey to earn achievements!
          </Text>
        </View>
      )}
    </View>
  );
});

AchievementsList.displayName = 'AchievementsList';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  achievementCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  lockedIcon: {
    opacity: 0.4,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  earnedDate: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
