import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { JournalEntryForm } from '../components/journal/JournalEntryForm';
import { JournalHistory } from '../components/journal/JournalHistory';

export const JournalScreen = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text variant="headlineMedium" style={styles.header}>Journal</Text>
            <JournalEntryForm />
            <JournalHistory />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
});
