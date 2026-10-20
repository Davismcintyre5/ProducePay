import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from '../screens/home/Dashboard';
import Reports from '../screens/home/Reports';
import { colors } from '../theme';
import type { HomeStackParamList } from '../types';

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary[800] },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Back'
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="Reports"
        component={Reports}
        options={{ title: 'Reports' }}
      />
    </Stack.Navigator>
  );
}