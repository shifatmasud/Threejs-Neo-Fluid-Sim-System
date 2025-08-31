
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
