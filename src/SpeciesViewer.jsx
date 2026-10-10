import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const NAMES = { ladybug: '七星瓢虫', mantis: '螳螂', frog: '青蛙', woodpecker: '啄木鸟' };

export default function SpeciesViewer({ species = 'ladybug' }) {
  const hostRef = useRef(null);
  const [status, setStatus] = useState({ species, phase: 'loading', message: '正在加载本地模型…' });

  useEffect(() => {
    const host = hostRef.current;
    const abort = new AbortController();
    let active = true;
    let failed = false;
    let renderer;
    let controls;
    let observer;
    let object;
    let materials;
    let frame;
    let timer;
    let removeResize = () => {};
    const geometries = new Set();
    const materialSet = new Set();
    const textures = new Set();

    const disposeAssets = () => {
      object?.traverse((child) => {
        if (child.geometry) geometries.add(child.geometry);
        if (child.material) {
          (Array.isArray(child.material) ? child.material : [child.material]).forEach((m) => materialSet.add(m));
        }
      });
      Object.values(materials?.materials || {}).forEach((m) => materialSet.add(m));
      materialSet.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value?.isTexture) textures.add(value);
        });
        material.dispose();
      });
      textures.forEach((texture) => texture.dispose());
      geometries.forEach((geometry) => geometry.dispose());
      materialSet.clear();
      textures.clear();
      geometries.clear();
      materials = undefined;
      object?.removeFromParent();
      object = undefined;
    };
    const release = () => {
      clearTimeout(timer);
      abort.abort();
      cancelAnimationFrame(frame);
      observer?.disconnect();
      removeResize();
      controls?.dispose();
      controls = undefined;
      disposeAssets();
      if (renderer) {
        renderer.domElement.removeEventListener('webglcontextlost', contextLost);
        renderer.dispose();
        renderer.domElement.remove();
        renderer = undefined;
      }
    };
    const fail = (message) => {
      if (!active || failed) return;
      failed = true;
      release();
      setStatus({ species, phase: 'error', message });
    };
    function contextLost(event) {
      event.preventDefault();
      fail('3D 模型暂不可用：图形上下文已丢失，请重新打开查看器。');
    }

    setStatus({ species, phase: 'loading', message: '正在加载本地模型…' });
    timer = setTimeout(() => fail('3D 模型暂不可用：本地模型或纹理加载超时。'), 45000);

    async function load() {
      try {
        if (!Object.prototype.hasOwnProperty.call(NAMES, species)) {
          throw new Error('未配置该物种的本地模型。');
        }
        // Respect the app base path, including deployments below the domain root.
        const base = new URL(`${import.meta.env?.BASE_URL || '/'}models/`, window.location.href);
        const localURL = (path, relativeTo = base) => {
          const url = new URL(path.replace(/\\/g, '/'), relativeTo);
          if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
            throw new Error('模型引用了本地 models 目录以外的资源。');
          }
          return url.href;
        };
        const getText = async (url) => {
          const response = await fetch(url, { signal: abort.signal, redirect: 'error' });
          if (!response.ok) throw new Error(`本地资源读取失败（HTTP ${response.status}）。`);
          return response.text();
        };
        const manifest = JSON.parse(await getText(localURL('manifest.json')));
        if (!active || failed) return;
        const entry = manifest[species];
        if (!entry?.available) throw new Error(entry?.reason || '尚未提供可用的本地模型。');
        const objURL = localURL(entry.obj);
        const mtlURL = localURL(entry.mtl);
        const [objText, mtlText] = await Promise.all([getText(objURL), getText(mtlURL)]);
        if (!active || failed) return;
        if (!/^v\s+[-+.\d]/m.test(objText) || !/^newmtl\s+/m.test(mtlText)) {
          throw new Error('本地 OBJ 或 MTL 文件格式无效。');
        }

        const manager = new THREE.LoadingManager();
        manager.setURLModifier((url) => localURL(url, mtlURL));
        const texturesReady = new Promise((resolve, reject) => {
          manager.onLoad = resolve;
          manager.onError = () => reject(new Error('模型纹理读取失败，无法完整显示模型。'));
        });
        // Keep the manager open until all material texture requests are registered.
        manager.itemStart('materials');
        materials = new MTLLoader(manager).parse(mtlText.replace(/\\/g, '/'), new URL('.', mtlURL).href);
        materials.preload();
        manager.itemEnd('materials');
        await texturesReady;
        if (!active || failed) return;
        object = new OBJLoader(manager).setMaterials(materials).parse(objText);
        let meshes = 0;
        object.traverse((child) => { if (child.isMesh) meshes += 1; });
        const bounds = new THREE.Box3().setFromObject(object);
        const size = bounds.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        if (!meshes || bounds.isEmpty() || !Number.isFinite(maxSize) || maxSize <= 0) {
          throw new Error('模型没有可显示的有效几何体。');
        }
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 2 / maxSize;
        object.scale.setScalar(scale);
        object.position.copy(center).multiplyScalar(-scale);
        const radius = size.length() * scale / 2;

        const scene = new THREE.Scene();
        scene.add(object);
        scene.add(new THREE.HemisphereLight(0xe8fff5, 0x52675c, 2));
        const light = new THREE.DirectionalLight(0xffffff, 2.5);
        light.position.set(3, 5, 4);
        scene.add(light);
        const fill = new THREE.DirectionalLight(0xb3e2ff, 1);
        fill.position.set(-3, 1, -2);
        scene.add(fill);
        const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;';
        renderer.domElement.setAttribute('aria-label', `${NAMES[species]}三维模型，拖动旋转，滚轮或双指缩放`);
        renderer.domElement.setAttribute('role', 'img');
        renderer.domElement.addEventListener('webglcontextlost', contextLost);
        host.appendChild(renderer.domElement);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.target.set(0, 0, 0);
        camera.position.set(1, 0.65, 1.6).normalize();
        let previousFit = 0;
        const resize = () => {
          if (!active || failed || !renderer) return;
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
          const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
          const fit = radius / Math.sin(Math.min(vertical, horizontal)) * 1.15;
          const direction = camera.position.clone().sub(controls.target);
          const zoomRatio = previousFit ? direction.length() / previousFit : 1;
          camera.position.copy(direction.normalize().multiplyScalar(fit * zoomRatio).add(controls.target));
          controls.minDistance = radius * 1.15;
          controls.maxDistance = fit * 5;
          camera.near = Math.max(radius / 100, 0.001);
          camera.far = fit * 20 + radius;
          camera.updateProjectionMatrix();
          previousFit = fit;
          controls.update();
        };
        resize();
        if (typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(resize);
          observer.observe(host);
        }
        window.addEventListener('resize', resize);
        removeResize = () => window.removeEventListener('resize', resize);
        const render = () => {
          if (!active || failed) return;
          try {
            controls.update();
            renderer.render(scene, camera);
            frame = requestAnimationFrame(render);
          } catch {
            fail('3D 模型暂不可用：浏览器无法渲染此模型。');
          }
        };
        render();
        if (!failed) {
          clearTimeout(timer);
          setStatus({ species, phase: 'ready', message: '拖动旋转 · 滚轮 / 双指缩放' });
        }
      } catch (error) {
        fail(`3D 模型暂不可用：${error instanceof Error ? error.message : '加载失败。'}`);
      }
    }
    load();
    return () => {
      active = false;
      release();
    };
  }, [species]);

  const current = status.species === species
    ? status
    : { phase: 'loading', message: '正在加载本地模型…' };

  return (
    <section
      aria-label={`${NAMES[species] || '物种'}三维查看器`}
      aria-busy={current.phase === 'loading'}
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: 320, overflow: 'hidden', borderRadius: 16, background: 'radial-gradient(ellipse at center, #183b36 0%, #091e20 100%)', color: '#d8eee5' }}
    >
      <div ref={hostRef} style={{ position: 'absolute', inset: 0, visibility: current.phase === 'ready' ? 'visible' : 'hidden' }} />
      <div
        role="status"
        aria-live="polite"
        style={current.phase === 'ready'
          ? { position: 'absolute', bottom: 16, left: 16, right: 16, textAlign: 'center', fontSize: 12, pointerEvents: 'none' }
          : { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center', lineHeight: 1.8, fontSize: 14 }}
      >
        {current.message}
      </div>
    </section>
  );
}
