import {RouteProp, useRoute} from '@react-navigation/native';
import moment from 'moment';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import UserPhoto from '../components/UserPhoto';
import Colors from '../modules/Colors';
('');
import {RootStackParamList} from '../types';
import Message from './Message';
import useChat from './userChat';

function ChatScreen() {
  const {params} = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const {userIds} = params;

  const {user: me} = useContext(AuthContext);
  const {
    loadingChat,
    chat,
    sendMessage,
    messages,
    loadingMessages,
    updateMessageReadAt,
    userToMessageReadAt,
  } = useChat(userIds);

  const [text, setText] = useState('');

  const loading = loadingChat || loadingMessages;

  useEffect(() => {
    if (me != null && messages.length > 0) {
      updateMessageReadAt(me?.userId);
    }
  }, [me, me?.userId, messages.length, updateMessageReadAt]);

  const other = useMemo(() => {
    if (chat != null && me != null) {
      return chat.users.filter(u => u.userId !== me.userId)[0];
    }
    return null;
  }, [chat, me]);

  console.log('messagess', messages);

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
      <View style={{flex: 1}}>
        <View style={{flex: 0.8}}>
          <Text>대화상대</Text>
          <FlatList
            horizontal
            data={chat.users}
            renderItem={({item: user, index}) => (
              <UserPhoto
                size={34}
                name={user.name}
                style={{justifyContent: 'center', alignItems: 'center'}}
                imageUrl={user.profileUrl}
              />
              //   <View
              //     style={{
              //       backgroundColor: Colors.BLACK,
              //       display: 'flex',
              //       width: 30,
              //       justifyContent: 'center',
              //       alignItems: 'center',
              //       padding: 10,
              //       margin: 5,
              //     }}>
              //     <Text style={{color: '#fff'}}>{user?.name[0]}</Text>
              //   </View>
            )}
          />
          {/* 메세지 리스트 */}
          <FlatList
            inverted
            data={messages}
            renderItem={({item: message}) => {
              const user = chat.users.find(
                u => u.userId === message.user.userId,
              );
              const unreadUsers = chat.users.filter(u => {
                const messageReadAt = userToMessageReadAt[u.userId] ?? null;
                if (messageReadAt == null) {
                  return true;
                }
                return moment(messageReadAt).isBefore(message.createdAt);
              });

              const unreadCount = unreadUsers.length;
              return (
                <Message
                  imageUrl={user?.profileUrl}
                  name={user?.name ?? ''}
                  text={message.text}
                  createdAt={message.createdAt}
                  isOtherMessage={message.user.userId !== me?.userId}
                  unreadCount={unreadCount}
                />
              );
            }}
          />
        </View>

        {/* 메세지 */}

        <View
          style={{
            backgroundColor: 'pink',

            flex: 0.2,
          }}>
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
    );
  }, [
    chat,
    me?.userId,
    messages,
    onChangeText,
    onPressMessage,
    text,
    userToMessageReadAt,
  ]);
  return (
    <Screen title={other?.name}>
      <>
        {loading ? (
          <View>
            <ActivityIndicator />
          </View>
        ) : (
          renderChat()
        )}
      </>
    </Screen>
  );
}

export default ChatScreen;
