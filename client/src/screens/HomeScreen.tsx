import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { fetchTodayCount } from '../store/cigSlice';
import { fetchPlan } from '../store/planSlice';
import { fetchDashboardStats } from '../store/statsSlice';
import { AppDispatch, RootState } from '../store/store';
import { QuickLogButton } from '../components/home/QuickLogButton';
import { DailyProgress } from '../components/home/DailyProgress';
import { MoneySavedCard } from '../components/home/MoneySavedCard';
import { HealthTipCard } from '../components/home/HealthTipCard';

export const HomeScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(fetchTodayCount());
        dispatch(fetchPlan());
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium">Hi, {user?.name}</Text>
                <Text variant="bodyLarge">Stay strong today!</Text>
            </View>

            <DailyProgress />
            <QuickLogButton />
            <MoneySavedCard />
            <HealthTipCard />

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    header: {
        width: '100%',
        marginBottom: 20,
        marginTop: 40,
    },
    logoutButton: {
        marginTop: 'auto',
        marginBottom: 20,
    },
});
