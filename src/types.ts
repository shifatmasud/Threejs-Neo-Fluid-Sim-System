import * as THREE from 'three';

// --- TYPES ---
export interface Uniforms {
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

export interface SimParams {
    waveDecay: number;
    densityDissipation: number;
    temperatureDissipation: number;
}

export type AllParams = Uniforms & SimParams;

export interface Version {
    name: string;
    uniforms: Uniforms;
    simParams: SimParams;
}
