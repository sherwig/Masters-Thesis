
varying float vElevation;

void main() {

    float mixStrength = (vElevation)*0.5;
    vec3 depthColor = vec3(0.7,0.3,1.0);
    vec3 surfaceColor = vec3(0.0,0.0,0.0);
    vec3 color = mix(surfaceColor, depthColor,mixStrength);
    gl_FragColor = vec4(color, 1.0);
  }
