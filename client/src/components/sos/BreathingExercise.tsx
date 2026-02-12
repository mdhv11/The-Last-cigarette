import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text, Button, MD3Colors } from 'react-native-paper';

export const BreathingExercise = () => {
    const [phase, setPhase] = useState('Inhale');
    const [timeLeft, setTimeLeft] = useState(0);
    const [phaseColor, setPhaseColor] = useState(MD3Colors.primary50);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // We use a ref to track active state immediately inside loops, 
    // as state updates might be stale in closures
    const isActiveRef = useRef(false);
    const [isActive, setIsActive] = useState(false);

    const startBreathing = () => {
        setIsActive(true);
        isActiveRef.current = true;
        runCycle();
    };

    const stopBreathing = () => {
        setIsActive(false);
        isActiveRef.current = false;
        scaleAnim.stopAnimation();
        scaleAnim.setValue(1);
        setPhase('Ready');
        setTimeLeft(0);
        setPhaseColor(MD3Colors.primary50);
    };

    const runPhase = (durationSec: number, label: string, scaleTo: number, color: string) => {
        return new Promise<void>((resolve) => {
            if (!isActiveRef.current) return resolve();

            setPhase(label);
            setPhaseColor(color);
            setTimeLeft(durationSec);

            // Start Animation
            Animated.timing(scaleAnim, {
                toValue: scaleTo,
                duration: durationSec * 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start();

            // Countdown Timer
            let remaining = durationSec;
            const interval = setInterval(() => {
                if (!isActiveRef.current) {
                    clearInterval(interval);
                    return resolve();
                }
                remaining -= 1;
                setTimeLeft(remaining);

                if (remaining <= 0) {
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        });
    };

    const runCycle = async () => {
        while (isActiveRef.current) {
            // Inhale (4s) - Blue/Calm
            await runPhase(4, 'Inhale', 2, '#42a5f5');
            if (!isActiveRef.current) break;

            // Hold (7s) - Orange/Focus
            await runPhase(7, 'Hold', 2, '#ffa726');
            if (!isActiveRef.current) break;

            // Exhale (8s) - Green/Relax
            await runPhase(8, 'Exhale', 1, '#66bb6a');
        }
    };

    useEffect(() => {
        return () => stopBreathing();
    }, []);

    return (
        <View style={styles.container}>
            <Text variant="headlineSmall" style={styles.title}>4-7-8 Breathing</Text>

            <View style={styles.circleContainer}>
                <Animated.View
                    style={[
                        styles.circle,
                        {
                            backgroundColor: phaseColor,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <Text style={styles.phaseText}>{phase}</Text>
                    {timeLeft > 0 && <Text style={styles.timerText}>{timeLeft}</Text>}
                </Animated.View>
            </View>

            <Button
                mode="contained"
                onPress={isActive ? stopBreathing : startBreathing}
                style={styles.button}
                buttonColor={isActive ? MD3Colors.error50 : MD3Colors.primary50}
            >
                {isActive ? 'Stop' : 'Start'}
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
    title: {
        marginBottom: 40,
        color: '#333',
    },
    circleContainer: {
        height: 250, // Increased to accommodate scaling
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    circle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    phaseText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    timerText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 5,
    },
    button: {
        width: 120,
        borderRadius: 20,
    },
});
