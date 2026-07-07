import * as THREE from 'three';

/**
 * Creates a CanvasTexture + PlaneGeometry debug panel that can be attached
 * to the scene or the camera to act as an in-VR HUD.
 */
export function createDebugPanel(width = 512, height = 768) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  // Panel geometry keeps the same aspect ratio as the canvas so the extra
  // diagnostic lines (session/error/HUD-parent/camera transform) fit
  // without stretching the text.
  const geometry = new THREE.PlaneGeometry(0.6, 0.6 * (height / width));
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 999;

  return { mesh, canvas, context, texture };
}

export function updateDebugPanel(panel, lines) {
  const { canvas, context, texture } = panel;

  context.fillStyle = 'rgba(0, 0, 0, 0.85)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = '#00ff88';
  context.lineWidth = 4;
  context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  context.fillStyle = '#00ff88';
  context.font = '20px monospace';
  context.textBaseline = 'top';

  const lineHeight = 24;
  const paddingX = 16;
  const paddingY = 16;

  lines.forEach((line, index) => {
    context.fillText(line, paddingX, paddingY + index * lineHeight);
  });

  texture.needsUpdate = true;
}
