import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {ActivityIndicator, FlatList, Text, View} from 'react-native';
import Screen from '../components/Screen';
import Colors from '../modules/Colors';
import {RootStackParamList} from '../types';
import useChat from './userChat';

function ChatScreen() {
  const {params} = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const {other, userIds} = params;
  const {loadingChat, chat} = useChat(userIds);

  const renderChat = useCallback(() => {
    if (chat === null) {
      return null;
    }
    return (
      <View>
        <Text>대화상대</Text>
        <FlatList
          horizontal
          data={chat.users}
          renderItem={({item: user, index}) => (
            <View
              style={{
                backgroundColor: Colors.BLACK,
                display: 'flex',
                width: 30,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
                margin: 5,
              }}>
              <Text style={{color: '#fff'}}>{user?.name[0]}</Text>
            </View>
          )}
        />
      </View>
    );
  }, [chat]);
  return (
    <Screen title={other.name}>
      <View>
        {loadingChat ? (
          <View>
            <ActivityIndicator />
          </View>
        ) : (
          renderChat()
        )}
      </View>
    </Screen>
  );
}

export default ChatScreen;
