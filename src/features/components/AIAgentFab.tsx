import { SymbolView } from 'expo-symbols';
import { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    Keyboard,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSequence, // Добавили для эффекта вспышки
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');
const FAB_SIZE = 56;
const SIDE_MARGIN = 20;
const BOTTOM_MARGIN = 20;
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
  const flashAnim = useSharedValue(0); // Анимация вспышки при отправке

  const toggleExpand = useCallback((expand: boolean) => {
    setIsExpanded(expand);
    expandProgress.value = withTiming(expand ? 1 : 0, { 
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });

    if (expand) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      Keyboard.dismiss();
      setText('');
    }
  }, []);

  const tapGesture = Gesture.Tap()
    .enabled(!isExpanded)
    .onEnd(() => {
      runOnJS(toggleExpand)(true);
    });

  const longPressGesture = Gesture.LongPress()
    .enabled(!isExpanded)
    .minDuration(200)
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
    .minDistance(10)
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
      posX.value = withTiming(
        targetSide === 'left' ? LEFT_EDGE : RIGHT_EDGE,
        { duration: 200, easing: Easing.out(Easing.quad) }
      );
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

    // Логика цвета: Белый -> Красный (запись) -> Серый (вспышка при клике)
    const baseColor = interpolateColor(
      recordingProgress.value,
      [0, 1],
      ['#FFFFFF', '#FF3B30']
    );

    const finalColor = interpolateColor(
      flashAnim.value,
      [0, 1],
      [baseColor, '#E5E5EA'] // Цвет вспышки
    );

    return {
      width,
      left,
      backgroundColor: finalColor,
      borderRadius: 28,
      transform: [
          { scale: interpolate(recordingProgress.value, [0, 1], [1, 1.1]) },
          { scale: interpolate(flashAnim.value, [0, 1], [1, 0.98]) } // Легкое сжатие при клике
      ]
    };
  });

  const inputOpacityStyle = useAnimatedStyle(() => ({
    opacity: expandProgress.value,
  }));

  // Функция для обработки клика по иконке в развернутом виде
  const handleIconPress = () => {
    if (!isExpanded) {
        toggleExpand(true);
    } else if (text.length === 0) {
        toggleExpand(false);
    } else {
        // Тот самый эффект "вспышки"
        flashAnim.value = withSequence(
            withTiming(1, { duration: 100 }),
            withTiming(0, { duration: 100 })
        );
        console.log('Кнопка нажата, текст сохранен:', text);
        // Текст НЕ стираем, окно НЕ закрываем
    }
  };

  return (
    <>
      {isExpanded && (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => toggleExpand(false)}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.03)' }]} />
        </Pressable>
      )}

      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.fab, { bottom: BOTTOM_MARGIN + insets.bottom }, containerStyle]}>
          <View style={[
            styles.inner, 
            { flexDirection: side === 'left' ? 'row' : 'row-reverse' }
          ]}>
            
            <Pressable onPress={handleIconPress}>
              <View style={styles.iconContainer}>
                <SymbolView
                  name={isRecording ? "mic.fill" : (isExpanded && text.length > 0) ? "arrow.up.circle.fill" : "sparkles"}
                  size={isExpanded && text.length > 0 ? 28 : 24}
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
              />
            </Animated.View>
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    height: FAB_SIZE,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
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