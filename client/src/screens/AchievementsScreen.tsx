import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchAchievements } from '../store/statsSlice';
import { AchievementCard } from '../components/achievements/AchievementCard';

// Hardcoded list of all possible achievements to show locked ones too
// Ideally this should come from the backend or a shared constants file
const ALL_ACHIEVEMENTS = [
    { id: 'streak_1', type: 'streak', name: 'First Step', description: 'Stay smoke-free for 1 day' },
    { id: 'streak_3', type: 'streak', name: 'Getting Serious', description: 'Stay smoke-free for 3 days' },
    { id: 'streak_7', type: 'streak', name: 'One Week', description: 'Stay smoke-free for 1 week' },
    { id: 'streak_30', type: 'streak', name: 'One Month', description: 'Stay smoke-free for 1 month' },
    { id: 'savings_10', type: 'savings', name: 'Pocket Change', description: 'Save your first ₹10' },
    { id: 'savings_50', type: 'savings', name: 'Dinner on Me', description: 'Save ₹50' },
    { id: 'savings_100', type: 'savings', name: 'Big Saver', description: 'Save ₹100' },
    { id: 'savings_500', type: 'savings', name: 'Investment Grade', description: 'Save ₹500' },
    { id: 'reduction_10', type: 'reduction', name: 'Small Steps', description: 'Reduce smoking by 10%' },
    { id: 'reduction_50', type: 'reduction', name: 'Halfway There', description: 'Reduce smoking by 50%' },
    { id: 'reduction_100', type: 'reduction', name: 'Smoke Free', description: 'Quit smoking completely' },
    { id: 'milestone_log', type: 'milestone', name: 'Tracker', description: 'Log your first cigarette' },
    { id: 'milestone_journal', type: 'milestone', name: 'Reflector', description: 'Create your first journal entry' },
];

export const AchievementsScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { achievements, loading } = useSelector((state: RootState) => state.stats);

    useEffect(() => {
        dispatch(fetchAchievements());
    }, [dispatch]);

    const onRefresh = () => {
        dispatch(fetchAchievements());
    };

    const unlockedMap = new Map(achievements.map(a => [a.name, a]));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>Achievements</Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    {achievements.length} / {ALL_ACHIEVEMENTS.length} Unlocked
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
            >
                {ALL_ACHIEVEMENTS.map((ach) => {
                    const unlocked = unlockedMap.get(ach.name);
                    return (
                        <AchievementCard
                            key={ach.id}
                            name={ach.name}
                            description={ach.description}
                            type={ach.type as any}
                            isUnlocked={!!unlocked}
                            unlockedAt={unlocked?.unlockedAt}
                        />
                    );
                })}
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
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    subtitle: {
        color: '#757575',
        marginTop: 5,
    },
    scrollContent: {
        padding: 16,
    },
});
