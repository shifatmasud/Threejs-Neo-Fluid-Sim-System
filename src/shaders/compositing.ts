
export const compositingShader = `
  precision mediump float;
  in vec2 vUv;

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
    vec2 velocity = texture(uVelocityTexture, vUv).xy;
    float mainDensity = texture(uDensityTexture, vUv).g;
    
    if (mainDensity < 0.001) {
      pc_fragColor = texture(uSceneTexture, vUv);
      return;
    }
    
    float inkPower = clamp(mainDensity * uInkStrength, 0.0, 1.0);

    // --- Start: Normals & Refraction ---
    vec2 dUv_x = vec2(uTexelSize.x * 2.0, 0.0);
    vec2 dUv_y = vec2(0.0, uTexelSize.y * 2.0);
    float h_x = texture(uDensityTexture, vUv + dUv_x).g - mainDensity;
    float h_y = texture(uDensityTexture, vUv + dUv_y).g - mainDensity;

    h_x += velocity.x * uWaveComplexity;
    h_y += velocity.y * uWaveComplexity;

    float detail_noise = noise(vUv * 200.0) - 0.5;
    h_x += detail_noise * uWaveDetail;
    h_y += detail_noise * uWaveDetail;
    
    vec3 normalG = vec3(h_x, h_y, uWaveSteepness);

    vec2 detailNormal = (texture(uDetailNormalTexture, vUv).xy - 0.5) * 2.0;

    // Calculate ripple normal from heightfield gradient
    float ripple_h_center = texture(uRippleTexture, vUv).r;
    float ripple_h_x = texture(uRippleTexture, vUv + dUv_x).r;
    float ripple_h_y = texture(uRippleTexture, vUv + dUv_y).r;
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
    float r_bg = texture(uSceneTexture, refractedUv - bgShift).r;
    float g_bg = texture(uSceneTexture, refractedUv).g;
    float b_bg = texture(uSceneTexture, refractedUv + bgShift).b;
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
            float surface_height = texture(uDensityTexture, reflect_uv).g;

            if (surface_height > ray_height) {
                reflectionColor = texture(uReflectionTexture, reflect_uv).rgb;
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

    vec3 density_center = texture(uDensityTexture, vUv).rgb;
    vec3 density_shifted_R = texture(uDensityTexture, vUv - internalShift).rgb;
    vec3 density_shifted_B = texture(uDensityTexture, vUv + internalShift).rgb;
    
    float densityR = density_shifted_R.g;
    float densityG = density_center.g;
    float densityB = density_shifted_B.g;
    
    float glowPower = min(uGlowPower, 10.0);

    float temp = texture(uTemperatureTexture, vUv).r;
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
        totalDensity += texture(uDensityTexture, vUv + offset).g;
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

    pc_fragColor = vec4(finalColor, 1.0);
  }
`;