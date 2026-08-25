// @nanagames/engine — public entry point.
// Games import from '@nanagames/engine' (resolved via vite alias) and receive
// every module below.

export * from './core/Engine';
export * from './core/World';
export * from './core/Entity';
export * from './core/Component';
export * from './core/System';
export * from './core/Vec3';

export * from './render/MeshSystem';
export * from './render/CameraSystem';
export * from './render/LightSystem';

export * from './input/InputManager';
export * from './input/ActionState';

export * from './audio/AudioManager';
export * from './audio/SfxLibrary';
export * from './audio/MusicGenerator';

export * from './assets/procedural/AssetLibrary';

export * from './ui/Button';
export * from './ui/Bar';
export * from './ui/Label';
export * from './ui/HUD';
export * from './ui/CardSelector';
export * from './ui/TouchControls';
export * from './ui/Style';

export * from './util/MathUtil';
export * from './util/EventBus';
export * from './util/ColorUtil';
