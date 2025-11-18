import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useAppDispatch } from '../store';
import { sendCravingSupportNotification } from '../store/notificationSlice';
import { BreathingExercise } from './BreathingExercise';
import { DelayTimer } from './DelayTimer';

interface CravingSOSProps {
  visible: boolean;
  onClose: () => void;
  userProgress?: {
    daysSinceStart?: number;
    moneySaved?: number;
    cigarettesAvoided?: number;
  };
}

type SOSView = 'main' | 'breathing' | 'timer';

export const CravingSOS: React.FC<CravingSOSProps> = ({
  visible,
  onClose,
  userProgress,
}) => {
  const dispatch = useAppDispatch();
  const [currentView, setCurrentView] = useState<SOSView>('main');

  const motivationalQuotes = [
    "You are stronger than your cravings.",
    "Every craving you resist makes you stronger.",
    "This feeling will pass. You've got this!",
    "Think about why you started this journey.",
    "You've come too far to give up now.",
    "Your health is worth more than a cigarette.",
    "Breathe through it. You can do this.",
    "One craving at a time. You're doing great!",
  ];

  const getRandomQuote = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };

  const [currentQuote] = useState(getRandomQuote());

  // Send craving support notification when SOS is opened
  useEffect(() => {
    if (visible) {
      dispatch(sendCravingSupportNotification());
    }
  }, [visible, dispatch]);

  const handleClose = () => {
    setCurrentView('main');
    onClose();
  };

  const renderMainView = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>🆘 Craving Support</Text>
        <Text style={styles.subtitle}>You can get through this!</Text>
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>"{currentQuote}"</Text>
      </View>

      {userProgress && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Remember Your Progress:</Text>
          {userProgress.daysSinceStart !== undefined && (
            <Text style={styles.progressItem}>
              ✨ {userProgress.daysSinceStart} days on your journey
            </Text>
          )}
          {userProgress.moneySaved !== undefined && (
            <Text style={styles.progressItem}>
              💰 ${userProgress.moneySaved.toFixed(2)} saved
            </Text>
          )}
          {userProgress.cigarettesAvoided !== undefined && (
            <Text style={styles.progressItem}>
              🚭 {userProgress.cigarettesAvoided} cigarettes avoided
            </Text>
          )}
        </View>
      )}

      <View style={styles.toolsSection}>
        <Text style={styles.sectionTitle}>Choose a Support Tool:</Text>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => setCurrentView('breathing')}
        >
          <Text style={styles.toolIcon}>🧘</Text>
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>Breathing Exercise</Text>
            <Text style={styles.toolDescription}>
              Calm your mind with guided breathing
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => setCurrentView('timer')}
        >
          <Text style={styles.toolIcon}>⏱️</Text>
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>10-Minute Delay</Text>
            <Text style={styles.toolDescription}>
              Wait it out - cravings pass quickly
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Quick Tips:</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>💧 Drink a glass of water</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>🚶 Take a short walk</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>📞 Call a supportive friend</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>🍎 Eat a healthy snack</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>🎵 Listen to your favorite music</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={styles.closeButtonText}>I'm Feeling Better</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderBreathingView = () => (
    <View style={styles.fullView}>
      <BreathingExercise
        onComplete={() => {
          setCurrentView('main');
        }}
      />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentView('main')}
      >
        <Text style={styles.backButtonText}>← Back to SOS</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimerView = () => (
    <View style={styles.fullView}>
      <DelayTimer
        defaultMinutes={10}
        onComplete={() => {
          setCurrentView('main');
        }}
        onCancel={() => setCurrentView('main')}
      />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentView('main')}
      >
        <Text style={styles.backButtonText}>← Back to SOS</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {currentView === 'main' && renderMainView()}
        {currentView === 'breathing' && renderBreathingView()}
        {currentView === 'timer' && renderTimerView()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  fullView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  quoteCard: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  quoteText: {
    fontSize: 18,
    color: '#2E7D32',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
  },
  progressCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  progressItem: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 24,
  },
  toolsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  toolButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: '#666',
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
