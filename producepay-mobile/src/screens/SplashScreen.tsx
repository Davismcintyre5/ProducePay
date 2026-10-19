import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.emoji}>🌽</Text>
      </View>
      <Text style={styles.title}>ProducePay</Text>
      <Text style={styles.tagline}>MOIBEN Maize Management</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[800],
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emoji: {
    fontSize: 64
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white
  },
  tagline: {
    fontSize: 14,
    color: colors.primary[200],
    marginTop: 8
  }
});