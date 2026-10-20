import React from 'react';
import { Image } from '@/components/ui/image';
import StudioField from '@/components/proposal/studio/StudioField';
import { MEDIA_LIBRARY } from '@/lib/proposalAgencyClient';
export default function StudioAsset({ asset, editing, onChange, onRemove }) {
  if (!asset?.url) return null;
  return <figure className="min-w-0 rounded-sm border border-border bg-card p-3">
    <Image src={asset.url} alt={asset.alt || ''} fittingType={asset.fit || 'fit'} focalPointX={asset.focalPointX ?? 0.5} focalPointY={asset.focalPointY ?? 0.5} className={editing ? 'h-36 w-full' : 'h-56 w-full'} />
    <figcaption className="mt-2 text-xs text-muted-foreground">{asset.name}</figcaption>
    {editing && <details className="mt-2 text-xs"><summary className="cursor-pointer">Replace / image settings</summary><div className="mt-2 space-y-2">
      <StudioField label={`${asset.name} library asset`} value="" options={[["","Choose from agency library"], ...MEDIA_LIBRARY.filter(a => a.url).map(a => [a.url,a.slot])]} onChange={v => { if (v) onChange({ ...asset,url:v }); }} />
      <StudioField label={`${asset.name} image URL`} value={asset.url} onChange={v => onChange({ ...asset,url:v })} />
      <StudioField label={`${asset.name} alt text`} value={asset.alt} onChange={v => onChange({ ...asset,alt:v })} />
      <StudioField label={`${asset.name} fit`} value={asset.fit || 'fit'} options={[["fit","Contain entire image"],["fill","Fill frame"]]} onChange={v => onChange({ ...asset,fit:v })} />
      <StudioField label={`${asset.name} horizontal position (0–1)`} type="number" value={asset.focalPointX ?? 0.5} onChange={v => onChange({ ...asset,focalPointX:Math.min(1,Math.max(0,v)) })} />
      <StudioField label={`${asset.name} vertical position (0–1)`} type="number" value={asset.focalPointY ?? 0.5} onChange={v => onChange({ ...asset,focalPointY:Math.min(1,Math.max(0,v)) })} />
      <button type="button" onClick={onRemove} className="text-destructive underline">Remove from this proposal</button>
    </div></details>}
  </figure>;
}