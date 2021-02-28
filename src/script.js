import './style.css'
// import './fbo.js'
// import * as FBO from './fbo.js';
import * as THREE from 'three'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import fboFragment from './shaders/fbo/fragment.glsl'
import fboVertex from './shaders/fbo/vertex.glsl'

import renderFragment from './shaders/render/fragment.glsl'
import renderVertex from './shaders/render/vertex.glsl'
import noiseImage from '../static/textures/noise.jpg'
import gradientImage from '../static/textures/gradient.png'
// import fingerprintImage from '../static/textures/fingerprint.png'
// import grayscaleImage from '../static/textures/grayscale.jpg'

var fboScene, orthoCamera, rtt, particles, gl;
var positions2, positions;
var framecount = 1;

function initParticles(width, height, renderer, simulationMaterial, renderMaterial) {

  gl = renderer.getContext();

  //1 we need FLOAT Textures to store positions
  //https://github.com/KhronosGroup/WebGL/blob/master/sdk/tests/conformance/extensions/oes-texture-float.html
  // if (!gl.getExtension("OES_texture_float")){
  //     throw new Error( "float textures not supported" );
  // }
  //
  // //2 we need to access textures from within the vertex shader
  // //https://github.com/KhronosGroup/WebGL/blob/90ceaac0c4546b1aad634a6a5c4d2dfae9f4d124/conformance-suites/1.0.0/extra/webgl-info.html
  // if( gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0 ) {
  //     throw new Error( "vertex shader cannot read textures" );
  // }

  //3 rtt setup
  fboScene = new THREE.Scene();
  orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

  //4 create a target texture
  var options = {
    minFilter: THREE.NearestFilter, //important as we want to sample square pixels
    magFilter: THREE.NearestFilter, //
    format: THREE.RGBAFormat, //could be RGBAFormat
    type: THREE.FloatType //important as we need precise coordinates (not ints)
  };
  rtt = new THREE.WebGLRenderTarget(width, height, options);


  //5 the simulation:
  //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
  var geom = new THREE.BufferGeometry();
  //Two triangles that we are drawing the texture to.
  geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]), 2));
  fboScene.add(new THREE.Mesh(geom, simulationMaterial));


  //6 the particles:
  //create a vertex buffer of size width * height with normalized coordinates
  var particleCount = (width * height);
  var vertices = new Float32Array(particleCount * 3);
  for (var i = 0; i < particleCount; i++) {
    var i3 = i * 3;
    vertices[i3] = (i % width) / width;
    vertices[i3 + 1] = (i / width) / height;
  }

  //create the particles geometry
  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));


  const colorUVArray = new Float32Array(particleCount * 2);

  for (let i = 0, i2 = 0, i3 = 0, l = particleCount; i < l; i++, i2 += 2, i3 += 3) {
    colorUVArray[i2] = i / particleCount;
    colorUVArray[i2 + 1] = 0.5;
  }
  geometry.setAttribute('colorUV', new THREE.BufferAttribute(colorUVArray, 2));

  //the rendermaterial is used to render the particles
  particles = new THREE.Points(geometry, renderMaterial);
};

//7 update loop
function updateFBO() {

  //1 update the simulation and render the result in a target texture
  // renderer.render( scene, orthoCamera, rtt, true );
  renderer.setRenderTarget(rtt);
  renderer.render(fboScene, orthoCamera);
  renderer.setRenderTarget(null);

  //2 use the result of the swap as the new position for the particles' renderer
  particles.material.uniforms.positions.value = rtt.texture;
};

var scene, camera, renderer;
var simulationShader, renderShader;
var canvas;

var counter = 0;
var img1, img2, controls;

function loadImage(src, callback) {
  // console.log(gradientImage);
  var img = new Image();
  img.onload = function(e) {
    callback(src, img);
  };
  img.crossOrigin = "anonymous";
  img.src = src;
  // console.log(src)
}

function loadAllImages() {
  // use inline callback functions that store images to their variable,
  // and then call the function that checks if we're done
  loadImage(noiseImage, (src, img) => {
    img1 = img;
    imgDidLoad();
  });
  loadImage(gradientImage, (src, img) => {
    img2 = img;
    imgDidLoad();
  });
}

function imgDidLoad() {
  counter++;
  if (counter == 2) init(img1, img2);
}

const texture = new THREE.TextureLoader().load('textures/gradient.png');
// console.log(texture);


function init(img1, img2) {

  const gui = new dat.GUI();
  const debugObject = {};
  debugObject.depthColor = '#186691';

  var w = window.innerWidth;
  var h = window.innerHeight;

  //regular scene creation
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, w / h, 1, 10000);
  camera.position.z = 250;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(w, h);
  document.body.appendChild(renderer.domElement);


  //FOR IMAGE
  var width = img1.width;
  var height = img1.height;
  var particleCount = width * height;
  // var width = 512;
  // var height = 512;
  // var elevation = 128;
  // var data = getImage(img1, width, height, elevation);
  // var data2 = getImage(img1, width, height, elevation);


  positions = new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    stencilBuffer: false
  });

  positions2 = positions.clone();



  // var positions = new THREE.DataTexture(getBetterImage(width, width), width, height, THREE.RGBFormat, THREE.FloatType);
  // positions = new THREE.DataTexture(data, width, height, THREE.RGBFormat, THREE.FloatType);
  // positions.needsUpdate = true;
  //
  // positions2 = new THREE.DataTexture(data2, width, height, THREE.RGBFormat, THREE.FloatType);
  // positions2.needsUpdate = true;

  //first model
  // var dataA = getImage(img1, width, height, elevation);
  // var textureA = new THREE.DataTexture(data, width, height, THREE.RGBFormat, THREE.FloatType);
  // textureA.needsUpdate = true;

  //Swap textures with render targets. Can't update values with the textures.
  var textureA = new THREE.TextureLoader().load('textures/noise.jpg');
  // textureA.needsUpdate = true;


  var textureB = new THREE.TextureLoader().load('textures/noise.jpg');

  simulationShader = new THREE.ShaderMaterial({

    uniforms: {
      positions: {
        type: "t",
        value: positions.texture,
      },
      positionsOld: {
        type: "t",
        value: positions2.texture,
      },
      textureA: {
        type: "t",
        value: textureA
      },
      textureA: {
        type: "t",
        value: textureB
      },
      uTime: {
        value: 0.0,
      },
      uTexture1Elevation: {
        value: new THREE.Vector3(10.0, 10.0, 10.0),
      },
      uTexture2Elevation: {
        value: new THREE.Vector3(20.0, 15.0, 10.0),
      },

    },
    vertexShader: fboVertex,
    fragmentShader: fboFragment
  });

  gui.add(simulationShader.uniforms.uTexture1Elevation.value, 'x').min(0).max(30).step(0.001).name('uTexture1ElevationX');
  gui.add(simulationShader.uniforms.uTexture1Elevation.value, 'y').min(0).max(30).step(0.001).name('uTexture1ElevationY');
  gui.add(simulationShader.uniforms.uTexture1Elevation.value, 'z').min(0).max(30).step(0.001).name('uTexture1ElevationZ');

  gui.add(simulationShader.uniforms.uTexture2Elevation.value, 'x').min(0).max(30).step(0.001).name('uTexture2ElevationX');
  gui.add(simulationShader.uniforms.uTexture2Elevation.value, 'y').min(0).max(30).step(0.001).name('uTexture2ElevationY');
  gui.add(simulationShader.uniforms.uTexture2Elevation.value, 'z').min(0).max(30).step(0.001).name('uTexture2ElevationZ');

  //this will be used to represent the particles on screen
  //note that 'positions' is a texture that will be set and updated during the FBO.update() call
  renderShader = new THREE.ShaderMaterial({
    uniforms: {
      positions: {
        type: "t",
        value: null
      },
      pointSize: {
        type: "f",
        value: 1
      },
      uTime: {
        value: 0.0,
      },
      map: {
        value: texture
      },
      uDepthColor: {
        value: new THREE.Color(debugObject.depthColor)
      },
      uColorFrequency: {
        value: 0.5
      },
      uMult: {
        value: 100.0
      }
    },

    vertexShader: renderVertex,
    fragmentShader: '#define USE_MAP\n' + renderFragment
  });

  gui.add(renderShader.uniforms.uMult, 'value').min(0).max(1000).step(1).name('uMult');

  gui.addColor(debugObject, 'depthColor').name('depthColor').onChange(() => {
    renderShader.uniforms.uDepthColor.value.set(debugObject.depthColor)
  });
  gui.add(renderShader.uniforms.uColorFrequency, 'value').min(0).max(5).step(0.01).name('uColorFrequency');
  gui.add(renderShader.uniforms.pointSize, 'value').min(0).max(5).step(0.01).name('pointSize');


  renderShader.uniforms.map.value = texture;
  renderShader.map = texture;
  // console.log(renderShader.map);

  const geometry = new THREE.PlaneGeometry(50, 50, 1);
  const plane = new THREE.Mesh(geometry, simulationShader);
  plane.position.y = 100;
  scene.add(plane);

  // const geometry2 = new THREE.PlaneGeometry(50, 50, 1);
  // const plane2 = new THREE.Mesh(geometry2, positions);
  // plane2.position.y = 100;
  // plane2.position.x = 100;
  // scene.add(plane2);
  //
  // const geometry3 = new THREE.PlaneGeometry(50, 50, 1);
  // const plane3 = new THREE.Mesh(geometry, positions2);
  // plane3.position.y = 100;
  // plane3.position.x = -100;
  // scene.add(plane3);

  //init the FBO
  initParticles(width, height, renderer, simulationShader, renderShader);
  scene.add(particles);

  //GO !
  window.addEventListener("resize", onResize);
  onResize();
  update();



  // controls = new OrbitControls(camera, canvas)
  // console.log(controls);
  // controls.enableDamping = true
}


function getBetterImage(width, height) {
  const size = width * height;
  const data = new Uint8Array(3 * size);
  const color = new THREE.Color(0xffffff);

  // const r = Math.floor(color.r * 255);

  for (let i = 0; i < size; i++) {
    let r = Math.floor(Math.random() * 255) * 500;
    let g = Math.floor(Math.random() * 255) * 500;
    let b = Math.floor(Math.random() * 255) * 500;

    const stride = i * 3;

    data[stride] = r;
    data[stride + 1] = g;
    data[stride + 2] = b;

  }
  // console.log(data);

}

//returns a Float32Array buffer of 3D points after an image
function getImage(img, width, height, elevation) {

  var ctx = getContext(null, width, height);
  ctx.drawImage(img, 0, 0);

  var imgData = ctx.getImageData(0, 0, width, height);
  var iData = imgData.data;

  var l = (width * height);
  var data = new Float32Array(l * 3);
  for (var i = 0; i < l; i++) {

    var i3 = i * 3;
    var i4 = i * 4;
    data[i3] = ((i % width) - width * .5);
    data[i3 + 1] = (iData[i4] / 0xFF * 0.299 + iData[i4 + 1] / 0xFF * 0.587 + iData[i4 + 2] / 0xFF * 0.114) * elevation;
    data[i3 + 2] = (parseInt(i / width) - height * .5);
  }
  return data;
}


function getCanvas(w, h) {

  canvas = document.createElement("canvas");
  canvas.width = w || 512;
  canvas.height = h || 512;
  return canvas;
}

function getContext(canvas, w, h) {

  canvas = canvas || getCanvas(w, h);
  canvas.width = w || canvas.width;
  canvas.height = h || canvas.height;
  return canvas.getContext("2d");
}



//returns an array of random 3D coordinates
function getRandomData(width, height, size) {

  var len = width * height * 3;
  var data = new Float32Array(len);
  while (len--) data[len] = (Math.random() - .5) * size;
  return data;
}

function onResize() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

//update loop
function update() {
  requestAnimationFrame(update);

  // particles.rotation.x+= Math.PI / 180 * .5;
  // particles.rotation.y -= Math.PI / 180 * .5;
  simulationShader.uniforms.uTime.value = performance.now() / 1000;
  renderShader.uniforms.uTime.value = performance.now() / 1000;

  if (framecount % 2 == 0) {
    simulationShader.uniforms.positions.texture = positions;
    simulationShader.uniforms.positionsOld.texture = positions2;
    renderShader.uniforms.positions.texture = positions;

  } else {
    simulationShader.uniforms.positions.texture = positions2;
    simulationShader.uniforms.positionsOld.texture = positions;
    renderShader.uniforms.positions.texture = positions2;

  }

  updateFBO();

  // particles.position.z = -128;
  // particles.rotation.
  particles.rotation.y = -Math.PI / 4;
  camera.lookAt(particles.position);


  // controls.update();
  //render the particles at the new location
  renderer.render(scene, camera);

  framecount++;
}

// loadImage();

loadAllImages();