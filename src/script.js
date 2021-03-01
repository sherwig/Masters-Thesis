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
import renderFragment from './shaders/render/fragment.glsl'
import renderVertex from './shaders/render/vertex.glsl'
import noiseImage from '../static/textures/noise.jpg'
import gradientImage from '../static/textures/gradient.png'

const gui = new dat.GUI()
// Canvas
const canvas = document.querySelector('canvas.webgl')
// Scene
const scene = new THREE.Scene()

const texture = new THREE.TextureLoader().load('textures/gradient.png');

var doubleBuffer;

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

var simSize = 256;

function init() {
  // this.simSize = 256;
  // this.buildColorMapFbo();
  buildParticles();
  buildDoubleBuffer();
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
        value: new THREE.TextureLoader().load('textures/gradient.png')
      },
      res: {
        type: "v2",
        value: new THREE.Vector2(simSize, simSize)
      },
      time: {
        type: "f",
        value: 0
      },
      zoom: {
        type: "f",
        value: 1
      },
      rotation: {
        type: "f",
        value: 0
      },
      mixOriginal: {
        type: "f",
        value: 0.1
      },
      offset: {
        type: "v2",
        value: offset
      },
    },
    fragmentShader: fboFragment
  });
  doubleBuffer = new ThreeDoubleBuffer(simSize, simSize, bufferMaterial, true);

  // add double buffer plane to main THREE scene
  scene.add(doubleBuffer.displayMesh);
  doubleBuffer.displayMesh.scale.set(0.2, 0.2, 0.2);


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
    translateArray[i3 + 0] = Math.random() * 2 - 1;
    translateArray[i3 + 1] = Math.random() * 2 - 1;
    translateArray[i3 + 2] = Math.random() * 2 - 1;

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
      "time": {
        value: 0.0
      },
    },
    vertexShader: renderVertex,
    fragmentShader: renderFragment,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending, // handle z-stacking, instead of more difficult measures: https://discourse.threejs.org/t/threejs-and-the-transparent-problem/11553/7
  });



  mesh = new THREE.Mesh(geometry, particleMaterial);
  mesh.scale.set(meshRadius, meshRadius, meshDepth);
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

// camera.position.x = 3
// camera.position.y = 3
// camera.position.z = 3
scene.add(camera)
camera.position.set(0, 0, 10);
camera.lookAt(scene.position);

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

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
  particleMaterial.uniforms["time"].value = time;
  particleMaterial.uniforms["positionsMap"].value = doubleBuffer.getTexture();
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

  //update material
  // material.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update()

  updateObjects();

  doubleBuffer.setUniform('time', elapsedTime);
  doubleBuffer.setUniform('mixOriginal', 0.02);
  doubleBuffer.render(renderer);

  // updateSimulation();



  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
}

init();

tick();