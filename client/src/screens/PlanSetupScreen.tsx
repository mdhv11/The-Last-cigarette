import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setupPlan, updatePlan, fetchPlan } from '../store/planSlice';
import { fetchDashboardStats, fetchSavingsStats } from '../store/statsSlice';
import { AppDispatch, RootState } from '../store/store';
import { useNavigation, useRoute } from '@react-navigation/native';

export const PlanSetupScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { plan, isLoading, error } = useSelector((state: RootState) => state.plan);
    const isEditing = route.params?.isEditing;

    const [initialDailyAverage, setInitialDailyAverage] = useState('');
    const [dailyThreshold, setDailyThreshold] = useState('');
    const [daysToQuit, setDaysToQuit] = useState('30');
    const [cigaretteCost, setCigaretteCost] = useState('');

    useEffect(() => {
        if (isEditing && plan) {
            setInitialDailyAverage(plan.initialDailyAverage?.toString() || '');
            if (plan.dailyThreshold) setDailyThreshold(plan.dailyThreshold.toString());
            if (plan.cigaretteCost) setCigaretteCost(plan.cigaretteCost.toString());

            // Calculate days remaining/total from dates if needed
            if (plan.startDate && plan.targetQuitDate) {
                const start = new Date(plan.startDate);
                const target = new Date(plan.targetQuitDate);
                // Check if dates are valid
                if (!isNaN(start.getTime()) && !isNaN(target.getTime())) {
                    const diffTime = Math.abs(target.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setDaysToQuit(diffDays.toString());
                }
            }
        }
    }, [isEditing, plan]);

    const handleSave = async () => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + parseInt(daysToQuit));

        const planData = {
            initialDailyAverage: parseInt(initialDailyAverage),
            targetQuitDate: targetDate.toISOString(),
            dailyThreshold: dailyThreshold ? parseInt(dailyThreshold) : undefined,
            cigaretteCost: parseFloat(cigaretteCost) || 0,
        };

        if (isEditing) {
            const resultAction = await dispatch(updatePlan(planData));
            if (updatePlan.fulfilled.match(resultAction)) {
                await dispatch(fetchPlan());
                await dispatch(fetchDashboardStats());
                await dispatch(fetchSavingsStats());
                navigation.goBack();
            }
        } else {
            const resultAction = await dispatch(setupPlan(planData));
            if (setupPlan.fulfilled.match(resultAction)) {
                await dispatch(fetchPlan());
                await dispatch(fetchDashboardStats());
                await dispatch(fetchSavingsStats());
                // Navigation handled by RootNavigator
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>
                {isEditing ? 'Update Your Plan' : 'Create Your Quit Plan'}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                {isEditing ? 'Adjust your goals and limits.' : "Let's tailor a plan that works for you."}
            </Text>

            <Text variant="titleMedium" style={styles.question}>
                How many cigarettes do you smoke per day currently?
            </Text>
            <TextInput
                label="Daily Cigarettes (Average)"
                value={initialDailyAverage}
                onChangeText={setInitialDailyAverage}
                keyboardType="numeric"
                style={styles.input}
            />

            <Text variant="titleMedium" style={styles.question}>
                In how many days do you want to be smoke-free?
            </Text>
            <TextInput
                label="Days to Quit"
                value={daysToQuit}
                onChangeText={setDaysToQuit}
                keyboardType="numeric"
                style={styles.input}
            />

            <Text variant="titleMedium" style={styles.question}>
                Daily Warning Threshold (Optional)
            </Text>
            <TextInput
                label="Warn me at..."
                value={dailyThreshold}
                onChangeText={setDailyThreshold}
                keyboardType="numeric"
                style={styles.input}
                placeholder="e.g. 8 (lower than average)"
            />

            <Text variant="titleMedium" style={styles.question}>
                Cost per Cigarette (Optional)
            </Text>
            <TextInput
                label="Cost"
                value={cigaretteCost}
                onChangeText={setCigaretteCost}
                keyboardType="numeric"
                style={styles.input}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
                mode="contained"
                onPress={handleSave}
                loading={isLoading}
                disabled={isLoading || !initialDailyAverage}
                style={styles.button}
            >
                {isEditing ? 'Save Changes' : 'Create Plan'}
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
    },
    input: {
        marginBottom: 5,
    },
    button: {
        marginTop: 20,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
    question: {
        marginBottom: 10,
        marginTop: 10,
    },
});
