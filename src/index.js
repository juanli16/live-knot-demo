import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//var vertices = [
//    new THREE.Vector3( 0, 10, - 10 ), new THREE.Vector3( 10, 0, - 10 ),
//    new THREE.Vector3( 20, 0, 0 ), new THREE.Vector3( 30, 0, 10 ),
//    new THREE.Vector3( 30, 0, 20 ), new THREE.Vector3( 20, 0, 30 ),
//    new THREE.Vector3( 10, 0, 30 ), new THREE.Vector3( 0, 0, 30 ),
//    new THREE.Vector3( - 10, 10, 30 ), new THREE.Vector3( - 10, 20, 30 ),
//    new THREE.Vector3( 0, 30, 30 ), new THREE.Vector3( 10, 30, 30 ),
//    new THREE.Vector3( 20, 30, 15 ), new THREE.Vector3( 10, 30, 10 ),
//    new THREE.Vector3( 0, 30, 10 ), new THREE.Vector3( - 10, 20, 10 ),
//    new THREE.Vector3( - 10, 10, 10 ), new THREE.Vector3( 0, 0, 10 ),
//    new THREE.Vector3( 10, - 10, 10 ), new THREE.Vector3( 20, - 15, 10 ),
//    new THREE.Vector3( 30, - 15, 10 ), new THREE.Vector3( 40, - 15, 10 ),
//    new THREE.Vector3( 50, - 15, 10 ), new THREE.Vector3( 60, 0, 10 ),
//    new THREE.Vector3( 70, 0, 0 ), new THREE.Vector3( 80, 0, 0 ),
//    new THREE.Vector3( 90, 0, 0 ), new THREE.Vector3( 100, 0, 0 )
//]

function generateVertices(n) {
    var list = [ ];
    var i;
    for (i = 0; i < n; i++) {
        list.push(new THREE.Vector3(i, 0, 0));
    };
    return list;
};

var vertices = generateVertices(100);


const path = new THREE.CatmullRomCurve3( vertices );
const geometry = new THREE.TubeBufferGeometry( path, 20, 2, 8, false );
const material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
scene.add( directionalLight );

camera.position.z = 50;

const animate = function () {
    // need some function here to update the vertices
    updateGeometry(path);

    requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;

    renderer.render( scene, camera );
};

//function updateVertices(vertices) {
//    vertices.forEach(item.set(Math.floor((Math.random() * 10) + 1),
//                              Math.floor((Math.random() * 10) + 1),
//                              Math.floor((Math.random() * 10) + 1)));
//};
        
function updateGeometry(newPath) {
    mesh.geometry.dispose();
    var geometry = new THREE.TubeGeometry( newPath, 20, 2, 8, false);
    mesh.geometry = geometry;
};

animate();
