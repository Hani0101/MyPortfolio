/**
 * Imperative Three.js scene for a story's 3D stage. Loaded with a dynamic
 * import, so Three.js only downloads when a story with a model comes near.
 *
 * Renders on demand: a frame is drawn only while something moves (boxes,
 * colors, camera, animation time), never in an idle loop.
 */
import {
  AnimationMixer,
  Box3,
  CanvasTexture,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Sphere,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type AnimationAction,
  type Material,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/** CSS colors by key: material names, plus "accent" and "shadow" */
export type SceneColors = Record<string, string>;

export type SceneState = {
  /** Groups shown; undefined shows the whole model */
  show?: string[];
  highlight?: string[];
};

const BOX_MS = 420; // one piece's drop
const STAGGER = 1.6; // spread of piece start times, in piece durations
const GROUP_MS = BOX_MS * (1 + STAGGER);
// Meters each piece travels into place: falling from above, or landing on a surface from the front
const ENTER_DISTANCE = { above: 1.6, front: 0.45 };
const HIGHLIGHT_MS = 450;
const SWAP_WAIT = 0.6; // when a step swaps groups, the new one waits for this share of the old one leaving
const EASE_RATE = 0.12; // camera, color and animation-time smoothing per 60fps frame

const FOV = 30;
const FILL = 0.94; // share of the canvas the model may cover (1 = touches an edge)
const DEFAULT_CAMERA = { azimuth: [55, -30] as [number, number], elevation: 28 };
const GHOST_OPACITY = 0.14;
const SHADOW_OPACITY = 0.28;

/** Where pieces come from: "above" drops them onto the floor, "front" lands them on a surface facing the camera */
export type Enter = keyof typeof ENTER_DISTANCE;

// Key light: from above lights tops (a truck, boxes); from the front lights a surface facing the camera
// at about full strength, so its colors read as their tokens instead of a dimmer grey
const SUN = {
  above: { position: [6, 12, 8], intensity: 1.6 },
  front: { position: [2, 4, 10], intensity: 2.1 },
} as const;
export type Light = keyof typeof SUN;

type Piece = { object: Object3D; base: Vector3; scale: Vector3; start: number };

/** One group that comes and goes: its pieces drop in or lift out, staggered */
type Track = {
  pieces: Piece[];
  shown: number;
  showTarget: number;
  glow: number;
  glowTarget: number;
  /** ms before this track starts moving */
  wait: number;
};

/** A material whose color follows a theme color (and the accent, when its track glows) */
type Themed = { material: MeshStandardMaterial; key: string; fallback: Color; track?: Track };

export type ModelScene = {
  setState(state: SceneState, instant: boolean): void;
  /** Seconds into the model's baked animation */
  setTime(seconds: number, instant: boolean): void;
  /** 0..1 through the story; swings the camera around the model */
  setOrbit(progress: number, instant: boolean): void;
  setColors(colors: SceneColors, instant: boolean): void;
  resize(width: number, height: number): void;
  dispose(): void;
};

type Options = {
  canvas: HTMLCanvasElement;
  src: string;
  /** Groups that come and go per step; everything else is always shown */
  animated: string[];
  ghost?: string[];
  hide?: string[];
  camera?: { azimuth: [number, number]; elevation: number };
  enter?: Enter;
  light?: Light;
};

export async function createModelScene({
  canvas,
  src,
  animated,
  ghost = [],
  hide = [],
  camera: view = DEFAULT_CAMERA,
  enter = "above",
  light = "above",
}: Options): Promise<ModelScene> {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  scene.add(new HemisphereLight(0xffffff, 0x8a8080, 2.2));
  const [sunX, sunY, sunZ] = SUN[light].position;
  const sun = new DirectionalLight(0xffffff, SUN[light].intensity);
  sun.position.set(sunX, sunY, sunZ);
  scene.add(sun);

  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(src);
  const model = gltf.scene;
  scene.add(model);

  // Removed rather than hidden, so they don't count toward the camera fit
  for (const name of hide) model.getObjectByName(name)?.removeFromParent();

  // Theme colors by key, eased toward their targets
  const palette = new Map<string, { current: Color; target: Color }>();
  const paletteColor = (key: string) => palette.get(key)?.current;

  // One material per Blender material, plus clones for animated groups and ghosts
  const themed: Themed[] = [];
  const shared = new Map<string, MeshStandardMaterial>();
  const themedMaterial = (source: Material, options: { track?: Track; ghost?: boolean } = {}) => {
    const key = source.name;
    if (!options.track && !options.ghost && shared.has(key)) return shared.get(key)!;
    const fallback = ((source as MeshStandardMaterial).color ?? new Color(0x999999)).clone();
    const material = new MeshStandardMaterial({ color: fallback, roughness: 0.75, metalness: 0 });
    if (options.ghost) Object.assign(material, { transparent: true, opacity: GHOST_OPACITY, depthWrite: false });
    themed.push({ material, key, fallback, track: options.track });
    if (!options.track && !options.ghost) shared.set(key, material);
    return material;
  };

  const tracks = new Map<string, Track>();
  for (const group of model.children) {
    const track: Track | undefined = animated.includes(group.name)
      ? { pieces: [], shown: 0, showTarget: 0, glow: 0, glowTarget: 0, wait: 0 }
      : undefined;
    const trackMaterials = new Map<string, MeshStandardMaterial>();

    group.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const source = node.material as Material;
      if (track) {
        if (!trackMaterials.has(source.name)) trackMaterials.set(source.name, themedMaterial(source, { track }));
        node.material = trackMaterials.get(source.name)!;
      } else {
        node.material = themedMaterial(source, { ghost: ghost.includes(node.name) });
      }
    });

    if (!track) continue;
    for (const object of group.children) {
      track.pieces.push({ object, base: object.position.clone(), scale: object.scale.clone(), start: 0 });
    }
    track.pieces.sort(
      enter === "front"
        ? // Reading order: top to bottom, left to right
          (a, b) => b.base.y - a.base.y || a.base.x - b.base.x
        : // Loading order: front (+X) to back, bottom to top
          (a, b) => b.base.x - a.base.x || a.base.y - b.base.y,
    );
    track.pieces.forEach((piece, i) => (piece.start = track.pieces.length > 1 ? i / (track.pieces.length - 1) : 0));
    tracks.set(group.name, track);
  }

  // Baked animation, driven by scroll: time is set, never played
  const mixer = gltf.animations.length ? new AnimationMixer(model) : null;
  const actions: AnimationAction[] = gltf.animations.map((clip) => mixer!.clipAction(clip).play());
  const duration = Math.max(0, ...gltf.animations.map((clip) => clip.duration));
  let time = 0;
  let timeTarget = 0;
  const applyTime = () => {
    if (!mixer) return;
    // Just short of the end, so a one-shot clip never wraps back to its first frame
    for (const action of actions) action.time = Math.min(time, action.getClip().duration - 1e-3);
    mixer.update(0);
  };
  applyTime();

  // Frame the whole model with every group in place (they're hidden on the first
  // update), sampled across its animation so hops and flips never leave the frame
  const bounds = new Box3();
  const samples = mixer ? 16 : 1;
  for (let i = 0; i < samples; i++) {
    time = (duration * i) / Math.max(1, samples - 1);
    applyTime();
    bounds.union(new Box3().setFromObject(model));
  }
  time = 0;
  applyTime();
  const sphere = bounds.getBoundingSphere(new Sphere());
  const shadow = createShadow(bounds);
  scene.add(shadow);

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 500);
  const elevation = deg(view.elevation);
  const [azimuthFrom, azimuthTo] = view.azimuth.map(deg);
  let distance = 1;
  let azimuth = azimuthFrom;
  let azimuthTarget = azimuthFrom;

  const placeCamera = (angle = azimuth, range = distance) => {
    const { center } = sphere;
    camera.position.set(
      center.x + Math.sin(angle) * Math.cos(elevation) * range,
      center.y + Math.sin(elevation) * range,
      center.z + Math.cos(angle) * Math.cos(elevation) * range,
    );
    camera.lookAt(center);
  };

  // Closest distance that keeps the whole model on screen at every angle the
  // orbit passes through. The bounding sphere alone is far too loose for a long model.
  const corners = [0, 1, 2, 3, 4, 5, 6, 7].map(
    (i) => new Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z),
  );
  const fitDistance = () => {
    const point = new Vector3();
    let needed = 0;
    for (const angle of [azimuthFrom, (azimuthFrom + azimuthTo) / 2, azimuthTo]) {
      let range = sphere.radius * 3;
      for (let i = 0; i < 5; i++) {
        placeCamera(angle, range);
        camera.updateMatrixWorld();
        const reach = Math.max(...corners.map((c) => point.copy(c).project(camera)).flatMap((v) => [Math.abs(v.x), Math.abs(v.y)]));
        range *= reach / FILL;
      }
      needed = Math.max(needed, range);
    }
    return needed;
  };

  const mixed = new Color();

  // Advances every animation by dt and reports whether anything still moves
  const update = (dt: number) => {
    const k = 1 - Math.pow(1 - EASE_RATE, dt / 16.7);
    let moving = false;

    for (const color of palette.values()) {
      if (!approxEqual(color.current, color.target)) {
        color.current.lerp(color.target, k);
        moving = true;
      }
    }

    for (const track of tracks.values()) {
      if (track.wait > 0) {
        track.wait = Math.max(0, track.wait - dt);
        moving = true;
        continue;
      }
      track.shown = approach(track.shown, track.showTarget, dt / GROUP_MS);
      track.glow = approach(track.glow, track.glowTarget, dt / HIGHLIGHT_MS);
      if (track.shown !== track.showTarget || track.glow !== track.glowTarget) moving = true;

      for (const piece of track.pieces) {
        const t = clamp01(track.shown * (1 + STAGGER) - piece.start * STAGGER);
        const e = easeOutCubic(t);
        piece.object.visible = t > 0;
        const offset = (1 - e) * ENTER_DISTANCE[enter];
        if (enter === "front") piece.object.position.z = piece.base.z + offset;
        else piece.object.position.y = piece.base.y + offset;
        piece.object.scale.copy(piece.scale).multiplyScalar(0.35 + 0.65 * e);
      }
    }

    const accent = paletteColor("accent");
    for (const { material, key, fallback, track } of themed) {
      mixed.copy(paletteColor(key) ?? fallback);
      if (track && accent) mixed.lerp(accent, easeInOut(track.glow));
      material.color.copy(mixed);
    }
    const shadowColor = paletteColor("shadow");
    if (shadowColor) (shadow.material as MeshBasicMaterial).color.copy(shadowColor);

    if (Math.abs(time - timeTarget) > 1e-3) {
      time += (timeTarget - time) * k;
      moving = true;
    } else time = timeTarget;
    applyTime();

    if (Math.abs(azimuth - azimuthTarget) > 1e-4) {
      azimuth += (azimuthTarget - azimuth) * k;
      moving = true;
    } else azimuth = azimuthTarget;
    placeCamera();
    return moving;
  };

  let raf = 0;
  let last = 0;
  const tick = (now: number) => {
    raf = 0;
    const dt = last ? Math.min(now - last, 64) : 16.7;
    last = now;
    const moving = update(dt);
    renderer.render(scene, camera);
    if (moving) invalidate();
    else last = 0;
  };
  const invalidate = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const renderNow = () => {
    update(0);
    renderer.render(scene, camera);
  };

  return {
    setState({ show, highlight }, instant) {
      for (const [name, track] of tracks) {
        track.showTarget = !show || show.includes(name) ? 1 : 0;
        track.glowTarget = highlight?.includes(name) ? 1 : 0;
        track.wait = 0;
        if (instant) {
          track.shown = track.showTarget;
          track.glow = track.glowTarget;
        }
      }
      // A swap (one group out, another in): let the old one clear the space first
      const leaving = [...tracks.values()].filter((t) => t.showTarget === 0 && t.shown > 0);
      if (!instant && leaving.length) {
        const wait = Math.max(...leaving.map((t) => t.shown)) * GROUP_MS * SWAP_WAIT;
        for (const track of tracks.values()) if (track.showTarget === 1 && track.shown < 1) track.wait = wait;
      }
      if (instant) renderNow();
      else invalidate();
    },

    setTime(seconds, instant) {
      timeTarget = Math.min(Math.max(seconds, 0), duration);
      if (instant) {
        time = timeTarget;
        renderNow();
      } else invalidate();
    },

    setOrbit(progress, instant) {
      azimuthTarget = azimuthFrom + (azimuthTo - azimuthFrom) * clamp01(progress);
      if (instant) {
        azimuth = azimuthTarget;
        renderNow();
      } else invalidate();
    },

    setColors(next, instant) {
      for (const [key, css] of Object.entries(next)) {
        const target = cssColor(css);
        const entry = palette.get(key);
        if (!entry) palette.set(key, { current: target.clone(), target });
        else {
          entry.target.copy(target);
          if (instant) entry.current.copy(target);
        }
      }
      if (instant) renderNow();
      else invalidate();
    },

    resize(width, height) {
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      distance = fitDistance();
      renderNow();
    },

    dispose() {
      cancelAnimationFrame(raf);
      mixer?.stopAllAction();
      const materials = new Set<Material>();
      scene.traverse((node) => {
        if (!(node instanceof Mesh)) return;
        node.geometry.dispose();
        (Array.isArray(node.material) ? node.material : [node.material]).forEach((m) => materials.add(m));
      });
      materials.forEach((m) => {
        (m as MeshBasicMaterial).map?.dispose();
        m.dispose();
      });
      renderer.dispose();
    },
  };
}

/** Soft blob under the model: grounds it without real-time shadows */
function createShadow(bounds: Box3) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  const extent = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const plane = new Mesh(
    new PlaneGeometry(extent.x * 1.1, extent.z * 1.4),
    new MeshBasicMaterial({ map, transparent: true, opacity: SHADOW_OPACITY, depthWrite: false }),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(center.x, bounds.min.y + 0.01, center.z);
  return plane;
}

let colorContext: CanvasRenderingContext2D | null = null;

/** Any CSS color (rgb(), color(srgb ...), color-mix results) to a Three color */
function cssColor(value: string) {
  colorContext ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const ctx = colorContext!;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return new Color().setRGB(r / 255, g / 255, b / 255, SRGBColorSpace);
}

function deg(value: number) {
  return (value * Math.PI) / 180;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function approach(current: number, target: number, step: number) {
  return current < target ? Math.min(target, current + step) : Math.max(target, current - step);
}

function approxEqual(a: Color, b: Color) {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b) < 1e-3;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t: number) {
  return t * t * (3 - 2 * t);
}
