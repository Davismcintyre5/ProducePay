import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Profile from '../screens/profile/Profile';
import SyncStatus from '../screens/profile/SyncStatus';
import Settings from '../screens/profile/Settings';
import Users from '../screens/profile/Users';
import { colors } from '../theme';
import type { ProfileStackParamList } from '../types';

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
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
        name="ProfileHome"
        component={Profile}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="SyncStatus"
        component={SyncStatus}
        options={{ title: 'Sync Status' }}
      />
      <Stack.Screen
        name="Users"
        component={Users}
        options={{ title: 'Manage Users' }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}