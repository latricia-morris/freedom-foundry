import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const call = async (action, data = {}) => {
  const res = (await base44.functions.invoke('proposal-import',{action,...data})).data;
  if (res.error) throw new Error(res.blockers?.join('\n') || res.error);
  return res;
};
export default function useProposalStudio() {
  const {toast} = useToast(), [params,setParams] = useSearchParams();
  const [clients,setClients]=useState([]), [clientId,setClientId]=useState(params.get('client') || ''), [client,setClient]=useState(null), [clientSearch,setClientSearch]=useState('');
  const [proposals,setProposals]=useState([]), [cursor,setCursor]=useState(null), [hasMore,setHasMore]=useState(false);
  const [doc,setDoc]=useState(null), [markdown,setMarkdown]=useState(''), [incoming,setIncoming]=useState(null), [dirty,setDirty]=useState(false), [confirmReimport,setConfirmReimport]=useState(false);
  const [busy,setBusy]=useState(false), [error,setError]=useState(''), [quote,setQuote]=useState(null), [blockers,setBlockers]=useState([]), [offlineFor,setOfflineFor]=useState(null);
  const [previewDoc,setPreviewDoc]=useState(null), [previewQuote,setPreviewQuote]=useState(null), [approvedDigest,setApprovedDigest]=useState(''), [selections,setSelections]=useState({});
  const docRef=useRef(doc); docRef.current=doc;
  const run=async fn=>{setBusy(true);setError('');try{return await fn();}catch(e){const detail=e.response?.data;setError(detail?.blockers?.join('\n') || detail?.error || e.message || 'The operation could not be completed.');return null;}finally{setBusy(false);}};
  const refresh=async (more=false)=>{const page=await base44.entities.ProposalDoc.filter(clientId?{agency_client_id:clientId}:{},{sort:'-created_date',limit:25,...(more&&cursor?{cursor}:{})});setProposals(prev=>more?[...prev,...page.items]:page.items);setCursor(page.next_cursor);setHasMore(page.has_more);};
  const open=async id=>run(async()=>{const {proposal}=await call('get',{proposal_id:id});setDoc(proposal);setClientId(proposal.agency_client_id);setMarkdown(proposal.source_markdown || '');setDirty(false);setIncoming(null);setPreviewDoc(null);setApprovedDigest('');setConfirmReimport(false);setSelections({});setParams({proposal:id});});
  useEffect(()=>{if(params.get('proposal')) open(params.get('proposal'));},[]);
  useEffect(()=>{let active=true;const timer=setTimeout(async()=>{const q=clientSearch?{$or:[{company_name:{$regex:clientSearch.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),$options:'i'}},{primary_contact_name:{$regex:clientSearch.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),$options:'i'}}]}:{};const page=await base44.entities.AgencyClient.filter(q,{sort:'company_name',limit:50});if(active)setClients(page.items);},200);return()=>{active=false;clearTimeout(timer);};},[clientSearch]);
  useEffect(()=>{let active=true;if(clientId)base44.entities.AgencyClient.get(clientId).then(c=>active&&setClient(c));else setClient(null);refresh();return()=>{active=false;};},[clientId]);
  useEffect(()=>{if(doc?.content?.studio?.schema_version!==2)return;let active=true;const timer=setTimeout(async()=>{try{const res=await call('quote-studio',{payload:doc,selections});if(active){setQuote(res.quote);setBlockers(res.blockers || []);}}catch(e){if(active)setError(e.response?.data?.error || e.message);}},250);return()=>{active=false;clearTimeout(timer);};},[doc,selections]);
  const edit=next=>{setDoc(next);setDirty(true);setApprovedDigest('');setPreviewDoc(null);};
  const parse=()=>run(async()=>{const res=await call('parse-studio',{markdown,agency_client_id:clientId});if(doc)setIncoming(res.proposal);else{setDoc(res.proposal);setDirty(true);setQuote(res.quote);setApprovedDigest('');}});
  const applyImport=()=>{if(!incoming)return;edit({...incoming,id:doc.id,version:doc.version,status:doc.status,content:{...incoming.content,studio:{...incoming.content.studio,source_imports:doc.content?.studio?.source_imports || []}}});setConfirmReimport(true);setIncoming(null);};
  const saveActual=async()=>{const current=docRef.current;if(!current)return null;const res=await call('save-draft',{proposal_id:current.id,agency_client_id:current.agency_client_id,payload:current,confirm_reimport:confirmReimport});if(docRef.current===current){setDoc({...current,id:res.id});setDirty(false);}else setDoc(prev=>({...prev,id:res.id}));setConfirmReimport(false);setParams({proposal:res.id});await refresh();return res.id;};
  const save=()=>run(async()=>{const id=await saveActual();if(id)toast({title:'Draft saved'});return id;});
  const preview=()=>run(async()=>{const id=dirty||!doc.id?await saveActual():doc.id;const res=await call('preview-studio',{proposal_id:id});setPreviewDoc(res.proposal);setPreviewQuote(res.quote);setApprovedDigest(res.digest || '');setBlockers(res.blockers || []);});
  const publish=()=>run(async()=>{if(!approvedDigest||dirty)throw new Error('Save and preview this version before publishing.');const res=await call('publish',{proposal_id:doc.id,approved_digest:approvedDigest});setDoc({...doc,status:'published',share_token:res.token,version:res.version,content_digest:res.digest});setPreviewDoc(null);setApprovedDigest('');await refresh();toast({title:'Approved version published',description:'No invitation has been sent. Use Email invite when ready.'});});
  const startNew=()=>{if(dirty&&!window.confirm('Leave the unsaved edits?'))return;setDoc(null);setMarkdown('');setDirty(false);setIncoming(null);setPreviewDoc(null);setApprovedDigest('');setParams(clientId?{client:clientId}:{});};
  const send=p=>run(async()=>{await call('send',{proposal_id:p.id});toast({title:'Invitation sent'});});
  const copy=async p=>{await navigator.clipboard.writeText(`${window.location.origin}/proposal/${p.share_token}`);toast({title:'Link copied'});};
  const newVersion=()=>run(async()=>{const res=await call('new-version',{proposal_id:doc.id});setDoc(res.proposal);setDirty(false);setPreviewDoc(null);setApprovedDigest('');setParams({proposal:res.id});await refresh();});
  const recordOffline=form=>run(async()=>{await call('record-offline',{proposal_id:offlineFor.id,amount_cents:Math.round(Number(form.amount)*100),method:form.method,reference:form.reference});setOfflineFor(null);await refresh();});
  return {clients,clientId,client,clientSearch,setClientSearch,selectClient:setClientId,addClient:c=>{setClients(prev=>[c,...prev]);setClientId(c.id);},proposals,hasMore,loadMore:()=>refresh(true),doc,markdown,setMarkdown,incoming,setIncoming,dirty,busy,error,quote,blockers,offlineFor,setOfflineFor,previewDoc,setPreviewDoc,previewQuote,approvedDigest,selections,setSelections,edit,parse,applyImport,save,preview,publish,open,startNew,send,copy,newVersion,recordOffline};
}