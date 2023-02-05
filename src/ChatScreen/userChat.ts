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
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  //   메세지 가져오기
  const [loadingMessages, setLoadingMessages] = useState(false);

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

  //   메세지 추가시 중복걸러주는 함수
  const addNewMessages = useCallback((newMessages: Message[]) => {
    setMessages(prev => {
      return _.uniqBy(newMessages.concat(prev), m => m.id);
    });
  }, []);

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

        addNewMessages([
          {
            id: doc.id,
            ...data,
          },
        ]);
        // setMessages(prev =>
        //   [
        //     {
        //       id: doc.id,
        //       ...data,
        //     },
        //   ].concat(prev),
        // );
      } finally {
        setSending(false);
      }
    },
    [addNewMessages, chat?.id],
  );

  //   메세지 가져오는 기능
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const messageSnapShot = await firestore()
        .collection(Collections.CHATS)
        .doc(chatId)
        .collection(Collections.MESSAGES)
        .orderBy('createdAt', 'desc')
        .get();

      const ms = messageSnapShot.docs.map<Message>(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          user: data.user,
          text: data.text,
          createdAt: data.createdAt.toDate(),
        };
      });

      setMessages(ms);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  //   useEffect(() => {
  //     if (chat?.id != null) {
  //       loadMessages(chat.id);
  //     }
  //   }, [chat?.id, loadMessages]);

  //   실시간으로 메세지 가져오는 기능
  useEffect(() => {
    if (chat?.id == null) {
      return;
    }
    setLoadingMessages(true);
    const unsubscribe = firestore()
      .collection(Collections.CHATS)
      .doc(chat?.id)
      .collection(Collections.MESSAGES)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const newMessages = snapshot
          .docChanges()
          .filter(({type}) => type === 'added')
          .map(docChange => {
            const {doc} = docChange;
            const docData = doc.data();
            const newMessage: Message = {
              id: doc.id,
              text: docData.text,
              user: docData.user,
              createdAt: docData.createdAt.toDate(),
            };

            return newMessage;
          });

        addNewMessages(newMessages);
        setLoadingMessages(false);
      });

    return () => {
      unsubscribe();
    };
  }, [addNewMessages, chat?.id]);
  return {
    chat,
    loadingChat,
    sendMessage,
    sending,
    messages,
    loadMessages,
    loadingMessages,
  };
};

export default useChat;
