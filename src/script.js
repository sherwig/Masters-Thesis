import './style.css'
// import './fbo.js'
// import * as FBO from './fbo.js';
import * as THREE from 'three'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
// import ThreeDoubleBuffer from 'fbo.js'
import * as dat from 'dat.gui'
import fboFragment from './shaders/fbo/fragment.glsl'
import fboVertex from './shaders/fbo/vertex.glsl'
import fboSpeed from './shaders/fbo/speed_frag.glsl'
import renderFragment from './shaders/render/fragment.glsl'
import renderVertex from './shaders/render/vertex.glsl'
import noiseImage from '../static/textures/noise.jpg'
import gradientImage from '../static/textures/gradient.png'
// import colorImage from '../static/textures/color.jpeg'

const gui = new dat.GUI()
// Canvas
const canvas = document.querySelector('canvas.webgl')
// Scene
const scene = new THREE.Scene()

const texture = new THREE.TextureLoader().load('textures/gradient.png');

var doubleBuffer, doubleSpeedBuffer;

const debugObject = {};
debugObject.depthColor = '#186691';
debugObject.surfaceColor = '#9bd8ff';

class ThreeDoubleBuffer {
  constructor(width, height, bufferMaterial, isData = false, bgColor = 0xff0000, transparent = false) {
    this.width = width;
    this.height = height;
    this.bufferMaterial = bufferMaterial;
    this.bgColor = bgColor;
    this.transparent = transparent;
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.buildBuffers(isData);
  }

  getOptions() {
    return {
      format: THREE.RGBAFormat,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      //AntiAliasing between near pixels LieanerFilter is default
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      // type: THREE.UnsignedByteType,
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
  };

  getOptionsDataTexture() {
    return {
      format: THREE.RGBAFormat,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      //Nearest Neighbor for how they will interact with eachother
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
  };

  buildBuffers(isData) {
    // FBO scene & camera
    this.bufferScene = new THREE.Scene();
    this.bufferCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);

    // build render targets
    let options = (isData) ? this.getOptionsDataTexture() : this.getOptions();
    //Need two render targets because you can't read an write at the same time
    this.bufferA = new THREE.WebGLRenderTarget(this.width, this.height, options);
    this.bufferB = new THREE.WebGLRenderTarget(this.width, this.height, options);

    // camera-filling plane
    this.planeGeom = new THREE.PlaneBufferGeometry(this.width, this.height, 1);
    this.plane = new THREE.Mesh(
      this.planeGeom,
      this.bufferMaterial
    );
    this.plane.position.set(0, 0, 0);
    this.bufferScene.add(this.plane);

    // add mesh to show on screen if we'd like.
    // this would get attached outside of this object
    let finalMaterial = new THREE.MeshBasicMaterial({
      map: this.bufferB
    })
    this.displayMesh = new THREE.Mesh(this.planeGeom, finalMaterial);
  };

  setUniform(key, val) {
    this.bufferMaterial.uniforms[key].value = val;
  };

  getUniform(key) {
    return this.bufferMaterial.uniforms[key].value;
  };

  getWidth() {
    return this.width;
  };

  getHeight() {
    return this.height;
  };

  getPlane() {
    return this.plane;
  };

  getScene() {
    return this.bufferScene;
  };

  getCamera() {
    return this.bufferCamera;
  };
  //
  getTexture() {
    return this.bufferB.texture;
  };

  getTextureOld() {
    return this.bufferA.texture;
  };

  render(renderer, debugRenderer = null) {
    // render!
    renderer.setRenderTarget(this.bufferB);
    renderer.render(this.bufferScene, this.bufferCamera);
    renderer.setRenderTarget(null);

    // render in time if we pass one in
    // this isn't working...
    if (debugRenderer) {
      debugRenderer.render(this.bufferScene, this.bufferCamera);
    }

    // ping pong buffers
    var temp = this.bufferA;
    this.bufferA = this.bufferB;
    this.bufferB = temp;

    // swap materials in simulation scene and in display mesh
    this.bufferMaterial.uniforms.lastFrame.value = this.bufferA.texture;
    this.displayMesh.material.map = this.bufferB.texture;
  }

}

const simSize = 256;

function init() {
  // this.simSize = 256;
  // this.buildColorMapFbo();
  buildParticles();
  buildDoubleBuffer();
  bufferBuiltForSpeed();
  // startAnimation();
}

function buildDoubleBuffer() {
  var offset = new THREE.Vector2(0, 0);
  let bufferMaterial = new THREE.ShaderMaterial({
    uniforms: {
      lastFrame: {
        type: "t",
        value: null
      },
      imgTex: {
        type: "t",
        value: new THREE.TextureLoader().load('textures/noise.jpg')
      },
      res: {
        type: "v2",
        value: new THREE.Vector2(simSize, simSize)
      },
      speedTex: {
        type: "t",
        value: new THREE.TextureLoader().load('textures/noise.jpg')
      },
      uTime: {
        type: "f",
        value: 0
      },
      globalSpeed: {
        type: "f",
        value: 0.01
      },
      speedMap: {
        type: "t",
        value: null
      },
      noiseAdder: {
        type: "f",
        value: new THREE.Vector3(0.001, 0.001, 0.001)
      }
    },
    fragmentShader: fboFragment
  });
  doubleBuffer = new ThreeDoubleBuffer(simSize, simSize, bufferMaterial, true);

  // add double buffer plane to main THREE scene
  scene.add(doubleBuffer.displayMesh);
  doubleBuffer.displayMesh.scale.set(0.2, 0.2, 0.2);


  gui.add(bufferMaterial.uniforms.globalSpeed, 'value').min(0).max(5).step(0.01).name('globalSpeed');
  gui.add(bufferMaterial.uniforms.noiseAdder.value, 'x').min(0).max(0.05).step(0.0001).name('adderX');
  gui.add(bufferMaterial.uniforms.noiseAdder.value, 'y').min(0).max(0.05).step(0.0001).name('adderY');
  gui.add(bufferMaterial.uniforms.noiseAdder.value, 'z').min(0).max(0.05).step(0.0001).name('adderZ');
  // add debug rednerer & add to DOM
  // if (debugRender) {
  //   debugRenderer = new THREE.WebGLRenderer({
  //     antialias: false,
  //     alpha: false
  //   });
  //   debugRenderer.setClearColor(0xff000000, 0);
  //   debugRenderer.setPixelRatio(window.devicePixelRatio || 1);
  //   debugRenderer.setSize(this.simSize, this.simSize);
  //   debugEl.appendChild(this.debugRenderer.domElement);
  // }
}

var speedMaterial;

function bufferBuiltForSpeed() {
  var offset = new THREE.Vector2(0, 0);
  speedMaterial = new THREE.ShaderMaterial({
    uniforms: {
      lastFrame: {
        type: "t",
        value: null
      },
      imgTex: {
        type: "t",
        value: new THREE.TextureLoader().load('textures/noise.jpg')
      },
      res: {
        type: "v2",
        value: new THREE.Vector2(simSize, simSize)
      },
      speedTex: {
        type: "t",
        value: new THREE.TextureLoader().load('textures/noise.jpg')
      },
      uTime: {
        type: "f",
        value: 0
      },
      speed: {
        type: "f",
        value: 0.001
      },
      positions: {
        type: "t",
        value: null
      }
    },
    fragmentShader: fboSpeed
  });
  doubleSpeedBuffer = new ThreeDoubleBuffer(simSize, simSize, speedMaterial, true);

  // add double buffer plane to main THREE scene
  scene.add(doubleSpeedBuffer.displayMesh);
  doubleSpeedBuffer.displayMesh.scale.set(0.2, 0.2, 0.2);
  doubleSpeedBuffer.displayMesh.position.set(60, 0, 0);


  gui.add(speedMaterial.uniforms.speed, 'value').min(0).max(0.01).step(0.0001).name('speedSpeed');
  // add debug rednerer & add to DOM
  // if (debugRender) {
  //   debugRenderer = new THREE.WebGLRenderer({
  //     antialias: false,
  //     alpha: false
  //   });
  //   debugRenderer.setClearColor(0xff000000, 0);
  //   debugRenderer.setPixelRatio(window.devicePixelRatio || 1);
  //   debugRenderer.setSize(this.simSize, this.simSize);
  //   debugEl.appendChild(this.debugRenderer.domElement);
  // }
}

var mesh;
var particleMaterial;

function buildParticles() {
  // build geometry for particles
  // const buffGeom = new THREE.CircleBufferGeometry( 1, 8 );
  const buffGeom = new THREE.PlaneBufferGeometry(1, 1, 1);
  let geometry = new THREE.InstancedBufferGeometry();
  geometry.index = buffGeom.index;
  geometry.attributes = buffGeom.attributes;

  // create positions
  const particleCount = simSize * simSize;
  var meshRadius = 200;
  var meshDepth = 400;

  // create attributes arrays & assign to geometry
  const translateArray = new Float32Array(particleCount * 3);
  const colorUVArray = new Float32Array(particleCount * 2);
  // spehere helpers
  var inc = Math.PI * (3 - Math.sqrt(5));
  var x = 0;
  var y = 0;
  var z = 0;
  var r = 0;
  var phi = 0;
  var radius = 0.6;
  for (let i = 0, i2 = 0, i3 = 0, l = particleCount; i < l; i++, i2 += 2, i3 += 3) {
    // random positions inside a unit cube
    // translateArray[i3 + 0] = Math.random() * 2 - 1;
    // translateArray[i3 + 1] = Math.random() * 2 - 1;
    // translateArray[i3 + 2] = Math.random() * 2 - 1;

    // grid layout
    translateArray[i3 + 0] = -1 + 2 * ((i % simSize) / simSize);
    translateArray[i3 + 1] = -1 + 2 * (Math.floor(i / simSize) / simSize);
    translateArray[i3 + 2] = 0.;

    // evenly-spread positions on a unit sphere surface
    // var off = 2 / particleCount;
    // y = i * off - 1 + off / 2;
    // r = Math.sqrt(1 - y * y);
    // phi = i * inc;
    // x = Math.cos(phi) * r;
    // z = (0, Math.sin(phi) * r);
    // x *= radius * Math.random(); // but vary the radius to not just be on the surface
    // y *= radius * Math.random();
    // z *= radius * Math.random();
    // translateArray[ i3 + 0 ] = x;
    // translateArray[ i3 + 1 ] = y;
    // translateArray[ i3 + 2 ] = z;

    // color map progress
    colorUVArray[i2 + 0] = ((i % simSize) / simSize); // i/particleCount;
    colorUVArray[i2 + 1] = (Math.floor(i / simSize) / simSize); // 0.5
  }

  geometry.setAttribute('translate', new THREE.InstancedBufferAttribute(translateArray, 3));
  geometry.setAttribute('colorUV', new THREE.InstancedBufferAttribute(colorUVArray, 2));

  particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      "map": {
        value: new THREE.TextureLoader().load('textures/circle.png')
      },
      "colorMap": {
        value: new THREE.TextureLoader().load(gradientImage)
      },
      "positionsMap": {
        value: null
      },
      "uTime": {
        value: 0.0
      },
      "fullScale": {
        value: 1.2
      },
      "xScale": {
        value: 0.5
      },
      "yScale": {
        value: 0.5
      },
      "zScale": {
        value: 0.5
      },
      uDepthColor: {
        value: new THREE.Color(debugObject.depthColor)
      },
      uSurfaceColor: {
        value: new THREE.Color(debugObject.surfaceColor)
      },
    },
    vertexShader: renderVertex,
    fragmentShader: renderFragment,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending, // handle z-stacking, instead of more difficult measures: https://discourse.threejs.org/t/threejs-and-the-transparent-problem/11553/7
  });

  gui.add(particleMaterial.uniforms.fullScale, 'value').min(0).max(10).step(0.01).name('fullScale');
  gui.add(particleMaterial.uniforms.xScale, 'value').min(0).max(3).step(0.01).name('xScale');
  gui.add(particleMaterial.uniforms.yScale, 'value').min(0).max(3).step(0.01).name('yScale');
  gui.add(particleMaterial.uniforms.zScale, 'value').min(0).max(3).step(0.01).name('zScale');

  gui.addColor(debugObject, 'depthColor').name('depthColor').onChange(() => {
    particleMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
  });

  gui.addColor(debugObject, 'surfaceColor').name('surfaceColor').onChange(() => {
    particleMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
  });


  mesh = new THREE.Mesh(geometry, particleMaterial);
  mesh.scale.set(meshRadius, meshRadius, meshDepth);
  // mesh.rotatation.x = Math.PI;
  mesh.rotation.x = Math.PI / 2;
  // console.log(mesh);
  scene.add(mesh);
}


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}


window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 20000)
scene.add(camera)
camera.position.set(0, 0, 400);
// camera.lookAt(scene.position);

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// function updateSimulation() {
//   // update uniforms & re-render double buffer
//   // for(let i=0; i < 5; i++) {
//   doubleBuffer.setUniform('time', _frameLoop.count(0.001));
//   // this.doubleBuffer.setUniform('rotation', _frameLoop.osc(0.03, -0.003, 0.003));
//   // this.doubleBuffer.setUniform('zoom', _frameLoop.osc(0.02, 0.998, 1.004));
//   // this.offset.x = _frameLoop.osc(0.01, -0.001, 0.001);
//   // this.offset.y = 0.001;// _frameLoop.osc(0.01, -0.002, 0.002);
//   doubleBuffer.setUniform('mixOriginal', _frameLoop.osc(0.03, 0, 0.004));
//   doubleBuffer.render(this.threeScene.getRenderer(), this.debugRenderer);
//
//
//   // }
// }


function updateObjects() {
  // update shader
  const time = performance.now() * 0.0001;
  particleMaterial.uniforms["uTime"].value = time;
  particleMaterial.uniforms["positionsMap"].value = doubleBuffer.getTexture();
  speedMaterial.uniforms["positions"].value = doubleBuffer.getTexture();

  // gradientMaterial.uniforms["time"].value = time;

  // rotate shape
  const cameraAmp = 2;
  // if (!this.cameraXEase) { // lazy init rotation lerping
  //   cameraXEase = new EasingFloat(0, 0.08, 0.00001);
  //   cameraYEase = new EasingFloat(0, 0.08, 0.00001);
  // }
  // cameraYEase.setTarget(-cameraAmp + cameraAmp * 2 * this.pointerPos.xNorm(this.el)).update();
  // cameraXEase.setTarget(-cameraAmp + cameraAmp * 2 * this.pointerPos.yNorm(this.el)).update();
  // mesh.rotation.x = this.cameraXEase.value();
  // mesh.rotation.y = this.cameraYEase.value();

  // move camera z
  // this.mesh.position.set(0, 0, 0 + 200 * Math.sin(time*2));
}



/**
 * Animate
//  */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const time = performance.now() * 0.0001;

  //update material
  // material.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update()

  updateObjects();

  doubleSpeedBuffer.setUniform('uTime', time);
  doubleSpeedBuffer.render(renderer);

  doubleBuffer.setUniform('uTime', time);
  doubleBuffer.setUniform("speedMap", doubleSpeedBuffer.getTexture());

  doubleBuffer.render(renderer);



  // updateSimulation();
  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

init();

tick();