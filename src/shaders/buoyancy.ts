
export const buoyancyShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform sampler2D uTemperature;
    uniform float uBuoyancy;
    uniform float uAmbientTemperature;
    uniform float uDt;

    void main() {
        vec2 velocity = texture(uVelocity, vUv).xy;
        if (uBuoyancy < 0.001) {
            pc_fragColor = vec4(velocity, 0.0, 1.0);
            return;
        }
        float temp = texture(uTemperature, vUv).r;
        float force = uBuoyancy * (temp - uAmbientTemperature);
        velocity.y += force * uDt;
        pc_fragColor = vec4(velocity, 0.0, 1.0);
    }
`;