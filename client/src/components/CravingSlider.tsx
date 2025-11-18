import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CravingSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

export const CravingSlider: React.FC<CravingSliderProps> = ({ value, onValueChange }) => {
  const getIntensityLabel = (intensity: number): string => {
    if (intensity <= 2) return 'Very Low';
    if (intensity <= 4) return 'Low';
    if (intensity <= 6) return 'Moderate';
    if (intensity <= 8) return 'High';
    return 'Very High';
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity <= 3) return '#4CAF50';
    if (intensity <= 6) return '#FFA726';
    return '#FF6B6B';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Craving Intensity</Text>
        <View style={[styles.valueBadge, { backgroundColor: getIntensityColor(value) }]}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      </View>
      
      <View style={styles.scaleContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.scaleButton,
              value === num && styles.scaleButtonActive,
              value === num && { backgroundColor: getIntensityColor(value) },
            ]}
            onPress={() => onValueChange(num)}
          >
            <Text
              style={[
                styles.scaleButtonText,
                value === num && styles.scaleButtonTextActive,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.labelsContainer}>
        <Text style={styles.scaleLabel}>1 (Low)</Text>
        <Text style={[styles.intensityLabel, { color: getIntensityColor(value) }]}>
          {getIntensityLabel(value)}
        </Text>
        <Text style={styles.scaleLabel}>10 (High)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  valueBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  scaleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scaleButtonActive: {
    borderColor: 'transparent',
  },
  scaleButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  scaleButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  scaleLabel: {
    fontSize: 12,
    color: '#999',
  },
  intensityLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
