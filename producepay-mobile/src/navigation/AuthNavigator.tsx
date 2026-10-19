import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/auth/Login';
import { colors } from '../theme';
import type { AuthStackParamList } from '../types';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: true,
          title: 'Sign In',
          headerStyle: { backgroundColor: colors.primary[800] },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '600' }
        }}
      />
    </Stack.Navigator>
  );
}