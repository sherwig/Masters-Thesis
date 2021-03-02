precision highp float;
  uniform sampler2D map;
  uniform sampler2D colorMap;
  varying vec2 vUv;
  varying float vScale;
  varying vec2 vColorUV;

  void main() {
    // tint the particle texture but keep the particle texture alpha
    vec4 diffuseColor = texture2D( map, vUv);
    // vec4 diffuseColor2 = texture2D( colorMap, vUv );
    vec4 diffuseColor2 = texture2D( colorMap, vColorUV);
    gl_FragColor = vec4(diffuseColor2.rgb, diffuseColor.a);
  }
