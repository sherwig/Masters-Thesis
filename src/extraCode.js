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