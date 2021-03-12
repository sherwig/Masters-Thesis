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
  // buildParticles();
  // seaBuilder.buildParticles();
  buildDoubleBuffer();
  bufferBuiltForSpeed();
  // startAnimation();
}

class buildBuffers {
  constructor(fragmentShader, simSize) {
    // this.doubleBuffer = doubleBuffer;
    this.simSize = simSize;
    this.fragmentShader = fragmentShader;
    this.buildBuffers();
  }

  buildBuffers() {
    this.offset = new THREE.Vector2(0, 0);
    this.bufferMaterial = new THREE.ShaderMaterial({
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
          value: new THREE.Vector2(this.simSize, this.simSize)
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
        },
        rotAmp: {
          type: "f",
          value: 3.0
        }
      },
      fragmentShader: this.fragmentShader
    });
    this.doubleBuffer = new ThreeDoubleBuffer(this.simSize, this.simSize, this.bufferMaterial, true);

    this.scene.add(this.doubleBuffer.displayMesh);
    this.doubleBuffer.displayMesh.scale.set(0.2, 0.2, 0.2);
  }
}
//
// var buffer1 = new buildBuffers(fboFragment, simSize)

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
      },
      rotAmp: {
        type: "f",
        value: 3.0
      }
    },
    fragmentShader: fboFragment
  });
  doubleBuffer = new ThreeDoubleBuffer(simSize, simSize, bufferMaterial, true);

  // add double buffer plane to main THREE scene
  scene.add(doubleBuffer.displayMesh);
  doubleBuffer.displayMesh.scale.set(0.2, 0.2, 0.2);

  gui.add(bufferMaterial.uniforms.globalSpeed, 'value').min(0).max(1).step(0.0001).name('globalSpeed');
  gui.add(bufferMaterial.uniforms.rotAmp, 'value').min(0).max(10).step(0.1).name('rotAmp');
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
      },
      zoom: {
        type: "f",
        value: 40.0
      },
      zoomOut: {
        type: "f",
        value: 0.001
      },
      vUvOffsetNoise: {
        type: "f",
        value: .2
      },
      vUvOffsetWaves: {
        type: "f",
        value: .06
      },
      uBigWavesElevation: {
        type: "f",
        value: .6
      },
      uBigWavesFrequency: {
        type: "f",
        value: new THREE.Vector2(5, 5)
      },
      uBigWavesSpeed: {
        type: "f",
        value: 0.75
      },
    },
    fragmentShader: fboSpeed
  });
  doubleSpeedBuffer = new ThreeDoubleBuffer(simSize, simSize, speedMaterial, true);

  // add double buffer plane to main THREE scene
  scene.add(doubleSpeedBuffer.displayMesh);
  doubleSpeedBuffer.displayMesh.scale.set(0.2, 0.2, 0.2);
  doubleSpeedBuffer.displayMesh.position.set(60, 0, 0);


  gui.add(speedMaterial.uniforms.speed, 'value').min(0).max(0.01).step(0.0001).name('speedSpeed');
  gui.add(speedMaterial.uniforms.zoom, 'value').min(0).max(1000).step(1).name('noiseZoom');
  gui.add(speedMaterial.uniforms.zoomOut, 'value').min(0).max(.01).step(0.00001).name('zoomOut');
  gui.add(speedMaterial.uniforms.vUvOffsetNoise, 'value').min(0).max(5).step(.01).name('vUvOffsetNoise');
  gui.add(speedMaterial.uniforms.vUvOffsetWaves, 'value').min(0).max(5).step(.01).name('vUvOffsetWaves');
  gui.add(speedMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation');
  gui.add(speedMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX');
  gui.add(speedMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY');
  gui.add(speedMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(5).step(0.001).name('uBigWavesSpeed');

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




class particleBuilder {
  constructor(width, height, simSize, fragmentShader, vertexShader, debugObject) {
    this.width = width;
    this.height = height;
    this.simSize = simSize;
    this.fragmentShader = fragmentShader;
    this.vertexShader = vertexShader;
    this.debugObject = debugObject;
    this.buildParticles();
  }

  buildParticles() {
    this.buffGeom = new THREE.PlaneBufferGeometry(1, 1, 1);
    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.index = this.buffGeom.index;
    this.geometry.attributes = this.buffGeom.attributes;

    var particleCount = this.width * this.height;
    var meshRadius = 200;
    var meshDepth = 400;

    this.translateArray = new Float32Array(particleCount * 3);
    this.colorUVArray = new Float32Array(particleCount * 2);

    for (let i = 0, i2 = 0, i3 = 0, l = particleCount; i < l; i++, i2 += 2, i3 += 3) {
      this.translateArray[i3 + 0] = -1 + 2 * ((i % this.simSize) / this.simSize);
      this.translateArray[i3 + 1] = -1 + 2 * (Math.floor(i / this.simSize) / this.simSize);
      this.translateArray[i3 + 2] = 0.;

      this.colorUVArray[i2 + 0] = ((i % this.simSize) / this.simSize); // i/particleCount;
      this.colorUVArray[i2 + 1] = (Math.floor(i / this.simSize) / this.simSize); // 0.5
    }

    this.geometry.setAttribute('translate', new THREE.InstancedBufferAttribute(this.translateArray, 3));
    this.geometry.setAttribute('colorUV', new THREE.InstancedBufferAttribute(this.colorUVArray, 2));

    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: {
          value: new THREE.TextureLoader().load('textures/circle.png')
        },
        colorMap: {
          value: new THREE.TextureLoader().load(gradientImage)
        },
        positionsMap: {
          value: null
        },
        uTime: {
          value: 0.0
        },
        fullScale: {
          value: 1.0
        },
        xScale: {
          value: 1.5
        },
        yScale: {
          value: 1.5
        },
        zScale: {
          value: 0.2
        },
        uDepthColor: {
          value: new THREE.Color(debugObject.depthColor)
        },
        uSurfaceColor: {
          value: new THREE.Color(debugObject.surfaceColor)
        },
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending, // handle z-stacking, instead of more difficult measures: https://discourse.threejs.org/t/threejs-and-the-transparent-problem/11553/7
    });

    this.mesh = new THREE.Mesh(this.geometry, this.particleMaterial);
    this.mesh.scale.set(meshRadius, meshRadius, meshDepth);
    // mesh.rotatation.x = Math.PI;
    this.mesh.rotation.x = Math.PI / 2;
    scene.add(this.mesh);
  }

  getUniform(key) {
    return this.particleMaterial.uniforms[key].value;
  };

  getTexture() {
    return this.particleMaterial;
  };

  setUniform(key, val) {
    this.particleMaterial.uniforms[key].value = val;
  };

}

const debugObject = {};
debugObject.depthColor = '#186691';
debugObject.surfaceColor = '#9bd8ff';

const seaBuilder = new particleBuilder(simSize, simSize, simSize, renderFragment, renderVertex, debugObject);

gui.add(seaBuilder.particleMaterial.uniforms.fullScale, 'value').min(0).max(10).step(0.01).name('fullScale');
gui.add(seaBuilder.particleMaterial.uniforms.xScale, 'value').min(0).max(3).step(0.01).name('xScale');
gui.add(seaBuilder.particleMaterial.uniforms.yScale, 'value').min(0).max(3).step(0.01).name('yScale');
gui.add(seaBuilder.particleMaterial.uniforms.zScale, 'value').min(0).max(3).step(0.01).name('zScale');
gui.addColor(debugObject, 'depthColor').name('depthColor').onChange(() => {
  seaBuilder.particleMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
});

gui.addColor(debugObject, 'surfaceColor').name('surfaceColor').onChange(() => {
  seaBuilder.particleMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
});


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
  seaBuilder.setUniform("uTime", time);
  // particleMaterial.uniforms["uTime"].value = time;
  seaBuilder.setUniform("positionsMap", doubleBuffer.getTexture());
  // particleMaterial.uniforms["positionsMap"].value = doubleBuffer.getTexture();
  speedMaterial.uniforms["positions"].value = doubleBuffer.getTexture();


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