import React, { useState } from 'react';
import * as THREE from 'three';
import { FluidEffect } from './components/FluidEffect';
import { ControlsPanel } from './components/ControlsPanel';
import { versions } from './constants';
import type { AllParams, Version } from './types';

const clonePresetParams = (preset: Version): AllParams => {
    const uniforms = preset.uniforms;
    // Create a shallow copy for primitive values and then deep copy Color/Vector objects
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
    return { ...clonedUniforms, ...preset.simParams };
};

const App: React.FC = () => {
    const [activePreset, setActivePreset] = useState<string>(versions[0].name);

    const [params, setParams] = useState<AllParams>(() => {
        const preset = versions.find(v => v.name === activePreset) || versions[0];
        return clonePresetParams(preset);
    });
    
    const handleSelectPreset = (index: number) => {
        const preset: Version = versions[index];
        setParams(clonePresetParams(preset));
        setActivePreset(preset.name);
    };

    const handleSetParams = (key: keyof AllParams, value: any) => {
        setParams(prev => ({ ...prev, [key]: value }));
        setActivePreset('Custom');
    };

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-white text-white">
            <FluidEffect params={params} />
            <ControlsPanel
                params={params}
                setParams={handleSetParams}
                activePreset={activePreset}
                selectPreset={handleSelectPreset}
            />
        </main>
    );
};

export default App;