import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type MoodType = 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy';

interface MoodOption {
  value: MoodType;
  emoji: string;
  label: string;
}

const moodOptions: MoodOption[] = [
  { value: 'very_sad', emoji: '😢', label: 'Very Sad' },
  { value: 'sad', emoji: '😔', label: 'Sad' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'very_happy', emoji: '😄', label: 'Very Happy' },
];

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelectMood }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How are you feeling?</Text>
      <View style={styles.moodGrid}>
        {moodOptions.map((mood) => (
          <TouchableOpacity
            key={mood.value}
            style={[
              styles.moodButton,
              selectedMood === mood.value && styles.moodButtonSelected,
            ]}
            onPress={() => onSelectMood(mood.value)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[
              styles.moodLabel,
              selectedMood === mood.value && styles.moodLabelSelected,
            ]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 70,
  },
  moodButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
  },
  moodLabelSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
});
