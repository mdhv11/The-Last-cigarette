import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface DelayTimerProps {
  defaultMinutes?: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const DelayTimer: React.FC<DelayTimerProps> = ({
  defaultMinutes = 10,
  onComplete,
  onCancel,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(defaultMinutes * 60);
  const [initialTime] = useState(defaultMinutes * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((initialTime - timeRemaining) / initialTime) * 100;
  };

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeRemaining(initialTime);
  };

  const handleCancel = () => {
    handleReset();
    onCancel?.();
  };

  const getMotivationalMessage = (): string => {
    const percentage = getProgressPercentage();
    if (percentage < 25) {
      return "You've got this! Just a few minutes.";
    } else if (percentage < 50) {
      return "Great job! You're doing amazing!";
    } else if (percentage < 75) {
      return "More than halfway there! Keep going!";
    } else if (percentage < 100) {
      return "Almost done! You're so strong!";
    }
    return "You did it! Craving conquered!";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delay Timer</Text>
      <Text style={styles.subtitle}>
        Wait {defaultMinutes} minutes before smoking
      </Text>

      <View style={styles.timerContainer}>
        <View style={styles.progressRing}>
          <View
            style={[
              styles.progressFill,
              {
                height: `${getProgressPercentage()}%`,
              },
            ]}
          />
        </View>
        <View style={styles.timerContent}>
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {!isActive && timeRemaining === initialTime ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Timer</Text>
          </TouchableOpacity>
        ) : (
          <>
            {isActive ? (
              <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                <Text style={styles.buttonText}>Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.resumeButton} onPress={handleStart}>
                <Text style={styles.buttonText}>Resume</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {timeRemaining === 0 && (
        <View style={styles.completionContainer}>
          <Text style={styles.completionTitle}>🎉 Congratulations!</Text>
          <Text style={styles.completionText}>
            You successfully delayed your craving for {defaultMinutes} minutes!
          </Text>
          <Text style={styles.completionSubtext}>
            Most cravings pass within 10 minutes. You're stronger than you think!
          </Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Why delay works:</Text>
        <Text style={styles.infoText}>
          • Cravings typically peak and pass within 10 minutes
        </Text>
        <Text style={styles.infoText}>
          • Delaying helps break the automatic response
        </Text>
        <Text style={styles.infoText}>
          • Each delay strengthens your willpower
        </Text>
        <Text style={styles.infoText}>
          • You prove to yourself you can resist
        </Text>
      </View>

      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Close</Text>
      </TouchableOpacity>
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
  timerContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  progressFill: {
    width: '100%',
    backgroundColor: '#4CAF50',
  },
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
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
  pauseButton: {
    backgroundColor: '#FFA726',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  resetButton: {
    backgroundColor: '#666',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completionContainer: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  completionText: {
    fontSize: 16,
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  completionSubtext: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
