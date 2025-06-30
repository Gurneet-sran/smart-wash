import { Platform } from 'react-native';

export const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 100 : 90;

export const SAFE_AREA_BOTTOM = Platform.OS === 'ios' ? 140 : 130;

export const Layout = {
  // Tab bar related spacing
  tabBarHeight: TAB_BAR_HEIGHT,
  safeAreaBottom: SAFE_AREA_BOTTOM,
  
  // Common spacing values
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Border radius values
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
}; 