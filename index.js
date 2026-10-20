import * as ExpoModulesCore from 'expo-modules-core';

// Polyfill registerWebModule cho Expo 51/52 Web
if (typeof ExpoModulesCore.registerWebModule !== 'function') {
  try {
    ExpoModulesCore.registerWebModule = ExpoModulesCore.createWebModule || function (moduleImpl) {
      return moduleImpl;
    };
  } catch (e) {
    console.warn('Could not polyfill registerWebModule:', e);
  }
}

if (typeof window !== 'undefined') {
  window.registerWebModule = ExpoModulesCore.registerWebModule;
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
