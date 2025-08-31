
import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

// --- TYPES ---
interface Uniforms {
    uArtisticBlend: number;
    uDisplacementScale: number;
    uVelocityShiftScale: number;
    uDensityShiftScale: number;
    uWaterColor: THREE.Color;
    uInkColor: THREE.Color;
    uVolumeFactor: number;
    uInkStrength: number;
    uShininess: number;
    uFresnelColor: THREE.Color;
    uFresnelIntensity: number;
    uGlowColor: THREE.Color;
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
    uBorderColor: THREE.Color;
    uSurfaceTension: number;
    uChiselStrength: number;
    uSSR_Strength: number;
    uSSR_Falloff: number;
    uSSR_Samples: number;
    uParticleRate: number;
    uParticleSize: number;
    uParticleAdvection: number;
    uParticleColor: THREE.Color;
    uCausticsIntensity: number;
    uLightDepth: number;
    uSurfaceDetailStrength: number;
    uFlowSpeed: number;
    uRippleStrength: number;
    uRippleDamping: number;
    uRippleSpeed: number;
    uLight1Pos: THREE.Vector3;
    uLight1Color: THREE.Color;
    uLight2Pos: THREE.Vector3;
    uLight2Color: THREE.Color;
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
        uWaterColor: new THREE.Color("#4d4d4d"),
        uInkColor: new THREE.Color("#1b3b64"),
        uVolumeFactor: 0.84,
        uInkStrength: 0.6,
        uShininess: 308,
        uFresnelColor: new THREE.Color("#000000"),
        uFresnelIntensity: 1.7,
        uGlowColor: new THREE.Color("#f2f2f2"),
        uGlowPower: 9.5,
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
        uBorderColor: new THREE.Color("#fffafa"),
        uSurfaceTension: 0.1,
        uChiselStrength: 1.28,
        uSSR_Strength: 0.43,
        uSSR_Falloff: 0.8,
        uSSR_Samples: 4,
        uParticleRate: 0.56,
        uParticleSize: 1,
        uParticleAdvection: 0,
        uParticleColor: new THREE.Color("#ffffff"),
        uCausticsIntensity: 0.6,
        uLightDepth: 0.5,
        uSurfaceDetailStrength: 0,
        uFlowSpeed: 0,
        uRippleStrength: 0.22,
        uRippleDamping: 0.906,
        uRippleSpeed: 0.1,
        uLight1Pos: new THREE.Vector3(-0.78, 0.5, 0.5),
        uLight1Color: new THREE.Color("#ffffff"),
        uLight2Pos: new THREE.Vector3(-0.53, 0.5, 0.65),
        uLight2Color: new THREE.Color("#b1b1c3"),
    },
    simParams: {
        waveDecay: 0.977,
        densityDissipation: 0.939,
        temperatureDissipation: 0.858,
    }
};

const luminousGel: Version = {
    name: 'Luminous Gel',
    uniforms: {
        uArtisticBlend: 1,
        uDisplacementScale: 0.04,
        uVelocityShiftScale: 0.003,
        uDensityShiftScale: 0.005,
        uWaterColor: new THREE.Color("#33194c"),
        uInkColor: new THREE.Color("#ccb2ff"),
        uVolumeFactor: 0.9,
        uInkStrength: 1.8,
        uShininess: 150,
        uFresnelColor: new THREE.Color("#373120"),
        uFresnelIntensity: 1.5,
        uGlowColor: new THREE.Color("#99ccff"),
        uGlowPower: 2.2,
        uInkGeneration: 0.1,
        uWaveSize: 0.117,
        uWaveSteepness: 0.01,
        uWaveComplexity: 0,
        uWaveDetail: 0,
        uFeedRate: 0.011,
        uKillRate: 0.02,
        uVorticity: 0,
        uReactionForce: 0,
        uBuoyancy: 0,
        uAmbientTemperature: 0.03,
        uSplatTemperature: -0.22,
        uBorderThickness: 0,
        uBorderColor: new THREE.Color("#000000"),
        uSurfaceTension: 1,
        uChiselStrength: 3.5,
        uSSR_Strength: 0.57,
        uSSR_Falloff: 0.2,
        uSSR_Samples: 0,
        uParticleRate: 0.46,
        uParticleSize: 2,
        uParticleAdvection: 0.2,
        uParticleColor: new THREE.Color("#ffffff"),
        uCausticsIntensity: 0.1,
        uLightDepth: 0.3,
        uSurfaceDetailStrength: 0,
        uFlowSpeed: 1,
        uRippleStrength: 0,
        uRippleDamping: 0.9,
        uRippleSpeed: 0,
        uLight1Pos: new THREE.Vector3(0.7, 0.7, 0.4),
        uLight1Color: new THREE.Color("#090118"),
        uLight2Pos: new THREE.Vector3(0.3, 0.3, 0.6),
        uLight2Color: new THREE.Color("#99ccff")
    },
    simParams: {
        waveDecay: 1,
        densityDissipation: 0.98,
        temperatureDissipation: 0.98
    }
};

const liquidBubble: Version = {
    name: 'Liquid Bubble',
    uniforms: {
        uArtisticBlend: 0,
        uDisplacementScale: 0.066,
        uVelocityShiftScale: 0.001,
        uDensityShiftScale: 0.001,
        uWaterColor: new THREE.Color("#5a79dd"),
        uInkColor: new THREE.Color("#66aaff"),
        uVolumeFactor: 0.72,
        uInkStrength: 3.6,
        uShininess: 700.0,
        uFresnelColor: new THREE.Color("#000000"),
        uFresnelIntensity: 2.8,
        uGlowColor: new THREE.Color("#cce5ff"),
        uGlowPower: 4.3,
        uInkGeneration: 0.1,
        uWaveSize: 0.156,
        uWaveSteepness: 0.182,
        uWaveComplexity: 0.015,
        uWaveDetail: 0.036,
        uFeedRate: 0.017,
        uKillRate: 0.043,
        uVorticity: 0,
        uReactionForce: 0,
        uBuoyancy: 0.07,
        uAmbientTemperature: 0.14,
        uSplatTemperature: 0,
        uBorderThickness: 0,
        uBorderColor: new THREE.Color("#5153c2"),
        uSurfaceTension: 0.36,
        uChiselStrength: 3.56,
        uSSR_Strength: 0.8,
        uSSR_Falloff: 0.8,
        uSSR_Samples: 1,
        uParticleRate: 0.44,
        uParticleSize: 1.5,
        uParticleAdvection: 0.6,
        uParticleColor: new THREE.Color("#aaddff"),
        uCausticsIntensity: 0.5,
        uLightDepth: 0.7,
        uSurfaceDetailStrength: 0.04,
        uFlowSpeed: 0,
        uRippleStrength: 0.04,
        uRippleDamping: 0.912,
        uRippleSpeed: 0,
        uLight1Pos: new THREE.Vector3(0.8, 1.0, 0.6),
        uLight1Color: new THREE.Color("#ffffff"),
        uLight2Pos: new THREE.Vector3(-0.5, -0.2, 0.4),
        uLight2Color: new THREE.Color("#223366"),
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
        uArtisticBlend: 0.0,
        uDisplacementScale: 0.139,
        uVelocityShiftScale: 0.0045,
        uDensityShiftScale: 0.002,
        uWaterColor: new THREE.Color(0.7, 0.85, 0.95),
        uInkColor: new THREE.Color(0.8, 0.9, 1.0),
        uVolumeFactor: 0.34,
        uInkStrength: 1.0,
        uShininess: 599.0,
        uFresnelColor: new THREE.Color(1.0, 1.0, 1.0),
        uFresnelIntensity: 3.3,
        uGlowColor: new THREE.Color(0.8, 0.9, 1.0),
        uGlowPower: 7.3,
        uInkGeneration: 0.05,
        uWaveSize: 0.095,
        uWaveSteepness: 0.129,
        uWaveComplexity: 0.054,
        uWaveDetail: 0.008,
        uFeedRate: 0.029,
        uKillRate: 0.047,
        uVorticity: 0.1,
        uReactionForce: 0.22,
        uBuoyancy: 0.0,
        uAmbientTemperature: 0.13,
        uSplatTemperature: 0.0,
        uBorderThickness: 0.019,
        uBorderColor: new THREE.Color('#A8C8D6'),
        uSurfaceTension: 0.11,
        uChiselStrength: 4.56,
        uSSR_Strength: 0.12,
        uSSR_Falloff: 0.9,
        uSSR_Samples: 7,
        uParticleRate: 0.78,
        uParticleSize: 4.7,
        uParticleAdvection: 0.2,
        uParticleColor: new THREE.Color(1.0, 1.0, 1.0),
        uCausticsIntensity: 4.1,
        uLightDepth: 0.7,
        uSurfaceDetailStrength: 0.0,
        uFlowSpeed: 5.0,
        uRippleStrength: 0.8,
        uRippleDamping: 0.985,
        uRippleSpeed: 0.6,
        uLight1Pos: new THREE.Vector3(0.9, 0.9, 0.5),
        uLight1Color: new THREE.Color(1.0, 1.0, 1.0),
        uLight2Pos: new THREE.Vector3(0.1, 0.1, 0.5),
        uLight2Color: new THREE.Color(0.2, 0.5, 1.0),
    },
    simParams: { waveDecay: 0.992, densityDissipation: 0.937, temperatureDissipation: 0.98 }
};

const crystalClear: Version = {
    name: 'Crystal Clear',
    uniforms: {
        uArtisticBlend: 0.0,
        uDisplacementScale: 0.058,
        uVelocityShiftScale: 0.001,
        uDensityShiftScale: 0.0059,
        uWaterColor: new THREE.Color(0.6, 0.8, 0.9),
        uInkColor: new THREE.Color(0.8, 0.9, 1.0),
        uVolumeFactor: 0.81,
        uInkStrength: 0.55,
        uShininess: 92.0,
        uFresnelColor: new THREE.Color(1.0, 1.0, 1.0),
        uFresnelIntensity: 2.1,
        uGlowColor: new THREE.Color(0.8, 0.9, 1.0),
        uGlowPower: 1.8,
        uInkGeneration: 0.02,
        uWaveSize: 0.12,
        uWaveSteepness: 0.08,
        uWaveComplexity: 0.028,
        uWaveDetail: 0.033,
        uFeedRate: 0.017,
        uKillRate: 0.036,
        uVorticity: 0.0,
        uReactionForce: 0.14,
        uBuoyancy: 0.22,
        uAmbientTemperature: 0.0,
        uSplatTemperature: 0.0,
        uBorderThickness: 0.05,
        uBorderColor: new THREE.Color(0.1, 0.1, 0.1),
        uSurfaceTension: 0.06,
        uChiselStrength: 3.0,
        uSSR_Strength: 0.0,
        uSSR_Falloff: 2.8,
        uSSR_Samples: 0,
        uParticleRate: 0.0,
        uParticleSize: 2.0,
        uParticleAdvection: 0.2,
        uParticleColor: new THREE.Color(1.0, 1.0, 1.0),
        uCausticsIntensity: 0.1,
        uLightDepth: 0.6,
        uSurfaceDetailStrength: 0.04,
        uFlowSpeed: 0.9,
        uRippleStrength: 1.0,
        uRippleDamping: 0.98,
        uRippleSpeed: 0.5,
        uLight1Pos: new THREE.Vector3(0.5, 0.5, 0.6),
        uLight1Color: new THREE.Color(0.8, 0.9, 1.0),
        uLight2Pos: new THREE.Vector3(-0.5, -0.5, 0.4),
        uLight2Color: new THREE.Color(0.5, 0.8, 1.0),
    },
    simParams: { waveDecay: 0.856, densityDissipation: 0.927, temperatureDissipation: 0.88 }
};

const pristineWater: Version = {
    name: 'Pristine Water',
    uniforms: {
        uArtisticBlend: 0.0,
        uDisplacementScale: 0.06,
        uVelocityShiftScale: 0.0003,
        uDensityShiftScale: 0.001,
        uWaterColor: new THREE.Color(0.8, 0.9, 1.0),
        uInkColor: new THREE.Color(0.8, 0.9, 1.0),
        uVolumeFactor: 0.96,
        uInkStrength: 0.65,
        uShininess: 773.0,
        uFresnelColor: new THREE.Color(1.0, 1.0, 1.0),
        uFresnelIntensity: 3.4,
        uGlowColor: new THREE.Color(0.8, 0.9, 1.0),
        uGlowPower: 10.0,
        uInkGeneration: 0.05,
        uWaveSize: 0.126,
        uWaveSteepness: 0.1,
        uWaveComplexity: 0.002,
        uWaveDetail: 0.028,
        uFeedRate: 0.0,
        uKillRate: 0.0,
        uVorticity: 2.0,
        uReactionForce: 0.0,
        uBuoyancy: 0.72,
        uAmbientTemperature: 0.12,
        uSplatTemperature: 0.0,
        uBorderThickness: 0.051,
        uBorderColor: new THREE.Color(0.0, 0.0, 0.0),
        uSurfaceTension: 0.18,
        uChiselStrength: 3.5,
        uSSR_Strength: 0.07,
        uSSR_Falloff: 1.2,
        uSSR_Samples: 1,
        uParticleRate: 1.22,
        uParticleSize: 1.0,
        uParticleAdvection: 0.5,
        uParticleColor: new THREE.Color(0.8, 0.9, 1.0),
        uCausticsIntensity: 0.2,
        uLightDepth: 0.8,
        uSurfaceDetailStrength: 0.0,
        uFlowSpeed: 3.0,
        uRippleStrength: 1.2,
        uRippleDamping: 0.98,
        uRippleSpeed: 0.6,
        uLight1Pos: new THREE.Vector3(1.0, 0.94, 0.65),
        uLight1Color: new THREE.Color(1.0, 1.0, 1.0),
        uLight2Pos: new THREE.Vector3(0.2, 0.2, 0.72),
        uLight2Color: new THREE.Color(0.3, 0.6, 1.0),
    },
    simParams: { waveDecay: 0.993, densityDissipation: 0.934, temperatureDissipation: 0.98 }
};

const mercury: Version = {
    name: 'Mercury',
    uniforms: {
        uArtisticBlend: 0.0,
        uDisplacementScale: 0.17,
        uVelocityShiftScale: 0.0005,
        uDensityShiftScale: 0.0171,
        uWaterColor: new THREE.Color(0.15, 0.18, 0.2),
        uInkColor: new THREE.Color(1.0, 1.0, 1.0),
        uVolumeFactor: 0.55,
        uInkStrength: 3.25,
        uShininess: 190.0,
        uFresnelColor: new THREE.Color(0.9, 0.95, 1.0),
        uFresnelIntensity: 4.7,
        uGlowColor: new THREE.Color(0.8, 0.9, 1.0),
        uGlowPower: 4.8,
        uInkGeneration: 0.0,
        uWaveSize: 0.08,
        uWaveSteepness: 0.15,
        uWaveComplexity: 0.116,
        uWaveDetail: 0.031,
        uFeedRate: 0.026,
        uKillRate: 0.053,
        uVorticity: 2.7,
        uReactionForce: 0.91,
        uBuoyancy: 0.77,
        uAmbientTemperature: 0.24,
        uSplatTemperature: 0.0,
        uBorderThickness: 0.0,
        uBorderColor: new THREE.Color(0.0, 0.0, 0.0),
        uSurfaceTension: 0.61,
        uChiselStrength: 3.0,
        uSSR_Strength: 0.17,
        uSSR_Falloff: 1.5,
        uSSR_Samples: 25,
        uParticleRate: 0.0,
        uParticleSize: 2.0,
        uParticleAdvection: 0.2,
        uParticleColor: new THREE.Color(1.0, 1.0, 1.0),
        uCausticsIntensity: 0.0,
        uLightDepth: 0.1,
        uSurfaceDetailStrength: 0.01,
        uFlowSpeed: 5.5,
        uRippleStrength: 0.4,
        uRippleDamping: 0.97,
        uRippleSpeed: 0.2,
        uLight1Pos: new THREE.Vector3(1.0, 1.0, 0.8),
        uLight1Color: new THREE.Color(1.0, 1.0, 1.0),
        uLight2Pos: new THREE.Vector3(-0.5, -0.5, 0.5),
        uLight2Color: new THREE.Color(0.5, 0.5, 0.5),
    },
    simParams: { waveDecay: 0.968, densityDissipation: 0.973, temperatureDissipation: 0.98 }
};

const sora: Version = {
    name: 'Sora',
    uniforms: {
        uArtisticBlend: 0.0,
        uDisplacementScale: 0.055,
        uVelocityShiftScale: 0.0006,
        uDensityShiftScale: 0.0042,
        uWaterColor: new THREE.Color(0.02, 0.0, 0.05),
        uInkColor: new THREE.Color(0.7, 0.4, 1.0),
        uVolumeFactor: 0.67,
        uInkStrength: 1.5,
        uShininess: 615.0,
        uFresnelColor: new THREE.Color(1.0, 0.6, 0.8),
        uFresnelIntensity: 3.5,
        uGlowColor: new THREE.Color(0.8, 0.4, 1.0),
        uGlowPower: 0.6,
        uInkGeneration: 0.05,
        uWaveSize: 0.157,
        uWaveSteepness: 0.119,
        uWaveComplexity: 0.014,
        uWaveDetail: 0.008,
        uFeedRate: 0.023,
        uKillRate: 0.028,
        uVorticity: 0.4,
        uReactionForce: 0.3,
        uBuoyancy: 2.0,
        uAmbientTemperature: 0.28,
        uSplatTemperature: 0.0,
        uBorderThickness: 0.0,
        uBorderColor: new THREE.Color(0.0, 0.0, 0.0),
        uSurfaceTension: 0.84,
        uChiselStrength: 2.97,
        uSSR_Strength: 0.05,
        uSSR_Falloff: 4.3,
        uSSR_Samples: 2,
        uParticleRate: 0.0,
        uParticleSize: 2.0,
        uParticleAdvection: 0.2,
        uParticleColor: new THREE.Color(1.0, 1.0, 1.0),
        uCausticsIntensity: 3.2,
        uLightDepth: 0.4,
        uSurfaceDetailStrength: 0.01,
        uFlowSpeed: 8.0,
        uRippleStrength: 0.7,
        uRippleDamping: 0.98,
        uRippleSpeed: 0.7,
        uLight1Pos: new THREE.Vector3(0.8, 0.2, 0.7),
        uLight1Color: new THREE.Color(0.8, 0.4, 1.0),
        uLight2Pos: new THREE.Vector3(0.2, 0.8, 0.3),
        uLight2Color: new THREE.Color(0.0, 0.0, 0.0),
    },
    simParams: { waveDecay: 0.976, densityDissipation: 0.88, temperatureDissipation: 0.885 }
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
baseVertexShader: `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,

splatShader: `
  varying vec2 vUv;
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
    vec3 base = texture2D(uTarget, vUv).rgb;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`,

advectionShader: `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 uTexelSize;
    uniform float uDt;
    uniform float uDissipation;

    void main() {
        vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexelSize;
        gl_FragColor = uDissipation * texture2D(uSource, coord);
    }
`,

divergenceShader: `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
        float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
        
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`,

clearShader: `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uValue;
    uniform vec3 uClearColor;
    uniform bool uUseClearColor;

    void main () {
        if (uUseClearColor) {
            gl_FragColor = vec4(uClearColor, 1.0);
        } else {
            gl_FragColor = uValue * texture2D(uTexture, vUv);
        }
    }
`,

pressureShader: `
    varying vec2 vUv;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`,

gradientSubtractShader: `
    varying vec2 vUv;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= 0.5 * vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`,

reactionDiffusionShader: `
    varying vec2 vUv;
    uniform sampler2D uChemicals;
    uniform vec2 uTexelSize;
    uniform float uFeedRate;
    uniform float uKillRate;
    
    const float uDu = 0.16;
    const float uDv = 0.08;
    const float uDt = 1.0;

    void main() {
        if (uFeedRate < 0.001 && uKillRate < 0.001) {
            gl_FragColor = texture2D(uChemicals, vUv);
            return;
        }

        vec2 chemical = texture2D(uChemicals, vUv).rg;
        float u = chemical.r;
        float v = chemical.g;

        float lap_u = (
            texture2D(uChemicals, vUv + vec2(0.0, uTexelSize.y)).r +
            texture2D(uChemicals, vUv - vec2(0.0, uTexelSize.y)).r +
            texture2D(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).r +
            texture2D(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).r -
            4.0 * u
        );

        float lap_v = (
            texture2D(uChemicals, vUv + vec2(0.0, uTexelSize.y)).g +
            texture2D(uChemicals, vUv - vec2(0.0, uTexelSize.y)).g +
            texture2D(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).g +
            texture2D(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).g -
            4.0 * v
        );

        float reaction = u * v * v;
        float du_dt = uDu * lap_u - reaction + uFeedRate * (1.0 - u);
        float dv_dt = uDv * lap_v + reaction - (uKillRate + uFeedRate) * v;

        float new_u = u + du_dt * uDt;
        float new_v = v + dv_dt * uDt;

        float old_b = texture2D(uChemicals, vUv).b;
        gl_FragColor = vec4(clamp(new_u, 0.0, 1.0), clamp(new_v, 0.0, 1.0), old_b, 1.0);
    }
`,

curlShader: `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main() {
        float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
        float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
        float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
        
        float curl = 0.5 * ((T - B) - (R - L));
        gl_FragColor = vec4(curl, 0.0, 0.0, 1.0);
    }
`,

vorticityShader: `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float uVorticity;
    uniform float uDt;
    uniform vec2 uTexelSize;

    void main() {
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        if (uVorticity < 0.01) {
            gl_FragColor = vec4(velocity, 0.0, 1.0);
            return;
        }

        float L = texture2D(uCurl, vUv - vec2(uTexelSize.x, 0.0)).r;
        float R = texture2D(uCurl, vUv + vec2(uTexelSize.x, 0.0)).r;
        float B = texture2D(uCurl, vUv - vec2(0.0, uTexelSize.y)).r;
        float T = texture2D(uCurl, vUv + vec2(0.0, uTexelSize.y)).r;
        
        float curl = texture2D(uCurl, vUv).r;
        
        vec2 grad = 0.5 * vec2(R - L, T - B);
        vec2 N = normalize(grad + 0.0001);
        vec2 force = uVorticity * curl * vec2(N.y, -N.x);
        
        velocity += force * uDt;
        
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`,

surfaceTensionShader: `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uDensity;
    uniform float uSurfaceTension;
    uniform float uDt;
    uniform vec2 uTexelSize;

    void main() {
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        if (uSurfaceTension < 0.001) {
            gl_FragColor = vec4(velocity, 0.0, 1.0);
            return;
        }
        
        float density = texture2D(uDensity, vUv).g;
        if (density < 0.01) {
            gl_FragColor = vec4(velocity, 0.0, 1.0);
            return;
        }

        float L = texture2D(uDensity, vUv - vec2(uTexelSize.x, 0.0)).g;
        float R = texture2D(uDensity, vUv + vec2(uTexelSize.x, 0.0)).g;
        float B = texture2D(uDensity, vUv - vec2(0.0, uTexelSize.y)).g;
        float T = texture2D(uDensity, vUv + vec2(0.0, uTexelSize.y)).g;
        
        vec2 grad = 0.5 * vec2(R - L, T - B);
        
        // Calculate curvature (approximated by Laplacian of density)
        float laplacian = (L + R + B + T) - 4.0 * density;

        // Surface tension force is proportional to curvature multiplied by the surface normal.
        // This force pulls the fluid towards the center of curvature, minimizing surface area.
        vec2 force = -uSurfaceTension * laplacian * normalize(grad + 0.0001) * 2.0;
        
        velocity += force * uDt;
        
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`,

reactionForceShader: `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uChemicals;
    uniform float uReactionForce;
    uniform vec2 uTexelSize;

    void main() {
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        if (uReactionForce < 0.001) {
            gl_FragColor = vec4(velocity, 0.0, 1.0);
            return;
        }

        float L = texture2D(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).g;
        float R = texture2D(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).g;
        float B = texture2D(uChemicals, vUv - vec2(0.0, uTexelSize.y)).g;
        float T = texture2D(uChemicals, vUv + vec2(0.0, uTexelSize.y)).g;
        
        vec2 gradV = 0.5 * vec2(R - L, T - B);
        
        gl_FragColor = vec4(velocity - gradV * uReactionForce, 0.0, 1.0);
    }
`,

buoyancyShader: `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uTemperature;
    uniform float uBuoyancy;
    uniform float uAmbientTemperature;
    uniform float uDt;

    void main() {
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        if (uBuoyancy < 0.001) {
            gl_FragColor = vec4(velocity, 0.0, 1.0);
            return;
        }
        float temp = texture2D(uTemperature, vUv).r;
        float force = uBuoyancy * (temp - uAmbientTemperature);
        velocity.y += force * uDt;
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`,

eraseShader: `
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float uAspectRatio;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uStrength;

    void main() {
        vec2 p = vUv - uCenter.xy;
        p.x *= uAspectRatio;
        float intensity = 1.0 - smoothstep(0.0, uRadius, length(p));
        vec4 base = texture2D(uTarget, vUv);
        
        base.rg *= 1.0 - intensity * uStrength;
        
        gl_FragColor = base;
    }
`,

radialPushShader: `
    varying vec2 vUv;
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
            gl_FragColor = texture2D(uTarget, vUv);
            return;
        }

        vec2 direction = normalize(p + 0.0001);
        vec2 pushForce = direction * falloff * uStrength;
        
        vec2 baseVelocity = texture2D(uTarget, vUv).xy;
        gl_FragColor = vec4(baseVelocity + pushForce, 0.0, 1.0);
    }
`,

particleSplatShader: `
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uIntensity;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

    void main() {
        vec4 particle = texture2D(uTarget, vUv);

        // If particle is dead...
        if (particle.b >= particle.a) {
            vec2 p = vUv - uCenter;
            float falloff = 1.0 - smoothstep(0.0, uRadius, length(p));
            
            // ...and we are under the cursor with enough intensity...
            if (falloff > 0.0 && hash(vUv * 999.0) < uIntensity * falloff * 0.2) {
                float lifetime = 2.0 + hash(vUv.yx) * 3.0;
                // Spawn particle at cursor position
                gl_FragColor = vec4(uCenter.x, uCenter.y, 0.0, lifetime);
                return;
            }
        }
        
        gl_FragColor = particle;
    }
`,

particleUpdateShader: `
    varying vec2 vUv;
    uniform sampler2D uParticles; // R,G = pos.x, pos.y; B = age; A = lifetime
    uniform sampler2D uVelocity;
    uniform float uDt;
    uniform float uParticleAdvection;

    void main() {
        vec4 particle = texture2D(uParticles, vUv);

        // If particle is dead, keep it dead
        if (particle.b >= particle.a) {
            gl_FragColor = vec4(0.0, 0.0, particle.a, particle.a);
            return;
        }

        vec2 pos = particle.xy;
        vec2 vel = texture2D(uVelocity, pos).xy;

        pos += vel * uDt * uParticleAdvection; // Advect particle
        
        // Simple periodic boundary conditions
        pos = mod(pos, 1.0);

        float age = particle.b + uDt;
        
        gl_FragColor = vec4(pos, age, particle.a);
    }
`,

particleRenderVS: `
    uniform sampler2D uParticles;
    uniform float uParticleSize;
    attribute vec2 a_uv;
    varying float v_age_ratio;

    void main() {
        vec4 particle = texture2D(uParticles, a_uv);
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

particleRenderFS: `
    uniform vec3 uParticleColor;
    varying float v_age_ratio;

    void main() {
        if (v_age_ratio > 1.0) discard;
        // Use pow for a nicer fade-out curve
        float alpha = pow(1.0 - v_age_ratio, 2.0); 
        
        // With Additive Blending, we just care about the RGB value.
        // We multiply the color by alpha to make it fade out.
        // The final alpha value is set to 1.0 as it's not used by the blend function.
        gl_FragColor = vec4(uParticleColor * alpha, 1.0);
    }
`,

causticsShader: `
    varying vec2 vUv;
    uniform sampler2D uDensityTexture;
    uniform vec2 uTexelSize;
    
    void main() {
        float h = texture2D(uDensityTexture, vUv).g;
        float h_l = texture2D(uDensityTexture, vUv - vec2(uTexelSize.x, 0.0)).g;
        float h_r = texture2D(uDensityTexture, vUv + vec2(uTexelSize.x, 0.0)).g;
        float h_b = texture2D(uDensityTexture, vUv - vec2(0.0, uTexelSize.y)).g;
        float h_t = texture2D(uDensityTexture, vUv + vec2(0.0, uTexelSize.y)).g;
        
        // Use Laplacian to approximate curvature, which focuses or disperses light
        float laplacian = (h_l + h_r + h_b + h_t) - 4.0 * h;
        // Sharper, more intense caustics
        float caustics = clamp(1.0 - laplacian * 200.0, 0.0, 1.0);
        
        float density = texture2D(uDensityTexture, vUv).g;
        
        gl_FragColor = vec4(vec3(pow(caustics, 3.0) * density), 1.0);
    }
`,

flowMapShader: `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uFlowMap;
    uniform float uFlowSpeed;
    uniform float uDt;

    void main() {
        vec2 velocity = texture2D(uVelocity, vUv).xy * 0.1;
        vec2 oldFlow = texture2D(uFlowMap, vUv).xy;
        
        // Mix current velocity into the flow map, and slowly fade the old flow
        // uFlowSpeed acts as a responsiveness factor
        vec2 newFlow = mix(oldFlow, velocity, uDt * uFlowSpeed);

        gl_FragColor = vec4(newFlow, 0.0, 1.0);
    }
`,

surfaceDetailShader: `
    varying vec2 vUv;
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
        float density = texture2D(uDensityTexture, vUv).g;
        if (density < 0.01) {
            gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0); // Neutral normal
            return;
        }
        vec2 flow = texture2D(uFlowMapTexture, vUv).xy * 0.5;
        float flow_mag = length(flow);
        
        // Calculate main wave normal to influence detail direction
        float h_l = texture2D(uDensityTexture, vUv - vec2(uTexelSize.x, 0.0)).g;
        float h_r = texture2D(uDensityTexture, vUv + vec2(uTexelSize.x, 0.0)).g;
        float h_b = texture2D(uDensityTexture, vUv - vec2(0.0, uTexelSize.y)).g;
        float h_t = texture2D(uDensityTexture, vUv + vec2(0.0, uTexelSize.y)).g;
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
        
        gl_FragColor = vec4(mix(vec2(0.5), normal.xy * 0.5 + 0.5, strength), 1.0, 1.0);
    }
`,

rippleSplatShader: `
    varying vec2 vUv;
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


        vec2 base = texture2D(uTarget, vUv).rg;
        base.r += intensity;
        gl_FragColor = vec4(base, 0.0, 1.0);
    }
`,

ripplePropagateShader: `
    varying vec2 vUv;
    uniform sampler2D uRippleTexture; // .r = current height, .g = previous height
    uniform vec2 uTexelSize;
    uniform float uRippleSpeed;
    uniform float uRippleDamping;

    void main() {
        vec2 prevState = texture2D(uRippleTexture, vUv).rg;
        float h_prev = prevState.g;
        float h_curr = prevState.r;

        float h_l = texture2D(uRippleTexture, vUv - vec2(uTexelSize.x, 0.0)).r;
        float h_r = texture2D(uRippleTexture, vUv + vec2(uTexelSize.x, 0.0)).r;
        float h_b = texture2D(uRippleTexture, vUv - vec2(0.0, uTexelSize.y)).r;
        float h_t = texture2D(uRippleTexture, vUv + vec2(0.0, uTexelSize.y)).r;

        float laplacian = (h_l + h_r + h_b + h_t) - 4.0 * h_curr;
        
        // Wave equation: new_h = 2*h_curr - h_prev + (speed^2 * laplacian)
        // A stability factor of 0.4 is added to prevent numerical artifacts.
        float h_new = 2.0 * h_curr - h_prev + laplacian * (uRippleSpeed * uRippleSpeed) * 0.4;
        
        // Apply damping to make ripples fade
        h_new *= uRippleDamping;

        gl_FragColor = vec4(h_new, h_curr, 0.0, 1.0); // Store new height in .r, current height in .g
    }
`,

compositingShader: `
  varying vec2 vUv;
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
    vec2 velocity = texture2D(uVelocityTexture, vUv).xy;
    float mainDensity = texture2D(uDensityTexture, vUv).g;
    
    if (mainDensity < 0.001) {
      gl_FragColor = texture2D(uSceneTexture, vUv);
      return;
    }
    
    float inkPower = clamp(mainDensity * uInkStrength, 0.0, 1.0);

    // --- Start: Normals & Refraction ---
    vec2 dUv_x = vec2(uTexelSize.x * 2.0, 0.0);
    vec2 dUv_y = vec2(0.0, uTexelSize.y * 2.0);
    float h_x = texture2D(uDensityTexture, vUv + dUv_x).g - mainDensity;
    float h_y = texture2D(uDensityTexture, vUv + dUv_y).g - mainDensity;

    h_x += velocity.x * uWaveComplexity;
    h_y += velocity.y * uWaveComplexity;

    float detail_noise = noise(vUv * 200.0) - 0.5;
    h_x += detail_noise * uWaveDetail;
    h_y += detail_noise * uWaveDetail;
    
    vec3 normalG = vec3(h_x, h_y, uWaveSteepness);

    vec2 detailNormal = (texture2D(uDetailNormalTexture, vUv).xy - 0.5) * 2.0;

    // Calculate ripple normal from heightfield gradient
    float ripple_h_center = texture2D(uRippleTexture, vUv).r;
    float ripple_h_x = texture2D(uRippleTexture, vUv + dUv_x).r;
    float ripple_h_y = texture2D(uRippleTexture, vUv + dUv_y).r;
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
    float r_bg = texture2D(uSceneTexture, refractedUv - bgShift).r;
    float g_bg = texture2D(uSceneTexture, refractedUv).g;
    float b_bg = texture2D(uSceneTexture, refractedUv + bgShift).b;
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
            float surface_height = texture2D(uDensityTexture, reflect_uv).g;

            if (surface_height > ray_height) {
                reflectionColor = texture2D(uReflectionTexture, reflect_uv).rgb;
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

    vec3 density_center = texture2D(uDensityTexture, vUv).rgb;
    vec3 density_shifted_R = texture2D(uDensityTexture, vUv - internalShift).rgb;
    vec3 density_shifted_B = texture2D(uDensityTexture, vUv + internalShift).rgb;
    
    float densityR = density_shifted_R.g;
    float densityG = density_center.g;
    float densityB = density_shifted_B.g;
    
    float glowPower = min(uGlowPower, 10.0);

    float temp = texture2D(uTemperatureTexture, vUv).r;
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
        totalDensity += texture2D(uDensityTexture, vUv + offset).g;
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

    gl_FragColor = vec4(finalColor, 1.0);
  }
`,

finalPassShader: `
    varying vec2 vUv;
    uniform sampler2D uFluidResult;
    uniform sampler2D uSceneTexture;
    uniform sampler2D uDensityTexture;
    uniform sampler2D uCausticsTexture;
    uniform float uArtisticBlend;
    uniform float uCausticsIntensity;

    void main() {
        vec3 fluidView = texture2D(uFluidResult, vUv).rgb;
        vec3 sceneView = texture2D(uSceneTexture, vUv).rgb;
        float density = texture2D(uDensityTexture, vUv).g;
        float caustics = texture2D(uCausticsTexture, vUv).r;

        // Add caustics to the scene before blending with fluid
        vec3 sceneWithCaustics = sceneView + caustics * uCausticsIntensity;

        vec3 artisticResult = mix(sceneWithCaustics, fluidView, density);
        vec3 blendedColor = mix(fluidView, artisticResult, uArtisticBlend);
        vec3 finalColor = blendedColor;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`
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
            const compositingMaterial = sim.materials.compositing as THREE.ShaderMaterial;
            const finalPassMaterial = sim.materials.finalPass as THREE.ShaderMaterial;
            const reactionDiffusionMaterial = sim.materials.reactionDiffusion as THREE.ShaderMaterial;
            const reactionForceMaterial = sim.materials.reactionForce as THREE.ShaderMaterial;
            const vorticityMaterial = sim.materials.vorticity as THREE.ShaderMaterial;
            const surfaceTensionMaterial = sim.materials.surfaceTension as THREE.ShaderMaterial;
            const splatMaterial = sim.materials.splat as THREE.ShaderMaterial;
            const buoyancyMaterial = sim.materials.buoyancy as THREE.ShaderMaterial;
            const particleRenderMaterial = sim.materials.particleRender as THREE.ShaderMaterial;
            const particleUpdateMaterial = sim.materials.particleUpdate as THREE.ShaderMaterial;
            const flowMapMaterial = sim.materials.flowMap as THREE.ShaderMaterial;
            const ripplePropagateMaterial = sim.materials.ripplePropagate as THREE.ShaderMaterial;

            Object.keys(params).forEach(key => {
                const value = (params as any)[key];
                if (compositingMaterial.uniforms[key]) {
                    if (key === 'uSSR_Strength') {
                        compositingMaterial.uniforms[key].value = quality.enableSsr ? value : 0;
                    } else {
                        compositingMaterial.uniforms[key].value = value;
                    }
                }
                if (finalPassMaterial.uniforms[key]) {
                    finalPassMaterial.uniforms[key].value = value;
                }
                if (reactionDiffusionMaterial.uniforms[key]) {
                    reactionDiffusionMaterial.uniforms[key].value = value;
                }
                 if (reactionForceMaterial.uniforms[key]) {
                    reactionForceMaterial.uniforms[key].value = value;
                }
                 if (vorticityMaterial.uniforms[key]) {
                    vorticityMaterial.uniforms[key].value = value;
                }
                 if (surfaceTensionMaterial.uniforms[key]) {
                    surfaceTensionMaterial.uniforms[key].value = value;
                }
                if (buoyancyMaterial.uniforms[key]) {
                    buoyancyMaterial.uniforms[key].value = value;
                }
                if (splatMaterial.uniforms['uRadius'] && key === 'uWaveSize') {
                    splatMaterial.uniforms['uRadius'].value = value;
                }
                if (particleRenderMaterial && particleRenderMaterial.uniforms[key]) {
                     particleRenderMaterial.uniforms[key].value = value;
                }
                 if (particleUpdateMaterial && particleUpdateMaterial.uniforms[key]) {
                    particleUpdateMaterial.uniforms[key].value = value;
                }
                if (flowMapMaterial.uniforms[key]) {
                    flowMapMaterial.uniforms[key].value = value;
                }
                if (ripplePropagateMaterial.uniforms[key]) {
                    ripplePropagateMaterial.uniforms[key].value = value;
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
    
    // Effect to update background/text color dynamically
    useEffect(() => {
        if (sim.renderer && sim.materials.scene) {
            const { width, height } = sim.renderer.getSize(new THREE.Vector2());
            const newTextCanvas = createTextCanvas(width, height, backgroundColor, textColor);
            const newSceneTexture = new THREE.CanvasTexture(newTextCanvas);
            const sceneMaterial = sim.materials.scene as THREE.MeshBasicMaterial;
            sceneMaterial.map?.dispose(); // Dispose of the old texture
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
            const fbo2 = fbo.clone();
            return { read: fbo, write: fbo2, swap: function() { const temp = this.read; this.read = this.write; this.write = temp; } };
        };

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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
        sim.fbo.curl = new THREE.WebGLRenderTarget(simWidth, simHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType, format: THREE.RedFormat });
        sim.fbo.caustics = new THREE.WebGLRenderTarget(simWidth, simHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RedFormat });
        sim.fbo.detailNormal = new THREE.WebGLRenderTarget(simWidth, simHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RGBAFormat });
        sim.fbo.scene = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RGBAFormat });
        sim.fbo.composited = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RGBAFormat });
        sim.fbo.renderedFrame = createFBO(width, height);


        const simTexelSize = new THREE.Vector2(1 / simWidth, 1 / simHeight);
        const textCanvas = createTextCanvas(width, height, backgroundColor, textColor);
        const sceneTexture = new THREE.CanvasTexture(textCanvas);
        
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

        // Initialize ripples to zero
        clearMaterial.uniforms.uClearColor.value.set(0.0, 0.0, 0.0);
        blit(sim.fbo.ripples.read, clearMaterial);
        blit(sim.fbo.ripples.write, clearMaterial);
        
        if (quality.particleResolution > 0) {
            // Initialize particles as dead
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

                if (button === 2) { // Right-click (erase)
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

                } else if (Math.abs(dx) > 0 || Math.abs(dy) > 0 || button === 0) { // Hover or left-click (add)
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
                        
                        const hoverStrength = Math.min(speed * 8.0, 0.4); // Make wakes more prominent
                        const clickStrength = button === 0 ? 1.0 : 0; // Make clicks much stronger
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

            // --- New Rendering Passes ---
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
            
            // --- Main Rendering ---
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
            const sceneMaterial = sim.materials.scene as THREE.MeshBasicMaterial;
            sceneMaterial.map?.dispose();
            sceneMaterial.map = newSceneTexture;
        };
        window.addEventListener('resize', handleResize);
        
        // Initial param setup
        const firstParams = params;
         Object.keys(firstParams).forEach(key => {
            const value = (firstParams as any)[key];
             if ((sim.materials.compositing as THREE.ShaderMaterial).uniforms[key]) {
                 (sim.materials.compositing as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.finalPass as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.finalPass as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.reactionDiffusion as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.reactionDiffusion as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.reactionForce as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.reactionForce as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.vorticity as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.vorticity as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.surfaceTension as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.surfaceTension as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.buoyancy as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.buoyancy as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if((sim.materials.splat as THREE.ShaderMaterial).uniforms['uRadius'] && key === 'uWaveSize') {
                 (sim.materials.splat as THREE.ShaderMaterial).uniforms['uRadius'].value = value;
             }
             if (sim.materials.particleRender && (sim.materials.particleRender as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.particleRender as THREE.ShaderMaterial).uniforms[key].value = value;
            }
             if (sim.materials.particleUpdate && (sim.materials.particleUpdate as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.particleUpdate as THREE.ShaderMaterial).uniforms[key].value = value;
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


// --- CONTROLS PANEL COMPONENT ---
interface ControlsPanelProps {
    params: AllParams;
    setParams: (key: keyof AllParams, value: any) => void;
    activePreset: string;
    selectPreset: (index: number) => void;
    quality: QualitySettings;
    setQuality: <K extends keyof QualitySettings>(key: K, value: QualitySettings[K]) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    textColor: string;
    setTextColor: (color: string) => void;
}

const SliderControl: React.FC<{ label: string, description: string, value: number, min: number, max: number, step: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, description, value, min, max, step, onChange }) => (
    <div className="flex flex-col space-y-2">
        <div className="flex justify-between text-sm">
            <label htmlFor={label} className="text-gray-300 font-medium">{label}</label>
            <span className="text-gray-400">{Number(value).toFixed(4)}</span>
        </div>
        <p className="text-xs text-gray-500 -mt-1">{description}</p>
        <input id={label} type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
    </div>
);

const ColorControl: React.FC<{ label: string, value: string | THREE.Color, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => {
    const colorValue = typeof value === 'string' ? value : '#' + value.getHexString();
    return (
        <div className="flex justify-between items-center text-sm">
            <label htmlFor={label} className="text-gray-300 font-medium">{label}</label>
            <input id={label} type="color" value={colorValue} onChange={onChange} className="w-8 h-8 p-0 border-none rounded-md bg-gray-700 cursor-pointer" />
        </div>
    );
}

const SelectControl: React.FC<{ label: string, description: string, value: any, options: {label: string, value: any}[], onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ label, description, value, options, onChange }) => (
    <div className="flex flex-col space-y-2">
        <label htmlFor={label} className="text-sm text-gray-300 font-medium">{label}</label>
        <p className="text-xs text-gray-500 -mt-1">{description}</p>
        <select id={label} value={value} onChange={onChange} className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const ToggleControl: React.FC<{ label: string, description: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, description, checked, onChange }) => (
    <div className="flex flex-col space-y-2">
        <label className="flex items-center justify-between cursor-pointer">
            <div className="flex flex-col pr-4">
                <span className="text-sm text-gray-300 font-medium">{label}</span>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <div className="relative flex-shrink-0">
                <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
        </label>
    </div>
);


const ControlGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-400 tracking-wider border-b border-gray-700 pb-2">{title}</h3>
        <div className="space-y-4 pl-2">
            {children}
        </div>
    </div>
);

const ControlsPanel: React.FC<ControlsPanelProps> = ({ params, setParams, activePreset, selectPreset, quality, setQuality, isOpen, setIsOpen, backgroundColor, setBackgroundColor, textColor, setTextColor }) => {
    const [isCustomizing, setIsCustomizing] = useState(false);

    const paramConfig = useMemo(() => ({
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
    }), []);

    const handleExportPreset = () => {
        const simParamKeys = ['waveDecay', 'densityDissipation', 'temperatureDissipation'];

        const preset = {
            name: "Custom Preset",
            uniforms: {} as Record<string, any>,
            simParams: {} as Record<string, any>
        };

        for (const [key, value] of Object.entries(params)) {
            if (simParamKeys.includes(key)) {
                preset.simParams[key] = value;
            } else {
                if (value instanceof THREE.Color) {
                    preset.uniforms[key] = '#' + value.getHexString();
                } else if (value instanceof THREE.Vector3) {
                    preset.uniforms[key] = { x: value.x, y: value.y, z: value.z };
                } else {
                    preset.uniforms[key] = value;
                }
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

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-20 p-2 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-full text-white hover:bg-gray-700 transition-colors"
                aria-label={isOpen ? 'Close controls panel' : 'Open controls panel'}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
            </button>

            <div className={`
                fixed top-0 left-0 h-full z-10
                bg-gray-800 bg-opacity-80 backdrop-blur-sm text-white shadow-2xl
                transition-transform duration-300 ease-in-out
                w-full max-w-sm md:w-80
                flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="pt-20 p-4 space-y-4 overflow-y-auto">
                    <h2 className="text-lg font-bold tracking-wide">Presets</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {versions.map((version, index) => (
                            <button
                                key={version.name}
                                className={`px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${version.name === activePreset ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                                onClick={() => selectPreset(index)}
                            >
                                {version.name}
                            </button>
                        ))}
                    </div>
                    <div className="border-t border-gray-700 my-4"></div>
                    <button
                        className="flex justify-between items-center w-full text-left text-lg font-bold tracking-wide"
                        onClick={() => setIsCustomizing(!isCustomizing)}
                        aria-expanded={isCustomizing}
                    >
                        Customize
                        <svg className={`w-5 h-5 transition-transform duration-300 ${isCustomizing ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {isCustomizing && (
                        <div className="pt-4 space-y-6 border-t border-gray-700">
                             <ControlGroup title="Background">
                                <ColorControl
                                    label="Background Color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                />
                                <ColorControl
                                    label="Text Color"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                />
                            </ControlGroup>
                            <ControlGroup title="Performance & Quality">
                                <SelectControl
                                    label="Simulation Resolution"
                                    description="Higher values improve detail but reduce performance. Requires simulation reset."
                                    value={quality.simResolution}
                                    onChange={(e) => setQuality('simResolution', parseInt(e.target.value, 10))}
                                    options={[
                                        { label: 'Low (128)', value: 128 },
                                        { label: 'Medium (256)', value: 256 },
                                        { label: 'High (512)', value: 512 },
                                    ]}
                                />
                                <SelectControl
                                    label="Particle Count"
                                    description="Number of particles. More particles are demanding. Requires simulation reset."
                                    value={quality.particleResolution}
                                    onChange={(e) => setQuality('particleResolution', parseInt(e.target.value, 10))}
                                    options={[
                                        { label: 'Off', value: 0 },
                                        { label: 'Low (128x128)', value: 128 },
                                        { label: 'Medium (256x256)', value: 256 },
                                        { label: 'High (512x512)', value: 512 },
                                    ]}
                                />
                                <ToggleControl
                                    label="Screen-Space Reflections"
                                    description="Enables mirror-like reflections. Can be costly on performance."
                                    checked={quality.enableSsr}
                                    onChange={(e) => setQuality('enableSsr', e.target.checked)}
                                />
                            </ControlGroup>
                            {Object.values(paramConfig).map(group => (
                                <ControlGroup key={group.title} title={group.title}>
                                    {Object.entries(group.controls).map(([key, config]) => (
                                        <SliderControl
                                            key={key}
                                            {...config}
                                            value={(params as any)[key]}
                                            onChange={(e) => setParams(key as keyof AllParams, parseFloat(e.target.value))}
                                        />
                                    ))}
                                    {group.title === 'Particles' && (
                                        <ColorControl
                                            label="Particle Color"
                                            value={params.uParticleColor}
                                            onChange={(e) => setParams('uParticleColor', new THREE.Color(e.target.value))}
                                        />
                                    )}
                                </ControlGroup>
                            ))}

                            <ControlGroup title="Lighting">
                                <h4 className="text-sm font-semibold text-gray-300 -mb-2">Light 1</h4>
                                <SliderControl
                                    label="X Position"
                                    description="Moves Light 1 left and right."
                                    value={params.uLight1Pos.x} min={-1} max={2} step={0.01}
                                    onChange={(e) => setParams('uLight1Pos', params.uLight1Pos.clone().setX(parseFloat(e.target.value)))}
                                />
                                <SliderControl
                                    label="Y Position"
                                    description="Moves Light 1 up and down."
                                    value={params.uLight1Pos.y} min={-1} max={2} step={0.01}
                                    onChange={(e) => setParams('uLight1Pos', params.uLight1Pos.clone().setY(parseFloat(e.target.value)))}
                                />
                                <SliderControl
                                    label="Z Position"
                                    description="How close (low) or far (high) the light is."
                                    value={params.uLight1Pos.z} min={0.1} max={2} step={0.01}
                                    onChange={(e) => setParams('uLight1Pos', params.uLight1Pos.clone().setZ(parseFloat(e.target.value)))}
                                />
                                <ColorControl
                                    label="Light 1 Color"
                                    value={params.uLight1Color}
                                    onChange={(e) => setParams('uLight1Color', new THREE.Color(e.target.value))}
                                />

                                <div className="border-t border-gray-700 my-4"></div>
                                <h4 className="text-sm font-semibold text-gray-300 -mb-2">Light 2</h4>
                                <SliderControl
                                    label="X Position"
                                    description="Moves Light 2 left and right."
                                    value={params.uLight2Pos.x} min={-1} max={2} step={0.01}
                                    onChange={(e) => setParams('uLight2Pos', params.uLight2Pos.clone().setX(parseFloat(e.target.value)))}
                                />
                                <SliderControl
                                    label="Y Position"
                                    description="Moves Light 2 up and down."
                                    value={params.uLight2Pos.y} min={-1} max={2} step={0.01}
                                    onChange={(e) => setParams('uLight2Pos', params.uLight2Pos.clone().setY(parseFloat(e.target.value)))}
                                />
                                <SliderControl
                                    label="Z Position"
                                    description="How close (low) or far (high) the light is."
                                    value={params.uLight2Pos.z} min={0.1} max={2} step={0.01}
                                    onChange={(e) => setParams('uLight2Pos', params.uLight2Pos.clone().setZ(parseFloat(e.target.value)))}
                                />
                                <ColorControl
                                    label="Light 2 Color"
                                    value={params.uLight2Color}
                                    onChange={(e) => setParams('uLight2Color', new THREE.Color(e.target.value))}
                                />
                            </ControlGroup>

                            <ControlGroup title="Colors">
                                <ColorControl
                                    label="Water Color"
                                    value={params.uWaterColor}
                                    onChange={(e) => setParams('uWaterColor', new THREE.Color(e.target.value))}
                                />
                                <ColorControl
                                    label="Ink Color"
                                    value={params.uInkColor}
                                    onChange={(e) => setParams('uInkColor', new THREE.Color(e.target.value))}
                                />
                                <ColorControl
                                    label="Border Color"
                                    value={params.uBorderColor}
                                    onChange={(e) => setParams('uBorderColor', new THREE.Color(e.target.value))}
                                />
                                <ColorControl
                                    label="Fresnel Color"
                                    value={params.uFresnelColor}
                                    onChange={(e) => setParams('uFresnelColor', new THREE.Color(e.target.value))}
                                />
                                <ColorControl
                                    label="Glow Color"
                                    value={params.uGlowColor}
                                    onChange={(e) => setParams('uGlowColor', new THREE.Color(e.target.value))}
                                />
                            </ControlGroup>

                             <div className="pt-4 border-t border-gray-700">
                                <button
                                    onClick={handleExportPreset}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Export Custom Preset
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};


// --- FLUID EFFECT WRAPPER ---
interface FluidEffectProps {
    params: AllParams;
    quality: QualitySettings;
    backgroundColor: string;
    textColor: string;
}

const FluidEffect: React.FC<FluidEffectProps> = ({ params, quality, backgroundColor, textColor }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    useFluidSimulation(mountRef, params, quality, backgroundColor, textColor);

    return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full" aria-hidden="true" />;
};


// --- MAIN COMPONENT ---
const clonePresetParams = (preset: Version): AllParams => {
    const uniforms = preset.uniforms;
    const clonedUniforms = {
        ...uniforms,
        uWaterColor: uniforms.uWaterColor.clone(),
        uInkColor: uniforms.uInkColor.clone(),
        uFresnelColor: uniforms.uFresnelColor.clone(),
        uGlowColor: uniforms.uGlowColor.clone(),
        uBorderColor: uniforms.uBorderColor.clone(),
        uParticleColor: uniforms.uParticleColor.clone(),
        uLight1Color: uniforms.uLight1Color.clone(),
        uLight2Color: uniforms.uLight2Color.clone(),
        uLight1Pos: uniforms.uLight1Pos.clone(),
        uLight2Pos: uniforms.uLight2Pos.clone(),
    };
    return { ...clonedUniforms, ...preset.simParams } as AllParams;
};

const NewComponent: React.FC = () => {
    const getInitialQuality = (): QualitySettings => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            return {
                simResolution: 128,
                particleResolution: 128,
                enableSsr: false,
            };
        }
        return {
            simResolution: 256,
            particleResolution: 256,
            enableSsr: true,
        };
    };

    const [isControlsOpen, setControlsOpen] = useState(() => {
         if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });

    const [activePreset, setActivePreset] = useState<string>(versions[0].name);

    const [quality, setQuality] = useState<QualitySettings>(getInitialQuality);
    
    const [backgroundColor, setBackgroundColor] = useState('#000000');
    const [textColor, setTextColor] = useState('#FFFFFF');

    const [params, setParams] = useState<AllParams>(() => {
        const preset = versions.find(v => v.name === activePreset) || versions[0];
        return clonePresetParams(preset);
    });
    
    const handleSelectPreset = (index: number) => {
        const preset: Version = versions[index];
        setParams(clonePresetParams(preset));
        setActivePreset(preset.name);
        const presetHasSsr = preset.uniforms.uSSR_Strength > 0 && preset.uniforms.uSSR_Samples > 0;
        setQuality(q => ({ ...q, enableSsr: presetHasSsr }));
    };

    const handleSetParams = (key: keyof AllParams, value: any) => {
        setParams(prev => ({ ...prev, [key]: value }));
        setActivePreset('Custom');
    };
    
    const handleSetQuality = <K extends keyof QualitySettings>(key: K, value: QualitySettings[K]) => {
        setQuality(prev => ({ ...prev, [key]: value }));
        setActivePreset('Custom');
    };

    const simulationKey = `${quality.simResolution}-${quality.particleResolution}`;

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-black text-white">
            <FluidEffect 
                key={simulationKey}
                params={params} 
                quality={quality}
                backgroundColor={backgroundColor}
                textColor={textColor}
            />
            <ControlsPanel
                params={params}
                setParams={handleSetParams}
                activePreset={activePreset}
                selectPreset={handleSelectPreset}
                quality={quality}
                setQuality={handleSetQuality}
                isOpen={isControlsOpen}
                setIsOpen={setControlsOpen}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                textColor={textColor}
                setTextColor={setTextColor}
            />
        </main>
    );
};

export default NewComponent;