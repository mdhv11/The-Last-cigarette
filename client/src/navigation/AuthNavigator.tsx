import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthScreen } from '../screens/AuthScreen';
import { PlanSetupScreen } from '../screens/PlanSetupScreen';

export type AuthStackParamList = {
  Auth: undefined;
  PlanSetup: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="PlanSetup" component={PlanSetupScreen} />
    </Stack.Navigator>
  );
};
