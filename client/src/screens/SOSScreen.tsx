import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, SegmentedButtons, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { BreathingExercise } from '../components/sos/BreathingExercise';
import { DelayTimer } from '../components/sos/DelayTimer';
import { MotivationalCard } from '../components/sos/MotivationalCard';

export const SOSScreen = () => {
    const navigation = useNavigation();
    const [view, setView] = useState('breathe'); // breathe, delay, motivate

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>SOS Support</Text>
                <IconButton icon="close" size={30} onPress={() => navigation.goBack()} />
            </View>

            <SegmentedButtons
                value={view}
                onValueChange={setView}
                buttons={[
                    { value: 'breathe', label: 'Breathe' },
                    { value: 'delay', label: 'Delay' },
                    { value: 'motivate', label: 'Motivate' },
                ]}
                style={styles.tabs}
            />

            <ScrollView contentContainerStyle={styles.content}>
                {view === 'breathe' && <BreathingExercise />}
                {view === 'delay' && <DelayTimer />}
                {view === 'motivate' && <MotivationalCard />}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        color: '#e74c3c',
        fontWeight: 'bold',
    },
    tabs: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    content: {
        flexGrow: 1,
    },
});
