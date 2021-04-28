# Sam Herwigs Master Thesis

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```

## Purpose 
I created .calm to push my creative coding and design abilities. 
I wanted to create a particle system in THREE.js that was genreative but also calming. 
Through this project I learned GLSL and several higher end creative coding concepts with a plus being it is very calming. 

## The Tech 
.calm is around a thousand lines of javascript written almost entirely with THREE.js and 15 shader files. 
Some of the shader files have communication with eacher through GpGPU and most use offscreen renderTarget buffers. 
Follow the setup to run it yourself. 


