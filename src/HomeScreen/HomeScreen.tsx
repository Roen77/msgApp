import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AuthContext from '../components/AurhContext';
import messaging from '@react-native-firebase/messaging';
import Screen from '../components/Screen';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Collections, RootStackParamList, User} from '../types';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const isFocused = useIsFocused();

  const {user: me} = useContext(AuthContext);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  console.log('uers', users);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const snapshot = await firestore().collection(Collections.USERS).get();
      setUsers(
        snapshot.docs
          .map(doc => doc.data() as User)
          .filter(u => u.userId !== me?.userId),
      );
      setLoadingUsers(false);
    } catch (error) {
      console.log('error', error);
      setLoadingUsers(false);
    }
  }, [me?.userId]);

  const renderLoading = useCallback(() => {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  //   푸시알림은 background와 quit에서 둘다 처리하는 로직 구현
  //   1. backtround
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('remoteMessage', remoteMessage);
      const stringifiedUsesrIds = remoteMessage.data?.userIds;
      //   {"collapseKey": "com.roen.chatApp", "data": {"userIds": "[\"RVVgbBbCUVepYjnT14WSM6s8UC23\",\"dz8iVIduByUsfTt4yS1bphDaEX32\"]"}, "from": "828093348965", "messageId": "0:1675601642680326%21affcae21affcae", "notification": {"android": {}, "body": "Tomato: Dww", "title": "메세지가 도착했습니다"}, "sentTime": 1675601642672, "ttl": 2419200}

      if (stringifiedUsesrIds != null) {
        const userIds = JSON.parse(stringifiedUsesrIds) as string[];
        console.log(userIds, 'userIds');
        navigation.navigate('Chat', {userIds});
      }

      return () => {
        unsubscribe();
      };
    });
  }, [navigation]);
  //   2. app quit일때
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log('remote quit getInitialNotification', remoteMessage);
        // {"collapseKey": "com.roen.chatApp", "data": {"userIds": "[\"RVVgbBbCUVepYjnT14WSM6s8UC23\",\"dz8iVIduByUsfTt4yS1bphDaEX32\"]"}, "from": "828093348965", "messageId": "0:1675602270358355%21affcae21affcae", "notification": {"android": {}, "body": "Tomato: !!??", "title": "메세지가 도착했습니다"}, "sentTime": 1675602270342, "ttl": 2419200}
        const stringifiedUsesrIds = remoteMessage?.data?.userIds;
        if (stringifiedUsesrIds != null) {
          const userIds = JSON.parse(stringifiedUsesrIds) as string[];
          console.log(userIds, 'userIds');
          navigation.navigate('Chat', {userIds});
        }
      });
  }, [navigation]);

  //   3. 앱이 foregraound일때
  useEffect(() => {
    const unsubscribe = messaging().onMessage(remoteMessage => {
      console.log('onMessage', remoteMessage);
      //   {"collapseKey": "com.roen.chatApp", "data": {"userIds": "[\"RVVgbBbCUVepYjnT14WSM6s8UC23\",\"dz8iVIduByUsfTt4yS1bphDaEX32\"]"}, "from": "828093348965", "messageId": "0:1675602543051827%21affcae21affcae", "notification": {"android": {}, "body": "Tomato: 55", "title": "메세지가 도착했습니다"}, "sentTime": 1675602543034, "ttl": 2419200}
      const {notification} = remoteMessage;
      if (notification != null) {
        const {title, body} = notification;
        if (isFocused) {
          Toast.show({
            type: 'success',
            text1: title,
            text2: body,
            onPress: () => {
              const stringifiedUsesrIds = remoteMessage?.data?.userIds;
              if (stringifiedUsesrIds != null) {
                const userIds = JSON.parse(stringifiedUsesrIds) as string[];
                console.log(userIds, 'userIds');
                navigation.navigate('Chat', {userIds});
              }
            },
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isFocused, navigation]);
  if (!me) {
    return null;
  }
  return (
    <Screen title="홈">
      <View>
        <Text>나의 정보</Text>
        <Text>{me.email}</Text>
        <Text>{me.name}</Text>
      </View>
      <View>
        <TouchableOpacity onPress={() => auth().signOut()}>
          <Text>로그아웃</Text>
        </TouchableOpacity>
      </View>
      {/* 다른유저 */}

      <View style={{marginTop: 30, backgroundColor: 'pink'}}>
        {loadingUsers ? (
          renderLoading()
        ) : (
          <>
            <Text>다른 사용자 리스트</Text>
            <FlatList
              ItemSeparatorComponent={() => <View style={{height: 10}} />}
              data={users}
              ListEmptyComponent={
                <View>
                  <Text>사용자가 없습니다.</Text>
                </View>
              }
              renderItem={({item: user}) => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Chat', {
                      userIds: [me.userId, user.userId],
                      //   other: user,
                    });
                  }}
                  style={{backgroundColor: '#ddd'}}>
                  <Text>{user.email}</Text>
                  <Text>{user.name}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </View>
    </Screen>
  );
}

export default HomeScreen;
