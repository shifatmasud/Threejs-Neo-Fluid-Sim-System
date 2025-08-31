
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
        uLight1Pos: uniforms.uLight1Pos.clone(),
        uLight1Color: uniforms.uLight1Color.clone(),
        uLight2Pos: uniforms.uLight2Pos.clone(),
        uLight2Color: uniforms.uLight2Color.clone(),
    };
    return { ...clonedUniforms, ...preset.simParams };
};

const FluidSimulation: React.FC = () => {
    const [params, setParams] = useState<AllParams>(() => clonePresetParams(versions[0]));
    const [quality, setQuality] = useState<QualitySettings>({ simResolution: 256, particleResolution: 512, enableSsr: true });
    const [backgroundColor, setBackgroundColor] = useState('#080810');
    const [textColor, setTextColor] = useState('#ffffff');
    const guiRef = useRef<GUI | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateParams = (newParams: Partial<AllParams>) => {
        setParams(prev => ({ ...prev, ...newParams }));
    };
    
    const updateQuality = (newQuality: Partial<QualitySettings>) => {
        setQuality(prev => ({ ...prev, ...newQuality }));
    };

    const handleExportPreset = () => {
        const presetToExport: { name: string, uniforms: Record<string, any>, simParams: Record<string, any> } = {
            name: "Custom Preset",
            uniforms: {},
            simParams: {}
        };

        // FIX: The 'params' object is flat and doesn't have 'simParams' or 'uniforms' properties.
        // Use a reference preset to determine which keys belong to simParams and which to uniforms.
        const referencePreset = versions[0];

        for (const key in params) {
            const value = (params as any)[key];
            if (key in referencePreset.simParams) {
                presetToExport.simParams[key] = value;
            } else if (key in referencePreset.uniforms) {
                 if (value instanceof THREE.Color) {
                    // FIX: Export hex color with a '#' prefix to be valid for import.
                    presetToExport.uniforms[key] = `#${value.getHexString()}`;
                } else if (value instanceof THREE.Vector3) {
                    presetToExport.uniforms[key] = { x: value.x, y: value.y, z: value.z };
                } else {
                    presetToExport.uniforms[key] = value;
                }
            }
        }
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(presetToExport, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "custom_preset.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportPreset = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const importedPreset = JSON.parse(text);

                const newParams: Partial<AllParams> = {};
                const uniformsFromFile = importedPreset.uniforms || {};
                const simParamsFromFile = importedPreset.simParams || {};

                for (const key in params) {
                     if (key in uniformsFromFile) {
                        const value = uniformsFromFile[key];
                        if ((params as any)[key] instanceof THREE.Color) {
                            (newParams as any)[key] = new THREE.Color(value);
                        } else if ((params as any)[key] instanceof THREE.Vector3) {
                            (newParams as any)[key] = new THREE.Vector3(value.x, value.y, value.z);
                        } else {
                            (newParams as any)[key] = value;
                        }
                    } else if (key in simParamsFromFile) {
                         (newParams as any)[key] = simParamsFromFile[key];
                    }
                }
                setParams(prev => ({...prev, ...newParams}));
            } catch (error) {
                console.error("Error parsing preset file:", error);
                alert("Failed to import preset. Please check the file format.");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };


    useEffect(() => {
        const gui = new GUI();
        guiRef.current = gui;

        const presetOptions = versions.reduce((acc, v) => ({ ...acc, [v.name]: v.name }), {});
        const presetHolder = { preset: versions[0].name };

        gui.add(presetHolder, 'preset', presetOptions).name('Preset').onChange((value: string) => {
            const selectedPreset = versions.find(v => v.name === value);
            if (selectedPreset) {
                setParams(clonePresetParams(selectedPreset));
            }
        });

        const qualityFolder = gui.addFolder('Quality');
        qualityFolder.add(quality, 'simResolution', { '128': 128, '256': 256, '512': 512, '1024': 1024 }).name('Sim Resolution').onChange(v => updateQuality({ simResolution: Number(v) }));
        qualityFolder.add(quality, 'particleResolution', { '0': 0, '256': 256, '512': 512, '1024': 1024 }).name('Particle Resolution').onChange(v => updateQuality({ particleResolution: Number(v) }));
        qualityFolder.add(quality, 'enableSsr').name('SSR (Reflections)').onChange(v => updateQuality({ enableSsr: v }));
        
        const appearanceFolder = gui.addFolder('Appearance');
        appearanceFolder.addColor({ color: `#${params.uWaterColor.getHexString()}` }, 'color').name('Water Color').onChange(v => updateParams({ uWaterColor: new THREE.Color(v) }));
        appearanceFolder.addColor({ color: `#${params.uInkColor.getHexString()}` }, 'color').name('Ink Color').onChange(v => updateParams({ uInkColor: new THREE.Color(v) }));
        appearanceFolder.add(params, 'uVolumeFactor', 0, 1).name('Volume Factor').onChange(v => updateParams({ uVolumeFactor: v }));
        appearanceFolder.add(params, 'uInkStrength', 0, 5).name('Ink Strength').onChange(v => updateParams({ uInkStrength: v }));
        appearanceFolder.addColor({ color: `${backgroundColor}`}, 'color').name('Background Color').onChange(setBackgroundColor);
        appearanceFolder.addColor({ color: `${textColor}`}, 'color').name('Text Color').onChange(setTextColor);

        const lightingFolder = gui.addFolder('Lighting');
        lightingFolder.add(params, 'uShininess', 1, 1024).name('Shininess').onChange(v => updateParams({ uShininess: v }));
        lightingFolder.addColor({ color: `#${params.uFresnelColor.getHexString()}` }, 'color').name('Fresnel Color').onChange(v => updateParams({ uFresnelColor: new THREE.Color(v) }));
        lightingFolder.add(params, 'uFresnelIntensity', 0, 10).name('Fresnel Intensity').onChange(v => updateParams({ uFresnelIntensity: v }));
        lightingFolder.addColor({ color: `#${params.uGlowColor.getHexString()}` }, 'color').name('Glow Color').onChange(v => updateParams({ uGlowColor: new THREE.Color(v) }));
        lightingFolder.add(params, 'uGlowPower', 0, 10).name('Glow Power').onChange(v => updateParams({ uGlowPower: v }));
        lightingFolder.add(params, 'uCausticsIntensity', 0, 5).name('Caustics').onChange(v => updateParams({ uCausticsIntensity: v }));

        const waveFolder = gui.addFolder('Waves & Ripples');
        waveFolder.add(params, 'uWaveSize', 0.01, 0.5).name('Splat Size').onChange(v => updateParams({ uWaveSize: v }));
        waveFolder.add(params, 'uDisplacementScale', 0, 0.5).name('Displacement').onChange(v => updateParams({ uDisplacementScale: v }));
        waveFolder.add(params, 'uWaveSteepness', 0, 0.5).name('Steepness').onChange(v => updateParams({ uWaveSteepness: v }));
        waveFolder.add(params, 'uWaveComplexity', 0, 0.2).name('Complexity').onChange(v => updateParams({ uWaveComplexity: v }));
        waveFolder.add(params, 'uWaveDetail', 0, 0.2).name('Detail').onChange(v => updateParams({ uWaveDetail: v }));
        waveFolder.add(params, 'uRippleStrength', 0, 2).name('Ripple Strength').onChange(v => updateParams({ uRippleStrength: v }));
        waveFolder.add(params, 'uRippleDamping', 0.8, 1.0).name('Ripple Damping').onChange(v => updateParams({ uRippleDamping: v }));
        waveFolder.add(params, 'uRippleSpeed', 0, 2).name('Ripple Speed').onChange(v => updateParams({ uRippleSpeed: v }));

        const fluidDynamicsFolder = gui.addFolder('Fluid Dynamics');
        fluidDynamicsFolder.add(params, 'densityDissipation', 0.8, 1.0).name('Ink Dissipation').onChange(v => updateParams({ densityDissipation: v }));
        fluidDynamicsFolder.add(params, 'waveDecay', 0.8, 1.0).name('Wave Decay').onChange(v => updateParams({ waveDecay: v }));
        fluidDynamicsFolder.add(params, 'uVorticity', 0, 10).name('Vorticity').onChange(v => updateParams({ uVorticity: v }));
        fluidDynamicsFolder.add(params, 'uSurfaceTension', 0, 2).name('Surface Tension').onChange(v => updateParams({ uSurfaceTension: v }));

        const presetManagementFolder = gui.addFolder('Preset Management');
        presetManagementFolder.add({ export: handleExportPreset }, 'export').name('Export Preset');
        presetManagementFolder.add({ import: handleImportClick }, 'import').name('Import Preset');
        
        const controllers: any[] = [];
        gui.controllers.forEach(c => controllers.push(c));
        Object.values(gui.folders).forEach(f => f.controllers.forEach(c => controllers.push(c)));

        return () => {
            gui.destroy();
            guiRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        const gui = guiRef.current;
        if (!gui) return;
        // Update GUI controllers with new param values
        const updateController = (controller: any) => {
            if (Object.prototype.hasOwnProperty.call(params, controller.property) || Object.prototype.hasOwnProperty.call(quality, controller.property)) {
                 const value = (params as any)[controller.property] ?? (quality as any)[controller.property];
                 if (value instanceof THREE.Color) {
                    controller.object.color = `#${value.getHexString()}`;
                    controller.updateDisplay();
                 } else {
                    controller.setValue(value);
                 }
            } else if (controller.property === 'preset') {
                // FIX: The 'params' object is flat and does not have a 'uniforms' property.
                // To find the current preset, we must construct a 'uniforms' object from the flat 'params' state
                // and compare it to the presets' uniforms.
                const preset = versions.find(v => {
                    const currentUniforms: Partial<Uniforms> = {};
                    for (const key in v.uniforms) {
                        (currentUniforms as any)[key] = (params as any)[key];
                    }
                    return JSON.stringify(v.uniforms) === JSON.stringify(currentUniforms);
                });
                controller.setValue(preset ? preset.name : "Custom");
            }
        }
        gui.controllers.forEach(updateController);
        Object.values(gui.folders).forEach(f => f.controllers.forEach(updateController));
    }, [params, quality]);


    const memoizedParams = useMemo(() => params, [params]);

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
             <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleImportPreset}
            />
            <FluidEffect 
                params={memoizedParams} 
                quality={quality}
                backgroundColor={backgroundColor}
                textColor={textColor}
            />
        </div>
    );
};

export default FluidSimulation;
