import React from 'react';
import { useParams } from 'react-router-dom';
import GuidelineBundle from '@/components/guidelines/GuidelineBundle';
import { useGuidelines } from '@/components/guidelines/useIgniteClient';

export default function IgniteGuidelinesPage() {
  const { clientId } = useParams();
  const { data, isPending, isError } = useGuidelines(clientId);
  if (isPending) return <p className="ig-muted" style={{ paddingTop: 16 }}>Loading guidelines…</p>;
  if (isError) return <p className="ig-muted" style={{ paddingTop: 16 }}>Guidelines could not be loaded.</p>;
  if (!data?.guideline) return <p className="ig-muted" style={{ paddingTop: 16 }}>No guidelines have been added for this client yet.</p>;
  return <div style={{ paddingTop: 4 }}><GuidelineBundle guideline={data.guideline} /></div>;
}