import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import {
  CUBE_FACE_DIRECTIONS,
  createCubieViewModels,
  type CubeViewState,
} from './cubeViewModel';
import './cube-view.css';

export interface CubeViewProps {
  readonly state: CubeViewState;
}

const STICKER_COLORS = {
  white: 0xf8fafc,
  red: 0xdc2626,
  green: 0x16a34a,
  yellow: 0xfacc15,
  orange: 0xf97316,
  blue: 0x2563eb,
} as const;

const INTERNAL_FACE_COLOR = 0x111827;

/** CubeStateを表示する、API通信や操作状態を持たないThree.js viewer。 */
export function CubeView({ state }: CubeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(5.2, 4.2, 6.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.replaceChildren(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', '3D Rubik’s Cube');
    renderer.domElement.setAttribute('role', 'img');

    const cubeGroup = new THREE.Group();
    const geometry = new THREE.BoxGeometry(0.94, 0.94, 0.94);
    const materials: THREE.MeshStandardMaterial[] = [];

    for (const cubie of createCubieViewModels(state)) {
      const cubieMaterials = CUBE_FACE_DIRECTIONS.map((direction) => {
        const sticker = cubie.stickers[direction];
        const material = new THREE.MeshStandardMaterial({
          color:
            sticker === undefined
              ? INTERNAL_FACE_COLOR
              : STICKER_COLORS[sticker],
          roughness: 0.72,
          metalness: 0,
        });
        materials.push(material);
        return material;
      });
      const mesh = new THREE.Mesh(geometry, cubieMaterials);
      mesh.position.set(...cubie.position);
      cubeGroup.add(mesh);
    }

    scene.add(cubeGroup);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 2.4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const render = () => {
      const width = container.clientWidth || 480;
      const height = container.clientHeight || 480;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };

    render();
    window.addEventListener('resize', render);

    return () => {
      window.removeEventListener('resize', render);
      geometry.dispose();
      for (const material of materials) material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [state]);

  return <div ref={containerRef} className="cube-view" />;
}
