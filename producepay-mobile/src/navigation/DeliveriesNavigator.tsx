import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DeliveryList from '../screens/deliveries/DeliveryList';
import NewDelivery from '../screens/deliveries/NewDelivery';
import DeliveryDetail from '../screens/deliveries/DeliveryDetail';
import { colors } from '../theme';
import type { DeliveriesStackParamList } from '../types';

const Stack = createStackNavigator<DeliveriesStackParamList>();

export default function DeliveriesNavigator() {
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
        name="DeliveryList"
        component={DeliveryList}
        options={{ title: 'Deliveries' }}
      />
      <Stack.Screen
        name="NewDelivery"
        component={NewDelivery}
        options={{ title: 'Record Delivery' }}
      />
      <Stack.Screen
        name="DeliveryDetail"
        component={DeliveryDetail}
        options={{ title: 'Delivery' }}
      />
    </Stack.Navigator>
  );
}