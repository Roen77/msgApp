import React, {useCallback} from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';

import moment from 'moment';
import UserPhoto from '../components/UserPhoto';

interface MessageProps {
  name: string;
  text: string;
  createdAt: Date;
  isOtherMessage: boolean;
  imageUrl?: string;
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
  text,
  createdAt,
  isOtherMessage,
  imageUrl,
}: MessageProps) {
  const messageStyles = isOtherMessage ? otherMessageStyles : styles;
  const renderMessageContainer = useCallback(() => {
    const components = [
      <Text key="timeText" style={styles.timeText}>
        {moment(createdAt).format('HH:mm')}
      </Text>,
      <View style={{flexShrink: 1}} key="message">
        <Text>{text}</Text>
      </View>,
    ];
    return isOtherMessage ? components.reverse() : components;
  }, [createdAt, isOtherMessage, text]);
  return (
    <View>
      {isOtherMessage && (
        <UserPhoto
          style={{justifyContent: 'center', alignItems: 'center'}}
          imageUrl={imageUrl}
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
