import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { customFetch, useGetBrandUpPrompts, useGetVaultItem, useGetVaultItems, useGetWorkbookDefinition, useGetWorkbookDefinitions } from '@workspace/api-client-react';
import { EmptyBlock, FoundryCard, LoadingBlock, MemberShell, foundry } from '@/components/FoundryUI';
import { resolveExternalUrl } from '@/lib/externalUrl';

const portalPages: Record<string, { title: string; copy: string }> = {
  'brand-portal': { title: 'Your Brand Portal', copy: 'Every essential lives here — the strategy, language, visuals, and systems that make your brand unmistakable.' },
  'brand-portal/big-picture': { title: 'The Big Picture', copy: 'Set a clear horizon for the brand and life you are building.' },
  'brand-portal/personal': { title: 'Personal Brand Profile', copy: 'Shape the story people remember when they meet your work.' },
  'brand-portal/corporate': { title: 'Corporate Brand Profile', copy: 'Bring the organization’s promise into focused, confident language.' },
  'brand-portal/guidelines': { title: 'Brand Guidelines', copy: 'Keep every expression of your brand clear, consistent, and unmistakably yours.' },
  'brand-portal/assets': { title: 'Brand Assets', copy: 'Your approved visual assets, gathered in one intentional place.' },
  'brand-portal/media-kit': { title: 'Media Kit', copy: 'A ready-to-share portrait of your expertise, purpose, and proof.' },
  'brand-portal/ignite': { title: 'IgniteOS', copy: 'Turn your vision into a grounded operating rhythm.' },
  'brand-portal/checklist': { title: 'Brand Checklist', copy: 'Move from intention to completion with your next brand-building steps.' },
  'brand-portal/request-services': { title: 'Request Services', copy: 'Invite The Brand Revivalist® team into your next meaningful move.' },
  settings: { title: 'Account Settings', copy: 'Manage the account and profile details that support your Freedom Foundry experience.' },
  contact: { title: 'Contact', copy: 'The Brand Revivalist® is here when your next move needs a trusted partner.' },
  billing: { title: 'Billing', copy: 'Review your Freedom Foundry membership and connected services.' },
  admin: { title: 'Administrator', copy: 'A focused workspace for stewarding the Freedom Foundry community.' },
  'admin/users': { title: 'Member Accounts', copy: 'Review member access and portal records.' },
  'admin/brand-up': { title: 'Brand Up Prompts', copy: 'Curate the daily prompts that help members move their brands forward.' },
  podcast: { title: 'Podcast', copy: 'Listen for the stories, strategies, and sparks behind enduring brands.' },
  terms: { title: 'Terms of Use', copy: 'The terms that guide the Freedom Foundry community.' },
  privacy: { title: 'Privacy', copy: 'How Freedom Foundry handles your information with care.' },
};

export function DashboardScreen() {
  const { user } = useUser();
  const { data: vault, isLoading } = useGetVaultItems();
  const { data: workbooks } = useGetWorkbookDefinitions();
  const { data: prompts } = useGetBrandUpPrompts({ is_active: true });
  return <MemberShell>{isLoading ? <LoadingBlock /> : <><Text style={styles.greeting}>Welcome back, {user?.firstName ?? 'Founder'}.</Text><Text style={styles.lead}>Your next move is waiting in the forge.</Text><View style={styles.grid}><Metric label="Vault resources" value={vault?.length ?? 0}/><Metric label="Power Moves" value={workbooks?.length ?? 0}/><Metric label="Daily sparks" value={prompts?.length ?? 0}/></View><FoundryCard><Text style={styles.cardEyebrow}>TODAY’S POWER MOVE</Text><Text style={styles.cardTitle}>{prompts?.[0]?.title ?? 'Forge your next clear decision'}</Text><Text style={styles.copy}>{prompts?.[0]?.prompt ?? 'A strong brand is built through small, intentional choices made consistently.'}</Text><Link href="/workbooks" style={styles.link}>Open Brand Power Moves →</Link></FoundryCard><ContentPreview title="Latest from the Vault" items={vault?.slice(0, 3).map(item => ({ id: String(item.id), title: item.title, copy: item.subtitle ?? item.description ?? 'Resource' })) ?? []} href="/vault" /></>}</MemberShell>;
}

function Metric({ label, value }: { label: string; value: number }) { return <FoundryCard style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></FoundryCard>; }
function ContentPreview({ title, items, href }: { title: string; items: Array<{ id: string; title?: string; copy?: string }>; href: string }) { return <FoundryCard><Text style={styles.cardTitle}>{title}</Text>{items.length ? items.map(item => <Link key={item.id} href={`${href}/${item.id}` as Href} style={styles.row}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowCopy}>{item.copy}</Text></Link>) : <EmptyBlock title="The forge is warming up" copy="New resources will appear here as they are released." />}</FoundryCard>; }

export function VaultScreen() {
  const { data, isLoading } = useGetVaultItems();
  return <MemberShell title="The Vault">{isLoading ? <LoadingBlock /> : data?.length ? <View style={styles.stack}>{data.map(item => <Link key={item.id} href={`/vault/${item.id}`} style={styles.resource}><Text style={styles.resourceType}>{item.type?.toUpperCase() ?? 'RESOURCE'}</Text><Text style={styles.resourceTitle}>{item.title}</Text><Text style={styles.copy}>{item.subtitle ?? item.description ?? 'Open this resource to continue.'}</Text></Link>)}</View> : <EmptyBlock title="No vault items yet" copy="Your member resources will appear here." />}</MemberShell>;
}

export function VaultDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useGetVaultItem(Number(id));
  const [resourceNotice, setResourceNotice] = useState<string | null>(null);
  async function openResource(url: string) {
    const resolvedUrl = resolveExternalUrl(url);
    if (!resolvedUrl) {
      setResourceNotice('This resource needs EXPO_PUBLIC_API_ORIGIN in the native release configuration before it can be opened.');
      return;
    }
    await Linking.openURL(resolvedUrl);
  }
  return <MemberShell title="Vault resource">{isLoading ? <LoadingBlock /> : data ? <FoundryCard><Text style={styles.cardEyebrow}>{data.type?.toUpperCase() ?? 'RESOURCE'}</Text><Text style={styles.cardTitle}>{data.title}</Text><Text style={styles.copy}>{data.description ?? data.subtitle ?? 'This resource is ready when you are.'}</Text>{data.download_url ? <Pressable onPress={() => openResource(data.download_url!)}><Text style={styles.link}>Open resource →</Text></Pressable> : null}{resourceNotice ? <Text style={styles.fieldHint}>{resourceNotice}</Text> : null}</FoundryCard> : <EmptyBlock title="Resource not found" copy="This vault item may no longer be available." />}</MemberShell>;
}

export function WorkbooksScreen() {
  const { data, isLoading } = useGetWorkbookDefinitions();
  return <MemberShell title="Brand Power Moves">{isLoading ? <LoadingBlock /> : <ContentPreview title="Your workbooks" href="/workbooks" items={data?.map(item => ({ id: String(item.id), title: item.title, copy: item.description ?? 'Open workbook' })) ?? []}/>}</MemberShell>;
}

export function WorkbookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useGetWorkbookDefinition(Number(id));
  return <MemberShell title="Brand Power Move">{isLoading ? <LoadingBlock /> : data ? <FoundryCard><Text style={styles.cardTitle}>{data.title}</Text><Text style={styles.copy}>{data.description ?? 'Work through this exercise at your own pace.'}</Text><Text style={styles.fieldHint}>Workbook responses are saved to your member portal after you complete each exercise in the browser or mobile client.</Text></FoundryCard> : <EmptyBlock title="Workbook not found" copy="This Power Move may no longer be available." />}</MemberShell>;
}

export function StaticPortalScreen({ page }: { page: string }) {
  if (page === 'settings') return <QuickBooksSupportScreen />;
  const data = portalPages[page] ?? { title: 'Freedom Foundry', copy: 'Forge the brand and life that create more freedom.' };
  return <MemberShell title={data.title}><FoundryCard><Text style={styles.copy}>{data.copy}</Text>{page === 'brand-portal' ? <View style={styles.portalLinks}>{Object.entries(portalPages).filter(([key]) => key.startsWith('brand-portal/')).map(([key, child]) => <Link key={key} href={`/${key}`} style={styles.row}><Text style={styles.rowTitle}>{child.title}</Text><Text style={styles.rowCopy}>{child.copy}</Text></Link>)}</View> : <Text style={styles.fieldHint}>This destination shares the current Freedom Foundry API and will keep expanding toward browser-level editing parity.</Text>}</FoundryCard></MemberShell>;
}

function QuickBooksSupportScreen() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [intuitTid, setIntuitTid] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitReport() {
    if (!description.trim() || submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await customFetch('/api/support/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          provider: 'quickbooks',
          page_context: '/settings',
          intuit_tid: intuitTid.trim() || undefined,
          occurred_at: new Date().toISOString(),
        }),
        responseType: 'json',
      });
      setDescription('');
      setIntuitTid('');
      setMessage('Report sent. Our support team has the details they need.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send the report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MemberShell title="Account Settings">
      <FoundryCard>
        <Text style={styles.copy}>Manage the account details that support your Freedom Foundry experience.</Text>
        <View style={styles.supportDivider} />
        <Text style={styles.cardEyebrow}>QUICKBOOKS SUPPORT</Text>
        <Text style={styles.cardTitle}>Report a problem</Text>
        <Text style={styles.copy}>Tell us what happened. We’ll attach this page and the current time to help troubleshoot quickly.</Text>
        <Text style={styles.inputLabel}>WHAT WENT WRONG?</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          maxLength={5000}
          placeholder="Describe the QuickBooks issue you encountered..."
          placeholderTextColor="rgba(247,242,234,0.45)"
          style={[styles.input, styles.multilineInput]}
          textAlignVertical="top"
        />
        <Text style={styles.inputLabel}>ERROR TID, IF SHOWN</Text>
        <TextInput
          value={intuitTid}
          onChangeText={setIntuitTid}
          maxLength={256}
          autoCapitalize="none"
          placeholder="Paste the intuit_tid shown with the error"
          placeholderTextColor="rgba(247,242,234,0.45)"
          style={styles.input}
        />
        <Pressable onPress={submitReport} disabled={!description.trim() || submitting} style={[styles.request, (!description.trim() || submitting) && styles.dimmed]}>
          <Text style={styles.requestText}>{submitting ? 'Sending…' : 'Send to support'}</Text>
        </Pressable>
        {message ? <Text accessibilityRole="alert" style={styles.fieldHint}>{message}</Text> : null}
        <Pressable onPress={async () => { await signOut(); router.replace('/sign-in'); }} style={[styles.request, styles.signOut]}>
          <Text style={styles.secondaryText}>Sign out</Text>
        </Pressable>
      </FoundryCard>
    </MemberShell>
  );
}

type SharedProfile = {
  profile_type: string;
  profile: Record<string, unknown>;
  guidelines: Record<string, unknown> | null;
  assets: Array<Record<string, unknown>>;
  brand: Record<string, unknown>;
};

function humanize(key: string) {
  return key.replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());
}

function shareValue(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.filter(item => typeof item === 'string').join(', ') || null;
  return null;
}

function SharedFields({ title, fields }: { title: string; fields: Record<string, unknown> | null }) {
  const entries = Object.entries(fields ?? {}).map(([key, value]) => [key, shareValue(value)] as const).filter((entry): entry is readonly [string, string] => Boolean(entry[1]));
  if (!entries.length) return null;
  return <FoundryCard style={styles.sharedSection}><Text style={styles.cardEyebrow}>{title}</Text>{entries.map(([key, value]) => <View key={key} style={styles.sharedField}><Text style={styles.sharedLabel}>{humanize(key)}</Text><Text style={styles.copy}>{value}</Text></View>)}</FoundryCard>;
}

export function PublicShareScreen() {
  const { token, k } = useLocalSearchParams<{ token?: string; k?: string }>();
  // The browser client supports both canonical /share/:token URLs and the
  // older member profile URLs that carry the share token in ?k=.
  const shareToken = token ?? k ?? '__missing_share_token__';
  const { data, isLoading, error } = useQuery({
    queryKey: ['shared-profile', shareToken],
    queryFn: () => customFetch<SharedProfile>(`/api/shared-profile/${encodeURIComponent(shareToken)}`),
    enabled: shareToken !== '__missing_share_token__',
  });
  const tagline = shareValue(data?.brand.tagline) ?? shareValue(data?.profile.tagline);
  return <View style={styles.public}><Text style={styles.publicBrand}>FREEDOM FOUNDRY</Text>{isLoading ? <LoadingBlock /> : data ? <View style={styles.sharedStack}><FoundryCard style={styles.publicCard}><Text style={styles.cardEyebrow}>SHARED {data.profile_type.replace('_', ' ').toUpperCase()}</Text><Text style={styles.cardTitle}>{tagline ?? 'A brand made to be remembered.'}</Text><Text style={styles.copy}>A public brand profile, shared with permission through Freedom Foundry.</Text></FoundryCard><SharedFields title="BRAND PROFILE" fields={data.profile} /><SharedFields title="BRAND FOUNDATION" fields={data.brand} /><SharedFields title="GUIDELINES" fields={data.guidelines} />{data.assets.length ? <FoundryCard style={styles.sharedSection}><Text style={styles.cardEyebrow}>BRAND ASSETS</Text>{data.assets.map((asset, index) => { const name = shareValue(asset.name) ?? shareValue(asset.title) ?? shareValue(asset.filename) ?? `Asset ${index + 1}`; const url = shareValue(asset.url) ?? shareValue(asset.file_url) ?? shareValue(asset.public_url); const resolvedUrl = url ? resolveExternalUrl(url) : null; return resolvedUrl ? <Pressable key={`${name}-${index}`} onPress={() => Linking.openURL(resolvedUrl)}><Text style={styles.link}>{name} →</Text></Pressable> : <Text key={`${name}-${index}`} style={styles.copy}>{name}</Text>; })}</FoundryCard> : null}</View> : <EmptyBlock title="This share link is unavailable" copy={error ? 'The link may be expired, invalid, or no longer shared.' : 'This public profile is not currently active.'} />}</View>;
}

export function ServiceScreen() { const router = useRouter(); return <MemberShell title="Services"><FoundryCard><Text style={styles.cardTitle}>Bring in the revival team.</Text><Text style={styles.copy}>Choose the support that will move your brand from possibility to presence.</Text><Pressable onPress={() => router.push('/brand-portal/request-services')} style={styles.request}><Text style={styles.requestText}>Request services</Text></Pressable></FoundryCard></MemberShell>; }

const styles = StyleSheet.create({
  greeting: { color: foundry.foreground, fontSize: 30, fontWeight: '600' }, lead: { color: foundry.mutedForeground, fontSize: 16, marginTop: -10 },
  grid: { flexDirection: 'row', gap: 10 }, metric: { flex: 1, padding: 14 }, metricValue: { color: foundry.primary, fontSize: 27, fontWeight: '700' }, metricLabel: { color: foundry.mutedForeground, fontSize: 11, marginTop: 3 },
  cardEyebrow: { color: foundry.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 }, cardTitle: { color: foundry.foreground, fontSize: 22, fontWeight: '600' }, copy: { color: foundry.mutedForeground, fontSize: 15, lineHeight: 23 },
  link: { color: foundry.primary, fontSize: 14, fontWeight: '700', marginTop: 5 }, stack: { gap: 12 }, resource: { backgroundColor: foundry.card, borderColor: 'rgba(240,217,181,0.14)', borderWidth: 1, borderRadius: 16, padding: 18, gap: 7, textDecorationLine: 'none' },
  resourceType: { color: foundry.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 }, resourceTitle: { color: foundry.foreground, fontSize: 21, fontWeight: '600' }, row: { borderTopWidth: 1, borderTopColor: 'rgba(240,217,181,0.12)', paddingVertical: 13, textDecorationLine: 'none' },
  rowTitle: { color: foundry.foreground, fontSize: 16, fontWeight: '700' }, rowCopy: { color: foundry.mutedForeground, fontSize: 13, lineHeight: 19, marginTop: 3 }, fieldHint: { color: '#d9c9a3', fontSize: 13, lineHeight: 20, marginTop: 8 },
  portalLinks: { marginTop: 8 }, public: { flex: 1, padding: 28, justifyContent: 'center', backgroundColor: foundry.background, gap: 16 }, publicBrand: { color: foundry.primary, fontSize: 15, fontWeight: '800', letterSpacing: 2, textAlign: 'center' }, publicCard: { maxWidth: 600, width: '100%', alignSelf: 'center' }, sharedStack: { width: '100%', maxWidth: 760, alignSelf: 'center', gap: 14 }, sharedSection: { gap: 8 }, sharedField: { borderTopWidth: 1, borderTopColor: 'rgba(240,217,181,0.12)', paddingTop: 9, gap: 3 }, sharedLabel: { color: foundry.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  request: { alignSelf: 'flex-start', marginTop: 8, borderColor: foundry.primary, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 11 }, requestText: { color: foundry.primary, fontWeight: '800' }, secondaryText: { color: foundry.mutedForeground, fontWeight: '700' }, signOut: { borderColor: 'rgba(240,217,181,0.22)', marginTop: 4 }, dimmed: { opacity: 0.5 },
  supportDivider: { height: 1, backgroundColor: 'rgba(240,217,181,0.12)', marginVertical: 10 }, inputLabel: { color: foundry.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 8 }, input: { width: '100%', minHeight: 46, borderWidth: 1, borderColor: 'rgba(240,217,181,0.2)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: foundry.foreground, backgroundColor: 'rgba(0,0,0,0.18)', fontSize: 14 }, multilineInput: { minHeight: 120 },
});