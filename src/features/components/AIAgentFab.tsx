import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  Dimensions,
  Keyboard,
  Pressable,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Easing,
  interpolateColor,
  withSequence,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');
const FAB_SIZE = 56;
const SIDE_MARGIN = 20;
const BOTTOM_MARGIN = 20;
const KEYBOARD_GAP = 16;
const EXPANDED_WIDTH = SCREEN_W - SIDE_MARGIN * 2;

const LEFT_EDGE = SIDE_MARGIN;
const RIGHT_EDGE = SCREEN_W - FAB_SIZE - SIDE_MARGIN;

export function AIAgentFab() {
  const insets = useSafeAreaInsets();
  const [isExpanded, setIsExpanded] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('right');
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState('');
  
  const inputRef = useRef<TextInput>(null);

  const posX = useSharedValue(RIGHT_EDGE);
  const expandProgress = useSharedValue(0);
  const recordingProgress = useSharedValue(0);
  const flashAnim = useSharedValue(0);
  const keyboardOffset = useSharedValue(0);

  useEffect(() => {
    const handleKeyboardFrame = (event: { endCoordinates: { height: number } }) => {
      const keyboardHeight = event.endCoordinates.height;
      keyboardOffset.value = withTiming(
        Math.max(0, keyboardHeight - BOTTOM_MARGIN - insets.bottom + KEYBOARD_GAP),
        { duration: 220 }
      );
    };
    const handleKeyboardHide = () => {
      keyboardOffset.value = withTiming(0, { duration: 180 });
    };

    const frameSubscription = Keyboard.addListener('keyboardWillChangeFrame', handleKeyboardFrame);
    const hideSubscription = Keyboard.addListener('keyboardWillHide', handleKeyboardHide);

    return () => {
      frameSubscription.remove();
      hideSubscription.remove();
    };
  }, [insets.bottom, keyboardOffset]);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  const toggleExpand = useCallback((expand: boolean) => {
    setIsExpanded(expand);
    expandProgress.value = withTiming(expand ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });

    if (expand) {
      requestAnimationFrame(handleFocus);
    }

    if (!expand) {
      Keyboard.dismiss();
      setText('');
    }
  }, []);

  const handleIconPress = () => {
    if (!isExpanded) {
      toggleExpand(true);
    } else if (text.length === 0) {
      toggleExpand(false);
    } else {
      flashAnim.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      console.log('ИИ обрабатывает запрос:', text);
    }
  };

  const tapGesture = Gesture.Tap()
    .enabled(!isExpanded)
    .onEnd(() => {
      runOnJS(toggleExpand)(true);
    });

  const longPressGesture = Gesture.LongPress()
    .enabled(!isExpanded)
    .minDuration(250)
    .onStart(() => {
      runOnJS(setIsRecording)(true);
      recordingProgress.value = withTiming(1, { duration: 200 });
    })
    .onEnd(() => {
      runOnJS(setIsRecording)(false);
      recordingProgress.value = withTiming(0, { duration: 200 });
    });

  const panGesture = Gesture.Pan()
    .enabled(!isExpanded)
    .onUpdate((e) => {
      posX.value = e.absoluteX - FAB_SIZE / 2;
    })
    .onEnd((e) => {
      const velocity = e.velocityX;
      const currentX = e.absoluteX;
      let targetSide: 'left' | 'right' = currentX < SCREEN_W / 2 ? 'left' : 'right';
      
      if (velocity < -500) targetSide = 'left';
      if (velocity > 500) targetSide = 'right';

      runOnJS(setSide)(targetSide);
      posX.value = withTiming(targetSide === 'left' ? LEFT_EDGE : RIGHT_EDGE, { 
        duration: 200, 
        easing: Easing.out(Easing.quad) 
      });
    });

  const composedGesture = Gesture.Exclusive(tapGesture, longPressGesture, panGesture);

  const containerStyle = useAnimatedStyle(() => {
    const width = interpolate(expandProgress.value, [0, 1], [FAB_SIZE, EXPANDED_WIDTH]);
    
    let left;
    if (expandProgress.value > 0) {
      const startX = side === 'left' ? LEFT_EDGE : RIGHT_EDGE;
      left = interpolate(expandProgress.value, [0, 1], [startX, SIDE_MARGIN]);
    } else {
      left = posX.value;
    }

    const baseColor = interpolateColor(recordingProgress.value, [0, 1], ['#FFFFFF', '#FF3B30']);
    const finalColor = interpolateColor(flashAnim.value, [0, 1], [baseColor, '#E5E5EA']);

    return {
      width,
      left,
      bottom: BOTTOM_MARGIN + insets.bottom + keyboardOffset.value,
      backgroundColor: finalColor,
      transform: [
        { scale: interpolate(recordingProgress.value, [0, 1], [1, 1.1]) },
        { scale: interpolate(flashAnim.value, [0, 1], [1, 0.98]) }
      ]
    };
  });

  const inputOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.7, 1], [0, 1]),
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0, 1], [0, 0.42]),
  }));

  return (
    <>
      {isExpanded && (
        <Pressable 
          style={styles.backdrop} 
          onPress={() => toggleExpand(false)}
        >
          <Animated.View style={[styles.backdropFill, backdropStyle]} />
        </Pressable>
      )}

      <GestureDetector gesture={composedGesture}>
        <Animated.View 
          style={[
            styles.fab, 
            containerStyle
          ]}
        >
          <View style={[
            styles.inner, 
            { flexDirection: side === 'left' ? 'row' : 'row-reverse' }
          ]}>
            
            <Pressable onPress={handleIconPress} hitSlop={10}>
              <View style={styles.iconContainer}>
                <SymbolView
                  name={isRecording ? "mic.fill" : (isExpanded && text.length > 0) ? "arrow.up.circle.fill" : "sparkles"}
                  size={isExpanded && text.length > 0 ? 30 : 24}
                  tintColor={isRecording ? "white" : "#007AFF"}
                />
              </View>
            </Pressable>

            <Animated.View style={[styles.inputWrap, inputOpacityStyle]}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Расскажи, что ты купил..."
                placeholderTextColor="#C7C7CC"
                value={text}
                onChangeText={setText}
                textAlign="left"
                editable={isExpanded}
                autoCapitalize="none"
              />
            </Animated.View>
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 900,
  },
  backdropFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#000000',
  },
  fab: {
    position: 'absolute',
    height: FAB_SIZE,
    zIndex: 1000,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  input: {
    fontSize: 17,
    color: '#000',
    paddingVertical: 0,
    width: '100%',
  },
});