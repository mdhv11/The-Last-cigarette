import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';

interface ErrorBannerProps {
    visible: boolean;
    message: string | null;
    onDismiss: () => void;
}

export const ErrorBanner = ({ visible, message, onDismiss }: ErrorBannerProps) => {
    return (
        <Snackbar
            visible={visible}
            onDismiss={onDismiss}
            action={{
                label: 'Dismiss',
                onPress: onDismiss,
            }}
            style={styles.snackbar}
        >
            <Text style={styles.text}>{message || 'An error occurred'}</Text>
        </Snackbar>
    );
};

const styles = StyleSheet.create({
    snackbar: {
        backgroundColor: '#d32f2f',
    },
    text: {
        color: '#fff',
    },
});
