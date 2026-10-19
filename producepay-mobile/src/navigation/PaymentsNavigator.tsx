import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PaymentList from '../screens/payments/PaymentList';
import PaymentDetail from '../screens/payments/PaymentDetail';
import { colors } from '../theme';
import type { PaymentsStackParamList } from '../types';

const Stack = createStackNavigator<PaymentsStackParamList>();

export default function PaymentsNavigator() {
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
        name="PaymentList"
        component={PaymentList}
        options={{ title: 'Payments' }}
      />
      <Stack.Screen
        name="PaymentDetail"
        component={PaymentDetail}
        options={{ title: 'Payment' }}
      />
    </Stack.Navigator>
  );
}