import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import CreateArticleScreen from '../screens/CreateArticleScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FollowingScreen from '../screens/FollowingScreen';
import SearchScreen from '../screens/SearchScreen';
import FollowListScreen from '../screens/FollowListScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import { Ionicons } from '@expo/vector-icons';

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Following') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Bookmarks') iconName = focused ? 'bookmark' : 'bookmark-outline';
          else iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#292929',
        tabBarInactiveTintColor: '#757575',
        tabBarShowLabel: false,
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#F2F2F2', height: 60, paddingBottom: 0 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Following" component={FollowingScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} options={{ tabBarLabel: 'Library' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="CreateArticle" component={CreateArticleScreen} options={{ title: 'Write' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="UserProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="FollowList" component={FollowListScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
