const bytes=s=>Uint8Array.from(s,c=>c.charCodeAt(0));
const u16=n=>Uint8Array.of(n>>>8&255,n&255);
const u32=n=>Uint8Array.of(n>>>24&255,n>>>16&255,n>>>8&255,n&255);
const zero=n=>new Uint8Array(n);
const join=(...parts)=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let i=0;for(const p of parts){out.set(p,i);i+=p.length;}return out;};
const atom=(type,...parts)=>{const data=join(...parts);return join(u32(data.length+8),bytes(type),data);};
const full=(type,...parts)=>atom(type,zero(4),...parts);
const matrix=join(u32(0x10000),zero(12),u32(0x10000),zero(12),u32(0x40000000));
export function encodeRLE(rgba,width,height,withHold=true){
 if(rgba.length!==width*height*4)throw Error('Invalid RGBA frame');
 const data=[];const equal=(a,b)=>rgba[a]===rgba[b]&&rgba[a+1]===rgba[b+1]&&rgba[a+2]===rgba[b+2]&&rgba[a+3]===rgba[b+3];
 const pixel=i=>data.push(rgba[i+3],rgba[i],rgba[i+1],rgba[i+2]);
 for(let y=0;y<height;y++){data.push(1);let x=0;while(x<width){let run=1;const p=(y*width+x)*4;while(run<127&&x+run<width&&equal(p,p+run*4))run++;if(run>=2){data.push(256-run);pixel(p);x+=run;}else{const start=x;x++;while(x<width&&x-start<127){const i=(y*width+x)*4;if(x+1<width&&equal(i,i+4))break;x++;}data.push(x-start);for(let a=start;a<x;a++)pixel((y*width+a)*4);}}data.push(255);}
 const result=join(u32(data.length+7),u16(0),Uint8Array.from(data),Uint8Array.of(0));
 // Write a real, identical top row on held frames; never use an empty packet.
 if(withHold){const row=encodeRLE(rgba.subarray(0,width*4),width,1,false);result.hold=join(u32(row.length+8),u16(8),u16(0),u16(0),u16(1),u16(0),row.subarray(6));}
 return result;
}
export function framePlan(cues,fps,duration){
 if(![24,25,30,50,60].includes(fps))throw Error('קצב פריימים לא נתמך');let previous=0;
 const last=Math.max(duration||0,...cues.map(c=>c.end));if(!Number.isFinite(last)||last<=0||last>180)throw Error('ייצוא MOV מוגבל לשלוש דקות');
 const plan=new Uint16Array(Math.max(1,Math.ceil(last*fps)));if(cues.length>2000)throw Error('יותר מדי כתוביות');
 cues.forEach((c,i)=>{if(!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<previous||c.end<=c.start||!c.text.trim())throw Error('תקן כתוביות ריקות, חופפות או בעלות זמן לא תקין לפני ייצוא MOV');const a=Math.round(c.start*fps),b=Math.max(a+1,Math.round(c.end*fps));for(let j=a;j<Math.min(b,plan.length);j++)plan[j]=i+1;previous=c.end;});return plan;
}
export function muxMOV(packets,plan,{width=1920,height=1080,fps=25,asBlob=false,compact=true}={}){
 const ftyp=atom('ftyp',bytes('qt  '),u32(0),bytes('qt  '));const samples=[],sizes=[],offsets=[],sync=[];let payload=0;
 const stored=asBlob?packets.map(p=>new Blob([p])):packets;
 const held=asBlob?packets.map(p=>p.hold?new Blob([p.hold]):null):packets.map(p=>p.hold);
 for(let i=0;i<plan.length;i++){const id=plan[i],key=!compact||i===0||plan[i-1]!==id||i%(fps*2)===0||!packets[id]?.hold;const packet=key?packets[id]:packets[id].hold;if(!packet)throw Error('Missing rendered frame');if(key)sync.push(u32(i+1));samples.push(key?stored[id]:held[id]);sizes.push(u32(packet.length));offsets.push(u32(ftyp.length+8+payload));payload+=packet.length;}
 if(payload>1500*1048576)throw Error('הקובץ גדול מדי לייצוא בדפדפן. ייצא PNG או קטע קצר יותר');
 const duration=plan.length;
 const compressor=new Uint8Array(32);compressor[0]=9;compressor.set(bytes('Animation'),1);
 const description=atom('rle ',zero(6),u16(1),zero(16),u16(width),u16(height),u32(0x480000),u32(0x480000),zero(4),u16(1),compressor,u16(32),u16(0xffff));
 const stbl=atom('stbl',full('stsd',u32(1),description),full('stts',u32(1),u32(duration),u32(1)),full('stsc',u32(1),u32(1),u32(1),u32(1)),full('stsz',u32(0),u32(duration),...sizes),full('stco',u32(duration),...offsets),full('stss',u32(sync.length),...sync));
 const dref=full('dref',u32(1),atom('url ',u32(1)));const minf=atom('minf',atom('vmhd',u32(1),zero(8)),atom('dinf',dref),stbl);
 const mdhd=full('mdhd',zero(8),u32(fps),u32(duration),u16(0x55c4),zero(2));const hdlr=full('hdlr',zero(4),bytes('vide'),zero(12),bytes('Subtitle Alpha\0'));
 const tkhd=atom('tkhd',u32(3),zero(8),u32(1),zero(4),u32(duration),zero(8),zero(8),matrix,u32(width*65536),u32(height*65536));
 const trak=atom('trak',tkhd,atom('mdia',mdhd,hdlr,minf));const mvhd=full('mvhd',zero(8),u32(fps),u32(duration),u32(0x10000),u16(0x100),zero(10),matrix,zero(24),u32(2));
 const moov=atom('moov',mvhd,trak);
 return asBlob?new Blob([ftyp,u32(payload+8),bytes('mdat'),...samples,moov],{type:'video/quicktime'}):join(ftyp,atom('mdat',...samples),moov);
}
