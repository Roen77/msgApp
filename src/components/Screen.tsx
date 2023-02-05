import {useNavigation} from '@react-navigation/native';
import React, {Children, useCallback, useMemo} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../modules/Colors';

interface ScreenProps {
  title?: string;
  children?: React.ReactNode;
}
function Screen({title, children}: ScreenProps) {
  const {goBack, canGoBack} = useNavigation();

  const onPressBackButton = useCallback(() => {
    goBack();
  }, [goBack]);
  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <View style={styles.left}>
          {canGoBack() && (
            <TouchableOpacity onPress={onPressBackButton}>
              <Text>뒤로</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.center}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.right} />
      </View>
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 48,
    flexDirection: 'row',
  },
  left: {
    flex: 1,
  },
  right: {
    flex: 1,
  },
  center: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  body: {
    flex: 1,
  },
});

export default Screen;
