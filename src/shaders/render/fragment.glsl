precision highp float;
uniform sampler2D map;
uniform float uTime;
uniform vec3 uDepthColor;
uniform float uColorFrequency;

varying float vColorU;
varying vec2 vUv;
varying vec2 vColorUV;
varying float vElevation;

void main() {

  // vec4 diffuseColor = texture2D( map, vec2(vColorU, vUv.x) );

  vec4 diffuseColor = texture2D( map,  vColorUV);
  vec4 mixDepth = vec4(uDepthColor, 1.0);
  // vec4 mapColor = texture2D( map,  vUv);
  // vec4 depthColor = vec4(0.6,0.5,1.0,1.0);

  vec4 mixColor = mix(diffuseColor,mixDepth,abs(sin(vElevation*uColorFrequency)));
  // vec4 diffuseColor2 = texture2D( map, vec2(vColorU, vUv.y) );
  gl_FragColor = mixColor;

  // gl_FragColor = vec4(vUv.x,vUv.y,1.0,1.0);
}
