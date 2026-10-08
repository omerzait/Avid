import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,readdir} from 'node:fs/promises';
import {localCues} from '../shared/local-editor.js';
import {minimumDuration} from '../shared/cue-duration.js';
import {dsText,subtitleText} from '../shared/core.js';
const words=text=>text.split(/\s+/).map((text,i)=>({text,start:i*.3,end:i*.3+.26}));
assert.deepEqual(localCues(words('חשבת לבוא לסגור פה את החלבון של הצהריים, אה?')).map(c=>c.text),['חשבת לבוא לסגור פה','את החלבון של הצהריים, אה?']);
assert.deepEqual(localCues(words('הוא בא. היא הלכה, ואז חזרו.')).map(c=>c.text),['הוא בא','היא הלכה,','ואז חזרו']);
const pause=words('לפני הבדיחה אחרי הבדיחה');pause[2].start+=.4;pause[2].end+=.4;pause[3].start+=.4;pause[3].end+=.4;
assert.equal(localCues(pause).length,2);
for(let n=1;n<=100;n++){
 const input=words(Array.from({length:n},(_,i)=>'מילה'+i).join(' '));
 const cues=minimumDuration(localCues(input),25);
 assert.equal(cues.map(c=>c.text).join(' '),input.map(w=>w.text).join(' '));
 cues.forEach((c,i)=>{assert(c.text.split(/\s+/).length<=7);assert(Math.round((c.end-c.start)*25)>=10);if(i)assert(c.start>=cues[i-1].end);});
 dsText(cues,'01:00:00:00',25);
}
execFileSync(process.execPath,['scripts/build.mjs']);
for(const name of (await readdir('public')).filter(n=>n.endsWith('.js')))execFileSync(process.execPath,['--check','public/'+name]);
const free=await readFile('public/index.html','utf8'),cloud=await readFile('public/cloud.html','utf8');
assert(free.includes('free-main.js'));assert(cloud.includes('cloud-app.js?v=16'));
for(const id of ['pngEditor','downloadAll','context','savedMedia','cues','apiKey'])assert(free.includes('id="'+id+'"')&&cloud.includes('id="'+id+'"'));
assert.equal(await readFile('public/cloud.html','utf8'),await readFile('shared/index.html','utf8'));
console.log('PASS: balanced Hebrew cues, punctuation, pauses, seven words, ten frames, complete speech preservation, both shared builds and JS syntax.');

for(const [before,after] of [['שלום.','שלום'],['שלום...','שלום...'],['שלום…','שלום…'],['שלום?','שלום?'],['שלום!','שלום!'],['שלום.״','שלום״'],['3.14','3.14']])assert.equal(subtitleText(before),after);
