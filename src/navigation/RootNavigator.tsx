import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuthStore } from '../store/authStore';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { Merriweather_400Regular, Merriweather_700Bold } from '@expo-google-fonts/merriweather';

const RootNavigator = () => {
  const { user, fetchCurrentUser } = useAuthStore();
  const [initialLoading, setInitialLoading] = React.useState(true);
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Merriweather_400Regular,
    Merriweather_700Bold,
  });

  useEffect(() => {
    const init = async () => {
      await fetchCurrentUser();
      setInitialLoading(false);
    };
    init();
  }, []);

  if (!fontsLoaded || initialLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
