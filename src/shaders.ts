// --- SHADERS ---
export const baseVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const splatShader = `
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float uAspectRatio;
  uniform vec3 uColor;
  uniform vec2 uCenter;
  uniform float uRadius;

  void main() {
    vec2 p = vUv - uCenter.xy;
    p.x *= uAspectRatio;
    float intensity = 1.0 - smoothstep(0.0, uRadius, length(p));
    vec3 splat = uColor * intensity;
    vec3 base = texture2D(uTarget, vUv).rgb;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

export const advectionShader = `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 uTexelSize;
    uniform float uDt;
    uniform float uDissipation;

    void main() {
        vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexelSize;
        gl_FragColor = uDissipation * texture2D(uSource, coord);
    }
`;

export const divergenceShader = `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
        float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
        
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`;

export const clearShader = `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uValue;
    uniform vec3 uClearColor;
    uniform bool uUseClearColor;

    void main () {
        if (uUseClearColor) {
            gl_FragColor = vec4(uClearColor, 1.0);
        } else {
            gl_FragColor = uValue * texture2D(uTexture, vUv);
        }
    }
`;

export const pressureShader = `
    varying vec2 vUv;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`;

export const gradientSubtractShader = `
    varying vec2 vUv;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= 0.5 * vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`;

export const reactionDiffusionShader = `
    varying vec2 vUv;
    uniform sampler2D uChemicals;
    uniform vec2 uTexelSize;
    uniform float uFeedRate;
    uniform float uKillRate;
    
    const float uDu = 0.16;
    const float uDv = 0.08;
    const float uDt = 1.0;

    void main() {
        if (uFeedRate < 0.001 && uKillRate < 0.001) {
            gl_FragColor = texture2D(uChemicals, vUv);
            return;
        }

        vec2 chemical = texture2D(uChemicals, vUv).rg;
        float u = chemical.r;
        float v = chemical.g;

        float lap_u = (
            texture2D(uChemicals, vUv + vec2(0.0, uTexelSize.y)).r +
            texture2D(uChemicals, vUv - vec2(0.0, uTexelSize.y)).r +
            texture2D(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).r +
            texture2D(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).r -
            4.0 * u
        );

        float lap_v = (
            texture2D(uChemicals, vUv + vec2(0.0, uTexelSize.y)).g +
            texture2D(uChemicals, vUv - vec2(0.0, uTexelSize.y)).g +
            texture2D(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).g +
            texture2D(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).g -
            4.0 * v
        );

        float reaction = u * v * v;
        float du_dt = uDu * lap_u - reaction + uFeedRate * (1.0 - u);
        float dv_dt = uDv * lap_v + reaction - (uKillRate + uFeedRate) * v;

        float new_u = u + du_dt * uDt;
        float new_v = v + dv_dt * uDt;

        float old_b = texture2D(uChemicals, vUv).b;
        gl_FragColor = vec4(clamp(new_u, 0.0, 1.0), clamp(new_v, 0.0, 1.0), old_b, 1.0);
    }
`;

export const curlShader = `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main() {
        float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
        float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
        float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
        
        float curl = 0.5 * ((T - B) - (R - L));
        gl_FragColor = vec4(curl, 0.0, 0.0, 1.0);
    }
`;

export const vorticityShader = `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float uVorticity;
    uniform float uDt;
    uniform vec2 uTexelSize;

    void main() {
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        if (uVorticity < 0.01) {
            gl_FragColor = vec4(velocity, 0.0, 1.0);
            return;
        }

        float L = texture2D(uCurl, vUv - vec2(uTexelSize.x, 0.0)).r;
        float R = texture2D(uCurl, vUv + vec2(uTexelSize.x, 0.0)).r;
        float B = texture2D(uCurl, vUv - vec2(0.0, uTexelSize.y)).r;
        float T = texture2D(uCurl, vUv + vec2(0.0, uTexelSize.y)).r;
        
        float curl = texture2D(uCurl, vUv).r;
        
        vec2 grad = 0.5 * vec2(R - L, T - B);
        vec2 N = normalize(grad + 0.0001);
        vec2 force = uVorticity * curl * vec2(N.y, -N.x);
        
        velocity += force * uDt;
        
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`;

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

export const reactionForceShader = `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uChemicals;
    uniform float uReactionForce;
    uniform vec2 uTexelSize;

    void main() {
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        if (uReactionForce < 0.001) {
            gl_FragColor = vec4(velocity, 0.0, 1.0);
            return;
        }

        float L = texture2D(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).g;
        float R = texture2D(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).g;
        float B = texture2D(uChemicals, vUv - vec2(0.0, uTexelSize.y)).g;
        float T = texture2D(uChemicals, vUv + vec2(0.0, uTexelSize.y)).g;
        
        vec2 gradV = 0.5 * vec2(R - L, T - B);
        
        gl_FragColor = vec4(velocity - gradV * uReactionForce, 0.0, 1.0);
    }
`;

export const buoyancyShader = `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uTemperature;
    uniform float uBuoyancy;
    uniform float uAmbientTemperature;
    uniform float uDt;

    void main() {
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        if (uBuoyancy < 0.001) {
            gl_FragColor = vec4(velocity, 0.0, 1.0);
            return;
        }
        float temp = texture2D(uTemperature, vUv).r;
        float force = uBuoyancy * (temp - uAmbientTemperature);
        velocity.y += force * uDt;
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`;

export const eraseShader = `
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float uAspectRatio;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uStrength;

    void main() {
        vec2 p = vUv - uCenter.xy;
        p.x *= uAspectRatio;
        float intensity = 1.0 - smoothstep(0.0, uRadius, length(p));
        vec4 base = texture2D(uTarget, vUv);
        
        base.rg *= 1.0 - intensity * uStrength;
        
        gl_FragColor = base;
    }
`;

export const radialPushShader = `
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float uAspectRatio;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uStrength;

    void main() {
        vec2 p = vUv - uCenter.xy;
        p.x *= uAspectRatio;
        
        float falloff = 1.0 - smoothstep(0.0, uRadius, length(p));
        if (falloff <= 0.0) {
            gl_FragColor = texture2D(uTarget, vUv);
            return;
        }

        vec2 direction = normalize(p + 0.0001);
        vec2 pushForce = direction * falloff * uStrength;
        
        vec2 baseVelocity = texture2D(uTarget, vUv).xy;
        gl_FragColor = vec4(baseVelocity + pushForce, 0.0, 1.0);
    }
`;

export const particleSplatShader = `
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uIntensity;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

    void main() {
        vec4 particle = texture2D(uTarget, vUv);

        // If particle is dead...
        if (particle.b >= particle.a) {
            vec2 p = vUv - uCenter;
            float falloff = 1.0 - smoothstep(0.0, uRadius, length(p));
            
            // ...and we are under the cursor with enough intensity...
            if (falloff > 0.0 && hash(vUv * 999.0) < uIntensity * falloff * 0.2) {
                float lifetime = 2.0 + hash(vUv.yx) * 3.0;
                // Spawn particle at cursor position
                gl_FragColor = vec4(uCenter.x, uCenter.y, 0.0, lifetime);
                return;
            }
        }
        
        gl_FragColor = particle;
    }
`;

export const particleUpdateShader = `
    varying vec2 vUv;
    uniform sampler2D uParticles; // R,G = pos.x, pos.y; B = age; A = lifetime
    uniform sampler2D uVelocity;
    uniform float uDt;
    uniform float uParticleAdvection;

    void main() {
        vec4 particle = texture2D(uParticles, vUv);

        // If particle is dead, keep it dead
        if (particle.b >= particle.a) {
            gl_FragColor = vec4(0.0, 0.0, particle.a, particle.a);
            return;
        }

        vec2 pos = particle.xy;
        vec2 vel = texture2D(uVelocity, pos).xy;

        pos += vel * uDt * uParticleAdvection; // Advect particle
        
        // Simple periodic boundary conditions
        pos = mod(pos, 1.0);

        float age = particle.b + uDt;
        
        gl_FragColor = vec4(pos, age, particle.a);
    }
`;

export const particleRenderVS = `
    uniform sampler2D uParticles;
    uniform float uParticleSize;
    attribute vec2 a_uv;
    varying float v_age_ratio;

    void main() {
        vec4 particle = texture2D(uParticles, a_uv);
        v_age_ratio = particle.b / particle.a;

        // Only draw alive particles
        if (particle.b < particle.a) {
            vec2 pos = (particle.xy * 2.0) - 1.0;
            gl_Position = vec4(pos, 0.0, 1.0);
            gl_PointSize = uParticleSize * (1.0 - v_age_ratio);
        } else {
            // Hide dead particles
            gl_Position = vec4(-2.0, -2.0, 0.0, 1.0);
            gl_PointSize = 0.0;
        }
    }
`;

export const particleRenderFS = `
    uniform vec3 uParticleColor;
    varying float v_age_ratio;

    void main() {
        if (v_age_ratio > 1.0) discard;
        // Use pow for a nicer fade-out curve
        float alpha = pow(1.0 - v_age_ratio, 2.0); 
        
        // With Additive Blending, we just care about the RGB value.
        // We multiply the color by alpha to make it fade out.
        // The final alpha value is set to 1.0 as it's not used by the blend function.
        gl_FragColor = vec4(uParticleColor * alpha, 1.0);
    }
`;

export const causticsShader = `
    varying vec2 vUv;
    uniform sampler2D uDensityTexture;
    uniform vec2 uTexelSize;
    
    void main() {
        float h = texture2D(uDensityTexture, vUv).g;
        float h_l = texture2D(uDensityTexture, vUv - vec2(uTexelSize.x, 0.0)).g;
        float h_r = texture2D(uDensityTexture, vUv + vec2(uTexelSize.x, 0.0)).g;
        float h_b = texture2D(uDensityTexture, vUv - vec2(0.0, uTexelSize.y)).g;
        float h_t = texture2D(uDensityTexture, vUv + vec2(0.0, uTexelSize.y)).g;
        
        // Use Laplacian to approximate curvature, which focuses or disperses light
        float laplacian = (h_l + h_r + h_b + h_t) - 4.0 * h;
        // Sharper, more intense caustics
        float caustics = clamp(1.0 - laplacian * 200.0, 0.0, 1.0);
        
        float density = texture2D(uDensityTexture, vUv).g;
        
        gl_FragColor = vec4(vec3(pow(caustics, 3.0) * density), 1.0);
    }
`;

export const flowMapShader = `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uFlowMap;
    uniform float uFlowSpeed;
    uniform float uDt;

    void main() {
        vec2 velocity = texture2D(uVelocity, vUv).xy * 0.1;
        vec2 oldFlow = texture2D(uFlowMap, vUv).xy;
        
        // Mix current velocity into the flow map, and slowly fade the old flow
        // uFlowSpeed acts as a responsiveness factor
        vec2 newFlow = mix(oldFlow, velocity, uDt * uFlowSpeed);

        gl_FragColor = vec4(newFlow, 0.0, 1.0);
    }
`;

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

export const rippleSplatShader = `
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float uAspectRatio;
    uniform vec2 uCenter;
    uniform vec2 uPrevCenter;
    uniform float uRadius;
    uniform float uStrength;

    // Returns the distance from point P to line segment AB
    float distToSegment(vec2 P, vec2 A, vec2 B) {
        vec2 AP = P - A;
        vec2 AB = B - A;
        // Handle zero-length segment (e.g., a click without mouse move)
        float ab2 = dot(AB, AB);
        if (ab2 < 0.00001) {
            return distance(P, A);
        }
        float ap_ab = dot(AP, AB);
        float t = clamp(ap_ab / ab2, 0.0, 1.0);
        vec2 closestPoint = A + t * AB;
        return distance(P, closestPoint);
    }

    void main() {
        vec2 p = vUv;
        p.x *= uAspectRatio;
        
        vec2 center = uCenter;
        center.x *= uAspectRatio;
        
        vec2 prevCenter = uPrevCenter;
        prevCenter.x *= uAspectRatio;
        
        float intensity = 0.0;
        bool is_click = distance(center, prevCenter) < 0.0001;

        if (is_click) {
            // Enhanced "drop" effect for clicks for a more satisfying plop.
            float dist_to_center = distance(p, center);
            float radius = uRadius * 0.7; // Use a slightly larger radius for the effect.

            // A sharp central depression (the "pluck").
            float drop = -pow(1.0 - smoothstep(0.0, radius, dist_to_center), 2.0) * 1.5;
            
            // A surrounding raised ring to displace the "water".
            float ring_dist = abs(dist_to_center - radius * 0.5);
            float ring = pow(1.0 - smoothstep(0.0, radius * 0.4, ring_dist), 2.0);
            
            // Combine them, the strength of the click is higher.
            intensity = (drop + ring * 0.5) * uStrength * 2.5; 

        } else {
            // Original wake effect for drags.
            float dist = distToSegment(p, prevCenter, center);
            // Pluck the surface downwards to create a trough with a more defined falloff.
            intensity = -pow(1.0 - smoothstep(0.0, uRadius * 0.5, dist), 1.5) * uStrength;
        }


        vec2 base = texture2D(uTarget, vUv).rg;
        base.r += intensity;
        gl_FragColor = vec4(base, 0.0, 1.0);
    }
`;

export const ripplePropagateShader = `
    varying vec2 vUv;
    uniform sampler2D uRippleTexture; // .r = current height, .g = previous height
    uniform vec2 uTexelSize;
    uniform float uRippleSpeed;
    uniform float uRippleDamping;

    void main() {
        vec2 prevState = texture2D(uRippleTexture, vUv).rg;
        float h_prev = prevState.g;
        float h_curr = prevState.r;

        float h_l = texture2D(uRippleTexture, vUv - vec2(uTexelSize.x, 0.0)).r;
        float h_r = texture2D(uRippleTexture, vUv + vec2(uTexelSize.x, 0.0)).r;
        float h_b = texture2D(uRippleTexture, vUv - vec2(0.0, uTexelSize.y)).r;
        float h_t = texture2D(uRippleTexture, vUv + vec2(0.0, uTexelSize.y)).r;

        float laplacian = (h_l + h_r + h_b + h_t) - 4.0 * h_curr;
        
        // Wave equation: new_h = 2*h_curr - h_prev + (speed^2 * laplacian)
        // A stability factor of 0.4 is added to prevent numerical artifacts.
        float h_new = 2.0 * h_curr - h_prev + laplacian * (uRippleSpeed * uRippleSpeed) * 0.4;
        
        // Apply damping to make ripples fade
        h_new *= uRippleDamping;

        gl_FragColor = vec4(h_new, h_curr, 0.0, 1.0); // Store new height in .r, current height in .g
    }
`;

export const compositingShader = `
  varying vec2 vUv;
  uniform sampler2D uSceneTexture;
  uniform sampler2D uVelocityTexture;
  uniform sampler2D uDensityTexture;
  uniform sampler2D uTemperatureTexture;
  uniform sampler2D uReflectionTexture;
  uniform sampler2D uDetailNormalTexture;
  uniform sampler2D uRippleTexture;
  uniform vec2 uTexelSize;

  uniform vec3 uLight1Pos;
  uniform vec3 uLight1Color;
  uniform vec3 uLight2Pos;
  uniform vec3 uLight2Color;

  uniform float uDisplacementScale;
  uniform float uVelocityShiftScale;
  uniform float uDensityShiftScale;
  uniform vec3 uWaterColor;
  uniform float uVolumeFactor;
  uniform float uInkStrength;
  uniform float uShininess;
  uniform vec3 uFresnelColor;
  uniform float uFresnelIntensity;
  uniform vec3 uGlowColor;
  uniform float uGlowPower;
  uniform float uWaveSteepness;
  uniform float uWaveComplexity;
  uniform float uWaveDetail;
  uniform float uAmbientTemperature;
  uniform float uBorderThickness;
  uniform vec3 uBorderColor;
  uniform float uChiselStrength;
  uniform float uSSR_Strength;
  uniform float uSSR_Falloff;
  uniform float uSSR_Samples;
  uniform float uSurfaceDetailStrength;
  uniform float uRippleStrength;


  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 velocity = texture2D(uVelocityTexture, vUv).xy;
    float mainDensity = texture2D(uDensityTexture, vUv).g;
    
    if (mainDensity < 0.001) {
      gl_FragColor = texture2D(uSceneTexture, vUv);
      return;
    }
    
    float inkPower = clamp(mainDensity * uInkStrength, 0.0, 1.0);

    // --- Start: Normals & Refraction ---
    vec2 dUv_x = vec2(uTexelSize.x * 2.0, 0.0);
    vec2 dUv_y = vec2(0.0, uTexelSize.y * 2.0);
    float h_x = texture2D(uDensityTexture, vUv + dUv_x).g - mainDensity;
    float h_y = texture2D(uDensityTexture, vUv + dUv_y).g - mainDensity;

    h_x += velocity.x * uWaveComplexity;
    h_y += velocity.y * uWaveComplexity;

    float detail_noise = noise(vUv * 200.0) - 0.5;
    h_x += detail_noise * uWaveDetail;
    h_y += detail_noise * uWaveDetail;
    
    vec3 normalG = vec3(h_x, h_y, uWaveSteepness);

    vec2 detailNormal = (texture2D(uDetailNormalTexture, vUv).xy - 0.5) * 2.0;

    // Calculate ripple normal from heightfield gradient
    float ripple_h_center = texture2D(uRippleTexture, vUv).r;
    float ripple_h_x = texture2D(uRippleTexture, vUv + dUv_x).r;
    float ripple_h_y = texture2D(uRippleTexture, vUv + dUv_y).r;
    // Increase multiplier for more pronounced ripple normals, making them highly visible.
    vec2 rippleNormal = vec2(ripple_h_center - ripple_h_x, ripple_h_center - ripple_h_y) * 450.0;

    // Combine all normal sources
    vec3 finalNormal = normalize(vec3(
      normalG.xy + 
      detailNormal * uSurfaceDetailStrength + 
      rippleNormal * uRippleStrength, 
      normalG.z
    ));

    // Refraction includes all surface details
    vec2 velocityRefraction = velocity * uDisplacementScale;
    vec2 normalRefraction = finalNormal.xy * uDisplacementScale * 0.2;
    vec2 refractionOffset = (velocityRefraction + normalRefraction) * inkPower;
    vec2 refractedUv = vUv - refractionOffset;

    float poweredRgbShift = (length(velocity) * uVelocityShiftScale + mainDensity * uDensityShiftScale) * inkPower;
    vec2 bgShift = vec2(poweredRgbShift, 0.0);
    float r_bg = texture2D(uSceneTexture, refractedUv - bgShift).r;
    float g_bg = texture2D(uSceneTexture, refractedUv).g;
    float b_bg = texture2D(uSceneTexture, refractedUv + bgShift).b;
    vec3 refractedBg = vec3(r_bg, g_bg, b_bg);
    // --- End: Normals & Refraction ---

    vec2 internalShift = vec2(poweredRgbShift, 0.0);

    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 surfacePos = vec3(vUv, 0.0);
    vec3 lightDir1 = normalize(uLight1Pos - surfacePos);
    vec3 halfDir1 = normalize(lightDir1 + viewDir);
    vec3 lightDir2 = normalize(uLight2Pos - surfacePos);
    vec3 halfDir2 = normalize(lightDir2 + viewDir);

    // Enhanced Fresnel for a more artistic and stable effect
    float VdotN = clamp(dot(viewDir, finalNormal), 0.0, 1.0);
    // This combines a soft base fresnel with a sharper, intensity-driven edge tint.
    // It's more stable against noisy normals and prevents extreme brightness values.
    float fresnel = pow(1.0 - VdotN, 2.5) + (uFresnelIntensity * 0.3) * pow(1.0 - VdotN, 6.0);
    
    float shininess = min(uShininess, 1024.0);
    float spec1 = pow(max(0.0, dot(finalNormal, halfDir1)), shininess);
    float spec2 = pow(max(0.0, dot(finalNormal, halfDir2)), shininess);

    vec3 specularColor = spec1 * uLight1Color + spec2 * uLight2Color;
    vec3 fresnelComponent = uFresnelColor * fresnel;

    // Screen-Space Reflections
    vec3 reflectionColor = vec3(0.0);
    if (uSSR_Strength > 0.0 && uSSR_Samples > 0.0) {
        vec3 reflect_dir = reflect(-viewDir, finalNormal);
        float reflect_dist = 0.0;
        vec2 reflect_uv;
        bool hit = false;
        float step_size = 0.01;
        for (int i = 0; i < int(uSSR_Samples); i++) {
            reflect_dist += step_size;
            reflect_uv = vUv + reflect_dir.xy * reflect_dist;
            if (reflect_uv.x < 0.0 || reflect_uv.x > 1.0 || reflect_uv.y < 0.0 || reflect_uv.y > 1.0) break;
            
            float ray_height = mainDensity + reflect_dir.z * reflect_dist * 5.0;
            float surface_height = texture2D(uDensityTexture, reflect_uv).g;

            if (surface_height > ray_height) {
                reflectionColor = texture2D(uReflectionTexture, reflect_uv).rgb;
                hit = true;
                break;
            }
        }
        if (hit) {
            float fade = pow(max(0.0, 1.0 - reflect_dist), uSSR_Falloff);
            reflectionColor *= fade;
        }
    }
    vec3 reflectionComponent = reflectionColor * uSSR_Strength * fresnel;

    vec3 density_center = texture2D(uDensityTexture, vUv).rgb;
    vec3 density_shifted_R = texture2D(uDensityTexture, vUv - internalShift).rgb;
    vec3 density_shifted_B = texture2D(uDensityTexture, vUv + internalShift).rgb;
    
    float densityR = density_shifted_R.g;
    float densityG = density_center.g;
    float densityB = density_shifted_B.g;
    
    float glowPower = min(uGlowPower, 10.0);

    float temp = texture2D(uTemperatureTexture, vUv).r;
    float heat = clamp((temp - uAmbientTemperature) / max(0.01, uAmbientTemperature + 1.0), 0.0, 1.0);
    vec3 heatGlowColor = mix(uGlowColor, vec3(1.0, 0.2, 0.0), heat * heat);


    float add_r = (fresnelComponent.r + specularColor.r) * densityR + heatGlowColor.r * pow(densityR, glowPower) * densityR;
    float add_g = (fresnelComponent.g + specularColor.g) * densityG + heatGlowColor.g * pow(densityG, glowPower) * densityG;
    float add_b = (fresnelComponent.b + specularColor.b) * densityB + heatGlowColor.b * pow(densityB, glowPower) * densityB;
    vec3 fluidAdditiveColor = vec3(add_r, add_g, add_b) + reflectionComponent;

    // Volumetric absorption based on Beer's Law
    float occlusionR = clamp(densityR * uVolumeFactor, 0.0, 1.0);
    float occlusionG = clamp(densityG * uVolumeFactor, 0.0, 1.0);
    float occlusionB = clamp(densityB * uVolumeFactor, 0.0, 1.0);
    
    // Chisel / AO effect
    float ao = 0.0;
    if (uChiselStrength > 0.0) {
      float totalDensity = 0.0;
      float samples = 8.0;
      float angleStep = 6.28318530718 / samples;
      float radius = uTexelSize.y * 5.0;
      for (float i = 0.0; i < samples; i++) {
        vec2 offset = vec2(cos(i * angleStep), sin(i * angleStep)) * radius;
        totalDensity += texture2D(uDensityTexture, vUv + offset).g;
      }
      float avgDensity = totalDensity / samples;
      ao = clamp((avgDensity - mainDensity) * uChiselStrength, 0.0, 1.0);
    }
    float chiselFactor = 1.0 - pow(ao, 1.5) * inkPower;

    vec3 fluidBody;
    fluidBody.r = refractedBg.r * mix(1.0, uWaterColor.r, occlusionR) * chiselFactor;
    fluidBody.g = refractedBg.g * mix(1.0, uWaterColor.g, occlusionG) * chiselFactor;
    fluidBody.b = refractedBg.b * mix(1.0, uWaterColor.b, occlusionB) * chiselFactor;
    
    vec3 finalColor = fluidBody + fluidAdditiveColor;

    if (uBorderThickness > 0.001) {
        float edgeFactor = smoothstep(0.1, 0.1 + uBorderThickness, length(finalNormal.xy));
        finalColor = mix(finalColor, uBorderColor, edgeFactor * inkPower);
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const finalPassShader = `
    varying vec2 vUv;
    uniform sampler2D uFluidResult;
    uniform sampler2D uSceneTexture;
    uniform sampler2D uDensityTexture;
    uniform sampler2D uCausticsTexture;
    uniform float uArtisticBlend;
    uniform float uCausticsIntensity;

    void main() {
        vec3 fluidView = texture2D(uFluidResult, vUv).rgb;
        vec3 sceneView = texture2D(uSceneTexture, vUv).rgb;
        float density = texture2D(uDensityTexture, vUv).g;
        float caustics = texture2D(uCausticsTexture, vUv).r;

        // Add caustics to the scene before blending with fluid
        vec3 sceneWithCaustics = sceneView + caustics * uCausticsIntensity;

        vec3 artisticResult = mix(sceneWithCaustics, fluidView, density);
        vec3 blendedColor = mix(fluidView, artisticResult, uArtisticBlend);
        vec3 finalColor = blendedColor;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;