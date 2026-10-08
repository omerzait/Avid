import {cp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
const root=new URL('../',import.meta.url),src=new URL('shared/',root),out=new URL('public/',root);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});await cp(src,out,{recursive:true});
const html=await readFile(new URL('index.html',src),'utf8');
// One template and controller for both routes. The existing hosted version is untouched.
await writeFile(new URL('cloud.html',out),html);
let free=html.replace('בדיקת OpenAI בענן','חינם · עיבוד במחשב שלך')
  .replace('<section class="card"><label>מפתח API','<section class="card"><div hidden><label>מפתח API')
  .replace('<label style="margin-top:18px">הקשר הסרט','</div><label style="margin-top:18px">הקשר הסרט')
  .replace('GPT-Transcribe + GPT-6.1 Sol','Whisper עברית + הצלבה מקומית')
  .replace('הקובץ יישלח ל־OpenAI לצורך תמלול ותזמון.','הקובץ נשאר במחשב שלך. המודלים יורדים בשימוש הראשון ונשמרים במטמון הדפדפן.')
  .replace(/נדרש חיוב API פעיל\.[\s\S]*?אין הורדת מודלים\./,'ללא מפתח API וללא תשלום. הורדת המודל העברי הראשונה כ־1.6GB, ואחריה מודל נוסף להצלבה. העיבוד תלוי במחשב ויכול לקחת כמה דקות. עד שלוש דקות אודיו לקובץ. מילים בספק מסומנות בצהוב; בדוק אותן מול הקול.')
  .replace(/<p>GPT-Transcribe מפיק[\s\S]*?<\/p>/,'<p>מודל מותאם לעברית מתמלל ומתזמן, מודל נוסף מצליב, וקטעים שבהם יש מחלוקת נבדקים שוב. חלוקת שורות מאוזנת עד שבע מילים. ההקשר נשמר לעריכה; אין כאן עורך GPT בענן. איכות התמלול המקומי עדיין דורשת בדיקה.</p>')
  .replace(/<p>הקול והטקסט נשלחים[\s\S]*?<\/p>/,'<p>האודיו, הפרויקטים והמדיה נשמרים בדפדפן הזה. לא נשלחים לשרת תמלול. ספריית התמלול והמודלים יורדים ממקורות חיצוניים בשימוש הראשון. הורד גיבוי לפרויקטים חשובים.</p>')
  .replace('src="./cloud-app.js?v=16"','src="./free-main.js"');
await writeFile(new URL('index.html',out),free);
await writeFile(new URL('free-main.js',out),"globalThis.AVID_FREE=true;\nif(!globalThis.crossOriginIsolated && navigator.serviceWorker){\n  try{\n    await navigator.serviceWorker.register('./isolation-worker.js');\n    await navigator.serviceWorker.ready;\n    if(!navigator.serviceWorker.controller)await new Promise(resolve=>{navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true});setTimeout(resolve,3000);});\n    if(navigator.serviceWorker.controller && !sessionStorage.getItem('avid-isolation-attempt')){sessionStorage.setItem('avid-isolation-attempt','1');location.reload();await new Promise(()=>{});}\n  }catch{}\n}\nawait import('./cloud-app.js?v=16');\n");
let app=await readFile(new URL('cloud-app.js',src),'utf8');
app=app.replace("import {runOpenAI} from './openai-pipeline.js?v=16';","const free=globalThis.AVID_FREE===true;\nconst runOpenAI=free?(await import('./local-pipeline.js')).runLocal:(await import('./openai-pipeline.js?v=16')).runOpenAI;");
app=app.replace("if(!key.startsWith('sk-'))","if(!free&&!key.startsWith('sk-'))");
app=app.replace('if(file.size>25*1024*1024)','if(!free&&file.size>25*1024*1024)');
app=app.replace('runOpenAI({file,key,cache,','runOpenAI({file,key,audio,cache,');
app=app.replace("const key='avid-openai-v1:'","const key=(free?'avid-local-v1:':'avid-openai-v1:')");
app=app.replace("other=[];issues=cues.filter", "other=cloudResult.other||[];issues=cues.filter");
app=app.replace("'מודל התיקון סימן ספק'","c.reviewReason||'הצלבת המודלים סימנה ספק'");
app=app.replace("try{const saved=localStorage.getItem(keyStorageName);","try{const saved=free?null:localStorage.getItem(keyStorageName);");
app=app.replace('בדוק את התוצאה מול הקול.${cloudResult.timingRepairs?',"בדוק את התוצאה מול הקול.${cloudResult.warning||''}${cloudResult.timingRepairs?");
await writeFile(new URL('cloud-app.js',out),app);await writeFile(new URL('.nojekyll',out),'');
console.log('Built free index.html and cloud.html from the same interface.');
