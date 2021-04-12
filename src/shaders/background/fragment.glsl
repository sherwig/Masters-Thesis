uniform float uTime;
varying vec2 vUv;


void main()
{
    // float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    // float strength = 0.05 / distanceToCenter - 0.1;

    // gl_FragColor = vec4(sin(0.2*uTime*0.02), 0.4, 0.6, 0.6);

    float strength = distance(vUv, vec2(0.5));
    vec3 colorBlack = vec3(0.0,0.0,0.0);
    vec3 colorBlue = vec3( 0.188,0.082,0.541);
    vec3 mixedColor = mix(colorBlack, colorBlue, strength);
    gl_FragColor = vec4( mixedColor, 1.0);
}
