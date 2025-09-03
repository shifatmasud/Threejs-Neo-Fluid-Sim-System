

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import GUI from 'lil-gui';

// --- TYPES ---
interface Uniforms {
    uArtisticBlend: number;
    uDisplacementScale: number;
    uVelocityShiftScale: number;
    uDensityShiftScale: number;
    uWaterColor: string;
    uInkColor: string;
    uVolumeFactor: number;
    uInkStrength: number;
    uShininess: number;
    uFresnelColor: string;
    uFresnelIntensity: number;
    uGlowColor: string;
    uGlowPower: number;
    uInkGeneration: number;
    uWaveSize: number;
    uWaveSteepness: number;
    uWaveComplexity: number;
    uWaveDetail: number;
    uFeedRate: number;
    uKillRate: number;
    uVorticity: number;
    uReactionForce: number;
    uBuoyancy: number;
    uAmbientTemperature: number;
    uSplatTemperature: number;
    uBorderThickness: number;
    uBorderColor: string;
    uSurfaceTension: number;
    uChiselStrength: number;
    uSSR_Strength: number;
    uSSR_Falloff: number;
    uSSR_Samples: number;
    uParticleRate: number;
    uParticleSize: number;
    uParticleAdvection: number;
    uParticleColor: string;
    uCausticsIntensity: number;
    uLightDepth: number;
    uSurfaceDetailStrength: number;
    uFlowSpeed: number;
    uRippleStrength: number;
    uRippleDamping: number;
    uRippleSpeed: number;
    uLight1Pos: THREE.Vector3;
    uLight1Color: string;
    uLight2Pos: THREE.Vector3;
    uLight2Color: string;
}

interface SimParams {
    waveDecay: number;
    densityDissipation: number;
    temperatureDissipation: number;
}

type AllParams = Uniforms & SimParams;

interface Version {
    name: string;
    uniforms: Uniforms;
    simParams: SimParams;
}

interface QualitySettings {
    simResolution: number;
    particleResolution: number;
    enableSsr: boolean;
}

// --- PRESETS ---

const rainbowFlare: Version = {
    name: 'Rainbow Flare',
    uniforms: {
        uArtisticBlend: 0,
        uDisplacementScale: 0.074,
        uVelocityShiftScale: 0.004,
        uDensityShiftScale: 0,
        uWaterColor: "#4d4d4d",
        uInkColor: "#1b3b64",
        uVolumeFactor: 0.52,
        uInkStrength: 1.85,
        uShininess: 909,
        uFresnelColor: "#000000",
        uFresnelIntensity: 3.2,
        uGlowColor: "#f2f2f2",
        uGlowPower: 9.8,
        uInkGeneration: 0.05,
        uWaveSize: 0.094,
        uWaveSteepness: 0.1,
        uWaveComplexity: 0.071,
        uWaveDetail: 0,
        uFeedRate: 0.017,
        uKillRate: 0,
        uVorticity: 0,
        uReactionForce: 1.46,
        uBuoyancy: 0.24,
        uAmbientTemperature: 0.99,
        uSplatTemperature: -1,
        uBorderThickness: 0,
        uBorderColor: "#fffafa",
        uSurfaceTension: 0.1,
        uChiselStrength: 1.28,
        uSSR_Strength: 0.43,
        uSSR_Falloff: 0.8,
        uSSR_Samples: 4,
        uParticleRate: 0,
        uParticleSize: 1,
        uParticleAdvection: 0,
        uParticleColor: "#ffffff",
        uCausticsIntensity: 0,
        uLightDepth: 0.5,
        uSurfaceDetailStrength: 0,
        uFlowSpeed: 0,
        uRippleStrength: 0,
        uRippleDamping: 0.9,
        uRippleSpeed: 0,
        uLight1Pos: new THREE.Vector3(-0.76, 0.5, 0.5),
        uLight1Color: "#eef2ff",
        uLight2Pos: new THREE.Vector3(2, 0.5, 0.65),
        uLight2Color: "#b1b1c3",
    },
    simParams: {
        waveDecay: 0.977,
        densityDissipation: 0.899,
        temperatureDissipation: 0.858,
    }
};

const luminousGel: Version = {
    name: 'Luminous Gel',
    uniforms: {
        uArtisticBlend: 1,
        uDisplacementScale: 0.04,
        uVelocityShiftScale: 0.0078,
        uDensityShiftScale: 0.005,
        uWaterColor: "#4d4d4d",
        uInkColor: "#1b3b64",
        uVolumeFactor: 0.79,
        uInkStrength: 1.4,
        uShininess: 271,
        uFresnelColor: "#000000",
        uFresnelIntensity: 2.2,
        uGlowColor: "#f2f2f2",
        uGlowPower: 8.3,
        uInkGeneration: 0.05,
        uWaveSize: 0.117,
        uWaveSteepness: 0.063,
        uWaveComplexity: 0,
        uWaveDetail: 0,
        uFeedRate: 0.026,
        uKillRate: 0.021,
        uVorticity: 0,
        uReactionForce: 1.02,
        uBuoyancy: 0,
        uAmbientTemperature: 0.03,
        uSplatTemperature: 0.23,
        uBorderThickness: 0,
        uBorderColor: "#fffafa",
        uSurfaceTension: 1,
        uChiselStrength: 3.5,
        uSSR_Strength: 0.51,
        uSSR_Falloff: 0.2,
        uSSR_Samples: 0,
        uParticleRate: 0,
        uParticleSize: 2,
        uParticleAdvection: 0.2,
        uParticleColor: "#ffffff",
        uCausticsIntensity: 0,
        uLightDepth: 0.5,
        uSurfaceDetailStrength: 0,
        uFlowSpeed: 1,
        uRippleStrength: 0.01,
        uRippleDamping: 0.94,
        uRippleSpeed: 0.82,
        uLight1Pos: new THREE.Vector3(0.7, 0.7, 0.4),
        uLight1Color: "#eef2ff",
        uLight2Pos: new THREE.Vector3(0.3, 0.3, 0.6),
        uLight2Color: "#b1b1c3"
    },
    simParams: {
        waveDecay: 0.945,
        densityDissipation: 0.888,
        temperatureDissipation: 0.948
    }
};

const liquidBubble: Version = {
    name: 'Liquid Bubble',
    uniforms: {
        uArtisticBlend: 0,
        uDisplacementScale: 0.066,
        uVelocityShiftScale: 0.001,
        uDensityShiftScale: 0.001,
        uWaterColor: "#4d4d4d",
        uInkColor: "#1b3b64",
        uVolumeFactor: 0.72,
        uInkStrength: 1.2,
        uShininess: 500,
        uFresnelColor: "#000000",
        uFresnelIntensity: 3.2,
        uGlowColor: "#f2f2f2",
        uGlowPower: 5.5,
        uInkGeneration: 0.05,
        uWaveSize: 0.156,
        uWaveSteepness: 0.182,
        uWaveComplexity: 0.015,
        uWaveDetail: 0.036,
        uFeedRate: 0.017,
        uKillRate: 0.043,
        uVorticity: 0,
        uReactionForce: 0.64,
        uBuoyancy: 0.07,
        uAmbientTemperature: 0.14,
        uSplatTemperature: 0,
        uBorderThickness: 0,
        uBorderColor: "#fffafa",
        uSurfaceTension: 0.36,
        uChiselStrength: 3.56,
        uSSR_Strength: 0.8,
        uSSR_Falloff: 0.8,
        uSSR_Samples: 1,
        uParticleRate: 0.44,
        uParticleSize: 1.5,
        uParticleAdvection: 0.6,
        uParticleColor: "#ffffff",
        uCausticsIntensity: 0.5,
        uLightDepth: 0.5,
        uSurfaceDetailStrength: 0.04,
        uFlowSpeed: 0,
        uRippleStrength: 0,
        uRippleDamping: 0.912,
        uRippleSpeed: 0,
        uLight1Pos: new THREE.Vector3(0.8, 1, 0.6),
        uLight1Color: "#eef2ff",
        uLight2Pos: new THREE.Vector3(-0.5, -0.2, 0.4),
        uLight2Color: "#b1b1c3",
    },
    simParams: {
        waveDecay: 0.997,
        densityDissipation: 0.97,
        temperatureDissipation: 0.98
    }
};

const neoWater: Version = {
    name: 'Neo Water',
    uniforms: {
        uArtisticBlend: 0,
        uDisplacementScale: 0.139,
        uVelocityShiftScale: 0.0035,
        uDensityShiftScale: 0.002,
        uWaterColor: "#564f7d",
        uInkColor: "#446ea2",
        uVolumeFactor: 0.71,
        uInkStrength: 1,
        uShininess: 701,
        uFresnelColor: "#ad64dd",
        uFresnelIntensity: 3.7,
        uGlowColor: "#e7b5ee",
        uGlowPower: 8.1,
        uInkGeneration: 0.05,
        uWaveSize: 0.117,
        uWaveSteepness: 0.129,
        uWaveComplexity: 0.054,
        uWaveDetail: 0,
        uFeedRate: 0.035,
        uKillRate: 0.047,
        uVorticity: 1.5,
        uReactionForce: 0.22,
        uBuoyancy: 0.63,
        uAmbientTemperature: 0.62,
        uSplatTemperature: 0.63,
        uBorderThickness: 0,
        uBorderColor: "#000000",
        uSurfaceTension: 0.11,
        uChiselStrength: 1.77,
        uSSR_Strength: 0,
        uSSR_Falloff: 0.9,
        uSSR_Samples: 7,
        uParticleRate: 0.78,
        uParticleSize: 4.7,
        uParticleAdvection: 0.2,
        uParticleColor: "#ffffff",
        uCausticsIntensity: 1.5,
        uLightDepth: 0.5,
        uSurfaceDetailStrength: 0,
        uFlowSpeed: 5,
        uRippleStrength: 0,
        uRippleDamping: 0.985,
        uRippleSpeed: 0.6,
        uLight1Pos: new THREE.Vector3(0.9, 0.9, 0.5),
        uLight1Color: "#eef2ff",
        uLight2Pos: new THREE.Vector3(0.1, 0.1, 0.5),
        uLight2Color: "#b1b1c3",
    },
    simParams: {
        waveDecay: 0.992,
        densityDissipation: 0.931,
        temperatureDissipation: 0.98
    }
};

const crystalClear: Version = {
    name: 'Crystal Clear',
    uniforms: {
        uArtisticBlend: 0,
        uDisplacementScale: 0.167,
        uVelocityShiftScale: 0.0105,
        uDensityShiftScale: 0.0481,
        uWaterColor: "#7ea3e7",
        uInkColor: "#b3d4ff",
        uVolumeFactor: 0.67,
        uInkStrength: 0.25,
        uShininess: 1006,
        uFresnelColor: "#5a99b5",
        uFresnelIntensity: 4.5,
        uGlowColor: "#7a94e1",
        uGlowPower: 6,
        uInkGeneration: 0.05,
        uWaveSize: 0.142,
        uWaveSteepness: 0.104,
        uWaveComplexity: 0.037,
        uWaveDetail: 0.033,
        uFeedRate: 0.021,
        uKillRate: 0.029,
        uVorticity: 1,
        uReactionForce: 0.14,
        uBuoyancy: 0.22,
        uAmbientTemperature: 0,
        uSplatTemperature: 0,
        uBorderThickness: 0.03,
        uBorderColor: "#7ab6ff",
        uSurfaceTension: 0.06,
        uChiselStrength: 4.23,
        uSSR_Strength: 0.26,
        uSSR_Falloff: 1,
        uSSR_Samples: 8,
        uParticleRate: 0,
        uParticleSize: 0,
        uParticleAdvection: 0,
        uParticleColor: "#ffffff",
        uCausticsIntensity: 1.7,
        uLightDepth: 0.5,
        uSurfaceDetailStrength: 0.07,
        uFlowSpeed: 0,
        uRippleStrength: 0,
        uRippleDamping: 0.9,
        uRippleSpeed: 0,
        uLight1Pos: new THREE.Vector3(0.5, 0.5, 0.6),
        uLight1Color: "#eef2ff",
        uLight2Pos: new THREE.Vector3(-0.5, -0.5, 0.4),
        uLight2Color: "#b1b1c3",
    },
    simParams: {
        waveDecay: 0.923,
        densityDissipation: 0.907,
        temperatureDissipation: 0.937
    }
};

const pristineWater: Version = {
    name: 'Pristine Water',
    uniforms: {
        uArtisticBlend: 0,
        uDisplacementScale: 0.161,
        uVelocityShiftScale: 0.001,
        uDensityShiftScale: 0.0183,
        uWaterColor: "#61ced6",
        uInkColor: "#42ae93",
        uVolumeFactor: 0.75,
        uInkStrength: 0.45,
        uShininess: 964,
        uFresnelColor: "#635f5f",
        uFresnelIntensity: 3.8,
        uGlowColor: "#4eda99",
        uGlowPower: 8.3,
        uInkGeneration: 0.05,
        uWaveSize: 0.142,
        uWaveSteepness: 0.104,
        uWaveComplexity: 0.037,
        uWaveDetail: 0.033,
        uFeedRate: 0.021,
        uKillRate: 0.029,
        uVorticity: 1,
        uReactionForce: 0.14,
        uBuoyancy: 0.22,
        uAmbientTemperature: 0,
        uSplatTemperature: 0,
        uBorderThickness: 0.03,
        uBorderColor: "#55e2e0",
        uSurfaceTension: 0.06,
        uChiselStrength: 4.23,
        uSSR_Strength: 0,
        uSSR_Falloff: 2.8,
        uSSR_Samples: 5,
        uParticleRate: 0.2,
        uParticleSize: 1.5,
        uParticleAdvection: 0.2,
        uParticleColor: "#ffffff",
        uCausticsIntensity: 0,
        uLightDepth: 0.5,
        uSurfaceDetailStrength: 0,
        uFlowSpeed: 0.26,
        uRippleStrength: 0,
        uRippleDamping: 0.98,
        uRippleSpeed: 0.5,
        uLight1Pos: new THREE.Vector3(0.5, 0.5, 0.6),
        uLight1Color: "#eef2ff",
        uLight2Pos: new THREE.Vector3(-0.5, -0.5, 0.4),
        uLight2Color: "#b1b1c3",
    },
    simParams: {
        waveDecay: 0.855,
        densityDissipation: 0.891,
        temperatureDissipation: 0.879
    }
};

const mercury: Version = {
    name: 'Mercury',
    uniforms: {
        uArtisticBlend: 0,
        uDisplacementScale: 0.17,
        uVelocityShiftScale: 0,
        uDensityShiftScale: 0.0171,
        uWaterColor: "#4d4d4d",
        uInkColor: "#999999",
        uVolumeFactor: 0.97,
        uInkStrength: 2.65,
        uShininess: 992,
        uFresnelColor: "#e6e6e6",
        uFresnelIntensity: 3.6,
        uGlowColor: "#141414",
        uGlowPower: 4.8,
        uInkGeneration: 0.05,
        uWaveSize: 0.08,
        uWaveSteepness: 0.143,
        uWaveComplexity: 0.132,
        uWaveDetail: 0.031,
        uFeedRate: 0.01,
        uKillRate: 0.037,
        uVorticity: 0.3,
        uReactionForce: 0,
        uBuoyancy: 1.45,
        uAmbientTemperature: 0.24,
        uSplatTemperature: -1,
        uBorderThickness: 0,
        uBorderColor: "#fffafa",
        uSurfaceTension: 1.88,
        uChiselStrength: 1.52,
        uSSR_Strength: 0,
        uSSR_Falloff: 1.5,
        uSSR_Samples: 25,
        uParticleRate: 0,
        uParticleSize: 2,
        uParticleAdvection: 0.2,
        uParticleColor: "#ffffff",
        uCausticsIntensity: 0,
        uLightDepth: 0.5,
        uSurfaceDetailStrength: 0.01,
        uFlowSpeed: 5.5,
        uRippleStrength: 0,
        uRippleDamping: 0.97,
        uRippleSpeed: 0.2,
        uLight1Pos: new THREE.Vector3(1, 1, 0.8),
        uLight1Color: "#eef2ff",
        uLight2Pos: new THREE.Vector3(-0.5, -0.5, 0.5),
        uLight2Color: "#b1b1c3",
    },
    simParams: {
        waveDecay: 0.968,
        densityDissipation: 0.956,
        temperatureDissipation: 0.98
    }
};

const sora: Version = {
    name: 'Sora',
    uniforms: {
        uArtisticBlend: 0,
        uDisplacementScale: 0.055,
        uVelocityShiftScale: 0.0006,
        uDensityShiftScale: 0.0042,
        uWaterColor: "#820792",
        uInkColor: "#641b5e",
        uVolumeFactor: 0.67,
        uInkStrength: 0.85,
        uShininess: 437,
        uFresnelColor: "#b706db",
        uFresnelIntensity: 3.2,
        uGlowColor: "#f42aaa",
        uGlowPower: 1.3,
        uInkGeneration: 0.05,
        uWaveSize: 0.157,
        uWaveSteepness: 0.119,
        uWaveComplexity: 0.014,
        uWaveDetail: 0.008,
        uFeedRate: 0.023,
        uKillRate: 0.028,
        uVorticity: 0.4,
        uReactionForce: 0.3,
        uBuoyancy: 2,
        uAmbientTemperature: 0.28,
        uSplatTemperature: 0,
        uBorderThickness: 0,
        uBorderColor: "#fffafa",
        uSurfaceTension: 0.84,
        uChiselStrength: 3.89,
        uSSR_Strength: 0.03,
        uSSR_Falloff: 4.3,
        uSSR_Samples: 2,
        uParticleRate: 0,
        uParticleSize: 2,
        uParticleAdvection: 0.2,
        uParticleColor: "#ffffff",
        uCausticsIntensity: 1.2,
        uLightDepth: 0.5,
        uSurfaceDetailStrength: 0,
        uFlowSpeed: 0,
        uRippleStrength: 0,
        uRippleDamping: 0.98,
        uRippleSpeed: 0.7,
        uLight1Pos: new THREE.Vector3(0.8, 0.2, 0.7),
        uLight1Color: "#eef2ff",
        uLight2Pos: new THREE.Vector3(0.2, 0.8, 0.3),
        uLight2Color: "#b1b1c3",
    },
    simParams: {
        waveDecay: 0.976,
        densityDissipation: 0.88,
        temperatureDissipation: 0.885
    }
};

const versions: Version[] = [
    rainbowFlare,
    luminousGel,
    liquidBubble,
    neoWater,
    crystalClear,
    pristineWater,
    mercury,
    sora
];

// --- CONSTANTS ---
const PRESSURE_ITERATIONS = 20;
const REACTION_DIFFUSION_ITERATIONS = 10;

// --- SHADERS ---
const shaders = {
    advectionShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 uTexelSize;
    uniform float uDt;
    uniform float uDissipation;

    void main() {
        vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexelSize;
        pc_fragColor = uDissipation * texture(uSource, coord);
    }
`,
    baseVertexShader: `
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,
    buoyancyShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform sampler2D uTemperature;
    uniform float uBuoyancy;
    uniform float uAmbientTemperature;
    uniform float uDt;

    void main() {
        vec2 velocity = texture(uVelocity, vUv).xy;
        if (uBuoyancy < 0.001) {
            pc_fragColor = vec4(velocity, 0.0, 1.0);
            return;
        }
        float temp = texture(uTemperature, vUv).r;
        float force = uBuoyancy * (temp - uAmbientTemperature);
        velocity.y += force * uDt;
        pc_fragColor = vec4(velocity, 0.0, 1.0);
    }
`,
    causticsShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uDensityTexture;
    uniform vec2 uTexelSize;
    
    void main() {
        float h = texture(uDensityTexture, vUv).g;
        float h_l = texture(uDensityTexture, vUv - vec2(uTexelSize.x, 0.0)).g;
        float h_r = texture(uDensityTexture, vUv + vec2(uTexelSize.x, 0.0)).g;
        float h_b = texture(uDensityTexture, vUv - vec2(0.0, uTexelSize.y)).g;
        float h_t = texture(uDensityTexture, vUv + vec2(0.0, uTexelSize.y)).g;
        
        // Use Laplacian to approximate curvature, which focuses or disperses light
        float laplacian = (h_l + h_r + h_b + h_t) - 4.0 * h;
        // Sharper, more intense caustics
        float caustics = clamp(1.0 - laplacian * 200.0, 0.0, 1.0);
        
        float density = texture(uDensityTexture, vUv).g;
        
        pc_fragColor = vec4(vec3(pow(caustics, 3.0) * density), 1.0);
    }
`,
    clearShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uTexture;
    uniform float uValue;
    uniform vec3 uClearColor;
    uniform bool uUseClearColor;

    void main () {
        if (uUseClearColor) {
            pc_fragColor = vec4(uClearColor, 1.0);
        } else {
            pc_fragColor = uValue * texture(uTexture, vUv);
        }
    }
`,
    compositingShader: `
  precision mediump float;
  in vec2 vUv;

  uniform sampler2D uSceneTexture;
  uniform sampler2D uVelocityTexture;
  uniform sampler2D uDensityTexture;
  uniform sampler2D uTemperatureTexture;
  uniform sampler2D uReflectionTexture;
  uniform sampler2D uDetailNormalTexture;
  uniform sampler2D uRippleTexture;
  uniform vec2 uTexelSize;

  uniform vec3 uLight1Pos;
  uniform vec3 uLight1Color;
  uniform vec3 uLight2Pos;
  uniform vec3 uLight2Color;

  uniform float uDisplacementScale;
  uniform float uVelocityShiftScale;
  uniform float uDensityShiftScale;
  uniform vec3 uWaterColor;
  uniform float uVolumeFactor;
  uniform float uInkStrength;
  uniform float uShininess;
  uniform vec3 uFresnelColor;
  uniform float uFresnelIntensity;
  uniform vec3 uGlowColor;
  uniform float uGlowPower;
  uniform float uWaveSteepness;
  uniform float uWaveComplexity;
  uniform float uWaveDetail;
  uniform float uAmbientTemperature;
  uniform float uBorderThickness;
  uniform vec3 uBorderColor;
  uniform float uChiselStrength;
  uniform float uSSR_Strength;
  uniform float uSSR_Falloff;
  uniform float uSSR_Samples;
  uniform float uSurfaceDetailStrength;
  uniform float uRippleStrength;


  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 velocity = texture(uVelocityTexture, vUv).xy;
    float mainDensity = texture(uDensityTexture, vUv).g;
    
    if (mainDensity < 0.001) {
      pc_fragColor = texture(uSceneTexture, vUv);
      return;
    }
    
    float inkPower = clamp(mainDensity * uInkStrength, 0.0, 1.0);

    // --- Start: Normals & Refraction ---
    vec2 dUv_x = vec2(uTexelSize.x * 2.0, 0.0);
    vec2 dUv_y = vec2(0.0, uTexelSize.y * 2.0);
    float h_x = texture(uDensityTexture, vUv + dUv_x).g - mainDensity;
    float h_y = texture(uDensityTexture, vUv + dUv_y).g - mainDensity;

    h_x += velocity.x * uWaveComplexity;
    h_y += velocity.y * uWaveComplexity;

    float detail_noise = noise(vUv * 200.0) - 0.5;
    h_x += detail_noise * uWaveDetail;
    h_y += detail_noise * uWaveDetail;
    
    vec3 normalG = vec3(h_x, h_y, uWaveSteepness);

    vec2 detailNormal = (texture(uDetailNormalTexture, vUv).xy - 0.5) * 2.0;

    // Calculate ripple normal from heightfield gradient
    float ripple_h_center = texture(uRippleTexture, vUv).r;
    float ripple_h_x = texture(uRippleTexture, vUv + dUv_x).r;
    float ripple_h_y = texture(uRippleTexture, vUv + dUv_y).r;
    // Increase multiplier for more pronounced ripple normals, making them highly visible.
    vec2 rippleNormal = vec2(ripple_h_center - ripple_h_x, ripple_h_center - ripple_h_y) * 450.0;

    // Combine all normal sources
    vec3 finalNormal = normalize(vec3(
      normalG.xy + 
      detailNormal * uSurfaceDetailStrength + 
      rippleNormal * uRippleStrength, 
      normalG.z
    ));

    // Refraction includes all surface details
    vec2 velocityRefraction = velocity * uDisplacementScale;
    vec2 normalRefraction = finalNormal.xy * uDisplacementScale * 0.2;
    vec2 refractionOffset = (velocityRefraction + normalRefraction) * inkPower;
    vec2 refractedUv = vUv - refractionOffset;

    float poweredRgbShift = (length(velocity) * uVelocityShiftScale + mainDensity * uDensityShiftScale) * inkPower;
    vec2 bgShift = vec2(poweredRgbShift, 0.0);
    float r_bg = texture(uSceneTexture, refractedUv - bgShift).r;
    float g_bg = texture(uSceneTexture, refractedUv).g;
    float b_bg = texture(uSceneTexture, refractedUv + bgShift).b;
    vec3 refractedBg = vec3(r_bg, g_bg, b_bg);
    // --- End: Normals & Refraction ---

    vec2 internalShift = vec2(poweredRgbShift, 0.0);

    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 surfacePos = vec3(vUv, 0.0);
    vec3 lightDir1 = normalize(uLight1Pos - surfacePos);
    vec3 halfDir1 = normalize(lightDir1 + viewDir);
    vec3 lightDir2 = normalize(uLight2Pos - surfacePos);
    vec3 halfDir2 = normalize(lightDir2 + viewDir);

    // Enhanced Fresnel for a more artistic and stable effect
    float VdotN = clamp(dot(viewDir, finalNormal), 0.0, 1.0);
    // This combines a soft base fresnel with a sharper, intensity-driven edge tint.
    // It's more stable against noisy normals and prevents extreme brightness values.
    float fresnel = pow(1.0 - VdotN, 2.5) + (uFresnelIntensity * 0.3) * pow(1.0 - VdotN, 6.0);
    
    float shininess = min(uShininess, 1024.0);
    float spec1 = pow(max(0.0, dot(finalNormal, halfDir1)), shininess);
    float spec2 = pow(max(0.0, dot(finalNormal, halfDir2)), shininess);

    vec3 specularColor = spec1 * uLight1Color + spec2 * uLight2Color;
    vec3 fresnelComponent = uFresnelColor * fresnel;

    // Screen-Space Reflections
    vec3 reflectionColor = vec3(0.0);
    if (uSSR_Strength > 0.0 && uSSR_Samples > 0.0) {
        vec3 reflect_dir = reflect(-viewDir, finalNormal);
        float reflect_dist = 0.0;
        vec2 reflect_uv;
        bool hit = false;
        float step_size = 0.01;
        for (int i = 0; i < int(uSSR_Samples); i++) {
            reflect_dist += step_size;
            reflect_uv = vUv + reflect_dir.xy * reflect_dist;
            if (reflect_uv.x < 0.0 || reflect_uv.x > 1.0 || reflect_uv.y < 0.0 || reflect_uv.y > 1.0) break;
            
            float ray_height = mainDensity + reflect_dir.z * reflect_dist * 5.0;
            float surface_height = texture(uDensityTexture, reflect_uv).g;

            if (surface_height > ray_height) {
                reflectionColor = texture(uReflectionTexture, reflect_uv).rgb;
                hit = true;
                break;
            }
        }
        if (hit) {
            float fade = pow(max(0.0, 1.0 - reflect_dist), uSSR_Falloff);
            reflectionColor *= fade;
        }
    }
    vec3 reflectionComponent = reflectionColor * uSSR_Strength * fresnel;

    vec3 density_center = texture(uDensityTexture, vUv).rgb;
    vec3 density_shifted_R = texture(uDensityTexture, vUv - internalShift).rgb;
    vec3 density_shifted_B = texture(uDensityTexture, vUv + internalShift).rgb;
    
    float densityR = density_shifted_R.g;
    float densityG = density_center.g;
    float densityB = density_shifted_B.g;
    
    float glowPower = min(uGlowPower, 10.0);

    float temp = texture(uTemperatureTexture, vUv).r;
    float heat = clamp((temp - uAmbientTemperature) / max(0.01, uAmbientTemperature + 1.0), 0.0, 1.0);
    vec3 heatGlowColor = mix(uGlowColor, vec3(1.0, 0.2, 0.0), heat * heat);


    float add_r = (fresnelComponent.r + specularColor.r) * densityR + heatGlowColor.r * pow(densityR, glowPower) * densityR;
    float add_g = (fresnelComponent.g + specularColor.g) * densityG + heatGlowColor.g * pow(densityG, glowPower) * densityG;
    float add_b = (fresnelComponent.b + specularColor.b) * densityB + heatGlowColor.b * pow(densityB, glowPower) * densityB;
    vec3 fluidAdditiveColor = vec3(add_r, add_g, add_b) + reflectionComponent;

    // Volumetric absorption based on Beer's Law
    float occlusionR = clamp(densityR * uVolumeFactor, 0.0, 1.0);
    float occlusionG = clamp(densityG * uVolumeFactor, 0.0, 1.0);
    float occlusionB = clamp(densityB * uVolumeFactor, 0.0, 1.0);
    
    // Chisel / AO effect
    float ao = 0.0;
    if (uChiselStrength > 0.0) {
      float totalDensity = 0.0;
      float samples = 8.0;
      float angleStep = 6.28318530718 / samples;
      float radius = uTexelSize.y * 5.0;
      for (float i = 0.0; i < samples; i++) {
        vec2 offset = vec2(cos(i * angleStep), sin(i * angleStep)) * radius;
        totalDensity += texture(uDensityTexture, vUv + offset).g;
      }
      float avgDensity = totalDensity / samples;
      ao = clamp((avgDensity - mainDensity) * uChiselStrength, 0.0, 1.0);
    }
    float chiselFactor = 1.0 - pow(ao, 1.5) * inkPower;

    vec3 fluidBody;
    fluidBody.r = refractedBg.r * mix(1.0, uWaterColor.r, occlusionR) * chiselFactor;
    fluidBody.g = refractedBg.g * mix(1.0, uWaterColor.g, occlusionG) * chiselFactor;
    fluidBody.b = refractedBg.b * mix(1.0, uWaterColor.b, occlusionB) * chiselFactor;
    
    vec3 finalColor = fluidBody + fluidAdditiveColor;

    if (uBorderThickness > 0.001) {
        float edgeFactor = smoothstep(0.1, 0.1 + uBorderThickness, length(finalNormal.xy));
        finalColor = mix(finalColor, uBorderColor, edgeFactor * inkPower);
    }

    pc_fragColor = vec4(finalColor, 1.0);
  }
`,
    curlShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main() {
        float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
        float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
        float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
        
        float curl = 0.5 * ((T - B) - (R - L));
        pc_fragColor = vec4(curl, 0.0, 0.0, 1.0);
    }
`,
    divergenceShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
        float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
        
        float div = 0.5 * (R - L + T - B);
        pc_fragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`,
    eraseShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uTarget;
    uniform float uAspectRatio;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uStrength;

    void main() {
        vec2 p = vUv - uCenter.xy;
        p.x *= uAspectRatio;
        float intensity = 1.0 - smoothstep(0.0, uRadius, length(p));
        vec4 base = texture(uTarget, vUv);
        
        base.rg *= 1.0 - intensity * uStrength;
        
        pc_fragColor = base;
    }
`,
    finalPassShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uFluidResult;
    uniform sampler2D uSceneTexture;
    uniform sampler2D uDensityTexture;
    uniform sampler2D uCausticsTexture;
    uniform float uArtisticBlend;
    uniform float uCausticsIntensity;

    void main() {
        vec3 fluidView = texture(uFluidResult, vUv).rgb;
        vec3 sceneView = texture(uSceneTexture, vUv).rgb;
        float density = texture(uDensityTexture, vUv).g;
        float caustics = texture(uCausticsTexture, vUv).r;

        // Add caustics to the scene before blending with fluid
        vec3 sceneWithCaustics = sceneView + caustics * uCausticsIntensity;

        vec3 artisticResult = mix(sceneWithCaustics, fluidView, density);
        vec3 blendedColor = mix(fluidView, artisticResult, uArtisticBlend);
        vec3 finalColor = blendedColor;

        pc_fragColor = vec4(finalColor, 1.0);
    }
`,
    flowMapShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform sampler2D uFlowMap;
    uniform float uFlowSpeed;
    uniform float uDt;

    void main() {
        vec2 velocity = texture(uVelocity, vUv).xy * 0.1;
        vec2 oldFlow = texture(uFlowMap, vUv).xy;
        
        // Mix current velocity into the flow map, and slowly fade the old flow
        // uFlowSpeed acts as a responsiveness factor
        vec2 newFlow = mix(oldFlow, velocity, uDt * uFlowSpeed);

        pc_fragColor = vec4(newFlow, 0.0, 1.0);
    }
`,
    gradientSubtractShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        vec2 velocity = texture(uVelocity, vUv).xy;
        velocity.xy -= 0.5 * vec2(R - L, T - B);
        pc_fragColor = vec4(velocity, 0.0, 1.0);
    }
`,
    particleRenderFS: `
    precision mediump float;

    uniform vec3 uParticleColor;
    in float v_age_ratio;

    void main() {
        if (v_age_ratio > 1.0) discard;
        // Use pow for a nicer fade-out curve
        float alpha = pow(1.0 - v_age_ratio, 2.0); 
        
        // With Additive Blending, we just care about the RGB value.
        // We multiply the color by alpha to make it fade out.
        // The final alpha value is set to 1.0 as it's not used by the blend function.
        pc_fragColor = vec4(uParticleColor * alpha, 1.0);
    }
`,
    particleRenderVS: `
    uniform sampler2D uParticles;
    uniform float uParticleSize;
    in vec2 a_uv;
    out float v_age_ratio;

    void main() {
        vec4 particle = texture(uParticles, a_uv);
        v_age_ratio = particle.b / particle.a;

        // Only draw alive particles
        if (particle.b < particle.a) {
            vec2 pos = (particle.xy * 2.0) - 1.0;
            gl_Position = vec4(pos, 0.0, 1.0);
            gl_PointSize = uParticleSize * (1.0 - v_age_ratio);
        } else {
            // Hide dead particles
            gl_Position = vec4(-2.0, -2.0, 0.0, 1.0);
            gl_PointSize = 0.0;
        }
    }
`,
    particleSplatShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uTarget;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uIntensity;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

    void main() {
        vec4 particle = texture(uTarget, vUv);

        // If particle is dead...
        if (particle.b >= particle.a) {
            vec2 p = vUv - uCenter;
            float falloff = 1.0 - smoothstep(0.0, uRadius, length(p));
            
            // ...and we are under the cursor with enough intensity...
            if (falloff > 0.0 && hash(vUv * 999.0) < uIntensity * falloff * 0.2) {
                float lifetime = 2.0 + hash(vUv.yx) * 3.0;
                // Spawn particle at cursor position
                pc_fragColor = vec4(uCenter.x, uCenter.y, 0.0, lifetime);
                return;
            }
        }
        
        pc_fragColor = particle;
    }
`,
    particleUpdateShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uParticles; // R,G = pos.x, pos.y; B = age; A = lifetime
    uniform sampler2D uVelocity;
    uniform float uDt;
    uniform float uParticleAdvection;

    void main() {
        vec4 particle = texture(uParticles, vUv);

        // If particle is dead, keep it dead
        if (particle.b >= particle.a) {
            pc_fragColor = vec4(0.0, 0.0, particle.a, particle.a);
            return;
        }

        vec2 pos = particle.xy;
        vec2 vel = texture(uVelocity, pos).xy;

        pos += vel * uDt * uParticleAdvection; // Advect particle
        
        // Simple periodic boundary conditions
        pos = mod(pos, 1.0);

        float age = particle.b + uDt;
        
        pc_fragColor = vec4(pos, age, particle.a);
    }
`,
    pressureShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        float divergence = texture(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        pc_fragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`,
    radialPushShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uTarget;
    uniform float uAspectRatio;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uStrength;

    void main() {
        vec2 p = vUv - uCenter.xy;
        p.x *= uAspectRatio;
        
        float falloff = 1.0 - smoothstep(0.0, uRadius, length(p));
        if (falloff <= 0.0) {
            pc_fragColor = texture(uTarget, vUv);
            return;
        }

        vec2 direction = normalize(p + 0.0001);
        vec2 pushForce = direction * falloff * uStrength;
        
        vec2 baseVelocity = texture(uTarget, vUv).xy;
        pc_fragColor = vec4(baseVelocity + pushForce, 0.0, 1.0);
    }
`,
    reactionDiffusionShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uChemicals;
    uniform vec2 uTexelSize;
    uniform float uFeedRate;
    uniform float uKillRate;
    
    const float uDu = 0.16;
    const float uDv = 0.08;
    const float uDt = 1.0;

    void main() {
        if (uFeedRate < 0.001 && uKillRate < 0.001) {
            pc_fragColor = texture(uChemicals, vUv);
            return;
        }

        vec2 chemical = texture(uChemicals, vUv).rg;
        float u = chemical.r;
        float v = chemical.g;

        float lap_u = (
            texture(uChemicals, vUv + vec2(0.0, uTexelSize.y)).r +
            texture(uChemicals, vUv - vec2(0.0, uTexelSize.y)).r +
            texture(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).r +
            texture(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).r -
            4.0 * u
        );

        float lap_v = (
            texture(uChemicals, vUv + vec2(0.0, uTexelSize.y)).g +
            texture(uChemicals, vUv - vec2(0.0, uTexelSize.y)).g +
            texture(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).g +
            texture(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).g -
            4.0 * v
        );

        float reaction = u * v * v;
        float du_dt = uDu * lap_u - reaction + uFeedRate * (1.0 - u);
        float dv_dt = uDv * lap_v + reaction - (uKillRate + uFeedRate) * v;

        float new_u = u + du_dt * uDt;
        float new_v = v + dv_dt * uDt;

        float old_b = texture(uChemicals, vUv).b;
        pc_fragColor = vec4(clamp(new_u, 0.0, 1.0), clamp(new_v, 0.0, 1.0), old_b, 1.0);
    }
`,
    reactionForceShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform sampler2D uChemicals;
    uniform float uReactionForce;
    uniform vec2 uTexelSize;

    void main() {
        vec2 velocity = texture(uVelocity, vUv).xy;
        if (uReactionForce < 0.001) {
            pc_fragColor = vec4(velocity, 0.0, 1.0);
            return;
        }

        float L = texture(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).g;
        float R = texture(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).g;
        float B = texture(uChemicals, vUv - vec2(0.0, uTexelSize.y)).g;
        float T = texture(uChemicals, vUv + vec2(0.0, uTexelSize.y)).g;
        
        vec2 gradV = 0.5 * vec2(R - L, T - B);
        
        pc_fragColor = vec4(velocity - gradV * uReactionForce, 0.0, 1.0);
    }
`,
    ripplePropagateShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uRippleTexture; // .r = current height, .g = previous height
    uniform vec2 uTexelSize;
    uniform float uRippleSpeed;
    uniform float uRippleDamping;

    void main() {
        vec2 prevState = texture(uRippleTexture, vUv).rg;
        float h_prev = prevState.g;
        float h_curr = prevState.r;

        float h_l = texture(uRippleTexture, vUv - vec2(uTexelSize.x, 0.0)).r;
        float h_r = texture(uRippleTexture, vUv + vec2(uTexelSize.x, 0.0)).r;
        float h_b = texture(uRippleTexture, vUv - vec2(0.0, uTexelSize.y)).r;
        float h_t = texture(uRippleTexture, vUv + vec2(0.0, uTexelSize.y)).r;

        float laplacian = (h_l + h_r + h_b + h_t) - 4.0 * h_curr;
        
        // Wave equation: new_h = 2*h_curr - h_prev + (speed^2 * laplacian)
        // A stability factor of 0.4 is added to prevent numerical artifacts.
        float h_new = 2.0 * h_curr - h_prev + laplacian * (uRippleSpeed * uRippleSpeed) * 0.4;
        
        // Apply damping to make ripples fade
        h_new *= uRippleDamping;

        pc_fragColor = vec4(h_new, h_curr, 0.0, 1.0); // Store new height in .r, current height in .g
    }
`,
    rippleSplatShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uTarget;
    uniform float uAspectRatio;
    uniform vec2 uCenter;
    uniform vec2 uPrevCenter;
    uniform float uRadius;
    uniform float uStrength;

    // Returns the distance from point P to line segment AB
    float distToSegment(vec2 P, vec2 A, vec2 B) {
        vec2 AP = P - A;
        vec2 AB = B - A;
        // Handle zero-length segment (e.g., a click without mouse move)
        float ab2 = dot(AB, AB);
        if (ab2 < 0.00001) {
            return distance(P, A);
        }
        float ap_ab = dot(AP, AB);
        float t = clamp(ap_ab / ab2, 0.0, 1.0);
        vec2 closestPoint = A + t * AB;
        return distance(P, closestPoint);
    }

    void main() {
        vec2 p = vUv;
        p.x *= uAspectRatio;
        
        vec2 center = uCenter;
        center.x *= uAspectRatio;
        
        vec2 prevCenter = uPrevCenter;
        prevCenter.x *= uAspectRatio;
        
        float intensity = 0.0;
        bool is_click = distance(center, prevCenter) < 0.0001;

        if (is_click) {
            // Enhanced "drop" effect for clicks for a more satisfying plop.
            float dist_to_center = distance(p, center);
            float radius = uRadius * 0.7; // Use a slightly larger radius for the effect.

            // A sharp central depression (the "pluck").
            float drop = -pow(1.0 - smoothstep(0.0, radius, dist_to_center), 2.0) * 1.5;
            
            // A surrounding raised ring to displace the "water".
            float ring_dist = abs(dist_to_center - radius * 0.5);
            float ring = pow(1.0 - smoothstep(0.0, radius * 0.4, ring_dist), 2.0);
            
            // Combine them, the strength of the click is higher.
            intensity = (drop + ring * 0.5) * uStrength * 2.5; 

        } else {
            // Original wake effect for drags.
            float dist = distToSegment(p, prevCenter, center);
            // Pluck the surface downwards to create a trough with a more defined falloff.
            intensity = -pow(1.0 - smoothstep(0.0, uRadius * 0.5, dist), 1.5) * uStrength;
        }


        vec2 base = texture(uTarget, vUv).rg;
        base.r += intensity;
        pc_fragColor = vec4(base, 0.0, 1.0);
    }
`,
    splatShader: `
  precision mediump float;
  in vec2 vUv;

  uniform sampler2D uTarget;
  uniform float uAspectRatio;
  uniform vec3 uColor;
  uniform vec2 uCenter;
  uniform float uRadius;

  void main() {
    vec2 p = vUv - uCenter.xy;
    p.x *= uAspectRatio;
    float intensity = 1.0 - smoothstep(0.0, uRadius, length(p));
    vec3 splat = uColor * intensity;
    vec3 base = texture(uTarget, vUv).rgb;
    pc_fragColor = vec4(base + splat, 1.0);
  }
`,
    surfaceDetailShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uDensityTexture;
    uniform sampler2D uFlowMapTexture;
    uniform vec2 uTexelSize;
    uniform float uTime;

    // 2D simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    // Fractal Brownian Motion
    float fbm(vec2 uv, float flow_mag) {
        float total = 0.0;
        float amplitude = 0.6;
        float frequency = 20.0;
        float gain = 0.4;
        
        // Animate faster when flow is stronger
        float time_mult = 1.0 + flow_mag * 5.0;

        for (int i = 0; i < 4; i++) {
            total += snoise(uv * frequency + uTime * 0.4 * time_mult) * amplitude;
            frequency *= 2.1;
            amplitude *= gain;
        }
        return total;
    }


    void main() {
        float density = texture(uDensityTexture, vUv).g;
        if (density < 0.01) {
            pc_fragColor = vec4(0.5, 0.5, 1.0, 1.0); // Neutral normal
            return;
        }
        vec2 flow = texture(uFlowMapTexture, vUv).xy * 0.5;
        float flow_mag = length(flow);
        
        // Calculate main wave normal to influence detail direction
        float h_l = texture(uDensityTexture, vUv - vec2(uTexelSize.x, 0.0)).g;
        float h_r = texture(uDensityTexture, vUv + vec2(uTexelSize.x, 0.0)).g;
        float h_b = texture(uDensityTexture, vUv - vec2(0.0, uTexelSize.y)).g;
        float h_t = texture(uDensityTexture, vUv + vec2(0.0, uTexelSize.y)).g;
        vec2 main_normal = vec2(h_l - h_r, h_b - h_t);

        // Animate ripples along the flow and perpendicular to main wave normal
        vec2 sample_uv = vUv + flow + main_normal * 0.01;
        
        // Increase noise frequency and amplitude on wave crests
        float noise_mod = 1.0 + density * 2.0;
        float noise_val = fbm(sample_uv * noise_mod, flow_mag);

        vec2 dUv = uTexelSize * 2.0;
        float nx = fbm((sample_uv + vec2(dUv.x, 0.0)) * noise_mod, flow_mag);
        float ny = fbm((sample_uv + vec2(0.0, dUv.y)) * noise_mod, flow_mag);
        
        // Use a larger Z value to control the "height" of the details, making them less extreme and preventing artifacts.
        vec3 normal = normalize(vec3((noise_val - nx), (noise_val - ny), 0.5));
        
        // Modulate normal strength by density to make edges smoother
        float strength = smoothstep(0.0, 0.1, density);
        
        pc_fragColor = vec4(mix(vec2(0.5), normal.xy * 0.5 + 0.5, strength), 1.0, 1.0);
    }
`,
    surfaceTensionShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform sampler2D uDensity;
    uniform float uSurfaceTension;
    uniform float uDt;
    uniform vec2 uTexelSize;

    void main() {
        vec2 velocity = texture(uVelocity, vUv).xy;
        if (uSurfaceTension < 0.001) {
            pc_fragColor = vec4(velocity, 0.0, 1.0);
            return;
        }
        
        float density = texture(uDensity, vUv).g;
        if (density < 0.01) {
            pc_fragColor = vec4(velocity, 0.0, 1.0);
            return;
        }

        float L = texture(uDensity, vUv - vec2(uTexelSize.x, 0.0)).g;
        float R = texture(uDensity, vUv + vec2(uTexelSize.x, 0.0)).g;
        float B = texture(uDensity, vUv - vec2(0.0, uTexelSize.y)).g;
        float T = texture(uDensity, vUv + vec2(0.0, uTexelSize.y)).g;
        
        vec2 grad = 0.5 * vec2(R - L, T - B);
        
        // Calculate curvature (approximated by Laplacian of density)
        float laplacian = (L + R + B + T) - 4.0 * density;

        // Surface tension force is proportional to curvature multiplied by the surface normal.
        // This force pulls the fluid towards the center of curvature, minimizing surface area.
        vec2 force = -uSurfaceTension * laplacian * normalize(grad + 0.0001) * 2.0;
        
        velocity += force * uDt;
        
        pc_fragColor = vec4(velocity, 0.0, 1.0);
    }
`,
    vorticityShader: `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float uVorticity;
    uniform float uDt;
    uniform vec2 uTexelSize;

    void main() {
        vec2 velocity = texture(uVelocity, vUv).xy;
        if (uVorticity < 0.01) {
            pc_fragColor = vec4(velocity, 0.0, 1.0);
            return;
        }

        float L = texture(uCurl, vUv - vec2(uTexelSize.x, 0.0)).r;
        float R = texture(uCurl, vUv + vec2(uTexelSize.x, 0.0)).r;
        float B = texture(uCurl, vUv - vec2(0.0, uTexelSize.y)).r;
        float T = texture(uCurl, vUv + vec2(0.0, uTexelSize.y)).r;
        
        float curl = texture(uCurl, vUv).r;
        
        vec2 grad = 0.5 * vec2(R - L, T - B);
        vec2 N = normalize(grad + 0.0001);
        vec2 force = uVorticity * curl * vec2(N.y, -N.x);
        
        velocity += force * uDt;
        
        pc_fragColor = vec4(velocity, 0.0, 1.0);
    }
`,
};

// --- SIMULATION HOOK ---
type PointerInfo = {
    id: number;
    x: number;
    y: number;
    dx: number;
    dy: number;
    button: number;
};

const isColor = (key: string, value: any): value is string => {
    return typeof value === 'string' && key.toLowerCase().includes('color');
};

const useFluidSimulation = (
    mountRef: React.RefObject<HTMLDivElement>,
    params: AllParams,
    quality: QualitySettings,
    backgroundColor: string,
    textColor: string
) => {
    const paramsRef = useRef(params);
    useEffect(() => {
        paramsRef.current = params;
    }, [params]);

    const sim = useRef({
        renderer: null as THREE.WebGLRenderer | null,
        scene: new THREE.Scene(),
        camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
        particleScene: new THREE.Scene(),
        mesh: new THREE.Mesh(new THREE.PlaneGeometry(2, 2)),
        startTime: 0,
        lastTime: 0,
        pointers: new Map<number, PointerInfo>(),
        fbo: {} as Record<string, any>,
        materials: {} as Record<string, THREE.Material>,
        simHeight: 0,
        config: { velocityDissipation: 0, densityDissipation: 0, temperatureDissipation: 0 },
    }).current;

    useEffect(() => {
        sim.config.velocityDissipation = params.waveDecay;
        sim.config.densityDissipation = params.densityDissipation;
        sim.config.temperatureDissipation = params.temperatureDissipation;

        if (sim.materials.compositing) {
             const allMaterials = [
                sim.materials.compositing, sim.materials.finalPass, sim.materials.reactionDiffusion,
                sim.materials.reactionForce, sim.materials.vorticity, sim.materials.surfaceTension,
                sim.materials.splat, sim.materials.buoyancy, sim.materials.particleRender,
                sim.materials.particleUpdate, sim.materials.flowMap, sim.materials.ripplePropagate
            ];

            Object.entries(params).forEach(([key, value]) => {
                allMaterials.forEach(mat => {
                    if (mat && (mat as THREE.ShaderMaterial).uniforms && (mat as THREE.ShaderMaterial).uniforms[key]) {
                        const uniform = (mat as THREE.ShaderMaterial).uniforms[key];
                        if (isColor(key, value)) {
                             if (uniform.value instanceof THREE.Color) {
                                uniform.value.set(value);
                            }
                        } else if (key === 'uSSR_Strength') {
                             uniform.value = quality.enableSsr ? value : 0;
                        } else {
                            uniform.value = value;
                        }
                    }
                });
                if (sim.materials.splat && key === 'uWaveSize') {
                    ((sim.materials.splat as THREE.ShaderMaterial).uniforms.uRadius as any).value = value;
                }
            });
        }
    }, [params, sim, quality.enableSsr]);

    const createTextCanvas = (width: number, height: number, bgColor: string, txtColor: string): HTMLCanvasElement => {
        const textCanvas = document.createElement('canvas');
        textCanvas.width = width;
        textCanvas.height = height;
        const ctx = textCanvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = txtColor;
            const fontSize = Math.min(width, height) * 0.15;
            ctx.font = `900 ${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('PLAY', width / 2, height / 2);
        }
        return textCanvas;
    };
    
    useEffect(() => {
        if (sim.renderer && sim.materials.scene) {
            const { width, height } = sim.renderer.getSize(new THREE.Vector2());
            const newTextCanvas = createTextCanvas(width, height, backgroundColor, textColor);
            const newSceneTexture = new THREE.CanvasTexture(newTextCanvas);
            newSceneTexture.colorSpace = THREE.SRGBColorSpace;
            const sceneMaterial = sim.materials.scene as THREE.MeshBasicMaterial;
            sceneMaterial.map?.dispose();
            sceneMaterial.map = newSceneTexture;
        }
    }, [backgroundColor, textColor, sim.renderer, sim.materials.scene]);


    useEffect(() => {
        if (!mountRef.current) return;

        const createFBO = (width: number, height: number, format: THREE.PixelFormat = THREE.RGBAFormat) => {
            const fbo = new THREE.WebGLRenderTarget(width, height, {
                minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
                type: THREE.HalfFloatType, format: format,
            });
            fbo.texture.colorSpace = THREE.LinearSRGBColorSpace;
            const fbo2 = fbo.clone();
            fbo2.texture.colorSpace = THREE.LinearSRGBColorSpace;
            return { read: fbo, write: fbo2, swap: function() { const temp = this.read; this.read = this.write; this.write = temp; } };
        };

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        mountRef.current.appendChild(renderer.domElement);
        sim.renderer = renderer;

        const { width, height } = renderer.getSize(new THREE.Vector2());
        const simWidth = quality.simResolution;
        const simHeight = Math.round(quality.simResolution / (width / height));
        sim.simHeight = simHeight;

        sim.fbo.velocity = createFBO(simWidth, simHeight);
        sim.fbo.density = createFBO(simWidth, simHeight);
        sim.fbo.temperature = createFBO(simWidth, simHeight);
        sim.fbo.pressure = createFBO(simWidth, simHeight);
        sim.fbo.flow = createFBO(simWidth, simHeight);
        sim.fbo.ripples = createFBO(simWidth, simHeight, THREE.RGFormat);
        if (quality.particleResolution > 0) {
            sim.fbo.particles = createFBO(quality.particleResolution, quality.particleResolution);
        }
        sim.fbo.divergence = new THREE.WebGLRenderTarget(simWidth, simHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType, format: THREE.RedFormat });
        sim.fbo.divergence.texture.colorSpace = THREE.LinearSRGBColorSpace;
        sim.fbo.curl = new THREE.WebGLRenderTarget(simWidth, simHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType, format: THREE.RedFormat });
        sim.fbo.curl.texture.colorSpace = THREE.LinearSRGBColorSpace;
        sim.fbo.caustics = new THREE.WebGLRenderTarget(simWidth, simHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RedFormat });
        sim.fbo.caustics.texture.colorSpace = THREE.LinearSRGBColorSpace;
        sim.fbo.detailNormal = new THREE.WebGLRenderTarget(simWidth, simHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RGBAFormat });
        sim.fbo.detailNormal.texture.colorSpace = THREE.LinearSRGBColorSpace;
        sim.fbo.scene = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RGBAFormat });
        sim.fbo.scene.texture.colorSpace = THREE.LinearSRGBColorSpace;
        sim.fbo.composited = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RGBAFormat });
        sim.fbo.composited.texture.colorSpace = THREE.LinearSRGBColorSpace;
        sim.fbo.renderedFrame = createFBO(width, height);


        const simTexelSize = new THREE.Vector2(1 / simWidth, 1 / simHeight);
        const textCanvas = createTextCanvas(width, height, backgroundColor, textColor);
        const sceneTexture = new THREE.CanvasTexture(textCanvas);
        sceneTexture.colorSpace = THREE.SRGBColorSpace;
        
        sim.materials = {
            clear: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.clearShader, uniforms: { uTexture: { value: null }, uValue: { value: 0.97 }, uClearColor: { value: new THREE.Vector3() }, uUseClearColor: { value: false } } }),
            copy: new THREE.MeshBasicMaterial({ map: null }),
            splat: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.splatShader, uniforms: { uTarget: { value: null }, uAspectRatio: { value: width/height }, uColor: { value: new THREE.Vector3() }, uCenter: { value: new THREE.Vector2() }, uRadius: { value: 0.05 } } }),
            erase: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.eraseShader, uniforms: { uTarget: { value: null }, uAspectRatio: { value: width/height }, uCenter: { value: new THREE.Vector2() }, uRadius: { value: 0.05 }, uStrength: { value: 0.1 } } }),
            radialPush: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.radialPushShader, uniforms: { uTarget: { value: null }, uAspectRatio: { value: width/height }, uCenter: { value: new THREE.Vector2() }, uRadius: { value: 0.05 }, uStrength: { value: 0.2 } } }),
            advection: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.advectionShader, uniforms: { uVelocity: { value: null }, uSource: { value: null }, uTexelSize: { value: simTexelSize }, uDt: { value: 0.0 }, uDissipation: { value: 1.0 } } }),
            divergence: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.divergenceShader, uniforms: { uVelocity: { value: null }, uTexelSize: { value: simTexelSize } } }),
            pressure: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.pressureShader, uniforms: { uPressure: { value: null }, uDivergence: { value: null }, uTexelSize: { value: simTexelSize } } }),
            gradientSubtract: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.gradientSubtractShader, uniforms: { uPressure: { value: null }, uVelocity: { value: null }, uTexelSize: { value: simTexelSize } } }),
            reactionDiffusion: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.reactionDiffusionShader, uniforms: { uChemicals: { value: null }, uTexelSize: { value: simTexelSize }, uFeedRate: { value: 0.0 }, uKillRate: { value: 0.0 } } }),
            curl: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.curlShader, uniforms: { uVelocity: { value: null }, uTexelSize: { value: simTexelSize } } }),
            vorticity: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.vorticityShader, uniforms: { uVelocity: { value: null }, uCurl: { value: null }, uVorticity: { value: 0.0 }, uDt: { value: 0.0 }, uTexelSize: { value: simTexelSize } } }),
            surfaceTension: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.surfaceTensionShader, uniforms: { uVelocity: { value: null }, uDensity: { value: null }, uSurfaceTension: { value: 0.0 }, uDt: { value: 0.0 }, uTexelSize: { value: simTexelSize } } }),
            reactionForce: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.reactionForceShader, uniforms: { uVelocity: { value: null }, uChemicals: { value: null }, uReactionForce: { value: 0.0 }, uTexelSize: { value: simTexelSize } } }),
            buoyancy: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.buoyancyShader, uniforms: { uVelocity: { value: null }, uTemperature: { value: null }, uBuoyancy: { value: 0.0 }, uAmbientTemperature: { value: 0.0 }, uDt: { value: 0.0 } } }),
            caustics: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.causticsShader, uniforms: { uDensityTexture: { value: null }, uTexelSize: { value: simTexelSize } } }),
            flowMap: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.flowMapShader, uniforms: { uVelocity: { value: null }, uFlowMap: { value: null }, uFlowSpeed: { value: 0.0 }, uDt: { value: 0.0 } } }),
            surfaceDetail: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.surfaceDetailShader, uniforms: { uDensityTexture: { value: null }, uFlowMapTexture: { value: null }, uTexelSize: { value: simTexelSize }, uTime: { value: 0.0 } } }),
            rippleSplat: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.rippleSplatShader, uniforms: { uTarget: { value: null }, uAspectRatio: { value: width/height }, uCenter: { value: new THREE.Vector2() }, uPrevCenter: { value: new THREE.Vector2() }, uRadius: { value: 0.05 }, uStrength: { value: 0.1 } } }),
            ripplePropagate: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.ripplePropagateShader, uniforms: { uRippleTexture: { value: null }, uTexelSize: { value: simTexelSize }, uRippleSpeed: { value: 0.5 }, uRippleDamping: { value: 0.99 } } }),
            scene: new THREE.MeshBasicMaterial({ map: sceneTexture }),
            compositing: new THREE.ShaderMaterial({
                vertexShader: shaders.baseVertexShader, fragmentShader: shaders.compositingShader,
                uniforms: {
                    uSceneTexture: { value: null }, uVelocityTexture: { value: null }, uDensityTexture: { value: null }, uTemperatureTexture: { value: null }, uReflectionTexture: { value: null }, uDetailNormalTexture: { value: null }, uRippleTexture: { value: null }, uTexelSize: { value: simTexelSize },
                    uLight1Pos: { value: new THREE.Vector3(0.5, 0.5, 0.5) }, uLight1Color: { value: new THREE.Color(1.0, 1.0, 1.0) }, uLight2Pos: { value: new THREE.Vector3(-0.5, -0.5, 0.5) }, uLight2Color: { value: new THREE.Color(0.2, 0.5, 1.0) },
                    uDisplacementScale: { value: 0.0 }, uVelocityShiftScale: { value: 0.0 }, uDensityShiftScale: { value: 0.0 }, uWaterColor: { value: new THREE.Color(0.0, 0.0, 0.0) }, uVolumeFactor: { value: 0.0 }, uInkStrength: { value: 0.0 }, uShininess: { value: 0.0 }, uFresnelColor: { value: new THREE.Color(0.0, 0.0, 0.0) }, uFresnelIntensity: { value: 0.0 }, uGlowColor: { value: new THREE.Color(0.0, 0.0, 0.0) }, uGlowPower: { value: 0.0 }, uWaveSteepness: { value: 0.05 }, uWaveComplexity: { value: 0.0 }, uWaveDetail: { value: 0.0 }, uAmbientTemperature: { value: 0.0 }, uBorderThickness: { value: 0.0 }, uBorderColor: { value: new THREE.Color(0,0,0) }, uChiselStrength: { value: 0.0 }, uSSR_Strength: { value: 0.0 }, uSSR_Falloff: { value: 0.0 }, uSSR_Samples: { value: 0.0 }, uSurfaceDetailStrength: { value: 0.0 }, uRippleStrength: { value: 0.0 },
                }
            }),
            finalPass: new THREE.ShaderMaterial({
                vertexShader: shaders.baseVertexShader, fragmentShader: shaders.finalPassShader,
                uniforms: { uFluidResult: { value: null }, uSceneTexture: { value: null }, uDensityTexture: { value: null }, uCausticsTexture: { value: null }, uArtisticBlend: { value: 0.0 }, uCausticsIntensity: { value: 0.0 } }
            }),
        };

        if (quality.particleResolution > 0) {
            sim.materials.particleSplat = new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.particleSplatShader, uniforms: { uTarget: { value: null }, uCenter: { value: new THREE.Vector2() }, uRadius: { value: 0.05 }, uIntensity: { value: 0.0 } } });
            sim.materials.particleUpdate = new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.particleUpdateShader, uniforms: { uParticles: { value: null }, uVelocity: { value: null }, uDt: { value: 0.0 }, uParticleAdvection: { value: 0.2 } } });
            sim.materials.particleRender = new THREE.ShaderMaterial({ vertexShader: shaders.particleRenderVS, fragmentShader: shaders.particleRenderFS, uniforms: { uParticles: { value: null }, uParticleColor: { value: new THREE.Color(1,1,1) }, uParticleSize: { value: 2.0 } }, transparent: true, blending: THREE.AdditiveBlending, depthTest: false });

            const particleCount = quality.particleResolution * quality.particleResolution;
            const particleGeometry = new THREE.BufferGeometry();
            const particleUvs = new Float32Array(particleCount * 2);
            for (let i = 0; i < quality.particleResolution; i++) {
                for (let j = 0; j < quality.particleResolution; j++) {
                    const index = (i * quality.particleResolution + j) * 2;
                    particleUvs[index] = j / (quality.particleResolution - 1);
                    particleUvs[index + 1] = i / (quality.particleResolution - 1);
                }
            }
            particleGeometry.setAttribute('a_uv', new THREE.BufferAttribute(particleUvs, 2));
            const particlePoints = new THREE.Points(particleGeometry, sim.materials.particleRender);
            sim.particleScene.add(particlePoints);
        }

        sim.scene.add(sim.mesh);
        
        const blit = (target: THREE.WebGLRenderTarget | null, material: THREE.Material) => {
            sim.mesh.material = material;
            sim.renderer!.setRenderTarget(target);
            sim.renderer!.render(sim.scene, sim.camera);
        };
        
        const clearMaterial = sim.materials.clear as THREE.ShaderMaterial;
        clearMaterial.uniforms.uUseClearColor.value = true;
        clearMaterial.uniforms.uClearColor.value.set(1.0, 0.0, 0.0);
        blit(sim.fbo.density.read, clearMaterial);
        blit(sim.fbo.density.write, clearMaterial);
        
        clearMaterial.uniforms.uClearColor.value.set(params.uAmbientTemperature, 0.0, 0.0);
        blit(sim.fbo.temperature.read, clearMaterial);
        blit(sim.fbo.temperature.write, clearMaterial);

        clearMaterial.uniforms.uClearColor.value.set(0.0, 0.0, 0.0);
        blit(sim.fbo.ripples.read, clearMaterial);
        blit(sim.fbo.ripples.write, clearMaterial);
        
        if (quality.particleResolution > 0) {
            clearMaterial.uniforms.uClearColor.value.set(0.0, 0.0, 999, 999);
            blit(sim.fbo.particles.read, clearMaterial);
            blit(sim.fbo.particles.write, clearMaterial);
        }

        clearMaterial.uniforms.uUseClearColor.value = false;

        const update = () => {
            const now = Date.now();
            const dt = Math.min((now - sim.lastTime) / 1000, 0.0166);
            sim.lastTime = now;
            if (!sim.renderer) return;
            const elapsedTime = (now - sim.startTime) / 1000;
            
            sim.renderer.setViewport(0, 0, quality.simResolution, sim.simHeight);

            const advectionMaterial = sim.materials.advection as THREE.ShaderMaterial;
            advectionMaterial.uniforms.uDt.value = dt;
            advectionMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            
            advectionMaterial.uniforms.uSource.value = sim.fbo.velocity.read.texture;
            advectionMaterial.uniforms.uDissipation.value = sim.config.velocityDissipation;
            blit(sim.fbo.velocity.write, advectionMaterial);
            sim.fbo.velocity.swap();
            
            advectionMaterial.uniforms.uSource.value = sim.fbo.density.read.texture;
            advectionMaterial.uniforms.uDissipation.value = sim.config.densityDissipation;
            blit(sim.fbo.density.write, advectionMaterial);
            sim.fbo.density.swap();

            advectionMaterial.uniforms.uSource.value = sim.fbo.temperature.read.texture;
            advectionMaterial.uniforms.uDissipation.value = sim.config.temperatureDissipation;
            blit(sim.fbo.temperature.write, advectionMaterial);
            sim.fbo.temperature.swap();

            const buoyancyMaterial = sim.materials.buoyancy as THREE.ShaderMaterial;
            buoyancyMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            buoyancyMaterial.uniforms.uTemperature.value = sim.fbo.temperature.read.texture;
            buoyancyMaterial.uniforms.uDt.value = dt;
            blit(sim.fbo.velocity.write, buoyancyMaterial);
            sim.fbo.velocity.swap();

            for (const p of sim.pointers.values()) {
                const { button, dx, dy } = p;

                if (button === 2) { 
                    const eraseMaterial = sim.materials.erase as THREE.ShaderMaterial;
                    eraseMaterial.uniforms.uTarget.value = sim.fbo.density.read.texture;
                    eraseMaterial.uniforms.uCenter.value.set(p.x, p.y);
                    eraseMaterial.uniforms.uRadius.value = paramsRef.current.uWaveSize * 0.8;
                    eraseMaterial.uniforms.uStrength.value = 0.1;
                    blit(sim.fbo.density.write, eraseMaterial);
                    sim.fbo.density.swap();

                    const radialPushMaterial = sim.materials.radialPush as THREE.ShaderMaterial;
                    radialPushMaterial.uniforms.uTarget.value = sim.fbo.velocity.read.texture;
                    radialPushMaterial.uniforms.uCenter.value.set(p.x, p.y);
                    radialPushMaterial.uniforms.uRadius.value = paramsRef.current.uWaveSize * 1.2;
                    radialPushMaterial.uniforms.uStrength.value = 0.2;
                    blit(sim.fbo.velocity.write, radialPushMaterial);
                    sim.fbo.velocity.swap();

                } else if (Math.abs(dx) > 0 || Math.abs(dy) > 0 || button === 0) { 
                    const splatMaterial = sim.materials.splat as THREE.ShaderMaterial;
                    splatMaterial.uniforms.uCenter.value.set(p.x, p.y);
            
                    splatMaterial.uniforms.uTarget.value = sim.fbo.velocity.read.texture;
                    const forceMultiplier = button === 0 ? 2.0 : 1.0;
                    splatMaterial.uniforms.uColor.value.set(dx * 100 * forceMultiplier, dy * 100 * forceMultiplier, 0);
                    blit(sim.fbo.velocity.write, splatMaterial);
                    sim.fbo.velocity.swap();
                    
                    const speed = Math.sqrt(dx * dx + dy * dy);
                    const moveIntensity = Math.pow(Math.min(speed * 30.0, 1.0), 2.0) * forceMultiplier;
                    const clickIntensity = (button === 0) ? 0.15 : 0.0;
                    const intensity = moveIntensity + clickIntensity;

                    splatMaterial.uniforms.uTarget.value = sim.fbo.density.read.texture;
                    splatMaterial.uniforms.uColor.value.set(0, intensity * 0.5, 0);
                    blit(sim.fbo.density.write, splatMaterial);
                    sim.fbo.density.swap();
            
                    splatMaterial.uniforms.uTarget.value = sim.fbo.temperature.read.texture;
                    const splatTemp = paramsRef.current.uSplatTemperature;
                    splatMaterial.uniforms.uColor.value.set(splatTemp * intensity, 0, 0);
                    blit(sim.fbo.temperature.write, splatMaterial);
                    sim.fbo.temperature.swap();

                    if (paramsRef.current.uRippleStrength > 0) {
                        const rippleSplatMaterial = sim.materials.rippleSplat as THREE.ShaderMaterial;
                        rippleSplatMaterial.uniforms.uTarget.value = sim.fbo.ripples.read.texture;
                        rippleSplatMaterial.uniforms.uCenter.value.set(p.x, p.y);
                        
                        const prevX = (p.dx === 0 && p.dy === 0) ? p.x : p.x - p.dx;
                        const prevY = (p.dx === 0 && p.dy === 0) ? p.y : p.y - p.dy;
                        rippleSplatMaterial.uniforms.uPrevCenter.value.set(prevX, prevY);
                        
                        rippleSplatMaterial.uniforms.uRadius.value = paramsRef.current.uWaveSize;
                        
                        const hoverStrength = Math.min(speed * 8.0, 0.4);
                        const clickStrength = button === 0 ? 1.0 : 0;
                        rippleSplatMaterial.uniforms.uStrength.value = hoverStrength + clickStrength;
                        
                        blit(sim.fbo.ripples.write, rippleSplatMaterial);
                        sim.fbo.ripples.swap();
                    }

                    if (quality.particleResolution > 0) {
                        const particleRate = paramsRef.current.uParticleRate;
                        if (particleRate > 0) {
                            const particleSplatMaterial = sim.materials.particleSplat as THREE.ShaderMaterial;
                            const particleIntensity = (speed * particleRate) + (button === 0 ? particleRate * 0.5 : 0.0);
                            particleSplatMaterial.uniforms.uTarget.value = sim.fbo.particles.read.texture;
                            particleSplatMaterial.uniforms.uCenter.value.set(p.x, p.y);
                            particleSplatMaterial.uniforms.uRadius.value = paramsRef.current.uWaveSize;
                            particleSplatMaterial.uniforms.uIntensity.value = particleIntensity;
                            blit(sim.fbo.particles.write, particleSplatMaterial);
                            sim.fbo.particles.swap();
                        }
                    }
                }
                p.dx = 0;
                p.dy = 0;
            };
            
            if (quality.particleResolution > 0) {
                sim.renderer.setViewport(0, 0, quality.particleResolution, quality.particleResolution);
                const particleUpdateMaterial = sim.materials.particleUpdate as THREE.ShaderMaterial;
                particleUpdateMaterial.uniforms.uParticles.value = sim.fbo.particles.read.texture;
                particleUpdateMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
                particleUpdateMaterial.uniforms.uDt.value = dt;
                blit(sim.fbo.particles.write, particleUpdateMaterial);
                sim.fbo.particles.swap();
                sim.renderer.setViewport(0, 0, quality.simResolution, sim.simHeight);
            }


            const reactionDiffusionMaterial = sim.materials.reactionDiffusion as THREE.ShaderMaterial;
            reactionDiffusionMaterial.uniforms.uChemicals.value = sim.fbo.density.read.texture;
            for(let i = 0; i < REACTION_DIFFUSION_ITERATIONS; i++) {
                blit(sim.fbo.density.write, reactionDiffusionMaterial);
                sim.fbo.density.swap();
                reactionDiffusionMaterial.uniforms.uChemicals.value = sim.fbo.density.read.texture;
            }

            const reactionForceMaterial = sim.materials.reactionForce as THREE.ShaderMaterial;
            reactionForceMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            reactionForceMaterial.uniforms.uChemicals.value = sim.fbo.density.read.texture;
            blit(sim.fbo.velocity.write, reactionForceMaterial);
            sim.fbo.velocity.swap();

            (sim.materials.curl as THREE.ShaderMaterial).uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            blit(sim.fbo.curl, sim.materials.curl);

            const vorticityMaterial = sim.materials.vorticity as THREE.ShaderMaterial;
            vorticityMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            vorticityMaterial.uniforms.uCurl.value = sim.fbo.curl.texture;
            vorticityMaterial.uniforms.uDt.value = dt;
            blit(sim.fbo.velocity.write, vorticityMaterial);
            sim.fbo.velocity.swap();

            const surfaceTensionMaterial = sim.materials.surfaceTension as THREE.ShaderMaterial;
            surfaceTensionMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            surfaceTensionMaterial.uniforms.uDensity.value = sim.fbo.density.read.texture;
            surfaceTensionMaterial.uniforms.uDt.value = dt;
            blit(sim.fbo.velocity.write, surfaceTensionMaterial);
            sim.fbo.velocity.swap();

            (sim.materials.divergence as THREE.ShaderMaterial).uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            blit(sim.fbo.divergence, sim.materials.divergence);
            
            const clearMaterial = sim.materials.clear as THREE.ShaderMaterial;
            clearMaterial.uniforms.uTexture.value = sim.fbo.pressure.read.texture;
            clearMaterial.uniforms.uValue.value = 0.0;
            blit(sim.fbo.pressure.write, clearMaterial);
            sim.fbo.pressure.swap();

            const pressureMaterial = sim.materials.pressure as THREE.ShaderMaterial;
            pressureMaterial.uniforms.uDivergence.value = sim.fbo.divergence.texture;
            for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
                pressureMaterial.uniforms.uPressure.value = sim.fbo.pressure.read.texture;
                blit(sim.fbo.pressure.write, pressureMaterial);
                sim.fbo.pressure.swap();
            }

            const gradientSubtractMaterial = sim.materials.gradientSubtract as THREE.ShaderMaterial;
            gradientSubtractMaterial.uniforms.uPressure.value = sim.fbo.pressure.read.texture;
            gradientSubtractMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            blit(sim.fbo.velocity.write, gradientSubtractMaterial);
            sim.fbo.velocity.swap();

            const ripplePropagateMaterial = sim.materials.ripplePropagate as THREE.ShaderMaterial;
            ripplePropagateMaterial.uniforms.uRippleTexture.value = sim.fbo.ripples.read.texture;
            blit(sim.fbo.ripples.write, ripplePropagateMaterial);
            sim.fbo.ripples.swap();

            const flowMapMaterial = sim.materials.flowMap as THREE.ShaderMaterial;
            flowMapMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            flowMapMaterial.uniforms.uFlowMap.value = sim.fbo.flow.read.texture;
            flowMapMaterial.uniforms.uDt.value = dt;
            blit(sim.fbo.flow.write, flowMapMaterial);
            sim.fbo.flow.swap();

            const surfaceDetailMaterial = sim.materials.surfaceDetail as THREE.ShaderMaterial;
            surfaceDetailMaterial.uniforms.uTime.value = elapsedTime;
            surfaceDetailMaterial.uniforms.uDensityTexture.value = sim.fbo.density.read.texture;
            surfaceDetailMaterial.uniforms.uFlowMapTexture.value = sim.fbo.flow.read.texture;
            blit(sim.fbo.detailNormal, surfaceDetailMaterial);

            const causticsMaterial = sim.materials.caustics as THREE.ShaderMaterial;
            causticsMaterial.uniforms.uDensityTexture.value = sim.fbo.density.read.texture;
            blit(sim.fbo.caustics, causticsMaterial);
            
            const { width, height } = sim.renderer.getSize(new THREE.Vector2());
            sim.renderer.setViewport(0, 0, width, height);
            blit(sim.fbo.scene, sim.materials.scene);
            
            const compositingMaterial = sim.materials.compositing as THREE.ShaderMaterial;
            compositingMaterial.uniforms.uSceneTexture.value = sim.fbo.scene.texture;
            compositingMaterial.uniforms.uVelocityTexture.value = sim.fbo.velocity.read.texture;
            compositingMaterial.uniforms.uDensityTexture.value = sim.fbo.density.read.texture;
            compositingMaterial.uniforms.uTemperatureTexture.value = sim.fbo.temperature.read.texture;
            compositingMaterial.uniforms.uReflectionTexture.value = sim.fbo.renderedFrame.read.texture;
            compositingMaterial.uniforms.uDetailNormalTexture.value = sim.fbo.detailNormal.texture;
            compositingMaterial.uniforms.uRippleTexture.value = sim.fbo.ripples.read.texture;
            blit(sim.fbo.composited, compositingMaterial);

            const finalPassMaterial = sim.materials.finalPass as THREE.ShaderMaterial;
            finalPassMaterial.uniforms.uFluidResult.value = sim.fbo.composited.texture;
            finalPassMaterial.uniforms.uSceneTexture.value = sim.fbo.scene.texture;
            finalPassMaterial.uniforms.uDensityTexture.value = sim.fbo.density.read.texture;
            finalPassMaterial.uniforms.uCausticsTexture.value = sim.fbo.caustics.texture;
            blit(sim.fbo.renderedFrame.write, finalPassMaterial);
            
            const copyMaterial = sim.materials.copy as THREE.MeshBasicMaterial;
            copyMaterial.map = sim.fbo.renderedFrame.write.texture;
            blit(null, copyMaterial);
            
            if (quality.particleResolution > 0) {
                (sim.materials.particleRender as THREE.ShaderMaterial).uniforms.uParticles.value = sim.fbo.particles.read.texture;
                renderer.autoClearColor = false;
                renderer.render(sim.particleScene, sim.camera);
                renderer.autoClearColor = true;
            }

            sim.fbo.renderedFrame.swap();
        };

        sim.startTime = sim.lastTime = Date.now();
        sim.pointers = new Map();

        const getPointerPos = (e: PointerEvent) => {
            const rect = (sim.renderer!.domElement as HTMLElement).getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height;
            return { x, y };
        };

        const handlePointerDown = (e: PointerEvent) => {
            const { x, y } = getPointerPos(e);
            const pointer = sim.pointers.get(e.pointerId) || {
                id: e.pointerId,
                x: x, y: y, dx: 0, dy: 0,
                button: e.button,
            };
            pointer.button = e.button;
            pointer.x = x;
            pointer.y = y;
            sim.pointers.set(e.pointerId, pointer);
        };

        const handlePointerUp = (e: PointerEvent) => {
            sim.pointers.delete(e.pointerId);
        };
        
        const handlePointerMove = (e: PointerEvent) => {
            if (e.buttons === 0 && !e.isPrimary) return;

            const { x, y } = getPointerPos(e);
            let pointer = sim.pointers.get(e.pointerId);

            if (!pointer) {
                handlePointerDown(e);
                pointer = sim.pointers.get(e.pointerId);
            }
            
            if (pointer) {
                pointer.dx = x - pointer.x;
                pointer.dy = y - pointer.y;
                pointer.x = x;
                pointer.y = y;
                if(e.buttons === 0) {
                    pointer.button = -1;
                }
            }
        };
        
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
        window.addEventListener('pointerleave', handlePointerUp);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('contextmenu', e => e.preventDefault());

        let animationFrameId: number;
        const animate = () => {
            update();
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current || !sim.renderer) return;
            const { clientWidth, clientHeight } = mountRef.current;
            renderer.setSize(clientWidth, clientHeight);
            (sim.materials.splat as THREE.ShaderMaterial).uniforms.uAspectRatio.value = clientWidth / clientHeight;
            (sim.materials.erase as THREE.ShaderMaterial).uniforms.uAspectRatio.value = clientWidth / clientHeight;
            (sim.materials.radialPush as THREE.ShaderMaterial).uniforms.uAspectRatio.value = clientWidth / clientHeight;
            (sim.materials.rippleSplat as THREE.ShaderMaterial).uniforms.uAspectRatio.value = clientWidth / clientHeight;
            sim.fbo.scene.setSize(clientWidth, clientHeight);
            sim.fbo.composited.setSize(clientWidth, clientHeight);
            sim.fbo.renderedFrame.read.setSize(clientWidth, clientHeight);
            sim.fbo.renderedFrame.write.setSize(clientWidth, clientHeight);
            const newTextCanvas = createTextCanvas(clientWidth, clientHeight, backgroundColor, textColor);
            const newSceneTexture = new THREE.CanvasTexture(newTextCanvas);
            newSceneTexture.colorSpace = THREE.SRGBColorSpace;
            const sceneMaterial = sim.materials.scene as THREE.MeshBasicMaterial;
            sceneMaterial.map?.dispose();
            sceneMaterial.map = newSceneTexture;
        };
        window.addEventListener('resize', handleResize);
        
         const allMaterials = [
            sim.materials.compositing, sim.materials.finalPass, sim.materials.reactionDiffusion,
            sim.materials.reactionForce, sim.materials.vorticity, sim.materials.surfaceTension,
            sim.materials.splat, sim.materials.buoyancy, sim.materials.particleRender,
            sim.materials.particleUpdate, sim.materials.flowMap, sim.materials.ripplePropagate
        ];

        Object.entries(params).forEach(([key, value]) => {
            allMaterials.forEach(mat => {
                if (mat && (mat as THREE.ShaderMaterial).uniforms && (mat as THREE.ShaderMaterial).uniforms[key]) {
                    const uniform = (mat as THREE.ShaderMaterial).uniforms[key];
                    if (isColor(key, value)) {
                         if (uniform.value instanceof THREE.Color) {
                            uniform.value.set(value);
                        }
                    } else {
                        uniform.value = value;
                    }
                }
            });
            if (sim.materials.splat && key === 'uWaveSize') {
                ((sim.materials.splat as THREE.ShaderMaterial).uniforms.uRadius as any).value = value;
            }
        });


        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            window.removeEventListener('pointerleave', handlePointerUp);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('contextmenu', e => e.preventDefault());
            Object.values(sim.materials).forEach(material => { if (material) material.dispose(); });
            Object.values(sim.fbo).forEach(fbo => {
                if (fbo.read) fbo.read.dispose();
                if (fbo.write) fbo.write.dispose();
                if (fbo.dispose && typeof fbo.dispose === 'function') fbo.dispose();
            });
            (sim.materials.scene as THREE.MeshBasicMaterial).map?.dispose();
            renderer.dispose();
            if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};

// --- FLUID EFFECT COMPONENT ---
interface FluidEffectProps {
    params: AllParams;
    quality: QualitySettings;
    backgroundColor: string;
    textColor: string;
}

const FluidEffect: React.FC<FluidEffectProps> = ({ params, quality, backgroundColor, textColor }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    useFluidSimulation(mountRef, params, quality, backgroundColor, textColor);

    return <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} aria-hidden="true" />;
};

// --- MAIN COMPONENT ---
const clonePresetParams = (preset: Version): AllParams => {
    const clonedUniforms = { ...preset.uniforms };
    (Object.keys(clonedUniforms) as Array<keyof Uniforms>).forEach(key => {
        const value = clonedUniforms[key];
        if (value instanceof THREE.Vector3) {
            (clonedUniforms[key] as any) = value.clone();
        }
    });
    return { ...clonedUniforms, ...preset.simParams };
};

// FIX: The paramConfig object was incomplete, causing a syntax error.
// The object has been completed with all necessary properties and controls.
const paramConfig = {
    coreEngine: {
        title: 'Core Engine',
        controls: {
             waveDecay: { label: 'Wave Decay', description: "How much motion is preserved each frame. High values create long-lasting waves.", min: 0.8, max: 1, step: 0.001 },
        }
    },
    enginePhysics: {
        title: 'Engine Physics',
        controls: {
            uSurfaceTension: { label: 'Surface Tension', description: "How 'tight' the water surface is. High values make it bead up like mercury.", min: 0, max: 2, step: 0.01 },
            uBuoyancy: { label: 'Buoyancy Force', description: "Makes hot fluid rise. Creates a lava lamp effect.", min: 0, max: 2, step: 0.01 },
            uSplatTemperature: { label: 'Splat Temperature', description: "How hot or cold your touch is. Hot splats rise, cold ones sink.", min: -1.0, max: 1.0, step: 0.01 },
            uAmbientTemperature: { label: 'Ambient Temperature', description: "The base temperature of the fluid. Affects buoyancy.", min: 0.0, max: 1.0, step: 0.01 },
            uVorticity: { label: 'Vorticity', description: "How much the fluid swirls and creates whirlpools.", min: 0, max: 50, step: 0.1 },
            uReactionForce: { label: 'Reaction Force', description: "Creates patterns like animal spots (works with Feed/Kill rates).", min: 0, max: 2, step: 0.01 },
            uFeedRate: { label: 'Feed Rate', description: "Part of a chemical reaction that creates complex patterns.", min: 0.0, max: 0.1, step: 0.001 },
            uKillRate: { label: 'Kill Rate', description: "The other part of the chemical reaction. Balances the Feed Rate.", min: 0.0, max: 0.1, step: 0.001 },
        }
    },
    waveShape: {
        title: 'Wave Shape & Contrast',
        controls: {
            uChiselStrength: { label: 'Chisel Strength', description: "Adds shadows and depth, making the fluid look carved.", min: 0, max: 5, step: 0.01 },
            uWaveSize: { label: 'Wave Size', description: "The size of the splash you make when you touch the fluid.", min: 0.01, max: 0.3, step: 0.001 },
            uWaveSteepness: { label: 'Wave Steepness', description: "How tall and sharp the main fluid waves are.", min: 0.01, max: 0.2, step: 0.001 },
            uWaveComplexity: { label: 'Wave Complexity', description: "Adds bigger, slower swirls to the fluid's movement.", min: 0, max: 0.5, step: 0.001 },
            uWaveDetail: { label: 'Wave Detail', description: "Adds tiny, fast wiggles to the main waves.", min: 0, max: 0.1, step: 0.001 },
            uBorderThickness: { label: 'Border Thickness', description: "Creates a dark edge around the fluid, like an outline.", min: 0, max: 0.5, step: 0.001 },
        }
    },
    rippleSystem: {
        title: 'Ripple System',
        controls: {
            uRippleStrength: { label: 'Ripple Strength', description: "How big and powerful the ripples are when you touch the surface.", min: 0, max: 2, step: 0.01 },
            uRippleSpeed: { label: 'Ripple Speed', description: "How fast the ripples travel across the water.", min: 0, max: 1.5, step: 0.01 },
            uRippleDamping: { label: 'Ripple Damping', description: "How quickly the ripples fade away. Low values mean long-lasting waves.", min: 0.9, max: 1.0, step: 0.001 },
        }
    },
    surfaceDetail: {
        title: 'Surface Detail',
        controls: {
            uSurfaceDetailStrength: { label: 'Detail Strength', description: "The intensity of the tiny, shimmering details on the surface.", min: 0, max: 1, step: 0.01 },
            uFlowSpeed: { label: 'Flow Speed', description: "How much the tiny details follow the flow of the main fluid.", min: 0, max: 2, step: 0.01 },
        }
    },
    reflections: {
        title: 'Screen-Space Reflections',
        controls: {
            uSSR_Strength: { label: 'Reflection Strength', description: "How strong the mirror-like reflections are on the fluid's surface.", min: 0, max: 3, step: 0.01 },
            uSSR_Falloff: { label: 'Reflection Falloff', description: "How quickly reflections fade as they get further away.", min: 0, max: 5, step: 0.1 },
            uSSR_Samples: { label: 'Reflection Samples', description: "Quality of reflections. Higher is better but costs more performance.", min: 0, max: 30, step: 1 },
        }
    },
    caustics: {
        title: 'Caustics',
        controls: {
            uCausticsIntensity: { label: 'Caustics Intensity', description: "The brightness of the shimmering light patterns on the background.", min: 0, max: 5, step: 0.1 },
        }
    },
    particles: {
        title: 'Particles',
        controls: {
            uParticleRate: { label: 'Particle Rate', description: "How many sparkly particles are created when you move.", min: 0, max: 2, step: 0.01 },
            uParticleSize: { label: 'Particle Size', description: "The maximum size of the sparkly particles.", min: 0, max: 10, step: 0.1 },
            uParticleAdvection: { label: 'Particle Flow', description: "How much particles follow the fluid's current.", min: 0, max: 1, step: 0.01 },
        }
    },
    visualAppearance: {
        title: 'Material',
        controls: {
            uArtisticBlend: { label: 'Artistic Blend', description: "Blends between a realistic look and a more stylized, inky one.", min: 0, max: 1, step: 0.01 },
            uDisplacementScale: { label: 'Refraction', description: "How much the fluid distorts the background, like a magnifying glass.", min: 0, max: 0.2, step: 0.001 },
            uVelocityShiftScale: { label: 'Velocity RGB Shift', description: "Creates a cool 'chromatic aberration' effect based on speed.", min: 0, max: 0.05, step: 0.0001 },
            uDensityShiftScale: { label: 'Density RGB Shift', description: "Creates a similar RGB split effect based on how thick the fluid is.", min: 0, max: 0.1, step: 0.0001 },
            uVolumeFactor: { label: 'Volume', description: "How thick and opaque the fluid is. Higher values absorb more light.", min: 0, max: 1, step: 0.01 },
            uInkStrength: { label: 'Ink Strength', description: "The overall intensity of all visual effects.", min: 0, max: 5, step: 0.05 },
            uShininess: { label: 'Shininess', description: "How sharp and focused light reflections are. Like polished vs. matte.", min: 1, max: 1024, step: 1 },
            uFresnelIntensity: { label: 'Fresnel Intensity', description: "How reflective the edges of the fluid are.", min: 0, max: 5, step: 0.1 },
            uGlowPower: { label: 'Glow Power', description: "How bright the glowing parts of the fluid are.", min: 0, max: 10, step: 0.1 },
        }
    },
    propertyFade: {
        title: 'Property Fade',
        controls: {
            densityDissipation: { label: 'Density Fade', description: "How quickly the 'ink' or color fades away.", min: 0.8, max: 1, step: 0.001 },
            temperatureDissipation: { label: 'Temperature Fade', description: "How quickly the fluid cools down to its base temperature.", min: 0.8, max: 1, step: 0.001 },
        }
    },
};

// FIX: The main component was missing. Added the MergedFluidSimulation component.
const MergedFluidSimulation: React.FC = () => {
    const getInitialQuality = (): QualitySettings => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            return { simResolution: 128, particleResolution: 128, enableSsr: false };
        }
        return { simResolution: 256, particleResolution: 256, enableSsr: true };
    };

    const [activePreset, setActivePreset] = useState<string>(versions[0].name);
    const [quality, setQuality] = useState<QualitySettings>(getInitialQuality);
    const [backgroundColor, setBackgroundColor] = useState('#000000');
    const [textColor, setTextColor] = useState('#FFFFFF');

    const [params, setParams] = useState<AllParams>(() => {
        const preset = versions.find(v => v.name === activePreset) || versions[0];
        return clonePresetParams(preset);
    });

    const guiRef = useRef<GUI | null>(null);
    const controllersRef = useRef<Record<string, any>>({});

    const handleSetParams = useCallback((key: keyof AllParams, value: any) => {
        setParams(prev => {
            if (value instanceof THREE.Vector3) {
                return { ...prev, [key]: value.clone() };
            }
            return { ...prev, [key]: value };
        });
        setActivePreset('Custom');
    }, []);

    const handleSetQuality = useCallback(<K extends keyof QualitySettings>(key: K, value: QualitySettings[K]) => {
        setQuality(prev => ({ ...prev, [key]: value }));
        setActivePreset('Custom');
    }, []);

    const handleSelectPreset = useCallback((name: string) => {
        const preset = versions.find(v => v.name === name);
        if (preset) {
            setParams(clonePresetParams(preset));
            setActivePreset(preset.name);
            const presetHasSsr = preset.uniforms.uSSR_Strength > 0 && preset.uniforms.uSSR_Samples > 0;
            setQuality(q => ({ ...q, enableSsr: presetHasSsr }));
        }
    }, []);

    const handleExportPreset = () => {
        const simParamKeys = ['waveDecay', 'densityDissipation', 'temperatureDissipation'];
        const preset = { name: "Custom Preset", uniforms: {} as Record<string, any>, simParams: {} as Record<string, any> };
        for (const [key, value] of Object.entries(params)) {
            if (simParamKeys.includes(key)) {
                preset.simParams[key] = value;
            } else if (value instanceof THREE.Vector3) {
                preset.uniforms[key] = { x: value.x, y: value.y, z: value.z };
            } else {
                preset.uniforms[key] = value;
            }
        }
        const jsonString = JSON.stringify(preset, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'custom-fluid-preset.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Effect for initializing the GUI
    useEffect(() => {
        const gui = new GUI();
        gui.title("Fluid Controls");
        guiRef.current = gui;
        const ctrls = controllersRef.current;

        ctrls.preset = gui.add({ preset: activePreset }, 'preset', versions.map(v => v.name))
            .name('Presets')
            .onChange(handleSelectPreset);

        const customizeFolder = gui.addFolder('Customize');
        customizeFolder.close();

        const backgroundFolder = customizeFolder.addFolder('Background');
        ctrls.backgroundColor = backgroundFolder.addColor({ color: backgroundColor }, 'color').name('Background Color').onChange(setBackgroundColor);
        ctrls.textColor = backgroundFolder.addColor({ color: textColor }, 'color').name('Text Color').onChange(setTextColor);

        const qualityFolder = customizeFolder.addFolder('Performance & Quality');
        ctrls.simResolution = qualityFolder.add(quality, 'simResolution', { 'Low (128)': 128, 'Medium (256)': 256, 'High (512)': 512 }).name('Simulation Resolution').onChange(v => handleSetQuality('simResolution', Number(v)));
        ctrls.particleResolution = qualityFolder.add(quality, 'particleResolution', { 'Off': 0, 'Low (128x128)': 128, 'Medium (256x256)': 256, 'High (512x512)': 512 }).name('Particle Count').onChange(v => handleSetQuality('particleResolution', Number(v)));
        ctrls.enableSsr = qualityFolder.add(quality, 'enableSsr').name('Screen-Space Reflections').onChange(v => handleSetQuality('enableSsr', v));

        Object.values(paramConfig).forEach(group => {
            const folder = customizeFolder.addFolder(group.title);
            Object.entries(group.controls).forEach(([key, config]) => {
                const paramKey = key as keyof AllParams;
                ctrls[paramKey] = folder.add(params, paramKey, config.min, config.max, config.step)
                    .name(config.label)
                    .onChange(value => handleSetParams(paramKey, value));
            });
            if (group.title === 'Particles') {
                 ctrls.uParticleColor = folder.addColor(params, 'uParticleColor').name('Particle Color').onChange(v => handleSetParams('uParticleColor', v));
            }
        });

        const lightingFolder = customizeFolder.addFolder('Lighting');
        const light1Folder = lightingFolder.addFolder('Light 1');
        ctrls.uLight1PosX = light1Folder.add(params.uLight1Pos, 'x', -1, 2, 0.01).name('Position X').onChange(v => handleSetParams('uLight1Pos', new THREE.Vector3(v, params.uLight1Pos.y, params.uLight1Pos.z)));
        ctrls.uLight1PosY = light1Folder.add(params.uLight1Pos, 'y', -1, 2, 0.01).name('Position Y').onChange(v => handleSetParams('uLight1Pos', new THREE.Vector3(params.uLight1Pos.x, v, params.uLight1Pos.z)));
        ctrls.uLight1PosZ = light1Folder.add(params.uLight1Pos, 'z', 0.1, 2, 0.01).name('Position Z').onChange(v => handleSetParams('uLight1Pos', new THREE.Vector3(params.uLight1Pos.x, params.uLight1Pos.y, v)));
        ctrls.uLight1Color = light1Folder.addColor(params, 'uLight1Color').name('Color').onChange(v => handleSetParams('uLight1Color', v));

        const light2Folder = lightingFolder.addFolder('Light 2');
        ctrls.uLight2PosX = light2Folder.add(params.uLight2Pos, 'x', -1, 2, 0.01).name('Position X').onChange(v => handleSetParams('uLight2Pos', new THREE.Vector3(v, params.uLight2Pos.y, params.uLight2Pos.z)));
        ctrls.uLight2PosY = light2Folder.add(params.uLight2Pos, 'y', -1, 2, 0.01).name('Position Y').onChange(v => handleSetParams('uLight2Pos', new THREE.Vector3(params.uLight2Pos.x, v, params.uLight2Pos.z)));
        ctrls.uLight2PosZ = light2Folder.add(params.uLight2Pos, 'z', 0.1, 2, 0.01).name('Position Z').onChange(v => handleSetParams('uLight2Pos', new THREE.Vector3(params.uLight2Pos.x, params.uLight2Pos.y, v)));
        ctrls.uLight2Color = light2Folder.addColor(params, 'uLight2Color').name('Color').onChange(v => handleSetParams('uLight2Color', v));

        const colorsFolder = customizeFolder.addFolder('Colors');
        ctrls.uWaterColor = colorsFolder.addColor(params, 'uWaterColor').name('Water Color').onChange(v => handleSetParams('uWaterColor', v));
        ctrls.uInkColor = colorsFolder.addColor(params, 'uInkColor').name('Ink Color').onChange(v => handleSetParams('uInkColor', v));
        ctrls.uBorderColor = colorsFolder.addColor(params, 'uBorderColor').name('Border Color').onChange(v => handleSetParams('uBorderColor', v));
        ctrls.uFresnelColor = colorsFolder.addColor(params, 'uFresnelColor').name('Fresnel Color').onChange(v => handleSetParams('uFresnelColor', v));
        ctrls.uGlowColor = colorsFolder.addColor(params, 'uGlowColor').name('Glow Color').onChange(v => handleSetParams('uGlowColor', v));

        gui.add({ export: handleExportPreset }, 'export').name('Export Custom Preset');

        return () => {
            gui.destroy();
            controllersRef.current = {};
        };
    }, [handleSelectPreset, handleSetParams, handleSetQuality]); // Rebuild GUI if handlers change

    // Effect for synchronizing React state -> GUI
    useEffect(() => {
        const ctrls = controllersRef.current;
        if (!guiRef.current || !Object.keys(ctrls).length) return;

        // Update controllers without triggering their onChange events
        Object.values(ctrls).forEach(c => c.listen(false));

        ctrls.preset.setValue(activePreset);
        ctrls.backgroundColor.setValue(backgroundColor);
        ctrls.textColor.setValue(textColor);

        Object.keys(quality).forEach(k => {
            const key = k as keyof QualitySettings;
            if (ctrls[key]) ctrls[key].setValue(quality[key]);
        });

        Object.keys(params).forEach(k => {
            const key = k as keyof AllParams;
            const value = params[key];
            if (value instanceof THREE.Vector3) {
                if (ctrls[key + 'X']) ctrls[key + 'X'].setValue(value.x);
                if (ctrls[key + 'Y']) ctrls[key + 'Y'].setValue(value.y);
                if (ctrls[key + 'Z']) ctrls[key + 'Z'].setValue(value.z);
            } else if (ctrls[key]) {
                ctrls[key].setValue(value);
            }
        });

        Object.values(ctrls).forEach(c => c.listen(true));
        // FIX: The `lil-gui` GUI instance does not have an `updateDisplay` method.
        // Calling `setValue()` on each controller is sufficient to update the display.
    }, [params, quality, activePreset, backgroundColor, textColor]);

    return (
        <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <FluidEffect
                params={params}
                quality={quality}
                backgroundColor={backgroundColor}
                textColor={textColor}
            />
        </main>
    );
};

// FIX: The component was missing a default export.
export default MergedFluidSimulation;
