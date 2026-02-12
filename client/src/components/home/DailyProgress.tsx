import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar, MD3Colors } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export const DailyProgress = () => {
    const { todayCount } = useSelector((state: RootState) => state.cigs);
    const { plan, todayTarget } = useSelector((state: RootState) => state.plan);
    const dailyThreshold = plan?.dailyThreshold;

    const target = (todayTarget === null || isNaN(todayTarget)) ? 1 : todayTarget;
    const progress = target > 0 ? todayCount / target : 1;
    const remaining = Math.max(0, target - todayCount);

    let color = MD3Colors.primary50;
    if (progress > 1) color = MD3Colors.error50; // Over limit
    else if (dailyThreshold && todayCount >= dailyThreshold) color = MD3Colors.error50; // Over threshold (warning/danger)
    else if (progress > 0.8) color = MD3Colors.tertiary50;

    // Calculate threshold position percentage
    const thresholdPosition = dailyThreshold && target > 0 ? (dailyThreshold / target) : null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="titleMedium">Daily Progress</Text>
                <Text variant="titleMedium" style={{ color: remaining === 0 ? 'red' : 'black' }}>
                    {remaining} Left
                </Text>
            </View>

            <View>
                <ProgressBar progress={Math.min(1, progress)} color={color} style={styles.progressBar} />
                {thresholdPosition !== null && thresholdPosition <= 1 && (
                    <View
                        style={[
                            styles.thresholdMarker,
                            { left: `${thresholdPosition * 100}%` }
                        ]}
                    />
                )}
            </View>

            <View style={styles.stats}>
                <Text>Smoked: {todayCount}</Text>
                <Text>Limit: {todayTarget}</Text>
            </View>
            {dailyThreshold && (
                <Text variant="bodySmall" style={styles.thresholdText}>
                    Threshold: {dailyThreshold}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginVertical: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    thresholdMarker: {
        position: 'absolute',
        top: -2,
        bottom: -2,
        width: 2,
        backgroundColor: 'orange',
        zIndex: 1,
    },
    thresholdText: {
        marginTop: 5,
        color: 'orange',
        textAlign: 'center',
    },
});
