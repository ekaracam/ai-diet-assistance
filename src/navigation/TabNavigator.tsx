/**
 * Bottom Tab Navigator — Dark Theme
 * Sıralama: Dashboard → AI Asistan → Profil
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Bot, User } from 'lucide-react-native';
import { View } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import AIChatScreen from '../screens/AIChatScreen';
import DietPlanScreen from '../screens/DietPlanScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Calendar } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00FF87',
        tabBarInactiveTintColor: '#484F58',
        tabBarStyle: {
          backgroundColor: '#0D1117',
          borderTopColor: 'rgba(255, 255, 255, 0.06)',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 72,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Tablo',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              padding: 4,
              borderRadius: 8,
              backgroundColor: color === '#00FF87' ? 'rgba(0, 255, 135, 0.1)' : 'transparent',
            }}>
              <LayoutDashboard color={color} size={size - 2} strokeWidth={color === '#00FF87' ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          tabBarLabel: 'AI Asistan',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              padding: 4,
              borderRadius: 8,
              backgroundColor: color === '#00FF87' ? 'rgba(0, 255, 135, 0.1)' : 'transparent',
            }}>
              <Bot color={color} size={size - 2} strokeWidth={color === '#00FF87' ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="DietPlan"
        component={DietPlanScreen}
        options={{
          tabBarLabel: 'Programım',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              padding: 4,
              borderRadius: 8,
              backgroundColor: color === '#00FF87' ? 'rgba(0, 255, 135, 0.1)' : 'transparent',
            }}>
              <Calendar color={color} size={size - 2} strokeWidth={color === '#00FF87' ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              padding: 4,
              borderRadius: 8,
              backgroundColor: color === '#00FF87' ? 'rgba(0, 255, 135, 0.1)' : 'transparent',
            }}>
              <User color={color} size={size - 2} strokeWidth={color === '#00FF87' ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
