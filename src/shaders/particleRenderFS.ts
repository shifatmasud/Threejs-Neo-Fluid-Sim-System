
export const particleRenderFS = `
    precision mediump float;

    uniform vec3 uParticleColor;
    in float v_age_ratio;

    void main() {
        if (v_age_ratio > 1.0) discard;
        // Use pow for a nicer fade-out curve
        float alpha = pow(1.0 - v_age_ratio, 2.0); 
        
        // With Additive Blending, we just care about the RGB value.
        // We multiply the color by alpha to make it fade out.
        // The final alpha value is set to 1.0 as it's not used by the blend function.
        pc_fragColor = vec4(uParticleColor * alpha, 1.0);
    }
`;