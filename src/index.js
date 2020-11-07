import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let geometry, material, mesh, vertices;

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    //controls.update() must be called after any manual changes to the camera's transform
    camera.position.set( 0, 20, 100 );
    controls.update();


    vertices = generateVertices(10);

    let path = new THREE.CatmullRomCurve3( vertices );

    geometry = new THREE.TubeBufferGeometry( path, 20, 2, 8, false );
    material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    material.side = THREE.DoubleSide;
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );

    camera.position.z = 50;
}

function updateVertices(method) {
    if (method == "random") {
        vertices.forEach(randomVertex);
    }
    else if (method == "crankshaft") {
        // pick two random points
        let anchor1 = Math.floor((Math.random() * (vertices.length - 2)) - 1); // vertices.length - 2 is to ensure we don't pick the end
        // anchor2 must fall further from the chain origin
        let anchor2 = Math.floor((Math.random() * (vertices.length - (anchor1 + 2))) - 1) + (anchor1 + 2);

        let axis = new THREE.Vector3();
        axis.subVectors(vertices[anchor2], vertices[anchor1]).normalize();

        // How much do we want to rotate by?
        // let degree = Math.floor(Math.random() * 360) - 180;
        let degree = Math.PI/2;

        for (let i = (anchor1 + 1); i < (anchor2 - 1); i++) {
            vertices[i].applyAxisAngle(axis, degree);
        };
    };
};

function randomVertex(item) {
    item.set((Math.random() * 10),
             (Math.random() * 10),
             (Math.random() * 10));
};

function updateGeometry(newPath) {
    mesh.geometry.dispose();
    let geometry = new THREE.TubeGeometry( newPath, 20, 2, 8, false);
    mesh.geometry = geometry;
};

function generateVertices(n) {
    let list = [ ];
    let i;
    for (i = 0; i < n; i++) {
        list.push(new THREE.Vector3(i, i*i, 0));
    };
    return list;
};

function animate() {
    //updateVertices("crankshaft");
    //let path = new THREE.CatmullRomCurve3( vertices );
    //updateGeometry(path);

    requestAnimationFrame( animate );

    //mesh.rotation.x += 0.01;
    //mesh.rotation.y += 0.01;

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render( scene, camera );
};

document.addEventListener('keydown', (event) => {
  const keyName = event.key;

  if (keyName === 'Control') {
      updateVertices("crankshaft");
      let path = new THREE.CatmullRomCurve3( vertices );
      updateGeometry(path);
  };
}, false);
