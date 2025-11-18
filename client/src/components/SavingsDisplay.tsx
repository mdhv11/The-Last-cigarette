import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SavingsData {
  totalSaved: number;
  cigarettesSaved: number;
  costPerCigarette: number;
  daysSinceStart: number;
  breakdown: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  projections: {
    nextWeek: number;
    nextMonth: number;
    nextYear: number;
  };
}

interface SavingsDisplayProps {
  data: SavingsData;
}

export const SavingsDisplay: React.FC<SavingsDisplayProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money Saved</Text>
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Saved</Text>
        <Text style={styles.totalAmount}>${data.totalSaved.toFixed(2)}</Text>
        <Text style={styles.cigarettesText}>
          {data.cigarettesSaved} cigarettes not smoked
        </Text>
      </View>

      <View style={styles.breakdownContainer}>
        <Text style={styles.sectionTitle}>Recent Savings</Text>
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownValue}>${data.breakdown.today.toFixed(2)}</Text>
            <Text style={styles.breakdownLabel}>Today</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownValue}>${data.breakdown.thisWeek.toFixed(2)}</Text>
            <Text style={styles.breakdownLabel}>This Week</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownValue}>${data.breakdown.thisMonth.toFixed(2)}</Text>
            <Text style={styles.breakdownLabel}>This Month</Text>
          </View>
        </View>
      </View>

      <View style={styles.projectionsContainer}>
        <Text style={styles.sectionTitle}>Projected Savings</Text>
        <View style={styles.projectionsList}>
          <View style={styles.projectionItem}>
            <Text style={styles.projectionLabel}>Next Week</Text>
            <Text style={styles.projectionValue}>${data.projections.nextWeek.toFixed(2)}</Text>
          </View>
          <View style={styles.projectionItem}>
            <Text style={styles.projectionLabel}>Next Month</Text>
            <Text style={styles.projectionValue}>${data.projections.nextMonth.toFixed(2)}</Text>
          </View>
          <View style={styles.projectionItem}>
            <Text style={styles.projectionLabel}>Next Year</Text>
            <Text style={styles.projectionValue}>${data.projections.nextYear.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 You've been on your quit journey for {data.daysSinceStart} days
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  totalContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  cigarettesText: {
    fontSize: 14,
    color: '#666',
  },
  breakdownContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#666',
  },
  projectionsContainer: {
    marginBottom: 16,
  },
  projectionsList: {
    gap: 8,
  },
  projectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  projectionLabel: {
    fontSize: 14,
    color: '#666',
  },
  projectionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  infoContainer: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
  },
});
