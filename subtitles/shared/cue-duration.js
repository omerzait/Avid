export function minimumDuration(cues,fps,minFrames=10){
 if(![24,25,30,50,60].includes(fps))throw Error('קצב פריימים לא תקין');
 const frames=cues.map(c=>{if(!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<0||c.end<=c.start)throw Error('זמן כתובית לא תקין');let a=Math.round(c.start*fps),b=Math.round(c.end*fps);if(b-a<minFrames){a=Math.max(0,a-Math.floor((minFrames-(b-a))/2));b=a+minFrames;}return {a,b};});
 for(let i=1;i<frames.length;i++){const left=frames[i-1],right=frames[i];if(cues[i].start<cues[i-1].start)throw Error('סדר הכתוביות אינו תקין');if(left.b>right.a){right.b=Math.max(right.b,left.a+2*minFrames);const boundary=Math.max(left.a+minFrames,Math.min(right.b-minFrames,Math.round((left.b+right.a)/2)));left.b=boundary;right.a=boundary;}}
 return cues.map((c,i)=>{const {a,b}=frames[i];return {...c,start:a/fps,end:b/fps,timingAdjusted:c.timingAdjusted||a!==Math.round(c.start*fps)||b!==Math.round(c.end*fps)};});
}
