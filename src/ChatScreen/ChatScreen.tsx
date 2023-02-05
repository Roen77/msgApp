import {RouteProp, useRoute} from '@react-navigation/native';
import React from 'react';
import Screen from '../components/Screen';
import {RootStackParamList} from '../types';
import useChat from './userChat';

function ChatScreen() {
  const {params} = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const {other, userIds} = params;
  const {loadChat, chat} = useChat(userIds);
  return <Screen title={other.name} />;
}

export default ChatScreen;
