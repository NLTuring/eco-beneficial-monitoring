import React,{useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
export default function EcoScene({measures=[],day=14,compact=false}){
 const ref=useRef();const [error,setError]=useState(false);
 useEffect(()=>{let renderer,controls,ro,frame;const scene=new T.Scene();
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;ref.current.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','可旋转的示意生态地块');
 const camera=new T.PerspectiveCamera(36,1,.1,100);camera.position.set(12,12,15);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=12;controls.maxDistance=30;controls.maxPolarAngle=Math.PI/2.2;
 scene.add(new T.HemisphereLight(0xfffff0,0x62664c,2.6));const light=new T.DirectionalLight(0xfff3d7,3);light.position.set(-6,14,8);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-12;light.shadow.camera.right=12;light.shadow.camera.top=12;light.shadow.camera.bottom=-12;scene.add(light);
 const mats={};const mat=(c)=>mats[c]||(mats[c]=new T.MeshStandardMaterial({color:c,roughness:.9}));
 const mesh=(g,c,x,y,z)=>{const m=new T.Mesh(g,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m};
 const box=(w,h,d,c,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),c,x,y,z);
 box(10,1,8,0x96795b,0,-.6,0);box(10,.2,8,0xa7ad79,0,0,0);box(10,.035,.22,0xd5cba3,0,.13,.4);box(.25,.035,8,0xd5cba3,.8,.13,0);
 for(let field=0;field<3;field++){const x=-3.2+field*2.3;box(2,.03,3.1,field===1?0xa8ac5e:0x88915b,x,.13,2.1);for(let row=0;row<9;row++){box(.1,.08,2.8,0x5f743e,x-.85+row*.21,.2,2.1);for(let j=0;j<7;j++)mesh(new T.ConeGeometry(.075,.16,4),0x879644,x-.85+row*.21,.29,.85+j*.4);}}
 const tree=(x,z,s=1)=>{mesh(new T.CylinderGeometry(.045,.08,.65,5),0x796448,x,.42,z);mesh(new T.IcosahedronGeometry(.42*s,1),0x425d3e,x,.85*s,z);mesh(new T.IcosahedronGeometry(.31*s,1),0x69824d,x+.14,.99*s,z+.07)};
 for(let i=0;i<60;i++){const x=-4.5+(i%12)*.76,z=-3.4+Math.floor(i/12)*.57;tree(x+Math.sin(i*8)*.17,z,1+Math.sin(i)*.2);}
 for(let x=1.8;x<4.7;x+=.8)for(let z=.9;z<3.5;z+=.85)tree(x,z,.8);
 const pond=mesh(new T.CylinderGeometry(1.1,1.1,.035,48),0x739993,3.35,.15,-.05);pond.scale.z=.62;
 if(measures.includes('flower')){box(6.5,.05,.35,0xb6cf60,-1.3,.19,.75);for(let i=0;i<45;i++)mesh(new T.IcosahedronGeometry(.06,0),i%2?0xe3bd60:0xb4bcda,-4.3+i*.14,.27,.75+Math.sin(i)*.1);}
 if(measures.includes('buffer'))box(9,.035,.28,0xbeed46,0,.2,-.58);
 if(measures.includes('corridor')){box(.32,.04,3,0xbeed46,.8,.2,2);for(let i=0;i<5;i++)tree(.8,.9+i*.55,.45);}
 const resize=()=>{if(!ref.current)return;const {clientWidth:w,clientHeight:h}=ref.current;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};ro=new ResizeObserver(resize);ro.observe(ref.current);resize();const animate=()=>{controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(animate)};animate();
 }catch{setError(true)}
 return()=>{cancelAnimationFrame(frame);ro?.disconnect();controls?.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()});renderer?.dispose();renderer?.domElement.remove()};
 },[measures.join(',')]);
 return <div className={'eco-scene '+(compact?'compact':'')} ref={ref}>{error&&<div className="fallback">三维显示不可用 · 请使用右侧参数编辑与方案对比</div>}<span className="scene-caption">示意生境 / 第 {day} 天 · 拖动旋转，滚轮缩放</span></div>
}
