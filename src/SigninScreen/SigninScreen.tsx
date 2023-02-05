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

function SigninScreen() {
  const {signin, processingSignin} = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onChangeEmailText = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const onChangePasswordText = useCallback((text: string) => {
    setPassword(text);
  }, []);

  //   signup
  const onPressSigninButton = useCallback(async () => {
    try {
      console.log('email password', email, password);
      await signin(email, password);
      console.log('성공');
    } catch (error) {
      console.log('error', error);
    }
  }, [email, password, signin]);
  return (
    <Screen title="로그인">
      {processingSignin ? (
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
          <View>
            <TouchableOpacity onPress={onPressSigninButton}>
              <Text>로그인</Text>
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

export default SigninScreen;
