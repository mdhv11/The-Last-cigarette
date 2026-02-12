import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { AuthScreen } from '../screens/AuthScreen';
import { PlanSetupScreen } from '../screens/PlanSetupScreen';
import { SOSScreen } from '../screens/SOSScreen';
import { AppNavigator } from './AppNavigator';
import { RootState, AppDispatch } from '../store/store';
import { fetchPlan } from '../store/planSlice';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { plan, isLoading } = useSelector((state: RootState) => state.plan);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchPlan());
        }
    }, [isAuthenticated, dispatch]);

    if (isAuthenticated && isLoading && !plan) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <Stack.Screen name="Auth" component={AuthScreen} />
            ) : !plan ? (
                <Stack.Screen name="PlanSetup" component={PlanSetupScreen} />
            ) : (
                <>
                    <Stack.Screen name="Main" component={AppNavigator} />
                    <Stack.Screen name="PlanSetup" component={PlanSetupScreen} />
                    <Stack.Screen
                        name="SOS"
                        component={SOSScreen}
                        options={{ presentation: 'modal' }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};
