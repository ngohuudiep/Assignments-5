import React, { useState, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform } from 'react-native';

// Reactive Store Provider
import { AppProvider } from './src/context/AppContext';

// Màn hình
import CourseListScreen from './src/screens/CourseListScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import CourseFormScreen from './src/screens/CourseFormScreen';
import CategoryManageScreen from './src/screens/CategoryManageScreen';
import TrailerPlayerScreen from './src/screens/TrailerPlayerScreen';

// Stack Navigator cho Web (miễn nhiễm 100% với lỗi NativeStackView.native.js của react-native-screens trên Web)
function WebStackNavigation() {
  const [history, setHistory] = useState([{ name: 'CourseList', params: {} }]);

  const current = history[history.length - 1] || { name: 'CourseList', params: {} };

  const navigation = useMemo(
    () => ({
      navigate: (name, params = {}) => {
        setHistory((prev) => [...prev, { name, params }]);
      },
      goBack: () => {
        setHistory((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
      },
      addListener: (event, callback) => {
        if (event === 'focus') {
          callback();
        }
        return () => {};
      },
    }),
    []
  );

  const route = useMemo(() => ({ params: current.params || {} }), [current.params]);

  let ScreenComponent = CourseListScreen;
  if (current.name === 'CourseDetail') ScreenComponent = CourseDetailScreen;
  else if (current.name === 'CourseForm') ScreenComponent = CourseFormScreen;
  else if (current.name === 'CategoryManage') ScreenComponent = CategoryManageScreen;
  else if (current.name === 'TrailerPlayer') ScreenComponent = TrailerPlayerScreen;

  return (
    <View style={styles.webContainer}>
      <ScreenComponent navigation={navigation} route={route} />
    </View>
  );
}

// Stack Navigator cho Điện thoại thật (Android / iOS qua Expo Go)
function NativeNavigation() {
  const { NavigationContainer } = require('@react-navigation/native');
  const { createNativeStackNavigator } = require('@react-navigation/native-stack');
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CourseList"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="CourseList" component={CourseListScreen} />
        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
        <Stack.Screen name="CourseForm" component={CourseFormScreen} />
        <Stack.Screen name="CategoryManage" component={CategoryManageScreen} />
        <Stack.Screen
          name="TrailerPlayer"
          component={TrailerPlayerScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.rootContainer}>
      <AppProvider>
        <StatusBar style="dark" />
        {Platform.OS === 'web' ? <WebStackNavigation /> : <NativeNavigation />}
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 540,
    marginHorizontal: 'auto',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    // Đổ bóng khung mobile sang trọng trên web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
});
