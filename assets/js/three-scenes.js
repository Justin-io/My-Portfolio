import * as THREE from 'three/webgpu';
import {
  pass, uniform, Fn, Loop, Break, If, screenUV,
  vec2, vec3, vec4, float,
  length, normalize, cross, dot, sin, cos, atan, asin, sqrt, pow,
  fract, clamp, smoothstep, mix, floor, step, sign, min, max
} from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

// ============================================================================
// PERFORMANCE TIER DETECT (Aggressive Mobile/Low-RAM Optimization)
// ============================================================================

const isMobile = /Mobi|Android|iP(hone|od|ad)/i.test(navigator.userAgent) || window.innerWidth < 768;

const stepCount = isMobile ? 18 : 32;

// ============================================================================
// CONFIGURATION
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
  starDensity: 0.1,
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
  bloomStrength: 0.68,
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
  pos.mulAssign(lacunarity); amplitude.mulAssign(persistence);
  value.addAssign(noise3D(pos).mul(amplitude));
  pos.mulAssign(lacunarity); amplitude.mulAssign(persistence);
  value.addAssign(noise3D(pos).mul(amplitude));
  return value;
});

const blackbodyColor = Fn(([tempK]) => {
  const t = clamp(tempK.sub(1000.0).div(9000.0), float(0.0), float(1.0));
  const red = clamp(float(1.0).sub(t.sub(0.8).mul(2.0)), float(0.5), float(1.0));
  const green = smoothstep(float(0.0), float(0.5), t).mul(float(1.0).sub(t.sub(0.7).mul(0.3).max(0.0)));
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
  starsEnabled: uniform((config.starsEnabled && !isMobile) ? 1.0 : 0.0),
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
  cameraTarget: uniform(new THREE.Vector3(0, 0, 0)),
  tesseractStrength: uniform(0.0),
  sparkStrength: uniform(0.0),     // NEW: Controls fire sparks
  fallSpeed: uniform(0.0)          // NEW: Controls falling illusion speed
};

// ============================================================================
// FIRE SPARKS (Only appears inside black hole)
// ============================================================================

const fireSparks = Fn(([rayDir, camPos]) => {
  const theta = atan(rayDir.z, rayDir.x);
  const phi = asin(clamp(rayDir.y, float(-1.0), float(1.0)));

  const density = float(15.0);
  const grid = vec2(theta, phi).mul(density);
  const id = floor(grid);

  // Erratic jitter for ember-like movement
  const jitter = vec2(
    sin(uniforms.time.mul(8.0).add(hash21(id).mul(10.0))).mul(0.15),
    cos(uniforms.time.mul(11.0).add(hash21(id.add(1.0)).mul(10.0))).mul(0.15)
  );
  const uv = fract(grid).sub(0.5).add(jitter);

  const hash = hash21(id);

  // Fast, erratic spark speed
  const speed = hash.mul(8.0).add(12.0);
  const progress = fract(uniforms.time.mul(speed).add(hash));
  const dist = progress;

  // Tiny but sharp glowing core
  const streamSize = float(0.015).div(dist.add(0.08));
  const pGlow = smoothstep(streamSize, float(0.0), length(uv));

  // Rapid flicker effect
  const flicker = sin(uniforms.time.mul(30.0).add(hash.mul(20.0))).mul(0.5).add(0.5);

  // Fire colors: deep red/orange to bright yellow/white
  const coreColor = vec3(1.0, 0.15, 0.0);
  const tipColor = vec3(1.0, 0.9, 0.3);
  const color = mix(coreColor, tipColor, progress);

  const intensity = pGlow.mul(flicker).mul(20.0).div(dist.add(0.15));

  return color.mul(intensity).mul(uniforms.sparkStrength);
});

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

  const peakTempK = uniforms.diskTemperature.mul(1000.0);
  const outerTempK = float(1500.0);
  const tempFalloff = pow(innerR.div(hitR), uniforms.temperatureFalloff);
  const tempK = mix(outerTempK, peakTempK, tempFalloff);
  const diskColor = blackbodyColor(tempK).toVar('diskColor');

  const rotationSign = sign(uniforms.diskRotationSpeed);
  const velocityDir = vec3(sin(hitAngle).negate().mul(rotationSign), float(0.0), cos(hitAngle).mul(rotationSign));
  const velocityMagnitude = float(1.0).div(sqrt(hitR.div(innerR)));
  const beta = velocityMagnitude.mul(0.3);
  const cosTheta = dot(velocityDir, rayDir);
  const dopplerFactor = float(1.0).div(float(1.0).sub(beta.mul(cosTheta)));
  const dopplerBoost = pow(dopplerFactor, float(3.0).mul(uniforms.dopplerStrength));
  diskColor.mulAssign(clamp(dopplerBoost, float(0.1), float(5.0)));

  const edgeFalloff = smoothstep(float(0.0), uniforms.diskEdgeSoftnessInner, normR)
    .mul(smoothstep(float(1.0), float(1.0).sub(uniforms.diskEdgeSoftnessOuter), normR));

  const ringOpacity = float(1.0).toVar('ringOpacity');
  const keplerianPhase = time.mul(uniforms.diskRotationSpeed).div(pow(hitR, float(1.5)));
  const rotatedAngle = hitAngle.add(keplerianPhase);
  const noiseCoord = vec3(
    hitR.mul(uniforms.turbulenceScale),
    cos(rotatedAngle).div(uniforms.turbulenceStretch.max(0.1)),
    sin(rotatedAngle).div(uniforms.turbulenceStretch.max(0.1))
  );
  const turbulence = fbm(noiseCoord, uniforms.turbulenceLacunarity, uniforms.turbulencePersistence);
  ringOpacity.assign(pow(clamp(turbulence, float(0.0), float(1.0)), uniforms.turbulenceSharpness));

  const finalOpacity = ringOpacity.mul(edgeFalloff);
  const finalColor = diskColor.mul(uniforms.diskBrightness);
  return vec4(finalColor, finalOpacity);
});

// ============================================================================
// TESSERACT SHADER (Infinite Falling -> STUCK)
// ============================================================================

const tesseractShader = Fn(([rayPos, rayDir]) => {
  const col = vec3(0.0).toVar('col');
  const dist = float(0.0).toVar('dist');
  const hit = float(0.0).toVar('hit');
  const pos = vec3(0.0).toVar('pos');

  // Fall speed is driven by uniform, allowing us to smoothly stop it
  const fallOffset = vec3(0.0, 0.0, uniforms.time.mul(uniforms.fallSpeed));

  const warpAmount = mix(0.8, 0.0, uniforms.tesseractStrength);
  const centerDir = rayPos.normalize();
  const warpedDir = normalize(rayDir.add(centerDir.mul(warpAmount)));

  const maxSteps = 30;

  Loop(maxSteps, () => {
    If(dist.greaterThan(60.0).or(hit.greaterThan(0.5)), () => {
      Break();
    });

    pos.assign(rayPos.add(fallOffset).add(warpedDir.mul(dist)));

    const cellPos = fract(pos.div(3.0)).sub(0.5).mul(3.0);
    const w = float(0.12);

    const dx = length(cellPos.yz).sub(w);
    const dy = length(cellPos.xz).sub(w);
    const dz = length(cellPos.xy).sub(w);

    const sdf = min(dx, min(dy, dz));

    If(sdf.lessThan(0.015), () => {
      hit.assign(1.0);

      const isX = step(dx, min(dy, dz));
      const isY = step(dy, min(dx, dz));
      const isZ = step(dz, min(dx, dy));

      const u = mix(pos.y, pos.x, isX);
      const v = mix(pos.z, pos.y, isZ);

      const slats = sin(u.mul(50.0)).mul(0.25).add(sin(v.mul(50.0)).mul(0.25)).add(0.5);
      const woodColor = mix(vec3(0.04, 0.02, 0.01), vec3(0.3, 0.2, 0.1), slats);

      const timeScale = uniforms.time.mul(mix(1.5, 5.0, uniforms.tesseractStrength));
      const lightStreaks = sin(pos.x.mul(0.3).sub(timeScale)).mul(0.35)
        .add(sin(pos.y.mul(0.3).add(timeScale)).mul(0.35))
        .add(sin(pos.z.mul(0.3).sub(timeScale)).mul(0.35));

      const streakGlow = smoothstep(0.4, 0.8, lightStreaks);
      const lightColor = vec3(1.0, 0.8, 0.5).mul(streakGlow).mul(mix(2.0, 8.0, uniforms.tesseractStrength));

      const norm = normalize(mix(
        vec3(0.0, cellPos.y, cellPos.z),
        mix(vec3(cellPos.x, 0.0, cellPos.z), vec3(cellPos.x, cellPos.y, 0.0), isZ),
        isY
      ));

      const diff = clamp(dot(norm, warpedDir.negate()), float(0.1), float(1.0));
      const distFade = dist.mul(0.025).min(1.0);
      const glowHaze = vec3(0.1, 0.05, 0.02);
      const surfaceColor = mix(woodColor.mul(diff).add(lightColor), glowHaze, distFade);

      const ao = float(1.0).div(float(1.0).add(dist.mul(0.06)));
      col.assign(surfaceColor.mul(ao));
      Break();
    });

    dist.addAssign(sdf.max(0.03));
  });

  const voidColor = vec3(0.01, 0.005, 0.005).mul(float(1.0).sub(dist.div(60.0).min(1.0)));
  col.assign(mix(col, voidColor, step(hit, 0.5)));

  return vec4(col, 1.0);
});

// ============================================================================
// BLACK HOLE RAYMARCHING CORE
// ============================================================================

const runBlackHoleRaymarch = Fn(([camPos, rayDirIn, rayDirTesseract]) => {
  const rs = uniforms.blackHoleMass.mul(2.0);
  const rayDir = rayDirIn.toVar('rayDir');
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
      const tsColor = tesseractShader(rayPos, rayDirTesseract);
      const visibility = uniforms.tesseractStrength;
      color.assign(mix(vec3(0.0), tsColor.xyz, visibility));
      alpha.assign(1.0);
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

    const curStep = mix(uniforms.stepSize, uniforms.stepSize.mul(1.5), smoothstep(float(15.0), float(35.0), r));
    prevPos.assign(rayPos);
    rayPos.addAssign(rayDir.mul(curStep));

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
      bgColor.addAssign(nebulaField(rayDir));
    });
    color.addAssign(bgColor.mul(float(1.0).sub(alpha)));
  });

  const finalColor = pow(color, vec3(1.0 / 2.2));

  // ONLY add fire sparks if sparkStrength > 0
  const sparks = vec3(0.0).toVar('sparks');
  If(uniforms.sparkStrength.greaterThan(0.001), () => {
    sparks.assign(fireSparks(rayDirIn, camPos));
  });
  return vec4(finalColor.add(sparks), 1.0);
});

// ============================================================================
// MAIN RAYMARCHING SHADER
// ============================================================================

const blackHoleShader = Fn(() => {
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
  const rayDir = normalize(camForward.mul(fov).add(camRight.mul(screenPos.x)).add(camUp.mul(screenPos.y)));
  const fovTesseract = float(0.35);
  const rayDirTesseract = normalize(camForward.mul(fovTesseract).add(camRight.mul(screenPos.x)).add(camUp.mul(screenPos.y)));

  const finalColor = vec4(0.0).toVar('finalColor');

  If(uniforms.tesseractStrength.lessThan(0.01), () => {
    finalColor.assign(runBlackHoleRaymarch(camPos, rayDir, rayDirTesseract));
  }).ElseIf(uniforms.tesseractStrength.greaterThan(0.99), () => {
    finalColor.assign(tesseractShader(camPos, rayDirTesseract));
  }).Else(() => {
    const bh = runBlackHoleRaymarch(camPos, rayDir, rayDirTesseract);
    const ts = tesseractShader(camPos, rayDirTesseract);
    finalColor.assign(mix(bh, ts, uniforms.tesseractStrength));
  });

  return finalColor;
})();

// ============================================================================
// SCENE SETUP
// ============================================================================

const container = document.getElementById('canvas-container');
if (container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

  const C = {
    dist: 22.0,
    minDist: 0.1,
    tiltBase: -0.10,
    tiltTarget: -0.05,
    thetaBase: 1.8,
    thetaPlunge: 5.5,
    cur: { dist: 22.0 },
    mouse: { x: 0, y: 0 }
  };

  const OX = 2.5;

  function positionCamera(ease) {
    const aspect = window.innerWidth / window.innerHeight;
    const isMobile = window.innerWidth < 768;
    const desktopAspect = 1.15;
    const distanceScale = Math.max(1.0, desktopAspect / aspect);

    uniforms.stepSize.value = config.stepSize;

    // SEQUENCE TIMELINE:
    // 0.00 - 0.85 : Approaching
    // 0.85 - 0.90 : Crossing horizon (Pure black transition)
    // 0.90 - 0.96 : Fire sparks erupt inside the black hole
    // 0.96 - 0.98 : Pure black silence
    // 0.98 - 1.00 : Tesseract appears and falling begins

    let sparkStrength = 0.0;
    if (ease > 0.88 && ease < 0.96) {
      const t = (ease - 0.88) / 0.08;
      sparkStrength = Math.sin(t * Math.PI); // Smooth peak
    }
    uniforms.sparkStrength.value = sparkStrength;

    let tStrength = 0.0;
    if (ease > 0.97) {
      tStrength = Math.min(1.0, (ease - 0.97) / 0.03);
    }
    uniforms.tesseractStrength.value = tStrength * tStrength * (3 - 2 * tStrength);

    const d = C.cur.dist * distanceScale;
    const theta = C.thetaBase + ease * C.thetaPlunge;
    const currentTiltBase = isMobile ? -0.22 : C.tiltBase;
    const currentTiltTarget = isMobile ? -0.15 : C.tiltTarget;
    const tilt = THREE.MathUtils.lerp(currentTiltBase, currentTiltTarget, ease);

    camera.position.set(
      d * Math.cos(tilt) * Math.sin(theta) + C.mouse.x * 0.4,
      d * Math.sin(tilt) + C.mouse.y * 0.3,
      d * Math.cos(tilt) * Math.cos(theta)
    );

    const forward = new THREE.Vector3().copy(camera.position).negate().normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();
    const currentOX = OX * distanceScale;
    const target = new THREE.Vector3(0, 0, 0).addScaledVector(right, -currentOX);

    camera.lookAt(target);
    const roll = -0.28 - ease * 0.35;
    camera.rotateZ(roll);
  }

  const isMobileDevice = /Mobi|Android|iP(hone|od|ad)/i.test(navigator.userAgent) || window.innerWidth < 768;
  const renderer = new THREE.WebGPURenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const pixelRatio = Math.min(window.devicePixelRatio, isMobileDevice ? 1.0 : 2.0);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  const geometry = new THREE.SphereGeometry(100, 32, 32);
  geometry.scale(-1, 1, 1);
  const material = new THREE.MeshBasicNodeMaterial();
  material.colorNode = blackHoleShader;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

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
      scrollRaw = Math.min(1, window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight));
      rafPend = false;
    });
  }, { passive: true });

  let isVisible = true;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.01 });
    observer.observe(container);
  }

  let postProcessing = null;
  let lastFrameTime = performance.now();
  let fallStartTime = 0; // Tracks when the 3-second stop timer begins

  function updateCamera() {
    uniforms.cameraPosition.value.copy(camera.position);
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    const target = camera.position.clone().add(direction.multiplyScalar(10));
    uniforms.cameraTarget.value.copy(target);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.033);
    lastFrameTime = currentTime;

    scrollEase += (scrollRaw - scrollEase) * 0.022;
    const ease = scrollEase * scrollEase * (3 - 2 * scrollEase);

    const targetDist = C.dist - ease * (C.dist - C.minDist);
    C.cur.dist += (targetDist - C.cur.dist) * 0.038;
    positionCamera(ease);

    // Manage Falling Illusion & 3-Second Stop
    let currentFallSpeed = 0.0;
    if (ease > 0.97) {
      if (fallStartTime === 0) fallStartTime = currentTime;
      const elapsed = (currentTime - fallStartTime) / 1000;

      if (elapsed < 3.0) {
        // Accelerate falling violently
        currentFallSpeed = 15.0 + elapsed * 20.0;
      } else {
        // Smoothly grind to a halt over 0.8 seconds to feel "stuck"
        const stopProgress = Math.min(1.0, (elapsed - 3.0) / 0.8);
        const maxSpeed = 15.0 + 3.0 * 20.0;
        currentFallSpeed = maxSpeed * (1.0 - stopProgress);
        if (currentFallSpeed < 0.1) currentFallSpeed = 0.0;
      }
    } else {
      fallStartTime = 0;
    }
    uniforms.fallSpeed.value = currentFallSpeed;

    // Camera shake: violent during fall, abrupt micro-jitters when stopping
    let shakeStrength = 0.0;
    if (ease > 0.97 && fallStartTime > 0) {
      const elapsed = (currentTime - fallStartTime) / 1000;
      if (elapsed < 3.0) {
        shakeStrength = 0.8 + (elapsed / 3.0) * 0.7; // Ramping shake
      } else {
        // Sudden stop jolt, then settling to near-zero
        const stopProgress = Math.min(1.0, (elapsed - 3.0) / 0.8);
        shakeStrength = 1.5 * (1.0 - stopProgress);
      }
    }

    if (shakeStrength > 0.0) {
      camera.position.x += (Math.random() - 0.5) * shakeStrength * 0.6;
      camera.position.y += (Math.random() - 0.5) * shakeStrength * 0.6;
      camera.position.z += (Math.random() - 0.5) * shakeStrength * 0.6;
      camera.rotation.x += (Math.random() - 0.5) * shakeStrength * 0.02;
      camera.rotation.y += (Math.random() - 0.5) * shakeStrength * 0.02;
      camera.rotation.z += (Math.random() - 0.5) * shakeStrength * 0.04;
    }

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
    const isMobileNow = /Mobi|Android|iP(hone|od|ad)/i.test(navigator.userAgent) || window.innerWidth < 768;
    const pr = Math.min(window.devicePixelRatio, isMobileNow ? 1.0 : 2.0);
    renderer.setPixelRatio(pr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (postProcessing && postProcessing.setSize) {
      postProcessing.setSize(window.innerWidth, window.innerHeight);
    }
    uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  });

  renderer.init().then(() => {
    if (!isMobileDevice) {
      postProcessing = new THREE.PostProcessing(renderer);
      const scenePass = pass(scene, camera);
      const scenePassColor = scenePass.getTextureNode();
      const bloomPass = bloom(scenePassColor);
      bloomPass.threshold.value = config.bloomThreshold;
      bloomPass.strength.value = config.bloomStrength;
      bloomPass.radius.value = config.bloomRadius;
      postProcessing.outputNode = scenePassColor.add(bloomPass);
    }

    positionCamera(0);
    animate();
  }).catch(err => {
    console.error('WebGPU/WebGL init failed:', err);
    container.style.display = 'none';
  });
}