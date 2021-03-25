// function buildParticles() {
//   // build geometry for particles
//   // const buffGeom = new THREE.CircleBufferGeometry( 1, 8 );
//   const buffGeom = new THREE.PlaneBufferGeometry(1, 1, 1);
//   let geometry = new THREE.InstancedBufferGeometry();
//   geometry.index = buffGeom.index;
//   geometry.attributes = buffGeom.attributes;
//
//   // create positions
//   const particleCount = simSize * simSize;
//   var meshRadius = 200;
//   var meshDepth = 400;
//
//   // create attributes arrays & assign to geometry
//   const translateArray = new Float32Array(particleCount * 3);
//   const colorUVArray = new Float32Array(particleCount * 2);
//   // spehere helpers
//   var inc = Math.PI * (3 - Math.sqrt(5));
//   var x = 0;
//   var y = 0;
//   var z = 0;
//   var r = 0;
//   var phi = 0;
//   var radius = 0.6;
//   for (let i = 0, i2 = 0, i3 = 0, l = particleCount; i < l; i++, i2 += 2, i3 += 3) {
//     // random positions inside a unit cube
//     // translateArray[i3 + 0] = Math.random() * 2 - 1;
//     // translateArray[i3 + 1] = Math.random() * 2 - 1;
//     // translateArray[i3 + 2] = Math.random() * 2 - 1;
//
//     // grid layout
//     translateArray[i3 + 0] = -1 + 2 * ((i % simSize) / simSize);
//     translateArray[i3 + 1] = -1 + 2 * (Math.floor(i / simSize) / simSize);
//     translateArray[i3 + 2] = 0.;
//
//     // evenly-spread positions on a unit sphere surface
//     // var off = 2 / particleCount;
//     // y = i * off - 1 + off / 2;
//     // r = Math.sqrt(1 - y * y);
//     // phi = i * inc;
//     // x = Math.cos(phi) * r;
//     // z = (0, Math.sin(phi) * r);
//     // x *= radius * Math.random(); // but vary the radius to not just be on the surface
//     // y *= radius * Math.random();
//     // z *= radius * Math.random();
//     // translateArray[ i3 + 0 ] = x;
//     // translateArray[ i3 + 1 ] = y;
//     // translateArray[ i3 + 2 ] = z;
//
//     // color map progress
//     colorUVArray[i2 + 0] = ((i % simSize) / simSize); // i/particleCount;
//     colorUVArray[i2 + 1] = (Math.floor(i / simSize) / simSize); // 0.5
//   }
//
//   geometry.setAttribute('translate', new THREE.InstancedBufferAttribute(translateArray, 3));
//   geometry.setAttribute('colorUV', new THREE.InstancedBufferAttribute(colorUVArray, 2));
//
//   particleMaterial = new THREE.ShaderMaterial({
//     uniforms: {
//       "map": {
//         value: new THREE.TextureLoader().load('textures/circle.png')
//       },
//       "colorMap": {
//         value: new THREE.TextureLoader().load(gradientImage)
//       },
//       "positionsMap": {
//         value: null
//       },
//       "uTime": {
//         value: 0.0
//       },
//       "fullScale": {
//         value: 1.0
//       },
//       "xScale": {
//         value: 1.5
//       },
//       "yScale": {
//         value: 1.5
//       },
//       "zScale": {
//         value: 0.2
//       },
//       uDepthColor: {
//         value: new THREE.Color(debugObject.depthColor)
//       },
//       uSurfaceColor: {
//         value: new THREE.Color(debugObject.surfaceColor)
//       },
//     },
//     vertexShader: renderVertex,
//     fragmentShader: renderFragment,
//     depthWrite: false,
//     depthTest: true,
//     blending: THREE.AdditiveBlending, // handle z-stacking, instead of more difficult measures: https://discourse.threejs.org/t/threejs-and-the-transparent-problem/11553/7
//   });
//
//   gui.add(particleMaterial.uniforms.fullScale, 'value').min(0).max(10).step(0.01).name('fullScale');
//   gui.add(particleMaterial.uniforms.xScale, 'value').min(0).max(3).step(0.01).name('xScale');
//   gui.add(particleMaterial.uniforms.yScale, 'value').min(0).max(3).step(0.01).name('yScale');
//   gui.add(particleMaterial.uniforms.zScale, 'value').min(0).max(3).step(0.01).name('zScale');
//
//   gui.addColor(debugObject, 'depthColor').name('depthColor').onChange(() => {
//     particleMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
//   });
//
//   gui.addColor(debugObject, 'surfaceColor').name('surfaceColor').onChange(() => {
//     particleMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
//   });
//
//
//   mesh = new THREE.Mesh(geometry, particleMaterial);
//   mesh.scale.set(meshRadius, meshRadius, meshDepth);
//   // mesh.rotatation.x = Math.PI;
//   mesh.rotation.x = Math.PI / 2;
//   // console.log(mesh);
//   scene.add(mesh);
// }




// in FRAGMENT SIMULATION


// Simplex 2D noise
//
// vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
// float snoise(vec2 v){
//   const vec4 C = vec4(0.211324865405187, 0.366025403784439,
//           -0.577350269189626, 0.024390243902439);
//   vec2 i  = floor(v + dot(v, C.yy) );
//   vec2 x0 = v -   i + dot(i, C.xx);
//   vec2 i1;
//   i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
//   vec4 x12 = x0.xyxy + C.xxzz;
//   x12.xy -= i1;
//   i = mod(i, 289.0);
//   vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
//   + i.x + vec3(0.0, i1.x, 1.0 ));
//   vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
//     dot(x12.zw,x12.zw)), 0.0);
//   m = m*m ;
//   m = m*m ;
//   vec3 x = 2.0 * fract(p * C.www) - 1.0;
//   vec3 h = abs(x) - 0.5;
//   vec3 ox = floor(x + 0.5);
//   vec3 a0 = x - ox;
//   m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
//   vec3 g;
//   g.x  = a0.x  * x0.x  + h.x  * x0.y;
//   g.yz = a0.yz * x12.xz + h.yz * x12.yw;
//   return 130.0 * dot(m, g);
// }

// vec4 mod289(vec4 x) {
//     return x - floor(x * (1.0 / 289.0)) * 289.0;
// }
//
// float mod289(float x) {
//     return x - floor(x * (1.0 / 289.0)) * 289.0;
// }
//
// vec4 permute(vec4 x) {
//     return mod289(((x*34.0)+1.0)*x);
// }
//
// float permute(float x) {
//     return mod289(((x*34.0)+1.0)*x);
// }
//
// vec4 taylorInvSqrt(vec4 r) {
//     return 1.79284291400159 - 0.85373472095314 * r;
// }
//
// float taylorInvSqrt(float r) {
//     return 1.79284291400159 - 0.85373472095314 * r;
// }
//
// vec4 grad4(float j, vec4 ip) {
//     const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
//     vec4 p,s;
//
//     p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
//     p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
//     s = vec4(lessThan(p, vec4(0.0)));
//     p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;
//
//     return p;
// }
//
// #define F4 0.309016994374947451
//
// vec4 simplexNoiseDerivatives (vec4 v) {
//     const vec4  C = vec4( 0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);
//
//     vec4 i  = floor(v + dot(v, vec4(F4)) );
//     vec4 x0 = v -   i + dot(i, C.xxxx);
//
//     vec4 i0;
//     vec3 isX = step( x0.yzw, x0.xxx );
//     vec3 isYZ = step( x0.zww, x0.yyz );
//     i0.x = isX.x + isX.y + isX.z;
//     i0.yzw = 1.0 - isX;
//     i0.y += isYZ.x + isYZ.y;
//     i0.zw += 1.0 - isYZ.xy;
//     i0.z += isYZ.z;
//     i0.w += 1.0 - isYZ.z;
//
//     vec4 i3 = clamp( i0, 0.0, 1.0 );
//     vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
//     vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );
//
//     vec4 x1 = x0 - i1 + C.xxxx;
//     vec4 x2 = x0 - i2 + C.yyyy;
//     vec4 x3 = x0 - i3 + C.zzzz;
//     vec4 x4 = x0 + C.wwww;
//
//     i = mod289(i);
//     float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
//     vec4 j1 = permute( permute( permute( permute (
//              i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
//            + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
//            + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
//            + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
//
//
//     vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;
//
//     vec4 p0 = grad4(j0,   ip);
//     vec4 p1 = grad4(j1.x, ip);
//     vec4 p2 = grad4(j1.y, ip);
//     vec4 p3 = grad4(j1.z, ip);
//     vec4 p4 = grad4(j1.w, ip);
//
//     vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
//     p0 *= norm.x;
//     p1 *= norm.y;
//     p2 *= norm.z;
//     p3 *= norm.w;
//     p4 *= taylorInvSqrt(dot(p4,p4));
//
//     vec3 values0 = vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)); //value of contributions from each corner at point
//     vec2 values1 = vec2(dot(p3, x3), dot(p4, x4));
//
//     vec3 m0 = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0); //(0.5 - x^2) where x is the distance
//     vec2 m1 = max(0.5 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);
//
//     vec3 temp0 = -6.0 * m0 * m0 * values0;
//     vec2 temp1 = -6.0 * m1 * m1 * values1;
//
//     vec3 mmm0 = m0 * m0 * m0;
//     vec2 mmm1 = m1 * m1 * m1;
//
//     float dx = temp0[0] * x0.x + temp0[1] * x1.x + temp0[2] * x2.x + temp1[0] * x3.x + temp1[1] * x4.x + mmm0[0] * p0.x + mmm0[1] * p1.x + mmm0[2] * p2.x + mmm1[0] * p3.x + mmm1[1] * p4.x;
//     float dy = temp0[0] * x0.y + temp0[1] * x1.y + temp0[2] * x2.y + temp1[0] * x3.y + temp1[1] * x4.y + mmm0[0] * p0.y + mmm0[1] * p1.y + mmm0[2] * p2.y + mmm1[0] * p3.y + mmm1[1] * p4.y;
//     float dz = temp0[0] * x0.z + temp0[1] * x1.z + temp0[2] * x2.z + temp1[0] * x3.z + temp1[1] * x4.z + mmm0[0] * p0.z + mmm0[1] * p1.z + mmm0[2] * p2.z + mmm1[0] * p3.z + mmm1[1] * p4.z;
//     float dw = temp0[0] * x0.w + temp0[1] * x1.w + temp0[2] * x2.w + temp1[0] * x3.w + temp1[1] * x4.w + mmm0[0] * p0.w + mmm0[1] * p1.w + mmm0[2] * p2.w + mmm1[0] * p3.w + mmm1[1] * p4.w;
//
//     return vec4(dx, dy, dz, dw) * 49.0;
// }
//
// vec3 curl( in vec3 p, in float noiseTime, in float persistence ) {
//
//     vec4 xNoisePotentialDerivatives = vec4(0.0);
//     vec4 yNoisePotentialDerivatives = vec4(0.0);
//     vec4 zNoisePotentialDerivatives = vec4(0.0);
//
//     for (int i = 0; i < 3; ++i) {
//
//         float twoPowI = pow(2.0, float(i));
//         float scale = 0.5 * twoPowI * pow(persistence, float(i));
//
//         // xNoisePotentialDerivatives += snoise4(vec4(p * twoPowI, noiseTime)) * scale;
//         // yNoisePotentialDerivatives += snoise4(vec4((p + vec3(123.4, 129845.6, -1239.1)) * twoPowI, noiseTime)) * scale;
//         // zNoisePotentialDerivatives += snoise4(vec4((p + vec3(-9519.0, 9051.0, -123.0)) * twoPowI, noiseTime)) * scale;
//
//         xNoisePotentialDerivatives += simplexNoiseDerivatives(vec4(p * twoPowI, noiseTime)) * scale;
//         yNoisePotentialDerivatives += simplexNoiseDerivatives(vec4((p + vec3(123.4, 129845.6, -1239.1)) * twoPowI, noiseTime)) * scale;
//         zNoisePotentialDerivatives += simplexNoiseDerivatives(vec4((p + vec3(-9519.0, 9051.0, -123.0)) * twoPowI, noiseTime)) * scale;
//     }
//
//     return vec3(
//         zNoisePotentialDerivatives[1] - yNoisePotentialDerivatives[2],
//         xNoisePotentialDerivatives[2] - zNoisePotentialDerivatives[0],
//         yNoisePotentialDerivatives[0] - xNoisePotentialDerivatives[1]
//     );
//
// }



// float rotation = speedster.r;

// add color & loop
// float noiseVal = snoise(vUvOrig);
// float noiseVal = snoise(vUvOrig * (1. + 0.1 * sin(uTime * 2.)));

// float noiseVal = snoise(vec2(vUvOrig.x+finalColor.x,vUvOrig.y+finalColor.y));

// float heading =  (2.0 * PI * rotation)*rotAmp;
// float heading =  (2.0 * PI * rotation);


// finalColor.r += noiseAdder.x + noiseVal * 0.012;
// finalColor.g += noiseAdder.y + noiseVal * 0.000008;
// finalColor.b -= noiseAdder.z + noiseVal * 0.0016;

// finalColor.g += 0.001;
// finalColor.r += 0.001;

// float speed = speedster.b;
// finalColor.r += cos(heading)*globalSpeed*speed;
// finalColor.g += sin(heading)*globalSpeed*speed;
// finalColor.rgb = speedster.rgb;

// finalColor.rg = speedster.rg;



// finalColor.rgb += curlNoise(lastFrame.xyz);
// finalColor.rgb*=0.6;

// float elevation = speedster.g;

// finalColor.b += elevation * globalSpeed;


// IN SPEED_FRAG


// Simplex 2D noise
//
// vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
// float snoise(vec2 v){
//   const vec4 C = vec4(0.211324865405187, 0.366025403784439,
//           -0.577350269189626, 0.024390243902439);
//   vec2 i  = floor(v + dot(v, C.yy) );
//   vec2 x0 = v -   i + dot(i, C.xx);
//   vec2 i1;
//   i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
//   vec4 x12 = x0.xyxy + C.xxzz;
//   x12.xy -= i1;
//   i = mod(i, 289.0);
//   vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
//   + i.x + vec3(0.0, i1.x, 1.0 ));
//   vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
//     dot(x12.zw,x12.zw)), 0.0);
//   m = m*m ;
//   m = m*m ;
//   vec3 x = 2.0 * fract(p * C.www) - 1.0;
//   vec3 h = abs(x) - 0.5;
//   vec3 ox = floor(x + 0.5);
//   vec3 a0 = x - ox;
//   m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
//   vec3 g;
//   g.x  = a0.x  * x0.x  + h.x  * x0.y;
//   g.yz = a0.yz * x12.xz + h.yz * x12.yw;
//   return 130.0 * dot(m, g);
// }

// vec4 permute(vec4 x)
// {
//     return mod(((x*34.0)+1.0)*x, 289.0);
// }
// vec4 taylorInvSqrt(vec4 r)
// {
//     return 1.79284291400159 - 0.85373472095314 * r;
// }
// vec3 fade(vec3 t)
// {
//     return t*t*t*(t*(t*6.0-15.0)+10.0);
// }
//
// float cnoise(vec3 P)
// {
//     vec3 Pi0 = floor(P); // Integer part for indexing
//     vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
//     Pi0 = mod(Pi0, 289.0);
//     Pi1 = mod(Pi1, 289.0);
//     vec3 Pf0 = fract(P); // Fractional part for interpolation
//     vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
//     vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
//     vec4 iy = vec4(Pi0.yy, Pi1.yy);
//     vec4 iz0 = Pi0.zzzz;
//     vec4 iz1 = Pi1.zzzz;
//
//     vec4 ixy = permute(permute(ix) + iy);
//     vec4 ixy0 = permute(ixy + iz0);
//     vec4 ixy1 = permute(ixy + iz1);
//
//     vec4 gx0 = ixy0 / 7.0;
//     vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
//     gx0 = fract(gx0);
//     vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
//     vec4 sz0 = step(gz0, vec4(0.0));
//     gx0 -= sz0 * (step(0.0, gx0) - 0.5);
//     gy0 -= sz0 * (step(0.0, gy0) - 0.5);
//
//     vec4 gx1 = ixy1 / 7.0;
//     vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
//     gx1 = fract(gx1);
//     vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
//     vec4 sz1 = step(gz1, vec4(0.0));
//     gx1 -= sz1 * (step(0.0, gx1) - 0.5);
//     gy1 -= sz1 * (step(0.0, gy1) - 0.5);
//
//     vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
//     vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
//     vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
//     vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
//     vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
//     vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
//     vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
//     vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
//
//     vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
//     g000 *= norm0.x;
//     g010 *= norm0.y;
//     g100 *= norm0.z;
//     g110 *= norm0.w;
//     vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
//     g001 *= norm1.x;
//     g011 *= norm1.y;
//     g101 *= norm1.z;
//     g111 *= norm1.w;
//
//     float n000 = dot(g000, Pf0);
//     float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
//     float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
//     float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
//     float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
//     float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
//     float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
//     float n111 = dot(g111, Pf1);
//
//     vec3 fade_xyz = fade(Pf0);
//     vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
//     vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
//     float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
//     return 2.2 * n_xyz;
// }


//Start of curlNoise


// vec4 mod289(vec4 x) {
//     return x - floor(x * (1.0 / 289.0)) * 289.0;
// }
//
// float mod289(float x) {
//     return x - floor(x * (1.0 / 289.0)) * 289.0;
// }
//
// vec4 permute(vec4 x) {
//     return mod289(((x*34.0)+1.0)*x);
// }
//
// float permute(float x) {
//     return mod289(((x*34.0)+1.0)*x);
// }
//
// vec4 taylorInvSqrt(vec4 r) {
//     return 1.79284291400159 - 0.85373472095314 * r;
// }
//
// float taylorInvSqrt(float r) {
//     return 1.79284291400159 - 0.85373472095314 * r;
// }
//
// vec4 grad4(float j, vec4 ip) {
//     const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
//     vec4 p,s;
//
//     p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
//     p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
//     s = vec4(lessThan(p, vec4(0.0)));
//     p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;
//
//     return p;
// }
//
// #define F4 0.309016994374947451
//
// vec4 simplexNoiseDerivatives (vec4 v) {
//     const vec4  C = vec4( 0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);
//
//     vec4 i  = floor(v + dot(v, vec4(F4)) );
//     vec4 x0 = v -   i + dot(i, C.xxxx);
//
//     vec4 i0;
//     vec3 isX = step( x0.yzw, x0.xxx );
//     vec3 isYZ = step( x0.zww, x0.yyz );
//     i0.x = isX.x + isX.y + isX.z;
//     i0.yzw = 1.0 - isX;
//     i0.y += isYZ.x + isYZ.y;
//     i0.zw += 1.0 - isYZ.xy;
//     i0.z += isYZ.z;
//     i0.w += 1.0 - isYZ.z;
//
//     vec4 i3 = clamp( i0, 0.0, 1.0 );
//     vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
//     vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );
//
//     vec4 x1 = x0 - i1 + C.xxxx;
//     vec4 x2 = x0 - i2 + C.yyyy;
//     vec4 x3 = x0 - i3 + C.zzzz;
//     vec4 x4 = x0 + C.wwww;
//
//     i = mod289(i);
//     float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
//     vec4 j1 = permute( permute( permute( permute (
//              i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
//            + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
//            + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
//            + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
//
//
//     vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;
//
//     vec4 p0 = grad4(j0,   ip);
//     vec4 p1 = grad4(j1.x, ip);
//     vec4 p2 = grad4(j1.y, ip);
//     vec4 p3 = grad4(j1.z, ip);
//     vec4 p4 = grad4(j1.w, ip);
//
//     vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
//     p0 *= norm.x;
//     p1 *= norm.y;
//     p2 *= norm.z;
//     p3 *= norm.w;
//     p4 *= taylorInvSqrt(dot(p4,p4));
//
//     vec3 values0 = vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)); //value of contributions from each corner at point
//     vec2 values1 = vec2(dot(p3, x3), dot(p4, x4));
//
//     vec3 m0 = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0); //(0.5 - x^2) where x is the distance
//     vec2 m1 = max(0.5 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);
//
//     vec3 temp0 = -6.0 * m0 * m0 * values0;
//     vec2 temp1 = -6.0 * m1 * m1 * values1;
//
//     vec3 mmm0 = m0 * m0 * m0;
//     vec2 mmm1 = m1 * m1 * m1;
//
//     float dx = temp0[0] * x0.x + temp0[1] * x1.x + temp0[2] * x2.x + temp1[0] * x3.x + temp1[1] * x4.x + mmm0[0] * p0.x + mmm0[1] * p1.x + mmm0[2] * p2.x + mmm1[0] * p3.x + mmm1[1] * p4.x;
//     float dy = temp0[0] * x0.y + temp0[1] * x1.y + temp0[2] * x2.y + temp1[0] * x3.y + temp1[1] * x4.y + mmm0[0] * p0.y + mmm0[1] * p1.y + mmm0[2] * p2.y + mmm1[0] * p3.y + mmm1[1] * p4.y;
//     float dz = temp0[0] * x0.z + temp0[1] * x1.z + temp0[2] * x2.z + temp1[0] * x3.z + temp1[1] * x4.z + mmm0[0] * p0.z + mmm0[1] * p1.z + mmm0[2] * p2.z + mmm1[0] * p3.z + mmm1[1] * p4.z;
//     float dw = temp0[0] * x0.w + temp0[1] * x1.w + temp0[2] * x2.w + temp1[0] * x3.w + temp1[1] * x4.w + mmm0[0] * p0.w + mmm0[1] * p1.w + mmm0[2] * p2.w + mmm1[0] * p3.w + mmm1[1] * p4.w;
//
//     return vec4(dx, dy, dz, dw) * 49.0;
// }
//
// vec3 curl( in vec3 p, in float noiseTime, in float persistence ) {
//
//     vec4 xNoisePotentialDerivatives = vec4(0.0);
//     vec4 yNoisePotentialDerivatives = vec4(0.0);
//     vec4 zNoisePotentialDerivatives = vec4(0.0);
//
//     for (int i = 0; i < 3; ++i) {
//
//         float twoPowI = pow(2.0, float(i));
//         float scale = 0.5 * twoPowI * pow(persistence, float(i));
//
//         // xNoisePotentialDerivatives += snoise4(vec4(p * twoPowI, noiseTime)) * scale;
//         // yNoisePotentialDerivatives += snoise4(vec4((p + vec3(123.4, 129845.6, -1239.1)) * twoPowI, noiseTime)) * scale;
//         // zNoisePotentialDerivatives += snoise4(vec4((p + vec3(-9519.0, 9051.0, -123.0)) * twoPowI, noiseTime)) * scale;
//
//         xNoisePotentialDerivatives += simplexNoiseDerivatives(vec4(p * twoPowI, noiseTime)) * scale;
//         yNoisePotentialDerivatives += simplexNoiseDerivatives(vec4((p + vec3(123.4, 129845.6, -1239.1)) * twoPowI, noiseTime)) * scale;
//         zNoisePotentialDerivatives += simplexNoiseDerivatives(vec4((p + vec3(-9519.0, 9051.0, -123.0)) * twoPowI, noiseTime)) * scale;
//     }
//
//     return vec3(
//         zNoisePotentialDerivatives[1] - yNoisePotentialDerivatives[2],
//         xNoisePotentialDerivatives[2] - zNoisePotentialDerivatives[0],
//         yNoisePotentialDerivatives[0] - xNoisePotentialDerivatives[1]
//     );
//
// }


// float zoom = 10.0;

// finalColor.r = cnoise(vec3(positionsMap.xy * zoom+vUvOrig*vUvOffsetNoise, uTime*0.15))*zoomOut;

// finalColor.r = cnoise(vec3(positionsMap.xy * 4.0+(sin(uTime*3.0))+vUvOrig*0.6+(sin(uTime*0.3)), uTime*1.0))*zoomOut;

// float elevation = sin(positionsMap.x+(vUvOrig.x*vUvOffsetWaves)*uBigWavesFrequency.x+uTime*uBigWavesSpeed)
// *sin(positionsMap.y+(vUvOrig.y*vUvOffsetWaves)*uBigWavesFrequency.y+uTime*uBigWavesSpeed)
// *uBigWavesElevation;


// for (float i=1.0; i<=3.0; i++)
// {
// elevation-=abs(cnoise(vec3(positionsMap.xy*50.0*i,uTime*0.15))*0.0002/i);

// elevation-=abs(cnoise(vec3(positionsMap.xz*uSmallWavesFrequency*i,uTime*uSmallWavesSpeed))*uSmallWavesElevation/i);

// elevation*= .2+abs(sin(uTime*0.2*i)*4.0/i);
// elevation*= .4+abs(cos(uTime*0.4*i)*3.0/i);
// }

// elevation*= 1.0+abs(cos(uTime*0.2)*3.0);

// finalColor.g += elevation;

// float speed = 0.3+0.2*sin(uTime*0.4+vUvOrig.x*vUvOffsetNoise);
// float speed = 0.5;


// float speed = 0.3+0.2*sin(uTime*0.4+positionsMap.x);
// finalColor.b = speed;



// GUI FOR SPEED FRAG
// gui.add(speedMaterial.uniforms.speed, 'value').min(0).max(0.01).step(0.0001).name('speedSpeed');
// gui.add(speedMaterial.uniforms.zoom, 'value').min(0).max(1000).step(1).name('noiseZoom');
// gui.add(speedMaterial.uniforms.zoomOut, 'value').min(0).max(3).step(0.01).name('zoomOut');
// gui.add(speedMaterial.uniforms.vUvOffsetNoise, 'value').min(0).max(1).step(.0001).name('vUvOffsetNoise');
// gui.add(speedMaterial.uniforms.vUvOffsetWaves, 'value').min(0).max(5).step(.01).name('vUvOffsetWaves');
// gui.add(speedMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation');
// gui.add(speedMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX');
// gui.add(speedMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY');
// gui.add(speedMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(5).step(0.001).name('uBigWavesSpeed');



//UNIFORMS FOR SPEED FRAG

// zoom: {
//   type: "f",
//   value: 4.0
// },
// zoomOut: {
//   type: "f",
//   value: 0.5
// },
// vUvOffsetNoise: {
//   type: "f",
//   value: .002
// },
// vUvOffsetWaves: {
//   type: "f",
//   value: .06
// },
// uBigWavesElevation: {
//   type: "f",
//   value: .6
// },
// uBigWavesFrequency: {
//   type: "f",
//   value: new THREE.Vector2(5, 5)
// },
// uBigWavesSpeed: {
//   type: "f",
//   value: 0.75
// },