import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

interface BreathingExerciseProps {
  onComplete?: () => void;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const PHASE_DURATIONS = {
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 2,
  };

  const PHASE_INSTRUCTIONS = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    rest: 'Rest',
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Move to next phase
            const phases: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'rest'];
            const currentIndex = phases.indexOf(phase);
            const nextPhase = phases[(currentIndex + 1) % phases.length];
            
            setPhase(nextPhase);
            
            // Increment cycle count when completing exhale
            if (phase === 'rest') {
              setCyclesCompleted((c) => c + 1);
            }
            
            return PHASE_DURATIONS[nextPhase];
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, phase]);

  useEffect(() => {
    // Animate circle based on phase
    if (phase === 'inhale') {
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: PHASE_DURATIONS.inhale * 1000,
        useNativeDriver: true,
      }).start();
    } else if (phase === 'exhale') {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: PHASE_DURATIONS.exhale * 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [phase]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(PHASE_DURATIONS.inhale);
    setCyclesCompleted(0);
  };

  const handleStop = () => {
    setIsActive(false);
    setPhase('inhale');
    setCountdown(4);
    scaleAnim.setValue(1);
  };

  const handleComplete = () => {
    handleStop();
    onComplete?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Breathing Exercise</Text>
      <Text style={styles.subtitle}>
        Follow the circle and breathe deeply
      </Text>

      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: phase === 'inhale' || phase === 'hold' 
                ? '#4CAF50' 
                : '#2196F3',
            },
          ]}
        >
          <Text style={styles.phaseText}>{PHASE_INSTRUCTIONS[phase]}</Text>
          <Text style={styles.countdownText}>{countdown}</Text>
        </Animated.View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Cycles Completed: {cyclesCompleted}
        </Text>
        <Text style={styles.infoText}>
          Complete 5 cycles for best results
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Exercise</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
            {cyclesCompleted >= 5 && (
              <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                <Text style={styles.buttonText}>Complete</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips:</Text>
        <Text style={styles.tipText}>• Find a comfortable position</Text>
        <Text style={styles.tipText}>• Focus on your breath</Text>
        <Text style={styles.tipText}>• Let go of distracting thoughts</Text>
        <Text style={styles.tipText}>• Breathe through your nose</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  circleContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  phaseText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
