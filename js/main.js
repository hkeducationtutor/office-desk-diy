/* 桌間 — no runtime dependencies except the local Three.js build. */
'use strict';
(()=>{
const $=id=>document.getElementById(id), host=$('viewport');
if(!window.THREE){$('status').textContent='未能載入本地 Three.js，請確認 vendor 資料夾完整。';return;}
const T=THREE, canvas=document.createElement('canvas'), gl=canvas.getContext('webgl2',{antialias:true,alpha:false});
if(!gl){$('status').textContent='此瀏覽器未能啟用 WebGL2，請開啟硬件加速後重試。';return;}
const renderer=new T.WebGLRenderer({canvas,context:gl,antialias:true});host.append(canvas);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.NoToneMapping;
const scene=new T.Scene();scene.background=new T.Color('#dfe4db');
const camera=new T.PerspectiveCamera(40,1,.1,60);let az=.65,el=.68,distance=10;
function view(){camera.position.set(Math.sin(az)*Math.cos(el)*distance,Math.sin(el)*distance,Math.cos(az)*Math.cos(el)*distance);camera.lookAt(0,.5,0);}view();
scene.add(new T.HemisphereLight(0xf2fbff,0x72704d,2));
const sun=new T.DirectionalLight(0xffedcf,4);sun.position.set(-3,7,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:20});sun.shadow.normalBias=.025;scene.add(sun);
const fill=new T.PointLight(0xb8e1ef,20);fill.position.set(4,4,-3);scene.add(fill);
function texture(kind){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=kind==='wood'?'#d0a577':'#163b43';x.fillRect(0,0,256,256);if(kind==='wood'){for(let i=0;i<180;i++){x.strokeStyle=`rgba(72,39,14,${.025+(i%7)*.009})`;x.beginPath();for(let z=0;z<=256;z+=8)x.lineTo(z,i*1.5+Math.sin(z/40+i)*2);x.stroke();}}else{x.fillStyle='#8db9a0';x.font='16px sans-serif';x.fillText('讓靈感，慢慢發生。',24,55);for(let i=0;i<5;i++){x.fillStyle=['#bbd3b0','#668f87','#e5cf9c'][i%3];x.fillRect(25,90+i*24,160-i*20,9);}}const t=new T.DataTexture(new Uint8Array(x.getImageData(0,0,256,256).data),256,256);t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;return t;}
const wood=texture('wood'),screen=texture('screen');
function mat(color,roughness=.5,metalness=0){return new T.MeshStandardMaterial({color,roughness,metalness});}
const dark=mat('#293d3c',.35,.4),cream=mat('#e9e2ca'),leaf=mat('#407a4c'),metal=mat('#abb7b4',.22,.85);
function mesh(g,geom,m,x=0,y=0,z=0){const o=new T.Mesh(geom,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
function box(g,w,h,d,m,x=0,y=0,z=0){return mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);}
function cyl(g,r1,r2,h,m,x=0,y=0,z=0){return mesh(g,new T.CylinderGeometry(r1,r2,h,40),m,x,y,z);}
// Procedural studio environment gives metal and glass something to reflect.
const studio=new T.Scene();studio.background=new T.Color('#b6c6c0');box(studio,8,1,5,new T.MeshBasicMaterial({color:'#fff8e6'}),0,4,0);box(studio,1,4,4,new T.MeshBasicMaterial({color:'#7b9caa'}),-4,0,0);
const envTarget=new T.WebGLCubeRenderTarget(128);new T.CubeCamera(.1,30,envTarget).update(renderer,studio);const pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromCubemap(envTarget.texture);scene.environment=env.texture;
const table=new T.Group();scene.add(table);box(table,6,.22,3.5,new T.MeshStandardMaterial({map:wood,color:'#e8c9a1',roughness:.38}),0,-.13,0);for(const x of [-2.65,2.65])for(const z of [-1.35,1.35])box(table,.12,1.55,.12,dark,x,-1,z);box(scene,200,.1,200,mat('#cbd0c5'),0,-1.85,0);
const types={monitor:'螢幕',keyboard:'鍵盤',mouse:'滑鼠',plant:'植物',coffee:'咖啡杯',lamp:'枱燈',pens:'筆筒',notebook:'筆記本',glass:'玻璃杯'};
let items=[],selected=null;const selection=new T.BoxHelper(new T.Object3D(),0x5a9679);selection.visible=false;scene.add(selection);
function make(type){const g=new T.Group(),m=mat('#d6cdb7');g.userData={type,color:'#d6cdb7',material:'plastic'};
if(type==='monitor'){box(g,.7,.06,.42,metal,0,.03,0);box(g,.1,.45,.1,metal,0,.25,0);box(g,1.8,1.1,.12,dark,0,.95,0);box(g,1.64,.93,.015,new T.MeshStandardMaterial({map:screen,emissiveMap:screen,emissive:0xffffff,emissiveIntensity:.35,roughness:.15}),0,.95,.07);}
if(type==='keyboard'){box(g,1.5,.08,.5,m,0,.04,0);for(let r=0;r<4;r++)for(let c=0;c<13;c++)box(g,.092,.035,.08,cream,-.65+c*.108,.095,-.17+r*.108);}
if(type==='mouse'){const o=mesh(g,new T.SphereGeometry(.22,32,16),m,0,.09,0);o.scale.set(.75,.55,1.15);box(g,.03,.02,.09,dark,0,.205,-.04);}
if(type==='plant'){cyl(g,.22,.16,.38,m,0,.19,0);cyl(g,.20,.20,.02,mat('#46392d'),0,.39,0);for(let i=0;i<9;i++){const a=i*2.4,o=mesh(g,new T.SphereGeometry(.12,16,12),leaf,Math.sin(a)*.18,.5+(i%3)*.12,Math.cos(a)*.18);o.scale.set(.55,2.4,.8);o.rotation.z=Math.sin(a)*.6;}}
if(type==='coffee'||type==='glass'){const pts=[new T.Vector2(.14,0),new T.Vector2(.18,.04),new T.Vector2(.19,.4),new T.Vector2(.165,.4),new T.Vector2(.155,.06),new T.Vector2(0,.06)];mesh(g,new T.LatheGeometry(pts,48),m);if(type==='coffee'){const h=mesh(g,new T.TorusGeometry(.12,.035,12,32),m,.2,.22,0);h.scale.y=1.2;cyl(g,.16,.16,.012,mat('#442b18'),0,.34,0);}else cyl(g,.15,.15,.2,new T.MeshPhysicalMaterial({color:'#bde9dd',transparent:true,opacity:.5,roughness:.06,transmission:.8,thickness:.1}),0,.16,0);}
if(type==='lamp'){cyl(g,.24,.28,.06,m,0,.03,0);const arm=box(g,.055,.8,.055,metal,.12,.42,0);arm.rotation.z=-.3;cyl(g,.1,.3,.28,m,.22,.9,0);cyl(g,.26,.26,.01,new T.MeshStandardMaterial({color:'#fff4cc',emissive:'#ffcc77',emissiveIntensity:3}),.22,.755,0);}
if(type==='pens'){cyl(g,.19,.17,.35,m,0,.175,0);for(let i=0;i<7;i++){const p=cyl(g,.016,.016,.55,mat(['#cb916e','#486b61','#e4bf69'][i%3]),Math.sin(i*2)*.1,.42,Math.cos(i*2)*.1);p.rotation.z=Math.sin(i)*.15;}}
if(type==='notebook'){box(g,.65,.085,.88,m,0,.043,0);box(g,.60,.045,.83,cream,.01,.047,0);box(g,.65,.015,.88,m,0,.082,0);box(g,.025,.005,.88,dark,.2,.094,0);}
g.traverse(o=>{if(o.material===m)o.userData.editable=true;});scene.add(g);items.push(g);if(type==='glass'){g.userData.material='glass';g.userData.color='#cceee8';applyMaterial(g);}return g;}
function applyMaterial(g){const d=g.userData;g.traverse(o=>{if(!o.userData.editable)return;const old=o.material;const opts={color:d.color,roughness:d.material==='metal'?.2:.48,metalness:d.material==='metal'?.88:0};o.material=d.material==='glass'?new T.MeshPhysicalMaterial({...opts,roughness:.06,transmission:.85,thickness:.16,ior:1.45,transparent:true,opacity:.78,envMapIntensity:1.6}):new T.MeshStandardMaterial({...opts,map:d.material==='wood'?wood:null});if(old)old.dispose();});}
function pick(g){selected=g;selection.visible=!!g;$('editor').hidden=!g;$('empty').hidden=!!g;if(g){$('name').textContent=types[g.userData.type];$('color').value=g.userData.color;$('material').value=g.userData.material;$('angle').value=T.MathUtils.radToDeg(g.rotation.y);$('size').value=g.scale.x;sync();}}
function sync(){if(!selected)return;$('angleOut').textContent=Math.round(T.MathUtils.radToDeg(selected.rotation.y))+'°';$('sizeOut').textContent=selected.scale.x.toFixed(2)+' 倍';selection.setFromObject(selected);}
function message(s){$('status').textContent=s;}
for(const [type,name]of Object.entries(types)){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{if(items.length>=60)return message('最多可擺放 60 件物件。');const g=make(type);g.position.set((Math.random()-.5)*2,0,.6);pick(g);};$('catalog').append(b);}
for(const [type,x,z]of [['monitor',-.6,-.85],['keyboard',-.6,.25],['mouse',.55,.3],['plant',-2.2,-.9],['coffee',1.35,.65],['lamp',1.95,-1],['pens',-1.95,.35],['notebook',1.35,-.1],['glass',2.35,.55]]){make(type).position.set(x,0,z);}
$('color').oninput=()=>{selected.userData.color=$('color').value;applyMaterial(selected);};$('material').onchange=()=>{selected.userData.material=$('material').value;applyMaterial(selected);};$('angle').oninput=()=>{selected.rotation.y=T.MathUtils.degToRad(+$('angle').value);sync();};$('size').oninput=()=>{selected.scale.setScalar(+$('size').value);sync();};
function record(g){return {...g.userData,x:g.position.x,z:g.position.z,rotation:g.rotation.y,scale:g.scale.x};}
function data(){return {version:1,objects:items.map(record)};}
function restore(input){if(!input||input.version!==1||!Array.isArray(input.objects)||input.objects.length>60)throw Error('場景格式不正確，最多 60 件物件。');const rows=input.objects;for(const r of rows){if(!Object.hasOwn(types,r.type)||!/^#[0-9a-f]{6}$/i.test(r.color)||!['wood','metal','plastic','glass'].includes(r.material)||![r.x,r.z,r.rotation,r.scale].every(Number.isFinite)||Math.abs(r.x)>2.8||Math.abs(r.z)>1.55||r.scale<.5||r.scale>1.8||Math.abs(r.rotation)>100)throw Error('場景包含無效物件或超出範圍。');}pick(null);for(const g of items){scene.remove(g);g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}items=[];for(const r of rows){const g=make(r.type);Object.assign(g.userData,{color:r.color,material:r.material});applyMaterial(g);g.position.set(r.x,0,r.z);g.rotation.y=r.rotation;g.scale.setScalar(r.scale);}message('場景已載入。');}
$('save').onclick=()=>{try{localStorage.setItem('desk-diy-v1',JSON.stringify(data()));message('場景已儲存至此瀏覽器。');}catch(e){message('瀏覽器不允許本地儲存，請使用匯出 JSON。');}};
$('load').onclick=()=>{try{const s=localStorage.getItem('desk-diy-v1');if(!s)return message('未有儲存場景。');restore(JSON.parse(s));}catch(e){message('無法讀取：'+e.message);}};
$('export').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(data(),null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='我的桌間.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);message('已匯出場景 JSON。');};
$('import').onclick=()=>{$('error').textContent='';$('jsonDialog').showModal();};$('cancel').onclick=()=>$('jsonDialog').close();$('file').onchange=async()=>{try{const f=$('file').files[0];if(f.size>200000)throw Error('檔案太大');$('json').value=await f.text();}catch(e){$('error').textContent=e.message;}};$('apply').onclick=()=>{try{if($('json').value.length>200000)throw Error('內容太大');restore(JSON.parse($('json').value));$('jsonDialog').close();}catch(e){$('error').textContent='未能匯入：'+e.message;}};
$('remove').onclick=()=>{if(!selected)return;const g=selected;scene.remove(g);items=items.filter(i=>i!==g);g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});pick(null);};$('copy').onclick=()=>{if(!selected||items.length>=60)return;const r=record(selected),g=make(r.type);Object.assign(g.userData,{color:r.color,material:r.material});applyMaterial(g);g.position.set(Math.min(2.8,r.x+.25),0,Math.min(1.55,r.z+.25));g.rotation.y=r.rotation;g.scale.setScalar(r.scale);pick(g);};$('resetView').onclick=()=>{az=.65;el=.68;distance=10;view();};
const ray=new T.Raycaster(),pointer=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3();let drag=null;
function cast(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);}
canvas.onpointerdown=e=>{cast(e);let o=ray.intersectObjects(items,true)[0]?.object;while(o&&!items.includes(o))o=o.parent;pick(o||null);const p=ray.ray.intersectPlane(plane,hit);drag={id:e.pointerId,x:e.clientX,y:e.clientY,obj:o,offset:p&&o?o.position.clone().sub(p):new T.Vector3()};canvas.setPointerCapture(e.pointerId);};
canvas.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;if(drag.obj){cast(e);if(ray.ray.intersectPlane(plane,hit)){drag.obj.position.x=T.MathUtils.clamp(hit.x+drag.offset.x,-2.8,2.8);drag.obj.position.z=T.MathUtils.clamp(hit.z+drag.offset.z,-1.55,1.55);sync();}}else{az-=(e.clientX-drag.x)*.008;el=T.MathUtils.clamp(el+(e.clientY-drag.y)*.006,.18,1.4);view();}drag.x=e.clientX;drag.y=e.clientY;};canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;};canvas.onwheel=e=>{e.preventDefault();distance=T.MathUtils.clamp(distance+e.deltaY*.008,4,17);view();};
window.addEventListener('keydown',e=>{if(!selected||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||$('jsonDialog').open)return;const k=e.key.toLowerCase();if(!['arrowleft','arrowright','arrowup','arrowdown','q','e'].includes(k))return;e.preventDefault();if(k==='q'||k==='e')selected.rotation.y+=(k==='q'?1:-1)*Math.PI/36;else{selected.position.x=T.MathUtils.clamp(selected.position.x+(k==='arrowleft'?-.05:k==='arrowright'?.05:0),-2.8,2.8);selected.position.z=T.MathUtils.clamp(selected.position.z+(k==='arrowup'?-.05:k==='arrowdown'?.05:0),-1.55,1.55);}$('angle').value=T.MathUtils.radToDeg(selected.rotation.y);sync();});
// WebGL2 MSAA HDR scene, depth-based screen-space AO, threshold bloom, ACES + sRGB.
const hdr=gl.getExtension('EXT_color_buffer_float');
const target=new T.WebGLRenderTarget(1,1,{type:hdr?T.HalfFloatType:T.UnsignedByteType,depthBuffer:true});target.samples=Math.min(4,gl.getParameter(gl.MAX_SAMPLES));target.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);
const postScene=new T.Scene(),postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
const uniforms={image:{value:target.texture},depth:{value:target.depthTexture},pixel:{value:new T.Vector2()},inverseProjection:{value:camera.projectionMatrixInverse},aoOn:{value:true},bloomOn:{value:true}};
const shader=new T.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,vertexShader:`varying vec2 uvPass;void main(){uvPass=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
precision highp float;
varying vec2 uvPass;uniform sampler2D image;uniform sampler2D depth;uniform vec2 pixel;uniform mat4 inverseProjection;uniform bool aoOn;uniform bool bloomOn;
vec3 positionAt(vec2 uv){float z=texture2D(depth,uv).r;vec4 p=inverseProjection*vec4(uv*2.-1.,z*2.-1.,1.);return p.xyz/p.w;}
vec3 aces(vec3 c){return clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);}
void main(){vec3 c=texture2D(image,uvPass).rgb;float d=texture2D(depth,uvPass).r;
if(aoOn&&d<.9999){vec3 p=positionAt(uvPass);vec3 n=normalize(cross(dFdx(p),dFdy(p)));if(n.z<0.)n=-n;float occ=0.;
for(int i=0;i<16;i++){float a=float(i)*2.399963;float radius=3.+float(i)*1.7;vec2 v=uvPass+vec2(cos(a),sin(a))*pixel*radius;vec3 q=positionAt(v);vec3 delta=q-p;float len=length(delta);occ+=max(dot(n,delta/max(len,.0001))-.09,0.)*(1.-smoothstep(.05,.75,len));}c*=1.-clamp(occ/16.*1.7,0.,.5);}
if(bloomOn){vec3 glow=vec3(0.);float sum=0.;for(int x=-4;x<=4;x++){for(int y=-4;y<=4;y++){vec2 o=vec2(float(x),float(y));float w=exp(-dot(o,o)/8.);vec3 b=texture2D(image,uvPass+o*pixel*3.).rgb;glow+=max(b-vec3(1.1),0.)*w;sum+=w;}}c+=glow/sum*.28;}
c=aces(c*.92);c=mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(vec3(.0031308),c));gl_FragColor=vec4(c,1.);}`});
postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),shader));
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();const v=renderer.getDrawingBufferSize(new T.Vector2());target.setSize(v.x,v.y);uniforms.pixel.value.set(1/v.x,1/v.y);}
new ResizeObserver(resize).observe(host);resize();
function animate(){requestAnimationFrame(animate);if(selected)selection.setFromObject(selected);uniforms.aoOn.value=$('ao').checked;uniforms.bloomOn.value=$('bloom').checked;renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCamera);}animate();message('拖曳擺設移動 · 拖曳空白處轉動視角 · 滾輪縮放');
// Read-only diagnostics for offline validation.
window.deskDiagnostics=()=>({three:T.REVISION,webgl2:renderer.capabilities.isWebGL2,msaa:target.samples,hdr:!!hdr,objects:items.map(record),drawCalls:renderer.info.render.calls});
})();
