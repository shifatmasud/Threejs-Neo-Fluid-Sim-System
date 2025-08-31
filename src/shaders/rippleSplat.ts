
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
