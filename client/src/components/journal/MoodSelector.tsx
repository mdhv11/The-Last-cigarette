import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

const MOODS = [
    { label: 'Happy', emoji: '😊', value: 'happy' },
    { label: 'Neutral', emoji: '😐', value: 'neutral' },
    { label: 'Stressed', emoji: '😫', value: 'stressed' },
    { label: 'Sad', emoji: '😢', value: 'sad' },
    { label: 'Angry', emoji: '😠', value: 'angry' },
    { label: 'Anxious', emoji: '😰', value: 'anxious' },
    { label: 'Excited', emoji: '🤩', value: 'excited' },
    { label: 'Bored', emoji: '🥱', value: 'bored' },
];

interface MoodSelectorProps {
    selectedMood: string;
    onSelect: (mood: string) => void;
}

export const MoodSelector = ({ selectedMood, onSelect }: MoodSelectorProps) => {
    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.title}>How are you feeling?</Text>
            <View style={styles.grid}>
                {MOODS.map((mood) => (
                    <TouchableOpacity
                        key={mood.value}
                        style={[
                            styles.item,
                            selectedMood === mood.value && styles.selectedItem,
                        ]}
                        onPress={() => onSelect(mood.value)}
                    >
                        <Text style={styles.emoji}>{mood.emoji}</Text>
                        <Text variant="labelSmall">{mood.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    title: {
        marginBottom: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    item: {
        width: '23%',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
    },
    selectedItem: {
        backgroundColor: '#e3f2fd',
        borderColor: '#2196f3',
    },
    emoji: {
        fontSize: 24,
        marginBottom: 5,
    },
});
