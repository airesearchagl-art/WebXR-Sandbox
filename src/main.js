import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { createDebugPanel, updateDebugPanel } from './vrDebugPanel.js';

const HUD_MODES = ['world-fixed', 'camera-forward', 'camera-add', 'xr-camera-add'];

function getInitialHudMode() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('hud');
  return HUD_MODES.includes(requested) ? requested : 'camera-forward';
}

let hudMode = getInitialHudMode();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101018);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  50
);
camera.position.set(0, 1.6, 3);
// The camera must be part of the scene graph so that HUD panels parented
// to it (camera-forward / camera-add modes) are rendered.
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Lighting
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(2, 4, 2);
scene.add(dirLight);

// Floor marker
const grid = new THREE.GridHelper(10, 20, 0x00ff88, 0x224422);
scene.add(grid);

// STEP1: red cube
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 0.3, 0.3),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
cube.position.set(0, 1.2, -1);
scene.add(cube);

// STEP2: debug / HUD panel
const debugPanel = createDebugPanel();
let panelParent = scene;

function attachPanel(mode) {
  panelParent.remove(debugPanel.mesh);

  switch (mode) {
    case 'world-fixed':
      debugPanel.mesh.position.set(0, 1.5, -1.2);
      debugPanel.mesh.quaternion.identity();
      scene.add(debugPanel.mesh);
      panelParent = scene;
      break;

    case 'camera-forward':
      debugPanel.mesh.position.set(0, 0, -1);
      debugPanel.mesh.quaternion.identity();
      camera.add(debugPanel.mesh);
      panelParent = camera;
      break;

    case 'camera-add':
      // Corner-style HUD offset instead of dead center.
      debugPanel.mesh.position.set(0.35, 0.25, -1);
      debugPanel.mesh.quaternion.identity();
      camera.add(debugPanel.mesh);
      panelParent = camera;
      break;

    case 'xr-camera-add': {
      // Experimental: attach to the active XR sub-camera (per-eye camera)
      // instead of the main three.js camera. This is not guaranteed to be
      // stable across browsers/three.js versions; kept for investigation.
      let targetCamera = camera;
      try {
        if (renderer.xr.isPresenting) {
          const xrCamera = renderer.xr.getCamera();
          if (xrCamera && xrCamera.cameras && xrCamera.cameras.length > 0) {
            targetCamera = xrCamera.cameras[0];
          }
        }
      } catch (error) {
        targetCamera = camera;
      }
      debugPanel.mesh.position.set(0, 0, -1);
      debugPanel.mesh.quaternion.identity();
      targetCamera.add(debugPanel.mesh);
      panelParent = targetCamera;
      break;
    }

    default:
      scene.add(debugPanel.mesh);
      panelParent = scene;
  }
}

attachPanel(hudMode);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Desktop-only convenience for testing outside a headset: cycle HUD mode
// with the "H" key. Controller-driven mode switching is left for a
// follow-up PR.
window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() !== 'h') return;
  const currentIndex = HUD_MODES.indexOf(hudMode);
  hudMode = HUD_MODES[(currentIndex + 1) % HUD_MODES.length];
  attachPanel(hudMode);
});

function safeGetSession() {
  try {
    return renderer.xr.enabled ? renderer.xr.getSession() : null;
  } catch (error) {
    return null;
  }
}

function safeGetInputSources(session) {
  if (!session || !session.inputSources) return [];
  try {
    return Array.from(session.inputSources);
  } catch (error) {
    return [];
  }
}

function describeInputSource(source, index) {
  const handedness = source.handedness || 'unknown';
  const profiles =
    Array.isArray(source.profiles) && source.profiles.length > 0
      ? source.profiles.join(',')
      : 'none';
  const targetRayMode = source.targetRayMode || 'unknown';
  const gamepad = source.gamepad || null;
  const buttonCount = gamepad && gamepad.buttons ? gamepad.buttons.length : 0;
  const axesCount = gamepad && gamepad.axes ? gamepad.axes.length : 0;

  return [
    `#${index} ${handedness} | ray:${targetRayMode} | gp:${gamepad ? 'yes' : 'no'} btn:${buttonCount} axes:${axesCount}`,
    `    profiles: ${profiles}`,
  ];
}

function shortUserAgent(ua) {
  if (!ua) return 'unknown';
  return ua.length > 60 ? `${ua.slice(0, 60)}...` : ua;
}

let frameCount = 0;

function render() {
  frameCount += 1;
  cube.rotation.y += 0.01;
  cube.rotation.x += 0.005;

  const session = safeGetSession();
  const inputSources = safeGetInputSources(session);

  const lines = [
    'WebXR Sandbox Debug Panel',
    `frame: ${frameCount}`,
    `xr.isPresenting: ${renderer.xr.isPresenting}`,
    `navigator.xr: ${typeof navigator !== 'undefined' && !!navigator.xr}`,
    `XRSession: ${!!session}`,
    `inputSources: ${inputSources.length}`,
    `HUD mode: ${hudMode}`,
    `UA: ${shortUserAgent(navigator.userAgent)}`,
    '',
  ];

  inputSources.forEach((source, index) => {
    lines.push(...describeInputSource(source, index));
  });

  updateDebugPanel(debugPanel, lines);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(render);
