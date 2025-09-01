import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import GUI from 'lil-gui';
import FluidEffect from './FluidEffect';
import { versions } from '../constants';
import { AllParams, Version, Uniforms } from '../types';

export interface QualitySettings {
    simResolution: number;
    particleResolution: number;
    enableSsr: boolean;
}

// Helper to deep clone preset parameters, ensuring Vector3 objects are new instances
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

const FluidSimulation: React.FC = () => {
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

export default FluidSimulation;
