import {useCallback, useEffect, useState} from 'react';
import {Chat, Collections, FirestoreMessageData, Message, User} from '../types';
import firestore from '@react-native-firebase/firestore';
import _ from 'lodash';

const getChatKey = (userIds: string[]) => {
  return _.orderBy(userIds, userId => userId, 'asc');
};

const useChat = (userIds: string[]) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);

  //   메세지보내기
  const [message, setMessage] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  const loadChat = useCallback(async () => {
    try {
      setLoadingChat(true);

      //채팅방이 있는지 체크
      const chatSnapShot = await firestore()
        .collection(Collections.CHATS)
        .where('userIds', '==', getChatKey(userIds))
        .get();

      if (chatSnapShot.docs.length > 0) {
        const doc = chatSnapShot.docs[0];
        setChat({
          id: doc.id,
          userIds: doc.data().userIds as string[],
          users: doc.data().users as User[],
        });

        return;
      }

      const usersSnapShot = await firestore()
        .collection(Collections.USERS)
        .where('userId', 'in', userIds)
        .get();
      const users = usersSnapShot.docs.map(doc => doc.data() as User);
      const data = {
        userIds: getChatKey(userIds),
        users,
      };

      // 채팅방추가
      const doc = await firestore().collection(Collections.CHATS).add(data);
      setChat({
        id: doc.id,
        ...data,
      });
    } finally {
      setLoadingChat(false);
    }
  }, [userIds]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  //   메세지 보내기
  const sendMessage = useCallback(
    async (text: string, user: User) => {
      if (chat?.id === null) {
        throw new Error('chat is not loaded');
      }
      try {
        setSending(true);
        const data: FirestoreMessageData = {
          text,
          user,
          createdAt: new Date(),
        };

        const doc = await firestore()
          .collection(Collections.CHATS)
          .doc(chat?.id)
          .collection(Collections.MESSAGES)
          .add(data);

        setMessage(prev =>
          prev.concat([
            {
              id: doc.id,
              ...data,
            },
          ]),
        );
      } finally {
        setSending(false);
      }
    },
    [chat?.id],
  );

  return {
    chat,
    loadingChat,
    sendMessage,
    sending,
    message,
  };
};

export default useChat;
