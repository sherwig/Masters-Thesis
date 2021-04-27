precision highp float;
uniform vec2 res;
uniform sampler2D lastFrame;
uniform sampler2D speedMap;
uniform float uTime;
uniform float rotAmp;
uniform float globalSpeed;
uniform float divider;
#define PI 3.1415926538

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

void main() {
  vec2 texel = 1. / res;
  // get orig color and normanlized numbers
  vec2 vUvOrig = gl_FragCoord.xy / res;
  // apply zoom & rotate displacement
  vec2 vUv = gl_FragCoord.xy / res;

  vec4 lastFrame = texture2D(lastFrame, vUv);
  // mix soomed with original

  vec4 finalColor = lastFrame; // override mix with test pattern

  //Getting out values out of our speed double buffer
  vec4 speedster = texture2D(speedMap, vUv);


  finalColor.rgb = speedster.rgb;

  if(finalColor.r > 1.) finalColor.r = 0.;
  if(finalColor.g > 1.) finalColor.g = 0.;
  if(finalColor.b > 1.) finalColor.b = 0.;
  if(finalColor.r < 0.) finalColor.r = 1.;
  if(finalColor.g < 0.) finalColor.g = 1.;
  if(finalColor.b < 0.) finalColor.b = 1.;


  // set final color
  gl_FragColor = finalColor;
}
