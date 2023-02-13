import React, {useCallback} from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';

import moment from 'moment';
import UserPhoto from '../components/UserPhoto';
import ImageMessage from './ImageMessage';
import AudioMessage from './AudioMessage';

interface TextMessage {
  text: string;
}

interface ImageMessageProp {
  imageUrl: string;
}
interface AudioMessageProp {
  audioUrl: string;
}
interface MessageProps {
  name: string;
  message: TextMessage | ImageMessageProp | AudioMessageProp;
  createdAt: Date;
  isOtherMessage: boolean;
  userImageUrl?: string;
  unreadCount?: number;
}

const styles = StyleSheet.create({
  timeText: {},
  container: {
    alignItems: 'flex-end',
    marginVertical: 10,
  },
});

const otherMessageStyles = {
  container: [styles.container, {alignItems: 'flex-start' as const}],
};
function Message({
  name,
  message,
  createdAt,
  isOtherMessage,
  userImageUrl,
  unreadCount = 0,
}: MessageProps) {
  const messageStyles = isOtherMessage ? otherMessageStyles : styles;
  const renderMessage = useCallback(() => {
    if ('text' in message) {
      return <Text>{message.text}</Text>;
    }

    if ('imageUrl' in message) {
      return <ImageMessage url={message.imageUrl} />;
    }
    if ('audioUrl' in message) {
      return (
        <AudioMessage url={message.audioUrl} isOtherMessage={isOtherMessage} />
      );
    }
  }, [isOtherMessage, message]);
  const renderMessageContainer = useCallback(() => {
    const components = [
      <View key="metainfo">
        {unreadCount > 0 && <Text>안읽음 {unreadCount} </Text>}
        <Text key="timeText" style={styles.timeText}>
          {moment(createdAt).format('HH:mm')}
        </Text>
      </View>,

      <View style={{flexShrink: 1}} key="message">
        {renderMessage()}
      </View>,
    ];
    return isOtherMessage ? components.reverse() : components;
  }, [unreadCount, createdAt, renderMessage, isOtherMessage]);
  return (
    <View>
      {isOtherMessage && (
        <UserPhoto
          style={{justifyContent: 'center', alignItems: 'center'}}
          imageUrl={userImageUrl}
          name={name}
          size={34}
        />
      )}
      <View style={messageStyles.container}>
        <Text>{name}</Text>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'royalblue',
          }}>
          {renderMessageContainer()}
        </View>
      </View>
    </View>
  );
}

export default Message;
