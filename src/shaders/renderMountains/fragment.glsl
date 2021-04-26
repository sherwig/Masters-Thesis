precision highp float;
  uniform sampler2D map;
  uniform sampler2D colorMap;
  uniform vec3 uSurfaceColor;
  uniform vec3 uDepthColor;
  varying vec2 vUv;
  varying float vScale;
  varying vec2 vColorUV;
  varying float vElevation;

  void main()
  {
    float mixStrength = (vElevation+0.08)*2.0;
    vec4 diffuseColor = texture2D( map, vUv);
    vec3 color = mix(uSurfaceColor,uDepthColor,mixStrength);
    gl_FragColor = vec4(color,diffuseColor.a);

  }
