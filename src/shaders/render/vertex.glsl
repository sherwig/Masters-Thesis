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

float map(float value, float low1, float high1, float low2, float high2){
  return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

float circle(in vec2 _st, in float _radius){
  vec2 dist = _st-vec2(0.5);
	return 1.-smoothstep(_radius-(_radius*0.01), _radius+(_radius*0.01), dot(dist,dist)*4.0);
}

void main() {

  // get map position from double buffer
  vec4 mapPosition = texture2D(positionsMap, colorUV);
  vec3 offsetAmp = vec3(xScale, yScale, zScale);

  // vec3 offsetAmp = vec3(xScale, yScale, 0.4+(sin(0.2*time*0.2)));
  // vec3 posOffset = vec3(
  //  (-0.5 + mapPosition.x) * offsetAmp.x,
  //  (-0.5 + mapPosition.y) * offsetAmp.y,
  //  (-0.5 + mapPosition.z) * offsetAmp.z);

  vec3 posOffset = vec3(
   (-0.5 + mapPosition.x) * 2.8,
   (-0.5 + mapPosition.y) * 2.8,
   (-0.5 + mapPosition.z) * 0.2);



   // float strength = 1.0-step(0.5, distance(colorUV, vec2(0.5)) + 0.25);
   // finalColor.r = strength;
   // finalColor.b =strength;

   //Attempt at Circle
   // vec3 posOffset = vec3(circle(colorUv,0.9));

  // vec3 posOffset = vec3(circle(mapPosition.xy,0.9),circle(mapPosition.yz,0.9),circle(mapPosition.za,0.9));

  // apply offset within modelViewMatrix multiplication
  // for correct inheritance of mesh position/rotation.
  // doing this afterwards was losing coordinate system rotation

  // vec4 mvPosition = modelViewMatrix * vec4( translate + posOffset, 1.0 );
  vec4 mvPosition = modelViewMatrix * vec4( posOffset, 1.0 );


  // wrap offsets with a fade
  float scale = fullScale;

  float dist = distance(mapPosition.xy, vec2(0.5));

  // if(mapPosition.x > 0.8) scale = min(scale, map(mapPosition.x, 0.8, 1., scale, 0.));
  // if(mapPosition.z > 0.8) scale = min(scale, map(mapPosition.z, 0.8, 1., scale, 0.));

  // if(mapPosition.x > 0.8) scale = min(scale, map(mapPosition.x, 0.8, 1., scale, 0.));
  // if(mapPosition.x < 0.2) scale = min(scale, map(mapPosition.x, 0.2, 0., scale, 0.));
  // if(mapPosition.y > 0.8) scale = min(scale, map(mapPosition.y, 0.8, 1., scale, 0.));
  // if(mapPosition.y < 0.2) scale = min(scale, map(mapPosition.y, 0.2, 0., scale, 0.));
  if(mapPosition.z > 0.8) scale = min(scale, map(mapPosition.z, 0.8, 1., scale, 0.));
  if(mapPosition.z < 0.2) scale = min(scale, map(mapPosition.z, 0.2, 0., scale, 0.));


  if (dist>0.2)
  {
    scale=map(dist,0.2,0.3,scale,0.0);
    if(scale <0.0)
    {
      scale=0.0;
    }
  }

  // set final vert position
  mvPosition.xyz += (position + posOffset) * scale;
  gl_Position = projectionMatrix * mvPosition;
   // pass values to frag
  vUv = uv;
  vColorUV = colorUV;
  vScale = scale;
  vElevation = mapPosition.z;
}
