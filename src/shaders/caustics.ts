
export const causticsShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uDensityTexture;
    uniform vec2 uTexelSize;
    
    void main() {
        float h = texture(uDensityTexture, vUv).g;
        float h_l = texture(uDensityTexture, vUv - vec2(uTexelSize.x, 0.0)).g;
        float h_r = texture(uDensityTexture, vUv + vec2(uTexelSize.x, 0.0)).g;
        float h_b = texture(uDensityTexture, vUv - vec2(0.0, uTexelSize.y)).g;
        float h_t = texture(uDensityTexture, vUv + vec2(0.0, uTexelSize.y)).g;
        
        // Use Laplacian to approximate curvature, which focuses or disperses light
        float laplacian = (h_l + h_r + h_b + h_t) - 4.0 * h;
        // Sharper, more intense caustics
        float caustics = clamp(1.0 - laplacian * 200.0, 0.0, 1.0);
        
        float density = texture(uDensityTexture, vUv).g;
        
        pc_fragColor = vec4(vec3(pow(caustics, 3.0) * density), 1.0);
    }
`;