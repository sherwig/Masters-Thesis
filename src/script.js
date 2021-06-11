import './style.css'
import * as THREE from 'three'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import fboFragment from './shaders/fbo/fragment.glsl'
import fboVertex from './shaders/fbo/vertex.glsl'
import fboSpeed from './shaders/fbo/speed_frag.glsl'
import renderFragment from './shaders/render/fragment.glsl'
import renderVertex from './shaders/render/vertex.glsl'
import fboMountainVertex from './shaders/fboMountains/vertex.glsl'
import fboMountainFragment from './shaders/fboMountains/fragment.glsl'
import renderMountainFragment from './shaders/renderMountains/fragment.glsl'
import renderMountainVertex from './shaders/renderMountains/vertex.glsl'
import moonFragment from './shaders/moon/fragment.glsl'
import moonVertex from './shaders/moon/vertex.glsl'
import fireflyFragment from './shaders/fireflies/fragment.glsl'
import fireflyVertex from './shaders/fireflies/vertex.glsl'
import backgroundFragment from './shaders/background/fragment.glsl'
import backgroundVertex from './shaders/background/vertex.glsl'


const gui = new dat.GUI();
dat.GUI.toggleHide();

// Canvas
const canvas = document.querySelector('canvas.webgl');
// Scene
const scene = new THREE.Scene();

var doubleBuffer, doubleSpeedBuffer, mountainBuffer;

var bodyGetter = document.getElementsByTagName('body')[0];

window.onload = function() {
  bodyGetter.style.opacity = 1;
}

var htmlControls = document.getElementById('controls');

setTimeout(function() {
  htmlControls.style.display = 'none';
}, 5000);


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

  buildDoubleBuffer();
  bufferBuiltForSpeed();
  buildMountainBuffer();

}

class buildBuffers {
  constructor(fragmentShader, simSize) {
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
        res: {
          type: "v2",
          value: new THREE.Vector2(this.simSize, this.simSize)
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

    // this.scene.add(this.doubleBuffer.displayMesh);
    // this.doubleBuffer.displayMesh.scale.set(0.2, 0.2, 0.2);
  }
}

function buildDoubleBuffer() {
  var offset = new THREE.Vector2(0, 0);
  let bufferMaterial = new THREE.ShaderMaterial({
    uniforms: {
      lastFrame: {
        type: "t",
        value: null
      },
      res: {
        type: "v2",
        value: new THREE.Vector2(simSize, simSize)
      },
      uTime: {
        type: "f",
        value: 0
      },
      globalSpeed: {
        type: "f",
        value: 0.8
      },
      divider: {
        type: "f",
        value: 750
      },
      speedMap: {
        type: "t",
        value: null
      },
      rotAmp: {
        type: "f",
        value: 5.0
      }
    },
    fragmentShader: fboFragment
  });
  doubleBuffer = new ThreeDoubleBuffer(simSize, simSize, bufferMaterial, true);

  // add double buffer plane to main THREE scene
  // scene.add(doubleBuffer.displayMesh);
  // doubleBuffer.displayMesh.scale.set(0.2, 0.2, 0.2);
  // doubleBuffer.displayMesh.position.set(60, 0, 0);

  gui.add(bufferMaterial.uniforms.globalSpeed, 'value').min(0).max(2).step(0.0001).name('globalSpeed');
  // gui.add(bufferMaterial.uniforms.rotAmp, 'value').min(0).max(30).step(0.1).name('rotAmp');

  gui.add(bufferMaterial.uniforms.divider, 'value').min(0).max(1000).step(1).name('divider');
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
      res: {
        type: "v2",
        value: new THREE.Vector2(simSize, simSize)
      },
      uTime: {
        type: "f",
        value: 0
      },
      positions: {
        type: "t",
        value: null
      },
      twister: {
        type: "f",
        value: 10.0
      },
      waveAdder: {
        type: "f",
        value: 0.2
      }

    },
    fragmentShader: fboSpeed
  });
  doubleSpeedBuffer = new ThreeDoubleBuffer(simSize, simSize, speedMaterial, true);

  // add double buffer plane to main THREE scene
  // scene.add(doubleSpeedBuffer.displayMesh);
  // doubleSpeedBuffer.displayMesh.scale.set(0.2, 0.2, 0.2);
  // doubleSpeedBuffer.displayMesh.position.set(-60, 0, 0);

  gui.add(speedMaterial.uniforms.twister, 'value').min(0).max(40).step(0.1).name('twister');
  gui.add(speedMaterial.uniforms.waveAdder, 'value').min(0).max(1).step(0.01).name('waveAdder');

}

var mountainMaterial;

function buildMountainBuffer() {
  var offset = new THREE.Vector2(0, 0);
  mountainMaterial = new THREE.ShaderMaterial({
    uniforms: {
      lastFrame: {
        type: "t",
        value: null
      },
      res: {
        type: "v2",
        value: new THREE.Vector2(simSize, simSize)
      },
      uTime: {
        type: "f",
        value: 0
      },
      globalSpeed: {
        type: "f",
        value: 0.8
      },
      speedMap: {
        type: "t",
        value: null
      },
      xFreq: {
        type: "f",
        value: 5.0
      },
      yFreq: {
        type: "f",
        value: 5.0
      },
      noiseSpeed: {
        type: "f",
        value: 3.0
      },
      elevation: {
        type: "f",
        value: 0.2
      }
    },
    fragmentShader: fboMountainFragment
  });
  mountainBuffer = new ThreeDoubleBuffer(simSize, simSize, mountainMaterial, true);

  // add double buffer plane to main THREE scene
  // scene.add(mountainBuffer.displayMesh);
  // mountainBuffer.displayMesh.scale.set(0.2, 0.2, 0.2);

  gui.add(mountainMaterial.uniforms.globalSpeed, 'value').min(0).max(1).step(0.00001).name('globalSpeed');
  gui.add(mountainMaterial.uniforms.xFreq, 'value').min(0).max(10).step(0.1).name('xFreq');
  gui.add(mountainMaterial.uniforms.yFreq, 'value').min(0).max(10).step(0.1).name('yFreq');
  gui.add(mountainMaterial.uniforms.noiseSpeed, 'value').min(0).max(30).step(0.1).name('noiseSpeed');
  gui.add(mountainMaterial.uniforms.elevation, 'value').min(0).max(3.0).step(0.01).name('elevation');

}


class ParticleBuilder {
  constructor(width, height, simSize, fragmentShader, vertexShader, debugObject, positionX, positionY, positionZ, meshRadius, meshDepth, rotX, rotY, rotZ) {
    this.width = width;
    this.height = height;
    this.simSize = simSize;
    this.fragmentShader = fragmentShader;
    this.vertexShader = vertexShader;
    this.debugObject = debugObject;
    this.positionX = positionX;
    this.positionY = positionY;
    this.positionZ = positionZ;
    this.meshRadius = meshRadius;
    this.meshDepth = meshDepth;
    this.rotX = rotX;
    this.rotY = rotY;
    this.rotZ = rotZ;
    this.buildParticles();
    this.buildGui();
  }

  buildParticles() {
    this.buffGeom = new THREE.PlaneBufferGeometry(1, 1, 1);
    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.index = this.buffGeom.index;
    this.geometry.attributes = this.buffGeom.attributes;

    var particleCount = this.width * this.height;
    // this.meshRadius = 200;
    // this.meshDepth = 400;

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
          value: 0.5
        },
        uDepthColor: {
          value: new THREE.Color(this.debugObject.depthColor)
        },
        uSurfaceColor: {
          value: new THREE.Color(this.debugObject.surfaceColor)
        },
        stepper: {
          value: 1.0
        }
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending, // handle z-stacking, instead of more difficult measures: https://discourse.threejs.org/t/threejs-and-the-transparent-problem/11553/7
    });

    this.mesh = new THREE.Mesh(this.geometry, this.particleMaterial);
    this.mesh.scale.set(this.meshRadius, this.meshRadius, this.meshDepth);
    this.mesh.position.set(this.positionX, this.positionY, this.positionZ);
    // mesh.rotatation.x = Math.PI;
    // this.mesh.rotation.x = Math.PI / 2;
    this.mesh.rotation.set(this.rotX, this.rotY, this.rotZ);

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

  buildGui() {
    gui.add(this.particleMaterial.uniforms.fullScale, 'value').min(0).max(10).step(0.01).name('fullScale');
    gui.add(this.particleMaterial.uniforms.xScale, 'value').min(0).max(3).step(0.01).name('xScale');
    gui.add(this.particleMaterial.uniforms.yScale, 'value').min(0).max(3).step(0.01).name('yScale');
    gui.add(this.particleMaterial.uniforms.zScale, 'value').min(0).max(3).step(0.01).name('zScale');
    gui.add(this.particleMaterial.uniforms.stepper, 'value').min(-1).max(500).step(0.1).name('stepper');
    gui.addColor(this.debugObject, 'depthColor').name('depthColor').onChange(() => {
      this.particleMaterial.uniforms.uDepthColor.value.set(this.debugObject.depthColor)
    });
    gui.addColor(this.debugObject, 'surfaceColor').name('surfaceColor').onChange(() => {
      this.particleMaterial.uniforms.uSurfaceColor.value.set(this.debugObject.surfaceColor)
    });
  }

}


// const debugObject = {};
// debugObject.depthColor = '#186691';
// debugObject.surfaceColor = '#9bd8ff';

const seaBuilder = new ParticleBuilder(simSize, simSize, simSize, renderFragment, renderVertex, {
  depthColor: '#186691',
  surfaceColor: '#9bd8ff'
}, 0, 0, 0, 200, 400, Math.PI / 2, 0, 0);

const mountainBuilder = new ParticleBuilder(simSize, simSize, simSize, renderMountainFragment, renderMountainVertex, {
    depthColor: '#26a1f0',
    surfaceColor: '#050822'
  },
  0, 0, 0, 400, 600, Math.PI / 2, 0, 0);


const moonDebug = {
  depthColor: '#000000',
  surfaceColor: '#8A2BE2'
}


const moonGeometry = new THREE.SphereGeometry(40, 32, 32);
const moonMaterial = new THREE.ShaderMaterial({
  uniforms: {

    uTime: {
      value: 1.0
    },
    uDepthColor: {
      value: new THREE.Color(moonDebug.depthColor)
    },
    uSurfaceColor: {
      value: new THREE.Color(moonDebug.surfaceColor)
    },

  },
  vertexShader: moonVertex,
  fragmentShader: moonFragment

})
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(0, 200, -200);
scene.add(moon);


gui.addColor(moonDebug, 'depthColor').name('moonDepth').onChange(() => {
  moonMaterial.uniforms.uDepthColor.value.set(moonDebug.depthColor)
});

gui.addColor(moonDebug, 'surfaceColor').name('moonSurface').onChange(() => {
  moonMaterial.uniforms.uSurfaceColor.value.set(moonDebug.surfaceColor)
});

const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 3000
const positionArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount)

for (let i = 0; i < firefliesCount; i++) {
  positionArray[i * 3 + 0] = (Math.random() - 0.5) * 800
  positionArray[i * 3 + 1] = Math.random() * 250
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 800

  scaleArray[i] = Math.random()
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

// Material
const firefliesMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: {
      value: 0
    },
    uPixelRatio: {
      value: Math.min(window.devicePixelRatio, 2)
    },
    uSize: {
      value: 2500
    }
  },
  vertexShader: fireflyVertex,
  fragmentShader: fireflyFragment,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
})

gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(5000).step(1).name('firefliesSize')

// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
fireflies.position.set(0, 200, 0);
scene.add(fireflies);


const spheregeom = new THREE.SphereGeometry(3000, 128, 128);
const sphereMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: {
      value: 0
    }
  },
  fragmentShader: backgroundFragment,
  vertexShader: backgroundVertex,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide
});
//
const backgroundSphere = new THREE.Mesh(spheregeom, sphereMaterial);
scene.add(backgroundSphere);


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})


const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 20000);
scene.add(camera);
camera.position.set(300, 300, 400);

const listener = new THREE.AudioListener();
camera.add(listener);

// create a global audio source
const sound = new THREE.Audio(listener);

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
var clickcounter = 0;

var startButton = document.getElementById('startButton');

startButton.addEventListener('click', function() {
  clickcounter += 1;
  if (clickcounter % 2 === 1) {
    audioLoader.load('sounds/pad.wav', function(buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();
    });
  } else if (clickcounter % 2 === 0) {
    sound.pause();
  }
}, false);


// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 800.0;
controls.minDistance = 100.0;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2.5;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


function updateObjects() {
  // update shader
  const time = performance.now() * 0.0001;
  seaBuilder.setUniform("uTime", time);
  seaBuilder.setUniform("positionsMap", doubleBuffer.getTexture());

  speedMaterial.uniforms["positions"].value = doubleBuffer.getTexture();

  mountainBuilder.setUniform("uTime", time);
  mountainBuilder.setUniform("positionsMap", mountainBuffer.getTexture());

  const cameraAmp = 2;
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
  moonMaterial.uniforms.uTime.value = time;
  firefliesMaterial.uniforms.uTime.value = elapsedTime;
  sphereMaterial.uniforms.uTime.value = elapsedTime;
  // materialVortex.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  updateObjects();

  doubleSpeedBuffer.setUniform('uTime', time);
  doubleSpeedBuffer.render(renderer);

  doubleBuffer.setUniform('uTime', time);
  doubleBuffer.setUniform("speedMap", doubleSpeedBuffer.getTexture());

  doubleBuffer.render(renderer);


  mountainBuffer.setUniform('uTime', time);
  mountainBuffer.render(renderer);


  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
}

init();

tick();