import './global.css';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from '@shared/components/AuthProvider';

import { initializeAuth } from 'firebase/auth';
import { getFirebaseApp, setFirebaseAuth } from '@shared/services/firebaseConfig';

// Init Firebase Auth for React Native
const app = getFirebaseApp();
const auth = initializeAuth(app);
setFirebaseAuth(auth);


/**
 * Web deep-linking konfigürasyonu
 * Her sekme için URL yolu tanımlar
 */
const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Profile: 'profile',
      Dashboard: 'dashboard',
      AIDiet: 'ai-diet',
    },
  },
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <RootNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </AuthProvider>
  );
}
