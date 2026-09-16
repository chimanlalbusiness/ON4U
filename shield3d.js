/* Health & Care certificate shield: the spotlight object (WebGL, three.js).
   Built from the page's own shield outline, with rounded corners, a thick
   bevelled frame and a rounded check floating in its hollow. The look is
   orange glass lit from inside: a dark core drawn on the back faces, a
   translucent orange skin on the front, and a rim-light term added in the
   shader so every edge that turns away from the camera burns hot. All
   light is warm on purpose (white light turns this orange salmon).
   --ignite on the section (script.js, 0 to 1) powers the object up as it
   arrives; --tx/--ty on the stage (script.js) tilt it with the pointer.
   If WebGL is missing nothing happens and the rendered image stays. */
import * as THREE from 'three';

const stack = document.querySelector('.hc-shield-3d');
const tiltEl = document.querySelector('[data-shield-tilt]');
const spot = document.querySelector('[data-spot]');
const stage = document.querySelector('[data-spot-stage]') || stack;
if (stack) boot();

function boot() {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  // ACES keeps this orange amber; Neutral pushed it red, AgX washed it to peach
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.className = 'hc-shield-gl';
  canvas.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();

  // environment: a dark studio with warm panels, so reflections are amber
  // glints on the bevels rather than white patches
  const envScene = new THREE.Scene();
  const panel = (w, h, rgb, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(...rgb), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    envScene.add(m);
  };
  panel(6, 4, [4.0, 2.6, 1.4], [-5, 6, 4]);
  panel(3, 6, [6, 2.2, 0.6], [7, 1, -3]);
  panel(4, 2, [3, 1.2, 0.4], [-6, -2, -3]);
  panel(8, 8, [0.35, 0.16, 0.06], [0, -8, 0]);
  panel(14, 10, [2.4, 1.3, 0.55], [0, 4, 12]);
  panel(6, 6, [1.8, 0.7, 0.2], [6, -4, 9]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 0, 6.4);

  /* ── geometry ─────────────────────────────────────────────────── */
  // SVG viewBox 0 0 160 160 -> centred world units, shield ~1.83 tall
  const P = (x, y) => new THREE.Vector2((x - 80) / 80, -(y - 83) / 80);

  // rounded corner at v between the previous point a and the next point b
  const corner = (path, a, v, b, r) => {
    const p1 = v.clone().add(a.clone().sub(v).normalize().multiplyScalar(r));
    const p2 = v.clone().add(b.clone().sub(v).normalize().multiplyScalar(r));
    path.lineTo(p1.x, p1.y);
    path.quadraticCurveTo(v.x, v.y, p2.x, p2.y);
  };
  const outline = (path, pts, r) => {
    // pts: apex, right shoulder, right side end, bezier c1, c2, bottom, bezier c1, c2, left side end, left shoulder
    const [apex, rs, re, c1, c2, bottom, c3, c4, le, ls] = pts;
    const start = ls.clone().lerp(le, 0.5);
    path.moveTo(start.x, start.y);
    corner(path, le, ls, apex, r);
    corner(path, ls, apex, rs, r);
    corner(path, apex, rs, re, r);
    path.lineTo(re.x, re.y);
    path.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, bottom.x, bottom.y);
    path.bezierCurveTo(c3.x, c3.y, c4.x, c4.y, le.x, le.y);
    path.lineTo(start.x, start.y);
  };
  const outer = new THREE.Shape();
  outline(outer, [P(80, 10), P(142, 32), P(142, 82), P(142, 120), P(116, 146), P(80, 156), P(44, 146), P(18, 120), P(18, 82), P(18, 32)], 0.09);
  const hole = new THREE.Path();
  outline(hole, [P(80, 30.4), P(124.6, 46.3), P(124.6, 82.3), P(124.6, 109.6), P(105.9, 128.4), P(80, 135.6), P(54.1, 128.4), P(35.4, 109.6), P(35.4, 82.3), P(35.4, 46.3)], 0.06);
  outer.holes.push(hole);

  // the check as a stroke with round caps and a round outer join
  const strokeShape = (A, B, C, r) => {
    const d1 = B.clone().sub(A).normalize(), d2 = C.clone().sub(B).normalize();
    const cross = d1.x * d2.y - d1.y * d2.x;
    const cw = cross < 0;
    const s = cross > 0 ? -1 : 1;
    const o1 = new THREE.Vector2(-d1.y * s, d1.x * s), o2 = new THREE.Vector2(-d2.y * s, d2.x * s);
    const i1 = o1.clone().negate(), i2 = o2.clone().negate();
    const p = A.clone().add(i1.clone().multiplyScalar(r)), q = B.clone().add(i2.clone().multiplyScalar(r));
    const det = d1.x * -d2.y - d1.y * -d2.x;
    const t = ((q.x - p.x) * -d2.y - (q.y - p.y) * -d2.x) / det;
    const inner = p.clone().add(d1.clone().multiplyScalar(t));
    const ang = (v) => Math.atan2(v.y, v.x);
    const sh = new THREE.Shape();
    const ao = A.clone().add(o1.clone().multiplyScalar(r));
    sh.moveTo(ao.x, ao.y);
    sh.absarc(B.x, B.y, r, ang(o1), ang(o2), cw);
    sh.absarc(C.x, C.y, r, ang(o2), ang(i2), cw);
    sh.lineTo(inner.x, inner.y);
    sh.absarc(A.x, A.y, r, ang(i1), ang(o1), cw);
    return sh;
  };
  const check = strokeShape(P(57, 81), P(71, 95), P(109, 57), 0.074);

  const rimGeo = new THREE.ExtrudeGeometry(outer, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 10, curveSegments: 40 });
  rimGeo.translate(0, 0, -0.12);
  rimGeo.computeVertexNormals();
  const checkGeo = new THREE.ExtrudeGeometry(check, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.032, bevelSegments: 10, curveSegments: 28 });
  checkGeo.translate(0, 0, -0.03);

  /* ── materials ────────────────────────────────────────────────── */
  // rim light: added to the emissive term, strongest where the surface
  // turns away from the camera, so edges and bevels glow
  const fresnel = (mat, color, strength, power) => {
    const u = { uFresColor: { value: new THREE.Color(color) }, uFresStrength: { value: strength }, uFresPower: { value: power } };
    mat.userData.fres = u;
    mat.userData.base = { strength, emissive: mat.emissiveIntensity };
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, u);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform vec3 uFresColor;\nuniform float uFresStrength;\nuniform float uFresPower;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n\tfloat hcFres = pow( 1.0 - abs( dot( normalize( normal ), normalize( vViewPosition ) ) ), uFresPower );\n\ttotalEmissiveRadiance += uFresColor * hcFres * uFresStrength;');
    };
    return mat;
  };
  const orange = new THREE.Color(0xf97316);
  const core = fresnel(new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x7c2d12), roughness: 0.3, metalness: 0,
    clearcoat: 0.6, clearcoatRoughness: 0.1, side: THREE.BackSide,
    emissive: new THREE.Color(0xc2410c), emissiveIntensity: 0.6, envMapIntensity: 0.5,
  }), 0xff8a2a, 1.8, 2.0);
  const skin = fresnel(new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xc2410c), roughness: 0.05, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0,
    sheen: 0.25, sheenColor: new THREE.Color(1, 0.7, 0.35), sheenRoughness: 0.3,
    transparent: true, opacity: 0.45,
    emissive: orange, emissiveIntensity: 0.12, envMapIntensity: 0.55,
  }), 0xffb060, 2.6, 3.2);
  const enamel = fresnel(new THREE.MeshPhysicalMaterial({
    color: orange, roughness: 0.3, metalness: 0,
    clearcoat: 0.7, clearcoatRoughness: 0.04,
    emissive: orange, emissiveIntensity: 0.55, envMapIntensity: 0.35,
  }), 0xffb56b, 1.5, 2.6);
  const mats = [core, skin, enamel];

  const group = new THREE.Group();
  const rimCore = new THREE.Mesh(rimGeo, core);
  const rimSkin = new THREE.Mesh(rimGeo, skin);
  rimCore.renderOrder = 1;
  rimSkin.renderOrder = 2;
  const checkMesh = new THREE.Mesh(checkGeo, enamel);
  checkMesh.renderOrder = 3;
  group.add(rimCore, rimSkin, checkMesh);
  scene.add(group);

  const key = new THREE.DirectionalLight(0xffc898, 0.45);
  key.position.set(-2.5, 3, 4);
  const spec = new THREE.PointLight(0xffb060, 45, 0, 2);
  spec.position.set(-2.2, 2.8, 2.6);
  const rim = new THREE.PointLight(0xff8a3d, 55, 0, 2);
  rim.position.set(2.6, 1.2, -2.2);
  const rimL = new THREE.PointLight(0xff9a4d, 32, 0, 2);
  rimL.position.set(-2.6, -0.8, -2);
  const under = new THREE.PointLight(0xff6a1a, 14, 0, 2);
  under.position.set(0, -2.4, 1.2);
  scene.add(key, spec, rim, rimL, under);

  if (/[?&]tune\b/.test(location.search)) window.__hcShield = { THREE, scene, group, core, skin, enamel, key, spec, rim, rimL, under, camera, renderer };

  /* ── motion ───────────────────────────────────────────────────── */
  const BASE_X = THREE.MathUtils.degToRad(-8);
  const BASE_Y = THREE.MathUtils.degToRad(-16);
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const root = document.documentElement;

  function fit() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return false;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    return true;
  }

  function draw(t) {
    const ignite = spot ? num(spot.style.getPropertyValue('--ignite'), 1) : 1;
    const power = 0.35 + 0.65 * ignite;
    mats.forEach((m) => {
      m.userData.fres.uFresStrength.value = m.userData.base.strength * power;
      m.emissiveIntensity = m.userData.base.emissive * power;
    });
    skin.opacity = root.classList.contains('light-mode') ? 0.75 : 0.45;
    let tx = 0, ty = 0;
    if (tiltEl) {
      tx = num(tiltEl.style.getPropertyValue('--tx'), 0);
      ty = num(tiltEl.style.getPropertyValue('--ty'), 0);
    }
    const sway = REDUCED ? 0 : Math.sin(t / 3600) * 0.16;
    const nod = REDUCED ? 0 : Math.sin(t / 4300) * 0.04;
    group.rotation.x = BASE_X - THREE.MathUtils.degToRad(tx) + nod;
    group.rotation.y = BASE_Y + THREE.MathUtils.degToRad(ty) + sway;
    group.position.y = REDUCED ? 0 : Math.sin(t / 2100) * 0.035;
    const sc = REDUCED ? 1 : 0.88 + 0.12 * ignite;
    group.scale.setScalar(sc);
    renderer.render(scene, camera);
  }

  stack.appendChild(canvas);
  stack.classList.add('hc-has-gl');
  if (!fit()) { stack.classList.remove('hc-has-gl'); canvas.remove(); return; }
  draw(0);

  new ResizeObserver(() => { if (fit()) draw(performance.now()); }).observe(stack);

  if (REDUCED) {
    // no idle motion: redraw only when the ignition value or the theme changes
    let queued = false;
    const again = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; draw(0); }); } };
    addEventListener('scroll', again, { passive: true });
    new MutationObserver(again).observe(root, { attributes: true, attributeFilter: ['class'] });
    return;
  }
  let running = false, raf = 0;
  const tick = (t) => { draw(t); raf = running ? requestAnimationFrame(tick) : 0; };
  new IntersectionObserver((entries) => {
    running = entries[0].isIntersecting;
    if (running && !raf) raf = requestAnimationFrame(tick);
  }, { rootMargin: '120px' }).observe(stage);
}
