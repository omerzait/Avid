import {localCues,contextFlags} from './local-editor.js';
export async function runLocal({audio,cache,signal,onProgress=()=>{},onTranscript=async()=>{},onCheckpoint=async()=>{},context='',glossary=''}){
  const started=performance.now();let result=(await cache.get()).local;
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  if(!result){
    result=await new Promise((resolve,reject)=>{
      const worker=new Worker(new URL('./dual-worker.js',import.meta.url),{type:'module'});
      let pending=Promise.resolve(),done=false;
      const stop=()=>{worker.terminate();signal?.removeEventListener('abort',abort);};
      const fail=e=>{if(done)return;done=true;stop();reject(e);};
      const abort=()=>fail(new DOMException('Cancelled','AbortError'));
      signal?.addEventListener('abort',abort,{once:true});
      worker.onerror=e=>fail(Error(e.message||'עובד התמלול נכשל'));
      worker.onmessage=({data})=>{
        if(done)return;
        if(data.type==='progress')onProgress(data.text);
        if(['partial','primary','comparison'].includes(data.type))pending=pending.then(async()=>{
          await onCheckpoint({stage:data.type,data});
          if(data.words)await onTranscript({text:data.words.map(w=>w.text).join(' '),words:data.words});
        }).catch(fail);
        if(data.type==='error')fail(Error(data.message));
        if(data.type==='result'){pending.then(()=>{if(done)return;done=true;stop();resolve(data);}).catch(fail);}
      };
      worker.postMessage({audio},[audio.buffer]);
    });
    await cache.put('local',result);
  }else onProgress('תמלול מקומי שמור נטען — ללא עיבוד חוזר.');
  await onCheckpoint({stage:'local_result',data:result});
  const words=result.words,cues=contextFlags(localCues(words),context,glossary).map(c=>({...c,uncertain:c.uncertain||(result.issues||[]).some(i=>i.start<c.end&&i.end>c.start)}));
  await onTranscript({text:words.map(w=>w.text).join(' '),words});
  return {words,cues,raw:words.map(w=>w.text).join(' '),other:result.other||[],issues:result.issues||[],warning:result.warning,elapsed:(performance.now()-started)/1000,models:['ivrit-ai Whisper turbo','Whisper turbo comparison'],usage:null};
}
