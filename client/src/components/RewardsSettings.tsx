import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

interface Reward {
  id: string;
  name: string;
  cost: number;
  milestone: string;
}

interface RewardsSettingsProps {
  onClose: () => void;
}

export const RewardsSettings: React.FC<RewardsSettingsProps> = ({ onClose }) => {
  const [rewards, setRewards] = useState<Reward[]>([
    { id: '1', name: 'Nice dinner out', cost: 50, milestone: '1 week smoke-free' },
    { id: '2', name: 'New book or game', cost: 30, milestone: '2 weeks smoke-free' },
    { id: '3', name: 'Spa day', cost: 100, milestone: '1 month smoke-free' },
  ]);
  const [newReward, setNewReward] = useState({ name: '', cost: '', milestone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; cost?: string; milestone?: string }>({});

  const handleAddReward = () => {
    const newErrors: { name?: string; cost?: string; milestone?: string } = {};

    if (!newReward.name.trim()) {
      newErrors.name = 'Please enter a reward name';
    }
    if (!newReward.cost || parseFloat(newReward.cost) <= 0) {
      newErrors.cost = 'Please enter a valid cost';
    }
    if (!newReward.milestone.trim()) {
      newErrors.milestone = 'Please enter a milestone';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const reward: Reward = {
      id: Date.now().toString(),
      name: newReward.name.trim(),
      cost: parseFloat(newReward.cost),
      milestone: newReward.milestone.trim(),
    };

    setRewards(prev => [...prev, reward]);
    setNewReward({ name: '', cost: '', milestone: '' });
    setErrors({});
    setHasChanges(true);
  };

  const handleDeleteReward = (id: string) => {
    Alert.alert(
      'Delete Reward',
      'Are you sure you want to delete this reward?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setRewards(prev => prev.filter(r => r.id !== id));
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call - in real implementation, save to backend
    setTimeout(() => {
      setIsLoading(false);
      setHasChanges(false);
      Alert.alert(
        'Success',
        'Rewards list saved successfully!',
        [{ text: 'OK', onPress: onClose }]
      );
    }, 500);
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose }
        ]
      );
    } else {
      onClose();
    }
  };

  const totalRewardsCost = rewards.reduce((sum, reward) => sum + reward.cost, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Rewards List</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🎁 Reward Yourself!</Text>
          <Text style={styles.infoText}>
            Create a list of treats to reward yourself when you hit milestones. You deserve it!
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Rewards:</Text>
            <Text style={styles.summaryValue}>{rewards.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Value:</Text>
            <Text style={styles.summaryValue}>${totalRewardsCost.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Reward</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Reward Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={newReward.name}
              onChangeText={(value) => {
                setNewReward(prev => ({ ...prev, name: value }));
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g., Nice dinner, New shoes, Weekend trip"
            />
            {errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Estimated Cost ($)</Text>
            <TextInput
              style={[styles.input, errors.cost && styles.inputError]}
              value={newReward.cost}
              onChangeText={(value) => {
                setNewReward(prev => ({ ...prev, cost: value }));
                if (errors.cost) setErrors(prev => ({ ...prev, cost: undefined }));
              }}
              keyboardType="numeric"
              placeholder="50"
            />
            {errors.cost && <Text style={styles.fieldError}>{errors.cost}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Milestone</Text>
            <TextInput
              style={[styles.input, errors.milestone && styles.inputError]}
              value={newReward.milestone}
              onChangeText={(value) => {
                setNewReward(prev => ({ ...prev, milestone: value }));
                if (errors.milestone) setErrors(prev => ({ ...prev, milestone: undefined }));
              }}
              placeholder="e.g., 1 week smoke-free, 1 month smoke-free"
            />
            {errors.milestone && <Text style={styles.fieldError}>{errors.milestone}</Text>}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddReward}>
            <Text style={styles.addButtonText}>+ Add Reward</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rewards ({rewards.length})</Text>
          
          {rewards.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No rewards yet</Text>
              <Text style={styles.emptySubtext}>Add your first reward above!</Text>
            </View>
          ) : (
            rewards.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteReward(reward.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.rewardDetails}>
                  <Text style={styles.rewardCost}>${reward.cost.toFixed(2)}</Text>
                  <Text style={styles.rewardMilestone}>🎯 {reward.milestone}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.suggestionsBox}>
          <Text style={styles.suggestionsTitle}>💡 Reward Ideas:</Text>
          <Text style={styles.suggestionItem}>• Treat yourself to a nice meal</Text>
          <Text style={styles.suggestionItem}>• Buy something you've been wanting</Text>
          <Text style={styles.suggestionItem}>• Plan a weekend getaway</Text>
          <Text style={styles.suggestionItem}>• Get a massage or spa treatment</Text>
          <Text style={styles.suggestionItem}>• Upgrade your hobby equipment</Text>
          <Text style={styles.suggestionItem}>• Take a class you're interested in</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#EF6C00',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#f44336',
  },
  fieldError: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  rewardCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#f44336',
  },
  rewardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardCost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  rewardMilestone: {
    fontSize: 14,
    color: '#666',
  },
  suggestionsBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  suggestionItem: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 4,
  },
});
