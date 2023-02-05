import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import Screen from '../components/Screen';

function LoadingScreen() {
  return (
    <View>
      <ActivityIndicator />
      <Text>로딩중..</Text>
    </View>
  );
}

export default LoadingScreen;
