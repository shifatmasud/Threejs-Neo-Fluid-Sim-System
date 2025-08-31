
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
