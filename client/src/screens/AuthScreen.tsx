import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';

export const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text variant="headlineLarge" style={styles.title}>
                    TheLastCigarette
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    {isLogin ? 'Welcome Back' : 'Start Your Journey'}
                </Text>

                {isLogin ? <LoginForm /> : <SignupForm />}

                <Button
                    mode="text"
                    onPress={() => setIsLogin(!isLogin)}
                    style={styles.switchButton}
                >
                    {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
    },
    switchButton: {
        marginTop: 20,
    },
});
