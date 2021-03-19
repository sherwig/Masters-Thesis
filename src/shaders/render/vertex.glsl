precision highp float;

// custom uniforms
uniform float time;
uniform sampler2D colorMap;
uniform sampler2D positionsMap;
uniform float xScale;
uniform float yScale;
uniform float zScale;
uniform float fullScale;
attribute vec3 translate;
attribute vec2 colorUV;
varying vec2 vUv;
varying float vScale;
varying vec2 vColorUV;
varying float vElevation;

float map(float value, float low1, float high1, float low2, float high2) {
   return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
  }

void main() {

  // get map position from double buffer
  vec4 mapPosition = texture2D(positionsMap, colorUV);
  // vec3 offsetAmp = vec3(xScale, yScale, zScale);
  vec3 offsetAmp = vec3(xScale, yScale, 0.4+(sin(0.2*time*0.2)));
  vec3 posOffset = vec3(
   (-0.5 + mapPosition.x) * offsetAmp.x,
   (-0.5 + mapPosition.y) * offsetAmp.y,
   (-0.5 + mapPosition.z) * offsetAmp.z);
  // apply offset within modelViewMatrix multiplication
  // for correct inheritance of mesh position/rotation.
  // doing this afterwards was losing coordinate system rotation

  // vec4 mvPosition = modelViewMatrix * vec4( translate + posOffset, 1.0 );
  vec4 mvPosition = modelViewMatrix * vec4( posOffset, 1.0 );


  // wrap offsets with a fade
  float scale = fullScale;
  if(mapPosition.x > 0.8) scale = min(scale, map(mapPosition.x, 0.8, 1., scale, 0.));
  if(mapPosition.x < 0.2) scale = min(scale, map(mapPosition.x, 0.2, 0., scale, 0.));
  if(mapPosition.y > 0.8) scale = min(scale, map(mapPosition.y, 0.8, 1., scale, 0.));
  if(mapPosition.y < 0.2) scale = min(scale, map(mapPosition.y, 0.2, 0., scale, 0.));
  if(mapPosition.z > 0.8) scale = min(scale, map(mapPosition.z, 0.8, 1., scale, 0.));
  if(mapPosition.z < 0.2) scale = min(scale, map(mapPosition.z, 0.2, 0., scale, 0.));

  // set final vert position
  mvPosition.xyz += (position + posOffset) * scale;
  gl_Position = projectionMatrix * mvPosition;
   // pass values to frag
  vUv = uv;
  vColorUV = colorUV;
  vScale = scale;
  vElevation = mapPosition.z;
}
