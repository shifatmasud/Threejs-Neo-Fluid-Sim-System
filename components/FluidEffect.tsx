
import React, { useRef } from 'react';
import type { AllParams } from '../types';
import { useFluidSimulation } from '../hooks/useFluidSimulation';

interface FluidEffectProps {
    params: AllParams;
}

export const FluidEffect: React.FC<FluidEffectProps> = ({ params }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    useFluidSimulation(mountRef, params);

    return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full" />;
};
