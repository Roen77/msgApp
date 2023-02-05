import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AuthContext from '../components/AurhContext';
import Screen from '../components/Screen';
import Colors from '../modules/Colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';

function SignupScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {signup, processingSignup} = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const nameErrorText = useMemo(() => {
    if (name.length === 0) {
      return '이름을 입력해주세요';
    }
    return null;
  }, [name.length]);
  const onChangeEmailText = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const onChangePasswordText = useCallback((text: string) => {
    setPassword(text);
  }, []);
  const onChangeConfirmPasswordText = useCallback((text: string) => {
    setConfirmPassword(text);
  }, []);
  const onChangeNameText = useCallback((text: string) => {
    setName(text);
  }, []);

  const signupBUttonEnabled = useMemo(() => {
    return nameErrorText === null;
  }, [nameErrorText]);
  const signupButtonStyle = useMemo(() => {
    if (signupBUttonEnabled) {
      return styles.signupButton;
    }
    return [styles.signupButton, styles.disabledSignupButton];
  }, [signupBUttonEnabled]);

  //   signup
  const onPressSignupButton = useCallback(async () => {
    try {
      await signup(email, password, name);
      console.log('성공');
    } catch (error) {
      console.log('error', error);
      Alert.alert('error');
    }
  }, [email, password, name, signup]);
  return (
    <Screen title="회원가입">
      {processingSignup ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <Text style={styles.title}>이메일</Text>
            <TextInput
              value={email}
              style={styles.input}
              onChangeText={onChangeEmailText}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>비밀번호</Text>
            <TextInput
              value={password}
              secureTextEntry
              style={styles.input}
              onChangeText={onChangePasswordText}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>비밀번호 확인</Text>
            <TextInput
              value={confirmPassword}
              secureTextEntry
              style={styles.input}
              onChangeText={onChangeConfirmPasswordText}
            />
          </View>
          <View style={styles.section}>
            <Text>이름</Text>
            <TextInput
              value={name}
              style={styles.input}
              onChangeText={onChangeNameText}
            />
            {nameErrorText && (
              <Text style={styles.errorText}>{nameErrorText}</Text>
            )}
          </View>
          <View>
            <TouchableOpacity
              onPress={onPressSignupButton}
              style={signupButtonStyle}>
              <Text style={{color: '#fff'}}>회원가입</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
              <Text>이미 계정이 있나요?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: '#ddd',
    fontSize: 16,
  },
  errorText: {
    color: Colors.RED,
  },
  signupButton: {
    backgroundColor: Colors.BLACK,
    padding: 20,
  },
  disabledSignupButton: {
    backgroundColor: Colors.GRAY,
  },
});

export default SignupScreen;
