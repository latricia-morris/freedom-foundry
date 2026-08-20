import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import colors from '@/constants/colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const isWeb = Platform.OS === 'web';
const configuredNativeOrigin = process.env.EXPO_PUBLIC_API_ORIGIN;
const configuredDomain = process.env.EXPO_PUBLIC_DOMAIN;

// Web deliberately stays relative for the existing cookie/same-origin API behavior.
// Native uses an injected production or preview endpoint; nothing is hard-coded.
setBaseUrl(isWeb ? configuredNativeOrigin ?? null : configuredNativeOrigin ?? (configuredDomain ? `https://${configuredDomain}` : null));

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="share/[token]" />
      <Stack.Screen name="member/[brandSlug]/[profileType]" />
      <Stack.Screen name="(member)" />
    </Stack>
  );
}

function AuthTokenBridge({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  return <>{children}</>;
}

function MissingClerkConfiguration() {
  return (
    <View style={styles.config}>
      <Text style={styles.configEyebrow}>FREEDOM FOUNDRY</Text>
      <Text style={styles.configTitle}>Authentication is being prepared.</Text>
      <Text style={styles.configCopy}>
        Add the public Clerk key as EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY for an external Expo build.
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) return <MissingClerkConfiguration />;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <AuthTokenBridge>
              <GestureHandlerRootView style={styles.root}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </AuthTokenBridge>
          </ClerkProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  config: { flex: 1, justifyContent: 'center', padding: 32, backgroundColor: colors.light.background },
  configEyebrow: { color: colors.light.primary, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  configTitle: { color: colors.light.foreground, fontSize: 30, fontWeight: '600', marginTop: 14 },
  configCopy: { color: colors.light.mutedForeground, fontSize: 16, lineHeight: 24, marginTop: 12 },
});
