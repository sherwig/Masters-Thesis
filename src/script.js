import './style.css'
// import './fbo.js'
// import * as FBO from './fbo.js';
import * as THREE from 'three'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
import ThreeDoubleBuffer from 'fbo.js';
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


buildDoubleBuffer() {
  this.offset = new THREE.Vector2(0, 0);
  let bufferMaterial = new THREE.ShaderMaterial({
    uniforms: {
      lastFrame: {
        type: "t",
        value: null
      },
      imgTex: {
        type: "t",
        value: new THREE.TextureLoader().load('../images/checkerboard-16-9.png')
      },
      res: {
        type: "v2",
        value: new THREE.Vector2(this.simSize, this.simSize)
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
        value: this.offset
      },
    },
    fragmentShader: fshader
  });
  this.doubleBuffer = new ThreeDoubleBuffer(this.simSize, this.simSize, bufferMaterial, true);

  // add double buffer plane to main THREE scene
  this.scene.add(this.doubleBuffer.displayMesh);
  this.doubleBuffer.displayMesh.scale.set(0.2, 0.2, 0.2);

  // add debug rednerer & add to DOM
  if (this.debugRender) {
    this.debugRenderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false
    });
    this.debugRenderer.setClearColor(0xff000000, 0);
    this.debugRenderer.setPixelRatio(window.devicePixelRatio || 1);
    this.debugRenderer.setSize(this.simSize, this.simSize);
    this.debugEl.appendChild(this.debugRenderer.domElement);
  }
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


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

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

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    //update material
    material.uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    w