import * as THREE from 'three/webgpu';
import { pass, uniform, Fn, Loop, Break, If, screenUV,
  vec2, vec3, vec4, float,
  length, normalize, cross, dot, sin, cos, atan, asin, sqrt, pow,
  fract, clamp, smoothstep, mix, floor, step, sign
} from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

// ============================================================================
// PERFORMANCE TIER DETECT
// ============================================================================

const LOW = (() => {
  const m = navigator.deviceMemory;
  const c = navigator.hardwareConcurrency || 4;
  const isMobile = /Mobi|Android|iP(hone|od|ad)/i.test(navigator.userAgent);
  return (m !== undefined && m <= 4) || c <= 4 || isMobile || window.innerWidth < 768;
})();

const stepCount = LOW ? 18 : 32;

// ============================================================================
// CONFIGURATION (hardcoded defaults, no UI)
// ============================================================================

const config = {
  blackHoleMass: 0.4,
  diskInnerRadius: 4.1,
  diskOuterRadius: 14.5,
  diskTemperature: 49.78,
  temperatureFalloff: 5.22,
  diskBrightness: 5,
  diskRotationSpeed: -8.7,
  turbulenceScale: 1.81,
  turbulenceStretch: 0.75,
  turbulenceSharpness: 7.4,
  turbulenceCycleTime: 5,
  turbulenceLacunarity: 2.5,
  turbulencePersistence: 0.8,
  diskEdgeSoftnessInner: 0.18,
  diskEdgeSoftnessOuter: 0.5,
  gravitationalLensing: 2.4,
  dopplerStrength: 1.0,
  stepSize: 1,
  starsEnabled: true,
  starBackgroundColor: '#000000',
  starDensity: LOW ? 0.05 : 0.1,
  starSize: 1.2,
  starBrightness: 0.1,
  nebulaEnabled: true,
  nebula1Scale: 2,
  nebula1Density: 0.5,
  nebula1Brightness: 0.01,
  nebula1Color: '#071f44',
  nebula2Scale: 5.5,
  nebula2Density: 0.05,
  nebula2Brightness: 0.21,
  nebula2Color: '#010615',
  bloomStrength: LOW ? 0.4 : 0.68,
  bloomRadius: 0,
  bloomThreshold: 0.45
};

// ============================================================================
// SHADER UTILITIES
// ============================================================================

const hash21 = Fn(([p]) => {
  const n = sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453);
  return fract(n);
});

const hash31 = Fn(([p]) => {
  const n = sin(dot(p, vec3(127.1, 311.7, 74.7))).mul(43758.5453);
  return fract(n);
});

const hash22 = Fn(([p]) => {
  const px = fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453));
  const py = fract(sin(dot(p, vec2(269.5, 183.3))).mul(43758.5453));
  return vec2(px, py);
});

const noise3D = Fn(([p]) => {
  const i = floor(p);
  const f = fract(p);
  const u = f.mul(f).mul(float(3.0).sub(f.mul(2.0)));
  const a = hash31(i);
  const b = hash31(i.add(vec3(1, 0, 0)));
  const c = hash31(i.add(vec3(0, 1, 0)));
  const d = hash31(i.add(vec3(1, 1, 0)));
  const e = hash31(i.add(vec3(0, 0, 1)));
  const f2 = hash31(i.add(vec3(1, 0, 1)));
  const g = hash31(i.add(vec3(0, 1, 1)));
  const h = hash31(i.add(vec3(1, 1, 1)));
  return mix(
    mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
    mix(mix(e, f2, u.x), mix(g, h, u.x), u.y),
    u.z
  );
});

const fbm = Fn(([p, lacunarity, persistence]) => {
  const value = float(0.0).toVar();
  const amplitude = float(0.5).toVar();
  const pos = p.toVar();
  value.addAssign(noise3D(pos).mul(amplitude));
  pos.mulAssign(lacunarity); amplitude.mulAssign(persistence);
  value.addAssign(noise3D(pos).mul(amplitude));

  // Only compile higher octaves on desktop/high-end systems
  if (!LOW) {
    pos.mulAssign(lacunarity); amplitude.mulAssign(persistence);
    value.addAssign(noise3D(pos).mul(amplitude));
    pos.mulAssign(lacunarity); amplitude.mulAssign(persistence);
    value.addAssign(noise3D(pos).mul(amplitude));
  }
  return value;
});

const blackbodyColor = Fn(([tempK]) => {
  const t = clamp(tempK.sub(1000.0).div(9000.0), float(0.0), float(1.0));
  const red = clamp(float(1.0).sub(t.sub(0.8).mul(2.0)), float(0.5), float(1.0));
  const green = smoothstep(float(0.0), float(0.5), t)
    .mul(float(1.0).sub(t.sub(0.7).mul(0.3).max(0.0)));
  const blue = smoothstep(float(0.3), float(1.0), t).mul(t);
  return vec3(red, green, blue);
});

// ============================================================================
// UNIFORMS
// ============================================================================

const uniforms = {
  blackHoleMass: uniform(config.blackHoleMass),
  diskInnerRadius: uniform(config.diskInnerRadius),
  diskOuterRadius: uniform(config.diskOuterRadius),
  diskTemperature: uniform(config.diskTemperature),
  temperatureFalloff: uniform(config.temperatureFalloff),
  diskBrightness: uniform(config.diskBrightness),
  diskRotationSpeed: uniform(config.diskRotationSpeed),
  turbulenceScale: uniform(config.turbulenceScale),
  turbulenceStretch: uniform(config.turbulenceStretch),
  turbulenceSharpness: uniform(config.turbulenceSharpness),
  turbulenceCycleTime: uniform(config.turbulenceCycleTime),
  turbulenceLacunarity: uniform(config.turbulenceLacunarity),
  turbulencePersistence: uniform(config.turbulencePersistence),
  diskEdgeSoftnessInner: uniform(config.diskEdgeSoftnessInner),
  diskEdgeSoftnessOuter: uniform(config.diskEdgeSoftnessOuter),
  gravitationalLensing: uniform(config.gravitationalLensing),
  dopplerStrength: uniform(config.dopplerStrength),
  stepSize: uniform(config.stepSize),
  starsEnabled: uniform(config.starsEnabled ? 1.0 : 0.0),
  starBackgroundColor: uniform(new THREE.Color(config.starBackgroundColor)),
  starDensity: uniform(config.starDensity),
  starSize: uniform(config.starSize),
  starBrightness: uniform(config.starBrightness),
  nebulaEnabled: uniform(config.nebulaEnabled ? 1.0 : 0.0),
  nebula1Scale: uniform(config.nebula1Scale),
  nebula1Density: uniform(config.nebula1Density),
  nebula1Brightness: uniform(config.nebula1Brightness),
  nebula1Color: uniform(new THREE.Color(config.nebula1Color)),
  nebula2Scale: uniform(config.nebula2Scale),
  nebula2Density: uniform(config.nebula2Density),
  nebula2Brightness: uniform(config.nebula2Brightness),
  nebula2Color: uniform(new THREE.Color(config.nebula2Color)),
  time: uniform(0),
  resolution: uniform(new THREE.Vector2(window.innerWidth, window.innerHeight)),
  cameraPosition: uniform(new THREE.Vector3(0, 5, 20)),
  cameraTarget: uniform(new THREE.Vector3(0, 0, 0))
};

// ============================================================================
// STAR FIELD
// ============================================================================

const starField = Fn(([rayDir]) => {
  const theta = atan(rayDir.z, rayDir.x);
  const phi = asin(clamp(rayDir.y, float(-1.0), float(1.0)));
  const gridScale = float(60.0).div(uniforms.starSize);
  const scaledCoord = vec2(theta, phi).mul(gridScale);
  const cell = floor(scaledCoord);
  const cellUV = fract(scaledCoord);
  const cellHash = hash21(cell);
  const starProb = step(float(1.0).sub(uniforms.starDensity), cellHash);
  const starPos = hash22(cell.add(42.0)).mul(0.8).add(0.1);
  const distToStar = length(cellUV.sub(starPos));
  const baseSizeVar = hash21(cell.add(100.0)).mul(0.03).add(0.01);
  const finalStarSize = baseSizeVar.mul(uniforms.starSize);
  const starCore = smoothstep(finalStarSize, float(0.0), distToStar);
  const starGlow = smoothstep(finalStarSize.mul(3.0), float(0.0), distToStar).mul(0.3);
  const starIntensity = starCore.add(starGlow).mul(starProb);
  const colorTemp = hash21(cell.add(200.0));
  const starColor = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 0.95, 0.8), colorTemp);
  return starColor.mul(starIntensity).mul(uniforms.starBrightness);
});

// ============================================================================
// NEBULA
// ============================================================================

const nebulaField = Fn(([rayDir]) => {
  const noisePos1 = rayDir.mul(uniforms.nebula1Scale);
  const n1 = fbm(noisePos1, float(2.0), float(0.5)).mul(2.0).sub(1.0);
  const layer1 = clamp(n1.add(uniforms.nebula1Density), float(0.0), float(1.0));
  const color1 = uniforms.nebula1Color.mul(layer1).mul(uniforms.nebula1Brightness);
  const noisePos2 = rayDir.mul(uniforms.nebula2Scale);
  const n2 = fbm(noisePos2, float(2.0), float(0.5)).mul(2.0).sub(1.0);
  const layer2 = clamp(n2.add(uniforms.nebula2Density), float(0.0), float(1.0));
  const color2 = uniforms.nebula2Color.mul(layer2).mul(uniforms.nebula2Brightness);
  return color1.add(color2);
});

// ============================================================================
// ACCRETION DISK
// ============================================================================

const accretionDiskColor = Fn(([hitR, hitAngle, time, rayDir]) => {
  const innerR = uniforms.diskInnerRadius;
  const outerR = uniforms.diskOuterRadius;
  const normR = clamp(hitR.sub(innerR).div(outerR.sub(innerR)), float(0.0), float(1.0));

  // Blackbody color
  const peakTempK = uniforms.diskTemperature.mul(1000.0);
  const outerTempK = float(1500.0);
  const tempFalloff = pow(innerR.div(hitR), uniforms.temperatureFalloff);
  const tempK = mix(outerTempK, peakTempK, tempFalloff);
  const diskColor = blackbodyColor(tempK).toVar('diskColor');

  // Doppler beaming
  const rotationSign = sign(uniforms.diskRotationSpeed);
  const velocityDir = vec3(
    sin(hitAngle).negate().mul(rotationSign),
    float(0.0),
    cos(hitAngle).mul(rotationSign)
  );
  const velocityMagnitude = float(1.0).div(sqrt(hitR.div(innerR)));
  const beta = velocityMagnitude.mul(0.3);
  const cosTheta = dot(velocityDir, rayDir);
  const dopplerFactor = float(1.0).div(float(1.0).sub(beta.mul(cosTheta)));
  const dopplerBoost = pow(dopplerFactor, float(3.0).mul(uniforms.dopplerStrength));
  diskColor.mulAssign(clamp(dopplerBoost, float(0.1), float(5.0)));

  // Edge falloff
  const edgeFalloff = smoothstep(float(0.0), uniforms.diskEdgeSoftnessInner, normR)
    .mul(smoothstep(float(1.0), float(1.0).sub(uniforms.diskEdgeSoftnessOuter), normR));

  // Turbulence
  const ringOpacity = float(1.0).toVar('ringOpacity');
  const cycleLength = uniforms.turbulenceCycleTime;
  const cyclicTime = time.mod(cycleLength);
  const blendFactor = cyclicTime.div(cycleLength);
  const keplerianPhase1 = cyclicTime.mul(uniforms.diskRotationSpeed).div(pow(hitR, float(1.5)));
  const keplerianPhase2 = cyclicTime.add(cycleLength).mul(uniforms.diskRotationSpeed).div(pow(hitR, float(1.5)));
  const rotatedAngle1 = hitAngle.add(keplerianPhase1);
  const rotatedAngle2 = hitAngle.add(keplerianPhase2);
  const noiseCoord1 = vec3(
    hitR.mul(uniforms.turbulenceScale),
    cos(rotatedAngle1).div(uniforms.turbulenceStretch.max(0.1)),
    sin(rotatedAngle1).div(uniforms.turbulenceStretch.max(0.1))
  );
  const noiseCoord2 = vec3(
    hitR.mul(uniforms.turbulenceScale),
    cos(rotatedAngle2).div(uniforms.turbulenceStretch.max(0.1)),
    sin(rotatedAngle2).div(uniforms.turbulenceStretch.max(0.1))
  );
  const turbulence1 = fbm(noiseCoord1, uniforms.turbulenceLacunarity, uniforms.turbulencePersistence);
  const turbulence2 = fbm(noiseCoord2, uniforms.turbulenceLacunarity, uniforms.turbulencePersistence);
  const turbulence = mix(turbulence2, turbulence1, blendFactor);
  ringOpacity.assign(pow(clamp(turbulence, float(0.0), float(1.0)), uniforms.turbulenceSharpness));

  const finalOpacity = ringOpacity.mul(edgeFalloff);
  const finalColor = diskColor.mul(uniforms.diskBrightness);
  return vec4(finalColor, finalOpacity);
});

// ============================================================================
// MAIN RAYMARCHING SHADER
// ============================================================================

const blackHoleShader = Fn(() => {
  const rs = uniforms.blackHoleMass.mul(2.0);
  const uv = screenUV.sub(0.5).mul(2.0);
  const aspect = uniforms.resolution.x.div(uniforms.resolution.y);
  const screenPos = vec2(uv.x.mul(aspect), uv.y);

  const camPos = uniforms.cameraPosition;
  const camTarget = uniforms.cameraTarget;
  const camForward = normalize(camTarget.sub(camPos));
  const worldUp = vec3(0.0, 1.0, 0.0);
  const camRight = normalize(cross(worldUp, camForward));
  const camUp = cross(camForward, camRight);

  const fov = float(1.0);
  const rayDir = normalize(
    camForward.mul(fov).add(camRight.mul(screenPos.x)).add(camUp.mul(screenPos.y))
  ).toVar('rayDir');

  const rayPos = camPos.toVar('rayPos');
  const prevPos = camPos.toVar('prevPos');
  const color = vec3(0.0, 0.0, 0.0).toVar('color');
  const alpha = float(0.0).toVar('alpha');
  const escaped = float(0.0).toVar('escaped');
  const captured = float(0.0).toVar('captured');
  const innerR = uniforms.diskInnerRadius;
  const outerR = uniforms.diskOuterRadius;

  Loop(stepCount, () => {
    If(escaped.greaterThan(0.5).or(captured.greaterThan(0.5)).or(alpha.greaterThan(0.99)), () => {
      Break();
    });

    const r = length(rayPos);

    If(r.lessThan(rs.mul(1.01)), () => {
      captured.assign(1.0);
      Break();
    });

    If(r.greaterThan(100.0), () => {
      escaped.assign(1.0);
      Break();
    });

    const toCenter = rayPos.negate().div(r);
    const bendStrength = rs.div(r.mul(r)).mul(uniforms.stepSize).mul(uniforms.gravitationalLensing);
    rayDir.addAssign(toCenter.mul(bendStrength));
    rayDir.assign(normalize(rayDir));

    prevPos.assign(rayPos);
    rayPos.addAssign(rayDir.mul(uniforms.stepSize));

    const crossedPlane = prevPos.y.mul(rayPos.y).lessThan(0.0);
    If(crossedPlane.and(alpha.lessThan(0.99)), () => {
      const t = prevPos.y.negate().div(rayPos.y.sub(prevPos.y));
      const hitPos = mix(prevPos, rayPos, t);
      const hitR = sqrt(hitPos.x.mul(hitPos.x).add(hitPos.z.mul(hitPos.z)));
      const inDisk = hitR.greaterThan(innerR).and(hitR.lessThan(outerR));
      If(inDisk, () => {
        const hitAngle = atan(hitPos.z, hitPos.x);
        const diskResult = accretionDiskColor(hitR, hitAngle, uniforms.time, rayDir);
        const remainingAlpha = float(1.0).sub(alpha);
        color.addAssign(diskResult.xyz.mul(diskResult.w).mul(remainingAlpha));
        alpha.addAssign(remainingAlpha.mul(diskResult.w));
      });
    });
  });

  If(captured.lessThan(0.5), () => {
    escaped.assign(1.0);
  });

  If(escaped.greaterThan(0.5).and(alpha.lessThan(0.99)), () => {
    const bgColor = uniforms.starBackgroundColor.toVar('bgColor');
    If(uniforms.starsEnabled.greaterThan(0.5), () => {
      bgColor.addAssign(starField(rayDir));
    });
    If(uniforms.nebulaEnabled.greaterThan(0.5), () => {
      if (LOW) {
        // Optimized single-octave nebula for performance
        const noisePos1 = rayDir.mul(uniforms.nebula1Scale);
        const n1 = noise3D(noisePos1).mul(uniforms.nebula1Density);
        bgColor.addAssign(uniforms.nebula1Color.mul(n1).mul(uniforms.nebula1Brightness));
      } else {
        bgColor.addAssign(nebulaField(rayDir));
      }
    });
    color.addAssign(bgColor.mul(float(1.0).sub(alpha)));
  });

  const finalColor = pow(color, vec3(1.0 / 2.2));
  return vec4(finalColor, 1.0);
})();

// ============================================================================
// SCENE SETUP
// ============================================================================

const container = document.getElementById('canvas-container');
if (container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Scroll & Parallax Control Variables
  const C = {
    dist: 22.0,       // Starting/maximum camera distance
    minDist: 2.2,     // Minimum distance on full scroll
    tiltBase: -0.10,  // Slightly below the disk plane (opposite side, about -5.7 degrees)
    tiltTarget: -0.05,// Stays slightly below the disk plane during plunge (about -2.8 degrees)
    thetaBase: 1.8,   // Initial orbital rotation angle
    thetaPlunge: 5.5, // Total revolving angle (about 0.9 turns around origin)
    cur: { dist: 22.0 },
    mouse: { x: 0, y: 0 }
  };

  const OX = 2.5; // Offset X to keep the black hole shifted to the right

  function positionCamera(ease) {
    const d = C.cur.dist;
    const theta = C.thetaBase + ease * C.thetaPlunge;
    
    // Check if on a mobile screen (width < 768px)
    const isMobileScreen = window.innerWidth < 768;
    // Apply a steeper upward tilt angle on mobile to see the accretion disk clearly
    const currentTiltBase = isMobileScreen ? -0.45 : C.tiltBase;
    const currentTiltTarget = isMobileScreen ? -0.35 : C.tiltTarget;
    const tilt = THREE.MathUtils.lerp(currentTiltBase, currentTiltTarget, ease);
    
    // Position camera on a spiraling orbit and add mouse parallax
    camera.position.set(
      d * Math.cos(tilt) * Math.sin(theta) + C.mouse.x * 0.4,
      d * Math.sin(tilt) + C.mouse.y * 0.3,
      d * Math.cos(tilt) * Math.cos(theta)
    );
    
    // Calculate the camera's lookAt target dynamically relative to camera position
    const forward = new THREE.Vector3().copy(camera.position).negate().normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();
    
    // Offset look direction to the left so black hole (0,0,0) is pushed to the right side of the screen.
    // On mobile, keep it more centered (reduce OX offset) so it fits on vertical screen.
    const currentOX = isMobileScreen ? 0.8 : OX;
    const target = new THREE.Vector3(0, 0, 0).addScaledVector(right, -currentOX);
    
    camera.lookAt(target);

    // Roll/tilt the camera to match the slanted cinematic angle
    const roll = -0.28 - ease * 0.35; // Banks from ~16 to ~36 degrees
    camera.rotateZ(roll);
  }

  const renderer = new THREE.WebGPURenderer({ antialias: !LOW });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const pixelRatio = LOW ? 0.85 : Math.min(window.devicePixelRatio, 1.25);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  // Create black hole mesh (skybox sphere)
  const geometry = new THREE.SphereGeometry(100, 32, 32);
  geometry.scale(-1, 1, 1);
  const material = new THREE.MeshBasicNodeMaterial();
  material.colorNode = blackHoleShader;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  // ============================================================================
  // SCROLL & MOUSE LISTENERS
  // ============================================================================

  document.addEventListener('mousemove', e => {
    C.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    C.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  let scrollRaw = 0;
  let scrollEase = 0;
  let rafPend = false;

  window.addEventListener('scroll', () => {
    if (rafPend) return;
    rafPend = true;
    requestAnimationFrame(() => {
      scrollRaw = Math.min(1,
        window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight));
      rafPend = false;
    });
  }, { passive: true });

  // ============================================================================
  // ANIMATION
  // ============================================================================

  let postProcessing = null;
  let lastFrameTime = performance.now();

  function updateCamera() {
    uniforms.cameraPosition.value.copy(camera.position);
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    const target = camera.position.clone().add(direction.multiplyScalar(10));
    uniforms.cameraTarget.value.copy(target);
  }

  function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.033);
    lastFrameTime = currentTime;

    // Smooth scroll easing
    scrollEase += (scrollRaw - scrollEase) * 0.022;
    const ease = scrollEase * scrollEase * (3 - 2 * scrollEase);

    // Camera zoom control
    const targetDist = C.dist - ease * (C.dist - C.minDist);
    C.cur.dist += (targetDist - C.cur.dist) * 0.038;
    positionCamera(ease);

    uniforms.time.value += deltaTime;
    updateCamera();

    if (postProcessing) {
      postProcessing.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  });

  // Initialize WebGPU Renderer
  renderer.init().then(() => {
    postProcessing = new THREE.PostProcessing(renderer);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode();
    const bloomPass = bloom(scenePassColor);
    bloomPass.threshold.value = config.bloomThreshold;
    bloomPass.strength.value = config.bloomStrength;
    bloomPass.radius.value = config.bloomRadius;
    postProcessing.outputNode = scenePassColor.add(bloomPass);
    
    // Set initial camera position and start animation
    positionCamera(0);
    animate();
  }).catch(err => {
    console.error('WebGPU/WebGL init failed:', err);
    // Gracefully hide canvas container instead of breaking the entire page
    container.style.display = 'none';
  });
}
