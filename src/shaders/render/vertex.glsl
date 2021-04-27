precision highp float;
uniform float time;
uniform sampler2D colorMap;
uniform sampler2D positionsMap;
uniform float xScale;
uniform float yScale;
uniform float zScale;
uniform float fullScale;
uniform float stepper;
attribute vec3 translate;
attribute vec2 colorUV;
varying vec2 vUv;
varying float vElevation;

float map(float value, float low1, float high1, float low2, float high2){
  return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

void main() {

  // get map position from double buffer
  vec4 mapPosition = texture2D(positionsMap, colorUV);
  vec3 offsetAmp = vec3(xScale, yScale, zScale);

  vec3 posOffset = vec3(
   (-0.5 + mapPosition.x) * offsetAmp.x,
   (-0.5 + mapPosition.y) * offsetAmp.y,
   (-0.5 + mapPosition.z) * offsetAmp.z);

  // vec4 mvPosition = modelViewMatrix * vec4( translate + posOffset, 1.0 );
  vec4 mvPosition = modelViewMatrix * vec4( posOffset, 1.0 );

  // wrap offsets with a fade
  float scale = fullScale;

  // set final vert position
  mvPosition.xyz += (position + posOffset) * scale;
  gl_Position = projectionMatrix * mvPosition;
   // pass values to frag
  vUv = uv;
  vElevation = mapPosition.y;
}
