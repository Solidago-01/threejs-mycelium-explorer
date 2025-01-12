import './style.css'
import * as THREE from 'three';

// Import Post Processing Tools
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


// Initializations
// ///////////////

// Init Scene
const scene = new THREE.Scene();

// Init Camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// Init Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

// Configures Renderer
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.render( scene, camera );

// Init Composer // Used in Post Processing
const composer = new EffectComposer( renderer );

// Set Up Scene Normally in Composer
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

// Add Built In Shaders
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = 0;
bloomPass.strength = .5;
bloomPass.radius = 0;
composer.addPass( bloomPass );

// Finalize Shaders in Scene
const outputPass = new OutputPass();
composer.addPass( outputPass );

// Init Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);


// Image Generation
// ////////////////

const particleGeometry = new THREE.BufferGeometry();
const particleCount = 10000;

// Note: The Length of These Arrays Must Match
const positionArray = new Float32Array(particleCount * 3);
const positionArrayHelper  = [];

// Define Recursive 3D Random Walk Function
function generateMycelium () {

  // Generate Coordinates Between -100 and 100
  // randFloatSpread Controls Space Between Clusters
  let [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread( 240 ));
  
  // Recursively Generate Clusters of Point Objects
  function addCluster(clusterSize, x, y, z) {
    
    // Distance Between Points
    const dist = 5;
  
    // Update Coordinates for Next Point with Random Walk
    x = THREE.MathUtils.randFloat( (x-dist), (x+dist) );
    y = THREE.MathUtils.randFloat( (y-dist), (y+dist) );
    z = THREE.MathUtils.randFloat( (z-dist), (z+dist) );

    // Add New Coordinates to Point Array
    positionArrayHelper.push(x,y,z); 
  
    // Decrement Counter
    let clusterDecrement = clusterSize - 1;
  
    // Check Counter: Repeat or End
    if (clusterDecrement > 0) {
        addCluster(clusterDecrement, x, y, z);
    }
  }

  // Make Each Cluster with 600 Points // Coordinates Used/Adjusted on Next Loop
  addCluster(1000, x, y, z);

}

// Calls addCluster Array(X) Times
Array(10).fill().forEach(generateMycelium);

// Loop Through Position Array and Remap to the Helper Array 
for(let i = 0; i < particleCount * 3; i++) {
  positionArray[i] = positionArrayHelper[i];
}

// Applies Coordinates to Geometry Attribute
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

// Function to Remap Square Particles as Circles
function createCircleTexture(color, size) {
  var matCanvas = document.createElement('canvas');
  matCanvas.width = matCanvas.height = size;
  var matContext = matCanvas.getContext('2d');
  // create texture object from canvas.
  var texture = new THREE.Texture(matCanvas);
  // Draw a circle
  var center = size / 2;
  matContext.beginPath();
  matContext.arc(center, center, size/2, 0, 2 * Math.PI, false);
  matContext.closePath();
  matContext.fillStyle = color;
  matContext.fill();
  // need to set needsUpdate
  texture.needsUpdate = true;
  // return a texture made from the canvas
  return texture;
}


// Creates Final Mesh for Particles
const material = new THREE.PointsMaterial( { 
  color: 0xb5fcfa,
  size: 1,
});
const particlesMesh = new THREE.Points(particleGeometry, material);
scene.add(particlesMesh);


// Loading Screen Handler
// //////////////////////

const main = document.querySelector("main");
main.classList.remove("hideBeforeRender");

const loadingScreen = document.getElementById("loadingScreen");
loadingScreen.classList.add("hideAfterRender");


// Camera Controls
// ///////////////

// Setup Move Camera on Scroll
function moveCamera() {
  
  // Define Scroll Distance from Top of Screen // For Debug: May Need to Offset to Correct Behavior
  const scroll = (document.body.getBoundingClientRect().top);
  // Move Camera on Scroll
  camera.position.z = (scroll * -0.1);

}

// Scroll Function Call
document.body.onscroll = moveCamera;
moveCamera();


// Rendering Loop
// //////////////

function animate() {
  requestAnimationFrame( animate );

  // Gently Move Particles Each Frame
  camera.position.x += -.003;
  camera.position.y += -.003;

  composer.render();
  
}

// Calls Loop
animate();

// Listen for Window Resize
window.addEventListener( 'resize', onWindowResize, false );

// Update Renderer and Camera on Resize
function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}