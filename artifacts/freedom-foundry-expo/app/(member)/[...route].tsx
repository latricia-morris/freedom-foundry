import { StaticPortalScreen } from '@/components/PortalScreens';
import { useLocalSearchParams } from 'expo-router';
export default function CatchAllMemberRoute() { const { route } = useLocalSearchParams<{ route: string[] }>(); return <StaticPortalScreen page={(route ?? []).join('/')} />; }