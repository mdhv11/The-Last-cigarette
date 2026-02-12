import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Switch, Button, Divider, TextInput, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { logout } from '../store/authSlice';
import { useNavigation } from '@react-navigation/native';
import { notificationService } from '../services/notificationService';

export const SettingsScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<any>();
    const { user } = useSelector((state: RootState) => state.auth);
    const theme = useTheme();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [cravingSupportEnabled, setCravingSupportEnabled] = useState(true);
    const [donationAmount, setDonationAmount] = useState('5.00');
    const [treatWishlist, setTreatWishlist] = useState('');

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: () => dispatch(logout()) }
            ]
        );
    };

    const handleEditPlan = () => {
        navigation.navigate('PlanSetup', { isEditing: true });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>Settings</Text>
            </View>

            <List.Section>
                <List.Subheader>Account</List.Subheader>
                <List.Item
                    title={user?.name || 'User'}
                    description={user?.email}
                    left={props => <List.Icon {...props} icon="account" />}
                />
                <View style={styles.buttonContainer}>
                    <Button mode="outlined" onPress={handleLogout} textColor={theme.colors.error}>
                        Logout
                    </Button>
                </View>
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader>Quit Plan</List.Subheader>
                <List.Item
                    title="Edit Plan"
                    description="Adjust your quit date and limits"
                    left={props => <List.Icon {...props} icon="calendar-edit" />}
                    onPress={handleEditPlan}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                />
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader>Notifications</List.Subheader>
                <List.Item
                    title="Daily Reminders"
                    description="Remind me to log and check progress"
                    left={props => <List.Icon {...props} icon="bell" />}
                    right={() => (
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={async (value) => {
                                setNotificationsEnabled(value);
                                if (value) {
                                    await notificationService.registerForPushNotificationsAsync();
                                    await notificationService.scheduleDailyReminder();
                                } else {
                                    await notificationService.cancelAllNotifications();
                                }
                            }}
                        />
                    )}
                />
                <List.Item
                    title="Craving Support"
                    description="Periodic check-ins during high risk times"
                    left={props => <List.Icon {...props} icon="heart-pulse" />}
                    right={() => (
                        <Switch
                            value={cravingSupportEnabled}
                            onValueChange={async (value) => {
                                setCravingSupportEnabled(value);
                                if (value) {
                                    await notificationService.registerForPushNotificationsAsync();
                                    await notificationService.scheduleCravingSupport();
                                } else {
                                    // Note: This cancels ALL notifications, might want more granular control in future
                                    if (!notificationsEnabled) {
                                        await notificationService.cancelAllNotifications();
                                    }
                                }
                            }}
                        />
                    )}
                />
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader>Punishments & Rewards</List.Subheader>
                <View style={styles.inputContainer}>
                    <Text variant="bodyMedium" style={styles.label}>Donation per cigarette over limit (₹)</Text>
                    <TextInput
                        mode="outlined"
                        value={donationAmount}
                        onChangeText={setDonationAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        dense
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text variant="bodyMedium" style={styles.label}>Treat Wishlist</Text>
                    <TextInput
                        mode="outlined"
                        value={treatWishlist}
                        onChangeText={setTreatWishlist}
                        placeholder="e.g. New Headphones, Spa Day"
                        style={styles.input}
                        dense
                    />
                </View>
            </List.Section>

            <View style={styles.footer}>
                <Text variant="bodySmall" style={styles.version}>Version 1.0.0</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        paddingBottom: 0,
    },
    title: {
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    buttonContainer: {
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    inputContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        color: '#666',
    },
    input: {
        backgroundColor: '#fff',
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    version: {
        color: '#999',
    },
});
