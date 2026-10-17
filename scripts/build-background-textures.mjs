import { createCanvas } from '@napi-rs/canvas';
import { mkdir, writeFile } from 'node:fs/promises';
const output=new URL('../public/textures/',import.meta.url);
await mkdir(output,{recursive:true});
let seed=1729;
const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
const names=['MAERSK','COSCO','EVERGREEN','“K” LINE','Hapag-Lloyd','HYUNDAI','CHINA SHIPPING','P&O','CMA CGM','OOCL','ONE','MSC','YANG MING','WAN HAI'];
function drawWear(ctx,w,h){
    ctx.scale(4,4);w=h=512;
    ctx.fillStyle = '#dddcd7'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 14000; i++) {
      const v = 100 + Math.floor(random() * 150);
      ctx.fillStyle = `rgba(${v},${v - 3},${v - 8},${random() * 0.15})`;
      ctx.fillRect(random() * w, random() * h, random() * 3, random() * 17);
    }
    const shade = ctx.createLinearGradient(0, 0, 0, h);
    shade.addColorStop(0, '#201b100d'); shade.addColorStop(0.7, '#201b1000'); shade.addColorStop(1, '#241b1440');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = '#69503a38'; ctx.fillRect(random() * w, random() * h, 1 + random() * 3, 5 + random() * 85);
    }

}
const wear=createCanvas(2048,2048);drawWear(wear.getContext('2d'),2048,2048);
await writeFile(new URL('industrial-wear.webp',output),await wear.encode('webp',88));
const smallWear=createCanvas(1024,256),smallCtx=smallWear.getContext('2d');
smallCtx.drawImage(wear,0,0,1024,256);
// Corrugation shading is baked for distant containers, preserving the rib count.
for(let rib=0;rib<40;rib++){
  const start=rib*1024/40,step=1024/40;
  const shade=smallCtx.createLinearGradient(start,0,start+step,0);
  shade.addColorStop(0,'#121b2230');shade.addColorStop(.25,'#ffffff15');shade.addColorStop(.55,'#ffffff08');shade.addColorStop(.8,'#121b2228');shade.addColorStop(1,'#121b2230');
  smallCtx.fillStyle=shade;smallCtx.fillRect(start,0,step,256);
}
await writeFile(new URL('cargo-wear.webp',output),await smallWear.encode('webp',88));
const normals=createCanvas(1024,256),nctx=normals.getContext('2d'),pixels=nctx.createImageData(1024,256);
for(let y=0;y<256;y++)for(let x=0;x<1024;x++){
  const phase=(x*40/1024)%1,slope=phase>.15&&phase<.3?-.85:phase>.7&&phase<.85?.85:0;
  const nx=slope/Math.sqrt(1+slope*slope),nz=1/Math.sqrt(1+slope*slope),i=(y*1024+x)*4;
  pixels.data[i]=Math.round(128+nx*127);pixels.data[i+1]=128;pixels.data[i+2]=Math.round(128+nz*127);pixels.data[i+3]=255;
}nctx.putImageData(pixels,0,0);
// Lossless PNG keeps normal vectors intact; this repeating image is already tiny.
await writeFile(new URL('cargo-normal.png',output),await normals.encode('png'));
function drawBrand(ctx,width,height,name,index){
  ctx.save();ctx.scale(width/1536,height/320);let w=1536,h=320;
      const darkInk=index===1||index===4||index===11||index===12;
      const ink=darkInk?'#12324f':'#edf1ec';ctx.fillStyle=ink;
      ctx.textAlign='center';ctx.textBaseline='middle';
      if(index===0){
        ctx.fillStyle='#80c7d7';ctx.beginPath();ctx.roundRect(15,30,250,250,18);ctx.fill();
        ctx.fillStyle='#f4f9f9';ctx.beginPath();for(let i=0;i<14;i++){const angle=i*Math.PI/7-Math.PI/2;const radius=i%2?42:105;const x=140+Math.cos(angle)*radius,y=155+Math.sin(angle)*radius;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();
        ctx.fillStyle='#172b3e';ctx.font='bold 164px Arial';ctx.fillText(name,930,169,1180);
      }else if(index===1){
        ctx.font='bold 190px Arial';ctx.fillText('C O S C O',w/2,165,1460);
      }else if(index===3){
        ctx.font='bold 190px Georgia';ctx.fillText(name,w/2,165,1450);
      }else if(index===4){
        ctx.beginPath();ctx.moveTo(40,85);ctx.lineTo(150,85);ctx.lineTo(95,160);ctx.lineTo(155,235);ctx.lineTo(45,235);ctx.lineTo(5,160);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.moveTo(160,85);ctx.lineTo(235,85);ctx.lineTo(180,160);ctx.lineTo(240,235);ctx.lineTo(165,235);ctx.lineTo(120,160);ctx.closePath();ctx.fill();
        ctx.font='bold 145px Arial';ctx.fillText(name,925,169,1200);
      }else if(index===5){
        ctx.fillStyle='#e6c75c';ctx.beginPath();ctx.moveTo(110,47);ctx.lineTo(215,262);ctx.lineTo(5,262);ctx.closePath();ctx.fill();
        ctx.fillStyle='#ebf5f5';ctx.font='bold 150px Arial';ctx.fillText('H Y U N D A I',930,170,1190);
      }else if(index===7){
        ctx.fillStyle='#e7eff4';ctx.font='bold 215px Georgia';ctx.fillText(name,w/2,165,1400);
      }else if(index===8){
        ctx.strokeStyle='#edf1ec';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(340,60);ctx.quadraticCurveTo(730,-40,1190,60);ctx.stroke();ctx.font='bold 175px Arial';ctx.fillText(name,w/2,190,1450);
      }else if(index===10){
        ctx.font='bold 255px Arial';ctx.fillText(name,w/2,165,1350);
      }else if(index===11){
        ctx.font='bold 245px Georgia';ctx.fillText('m',w/2,125);ctx.font='bold 125px Arial';ctx.fillText('sc',w/2,246);
      }else{
        ctx.font=`bold ${index===6||index===12?125:170}px Arial`;ctx.fillText(name,w/2,165,1480);
      }

  ctx.restore();
}
const atlas=createCanvas(2048,1024),ctx=atlas.getContext('2d');
names.forEach((name,index)=>{ctx.save();ctx.translate(index%4*512+8,Math.floor(index/4)*256+8);drawBrand(ctx,496,240,name,index);ctx.restore();});
await writeFile(new URL('shipping-marks.webp',output),await atlas.encode('webp',94));
console.log('Baked four shared background texture assets.');
