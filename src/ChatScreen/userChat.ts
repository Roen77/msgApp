import {useCallback, useEffect, useState} from 'react';
import {Chat, Collections, FirestoreMessageData, Message, User} from '../types';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
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

  //   user 불러오기
  const loadUsers = useCallback(async (uIds: string[]) => {
    const usersSnapShot = await firestore()
      .collection(Collections.USERS)
      .where('userId', 'in', uIds)
      .get();

    const users = usersSnapShot.docs.map<User>(doc => doc.data() as User);
    return users;
  }, []);
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
        const chatUserIds = doc.data().userIds as string[];
        const users = await loadUsers(chatUserIds);
        setChat({
          id: doc.id,
          userIds: chatUserIds,
          //   users: doc.data().users as User[],
          users,
        });

        return;
      }

      //   const usersSnapShot = await firestore()
      //     .collection(Collections.USERS)
      //     .where('userId', 'in', userIds)
      //     .get();
      //   const users = usersSnapShot.docs.map(doc => doc.data() as User);
      const users = await loadUsers(userIds);
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
  }, [loadUsers, userIds]);

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
        // const data: FirestoreMessageData = {
        //   text,
        //   user,
        //   //   createdAt: new Date(),
        //   createdAt: firestore.FieldValue.serverTimestamp(),
        // };

        const doc = await firestore()
          .collection(Collections.CHATS)
          .doc(chat?.id)
          .collection(Collections.MESSAGES)
          .add({
            text,
            user,
            //   createdAt: new Date(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

        addNewMessages([
          {
            id: doc.id,
            text,
            user,
            imageUrl: null,
            audioUrl: null,
            createdAt: new Date(),
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

  //   메세지 가져오는 기능 bak
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
        if (snapshot.metadata.hasPendingWrites) {
          return;
        }
        const newMessages = snapshot
          .docChanges()
          .filter(({type}) => type === 'added')
          .map(docChange => {
            const {doc} = docChange;
            const docData = doc.data();
            const newMessage: Message = {
              id: doc.id,
              text: docData.text ?? null,
              user: docData.user,
              imageUrl: docData.imageUrl ?? null,
              audioUrl: docData.audioUrl ?? null,
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

  //   메세지 실시간 읽음 처리
  const updateMessageReadAt = useCallback(
    async (userId: string) => {
      if (chat == null) {
        return null;
      }
      firestore()
        .collection(Collections.CHATS)
        .doc(chat.id)
        .update({
          [`userToMessageReadAt.${userId}`]:
            firestore.FieldValue.serverTimestamp(),
        });
    },
    [chat],
  );

  // 메세지 읽음처리하려고 만듬
  const [userToMessageReadAt, setUserToMessageReadAt] = useState<{
    [userId: string]: Date;
  }>({});
  useEffect(() => {
    if (chat == null) {
      return;
    }
    const unsubscribe = firestore()
      .collection(Collections.CHATS)
      .doc(chat.id)
      .onSnapshot(snapshot => {
        // 로컬변경은 무시
        if (snapshot.metadata.hasPendingWrites) {
          return;
        }

        const chatData = snapshot.data() ?? {};
        const userToMessageReadTimestamp = chatData.userToMessageReadAt as {
          [userId: string]: FirebaseFirestoreTypes.Timestamp;
        };

        const userToMessageReadDate = _.mapValues(
          userToMessageReadTimestamp,
          updateMessageReadTimestamp => updateMessageReadTimestamp.toDate(),
        );

        setUserToMessageReadAt(userToMessageReadDate);
      });

    return () => {
      unsubscribe();
    };
  }, [chat]);

  //   이미지 전송하는 메세지
  const sendImageMessage = useCallback(
    async (filepath: string, user: User) => {
      setSending(true);
      try {
        if (chat == null) {
          throw new Error('undefined chat');
        }
        if (user == null) {
          throw new Error('undefined user');
        }

        const originalFilename = _.last(filepath.split('/'));
        if (originalFilename == null) {
          throw new Error('undfined filename');
        }

        //originalFilename aaa.png
        const fileExt = originalFilename.split('.')[1];
        const filename = `${Date.now()}.${fileExt}`;
        const storagePath = `chat/${chat.id}/${filename}`;
        await storage().ref(storagePath).putFile(filepath);

        const url = await storage().ref(storagePath).getDownloadURL();

        const doc = await firestore()
          .collection(Collections.CHATS)
          .doc(chat?.id)
          .collection(Collections.MESSAGES)
          .add({
            imageUrl: url,
            user,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

        addNewMessages([
          {
            id: doc.id,
            text: null,
            imageUrl: url,
            audioUrl: null,
            user,
            createdAt: new Date(),
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [addNewMessages, chat],
  );

  //   오디오 전송하는 메세지
  const sendAudioMessage = useCallback(
    async (filepath: string, user: User) => {
      setSending(true);
      try {
        if (chat == null) {
          throw new Error('undefined chat');
        }
        if (user == null) {
          throw new Error('undefined user');
        }

        const originalFilename = _.last(filepath.split('/'));
        if (originalFilename == null) {
          throw new Error('undfined filename');
        }

        //originalFilename aaa.png
        const fileExt = originalFilename.split('.')[1];
        const filename = `${Date.now()}.${fileExt}`;
        const storagePath = `chat/${chat.id}/${filename}`;
        await storage().ref(storagePath).putFile(filepath);

        const url = await storage().ref(storagePath).getDownloadURL();

        const doc = await firestore()
          .collection(Collections.CHATS)
          .doc(chat?.id)
          .collection(Collections.MESSAGES)
          .add({
            audioUrl: url,
            user,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

        addNewMessages([
          {
            id: doc.id,
            text: null,
            imageUrl: null,
            audioUrl: url,
            user,
            createdAt: new Date(),
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [addNewMessages, chat],
  );
  return {
    chat,
    loadingChat,
    sendMessage,
    sending,
    messages,
    loadMessages,
    loadingMessages,
    updateMessageReadAt,
    userToMessageReadAt,
    sendImageMessage,
    sendAudioMessage,
  };
};

export default useChat;
