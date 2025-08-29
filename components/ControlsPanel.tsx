import React, { useState, useMemo } from 'react';
import type { AllParams } from '../types';
import * as THREE from 'three';
import { versions } from '../constants';

interface ControlsPanelProps {
    params: AllParams;
    setParams: (key: keyof AllParams, value: any) => void;
    activePreset: string;
    selectPreset: (index: number) => void;
}

const SliderControl: React.FC<{ label: string, description: string, value: number, min: number, max: number, step: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, description, value, min, max, step, onChange }) => (
    <div className="flex flex-col space-y-2">
        <div className="flex justify-between text-sm">
            <label className="text-gray-300 font-medium">{label}</label>
            <span className="text-gray-400">{Number(value).toFixed(4)}</span>
        </div>
        <p className="text-xs text-gray-500 -mt-1">{description}</p>
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
    </div>
);

const ColorControl: React.FC<{ label: string, value: THREE.Color, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="flex justify-between items-center text-sm">
        <label className="text-gray-300 font-medium">{label}</label>
        <input type="color" value={'#' + value.getHexString()} onChange={onChange} className="w-8 h-8 p-0 border-none rounded-md bg-gray-700 cursor-pointer" />
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

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ params, setParams, activePreset, selectPreset }) => {
    const [isCustomizing, setIsCustomizing] = useState(false);

    const paramConfig = useMemo(() => ({
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
                uFlowSpeed: { label: 'Flow Speed', description: "How much the tiny details follow the flow of the main fluid.", min: 0, max: 10, step: 0.1 },
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
        dissipation: {
            title: 'Dissipation',
            controls: {
                velocityDissipation: { label: 'Velocity Fade', description: "How quickly the fluid's motion slows down. Like water vs. honey.", min: 0.8, max: 1, step: 0.001 },
                densityDissipation: { label: 'Density Fade', description: "How quickly the 'ink' or color fades away.", min: 0.8, max: 1, step: 0.001 },
                temperatureDissipation: { label: 'Temperature Fade', description: "How quickly the fluid cools down to its base temperature.", min: 0.8, max: 1, step: 0.001 },
            }
        },
    }), []);

    return (
        <div className="absolute top-4 left-4 w-80 max-h-[calc(100vh-2rem)] bg-gray-800 bg-opacity-80 backdrop-blur-sm text-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 space-y-4 overflow-y-auto">
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
                >
                    Customize
                    <svg className={`w-5 h-5 transition-transform duration-300 ${isCustomizing ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isCustomizing && (
                    <div className="pt-4 space-y-6 border-t border-gray-700">
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
                    </div>
                )}
            </div>
        </div>
    );
};