// Preserve speech; context only raises review suggestions, never invents replacements.
export function localCues(words){
  const result=[];let sentence=[];
  function flush(){
    if(!sentence.length)return;
    const n=sentence.length,dp=Array(n+1).fill(Infinity),prev=[];dp[0]=0;
    for(let end=1;end<=n;end++)for(let start=Math.max(0,end-7);start<end;start++){
      const count=end-start,remaining=n-end;
      let cost=dp[start]+10+(count-5.5)**2;
      if(count<3&&n>7)cost+=12;
      if(remaining===1)cost+=25;
      // Avoid detaching a short tag or starting a cue with an object marker.
      if(end<n&&/^(אה|הא)[?؟]?$/.test(sentence[end].text))cost+=30;
      if(end<n&&/^(של|את|עם|על|אל|לפני|אחרי)$/.test(sentence[end-1].text))cost+=16;
      if(end<n&&sentence[end].text==='את')cost+=2;
      if(cost<dp[end]){dp[end]=cost;prev[end]=start;}
    }
    const groups=[];for(let end=n;end>0;){const start=prev[end];groups.unshift(sentence.slice(start,end));end=start;}
    result.push(...groups.map(g=>({start:g[0].start,end:g.at(-1).end,text:g.map(w=>w.text).join(' ')})));sentence=[];
  }
  words.forEach((w,i)=>{
    if(sentence.length&&w.start-sentence.at(-1).end>=.22)flush();
    // Some models return several written words in a timestamp chunk.
    const tokens=w.text.trim().split(/\s+/).filter(Boolean);
    tokens.forEach((text,j)=>sentence.push({...w,text,start:w.start+(w.end-w.start)*j/tokens.length,end:w.start+(w.end-w.start)*(j+1)/tokens.length}));
    const next=words[i+1];const tag=next&&/^(אה|הא)[?؟]?$/.test(next.text.trim())&&next.start-w.end<.22;
    if(/[.!?;,׃…:]$/.test(w.text.trim())&&!tag)flush();
  });flush();return result;
}
export function contextFlags(cues,context,glossary){
  const terms=glossary.split(/[,;\n]/).map(t=>t.trim()).filter(Boolean);
  const phrases=[...context.matchAll(/(?:["״])([^"״]+)(?:["״])/g)].map(m=>m[1]);
  const expected=[...terms,...phrases];
  return cues.map(c=>{
    const latin=/[a-z]{2,}/i.test(c.text)&&!expected.some(t=>/[a-z]/i.test(t)&&c.text.includes(t));
    return {...c,uncertain:latin,reviewReason:latin?'מילה לועזית שלא מופיעה במונחים — בדוק מול הקול':''};
  });
}
