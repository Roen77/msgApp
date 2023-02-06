import React, {useCallback, useEffect, useMemo, useState} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {Collections, User} from '../types';
import AuthContext from './AurhContext';
import _ from 'lodash';
const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [processingSignup, setProcessingSignup] = useState(false);
  const [processingSignin, setProcessingSignin] = useState(false);
  useEffect(() => {
    const unsubscribe = auth().onUserChanged(async fbUser => {
      console.log('fnUser:', fbUser);
      if (fbUser != null) {
        setUser({
          userId: fbUser.uid,
          email: fbUser.email ?? '',
          name: fbUser.displayName ?? '',
          profileUrl: fbUser.photoURL ?? '',
        });
      } else {
        setUser(null);
      }
      setInitialized(true);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      setProcessingSignup(true);

      try {
        console.log('pasword register', password);
        const {user: currentUser} = await auth().createUserWithEmailAndPassword(
          email,
          password,
        );

        await currentUser.updateProfile({
          displayName: name,
        });

        await firestore()
          .collection(Collections.USERS)
          .doc(currentUser.uid)
          .set({
            userId: currentUser.uid,
            email,
            name,
          });
      } finally {
        setProcessingSignup(false);
      }
    },
    [],
  );

  const signin = useCallback(async (email: string, password: string) => {
    setProcessingSignin(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } finally {
      setProcessingSignin(false);
    }
  }, []);

  //   푸시알림을 위한 토큰 만들기
  const addFcmToken = useCallback(
    async (token: string) => {
      console.log('update 되는지 확인', user);
      if (user != null) {
        await firestore()
          .collection(Collections.USERS)
          .doc(user?.userId)
          .update({
            fcmTokens: firestore.FieldValue.arrayUnion(token),
          });
      }
    },
    [user],
  );

  //  이미지
  const updateProfileImage = useCallback(
    async (filepath: string) => {
      if (user === null) {
        throw new Error('user us undefined');
      }
      const filename = _.last(filepath.split('/'));

      if (filename === null) {
        throw new Error('filename is undefined');
      }

      const storageFilepath = `users/${user?.userId}/${filename}`;
      await storage().ref(storageFilepath).putFile(filepath);
      const url = await storage().ref(storageFilepath).getDownloadURL();

      await auth().currentUser?.updateProfile({photoURL: url});
      //   db저장
      await firestore().collection(Collections.USERS).doc(user.userId).update({
        profileUrl: url,
      });
    },
    [user],
  );

  const value = useMemo(() => {
    return {
      initialized,
      user,
      signup,
      signin,
      processingSignin,
      processingSignup,
      addFcmToken,
      updateProfileImage,
    };
  }, [
    addFcmToken,
    initialized,
    processingSignin,
    processingSignup,
    signin,
    signup,
    updateProfileImage,
    user,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
