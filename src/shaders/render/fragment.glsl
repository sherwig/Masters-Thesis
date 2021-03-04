precision highp float;
  uniform sampler2D map;
  uniform sampler2D colorMap;
  uniform vec3 uSurfaceColor;
  uniform vec3 uDepthColor;
  varying vec2 vUv;
  varying float vScale;
  varying vec2 vColorUV;
  varying float vElevation;


  // void main() {
  //   // tint the particle texture but keep the particle texture alpha
  //   vec4 diffuseColor = texture2D( map, vUv);
  //   // vec4 diffuseColor2 = texture2D( colorMap, vUv );
  //   vec4 diffuseColor2 = texture2D( colorMap, vColorUV);
  //   gl_FragColor = vec4(diffuseColor2.rgb, diffuseColor.a);
  // }



  void main()
  {
    float mixStrength = (vElevation+0.08)*5.0;
    vec3 color = mix(uDepthColor,uSurfaceColor,mixStrength);
    gl_FragColor = vec4(color,1.0);

  }
