# Expo SDK Version Notes

## Current Version (SDK 52)

### Dependencies
- **Expo SDK**: ~52.0.0
- **React Native**: 0.76.3
- **React**: 18.3.1
- **Redux Toolkit**: 2.2.1
- **React Redux**: 9.1.0
- All navigation and Expo packages updated to compatible versions

### Previous Upgrade History
- Originally upgraded from SDK 49 → SDK 54
- Reverted to SDK 52 for stability (SDK 52 is the stable release with RN 0.76 support)

### Configuration Updates

#### 1. TypeScript Configuration
- Enabled `strict` mode for better type safety
- Changed `moduleResolution` from "node" to "bundler" (recommended for modern Expo projects with TypeScript 5.x)

#### 2. App Configuration (app.json)
- Added bundle identifiers for iOS and Android
- Configured notification plugin with icon and color
- Added required Android permissions for notifications (SCHEDULE_EXACT_ALARM)

#### 3. Missing Dependencies Added
- Added `react-native-gesture-handler` (required by React Navigation)

## Breaking Changes to Watch For

### Redux Toolkit 2.x
- RTK 2.x has improved TypeScript support but is mostly backward compatible
- Current implementation is compatible, no changes needed

### React Native 0.76
- New architecture is now stable but optional
- PropTypes are deprecated (use TypeScript instead)
- Some deprecated APIs removed

### Expo SDK 52
- Minimum iOS version: 13.4
- Minimum Android version: 6.0 (API 23)
- Stable release with React Native 0.76 support

## Next Steps

1. **Install dependencies**:
   ```bash
   cd client
   npm install
   ```

2. **Clear cache and rebuild**:
   ```bash
   npm start -- --clear
   ```

3. **Test critical flows**:
   - Authentication (login/signup)
   - Plan setup
   - Cigarette logging
   - Notifications

4. **Check for deprecation warnings** in the console

## Potential Issues

### If you encounter build errors:
```bash
# Clear all caches
rm -rf node_modules
rm package-lock.json
npm install

# Clear Expo cache
npx expo start --clear
```

### If notifications don't work:
- Ensure notification icon exists at `./assets/notification-icon.png`
- Test on physical device (notifications don't work in simulator)

### If navigation breaks:
- Ensure `react-native-gesture-handler` is properly imported in App.tsx
- Add to top of App.tsx if needed:
  ```typescript
  import 'react-native-gesture-handler';
  ```

## Resources
- [Expo SDK 52 Release Notes](https://expo.dev/changelog/2024/09-18-sdk-52)
- [React Native 0.76 Release](https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture)
- [Redux Toolkit 2.0 Migration](https://redux-toolkit.js.org/migrations/migrating-2.0)
