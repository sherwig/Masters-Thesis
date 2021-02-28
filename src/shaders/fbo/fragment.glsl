uniform sampler2D positions;//DATA Texture containing original positions
uniform sampler2D positionsOld;
uniform sampler2D textureA;
uniform sampler2D textureB;
uniform float uTime;
uniform vec3 uTexture1Elevation;
uniform vec3 uTexture2Elevation;
uniform float uMult;

varying vec2 vUv;
// varying float vElevation;
void main() {

    //basic simulation: displays the particles in place.
    vec4 pos = texture2D( positions, vUv ).rgba;
    vec4 posOld = texture2D( positionsOld, vUv ).rgba;

    if(pos.a==1.0)
    {
      pos.a=sin(vUv.x*6.0);
    }
    // pos.y+=sin(pos.a*5.0+uTime)*.3;
    // pos.x+=sin(pos.a*4.0+uTime)*.3;
    // pos.z+=cos(pos.a*3.0+uTime)*.3;

    pos.y+=sin(pos.a*5.0)*.3;
    pos.x+=sin(pos.a*4.0)*.3;
    pos.z+=cos(pos.a*3.0)*.3;


    // if(pos.a==1.0)
    // {
    //   posOld.a=sin(vUv.x*6.0);
    // }
    // posOld.y+=sin(posOld.a*2.0+uTime)*.3;
    // posOld.x+=sin(posOld.a*4.0+uTime)*.3;
    // posOld.z+=cos(posOld.a*1.0+uTime)*.3;

    posOld.y+=sin(posOld.a*2.0)*.3;
    posOld.x+=sin(posOld.a*4.0)*.3;
    posOld.z+=cos(posOld.a*1.0)*.3;


    // vElevation+=pos.y;

    vec4 speed = texture2D( textureA, vUv).rgba;

    if(posOld.a==1.0)
    {
      speed.a=cos(vUv.y*3.0);
    }

    // speed.y+=cos(speed.a*4.0+uTime)*.3;
    // speed.x+=sin(speed.a*6.0+uTime)*.3;
    // speed.z+=cos(speed.a*6.0+uTime)*.3;

    speed.y+=cos(speed.a*4.0)*.3;
    speed.x+=sin(speed.a*6.0)*.3;
    speed.z+=cos(speed.a*6.0)*.3;

    vec4 elevation = texture2D( textureB, vUv).rgba;
    if(speed.a==1.0)
    {
      elevation.a=cos(vUv.y*3.0)*.3;
    }

    // elevation.z+=cos(elevation.a*4.0+uTime)*.3;

    elevation.z+=cos(elevation.a*4.0)*.3;


    vec4 finalColor = mix( pos, elevation, sin(uTime*0.3) );
    // finalColor = mix (finalColor, elevation, cos(uTime*0.3));
    // finalColor = mix (finalColor, posOld, sin(uTime*0.3));


    // pos+=posOld+0.1;
    // pos += posOld * 0.001;
    // gl_FragColor = pos;
    gl_FragColor = finalColor;
    // vec4 colorizer = mix(pos,posOld,sin(uTime));

}
