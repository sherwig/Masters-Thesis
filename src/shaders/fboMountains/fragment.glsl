precision highp float;

uniform vec2 res;
uniform sampler2D lastFrame;
uniform sampler2D speedMap;
uniform float uTime;
uniform float xFreq;
uniform float globalSpeed;
uniform float yFreq;
uniform float noiseSpeed;
uniform float elevation;
#define PI 3.1415926538

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
}


float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

void main() {
  vec2 texel = 1. / res;
  // get orig color and normanlized numbers
  vec2 vUvOrig = gl_FragCoord.xy / res;
  // vec4 imgColor = texture2D(imgTex, vUvOrig);
  // apply zoom & rotate displacement
  vec2 vUv = gl_FragCoord.xy / res;

  vec4 lastFrame = texture2D(lastFrame, vUv);

  vec4 finalColor = lastFrame; // override mix with test pattern

  //Getting out values out of our speed double buffer
  vec4 speedster = texture2D(speedMap, vUv);


  float noiseVal = abs(snoise(vec2((vUvOrig.x+lastFrame.x)*xFreq,(vUvOrig.y+lastFrame.y)*yFreq)));

  float vatio = 1.0-(noiseVal*length(lastFrame.xy));
  vatio *= 1.0 + elevation * sin(uTime * noiseSpeed + vUvOrig.x * noiseSpeed + finalColor.x + noiseVal)* cos(uTime * noiseSpeed + vUvOrig.y * noiseSpeed + finalColor.z + noiseVal);


  for (float i=1.0; i<=2.0; i++)
  {
      vatio+=abs(snoise(vec2(lastFrame.xy*0.02*i*uTime))*0.2/i);
  }

  finalColor.b = vatio * globalSpeed-0.18;
  finalColor.r =0.5;
  finalColor.g =0.5;

  if(finalColor.r > 1.) finalColor.r = 0.;
  if(finalColor.g > 1.) finalColor.g = 0.;
  if(finalColor.b > 1.) finalColor.b = 0.;
  if(finalColor.r < 0.) finalColor.r = 1.;
  if(finalColor.g < 0.) finalColor.g = 1.;
  if(finalColor.b < 0.) finalColor.b = 1.;

  // if(finalColor.r >= 1.) finalColor.r = 0.5;
  // if(finalColor.g >= 1.) finalColor.g = 0.5;
  // if(finalColor.b >= 1.) finalColor.b = 0.5;
  // if(finalColor.r <= 0.) finalColor.r = .5;
  // if(finalColor.g <= 0.) finalColor.g = .5;
  // if(finalColor.b <= 0.) finalColor.b = .5;

  float randomizer = random(vUvOrig);

  // if(finalColor.r >= 1.) finalColor.r = randomizer;
  // if(finalColor.g >= 1.) finalColor.g = randomizer;
  // if(finalColor.b >= 1.) finalColor.b = randomizer;
  // if(finalColor.r <= 0.) finalColor.r = randomizer;
  // if(finalColor.g <= 0.) finalColor.g = randomizer;
  // if(finalColor.b <= 0.) finalColor.b = randomizer;

  // set final color
  gl_FragColor = finalColor;
}
