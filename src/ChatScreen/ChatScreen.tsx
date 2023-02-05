import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AuthContext from '../components/AurhContext';
import Screen from '../components/Screen';
import Colors from '../modules/Colors';
('');
import {RootStackParamList} from '../types';
import useChat from './userChat';

function ChatScreen() {
  const {params} = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const {other, userIds} = params;

  const {user: me} = useContext(AuthContext);
  const {loadingChat, chat, sendMessage} = useChat(userIds);

  const [text, setText] = useState('');

  //   메세지 보내기
  const onPressMessage = useCallback(() => {
    if (me != null) {
      sendMessage(text, me);
      setText('');
    }
  }, [me, sendMessage, text]);

  const onChangeText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const renderChat = useCallback(() => {
    if (chat === null) {
      return null;
    }
    return (
      <View>
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
        {/* 메세지 */}

        <View style={{backgroundColor: 'pink'}}>
          <View>
            <TextInput
              style={{borderWidth: 1, height: 50}}
              onChangeText={onChangeText}
              value={text}
            />
            <TouchableOpacity onPress={onPressMessage}>
              <Text>send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [chat, onChangeText, onPressMessage, text]);
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
