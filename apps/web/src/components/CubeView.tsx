import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import {
  CUBE_FACE_DIRECTIONS,
  createCubieViewModels,
  createMoveAnimation,
  isCubieInMoveLayer,
  previewRotationAt,
  type CubeMove,
  type CubeViewState,
} from './cubeViewModel';
import type { FacePreview } from './FaceControl';
import './cube-view.css';

export interface CubeViewProps {
  readonly state: CubeViewState;
  readonly animation?: {
    readonly id: number;
    readonly move: CubeMove;
    readonly durationMs?: number;
  };
  readonly preview?: FacePreview | null;
  readonly onAnimationComplete?: (animationId: number) => void;
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
export function CubeView({
  state,
  animation,
  preview,
  onAnimationComplete,
}: CubeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPlayedAnimationId = useRef<number | null>(null);

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

    const stationaryGroup = new THREE.Group();
    const turningGroup = new THREE.Group();
    const ghostGroup = new THREE.Group();
    const shouldPlayMove =
      animation !== undefined && animation.id !== lastPlayedAnimationId.current;
    if (shouldPlayMove) lastPlayedAnimationId.current = animation.id;
    const moveAnimationId = shouldPlayMove ? animation.id : undefined;
    const moveAnimation = shouldPlayMove
      ? createMoveAnimation(animation.move)
      : undefined;
    const previewAnimation =
      preview === null || preview === undefined
        ? undefined
        : createMoveAnimation(
            preview.direction === 'cw' ? preview.face : `${preview.face}'`,
          );
    const geometry = new THREE.BoxGeometry(0.94, 0.94, 0.94);
    const disposableGeometries: THREE.BufferGeometry[] = [geometry];
    const disposableMaterials: THREE.Material[] = [];
    const disposableTextures: THREE.Texture[] = [];

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
          emissive:
            previewAnimation !== undefined &&
            isCubieInMoveLayer(cubie.position, previewAnimation)
              ? 0xffffff
              : 0x000000,
          emissiveIntensity: 0.18,
        });
        disposableMaterials.push(material);
        return material;
      });
      const mesh = new THREE.Mesh(geometry, cubieMaterials);
      mesh.position.set(...cubie.position);
      if (
        moveAnimation !== undefined &&
        isCubieInMoveLayer(cubie.position, moveAnimation)
      ) {
        turningGroup.add(mesh);
      } else {
        stationaryGroup.add(mesh);
      }
    }

    if (previewAnimation !== undefined) {
      const ghostGeometry = createGhostGeometry(previewAnimation.axis);
      const ghostMaterial = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const ghost = new THREE.Mesh(ghostGeometry, ghostMaterial);
      ghost.position[previewAnimation.axis] = previewAnimation.layer;
      ghostGroup.add(ghost);
      disposableGeometries.push(ghostGeometry);
      disposableMaterials.push(ghostMaterial);
    }

    const centerLabels = createCenterLabels();
    scene.add(centerLabels.group);
    disposableGeometries.push(...centerLabels.geometries);
    disposableMaterials.push(...centerLabels.materials);
    disposableTextures.push(...centerLabels.textures);

    scene.add(stationaryGroup, turningGroup, ghostGroup);
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

    let animationFrame: number | undefined;
    let completionNotified = false;
    if (moveAnimation === undefined && previewAnimation === undefined) {
      render();
    } else {
      const duration = animation?.durationMs ?? 240;
      const startedAt = performance.now();
      if (moveAnimation !== undefined) {
        turningGroup.rotation[moveAnimation.axis] = -moveAnimation.angle;
      }

      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        if (moveAnimation !== undefined) {
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          turningGroup.rotation[moveAnimation.axis] =
            -moveAnimation.angle * (1 - easedProgress);
          if (
            progress === 1 &&
            !completionNotified &&
            moveAnimationId !== undefined
          ) {
            completionNotified = true;
            onAnimationComplete?.(moveAnimationId);
          }
        }
        if (previewAnimation !== undefined) {
          const previewAngle = THREE.MathUtils.degToRad(12);
          const direction = Math.sign(previewAnimation.angle);
          ghostGroup.rotation[previewAnimation.axis] = previewRotationAt(
            previewAngle * direction,
            now - startedAt,
          );
        }
        render();
        if (progress < 1 || previewAnimation !== undefined) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      animationFrame = requestAnimationFrame(animate);
    }
    window.addEventListener('resize', render);

    return () => {
      window.removeEventListener('resize', render);
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      for (const disposableGeometry of disposableGeometries) {
        disposableGeometry.dispose();
      }
      for (const material of disposableMaterials) material.dispose();
      for (const texture of disposableTextures) texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [state, animation, preview, onAnimationComplete]);

  return <div ref={containerRef} className="cube-view" />;
}

function createGhostGeometry(axis: 'x' | 'y' | 'z'): THREE.BoxGeometry {
  const thickness = 1.03;
  const length = 3.04;
  if (axis === 'x') return new THREE.BoxGeometry(thickness, length, length);
  if (axis === 'y') return new THREE.BoxGeometry(length, thickness, length);
  return new THREE.BoxGeometry(length, length, thickness);
}

function createCenterLabels(): {
  readonly group: THREE.Group;
  readonly geometries: readonly THREE.PlaneGeometry[];
  readonly materials: readonly THREE.MeshBasicMaterial[];
  readonly textures: readonly THREE.CanvasTexture[];
} {
  const group = new THREE.Group();
  const geometries: THREE.PlaneGeometry[] = [];
  const materials: THREE.MeshBasicMaterial[] = [];
  const textures: THREE.CanvasTexture[] = [];
  const labels = [
    { text: 'U', position: [0, 1.476, 0], rotation: [-Math.PI / 2, 0, 0] },
    { text: 'F', position: [0, 0, 1.476], rotation: [0, 0, 0] },
    { text: 'R', position: [1.476, 0, 0], rotation: [0, Math.PI / 2, 0] },
  ] as const;

  for (const label of labels) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context === null) continue;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#111827';
    context.font = '800 76px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label.text, canvas.width / 2, canvas.height / 2 + 3);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const geometry = new THREE.PlaneGeometry(0.58, 0.58);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(label.position[0], label.position[1], label.position[2]);
    mesh.rotation.set(label.rotation[0], label.rotation[1], label.rotation[2]);
    mesh.renderOrder = 3;
    group.add(mesh);
    geometries.push(geometry);
    materials.push(material);
    textures.push(texture);
  }

  return { group, geometries, materials, textures };
}
