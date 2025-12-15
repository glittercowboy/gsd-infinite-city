/**
 * Radial blur shader - creates speed lines effect from screen center
 * Intensity controlled by uniform - 0 = no effect, 1 = full blur
 */
export const RadialBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.0 },
    samples: { value: 8 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform int samples;
    varying vec2 vUv;

    void main() {
      vec2 center = vec2(0.5, 0.5);
      vec2 dir = vUv - center;
      float dist = length(dir);

      // Only blur edges, center stays sharp
      float edgeFactor = smoothstep(0.1, 0.6, dist);
      float blurStrength = intensity * edgeFactor * 0.15;  // Much stronger effect

      vec4 color = vec4(0.0);
      float total = 0.0;

      for (int i = 0; i < 16; i++) {
        if (i >= samples) break;
        float t = float(i) / float(samples - 1);
        vec2 offset = dir * blurStrength * t;
        color += texture2D(tDiffuse, vUv - offset);
        total += 1.0;
      }

      gl_FragColor = color / total;
    }
  `,
};
