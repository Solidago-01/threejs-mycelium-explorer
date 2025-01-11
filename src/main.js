import './style.css'
import * as THREE from 'three';
// Import Mouse Controls
import { OrbitControls } from 'three/examples/jsm/Addons.js';
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

// Init Mouse Controls
const controls = new OrbitControls(camera, renderer.domElement);


// Image Generation
// ////////////////

function generateMycelium () {

  // Generate Coordinates Between -100 and 100
  // randFloatSpread Controls Space Between Clusters
  let [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread( 160 ));
  
  // Recursively Generate Clusters of Point Objects
  function addCluster(clusterSize, x, y, z) {
    
    // Distance Between Points
    const dist = 5;
  
    // Update Coordinates for Next Point
    x = THREE.MathUtils.randFloat( (x-dist), (x+dist) );
    y = THREE.MathUtils.randFloat( (y-dist), (y+dist) );
    z = THREE.MathUtils.randFloat( (z-dist), (z+dist) );
  
    // Create Point Mesh
    const geometry = new THREE.SphereGeometry(.5, 24, 24);
    const material = new THREE.MeshStandardMaterial( { color: 0xb5fcfa });
    const point = new THREE.Mesh( geometry, material );
    point.position.set(x, y, z);
    scene.add(point);
  
    // Decrement Counter
    let clusterDecrement = clusterSize - 1;
  
    // Check Counter: Repeat or End
    if (clusterDecrement > 0) {
        addCluster(clusterDecrement, x, y, z);
    }
  }

  // Make Each Cluster with 600 Points // Coordinates Used/Adjusted on Next Loop
  addCluster(600, x, y, z);

}

// Calls addCluster Array(X) Times
Array(10).fill().forEach(generateMycelium);


// Loading Screen Handler
// //////////////////////

const main = document.querySelector("main");
main.classList.remove("hideBeforeRender");

const loadingScreen = document.getElementById("loadingScreen");
loadingScreen.classList.add("hideAfterRender");


// Camera Controls
// ///////////////

// Note This Values Loads in Above 0 // 8 on FireFox and Chrome
// console.log(document.body.getBoundingClientRect().top);

// Setup Move Camera on Scroll
function moveCamera() {
  
  // Define Scroll Distance from Top of Screen // Includes Offset of 8 for Result of 0
  const scroll = (document.body.getBoundingClientRect().top) - 8;
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