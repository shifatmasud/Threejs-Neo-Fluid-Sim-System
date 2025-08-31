
export const surfaceDetailShader = `
    varying vec2 vUv;
    uniform sampler2D uDensityTexture;
    uniform sampler2D uFlowMapTexture;
    uniform vec2 uTexelSize;
    uniform float uTime;

    // 2D simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    // Fractal Brownian Motion
    float fbm(vec2 uv, float flow_mag) {
        float total = 0.0;
        float amplitude = 0.6;
        float frequency = 20.0;
        float gain = 0.4;
        
        // Animate faster when flow is stronger
        float time_mult = 1.0 + flow_mag * 5.0;

        for (int i = 0; i < 4; i++) {
            total += snoise(uv * frequency + uTime * 0.4 * time_mult) * amplitude;
            frequency *= 2.1;
            amplitude *= gain;
        }
        return total;
    }


    void main() {
        float density = texture2D(uDensityTexture, vUv).g;
        if (density < 0.01) {
            gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0); // Neutral normal
            return;
        }
        vec2 flow = texture2D(uFlowMapTexture, vUv).xy * 0.5;
        float flow_mag = length(flow);
        
        // Calculate main wave normal to influence detail direction
        float h_l = texture2D(uDensityTexture, vUv - vec2(uTexelSize.x, 0.0)).g;
        float h_r = texture2D(uDensityTexture, vUv + vec2(uTexelSize.x, 0.0)).g;
        float h_b = texture2D(uDensityTexture, vUv - vec2(0.0, uTexelSize.y)).g;
        float h_t = texture2D(uDensityTexture, vUv + vec2(0.0, uTexelSize.y)).g;
        vec2 main_normal = vec2(h_l - h_r, h_b - h_t);

        // Animate ripples along the flow and perpendicular to main wave normal
        vec2 sample_uv = vUv + flow + main_normal * 0.01;
        
        // Increase noise frequency and amplitude on wave crests
        float noise_mod = 1.0 + density * 2.0;
        float noise_val = fbm(sample_uv * noise_mod, flow_mag);

        vec2 dUv = uTexelSize * 2.0;
        float nx = fbm((sample_uv + vec2(dUv.x, 0.0)) * noise_mod, flow_mag);
        float ny = fbm((sample_uv + vec2(0.0, dUv.y)) * noise_mod, flow_mag);
        
        // Use a larger Z value to control the "height" of the details, making them less extreme and preventing artifacts.
        vec3 normal = normalize(vec3((noise_val - nx), (noise_val - ny), 0.5));
        
        // Modulate normal strength by density to make edges smoother
        float strength = smoothstep(0.0, 0.1, density);
        
        gl_FragColor = vec4(mix(vec2(0.5), normal.xy * 0.5 + 0.5, strength), 1.0, 1.0);
    }
`;
