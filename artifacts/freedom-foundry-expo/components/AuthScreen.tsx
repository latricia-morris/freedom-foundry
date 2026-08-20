import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSignIn, useSignUp, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { FoundryButton, foundry } from '@/components/FoundryUI';

function messageFrom(error: unknown) {
  if (error && typeof error === 'object' && 'errors' in error) {
    const errors = (error as { errors?: Array<{ longMessage?: string; message?: string }> }).errors;
    return errors?.[0]?.longMessage ?? errors?.[0]?.message ?? 'Please check your details and try again.';
  }
  return 'Please check your details and try again.';
}

export function AuthScreen({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter();
  const { isLoaded: signInReady, signIn, setActive } = useSignIn();
  const { isLoaded: signUpReady, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const isSignIn = mode === 'sign-in';

  async function submit() {
    setNotice(null);
    if (!email || !password) { setNotice('Enter your email and password to continue.'); return; }
    setBusy(true);
    try {
      if (isSignIn && signInReady) {
        const result = await signIn.create({ identifier: email.trim(), password });
        if (result.status === 'complete' && result.createdSessionId && setActive) { await setActive({ session: result.createdSessionId }); router.replace('/dashboard'); return; }
        setNotice('This account requires an additional verification factor. Use the verification method configured for your account, then try again.');
      } else if (!isSignIn && signUpReady) {
        const result = await signUp.create({ emailAddress: email.trim(), password });
        if (result.status === 'complete' && result.createdSessionId && setActive) { await setActive({ session: result.createdSessionId }); router.replace('/dashboard'); return; }
        if (result.unverifiedFields?.includes('email_address')) {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setVerificationPending(true);
          setNotice('We sent a verification code to your email address.');
        }
      }
    } catch (error) { setNotice(messageFrom(error)); } finally { setBusy(false); }
  }

  async function verifyEmail() {
    if (!verificationCode.trim() || !signUpReady) { setNotice('Enter the verification code from your email.'); return; }
    setNotice(null); setBusy(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode.trim() });
      if (result.status === 'complete' && result.createdSessionId && setActive) {
        await setActive({ session: result.createdSessionId });
        router.replace('/dashboard');
        return;
      }
      setNotice('That code could not complete your account. Request a new code and try again.');
    } catch (error) { setNotice(messageFrom(error)); } finally { setBusy(false); }
  }

  async function resendEmailCode() {
    if (!signUpReady) return;
    setNotice(null); setBusy(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setNotice('A new verification code has been sent.');
    } catch (error) { setNotice(messageFrom(error)); } finally { setBusy(false); }
  }

  async function oauth(strategy: 'oauth_google' | 'oauth_apple') {
    setNotice(null); setBusy(true);
    try {
      const { createdSessionId, setActive: activate } = await startSSOFlow({ strategy });
      if (createdSessionId && activate) { await activate({ session: createdSessionId }); router.replace('/dashboard'); }
    } catch (error) { setNotice(messageFrom(error)); } finally { setBusy(false); }
  }

  return (
    <LinearGradient colors={['#100e0c', '#2b1710', '#100e0c']} style={styles.canvas}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={[styles.scroll, Platform.OS === 'web' && styles.webScroll]} bottomOffset={24}>
        <View style={styles.brand}><Text style={styles.brandName}>FREEDOM FOUNDRY</Text><Text style={styles.byline}>BY THE BRAND REVIVALIST</Text></View>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{isSignIn ? 'WELCOME BACK' : 'BEGIN YOUR FORGE'}</Text>
          <Text style={styles.title}>{isSignIn ? 'Your portal awaits.' : 'Build what lasts.'}</Text>
          <Text style={styles.copy}>{verificationPending ? 'Confirm your email to finish opening your portal.' : isSignIn ? 'Sign in to continue shaping your brand legacy.' : 'Create your Freedom Foundry account.'}</Text>
          {verificationPending ? <TextInput accessibilityLabel="Verification code" autoComplete="one-time-code" keyboardType="number-pad" placeholder="Verification code" placeholderTextColor="#a69584" value={verificationCode} onChangeText={setVerificationCode} style={styles.input} /> : <><TextInput accessibilityLabel="Email address" autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="Email address" placeholderTextColor="#a69584" value={email} onChangeText={setEmail} style={styles.input} /><TextInput accessibilityLabel="Password" autoComplete={isSignIn ? 'current-password' : 'new-password'} placeholder="Password" placeholderTextColor="#a69584" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} /></>}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <FoundryButton label={busy ? 'Please wait…' : verificationPending ? 'Verify email' : isSignIn ? 'Sign in' : 'Create account'} onPress={verificationPending ? verifyEmail : submit} disabled={busy} testID="email-auth-submit" />
          {verificationPending ? <Pressable disabled={busy} onPress={resendEmailCode}><Text style={styles.switch}>Send a new code</Text></Pressable> : <><View style={styles.divider}><View style={styles.line}/><Text style={styles.dividerText}>OR CONTINUE WITH</Text><View style={styles.line}/></View><View style={styles.providers}><Pressable onPress={() => oauth('oauth_google')} style={styles.provider}><Text style={styles.providerText}>Google</Text></Pressable><Pressable onPress={() => oauth('oauth_apple')} style={styles.provider}><Text style={styles.providerText}>Apple</Text></Pressable></View><Link href={isSignIn ? '/sign-up' : '/sign-in'} style={styles.switch}>{isSignIn ? 'New here? Create an account' : 'Already a member? Sign in'}</Link></>}
        </View>
      </KeyboardAwareScrollViewCompat>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 22 },
  webScroll: { paddingTop: 88, paddingBottom: 58 },
  brand: { alignItems: 'center' },
  brandName: { color: foundry.foreground, fontSize: 25, fontWeight: '700', letterSpacing: 1.6 },
  byline: { color: '#d9c9a3', fontSize: 10, letterSpacing: 2.3, marginTop: 5 },
  card: { alignSelf: 'center', width: '100%', maxWidth: 440, borderRadius: 22, padding: 24, gap: 13, backgroundColor: 'rgba(8,8,14,0.78)', borderWidth: 1, borderColor: 'rgba(247,242,234,0.12)' },
  eyebrow: { color: foundry.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  title: { color: foundry.foreground, fontSize: 31, fontWeight: '600' },
  copy: { color: foundry.mutedForeground, lineHeight: 22, marginBottom: 5 },
  input: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#58372a', backgroundColor: '#120f0d', color: foundry.foreground, paddingHorizontal: 14, fontSize: 16 },
  notice: { color: '#f0d9b5', fontSize: 13, lineHeight: 19 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(247,242,234,0.12)' },
  dividerText: { color: foundry.mutedForeground, fontSize: 9, letterSpacing: 1 },
  providers: { flexDirection: 'row', gap: 10 },
  provider: { flex: 1, borderWidth: 1, borderColor: 'rgba(247,242,234,0.15)', minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  providerText: { color: foundry.foreground, fontWeight: '700' },
  switch: { color: foundry.primary, alignSelf: 'center', marginTop: 3 },
});