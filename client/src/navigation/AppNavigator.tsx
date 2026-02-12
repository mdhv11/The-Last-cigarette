import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install if not present, or use another icon set
import { View, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
    const navigation = useNavigation<any>();

    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Dashboard') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'Progress') {
                            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                        } else if (route.name === 'Journal') {
                            iconName = focused ? 'book' : 'book-outline';
                        }

                        // You can return any component that you like here!
                        return <Ionicons name={iconName as any} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#e74c3c',
                    tabBarInactiveTintColor: 'gray',
                    headerShown: false,
                })}
            >
                <Tab.Screen name="Dashboard" component={HomeScreen} />
                <Tab.Screen name="Progress" component={ProgressScreen} />
                <Tab.Screen name="Journal" component={JournalScreen} />
                <Tab.Screen
                    name="Achievements"
                    component={AchievementsScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="trophy-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="settings-outline" size={size} color={color} />
                        ),
                    }}
                />
            </Tab.Navigator>

            <FAB
                icon="alert-circle"
                label="SOS"
                style={styles.fab}
                color="white"
                onPress={() => navigation.navigate('SOS' as any)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 60, // Above tab bar
        backgroundColor: '#e74c3c',
    },
});
