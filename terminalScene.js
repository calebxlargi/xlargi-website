import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// All dimensions are metres. Repeated structural parts are instanced by material.
export function createTerminalScene(renderer, mobile) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#141d2a');
  scene.fog = new THREE.FogExp2('#182332', 0.0055);
  const textures = new Set();
  const materials = new Set();
  const geometries = new Set();
  const batches = new Map();
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitCylinder = new THREE.CylinderGeometry(1, 1, 1, 12);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const axis = new THREE.Vector3(0, 1, 0);
  let seed = 1729;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const texture = canvas => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.add(t); return t;
  };
  function canvasTexture(width, height, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    draw(canvas.getContext('2d'), width, height);
    return texture(canvas);
  }
  const paintWear = canvasTexture(2048, 2048, (ctx, w, h) => {
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
  });
  const asphalt = canvasTexture(1024, 1024, (ctx, w, h) => {
    const data = ctx.createImageData(w, h);
    for (let i = 0; i < data.data.length; i += 4) {
      const v = 45 + random() * 27;
      data.data[i] = v; data.data[i + 1] = v + 1; data.data[i + 2] = v + 3; data.data[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
    ctx.strokeStyle = '#b2bcc21a'; ctx.lineWidth = 1.4;
    for (let i = 0; i <= 1024; i += 128) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = '#1a1b1d06'; ctx.beginPath();
      ctx.ellipse(random() * w, random() * h, random() * 60, random() * 18, random() * 6, 0, Math.PI * 2); ctx.fill();
    }
  });
  asphalt.wrapS = asphalt.wrapT = THREE.RepeatWrapping;
  asphalt.repeat.set(20, 20);
  const mat = (color, roughness = 0.55, metalness = 0.25, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra }); materials.add(m); return m;
  };
  const steel = mat('#a6afba', 0.3, 0.85);
  const galvanized = mat('#738293', 0.45, 0.8);
  const black = mat('#17202a', 0.5, 0.5);
  const rubber = mat('#101216', 0.94, 0.02);
  const chrome = mat('#c4ced8', 0.2, 0.95);
  const concrete = mat('#626b75', 0.95, 0.05);
  const white = mat('#d4d9df', 0.4, 0.4);
  // High-resolution enamel detail is neutral so red and ivory panels share the same finish.
  const cabEnamel = canvasTexture(4096, 2048, (ctx, w, h) => {
    ctx.fillStyle='#f8f8f6'; ctx.fillRect(0,0,w,h);
    for(let i=0;i<60000;i++){
      ctx.fillStyle=`rgba(80,75,68,${0.015+random()*0.045})`;
      ctx.fillRect(random()*w,random()*h,0.5+random()*1.5,0.5+random()*2);
    }
    const roadDust=ctx.createLinearGradient(0,h*0.65,0,h);
    roadDust.addColorStop(0,'#675d4900');roadDust.addColorStop(1,'#675d4955');
    ctx.fillStyle=roadDust;ctx.fillRect(0,0,w,h);
    for(let i=0;i<1100;i++){
      const x=random()*w,y=h*(0.7+random()*0.3);
      ctx.fillStyle=i%4?'#6f655245':'#b6aaa06b';ctx.fillRect(x,y,1+random()*7,1+random()*3);
    }
    for(let i=0;i<90;i++){
      ctx.fillStyle='#66544720';ctx.fillRect(random()*w,random()*h,1+random()*3,25+random()*140);
    }
    for(let i=0;i<450;i++){
      ctx.strokeStyle='#5f594532';ctx.lineWidth=0.5+random();
      const x=random()*w,y=random()*h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*18,y+random()*85);ctx.stroke();
    }
  });
  // Localised chips and rain tracks remain visible under the softened key light.
  const cabMicro = canvasTexture(2048,2048,(ctx,w,h)=>{
    const pixels=ctx.createImageData(w,h);
    for(let i=0;i<pixels.data.length;i+=4){const v=170+Math.floor(random()*40);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}
    ctx.putImageData(pixels,0,0);
    for(let i=0;i<7000;i++){
      ctx.strokeStyle=i%3?'#38383835':'#f0f0f040';ctx.lineWidth=0.5+random();
      const x=random()*w,y=random()*h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2+random()*26,y+random()*2);ctx.stroke();
    }
    for(let i=0;i<160;i++){
      const x=random()*w,y=random()*h,r=20+random()*100,g=ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,'#25252525');g.addColorStop(1,'#25252500');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
    }
  });
  cabMicro.colorSpace=THREE.NoColorSpace;
  const cabFinish={map:cabEnamel,roughnessMap:cabMicro,bumpMap:cabMicro,bumpScale:0.004,envMapIntensity:0.45};
  const cabPaint = mat('#821b24', 0.64, 0.5, cabFinish);
  const glass = mat('#0e202d', 0.09, 0.75, { envMapIntensity: 1.8 });
  const lens = mat('#bac7d7', 0.1, 0.7);
  const glow = mat('#fff1d5', 0.2, 0.1, { emissive: '#fff0cf', emissiveIntensity: 5 });
  const redGlow = mat('#ff213c', 0.3, 0.1, { emissive: '#ff0929', emissiveIntensity: 4 });
  const amber = mat('#ffb543', 0.2, 0.2, { emissive: '#ff910c', emissiveIntensity: 2 });
  const paints = ['#244d78','#b74b35','#b6bbb8','#d0ad35','#739598','#893d32','#cf722b','#c8c4b5','#277b65','#242f59','#b33673','#bc3537','#2085a8'].map(color => mat(color, 0.65, 0.35, { map: paintWear, bumpMap: paintWear, bumpScale:0.009, envMapIntensity:0.45 }));
  // Aged off-white paint: rain streaks follow the corrugations; roof seams and lower rails collect grime.
  const containerWeather=canvasTexture(2048,512,(ctx,w,h)=>{
    ctx.fillStyle='#d3d2cd';ctx.fillRect(0,0,w,h);
    for(let i=0;i<34000;i++){
      const tone=110+Math.floor(random()*125);ctx.fillStyle=`rgba(${tone},${tone-3},${tone-8},${0.025+random()*0.1})`;
      ctx.fillRect(random()*w,random()*h,1+random()*5,1+random()*9);
    }
    for(let rib=0;rib<40;rib++){
      const x=rib*w/40+random()*10;const height=60+random()*360;
      const stain=ctx.createLinearGradient(0,0,0,height);stain.addColorStop(0,'#332b2080');stain.addColorStop(0.24,'#514c3d30');stain.addColorStop(1,'#30291c00');
      ctx.fillStyle=stain;ctx.fillRect(x,0,2+random()*8,height);
      if(rib%3===0){ctx.fillStyle='#8d5d384a';ctx.fillRect(x+2,0,1+random()*3,12+random()*90);}
    }
    const dirt=ctx.createLinearGradient(0,h*0.63,0,h);dirt.addColorStop(0,'#39332a00');dirt.addColorStop(1,'#39332a72');ctx.fillStyle=dirt;ctx.fillRect(0,h*0.63,w,h*0.37);
    for(let i=0;i<180;i++){
      const x=random()*w,y=random()>.5?random()*22:h-random()*22;
      ctx.fillStyle=random()>.4?'#765137aa':'#50524d80';ctx.fillRect(x,y,2+random()*26,1+random()*7);
    }
    for(let i=0;i<35;i++){
      const x=random()*w,y=80+random()*320;
      const g=ctx.createRadialGradient(x,y,1,x,y,20+random()*45);g.addColorStop(0,'#5b51452a');g.addColorStop(1,'#5b514500');ctx.fillStyle=g;ctx.fillRect(x-70,y-70,140,140);
    }
  });
  const mainPaint = mat('#e0e2e0',0.86,0.12,{map:containerWeather,bumpMap:containerWeather,bumpScale:0.018});
  const fittingBlue = mat('#178bb5',0.55,0.45);
  const cabAccent = mat('#8f1d25', 0.64, 0.5, cabFinish);
  const chassisPaint = mat('#34383c', 0.82, 0.35, { map: paintWear });
  const rust = mat('#77533f', 0.96, 0.08);
  let disposed = false;
  function instance(geometry, parent, material, transform) {
    let parentBatches = batches.get(parent);
    if (!parentBatches) { parentBatches = new Map(); batches.set(parent, parentBatches); }
    let materialBatches = parentBatches.get(material);
    if (!materialBatches) { materialBatches = new Map(); parentBatches.set(material, materialBatches); }
    let entries = materialBatches.get(geometry);
    if (!entries) { entries = []; materialBatches.set(geometry, entries); }
    entries.push(transform.clone());
  }
  function box(parent, size, at, material = steel, euler) {
    position.set(...at); scale.set(...size); rotation.identity();
    if (euler) rotation.setFromEuler(new THREE.Euler(...euler));
    matrix.compose(position, rotation, scale); instance(unitBox, parent, material, matrix);
  }
  function beam(parent, from, to, radius = 0.035, material = steel) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const direction = b.clone().sub(a);
    position.copy(a).add(b).multiplyScalar(0.5);
    rotation.setFromUnitVectors(axis, direction.clone().normalize());
    scale.set(radius, direction.length(), radius);
    matrix.compose(position, rotation, scale); instance(unitCylinder, parent, material, matrix);
  }
  function mesh(parent, geometry, material, at = [0, 0, 0]) {
    const object = new THREE.Mesh(geometry, material); object.position.set(...at);
    object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
  }
  function rounded(parent, size, radius, at, material) {
    return mesh(parent, new RoundedBoxGeometry(...size, 3, radius), material, at);
  }
  function decal(parent, map, width, height, at, yRotation = 0) {
    const m = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }); materials.add(m);
    const object = mesh(parent, new THREE.PlaneGeometry(width, height), m, at);
    object.rotation.y = yRotation; object.castShadow = false; return object;
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.32;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#c3d7f4', '#424044', 0.8));
  const moon = new THREE.DirectionalLight('#dbe5ff', 1.55);
  moon.position.set(8, 28, 15); moon.castShadow = true;
  moon.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  moon.shadow.camera.left = -25; moon.shadow.camera.right = 25;
  moon.shadow.camera.top = 22; moon.shadow.camera.bottom = -22;
  moon.shadow.camera.near = 1; moon.shadow.camera.far = 85;
  moon.shadow.normalBias = 0.045; moon.shadow.bias = -0.0001;
  moon.shadow.blurSamples = 8; scene.add(moon);
  const groundMat = mat('#81858b', 0.72, 0.15, { map: asphalt, bumpMap: asphalt, bumpScale: 0.035 });
  const ground = mesh(scene, new THREE.PlaneGeometry(300, 214), groundMat, [0, 0, 43]);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.castShadow = false;
  const apronGrid = new THREE.GridHelper(180, 120, '#8a9aa5', '#7d8d99');
  apronGrid.position.set(0, 0.025, 26);
  apronGrid.material.transparent = true;
  apronGrid.material.opacity = 0.15;
  apronGrid.material.depthWrite = false;
  scene.add(apronGrid);
  // Quay edge, dark water and the lit container terminal beyond the inspection apron.
  // One continuous asphalt apron replaces the raised concrete platform.
  const waveBump=canvasTexture(1024,1024,(ctx,w,h)=>{
    const data=ctx.createImageData(w,h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const v=128+28*Math.sin(x*0.065+Math.sin(y*0.031)*2)+18*Math.sin(y*0.16+x*0.022);
      const i=(y*w+x)*4;data.data[i]=data.data[i+1]=data.data[i+2]=v;data.data[i+3]=255;
    }ctx.putImageData(data,0,0);
  });
  waveBump.colorSpace=THREE.NoColorSpace;waveBump.wrapS=waveBump.wrapT=THREE.RepeatWrapping;waveBump.repeat.set(12,7);
  const waterColor=canvasTexture(2048,1024,(ctx,w,h)=>{
    ctx.fillStyle='#235567';ctx.fillRect(0,0,w,h);
    for(let i=0;i<6500;i++){
      ctx.strokeStyle=i%3?'#84a8b31c':'#071e3033';ctx.lineWidth=0.4+random()*1.3;
      const x=random()*w,y=random()*h;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+8,y-1,x+4+random()*42,y);ctx.stroke();
    }
  });waterColor.wrapS=waterColor.wrapT=THREE.RepeatWrapping;waterColor.repeat.set(5,4);
  const sea = mesh(scene, new THREE.PlaneGeometry(350, 160), mat('#155368', 0.32, 0.35,{map:waterColor,bumpMap:waveBump,bumpScale:0.3,envMapIntensity:0.65,emissive:'#0a3040',emissiveIntensity:0.35}), [0, -0.8, -144]);
  sea.rotation.x = -Math.PI / 2; sea.castShadow = false;
  // The asphalt terminates at a concrete quay wall, with fenders and mooring hardware.
  const quayConcrete=mat('#6c7271',0.96,0,{map:paintWear});
  box(scene,[300,4,1.2],[0,-2,-64],quayConcrete);
  box(scene,[300,0.14,0.9],[0,-0.02,-63.8],quayConcrete);
  const quayYellow=mat('#b2a05c',0.88,0.05);
  for(let x=-145;x<150;x+=5){
    box(scene,[2.5,0.025,0.25],[x,0.065,-63.3],quayYellow);
    box(scene,[0.8,2.2,0.65],[x,-1.3,-64.8],rubber);
    box(scene,[0.95,0.13,0.8],[x,0.1,-62.6],steel);
    beam(scene,[x-0.25,0.12,-62.6],[x-0.25,0.6,-62.6],0.12,black);
    beam(scene,[x+0.25,0.12,-62.6],[x+0.25,0.6,-62.6],0.12,black);
    beam(scene,[x-0.45,0.52,-62.6],[x+0.45,0.52,-62.6],0.1,black);
  }
  for(const x of [-78,-30,22,72])beam(scene,[x,0.45,-62.6],[x+5,3.8,-73.1],0.045,mat('#766c50',0.95,0));
  const stripe = mat('#d2c49a', 0.85, 0);
  for (const z of [-5, 5]) box(scene, [95, 0.012, 0.09], [0, 0.02, z], stripe);
  for (let x = -45; x < 50; x += 5) box(scene, [2, 0.012, 0.08], [x, 0.022, 0], stripe);
  // Marked background traffic lane uses the same gridded asphalt as the inspection lane.
  for(const z of [-21.5,-14.5])box(scene,[180,0.012,0.09],[0,0.025,z],stripe);
  for(let x=-90;x<90;x+=5)box(scene,[2.1,0.012,0.08],[x,0.026,-18],stripe);

  // Corrugated ISO container sides and roof are actual geometry, not painted stripes.
  function containerGeometry() {
    const verts = [], uvs = [];
    const triangle = (a, b, c, uvA, uvB, uvC) => { verts.push(...a, ...b, ...c); uvs.push(...uvA, ...uvB, ...uvC); };
    const quad = (a, b, c, d, uv) => { triangle(a, b, d, uv[0], uv[1], uv[3]); triangle(b, c, d, uv[1], uv[2], uv[3]); };
    const length = 12.2, height = 2.9, width = 2.44, steps = 240;
    const wave = i => { const phase = i % 6; return phase === 0 || phase === 5 ? 0 : phase === 1 || phase === 4 ? 0.025 : 0.06; };
    for (let i = 0; i < steps; i++) {
      const x0 = -length / 2 + i * length / steps, x1 = x0 + length / steps;
      const u0 = i / steps, u1 = (i + 1) / steps;
      for (const side of [-1, 1]) {
        const z0 = side * (width / 2 + wave(i)), z1 = side * (width / 2 + wave(i + 1));
        const points = [[x0, 0.1, z0], [x1, 0.1, z1], [x1, height - 0.1, z1], [x0, height - 0.1, z0]];
        if (side < 0) points.reverse();
        quad(...points, [[u0, 0], [u1, 0], [u1, 1], [u0, 1]]);
      }
      quad([x0, height + wave(i) * 0.5, -width / 2], [x0, height + wave(i) * 0.5, width / 2], [x1, height + wave(i + 1) * 0.5, width / 2], [x1, height + wave(i + 1) * 0.5, -width / 2], [[u0, 0], [u0, 1], [u1, 1], [u1, 0]]);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.computeVertexNormals();
    return geometry;
  }
  const containerGeo = containerGeometry();
  // Shipping-line markings based on the supplied container-stack reference.
  const shippingNames=['MAERSK','COSCO','EVERGREEN','“K” LINE','Hapag-Lloyd','HYUNDAI','CHINA SHIPPING','P&O','CMA CGM','OOCL','ONE','MSC','YANG MING','WAN HAI'];
  const shippingMaterials=shippingNames.map((name,index)=>{
    const label=canvasTexture(3072,640,(ctx,w,h)=>{
      ctx.scale(2,2);w=1536;h=320;
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
    });
    return mat('#ffffff',0.78,0.05,{map:label,transparent:true,alphaTest:0.08,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  });
  function shippingSkin(){
    const vertices=[],uv=[];const left=-4.9,right=4.9,bottom=0.9,top=2.05;
    for(const side of [-1,1])for(let i=24;i<216;i++){
      const x0=-6.1+i*12.2/240,x1=-6.1+(i+1)*12.2/240;
      if(x0<left||x1>right)continue;
      const wave=n=>{const phase=n%6;return phase===0||phase===5?0:phase===1||phase===4?0.025:0.06;};
      const z0=side*(1.22+wave(i)+0.007),z1=side*(1.22+wave(i+1)+0.007);
      vertices.push(x0,bottom,z0,x1,bottom,z1,x0,top,z0,x1,bottom,z1,x1,top,z1,x0,top,z0);
      const a=side>0?(x0-left)/(right-left):1-(x0-left)/(right-left),b=side>0?(x1-left)/(right-left):1-(x1-left)/(right-left);
      uv.push(a,0,b,0,a,1,b,0,b,1,a,1);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
  }
  const shippingGeometry=shippingSkin();
  const cargoStencilMaterials=['#edf0df','#20323d'].map(ink=>{
    const map=canvasTexture(2048,2048,(ctx,w,h)=>{
      ctx.scale(2,2);ctx.fillStyle=ink;ctx.font='bold 54px monospace';
      ctx.fillText('TCLU 481029 3',490,110);ctx.font='37px monospace';ctx.fillText('45G1',490,170);
      for(const [i,line] of ['MAX GROSS','30 480 KG','TARE 3 800 KG','NET 26 680 KG','CU.CAP 76.4'].entries())ctx.fillText(line,485,420+i*67);
      ctx.fillStyle='#d3b43a';ctx.fillRect(135,400,180,180);ctx.fillStyle='#252b2b';ctx.font='bold 30px sans-serif';ctx.fillText('CAUTION',153,445);ctx.fillText('9′6″ HIGH',140,500);ctx.fillText('CONTAINER',140,548);
      ctx.fillStyle=ink;ctx.font='24px monospace';ctx.fillText('CSC SAFETY APPROVAL',90,875);ctx.fillText('ISO 6346',90,910);
    });
    return mat('#ffffff',0.9,0,{map,transparent:true,alphaTest:0.1,depthWrite:false,side:THREE.DoubleSide});
  });
  const cargoStencilGeometry=new THREE.PlaneGeometry(2.16,2.57);cargoStencilGeometry.rotateY(-Math.PI/2);
  let shippingIndex=0;
  function container(parent, at, material, detailed = false, ratio = 1) {
    const [x, y, z] = at;
    matrix.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(ratio, 1, 1));
    instance(containerGeo, parent, material, matrix);
    if(!detailed){
      // Light boxes receive dark ink, and dark boxes receive white shipping marks.
      const paintIndex=paints.indexOf(material);
      const choices=paintIndex===2||paintIndex===7?[0,1,9,12]:paintIndex===3||paintIndex===6?[4,11]:paintIndex===10?[10]:paintIndex===8?[2,6]:paintIndex===9?[8,13]:[3,5,7,8,9,13];
      const brand=choices[shippingIndex++%choices.length];
      instance(shippingGeometry,parent,shippingMaterials[brand],matrix);
      const endX=x-6.15*ratio;
      const ink=material.color.getHexString()==='b6bbb8'||material===paints[7]||material===paints[3]?1:0;
      const markMatrix=new THREE.Matrix4().makeTranslation(endX-0.025,y+1.45,z);
      instance(cargoStencilGeometry,parent,cargoStencilMaterials[ink],markMatrix);
      box(parent,[0.035,2.61,0.035],[endX,y+1.45,z],black);
      for(const offset of [-0.84,-0.3,0.3,0.84]){
        beam(parent,[endX-0.035,y+0.18,z+offset],[endX-0.035,y+2.73,z+offset],0.018,galvanized);
        box(parent,[0.07,0.045,0.22],[endX-0.06,y+1.15,z+offset+0.07],steel);
      }
    }
    for (const side of [-1, 1]) {
      box(parent, [12.2 * ratio, 0.12, 0.1], [x, y + 0.06, z + side * 1.22], material);
      box(parent, [12.2 * ratio, 0.12, 0.1], [x, y + 2.86, z + side * 1.22], material);
      box(parent, [0.09, 2.78, 2.44], [x + side * 6.06 * ratio, y + 1.45, z], material);
      for (const end of [-1, 1]) {
        box(parent, [0.14, 2.82, 0.14], [x + end * 6.04 * ratio, y + 1.45, z + side * 1.2], material);
        if (detailed) for (const up of [0.12, 2.82]) box(parent, [0.2, 0.18, 0.19], [x + end * 6.06, y + up, z + side * 1.22], steel);
      }
    }
    if (detailed) {
      box(parent, [0.035, 2.55, 0.035], [x - 6.12, y + 1.45, z], steel);
      for (const offset of [-0.92, -0.35, 0.35, 0.92]) {
        beam(parent, [x - 6.14, y + 0.2, z + offset], [x - 6.14, y + 2.7, z + offset], 0.025, steel);
        for (const h of [0.3, 1.3, 2.6]) box(parent, [0.09, 0.07, 0.13], [x - 6.16, y + h, z + offset], chrome);
        box(parent, [0.11, 0.055, 0.27], [x - 6.19, y + 1.28, z + offset + 0.09], chrome);
      }
    }
  }
  // Mixed 20 ft / 40 ft stacks, stepped tops and open aisles follow the supplied terminal references.
  for(let row=0;row<3;row++)for(let col=0;col<10;col++){
    if(col===4||col===5)continue;
    const count=[2,4,3,2,3,4,2,3,4,2][(col+row)%10];
    const x=(col-4.5)*13,z=-24-row*5;
    for(let level=0;level<count;level++){
      const y=0.03+level*2.95;
      const shortBoxes=(col+row)%3===1;
      if(shortBoxes){
        for(const shift of [-3.12,3.12])container(scene,[x+shift,y,z],paints[(col*3+row+level+(shift>0?2:0))%paints.length],false,0.5);
      }else container(scene,[x,y,z],paints[(col*2+row*3+level)%paints.length]);
    }
  }
  // End-on boxes add visible doors, seals, locking rods and small stencils to the foreground stacks.
  const stackDoorMap=canvasTexture(2048,3072,ctx=>{
    ctx.scale(4,4);
    ctx.fillStyle='#e6e6d7';ctx.font='bold 33px monospace';ctx.fillText('TCLU 481029 3',215,65);ctx.font='25px monospace';ctx.fillText('22G1',215,105);
    ctx.fillText('MAX GROSS',210,300);ctx.fillText('30 480 KG',210,337);ctx.fillText('TARE 2 250 KG',210,390);ctx.fillText('CU.CAP 33.2',210,430);
    ctx.fillStyle='#dbc141';ctx.fillRect(45,310,120,100);ctx.fillStyle='#28313a';ctx.font='bold 18px monospace';ctx.fillText('CAUTION',60,345);ctx.fillText('HIGH CUBE',53,375);
  });
  for(const x of [-23,28]){
    for(let level=0;level<2;level++){
      const group=new THREE.Group();group.position.set(x,0.03+level*2.95,-26.2);group.rotation.y=Math.PI/2;scene.add(group);
      const paint=paints[(level+(x>0?9:0))%paints.length];container(group,[0,0,0],paint,false,0.5);
      box(group,[0.03,2.68,2.2],[-3.075,1.45,0],black);box(group,[0.04,2.61,2.12],[-3.105,1.45,0],paint);
      for(const z of [-0.92,-0.35,0.35,0.92])beam(group,[-3.15,0.15,z],[-3.15,2.77,z],0.022,steel);
      decal(group,stackDoorMap,2,2.5,[-3.17,1.47,0],-Math.PI/2);
    }
  }
  // Reference gantry: one shared plinth per side, square truss towers, and rear scanner columns.
  function bulletCamera(parent, at, direction, size = 1) {
    const assembly = new THREE.Group(); assembly.position.set(...at); assembly.scale.setScalar(size);
    assembly.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),new THREE.Vector3(...direction).normalize()); parent.add(assembly);
    rounded(assembly,[0.48,0.19,0.2],0.055,[0,0,0],white);
    rounded(assembly,[0.55,0.035,0.25],0.012,[0.035,0.115,0],steel);
    rounded(assembly,[0.07,0.17,0.19],0.025,[-0.245,0,0],galvanized);
    const surround=mesh(assembly,new THREE.CylinderGeometry(0.083,0.083,0.04,20),black,[0.25,0,0]);surround.rotation.z=Math.PI/2;
    const ring=mesh(assembly,new THREE.TorusGeometry(0.058,0.009,8,20),chrome,[0.276,0,0]);ring.rotation.y=Math.PI/2;
    const optics=mesh(assembly,new THREE.CylinderGeometry(0.047,0.047,0.014,24),glass,[0.28,0,0]);optics.rotation.z=Math.PI/2;
    for(let i=0;i<3;i++)box(assembly,[0.035,0.009,0.205],[-0.17+i*0.05,-0.055,0],galvanized);
    beam(assembly,[-0.09,-0.11,0],[-0.09,-0.24,0],0.025,galvanized);
    box(assembly,[0.13,0.035,0.13],[-0.09,-0.25,0],steel);
    return assembly;
  }
  const scannerBrush=canvasTexture(2048,1024,(ctx,w,h)=>{
    ctx.fillStyle='#a9adb0';ctx.fillRect(0,0,w,h);
    for(let i=0;i<16000;i++){
      const v=120+Math.floor(random()*95);ctx.strokeStyle=`rgba(${v},${v},${v},0.14)`;ctx.lineWidth=0.5+random();
      const y=random()*h;ctx.beginPath();ctx.moveTo(random()*w,y);ctx.lineTo(w,y+random()*0.6);ctx.stroke();
    }
    const edge=ctx.createLinearGradient(0,0,w,0);edge.addColorStop(0,'#ffffff35');edge.addColorStop(0.2,'#ffffff00');edge.addColorStop(0.85,'#222b3000');edge.addColorStop(1,'#222b3040');ctx.fillStyle=edge;ctx.fillRect(0,0,w,h);
  });
  const scannerMetal=mat('#c4c8cb',0.48,0.72,{map:scannerBrush,bumpMap:scannerBrush,bumpScale:0.001,envMapIntensity:0.5});
  const scannerHousing=mat('#1a2026',0.72,0.25,{roughnessMap:cabMicro,bumpMap:cabMicro,bumpScale:0.001});
  const scannerFace=mat('#101820',0.22,0.08,{envMapIntensity:0.3});
  const scannerStatus=mat('#7d1523',0.48,0.05,{emissive:'#a51b2f',emissiveIntensity:0.45});
  const scannerLabel=canvasTexture(1024,512,(ctx,w,h)=>{
    ctx.fillStyle='#b9bdbe';ctx.fillRect(0,0,w,h);ctx.fillStyle='#263039';ctx.font='bold 85px monospace';ctx.fillText('LINE SCAN',60,110);ctx.font='48px monospace';ctx.fillText('OPTICAL ARRAY',60,200);ctx.fillText('IP67 / 24V DC',60,280);
    for(let i=0;i<80;i++)ctx.fillRect(60+i*10,340,2+(i%3),85);
  });
  function latticeTower(z) {
    const x=-0.55;
    box(scene,[1.18,0.24,1.12],[-0.55,0.12,z],concrete);
    box(scene,[1.95,0.24,0.68],[0.54,0.12,z],concrete);
    box(scene,[1.07,0.055,1.01],[-0.55,0.27,z],galvanized);
    box(scene,[1.88,0.055,0.6],[0.54,0.27,z],galvanized);
    for(const dx of [-0.28,0.28])for(const dz of [-0.28,0.28]){
      beam(scene,[x+dx,0.32,z+dz],[x+dx,6.76,z+dz],0.028,steel);
      box(scene,[0.16,0.035,0.16],[x+dx,0.34,z+dz],steel);
      for(const bx of [-0.045,0.045])for(const bz of [-0.045,0.045])beam(scene,[x+dx+bx,0.34,z+dz+bz],[x+dx+bx,0.39,z+dz+bz],0.009,black);
    }
    for(let level=0;level<8;level++){
      const y=0.42+level*0.79,flip=level%2?1:-1;
      for(const dz of [-0.28,0.28]){
        beam(scene,[x+flip*0.28,y,z+dz],[x-flip*0.28,y+0.79,z+dz],0.016,steel);
        beam(scene,[x-0.28,y,z+dz],[x+0.28,y,z+dz],0.014,steel);
      }
      for(const dx of [-0.28,0.28])beam(scene,[x+dx,y,z+flip*0.28],[x+dx,y+0.79,z-flip*0.28],0.016,steel);
    }
    // Off-white cabinet attached to the outer side of the near truss.
    if(z>0){
      rounded(scene,[0.61,1.12,0.37],0.03,[-0.38,1.65,z+0.58],white);
      box(scene,[0.57,1.06,0.025],[-0.38,1.65,z+0.81],steel);
      box(scene,[0.53,1.02,0.028],[-0.38,1.65,z+0.83],white);
      box(scene,[0.035,0.17,0.04],[-0.17,1.65,z+0.86],black);
      for(let i=0;i<6;i++)box(scene,[0.2,0.012,0.025],[-0.48,1.2+i*0.045,z+0.86],galvanized);
      beam(scene,[-0.37,1,z+0.55],[-0.37,0.35,z+0.55],0.018,black);
    }
    // Profiled scanner extrusion: a dark recessed lower array and tall brushed-metal head.
    const inside=z+(z>0?-0.1:0.1);
    const column=new THREE.Group();column.position.set(1.3,0,inside);column.scale.set(0.68,0.92,0.72);scene.add(column);
    rounded(column,[0.3,0.14,0.68],0.025,[0,0.42,0],scannerMetal);
    rounded(column,[0.24,4.42,0.4],0.025,[0,2.7,0],scannerHousing);
    rounded(column,[0.24,2.58,0.44],0.025,[0,6.17,0],scannerMetal);
    // Rear support and narrow raised side flanges define the actual extrusion depth.
    box(column,[0.075,6.85,0.11],[0.17,3.9,0],scannerMetal);
    for(const side of [-1,1]){
      rounded(column,[0.08,4.46,0.055],0.012,[-0.135,2.7,side*0.205],scannerHousing);
      box(column,[0.035,2.38,0.026],[-0.143,6.17,side*0.19],scannerMetal);
      box(column,[0.025,2.36,0.018],[-0.16,6.17,side*0.145],galvanized);
    }
    rounded(column,[0.018,4.25,0.265],0.009,[-0.136,2.7,0],scannerFace);
    box(column,[0.012,4.15,0.012],[-0.151,2.7,0.09],scannerStatus);
    for(const y of [0.65,2.4,4.7,5.1,7.27])for(const dz of [-0.17,0.17]){
      const screw=mesh(column,new THREE.CylinderGeometry(0.018,0.018,0.012,6),chrome,[-0.155,y,dz]);screw.rotation.z=Math.PI/2;
      beam(column,[-0.164,y-0.007,dz],[-0.164,y+0.007,dz],0.003,black);
    }
    for(const y of [0.95,3.15,5.2]){
      box(column,[0.19,0.12,0.52],[0.2,y,0],scannerMetal);
      for(const dz of [-0.22,0.22])beam(column,[0.22,y-0.07,dz],[0.22,y+0.07,dz],0.021,chrome);
    }
    rounded(column,[0.29,0.06,0.48],0.018,[0,7.49,0],scannerMetal);
    box(column,[0.25,0.055,0.44],[0,4.88,0],black);
    decal(column,scannerLabel,0.24,0.12,[-0.126,6.92,0],-Math.PI/2);
    for(const dx of [-0.09,0.09])for(const dz of [-0.25,0.25])beam(column,[dx,0.48,dz],[dx,0.54,dz],0.02,chrome);
    // Cable gland, flexible lead and protective rear conduit terminate at the plinth.
    beam(column,[0.1,0.65,0.16],[0.25,0.65,0.16],0.035,black);
    beam(column,[0.25,0.65,0.16],[0.25,0.35,0.16],0.025,scannerHousing);
    // Mid-height auxiliary sensor and cabling on the frame.
    beam(scene,[-0.75,2.9,z],[-0.75,2.9,z+(z>0?-0.57:0.57)],0.026,steel);
    bulletCamera(scene,[-0.75,3.05,z+(z>0?-0.5:0.5)],[0.3,-0.04,z>0?-1:1],0.8);
  }
  latticeTower(-2.7); latticeTower(2.7);
  // Four chords and alternating triangular bracing around the square crossbeam.
  for(const x of [-0.83,-0.27])for(const y of [6.76,7.34])beam(scene,[x,y,-3.06],[x,y,3.06],0.03,steel);
  for(let index=0;index<10;index++){
    const z=-3.06+index*0.612;
    const from=index%2?7.34:6.76,to=index%2?6.76:7.34;
    for(const x of [-0.83,-0.27])beam(scene,[x,from,z],[x,to,z+0.612],0.016,steel);
    beam(scene,[-0.83,7.34,z],[-0.27,7.34,z+0.612],0.014,steel);
  }
  // Reference top assembly: horizontal sensor spine, front-hung panel and rear tilted panel.
  const sensorFinish = mat('#b3b5ae',0.48,0.55);
  box(scene,[0.24,0.14,2.25],[-0.56,7.49,-0.1],steel);
  box(scene,[0.2,0.075,2.08],[-0.56,7.59,-0.1],white);
  for(const z of [-1.02,-0.87,0.65,0.82])box(scene,[0.27,0.19,0.045],[-0.56,7.5,z],black);
  for(const z of [-1.12,0.95]){
    beam(scene,[-0.56,7.33,z],[-0.56,7.46,z],0.022,galvanized);
    box(scene,[0.36,0.035,0.22],[-0.56,7.34,z],steel);
  }
  function topSensor(at,tilt){
    const panel=new THREE.Group();panel.position.set(...at);panel.rotation.set(...tilt);scene.add(panel);
    rounded(panel,[0.14,0.99,0.31],0.035,[0,0,0],sensorFinish);
    rounded(panel,[0.025,0.87,0.255],0.015,[0.083,0,0],white);
    box(panel,[0.026,0.62,0.015],[0.103,0,0.13],galvanized);
    for(const y of [-0.36,0.36]){
      const fastener=mesh(panel,new THREE.CylinderGeometry(0.019,0.019,0.02,8),chrome,[0.106,y,0]);fastener.rotation.z=Math.PI/2;
    }
    for(const y of [-0.19,0.16]){
      const optics=mesh(panel,new THREE.CylinderGeometry(0.035,0.035,0.018,16),glass,[0.109,y,0]);optics.rotation.z=Math.PI/2;
    }
    beam(panel,[-0.07,-0.28,0],[-0.2,-0.28,0],0.019,galvanized);
    beam(panel,[-0.2,-0.28,0],[-0.2,0.34,0],0.019,black);
  }
  // The near panel overlaps the beam face; the far panel leans above its rear chord.
  beam(scene,[-0.56,7.5,-1.14],[0.04,7.5,-1.14],0.027,steel);
  topSensor([0.04,7.12,-1.14],[0,0,0]);
  beam(scene,[-0.56,7.5,0.96],[-0.91,7.62,0.96],0.03,steel);
  topSensor([-0.91,7.76,0.96],[-0.24,0,-0.15]);
  // Keep the two foreground poles only; the right pole sits beside the gantry with one upper camera.
  for(const station of [{x:-6.4,z:3.75,heights:[1.35,2.75]},{x:2.6,z:3.75,heights:[2.75]}]){
    const {x,z,heights}=station;
    beam(scene,[x,0,z],[x,3.15,z],0.042,steel);
    box(scene,[0.27,0.04,0.27],[x,0.025,z],steel);
    for(const y of heights){
      box(scene,[0.12,0.17,0.12],[x,y,z],black);
      beam(scene,[x,y,z],[x,y,z-0.22],0.025,steel);
      bulletCamera(scene,[x+0.1,y+0.15,z-0.28],x>0?[0,0,-1]:[0.8,0.04,-0.65],0.95);
    }
  }
  // Tractor, 40 ft trailer, turning tyres, suspension, glazing, and chassis hardware.
  const truck = new THREE.Group(); scene.add(truck);
  container(truck, [-1.2, 1.35, 0], mainPaint, true);
  for (const z of [-0.88, 0.88]) box(truck, [13.3, 0.2, 0.14], [-0.6, 1.18, z], black);
  box(truck, [12.8, 0.12, 2.45], [-0.9, 1.3, 0], galvanized);
  box(truck, [3.5, 0.2, 0.25], [4.7, 1.05, -0.65], black);
  box(truck, [3.5, 0.2, 0.25], [4.7, 1.05, 0.65], black);
  // Cab-over silhouette derived from the reference: swept screen, sleeper, and open wheel arches.
  function profile(parent, points, depth, material, z = -depth / 2, bevel = 0.04) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 24, steps: 1 });
    return mesh(parent, geometry, material, [0, 0, z]);
  }
  const cabSide = new THREE.Shape();
  cabSide.moveTo(4.85, 1.13); cabSide.lineTo(5.58, 1.13); cabSide.lineTo(5.78, 0.65);
  cabSide.absarc(6.55, 0.65, 0.77, Math.PI, 0, true);
  cabSide.lineTo(7.48, 0.65); cabSide.lineTo(7.48, 1.45); cabSide.lineTo(7.4, 2.56);
  cabSide.lineTo(7.15, 3.66); cabSide.lineTo(6.85, 3.94); cabSide.lineTo(5.08, 3.94);
  cabSide.lineTo(4.85, 3.6); cabSide.closePath();
  const sideOpening=new THREE.Path();
  sideOpening.moveTo(5.86,2.65);sideOpening.lineTo(5.86,3.57);sideOpening.lineTo(6.98,3.55);sideOpening.lineTo(7.15,2.69);sideOpening.closePath();
  cabSide.holes.push(sideOpening);
  const cabGeometry = new THREE.ExtrudeGeometry(cabSide, { depth: 2.36, bevelEnabled: true, bevelSize: 0.055, bevelThickness: 0.055, bevelSegments: 4, curveSegments: 32, steps: 1 });
  // Open the front above the dashboard so glazing looks into a real cabin.
  const cabPositions=cabGeometry.getAttribute('position'),cabNormals=cabGeometry.getAttribute('normal'),cabUvs=cabGeometry.getAttribute('uv');
  const keptPositions=[],keptNormals=[],keptUvs=[];
  for(let i=0;i<cabPositions.count;i+=3){
    let cx=0,cy=0;for(let j=0;j<3;j++){cx+=cabPositions.getX(i+j)/3;cy+=cabPositions.getY(i+j)/3;}
    if(cx>6.95&&[0,1,2].some(j=>cabNormals.getX(i+j)>0.15))continue;
    for(let j=0;j<3;j++){const k=i+j;keptPositions.push(cabPositions.getX(k),cabPositions.getY(k),cabPositions.getZ(k));keptNormals.push(cabNormals.getX(k),cabNormals.getY(k),cabNormals.getZ(k));keptUvs.push((cabPositions.getX(k)-4.8)/2.8,(cabPositions.getY(k)-0.6)/3.5);}
  }
  cabGeometry.setAttribute('position',new THREE.Float32BufferAttribute(keptPositions,3));cabGeometry.setAttribute('normal',new THREE.Float32BufferAttribute(keptNormals,3));cabGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(keptUvs,2));cabGeometry.clearGroups();
  mesh(truck, cabGeometry, cabPaint, [0, 0, -1.18]);
  // Smooth quad surfaces give the cab a crowned front instead of a flat rectangular face.
  function patch(columns, rows, point) {
    const vertices=[],uv=[],indices=[];
    for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){
      vertices.push(...point(x/columns,y/rows));uv.push(x/columns,y/rows);
    }
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const i=y*(columns+1)+x;indices.push(i,i+1,i+columns+1,i+1,i+columns+2,i+columns+1);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
  }
  function frontSkin(y0,y1,zHalf,offset=0){
    return patch(28,12,(u,v)=>{
      const y=THREE.MathUtils.lerp(y0,y1,v),z=(u*2-1)*zHalf;
      const x=y>2.56?7.4-(y-2.56)*0.25/1.1:7.48-(y-1.45)*0.08/1.11;
      return [x+0.105*(1-Math.pow(Math.abs(z)/1.24,4))+offset,y,z];
    });
  }
  const frontMaterial=mat('#821b24',0.64,0.5,{...cabFinish,side:THREE.DoubleSide});
  mesh(truck,frontSkin(1.42,2.65,1.21,0.012),frontMaterial);
  // Curved high-roof sleeper, with the crown and side fairings blended together.
  const roofCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(4.98,4.17,0),new THREE.Vector3(5.23,4.43,0),new THREE.Vector3(5.72,4.46,0),new THREE.Vector3(6.2,4.33,0),new THREE.Vector3(6.65,4.13,0),new THREE.Vector3(7.05,3.89,0)
  ]);
  const roofTop=patch(32,24,(u,v)=>{const p=roofCurve.getPoint(u);const z=(v*2-1)*1.16;return[p.x,p.y-0.13*Math.pow(Math.abs(z)/1.16,3),z];});
  const roofMat=mat('#8f1d25',0.64,0.5,{...cabFinish,side:THREE.DoubleSide});mesh(truck,roofTop,roofMat);
  for(const side of [-1,1])mesh(truck,patch(32,6,(u,v)=>{const p=roofCurve.getPoint(u);return[p.x,THREE.MathUtils.lerp(3.87,p.y-0.13,v),side*1.16];}),roofMat);
  mesh(truck,patch(12,8,(u,v)=>[4.98,THREE.MathUtils.lerp(3.87,4.04,v),(u*2-1)*1.16]),roofMat);
  // The screen has a shallow wrap, a continuous rubber surround, and readable interior shadows.
  const seal=mat('#202b35',0.72,0.1,{side:THREE.DoubleSide});
  mesh(truck,frontSkin(2.53,2.64,1.17,0.032),seal);
  mesh(truck,frontSkin(3.59,3.69,1.17,0.032),seal);
  for(const side of [-1,1])beam(truck,[7.45,2.6,side*1.1],[7.18,3.65,side*1.1],0.05,seal);
  const screenMaterial=new THREE.MeshPhysicalMaterial({color:'#17313b',roughness:0.2,metalness:0,transmission:0,thickness:0.025,ior:1.45,transparent:true,opacity:0.58,envMapIntensity:0.12,side:THREE.DoubleSide,depthWrite:false});
  materials.add(screenMaterial);
  const interior=mat('#303a3c',0.95,0);
  box(truck,[0.09,1.5,2.1],[5.62,2.93,0],interior);
  box(truck,[1.52,0.08,2.1],[6.4,3.68,0],interior);
  box(truck,[1.6,0.08,2.1],[6.4,2.05,0],interior);
  box(truck,[1.55,0.23,2.1],[6.55,2.57,0],interior);
  for(const z of [-0.62,0.62]){
    rounded(truck,[0.65,0.19,0.57],0.08,[6.05,2.16,z],interior);
    rounded(truck,[0.19,0.8,0.57],0.08,[5.8,2.63,z],interior);
    rounded(truck,[0.15,0.22,0.37],0.05,[5.8,3.14,z],interior);
  }
  const steering=mesh(truck,new THREE.TorusGeometry(0.24,0.025,8,32),black,[6.72,2.88,0.62]);steering.rotation.y=Math.PI/2;
  mesh(truck,frontSkin(2.63,3.6,1.075,0.052),screenMaterial);
  // Deep aerodynamic visor and a two-piece cowl beneath the glass.
  rounded(truck,[0.37,0.2,2.4],0.055,[7.2,3.76,0],black).rotation.z=0.12;
  rounded(truck,[0.13,0.15,2.32],0.035,[7.48,2.57,0],black);
  for(const z of [-0.55,0.55]){
    beam(truck,[7.52,2.59,z-0.19],[7.51,2.75,z+0.16],0.014,black);
    beam(truck,[7.51,2.75,z+0.16],[7.45,2.91,z-0.23],0.016,black);
    rounded(truck,[0.045,0.04,0.23],0.01,[7.54,2.55,z],galvanized);
  }
  for (const side of [-1, 1]) {
    const z = side * 1.244;
    const windowCorners=[[5.83,2.62,z],[7.18,2.66,z],[7,3.6,z],[5.83,3.61,z]];
    windowCorners.forEach((point,i)=>beam(truck,point,windowCorners[(i+1)%4],0.035,seal));
    const sideGlassShape=new THREE.Shape();[[5.87,2.66],[7.13,2.7],[6.96,3.54],[5.87,3.56]].forEach(([x,y],i)=>i?sideGlassShape.lineTo(x,y):sideGlassShape.moveTo(x,y));sideGlassShape.closePath();
    mesh(truck,new THREE.ShapeGeometry(sideGlassShape),screenMaterial,[0,0,z+side*0.02]);
    profile(truck,[[5.04,3.93],[5.12,4.16],[5.62,4.12],[5.8,3.94]],0.06,black,z+side*0.025,0.025);
    for(let i=0;i<10;i++)beam(truck,[5.12+i*0.055,3.98,z+side*0.07],[5.2+i*0.055,4.1,z+side*0.07],0.009,galvanized);
    // Door and sleeper seams, recessed service panel, and handle.
    rounded(truck, [0.61, 1.28, 0.025], 0.06, [5.32, 2.96, z], galvanized);
    rounded(truck, [0.58, 1.25, 0.03], 0.05, [5.32, 2.96, z + side * 0.012], cabPaint);
    beam(truck, [5.73, 1.4, z], [5.73, 3.77, z], 0.009, black);
    beam(truck, [5.73, 2.52, z], [7.26, 2.52, z], 0.009, galvanized);
    box(truck, [0.19, 0.045, 0.04], [5.97, 2.47, z + side * 0.03], black);
    profile(truck,[[4.88,1.17],[5.57,1.17],[5.79,1.45],[7.35,1.45],[7.38,1.58],[4.88,1.58]],0.018,cabAccent,z+side*0.014,0.008);
    box(truck,[1.78,0.065,0.026],[5.82,1.74,z+side*0.035],black);
    // Mirror support and stacked main / wide-angle mirrors.
    beam(truck, [6.94, 3.62, z], [7.03, 3.61, z + side * 0.33], 0.021, black);
    beam(truck, [7.03, 3.61, z + side * 0.33], [7.1, 2.73, z + side * 0.33], 0.021, black);
    rounded(truck, [0.25, 0.62, 0.21], 0.045, [7.08, 3.2, z + side * 0.33], cabPaint);
    rounded(truck, [0.24, 0.22, 0.21], 0.035, [7.08, 2.76, z + side * 0.33], cabPaint);
    box(truck, [0.025, 0.51, 0.15], [7.225, 3.2, z + side * 0.33], chrome);
    // Wheel arch is a curved shell rather than a solid block above a floating tyre.
    const arch = new THREE.Shape();
    arch.absarc(0, 0, 0.81, 0, Math.PI, false); arch.absarc(0, 0, 0.71, Math.PI, 0, true); arch.closePath();
    const archGeometry = new THREE.ExtrudeGeometry(arch, { depth: 0.12, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.015, bevelSegments: 2, curveSegments: 32, steps: 1 });
    mesh(truck, archGeometry, cabAccent, [6.55, 0.65, side * 1.16 - 0.06]);
    for (const y of [0.65, 0.92, 1.18]) {
      box(truck, [0.6, 0.06, 0.35], [5.5, y, side * 1.2], galvanized);
      for (let i = 0; i < 5; i++) box(truck, [0.055, 0.012, 0.26], [5.27 + i * 0.1, y + 0.038, side * 1.2], black);
    }
    rounded(truck, [1.12, 0.68, 0.58], 0.1, [4.75, 1.01, side * 0.83], galvanized);
    for (const x of [4.4,5.08]) box(truck, [0.055, 0.69, 0.6], [x, 1.01, side * 0.83], black);
    beam(truck, [5.16, 4.05, side * 0.94], [5.06, 4.92, side * 0.94], 0.012, black);
    // Side underrun rails and rear triple-axle suspension.
    for (const y of [0.65,0.95]) box(truck, [3.4, 0.09, 0.07], [0.3, y, side * 1.18], galvanized);
    for (const x of [-1.25,1.75]) box(truck, [0.07, 0.58, 0.07], [x,0.96,side*1.18], black);
    for (const x of [-5.8,-4.6,-3.4]) {
      box(truck, [0.8,0.06,0.2], [x,0.95,side*0.7], chassisPaint);
      beam(truck, [x-0.25,0.6,side*0.75], [x+0.25,1.1,side*0.75],0.045,black);
    }
    for (const x of [-6.2,-4.5,-2.8,-0.9,1,3.2]) box(truck,[0.11,0.065,0.045],[x,1.35,side*1.27],amber);
  }
  // Broad lower bumper, recessed upper grille and paired lower air intakes match the reference proportions.
  const bumper=mat('#8f1d25',0.64,0.5,cabFinish);
  rounded(truck,[0.29,0.9,2.47],0.105,[7.49,0.96,0],bumper);
  rounded(truck,[0.07,0.07,2.3],0.025,[7.66,0.52,0],black);
  rounded(truck,[0.13,0.58,1.91],0.045,[7.57,1.86,0],galvanized);
  rounded(truck,[0.055,0.47,1.77],0.03,[7.655,1.86,0],black);
  for(let y=1.69;y<=2.04;y+=0.085)box(truck,[0.026,0.023,1.7],[7.695,y,0],white);
  for(const z of [-0.55,-0.18,0.18,0.55])box(truck,[0.027,0.43,0.026],[7.698,1.86,z],white);
  // Two separate lower intake openings, with visible recessed louvers.
  for(const y of [0.78,1.1]){
    rounded(truck,[0.055,0.23,1.57],0.02,[7.661,y,0],black);
    for(const dz of [-0.55,-0.2,0.2,0.55])box(truck,[0.02,0.22,0.035],[7.7,y,dz],galvanized);
    box(truck,[0.022,0.025,1.5],[7.7,y,0],bumper);
  }
  for(const z of [-1.035,1.035]){
    rounded(truck,[0.09,0.6,0.25],0.035,[7.66,1.01,z],galvanized);
    rounded(truck,[0.045,0.51,0.2],0.018,[7.72,1.01,z],black);
    for(const y of [0.9,1.12]){
      const reflector=mesh(truck,new THREE.CylinderGeometry(0.083,0.083,0.025,24),chrome,[7.75,y,z]);reflector.rotation.z=Math.PI/2;
      const lensFace=mesh(truck,new THREE.CylinderGeometry(0.058,0.058,0.03,24),lens,[7.77,y,z]);lensFace.rotation.z=Math.PI/2;
      const bulb=mesh(truck,new THREE.CylinderGeometry(0.024,0.024,0.033,16),glow,[7.79,y,z]);bulb.rotation.z=Math.PI/2;
    }
    box(truck,[0.025,0.055,0.19],[7.77,1.29,z],amber);
  }
  // A thin body-colour front fascia separates the windscreen from the main grille.
  beam(truck,[7.58,2.27,-0.97],[7.58,2.27,0.97],0.012,galvanized);
  // Registration plates and small geometry make scale readable at close range.
  const registration = canvasTexture(256, 64, ctx => { ctx.fillStyle = '#d3bd65'; ctx.fillRect(0, 0, 256, 64); ctx.font = 'bold 35px monospace'; ctx.fillStyle = '#222833'; ctx.fillText('XL 2019', 40, 45); });
  decal(truck, registration, 0.55, 0.14, [-7.665, 0.93, 0], -Math.PI / 2);
  decal(truck, registration, 0.5, 0.12, [7.67, 0.55, 0], Math.PI / 2);
  const idTexture = canvasTexture(1024, 512, ctx => {
    ctx.fillStyle = '#222b31'; ctx.font = '38px monospace'; ctx.fillText('MSKU 283753 5', 28, 65); ctx.fillText('747G7', 28, 113);
    ctx.font = '25px monospace'; ctx.fillText('MAX GROSS 30 480 KG', 28, 210); ctx.fillText('TARE       3 800 KG', 28, 250); ctx.fillText('NET       26 680 KG', 28, 290); ctx.fillText('CU. CAP.   76.4 M³', 28, 330);
    ctx.fillStyle = '#dbc463'; ctx.fillRect(28,385,250,82); ctx.fillStyle='#1d2932'; ctx.font='bold 24px monospace';ctx.fillText('CAUTION',65,420);ctx.fillText('HIGH CONTAINER',42,450);
  });
  for (const side of [-1, 1]) decal(truck, idTexture, 1.5, 0.75, [-6.25, 3.6, side * 1.289], side < 0 ? Math.PI : 0);
  decal(truck,idTexture,1.1,1.3,[-7.37,2.85,0.62],-Math.PI/2);
  // Original brand artwork is projected onto a skin that follows every corrugation.
  const brandMap = new THREE.TextureLoader().load('/maersk-logo.svg', map => { if (disposed) map.dispose(); });
  brandMap.colorSpace=THREE.SRGBColorSpace;brandMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(brandMap);
  const brandMaterial=mat('#ffffff',0.9,0.05,{map:brandMap,transparent:true,alphaTest:0.04,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide});
  const logoWidth=8.2, logoHeight=logoWidth/(1024/232), left=-1.2-logoWidth/2;
  for (const side of [-1,1]) {
    const vertices=[],uv=[];
    const xPoints=[left];
    for(let i=0;i<=240;i++){const x=-7.3+i*12.2/240;if(x>left&&x<left+logoWidth)xPoints.push(x);}
    xPoints.push(left+logoWidth);
    function waveAt(x){const value=(x+7.3)/12.2*240;const i=Math.floor(value);const phase=n=>{const p=((n%6)+6)%6;return p===0||p===5?0:p===1||p===4?0.025:0.06;};return THREE.MathUtils.lerp(phase(i),phase(i+1),value-i);}
    for(let i=0;i<xPoints.length-1;i++){
      const a=xPoints[i],b=xPoints[i+1],za=side*(1.22+waveAt(a)+0.006),zb=side*(1.22+waveAt(b)+0.006);
      const bottom=1.88,top=bottom+logoHeight;
      vertices.push(a,bottom,za,b,bottom,zb,a,top,za,b,bottom,zb,b,top,zb,a,top,za);
      const ua=side>0?(a-left)/logoWidth:1-(a-left)/logoWidth,ub=side>0?(b-left)/logoWidth:1-(b-left)/logoWidth;
      uv.push(ua,0,ub,0,ua,1,ub,0,ub,1,ua,1);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
    // Double-sided paint keeps outward normals consistent on the far container wall.
    if(side<0){const normals=geometry.getAttribute('normal');for(let i=0;i<normals.count;i++)normals.setXYZ(i,-normals.getX(i),-normals.getY(i),-normals.getZ(i));}
    const logo=mesh(truck,geometry,brandMaterial);logo.castShadow=false;
  }
  // Door panels, perimeter rubber seals, hinges and blue ISO corner castings.
  for(const side of [-1,1]){
    box(truck,[0.055,2.67,1.13],[-7.34,2.8,side*0.595],rubber);
    box(truck,[0.075,2.58,1.045],[-7.385,2.8,side*0.595],mainPaint);
    for(const y of [1.95,2.82,3.64])box(truck,[0.025,0.075,1.04],[-7.43,y,side*0.595],mainPaint);
    decal(truck,brandMap,0.71,0.17,[-7.45,3.72,side*0.59],-Math.PI/2);
    for(const y of [1.53,2.35,3.3,4.05]){
      box(truck,[0.12,0.16,0.19],[-7.45,y,side*1.13],steel);
      const hinge=mesh(truck,new THREE.CylinderGeometry(0.032,0.032,0.2,12),galvanized,[-7.46,y,side*1.17]);
    }
    for(const end of [-7.27,4.87])for(const y of [1.45,4.17]){
      rounded(truck,[0.27,0.22,0.24],0.02,[end,y,side*1.23],fittingBlue);
      const socket=mesh(truck,new THREE.CircleGeometry(0.047,14),black,[end,y,side*1.355]);if(side<0)socket.rotation.y=Math.PI;
      const endSocket=mesh(truck,new THREE.CircleGeometry(0.04,14),black,[end+(end<0?-0.142:0.142),y,side*1.23]);endSocket.rotation.y=end<0?-Math.PI/2:Math.PI/2;
    }
  }
  const hazardMap=canvasTexture(512,80,(ctx,w,h)=>{
    ctx.fillStyle='#cfb63f';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#182029';ctx.lineWidth=20;
    for(let x=-80;x<w+80;x+=34){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-65,h);ctx.stroke();}
  });
  for(const side of [-1,1])decal(truck,hazardMap,0.7,0.085,[-7.465,4.13,side*0.79],-Math.PI/2);
  // 2K rear-door stencil atlas, placed outside the painted door skins and behind the physical locking rods.
  const rearDoorInk=canvasTexture(1800,2048,(ctx,w,h)=>{
    ctx.fillStyle='#20282e';ctx.textAlign='left';ctx.textBaseline='alphabetic';
    function badge(x,y){
      ctx.fillStyle='#4da9c8';ctx.beginPath();ctx.roundRect(x,y,220,240,22);ctx.fill();ctx.fillStyle='#f4f3e9';ctx.beginPath();
      for(let i=0;i<14;i++){const angle=i*Math.PI/7-Math.PI/2,r=i%2?43:100;const px=x+110+Math.cos(angle)*r,py=y+120+Math.sin(angle)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();
      ctx.fillStyle='#20282e';ctx.font='bold 51px Arial';ctx.fillText('MAERSK',x-2,y+302);
    }
    badge(310,120);badge(1010,120);
    ctx.fillStyle='#20282e';ctx.font='bold 73px monospace';ctx.fillText('MSKU',1330,125);ctx.font='bold 64px monospace';ctx.fillText('283753 5',1330,215);ctx.fillText('747G7',1330,300);
    ctx.fillStyle='#d3b542';ctx.beginPath();ctx.moveTo(370,705);ctx.lineTo(447,605);ctx.lineTo(524,705);ctx.lineTo(499,775);ctx.lineTo(397,775);ctx.closePath();ctx.fill();
    ctx.fillStyle='#20282e';ctx.textAlign='center';ctx.font='bold 28px Arial';ctx.fillText('SUPER',447,692);ctx.fillText('HEAVY',447,730);ctx.textAlign='left';
    ctx.fillStyle='#d4b640';ctx.fillRect(320,800,255,225);ctx.fillStyle='#20282e';ctx.font='bold 43px Arial';ctx.fillText('CAUTION',346,855);ctx.font='bold 36px Arial';ctx.fillText('9′6″ HIGH',344,920);ctx.fillText('CONTAINER',337,981);
    const rows=[['M.G.W','30.480 KGS.','67.200 LBS.',805],['TARE','3.700 KGS.','8.200 LBS.',1010],['NET','28.180 KGS.','62.130 LBS.',1290],['CU.CAP','76.2 CU.M.','2.693 CU.FT.',1480]];
    for(const[label,line1,line2,y]of rows){ctx.font='bold 66px Arial';ctx.fillText(label,1040,y);ctx.font='48px Arial';ctx.fillText(line1,1370,y-8);ctx.fillText(line2,1370,y+49);}
    ctx.fillStyle='#737c7d';ctx.fillRect(145,1730,160,190);ctx.fillStyle='#c8ccc9';ctx.font='16px monospace';for(let i=0;i<9;i++)ctx.fillText(i===0?'CSC SAFETY APPROVAL':'CERTIFIED / 2019',153,1755+i*18);
    ctx.fillStyle='#20282e';ctx.font='24px monospace';ctx.fillText('INSPECT BEFORE USE',1060,1860);
  });
  decal(truck,rearDoorInk,2.12,2.47,[-7.474,2.79,0],-Math.PI/2);
  // Oxidised edges and exposed steel chips are concentrated where handling damages paint.
  // Corner oxidation, chipped rails, hinges and reflector strips break up pristine surfaces.
  for(const side of [-1,1]){
    for(const end of [-7.24,4.84])for(const y of [1.46,4.14]){
      box(truck,[0.13,0.1,0.025],[end,y,side*1.289],rust);
      box(truck,[0.045,0.037,0.027],[end,y,side*1.31],black);
    }
    for(let i=0;i<28;i++){
      const x=-7+random()*11.5;
      box(truck,[0.08+random()*0.25,0.015+random()*0.018,0.015],[x,1.45+random()*0.05,side*1.29],random()>.5?rust:steel);
    }
  }
  for(const z of [-0.92,-0.35,0.35,0.92]){
    beam(truck,[-7.48,1.52,z],[-7.48,4.08,z],0.024,steel);
    for(const y of [1.56,2.57,3.98]){
      box(truck,[0.08,0.06,0.12],[-7.49,y,z],galvanized);
      box(truck,[0.1,0.045,0.15],[-7.5,y,z],steel);
    }
    beam(truck,[-7.52,2.03,z],[-7.52,2.03,z+0.22],0.02,steel);
    box(truck,[0.1,0.13,0.07],[-7.52,2.03,z+0.2],galvanized);
  }
  // A continuous rear crossmember and bolted hangers physically connect the lamps to the chassis.
  box(truck,[0.3,0.48,2.38],[-7.31,1.05,0],chassisPaint);
  box(truck,[0.15,0.36,2.33],[-7.51,0.99,0],black);
  for(const z of [-0.9,0.9]){
    box(truck,[0.22,0.85,0.12],[-7.25,0.94,z],galvanized);
    beam(truck,[-6.95,1.29,z],[-7.45,0.63,z],0.045,steel);
    rounded(truck,[0.09,0.22,0.58],0.025,[-7.61,1.01,z],black);
  }
  box(truck,[0.19,0.17,2.53],[-7.53,0.59,0],steel);
  box(truck,[0.03,0.055,2.3],[-7.638,0.59,0],white);
  const brakeLens=mat('#af1728',0.24,0.15,{emissive:'#ed162b',emissiveIntensity:1.1});
  for(const side of [-1,1]){
    box(truck,[0.025,0.15,0.29],[-7.67,1.01,side*0.9],brakeLens);
    box(truck,[0.025,0.15,0.1],[-7.67,1.01,side*1.12],amber);
    box(truck,[0.025,0.15,0.1],[-7.67,1.01,side*0.68],lens);
    for(const y of [0.93,1.09])for(const z of [side*0.64,side*1.18]){
      const bolt=mesh(truck,new THREE.CylinderGeometry(0.012,0.012,0.015,8),steel,[-7.682,y,z]);bolt.rotation.z=Math.PI/2;
    }
  }
  const wheels = [];
  for (const x of [-5.8, -4.6, -3.4, 4.25, 6.55]) {
    beam(truck, [x, 0.64, -1.08], [x, 0.64, 1.08], 0.105, black);
    for (const side of [-1, 1]) {
      const wheel = new THREE.Group(); wheel.name='truck-wheel'; wheel.position.set(x, 0.62, side * 1.13); truck.add(wheel); wheels.push(wheel);
      const tyre = mesh(wheel, new THREE.LatheGeometry([new THREE.Vector2(0.34,-0.16),new THREE.Vector2(0.43,-0.205),new THREE.Vector2(0.53,-0.2),new THREE.Vector2(0.59,-0.15),new THREE.Vector2(0.615,-0.08),new THREE.Vector2(0.615,0.08),new THREE.Vector2(0.59,0.15),new THREE.Vector2(0.53,0.2),new THREE.Vector2(0.43,0.205),new THREE.Vector2(0.34,0.16)],48), rubber);
      tyre.rotation.x=Math.PI/2;
      if(x<0||x===4.25){const inner=tyre.clone();inner.position.z=-side*0.31;wheel.add(inner);}
      const rim = mesh(wheel, new THREE.CylinderGeometry(0.34, 0.34, 0.22, 24), chrome);
      rim.rotation.x = Math.PI / 2;
      const hub = mesh(wheel, new THREE.CylinderGeometry(0.13, 0.13, 0.28, 16), galvanized);
      hub.rotation.x = Math.PI / 2;
      for(const radius of [0.42,0.51,0.565]) mesh(wheel,new THREE.TorusGeometry(radius,0.008,4,48),black,[0,0,side*0.2]);
      mesh(wheel,new THREE.TorusGeometry(0.32,0.025,8,32),galvanized,[0,0,side*0.14]);
      for (let i = 0; i < 10; i++) {
        const angle = i * Math.PI / 5;
        const bolt = mesh(wheel, new THREE.SphereGeometry(0.026, 6, 4), chrome, [Math.cos(angle) * 0.23, Math.sin(angle) * 0.23, side * 0.15]);
        bolt.scale.z = 0.6;
        const hole=mesh(wheel,new THREE.CircleGeometry(0.044,10),black,[Math.cos(angle+0.16)*0.255,Math.sin(angle+0.16)*0.255,side*0.116]);if(side<0)hole.rotation.y=Math.PI;
      }
      // Circumferential tread grooves are visible across the tyre crown.
      for (const offset of [-0.08, 0, 0.08]) mesh(wheel, new THREE.TorusGeometry(0.602, 0.009, 4, 32), black, [0, 0, offset]);
      if (x < 0) box(truck, [0.06, 0.67, 0.5], [x - 0.65, 0.65, side * 1.14], rubber);
    }
  }
  // Soft contact shadow complements directional shadows beneath the moving chassis.
  const shadowTexture = canvasTexture(128, 128, (ctx, w, h) => {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    gradient.addColorStop(0, '#000000a0'); gradient.addColorStop(1, '#00000000'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
  });
  const contactMat = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }); materials.add(contactMat);
  const contactShadow = mesh(scene, new THREE.PlaneGeometry(18, 6), contactMat, [0, 0.035, 0]);
  contactShadow.rotation.x = -Math.PI / 2; contactShadow.castShadow = false;
  // Red scan light actually falls across the corrugation and onto the apron.
  const scanLights = [];
  const floorSpill = new THREE.PointLight('#ff1233', 35, 9, 1.5);
  floorSpill.position.set(0, 0.65, 0); scene.add(floorSpill);
  for (const side of [-1, 1]) {
    const spotlight = new THREE.SpotLight('#ff092c', 180, 15, 0.4, 0.6, 1.5);
    spotlight.position.set(1.2, 3.2, side * 2.5); spotlight.target.position.set(1.2, 2.8, -side * 1.2);
    scene.add(spotlight, spotlight.target); scanLights.push(spotlight);
  }
  const overheadScan = new THREE.SpotLight('#ff1235', 200, 12, 0.4, 0.6, 1.5);
  overheadScan.position.set(1.2, 6.8, 0); overheadScan.target.position.set(1.2, 0, 0); scene.add(overheadScan, overheadScan.target); scanLights.push(overheadScan);
  const scanPlaneMat = new THREE.MeshBasicMaterial({ color: '#ff1538', transparent: true, opacity: 0.035, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }); materials.add(scanPlaneMat);
  const scanPlane = mesh(scene, new THREE.PlaneGeometry(4.8, 5.8), scanPlaneMat, [1.2, 3.2, 0]); scanPlane.rotation.y = Math.PI / 2; scanPlane.castShadow = false;
  // Floodlight towers: warm pools on the concrete and visible high-luminance fixtures.
  function floodTower(x, z, height = 18) {
    beam(scene, [x, 0, z], [x, height, z], 0.075, galvanized);
    box(scene, [1, 0.25, 1], [x, 0.12, z], concrete);
    box(scene, [3.2, 0.15, 0.24], [x, height, z], steel);
    for (const dx of [-1.2, -0.4, 0.4, 1.2]) {
      box(scene, [0.5, 0.18, 0.45], [x + dx, height, z], black);
      box(scene, [0.44, 0.04, 0.4], [x + dx, height - 0.11, z], glow);
    }
    const lamp = new THREE.SpotLight('#fff2d7', 850, 75, 0.85, 0.75, 2);
    lamp.position.set(x, height - 0.3, z); lamp.target.position.set(x * 0.65, 0, z + 8); scene.add(lamp, lamp.target);
  }
  for (const x of [-35, -14, 17, 40]) floodTower(x, -15, 19);
  floodTower(-20, 15, 17); floodTower(23, 11, 17);
  // Ship-to-shore cranes: box-girder portals, A-frame stays, catwalks, wheel bogies and spreaders.
  const cranePaint=mat('#4b9bb2',0.64,0.35,{map:paintWear,bumpMap:paintWear,bumpScale:0.01});
  const safetyYellow=mat('#caa731',0.65,0.35);
  const tipOrange=mat('#ca872b',0.65,0.25);
  const craneCable=mat('#303941',0.45,0.65);
  function girder(parent,a,b,width,depth,material=cranePaint){
    const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),direction=to.clone().sub(from);
    position.copy(from).add(to).multiplyScalar(0.5);rotation.setFromUnitVectors(axis,direction.clone().normalize());scale.set(width,direction.length(),depth);matrix.compose(position,rotation,scale);instance(unitBox,parent,material,matrix);
  }
  function railing(parent,x,y,z,width,depth){
    for(const dx of [-width/2,width/2]){
      beam(parent,[x+dx,y,z-depth/2],[x+dx,y+0.95,z-depth/2],0.022,safetyYellow);
      beam(parent,[x+dx,y,z+depth/2],[x+dx,y+0.95,z+depth/2],0.022,safetyYellow);
      for(const height of [0.45,0.95])beam(parent,[x+dx,y+height,z-depth/2],[x+dx,y+height,z+depth/2],0.022,safetyYellow);
    }
    for(const dz of [-depth/2,depth/2])for(const height of [0.45,0.95])beam(parent,[x-width/2,y+height,z+dz],[x+width/2,y+height,z+dz],0.022,safetyYellow);
  }
  function platform(parent,x,y,z,width,depth){box(parent,[width,0.1,depth],[x,y,z],galvanized);railing(parent,x,y+0.1,z,width,depth);}
  const festoonPath=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,-1.8,0.3),new THREE.Vector3(0,-2.25,0.8),new THREE.Vector3(0,-1.8,1.3),new THREE.Vector3(0,0,1.6)]);
  const festoonGeometry=new THREE.TubeGeometry(festoonPath,20,0.035,6,false);
  const craneSign=canvasTexture(2048,256,(ctx,w,h)=>{ctx.fillStyle='#183d66';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 150px Arial';ctx.fillText('TERMINAL OPERATIONS',w/2,h/2,1950);});
  const machineSign=canvasTexture(1024,512,(ctx,w,h)=>{ctx.fillStyle='#254263';ctx.font='bold 220px Arial';ctx.textAlign='center';ctx.fillText('STS',w/2,260);ctx.font='50px monospace';ctx.fillText('QUAYSIDE SYSTEMS',w/2,365);});
  function crane(x,z,index){
    // Four tapered portal legs and multi-wheel rail bogies.
    for(const side of [-1,1])for(const end of [-1,1]){
      const bx=x+side*7.1,bz=z+end*7.2;
      girder(scene,[bx,1.5,bz],[x+side*4.5,31,z+end*5.4],1.15,1.4);
      box(scene,[4.8,0.7,1.8],[bx,1.5,bz],cranePaint);
      box(scene,[4.6,0.58,1.3],[bx,0.98,bz],safetyYellow);
      for(let wheel=0;wheel<6;wheel++)for(const face of [-1,1]){
        const wx=bx-1.8+wheel*0.72,wz=bz+face*0.7;
        beam(scene,[wx,0.47,wz-0.13],[wx,0.47,wz+0.13],0.4,black);
        beam(scene,[wx,0.47,wz-0.15],[wx,0.47,wz+0.15],0.19,steel);
      }
      platform(scene,bx,2.02,bz,4.9,2.05);
      girder(scene,[bx,8,bz],[x-side*4.5,28,z+end*5.4],0.3,0.35);
    }
    for(const end of [-1,1]){
      box(scene,[15,0.65,1],[x,7,z+end*6.9],cranePaint);
      platform(scene,x,7.4,z+end*6.9,14.8,1.2);
      box(scene,[11,0.75,1.2],[x,30.7,z+end*5.4],cranePaint);
    }
    // Running rails and a visibly deep twin I-girder boom.
    for(const end of [-1,1]){
      box(scene,[32,0.06,0.12],[x,0.06,z+end*7.2],steel);
    }
    for(const side of [-1,1]){
      const gx=x+side*3.5;
      box(scene,[0.85,1.45,73],[gx,32,z-11.5],cranePaint);
      for(const y of [31.28,32.72])box(scene,[1.16,0.14,73],[gx,y,z-11.5],cranePaint);
      box(scene,[0.7,0.09,72],[x+side*4.18,32.85,z-11.5],galvanized);
      // Handrail posts continue down both sides of the entire walkway.
      for(let dz=-47.5;dz<24;dz+=2.5)beam(scene,[x+side*4.55,32.9,z+dz],[x+side*4.55,33.85,z+dz],0.022,safetyYellow);
      for(const y of [33.35,33.85])beam(scene,[x+side*4.55,y,z-47.5],[x+side*4.55,y,z+24],0.023,safetyYellow);
      for(let part=0;part<4;part++)box(scene,[0.88,1.48,2],[gx,32,z-47+part*2],part%2?white:tipOrange);
      for(let dz=-46;dz<23;dz+=4.5){
        beam(scene,[x-3.5,32.6,z+dz],[x+3.5,32.6,z+dz],0.085,cranePaint);
      }
      for(let dz=-46;dz<22;dz+=5)beam(scene,[x-3.5,32.55,z+dz],[x+3.5,32.55,z+dz+5],0.055,cranePaint);
      decal(scene,craneSign,23,0.75,[x+side*3.95,32,z-25],side>0?Math.PI/2:-Math.PI/2);
    }
    // Tall mast with cyan structural stays and paired steel suspension cables.
    for(const side of [-1,1]){
      beam(scene,[x+side*4.5,31,z-5.4],[x+side*2.1,49,z-6.2],0.3,cranePaint);
      beam(scene,[x+side*2.1,49,z-6.2],[x+side*3.5,32,z+20],0.23,cranePaint);
      beam(scene,[x+side*2.1,49,z-6.2],[x+side*3.5,32,z-43],0.15,cranePaint);
      for(const reach of [-46,-35,-22,19,23])for(const offset of [-0.08,0.08])beam(scene,[x+side*2.1+offset,49,z-6.2],[x+side*3.5+offset,32.9,z+reach],0.025,steel);
    }
    platform(scene,x,49,z-6.2,6.2,4);
    for(const dx of [-2.2,2.2]){
      box(scene,[1.2,0.7,1],[x+dx,49.45,z-6.2],black);
      beam(scene,[x+dx,49.6,z-6.2],[x+dx,51.4,z-6.2],0.025,steel);
      box(scene,[0.15,0.2,0.15],[x+dx,51.5,z-6.2],redGlow);
    }
    // Switchback access stairs, intermediate landings and ladder cage along the mast.
    for(let level=0;level<6;level++){
      const y=32+level*2.8,fromZ=z-7+(level%2?2.4:0),toZ=z-7+(level%2?0:2.4),sx=x+2.55;
      platform(scene,sx,y,fromZ,1.5,1.2);
      for(let step=0;step<12;step++)box(scene,[1.05,0.07,0.27],[sx,y+step*2.8/12,THREE.MathUtils.lerp(fromZ,toZ,step/12)],galvanized);
      for(const dx of [-0.61,0.61])beam(scene,[sx+dx,y+0.85,fromZ],[sx+dx,y+3.65,toZ],0.022,safetyYellow);
    }
    // Machinery room with corrugated cladding, louvres, roof plant and maintenance walkways.
    box(scene,[8,4.3,8],[x,35.1,z+13.8],white);
    for(let dz=-3.8;dz<4;dz+=0.23)box(scene,[0.035,4.15,0.045],[x+4.03,35.1,z+13.8+dz],steel);
    box(scene,[8.3,0.2,8.3],[x,37.35,z+13.8],cranePaint);
    platform(scene,x,33.05,z+13.8,9.6,9.5);
    railing(scene,x,37.5,z+13.8,8.4,8.4);
    rounded(scene,[2,0.9,2.3],0.1,[x+1.8,37.9,z+14],white);
    for(let i=0;i<10;i++)box(scene,[0.07,0.6,1.5],[x+1.1+i*0.15,38,z+14],galvanized);
    decal(scene,machineSign,5.5,2.75,[x+4.06,35.1,z+13.8],Math.PI/2);
    // Operator cabin hangs below the trolley rail with wraparound glazing.
    rounded(scene,[2.1,2.1,2.8],0.08,[x+3.2,29.1,z+5.5],white);
    box(scene,[0.025,1.25,2.5],[x+4.28,29.35,z+5.5],glass);
    box(scene,[1.9,1.25,0.025],[x+3.2,29.35,z+6.92],glass);
    for(const y of [28.8,29.7])box(scene,[0.03,0.045,2.55],[x+4.3,y,z+5.5],steel);
    // Festoon cable loops beneath the landside boom.
    for(let dz=4;dz<24;dz+=1.6){matrix.compose(new THREE.Vector3(x-3.1,31.25,z+dz),new THREE.Quaternion(),new THREE.Vector3(1,1,1));instance(festoonGeometry,scene,craneCable,matrix);}
    // Trolley, pulleys and a detailed suspended lifting spreader.
    box(scene,[7.4,0.5,3.6],[x,32.6,z-20],safetyYellow);
    for(const dx of [-3.1,3.1])for(const dz of [-1.35,1.35])beam(scene,[x+dx-0.12,32.45,z-20+dz],[x+dx+0.12,32.45,z-20+dz],0.35,black);
    const hoist=new THREE.Group();hoist.position.set(x,14,z-20);scene.add(hoist);
    for(const dx of [-2.7,2.7])for(const dz of [-1,1])beam(scene,[x+dx,32.4,z-20+dz],[x+dx,15.4,z-20+dz],0.023,steel);
    for(const side of [-1,1]){
      box(hoist,[12.5,0.42,0.32],[0,0.18,side*1.2],cranePaint);
      box(hoist,[7.4,0.3,0.25],[0,0.63,side*0.93],safetyYellow);
      for(const end of [-1,1]){
        box(hoist,[0.4,0.6,2.7],[end*5.9,0.15,0],cranePaint);
        box(hoist,[0.3,0.9,0.35],[end*5.9,0.35,side*1.2],cranePaint);
        beam(hoist,[end*5.9,0.2,side*1.2],[end*6.3,-0.4,side*1.2],0.085,cranePaint);
      }
      beam(hoist,[-3,0.9,side*1],[3,0.9,side*1],0.06,chrome);
    }
    box(hoist,[4.5,0.25,2.8],[0,0.8,0],cranePaint);railing(hoist,0,0.95,0,4.3,2.6);
    for(const dx of [-1.5,1.5]){
      box(hoist,[0.7,0.8,0.8],[dx,1.35,0],safetyYellow);
      beam(hoist,[dx-0.4,1.45,0],[dx+0.4,1.45,0],0.27,galvanized);
      for(let step=0;step<5;step++)box(hoist,[0.65,0.04,0.1],[dx,0.1+step*0.22,1.5],safetyYellow);
    }
    container(hoist,[0,-3.05,0],paints[2],false,1);
    // Service platforms down the landside leg.
    for(let y=4;y<31;y+=3.8){
      platform(scene,x+7.1-y*0.08,y,z+7.8,2.6,1.7);
      for(const dx of [-0.38,0.38])beam(scene,[x+7.1-y*0.08+dx,y,z+8.8],[x+7.1-(y+3.8)*0.08+dx,y+3.8,z+8.8],0.025,safetyYellow);
      for(let rung=0;rung<11;rung++)beam(scene,[x+6.72-y*0.08,y+rung*0.34,z+8.8],[x+7.48-y*0.08,y+rung*0.34,z+8.8],0.018,safetyYellow);
    }
    // Cable reel, silver spokes and a guarded maintenance drum at the lower portal.
    const reel=mesh(scene,new THREE.CylinderGeometry(1.05,1.05,0.55,32),paints[1],[x+4.7,8,z+7.8]);reel.rotation.x=Math.PI/2;
    for(let spoke=0;spoke<24;spoke++){const t=spoke*Math.PI/12;beam(scene,[x+4.7,8,z+8.1],[x+4.7+Math.cos(t),8+Math.sin(t),z+8.1],0.018,steel);}
    for(const dz of [-42,-25,-10,7,20])box(scene,[0.35,0.1,0.5],[x+3.7,32.9,z+dz],glow);
  }
  [-58,-25,20,56].forEach((x,index)=>crane(x,-52,index));
  // Ocean-going container ships: curved hull sections, full-width bridge and lashing frames.
  const hullRed=mat('#7f272d',0.74,0.28,{map:paintWear,bumpMap:paintWear,bumpScale:0.025});
  const hullLower=mat('#303c42',0.9,0.1,{map:paintWear});
  const deckRed=mat('#8a3236',0.88,0.1,{map:paintWear});
  const shipIvory=mat('#bfc2b8',0.82,0.1,{map:paintWear});
  const bridgeGlass=mat('#3f6572',0.17,0.35,{envMapIntensity:0.65});
  const warmWindows=mat('#adbcad',0.45,0.1,{emissive:'#86968b',emissiveIntensity:0.18});
  function ship(x,z,index){
    const vessel=new THREE.Group();vessel.position.set(x,0,z);scene.add(vessel);
    // Cross-sections narrow below the waterline and taper into a pointed bow.
    const sections=[[-43,4.2],[-39,7],[-31,8],[-12,8],[10,8],[26,7.5],[34,5.7],[41,2.6],[45,0.1]];
    function hullBand(bottom,top,bottomScale,topScale,material){
      const vertices=[],indices=[];
      for(const [sx,width] of sections)for(const side of [-1,1]){
        vertices.push(sx,bottom,side*width*bottomScale,sx,top,side*width*topScale);
      }
      for(let i=0;i<sections.length-1;i++)for(let side=0;side<2;side++){
        const k=i*4+side*2,n=k+4;indices.push(k,n,k+1,n,n+1,k+1);
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      material.side=THREE.DoubleSide;mesh(vessel,geometry,material);
    }
    hullBand(-2.8,-0.4,0.64,0.9,hullLower);hullBand(-0.4,4.6,0.9,1,hullRed);
    const deckShape=new THREE.Shape();sections.forEach(([sx,w],i)=>i?deckShape.lineTo(sx,w):deckShape.moveTo(sx,w));[...sections].reverse().forEach(([sx,w])=>deckShape.lineTo(sx,-w));deckShape.closePath();
    const deckGeo=new THREE.ShapeGeometry(deckShape,24);deckGeo.rotateX(-Math.PI/2);mesh(vessel,deckGeo,deckRed,[0,4.62,0]);
    // Rails follow the complete tapered gunwale, leaving an open working forecastle.
    for(const side of [-1,1])for(let i=0;i<sections.length-1;i++){
      const [ax,aw]=sections[i],[bx,bw]=sections[i+1];
      for(const h of [4.8,5.2,5.6])beam(vessel,[ax,h,side*aw],[bx,h,side*bw],0.025,shipIvory);
      const count=Math.ceil((bx-ax)/2.4);for(let j=0;j<count;j++){const t=j/count;beam(vessel,[THREE.MathUtils.lerp(ax,bx,t),4.7,side*THREE.MathUtils.lerp(aw,bw,t)],[THREE.MathUtils.lerp(ax,bx,t),5.6,side*THREE.MathUtils.lerp(aw,bw,t)],0.025,shipIvory);}
    }
    // Five lanes of cargo with lower outer tiers and a stepped top silhouette.
    for(let bay=0;bay<5;bay++)for(let row=0;row<5;row++){
      const cx=-23+bay*12.35,cz=(row-2)*2.51;
      const height=3+(row>0&&row<4?1:0)+((bay+row+index)%3===0?1:0);
      for(let tier=0;tier<height;tier++)container(vessel,[cx,4.9+tier*2.95,cz],paints[(bay*7+row*3+tier*2+index*4)%paints.length]);
    }
    // Red lashing bridges, uprights and walkways between cargo bays.
    for(const bx of [-29.3,-16.95,-4.6,7.75,20.1,32.45]){
      for(const side of [-1,1]){
        const pz=side*6.5;beam(vessel,[bx,4.8,pz],[bx,13.6,pz],0.075,deckRed);
        beam(vessel,[bx-0.6,4.8,pz],[bx-0.6,13.6,pz],0.04,deckRed);
        for(let y=5;y<13.5;y+=0.45)beam(vessel,[bx-0.6,y,pz],[bx,y,pz],0.025,shipIvory);
        for(let tier=0;tier<3;tier++)beam(vessel,[bx,5+tier*2.95,pz],[bx,7.8+tier*2.95,pz-side*1],0.025,steel);
      }
    }
    // Aft accommodation tower with a panoramic bridge, wings and exterior stairs.
    box(vessel,[7,11.2,11.5],[-35.2,10.4,0],shipIvory);
    for(let floor=0;floor<5;floor++){
      for(const side of [-1,1])for(let win=0;win<3;win++)box(vessel,[0.75,0.8,0.035],[-37+win*1.6,6.2+floor*1.9,side*5.77],(win+floor)%3?bridgeGlass:warmWindows);
      for(const side of [-1,1])beam(vessel,[-39,5.4+floor*1.9,side*6],[-31.5,7.3+floor*1.9,side*6],0.035,shipIvory);
    }
    box(vessel,[10.8,1.6,17],[-35.2,16.7,0],shipIvory);
    for(let win=0;win<16;win++)box(vessel,[0.035,1.02,0.8],[-29.78,16.85,-7.5+win],bridgeGlass);
    for(const side of [-1,1])for(let win=0;win<9;win++)box(vessel,[0.85,1,0.035],[-39.6+win,16.85,side*8.52],bridgeGlass);
    box(vessel,[11.5,0.25,17.7],[-35.2,17.65,0],shipIvory);
    beam(vessel,[-35,17.8,0],[-35,23,0],0.07,shipIvory);
    beam(vessel,[-38,20.4,0],[-32,20.4,0],0.05,shipIvory);
    for(const side of [-1,1])beam(vessel,[-35,18,side*3],[-35,21.9,0],0.03,steel);
    box(vessel,[3,4,3],[-40,17,-3],deckRed);box(vessel,[3.15,0.3,3.15],[-40,19.05,-3],black);
    // Foredeck mast, winches, chain runs, hatches and anchors.
    beam(vessel,[37,4.7,0],[37,12,0],0.09,shipIvory);
    for(const side of [-1,1]){
      beam(vessel,[34.8,4.7,side*2],[37,10,0],0.055,shipIvory);
      box(vessel,[1.5,0.5,1.3],[36,4.9,side*2.7],deckRed);
      beam(vessel,[36,5.4,side*2.1],[36,5.4,side*3.4],0.36,steel);
      beam(vessel,[36,5.1,side*3.2],[41,4.9,side*2],0.065,black);
      for(let link=0;link<12;link++){
        const ring=mesh(vessel,new THREE.TorusGeometry(0.105,0.035,5,8),black,[36+link*0.38,5.03,side*(3.2-link*0.09)]);ring.rotation.x=link%2?Math.PI/2:0;
      }
      box(vessel,[1.4,0.16,1],[39,4.8,side*1.4],steel);
      beam(vessel,[42,1.2,side*2],[42,2.8,side*2],0.07,black);
      beam(vessel,[41.5,1.4,side*2],[42.5,1.4,side*2],0.08,black);
    }
    const nameMap=canvasTexture(2048,256,(ctx,w,h)=>{ctx.fillStyle='#d9d5c8';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='90px Arial';ctx.fillText(index?'PACIFIC CONTAINER LINE':'CPL SHIPPING LINE',w/2,h/2,1950);});
    for(const side of [-1,1])decal(vessel,nameMap,27,2.1,[-2,2.7,side*8.03],side>0?0:Math.PI);
  }
  ship(-52,-79,0);ship(49,-80,1);
  // Consolidate thousands of repeated parts into a small number of GPU draws.
  batches.forEach((byMaterial, parent) => byMaterial.forEach((byGeometry, material) => byGeometry.forEach((entries, geometry) => {
    const instanced = new THREE.InstancedMesh(geometry, material, entries.length);
    entries.forEach((entry, i) => instanced.setMatrixAt(i, entry));
    instanced.castShadow = parent !== scene || material === steel || material === cranePaint;
    instanced.receiveShadow = true; instanced.computeBoundingSphere(); parent.add(instanced);
  })));
  // The secondary truck uses the full production mesh instead of a box cab and flat wheels.
  const yardTruck=truck.clone(true);yardTruck.scale.setScalar(0.8);yardTruck.position.set(-18,0,-18);
  const yardWheels=[];
  yardTruck.traverse(object=>{
    if(object.name==='truck-wheel')yardWheels.push(object);
    if(object.material===mainPaint)object.material=paints[1];
    if(object.material===brandMaterial)object.material=shippingMaterials[7];
  });
  scene.add(yardTruck);
  // Soft moving key and cool rim keep the inspection truck prominent along its route.
  const truckLighting = new THREE.Group();
  function truckSpot(color, intensity, source, target, angle) {
    const light = new THREE.SpotLight(color, intensity, 32, angle, 0.85, 2);
    light.position.set(...source); light.target.position.set(...target);
    truckLighting.add(light, light.target);
  }
  truckSpot('#fff4e4', 480, [3, 11, 7], [-1, 2, 0], 0.7);
  truckSpot('#b8eaff', 450, [-5, 9, -6], [-2, 2.5, 0], 0.7);
  truckSpot('#e5f4ff', 280, [9, 5, 4], [6, 2, 0], 0.55);
  scene.add(truckLighting);
  const lookAt = new THREE.Vector3();
  const views = [
    { position: new THREE.Vector3(23, 13, 25), target: new THREE.Vector3(-5, 2, -5) },
    { position: new THREE.Vector3(-18, 9, 21), target: new THREE.Vector3(-1, 2.6, -2) },
    { position: new THREE.Vector3(26, 26, 37), target: new THREE.Vector3(-4, 2, -15) },
    { position: new THREE.Vector3(42, 35, 65), target: new THREE.Vector3(-5, 15, -28) },
  ];
  return {
    scene,
    update(elapsed, progress, camera) {
      // Loop outside the central view; start each visit with the truck under the portal.
      const phase = (elapsed * 0.85 + 20) % 44;
      waveBump.offset.set(elapsed*0.007,elapsed*0.003);
      waterColor.offset.set(elapsed*0.0015,elapsed*0.0008);
      truck.position.x = phase - 22;
      truckLighting.position.x = truck.position.x;
      contactShadow.position.x = truck.position.x - 0.6;
      wheels.forEach(wheel => { wheel.rotation.z = -elapsed * 0.85 / 0.61; });
      const scanning = truck.position.x > -7.2 && truck.position.x < 7.4;
      scanLights.forEach(light => { light.intensity = scanning ? 85 + Math.sin(elapsed * 9) * 4 : 8; });
      scanPlaneMat.opacity = scanning ? 0.035 : 0.008;
      floorSpill.intensity = scanning ? 18 : 2;
      yardTruck.position.x = ((elapsed * 0.5 + 35) % 120) - 60;
      yardWheels.forEach(wheel=>{wheel.rotation.z=-elapsed*0.5/(0.61*0.8);});
      const stage = THREE.MathUtils.clamp(progress, 0, 1) * 3;
      const i = Math.min(2, Math.floor(stage));
      const blend = THREE.MathUtils.smoothstep(stage - i, 0, 1);
      camera.position.lerpVectors(views[i].position, views[i + 1].position, blend);
      lookAt.lerpVectors(views[i].target, views[i + 1].target, blend);
      if (camera.aspect < 1) { camera.position.multiplyScalar(1.28); lookAt.set(-1, 2, -7); }
      camera.lookAt(lookAt);
    },
    dispose() {
      disposed = true;
      scene.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
        if (object.isInstancedMesh) object.dispose();
        if (object.isLight) object.dispose();
      });
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
      textures.forEach(map => map.dispose()); environment.dispose();
    },
  };
}
