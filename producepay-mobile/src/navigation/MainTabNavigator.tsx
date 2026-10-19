import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeNavigator from './HomeNavigator';
import DeliveriesNavigator from './DeliveriesNavigator';
import PaymentsNavigator from './PaymentsNavigator';
import ProfileNavigator from './ProfileNavigator';
import { colors } from '../theme';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[200]
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Deliveries':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'Payments':
              iconName = focused ? 'cash' : 'cash-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} options={{ title: 'Home' }} />
      <Tab.Screen
        name="Deliveries"
        component={DeliveriesNavigator}
        options={{ title: 'Deliveries' }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsNavigator}
        options={{ title: 'Payments' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}