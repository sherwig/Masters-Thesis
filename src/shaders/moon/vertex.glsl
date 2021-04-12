varying vec3 vUv;
uniform float uTime;
varying float vElevation;

 void main() {
   vUv = position;

   vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
   gl_Position = projectionMatrix * modelPosition;

   // vElevation = elevation;
 }
