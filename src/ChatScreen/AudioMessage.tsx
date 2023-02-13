import React, {useCallback, useRef, useState} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const styles = StyleSheet.create({});

interface AudioMessageProps {
  url: string;
  isOtherMessage?: boolean;
}
function AudioMessage({url, isOtherMessage}: AudioMessageProps) {
  const audioRecorderPlayerRef = useRef(new AudioRecorderPlayer());
  const [playing, setPlaying] = useState(false);
  const [remainingTimeInMs, setRemainingTimeInMs] = useState(0);

  const stopPlay = useCallback(async () => {
    await audioRecorderPlayerRef.current.stopPlayer();
    setPlaying(false);
    audioRecorderPlayerRef.current.removePlayBackListener();
  }, []);

  const startPlay = useCallback(async () => {
    await audioRecorderPlayerRef.current.startPlayer(url);
    setPlaying(true);
    audioRecorderPlayerRef.current.addPlayBackListener(e => {
      const timeInMs = e.duration - e.currentPosition;
      setRemainingTimeInMs(timeInMs);

      if (timeInMs === 0) {
        // stop play
        stopPlay();
      }
    });
  }, [stopPlay, url]);
  return (
    <View>
      <TouchableOpacity onPress={playing ? stopPlay : startPlay}>
        <Text>{playing ? 'stop' : 'play'}</Text>
      </TouchableOpacity>
      <Text>
        {audioRecorderPlayerRef.current.mmss(
          Math.floor(remainingTimeInMs / 1000),
        )}
      </Text>
    </View>
  );
}

export default AudioMessage;
