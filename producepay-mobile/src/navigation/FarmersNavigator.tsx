import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FarmerList from '../screens/farmers/FarmerList';
import FarmerDetail from '../screens/farmers/FarmerDetail';
import { colors } from '../theme';
import type { FarmersStackParamList } from '../types';

const Stack = createStackNavigator<FarmersStackParamList>();

export default function FarmersNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary[800] },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Back'
      }}
    >
      <Stack.Screen name="FarmerList" component={FarmerList} options={{ title: 'Farmers' }} />
      <Stack.Screen name="FarmerDetail" component={FarmerDetail} options={{ title: 'Farmer Details' }} />
    </Stack.Navigator>
  );
}