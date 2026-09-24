import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from './types';
import DashboardScreen from '../screens/DashboardScreen';
import AddMeasureScreen from '../screens/AddMeasureScreen';
import SendAlertScreen from '../screens/SendAlertScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#FFFDF8',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E4DDD0',
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#2C2A26',
          fontSize: 18,
        },
        tabBarActiveTintColor: route.name === 'Alert' ? '#C45C5C' : '#3D8B7A',
        tabBarInactiveTintColor: '#8A847A',
        tabBarStyle: {
          backgroundColor: '#FFFDF8',
          borderTopWidth: 1,
          borderTopColor: '#E4DDD0',
          height: 64 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
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
            color = focused ? '#C45C5C' : '#C45C5C';
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
