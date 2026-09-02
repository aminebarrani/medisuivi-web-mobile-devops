import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import DashboardScreen from '../screens/DashboardScreen';
import AddMeasureScreen from '../screens/AddMeasureScreen';
import SendAlertScreen from '../screens/SendAlertScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#091124',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
        },
        headerTitleStyle: {
          fontWeight: '800',
          color: '#F8FAFC',
          fontSize: 18,
          letterSpacing: 0.3,
        },
        tabBarActiveTintColor: route.name === 'Alert' ? '#F43F5E' : '#2DD4BF',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#091124',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'AddMeasure') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Alert') {
            iconName = focused ? 'alert-circle' : 'alert-circle-outline';
            color = focused ? '#F43F5E' : '#FB7185';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Accueil', headerTitle: 'Tableau de Bord Patient' }}
      />
      <Tab.Screen
        name="AddMeasure"
        component={AddMeasureScreen}
        options={{ title: 'Saisie', headerTitle: 'Nouvelle Mesure' }}
      />
      <Tab.Screen
        name="Alert"
        component={SendAlertScreen}
        options={{
          title: 'Alerte SOS',
          headerTitle: 'Alerte Médicale & Urgence',
          tabBarLabel: 'Alerte SOS',
          tabBarActiveTintColor: '#DC2626',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Historique', headerTitle: 'Historique des Relevés' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil', headerTitle: 'Mon Profil Patient' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
