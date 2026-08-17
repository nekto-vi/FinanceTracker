import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Modal, TextInput, 
  TouchableOpacity, Dimensions, ScrollView, Platform 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS 
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = (SCREEN_HEIGHT * 2.8) / 4;

const PASTEL_COLORS = [
  '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#D4BAFF', '#FFBAF2',
  '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F3D1F4',
  '#F8B195', '#F67280', '#C06C84', '#6C5B7B', '#355C7D', '#99B443', '#E3AFBC',
  '#A8E6CF', '#DCEDC1', '#FFD3B6', '#FFAAA5', '#FF8B94', '#D1D1D1', '#A2A2A2',
];

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (category: { name: string; icon: string; color: string }) => void;
}

export function AddCategoryModal({ isVisible, onClose, onConfirm }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('?');
  const [selectedColor, setSelectedColor] = useState(PASTEL_COLORS[0]);
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  const showModal = useCallback(() => {
    opacity.value = withTiming(1, { duration: 250 });
    translateY.value = withTiming(0, { duration: 300 });
  }, []);

  const hideModal = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      setName('');
      setIcon('?');
      setSelectedColor(PASTEL_COLORS[0]);
      showModal();
    }
  }, [isVisible, showModal]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 600) {
        runOnJS(hideModal)();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedOverlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const animatedSheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  if (!isVisible && opacity.value === 0) return null;

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={hideModal}>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <TouchableOpacity style={styles.dismissArea} onPress={hideModal} activeOpacity={1} />
        </Animated.View>
        
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheet, animatedSheetStyle]}>
            <View style={styles.handle} />
            
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>{name.trim() === '' ? 'Название' : name}</Text>
                <View style={[styles.previewCircle, { backgroundColor: selectedColor }]}>
                  <Text style={styles.previewIcon}>{icon}</Text>
                </View>
                <Text style={styles.previewAmount}>0 BYN</Text>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Введите название категории"
                  placeholderTextColor="#C7C7CC"
                  value={name}
                  onChangeText={setName}
                  maxLength={20}
                />
                <TextInput
                  style={styles.emojiInput}
                  placeholder="😃"
                  value={icon === '?' ? '' : icon}
                  onChangeText={(text) => {
                    const emojis = Array.from(text.trim());
                    setIcon(emojis.length > 0 ? emojis[emojis.length - 1] : '?');
                  }}
                  caretHidden={true}
                  selectionColor="transparent"
                />
              </View>

              <Text style={styles.sectionTitle}>Выберите цвет</Text>
              <View style={styles.colorGrid}>
                {PASTEL_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorCircleSelected
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity 
                style={styles.buttonWrapper}
                onPress={() => onConfirm({ name, icon, color: selectedColor })}
              >
                <LinearGradient
                  colors={['rgba(124, 123, 173, 0.9)', 'rgba(109, 107, 161, 0.9)']}
                  style={styles.liquidButton}
                >
                  <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                  <Text style={styles.buttonText}>Создать категорию</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dismissArea: { flex: 1 },
  sheet: {
    height: MODAL_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  previewContainer: { alignItems: 'center', marginBottom: 20 },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  previewCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  previewIcon: { fontSize: 32 },
  previewAmount: { fontSize: 13, fontWeight: '700', color: '#C7C7CC' },
  inputRow: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    height: 54,
    marginBottom: 24,
  },
  nameInput: { flex: 1, fontSize: 16, color: '#000' },
  emojiInput: { width: 45, fontSize: 26, textAlign: 'center', marginLeft: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingLeft: 2, 
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#007AFF',
    transform: [{ scale: 1.1 }],
  },
  buttonWrapper: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  liquidButton: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    zIndex: 1,
  },
});