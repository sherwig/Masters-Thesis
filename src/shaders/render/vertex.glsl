uniform sampler2D positions;//RenderTarget containing the transformed positions
uniform float pointSize;//size
uniform float uTime;

attribute vec2 colorUV;

varying vec2 vUv;
varying float vElevation;
varying vec2 vColorUV;
uniform float uMult;

void main() {

    //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices
    vec3 pos = texture2D( positions, position.xy ).xyz;
    //pos now contains a 3D position in space, we can use it as a regular vertex
    float elevation = pos.y;

    pos*=uMult;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

    gl_PointSize = pointSize;
    // vUv=position.xy;
    vUv=uv;
    vElevation = elevation;
    vColorUV = colorUV;

}
