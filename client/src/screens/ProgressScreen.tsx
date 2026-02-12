import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProgressStats, fetchSavingsStats } from '../store/statsSlice';
import { AppDispatch, RootState } from '../store/store';
import { ConsumptionChart } from '../components/progress/ConsumptionChart';

export const ProgressScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { savings } = useSelector((state: RootState) => state.stats);

    useEffect(() => {
        dispatch(fetchProgressStats());
        dispatch(fetchSavingsStats());
    }, [dispatch]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text variant="headlineMedium" style={styles.header}>Your Progress</Text>

            {savings && (
                <View style={styles.savingsContainer}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium">Total Saved</Text>
                            <Text variant="displayMedium" style={styles.amount}>₹{savings.totalMoneySaved.toFixed(2)}</Text>
                        </Card.Content>
                    </Card>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium">Cigarettes Avoided</Text>
                            <Text variant="displayMedium" style={styles.amount}>{savings.totalNotSmoked}</Text>
                        </Card.Content>
                    </Card>
                </View>
            )}

            <ConsumptionChart />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    savingsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    card: {
        width: '48%',
    },
    amount: {
        color: '#4caf50',
        fontWeight: 'bold',
    },
});
