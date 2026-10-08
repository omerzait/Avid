export const fonts=['Alef','Arial','Tahoma','Rubik','Heebo','David'];
export const defaults={fontFamily:'Alef',direction:'auto',fontSize:58,bottomMargin:40,textColor:'#ffffff',shadow:true,stroke:false};
export function drawSubtitle(ctx,text,cfg){
 const family=cfg.resolvedFamily==='PNGLocal'+cfg.fontFamily?cfg.resolvedFamily:(fonts.includes(cfg.fontFamily)?cfg.fontFamily:'Alef');
 const clean=text.replace(/[\r\n]+/g,' ').trim();let size=Number(cfg.fontSize);
 ctx.save();ctx.textAlign='center';ctx.textBaseline='bottom';
 ctx.font=`bold ${size}px "${family}"`;
 const measured=ctx.measureText(clean).width;
 if(measured>1700){size=size*1700/measured;ctx.font=`bold ${size}px "${family}"`;}
 ctx.direction=cfg.direction==='auto'?(/[\u0590-\u05ff]/.test(clean)?'rtl':'ltr'):cfg.direction;
 const line=(ctx.direction==='rtl'?'\u200f':'\u200e')+clean,x=960,y=1080-Number(cfg.bottomMargin);
 if(cfg.shadow){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=4;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;ctx.fillText(line,x,y);ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;}
 if(cfg.stroke){ctx.strokeStyle='#000000';ctx.lineWidth=3;ctx.lineJoin='round';ctx.strokeText(line,x,y);}
 ctx.fillStyle=cfg.textColor;ctx.fillText(line,x,y);ctx.restore();return size;
}
