import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/home/Home';
import { colors } from '../theme';
import type { HomeStackParamList } from '../types';

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary[800] },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' }
      }}
    >
      <Stack.Screen
        name="HomeHome"
        component={Home}
        options={{ title: 'ProducePay' }}
      />
    </Stack.Navigator>
  );
}