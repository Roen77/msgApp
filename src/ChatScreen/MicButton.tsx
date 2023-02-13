import React, {useCallback, useRef, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';

const styles = StyleSheet.create({
  button: {},
});

interface MicButtonProps {
  onRecorded: (path: string) => void;
}
function MicButton({onRecorded}: MicButtonProps) {
  const audioRecorderPlayerRef = useRef(new AudioRecorderPlayer());

  const [recording, setRecording] = useState(false);

  const startRecord = useCallback(async () => {
    console.log('녹음 시작');
    if (Platform.OS === 'android') {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      const granted =
        grants[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED;

      if (!granted) {
        return;
      }

      await audioRecorderPlayerRef.current.startRecorder(undefined, {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
      });
      audioRecorderPlayerRef.current.addRecordBackListener(() => {});

      setRecording(true);
    }
  }, []);

  const stopRecord = useCallback(async () => {
    const uri = await audioRecorderPlayerRef.current.stopRecorder();
    audioRecorderPlayerRef.current.removeRecordBackListener();
    setRecording(false);
    onRecorded(uri);
  }, [onRecorded]);

  if (recording) {
    return (
      <TouchableOpacity style={styles.button} onPress={stopRecord}>
        <Text>stop</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.button} onPress={startRecord}>
      <Text>녹음시작</Text>
    </TouchableOpacity>
  );
}

export default MicButton;
