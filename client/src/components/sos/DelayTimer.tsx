import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';

export const DelayTimer = () => {
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(600);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const progress = 1 - timeLeft / 600;

    return (
        <View style={styles.container}>
            <Text variant="headlineSmall" style={styles.title}>Delay the Craving</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                Wait 10 minutes. The urge will pass.
            </Text>

            <Text variant="displayLarge" style={styles.timer}>
                {formatTime(timeLeft)}
            </Text>

            <ProgressBar progress={progress} color="#e74c3c" style={styles.progress} />

            <View style={styles.buttons}>
                <Button mode="contained" onPress={toggleTimer} style={styles.button}>
                    {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button mode="outlined" onPress={resetTimer} style={styles.button}>
                    Reset
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
    title: {
        marginBottom: 10,
    },
    subtitle: {
        marginBottom: 30,
        textAlign: 'center',
        color: '#666',
    },
    timer: {
        marginBottom: 20,
        fontWeight: 'bold',
    },
    progress: {
        width: '100%',
        height: 10,
        borderRadius: 5,
        marginBottom: 30,
    },
    buttons: {
        flexDirection: 'row',
        gap: 20,
    },
    button: {
        width: 100,
    },
});
