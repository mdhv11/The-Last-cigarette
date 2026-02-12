import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';

const QUOTES = [
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it's done.",
    "Don't watch the clock; do what it does. Keep going.",
    "Believe you can and you're halfway there.",
    "Your life is in your hands. No matter where you are now, no matter what has happened in your life, you can begin to consciously choose your thoughts, and you can change your life.",
    "Every cigarette you don't smoke is a victory.",
    "You are stronger than your cravings.",
    "This feeling will pass.",
];

export const MotivationalCard = () => {
    const [quote, setQuote] = useState('');

    useEffect(() => {
        getNewQuote();
    }, []);

    const getNewQuote = () => {
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        setQuote(randomQuote);
    };

    return (
        <Card style={styles.card}>
            <Card.Content>
                <Text variant="titleLarge" style={styles.title}>Stay Strong</Text>
                <Text variant="bodyLarge" style={styles.quote}>"{quote}"</Text>
            </Card.Content>
            <Card.Actions>
                <Button onPress={getNewQuote}>New Quote</Button>
            </Card.Actions>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 20,
        backgroundColor: '#fff3e0', // Light Orange
    },
    title: {
        marginBottom: 10,
        textAlign: 'center',
        color: '#e65100',
    },
    quote: {
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
