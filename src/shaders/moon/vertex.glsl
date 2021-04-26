varying vec3 vUv;
uniform float uTime;
varying float vElevation;
#define PI 3.1415926538

 void main() {
   vUv = position;

   vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
   //Attempt at Rotation
   // float rads = uTime * PI * 2.0;
   // modelPosition.x += cos(rads);
   // modelPosition.z += sin(rads);
   gl_Position = projectionMatrix * modelPosition;

   // vElevation = elevation;
 }
