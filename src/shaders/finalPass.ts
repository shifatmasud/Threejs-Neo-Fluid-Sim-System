
export const finalPassShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uFluidResult;
    uniform sampler2D uSceneTexture;
    uniform sampler2D uDensityTexture;
    uniform sampler2D uCausticsTexture;
    uniform float uArtisticBlend;
    uniform float uCausticsIntensity;

    void main() {
        vec3 fluidView = texture(uFluidResult, vUv).rgb;
        vec3 sceneView = texture(uSceneTexture, vUv).rgb;
        float density = texture(uDensityTexture, vUv).g;
        float caustics = texture(uCausticsTexture, vUv).r;

        // Add caustics to the scene before blending with fluid
        vec3 sceneWithCaustics = sceneView + caustics * uCausticsIntensity;

        vec3 artisticResult = mix(sceneWithCaustics, fluidView, density);
        vec3 blendedColor = mix(fluidView, artisticResult, uArtisticBlend);
        vec3 finalColor = blendedColor;

        pc_fragColor = vec4(finalColor, 1.0);
    }
`;