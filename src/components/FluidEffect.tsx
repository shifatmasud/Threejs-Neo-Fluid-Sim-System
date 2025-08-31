import React, { useRef } from 'react';
import { useFluidSimulation } from '../hooks/useFluidSimulation';
import { AllParams } from '../types';
import { QualitySettings } from './FluidSimulation';

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

export default FluidEffect;