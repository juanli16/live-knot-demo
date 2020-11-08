import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let geometry, material, mesh, vertices;
let radius = 1;
let camToSave = {};
let tailPath = [];

function reqListener () {
  console.log(this.responseText);
}

let xhr = new XMLHttpRequest();
xhr.addEventListener("load", reqListener);
xhr.open("POST", "http://127.0.0.1:5000/knot", true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {
  console.log("HELLO")
  console.log(this.responseText);
  var data = JSON.parse(this.responseText);
  console.log(data);
}

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

    vertices = generateVertices(200);

    let path = new THREE.CatmullRomCurve3( vertices );
    tailPath.push(vertices[vertices.length - 1].clone());

    geometry = new THREE.TubeBufferGeometry( path, 20, radius, 8, false );
    material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
    //material.side = THREE.DoubleSide;
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    const cubeGeometry = new THREE.BoxBufferGeometry( 5, 5, 5 );
    cubeGeometry.translate( -100.0, 0.0, 0.0);
    const cubeMaterial = new THREE.MeshPhongMaterial( {color: 0xff0000} );
    const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
    scene.add( cube );

    const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );

    camera.position.z = 50;

    camToSave.position = camera.position.clone();
    camToSave.rotation = camera.rotation.clone();
    camToSave.controlCenter = controls.target.clone();
}

function updateVertices(method) {
    if (method == "random") {
        vertices.forEach(randomVertex);
    } else if (method == "crankshaft") {
        // pick two random points
        let anchor1, anchor2, endVector;

        anchor1 = Math.floor((Math.random() * (vertices.length - 3))); // vertices.length - 2 is to ensure we don't pick the end

        // if anchor1 is towards the last half of the string, freely move the last half of the string
        if ( anchor1 / vertices.length > 0.8 ) {
            endVector = new THREE.Vector3();
            endVector.setX( vertices[anchor1].x + Math.random() * 10 - 5 );
            endVector.setY( vertices[anchor1].y + Math.random() * 10 - 5 );
            endVector.setY( vertices[anchor1].z + Math.random() * 10 - 5 );
            anchor2 = vertices.length;
            tailPath.push(vertices[vertices.length - 1].clone());
        } else {
            // anchor2 must fall further from the chain origin
            anchor2 = Math.floor((Math.random() * (vertices.length - (anchor1 + 2))) - 1) + (anchor1 + 2);
            endVector = vertices[anchor2];
        };

        let axis = new THREE.Vector3();
        axis.subVectors(endVector, vertices[anchor1]).normalize();

        // How much do we want to rotate by?
        let degree = Math.floor(Math.random() * (2 * Math.PI)) - Math.PI;
        //let degree = Math.PI/2;

        for (let i = (anchor1 + 1); i < anchor2; i++) {
            for (let theta = (degree / 10); theta <= degree; theta = (theta + (degree / 10))) {
                if (checkCollision(vertices[i], (4 * radius), anchor1, anchor2)) {
                    console.log("collision");
                    
                    break;
                } else {
                    vertices[i].sub( vertices[anchor1] );
                    vertices[i].applyAxisAngle(axis, theta);
                    vertices[i].add( vertices[anchor1] );
                    vertices[i].multiplyScalar(100);
                    vertices[i].floor();
                    vertices[i].multiplyScalar(0.01);
                };
            };
            //vertices[i].applyAxisAngle(axis, degree);
        };
    };
};

function randomVertex(item) {
    item.set((Math.random() * 10),
             (Math.random() * 10),
             (Math.random() * 10));
};

function checkCollision(vertex, radius, anchor1, anchor2) {
    for (let i = 0; i < vertices.length; i++) {
        if ((i <= anchor1) || (i >= anchor2)) {
            if (vertex.distanceToSquared(vertices[i]) <= radius*radius) {
                return true;
            };
        };
    };
    return false;
};

function updateGeometry(newPath) {
    mesh.geometry.dispose();
    let geometry = new THREE.TubeGeometry( newPath, 20, radius, 8, false);
    mesh.geometry = geometry;
};

function generateVertices(n) {
    let list = [ ];
    let i;
    for (i = 0; i < n; i++) {
        list.push(new THREE.Vector3(i - (n/2), 0, 0));
    };
    return list;
};

function tieTheKnot(start, end) {
    let line = new THREE.LineCurve3(start, end);
    let geometry2 = new THREE.TubeBufferGeometry( line, 20, radius, 8, false );
    let material2 = new THREE.MeshPhongMaterial( { color: 0x0000ff } );
    material2.side = THREE.DoubleSide;
    let mesh2 = new THREE.Mesh( geometry2, material2 );
    mesh2.name = "tie";
    scene.add( mesh2 );
};

function displayPath() {
    let pathT = new THREE.CatmullRomCurve3( tailPath );
    let tailGeometry = new THREE.TubeBufferGeometry( pathT, 20, radius, 8, false );
    let tailMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    tailMaterial.side = THREE.DoubleSide;
    let tailMesh = new THREE.Mesh( tailGeometry, tailMaterial );
    tailMesh.name = "tail";
    scene.add( tailMesh );
};

function restoreCamera(position, rotation, controlCenter){
    camera.position.set(position.x, position.y, position.z);
    camera.rotation.set(rotation.x, rotation.y, rotation.z);

    controls.target.set(controlCenter.x, controlCenter.y, controlCenter.z);
    controls.update();

    renderer.render( scene, camera );
}

function checkLength() {
    let dist = 0;
    for (let i = 0; i < (vertices.length - 1); i++) {
        dist = dist + vertices[i].distanceTo(vertices[i+1]);
    };
    return dist;
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

    let tie;
    let tail;

  if (keyName === 'r') {
      updateVertices("crankshaft");
      let path = new THREE.CatmullRomCurve3( vertices );
      updateGeometry(path);
      tie = scene.getObjectByName("tie");
      scene.remove( tie );
      tail = scene.getObjectByName("tail");
      scene.remove( tail );
  } else if (keyName === 't') {
      tieTheKnot(vertices[0], vertices[vertices.length - 1]);
  } else if (keyName === 'e') {
      displayPath();
      console.log(tailPath);
  } else if (keyName === 'a') {
      let v = new THREE.Vector3(1, 1, 0);
      let axis = new THREE.Vector3(0, 1, 0);
      let angle = Math.PI /2;
      v.applyAxisAngle(axis, angle);
      console.log(v);
  } else if (keyName === 'c') {
      restoreCamera(camToSave.position, camToSave.rotation, camToSave.controlCenter);
  } else if (keyName === 'l') {
      console.log(checkLength());
  } else if (keyName === 'k') {
      console.log("sending post request");
      xhr.send(JSON.stringify({knot: [[1, 2, 3], [2, 3, 4]]}));
  };
}, false);
