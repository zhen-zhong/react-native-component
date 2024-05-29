import React, { useState, useRef } from 'react';
import { View, KeyboardAvoidingView, TextInput, Text, StyleSheet, Platform, TouchableWithoutFeedback, Keyboard, Animated, Easing, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
const KeyBoardView = () => {
  const [isVisible, setIsVisible] = useState(false); // 弹出视图是否可见的状态
  const slideAnim = useRef(new Animated.Value(0)).current; // 弹出视图高度的动画值
  const translateY = useRef(new Animated.Value(0)).current; // 输入框移动动画值
  const inputRef = useRef(null); // TextInput 的引用

  // 点击发送按钮的处理函数
  const handleSendPress = () => {
    Keyboard.dismiss(); // 关闭键盘
    setIsVisible(true); // 设置弹出视图可见
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 200, // 弹出视图高度变为 200
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: -200, // 输入框上移 200
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      })
    ]).start();
  };

  // 点击关闭按钮的处理函数
  const handleClosePress = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0, // 弹出视图高度变为 0
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: 0, // 输入框返回原始位置
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      })
    ]).start(() => {
      setIsVisible(false); // 设置弹出视图不可见
    });
  };

  // 输入框获取焦点时的处理函数
  const handleInputFocus = () => {
    if (isVisible) {
      handleClosePress(() => {
        // 在动画完成后聚焦输入框
        inputRef.current.focus();
      });
    }
  };

  return (
    // <FastImage
    //   defaultSource={require('../assets/images/addNpcBack.png')}
    //   style={[styles.container, { paddingBottom: 20 }]}
    //   source={require('../assets/images/addNpcBack.png')}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {/* paddingBottom: 20 此处的20设置为底部安全距离，增加一个状态用来判断是否弹起键盘，弹起键盘，这个paddBottom就设置为0 */}
        <Animated.View style={[styles.inner, { transform: [{ translateY }], paddingBottom: 20 }]}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              placeholder="Username"
              style={styles.textInput}
              onFocus={handleInputFocus}
              returnKeyType="send"
              blurOnSubmit={false}
              placeholderTextColor="rgba(255, 246, 208, 0.5)"
            />
            <Text onPress={() => { console.log('11111111'); }} style={styles.sendButton}>Send</Text>
            <Text onPress={handleSendPress} style={[styles.sendButton, { marginLeft: 10 }]}>tools</Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
      {/* 弹出视图 */}
      <Animated.View style={[styles.animatedContainer, { height: slideAnim }]}>
        <Text onPress={() => handleClosePress()} style={styles.animatedText}>关闭工具</Text>
      </Animated.View>
    </KeyboardAvoidingView>
    // </FastImage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'skyblue'
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 20,
    borderColor: "#FFF7E8",
    marginRight: 10,
  },
  sendButton: {
    fontSize: 18,
    color: '#007AFF',
  },
  animatedContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'pink',
    width: '100%',
  },
  animatedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedText: {
    textAlign: 'center',
    paddingTop: 20,
  },
});

export default KeyBoardView;
