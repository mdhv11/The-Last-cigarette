import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export const MoneySavedCard = () => {
    const { dashboard } = useSelector((state: RootState) => state.stats);

    if (!dashboard) return null;

    return (
        <Card style={styles.card}>
            <Card.Content>
                <Text variant="titleMedium">Money Saved Today</Text>
                <Text variant="displaySmall" style={[
                    styles.amount,
                    (dashboard?.moneySavedToday || 0) < 0 && styles.negativeAmount
                ]}>
                    ₹{(dashboard?.moneySavedToday || 0).toFixed(2)}
                </Text>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        marginVertical: 10,
        backgroundColor: '#e8f5e9', // Light green
    },
    amount: {
        color: '#2e7d32', // Dark green
        fontWeight: 'bold',
        marginTop: 5,
    },
    negativeAmount: {
        color: '#e74c3c', // Red for positive cost (negative savings)
    },
});
