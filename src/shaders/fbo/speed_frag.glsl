precision highp float;
uniform vec2 res;
uniform sampler2D lastFrame;
uniform float uTime;
uniform float twister;
uniform float waveAdder;
uniform sampler2D positions;

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

  vec4 positionsMap = texture2D(positions, vUv);

  vec4 finalColor = lastFrame; // override mix with test pattern

  float angle = atan(vUvOrig.r*0.2,vUvOrig.g*0.2);

  float distanceToCenter = distance(vUvOrig.rg, vec2(0.5));

  // Increase the spin angle based on uTime and the distance from the center Closer to the center means it will go faster
  float angleOffset = (1.0/distanceToCenter)*uTime;
  angle+=angleOffset;

  float randomizer = random(vUvOrig);
  float randomizer2 = random(vUvOrig * 5.0);

  float radius = distanceToCenter;
  float spinSpeed = 0.2 + vUvOrig.r * radius;
  float baseRads = uTime * 2.0;
  float rads = uTime * spinSpeed + randomizer2 * PI * 2.0;

  float twist = radius * 50.0;
  float twister2 = 12.0;
  float polarWaveVal =  baseRads + 0.5 + 0.5 * sin(rads * twister2 + twist);

  rads+= polarWaveVal;

  lastFrame.r =0.5+0.5*cos(rads)*radius;
  lastFrame.g =0.5+0.5*sin(rads)*radius;

  float strength = 0.75-0.15 *sin(vUvOrig.r*0.5+uTime);

  lastFrame.b = strength;

  finalColor.rgb = lastFrame.rgb;

  if(finalColor.r > 1.) finalColor.r = 0.;
  if(finalColor.g > 1.) finalColor.g = 0.;
  if(finalColor.b > 1.) finalColor.b = 0.;
  if(finalColor.r < 0.) finalColor.r = 1.;
  if(finalColor.g < 0.) finalColor.g = 1.;
  if(finalColor.b < 0.) finalColor.b = 1.;

  gl_FragColor = finalColor;
}
