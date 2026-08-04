import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Главная</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon 
          sf={{ default: 'house', selected: 'house.fill' }} 
          md="home" 
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>История</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon 
          sf={{ default: 'clock', selected: 'clock.fill' }} 
          md="history" 
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ai-agent">
        <NativeTabs.Trigger.Label>ИИ Агент</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon 
          sf="sparkles" 
          md="auto_awesome" 
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Настройки</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon 
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }} 
          md="settings" 
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}