import React, {useCallback, useMemo, useState} from 'react';
import {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Profile from '../HomeScreen/Profile';
import ImageView from 'react-native-image-viewing';

interface Props {
  size?: number;
  style?: StyleProp<ViewStyle>;
  name?: string;
  imageUrl?: string;
  nameStyle?: StyleProp<TextStyle>;
}

function UserPhoto({size = 48, style, imageUrl, name, nameStyle}: Props) {
  const [viewVisible, setViewVisible] = useState(false);
  const images = useMemo(
    () => (imageUrl != null ? [{uri: imageUrl}] : []),
    [imageUrl],
  );

  const showImageViewer = useCallback(() => {
    setViewVisible(true);
  }, []);
  return (
    <>
      <Profile
        size={size}
        style={style}
        imageUrl={imageUrl}
        onPress={images.length > 0 ? showImageViewer : undefined}
        text={name?.[0].toUpperCase()}
        textStyle={nameStyle}
      />
      <ImageView
        images={images}
        imageIndex={0}
        visible={viewVisible}
        onRequestClose={() => setViewVisible(false)}
      />
    </>
  );
}

export default UserPhoto;
