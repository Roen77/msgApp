import {useCallback, useEffect, useState} from 'react';
import {requestNotifications, RESULTS} from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';
const usePushnotification = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  // 토큰값얻기
  useEffect(() => {
    messaging()
      .getToken()
      .then(token => {
        setFcmToken(token);
      });
  }, []);
  //   토큰값 만료되었는지 확인
  useEffect(() => {
    // 만약에 리프레시가 되면 다시 토큰을 저장함
    const unsubscribe = messaging().onTokenRefresh(token => {
      setFcmToken(token);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const requestPermission = useCallback(async () => {
    const {status} = await requestNotifications([]);

    const enabled = status === RESULTS.GRANTED;
    console.log('status 확인', status);
    if (!enabled) {
      Alert.alert('알림 권한을 허용해주세요.');
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);
};

export default usePushnotification;
