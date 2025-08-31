
export const surfaceTensionShader = `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uDensity;
    uniform float uSurfaceTension;
    uniform float uDt;
    uniform vec2 uTexelSize;

    void main() {
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        if (uSurfaceTension < 0.001) {
            gl_FragColor = vec4(velocity, 0.0, 1.0);
            return;
        }
        
        float density = texture2D(uDensity, vUv).g;
        if (density < 0.01) {
            gl_FragColor = vec4(velocity, 0.0, 1.0);
            return;
        }

        float L = texture2D(uDensity, vUv - vec2(uTexelSize.x, 0.0)).g;
        float R = texture2D(uDensity, vUv + vec2(uTexelSize.x, 0.0)).g;
        float B = texture2D(uDensity, vUv - vec2(0.0, uTexelSize.y)).g;
        float T = texture2D(uDensity, vUv + vec2(0.0, uTexelSize.y)).g;
        
        vec2 grad = 0.5 * vec2(R - L, T - B);
        
        // Calculate curvature (approximated by Laplacian of density)
        float laplacian = (L + R + B + T) - 4.0 * density;

        // Surface tension force is proportional to curvature multiplied by the surface normal.
        // This force pulls the fluid towards the center of curvature, minimizing surface area.
        vec2 force = -uSurfaceTension * laplacian * normalize(grad + 0.0001) * 2.0;
        
        velocity += force * uDt;
        
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`;
