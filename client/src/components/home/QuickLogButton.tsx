import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logCigarette } from '../../store/cigSlice';
import { fetchDashboardStats } from '../../store/statsSlice';
import { fetchPlan } from '../../store/planSlice';
import { AppDispatch, RootState } from '../../store/store';

export const QuickLogButton = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading } = useSelector((state: RootState) => state.cigs);

    const handleLog = async () => {
        const resultAction = await dispatch(logCigarette({}));
        if (logCigarette.fulfilled.match(resultAction)) {
            dispatch(fetchDashboardStats());
            dispatch(fetchPlan());
        }
    };

    return (
        <View style={styles.container}>
            <Button
                mode="contained"
                onPress={handleLog}
                loading={isLoading}
                disabled={isLoading}
                contentStyle={styles.buttonContent}
                style={styles.button}
                labelStyle={styles.label}
            >
                Smoke One
            </Button>
            <Text variant="bodySmall" style={styles.hint}>
                Tap to log a cigarette instantly
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 20,
    },
    button: {
        borderRadius: 50,
        width: 200,
        height: 200,
        justifyContent: 'center',
        elevation: 5,
        backgroundColor: '#e74c3c', // Red color for danger/action
    },
    buttonContent: {
        height: 200,
    },
    label: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    hint: {
        marginTop: 10,
        color: '#666',
    },
});
