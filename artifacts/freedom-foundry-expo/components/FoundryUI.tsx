import React from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Link, usePathname, useRouter } from 'expo-router';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

export const foundry = colors.light;
const navigation = [
  ['Home', '/dashboard', 'home'],
  ['Vault', '/vault', 'archive'],
  ['Power Moves', '/workbooks', 'zap'],
  ['Brand Portal', '/brand-portal', 'compass'],
  ['Services', '/services', 'layers'],
] as const;

export function FoundryButton({ label, onPress, disabled, variant = 'primary', testID }: { label: string; onPress?: () => void; disabled?: boolean; variant?: 'primary' | 'secondary'; testID?: string }) {
  const content = <Text style={[styles.buttonText, variant === 'secondary' && styles.secondaryText]}>{label}</Text>;
  return (
    <Pressable disabled={disabled} onPress={onPress} testID={testID} style={({ pressed }) => [styles.button, variant === 'secondary' && styles.secondaryButton, (pressed || disabled) && styles.dimmed]}>
      {variant === 'primary' ? <LinearGradient colors={['#b3232c', '#d9622c', '#f0d9b5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>{content}</LinearGradient> : content}
    </Pressable>
  );
}

export function FoundryCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function LoadingBlock() {
  return <View style={styles.loading}><ActivityIndicator color={foundry.primary} /><Text style={styles.muted}>Stoking the forge…</Text></View>;
}

export function EmptyBlock({ title, copy }: { title: string; copy: string }) {
  return <View style={styles.empty}><Feather name="inbox" size={25} color={foundry.primary} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.muted}>{copy}</Text></View>;
}

export function MemberShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const webInset = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={styles.shell}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, webInset) + 12 }]}>
        <Link href="/dashboard" style={styles.brand}>
          <LinearGradient colors={['#b3232c', '#d9622c', '#f0d9b5']} style={styles.mark}><Text style={styles.markText}>FF</Text></LinearGradient>
          <View><Text style={styles.brandName}>FREEDOM FOUNDRY</Text><Text style={styles.brandByline}>BY THE BRAND REVIVALIST®</Text></View>
        </Link>
        <Pressable accessibilityLabel="Open account settings" onPress={() => router.push('/settings')} style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0] ?? 'F').toUpperCase()}</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 116 + Math.max(insets.bottom, Platform.OS === 'web' ? 34 : 0) }]}>{title ? <Text style={styles.pageTitle}>{title}</Text> : null}{children}</ScrollView>
      <View style={[styles.tabbar, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 34 : 8) }]}>
        {navigation.map(([label, href, icon]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return <Pressable key={href} onPress={() => router.push(href)} style={[styles.tab, active && styles.tabActive]}><Feather name={icon} size={18} color={active ? foundry.primaryForeground : foundry.mutedForeground} /><Text numberOfLines={1} style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text></Pressable>;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: foundry.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(240,217,181,0.12)', backgroundColor: '#14110ff5' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, textDecorationLine: 'none' },
  mark: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#25140d', fontWeight: '800', fontSize: 12 },
  brandName: { color: foundry.foreground, fontSize: 17, fontWeight: '700', letterSpacing: 1 },
  brandByline: { color: '#d9c9a3', fontSize: 8, letterSpacing: 1.3, marginTop: 2 },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: foundry.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: foundry.primary, fontWeight: '700' },
  scroll: { padding: 20, gap: 16, alignSelf: 'center', width: '100%', maxWidth: 880 },
  pageTitle: { color: foundry.foreground, fontSize: 32, fontWeight: '600', marginBottom: 2 },
  card: { backgroundColor: foundry.card, borderRadius: colors.radius, borderWidth: 1, borderColor: 'rgba(240,217,181,0.14)', padding: 18, gap: 8 },
  button: { overflow: 'hidden', borderRadius: 12, alignSelf: 'flex-start' },
  gradient: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44, justifyContent: 'center' },
  buttonText: { color: '#25140d', fontWeight: '800', fontSize: 14 },
  secondaryButton: { borderWidth: 1, borderColor: foundry.border, paddingHorizontal: 16, paddingVertical: 12 },
  secondaryText: { color: foundry.foreground },
  dimmed: { opacity: 0.65 },
  loading: { alignItems: 'center', padding: 26, gap: 10 },
  muted: { color: foundry.mutedForeground, fontSize: 14, lineHeight: 21 },
  empty: { alignItems: 'center', padding: 26, gap: 8 },
  emptyTitle: { color: foundry.foreground, fontSize: 17, fontWeight: '600' },
  tabbar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingHorizontal: 6, paddingTop: 8, gap: 4, backgroundColor: '#100d0bf8', borderTopWidth: 1, borderTopColor: 'rgba(240,217,181,0.16)' },
  tab: { flex: 1, minHeight: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 2 },
  tabActive: { backgroundColor: foundry.primary },
  tabText: { color: foundry.mutedForeground, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  tabTextActive: { color: foundry.primaryForeground },
});