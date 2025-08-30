import React, { useState } from 'react';
import * as THREE from 'three';
import FluidEffect from './FluidEffect';
import ControlsPanel from './ControlsPanel';
import { versions } from '../constants';
import { AllParams, Version } from '../types';

export interface QualitySettings {
    simResolution: number;
    particleResolution: number;
    enableSsr: boolean;
}

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

const FluidSimulation: React.FC = () => {
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

export default FluidSimulation;