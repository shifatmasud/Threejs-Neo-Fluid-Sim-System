import type * as THREE from 'three';

export interface Uniforms {
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

export interface SimParams {
    velocityDissipation: number;
    densityDissipation: number;
    temperatureDissipation: number;
}

export type AllParams = Uniforms & SimParams;

export interface Version {
    name: string;
    uniforms: Uniforms;
    simParams: SimParams;
}