import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Slider from '@react-native-community/slider';

interface CravingSliderProps {
    value: number;
    onValueChange: (value: number) => void;
}

export const CravingSlider = ({ value, onValueChange }: CravingSliderProps) => {
    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.title}>Craving Intensity: {value}</Text>
            <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={value}
                onValueChange={onValueChange}
                minimumTrackTintColor="#e74c3c"
                maximumTrackTintColor="#000000"
                thumbTintColor="#e74c3c"
            />
            <View style={styles.labels}>
                <Text variant="labelSmall">Low</Text>
                <Text variant="labelSmall">High</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    title: {
        marginBottom: 5,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
});
