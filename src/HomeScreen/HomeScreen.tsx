import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AuthContext from '../components/AurhContext';
import Screen from '../components/Screen';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Collections, RootStackParamList, User} from '../types';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
                      other: user,
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
