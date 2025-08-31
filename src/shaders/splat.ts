
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
