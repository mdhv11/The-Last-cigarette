import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { LineChart } from 'react-native-chart-kit';

export const ConsumptionChart = () => {
    const { progress } = useSelector((state: RootState) => state.stats);

    if (!progress || progress.length === 0) {
        return <Text>No data available</Text>;
    }

    const labels = progress.map((d: any) => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const smokedData = progress.map((d: any) => d.smoked || 0);
    const targetData = progress.map((d: any) => d.target || 0);

    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.title}>Last 7 Days</Text>
            <LineChart
                data={{
                    labels: labels,
                    datasets: [
                        {
                            data: smokedData,
                            color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`, // Red for smoked
                            strokeWidth: 2
                        },
                        {
                            data: targetData,
                            color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`, // Green for target
                            strokeWidth: 2
                        }
                    ],
                    legend: ["Smoked", "Target"]
                }}
                width={Dimensions.get("window").width - 40}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: 6,
                        strokeWidth: 2,
                        stroke: "#ffa726"
                    }
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 20,
    },
    title: {
        marginBottom: 10,
    },
});
