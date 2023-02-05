/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useContext, useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import usePushnotification from './src/hooks/usePushNotification';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './src/types';
import SignupScreen from './src/SignupScreen/SignupScreen';
import AuthProvider from './src/components/AuthProvider';
import SigninScreen from './src/SigninScreen/SigninScreen';
import AuthContext from './src/components/AurhContext';
import HomeScreen from './src/HomeScreen/HomeScreen';
import LoadingScreen from './src/LoadingScreen/LoadingScreen';
import ChatScreen from './src/ChatScreen/ChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Screens = () => {
  const {user, processingSignin, processingSignup, initialized} =
    useContext(AuthContext);

  const renderRootStack = useCallback(() => {
    if (user != null && !processingSignin && !processingSignup) {
      // login
      return (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      );
    }
    //logout
    return (
      <>
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Signin" component={SigninScreen} />
      </>
    );
  }, [processingSignin, processingSignup, user]);

  if (!initialized) {
    return <Stack.Screen name="Loading" component={LoadingScreen} />;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {renderRootStack()}
        {/* <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Signin" component={SigninScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App(): JSX.Element {
  // usePushnotification();
  useEffect(() => {
    console.log('aa');
  }, []);

  return (
    <AuthProvider>
      <Screens />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
