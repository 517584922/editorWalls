let arr = new Array();
let arrPoint = new Array();
let groupArr = new Array();
let vArr = new Array();
let jsonMod,c;
// 叠加组
let groupIndex = 0;
let pointIndex = 0;
if ( WEBGL.isWebGLAvailable() === false ) {

    document.body.appendChild( WEBGL.getWebGLErrorMessage() );

}

var camera, scene, renderer;
var plane, cube;
var mouse, raycaster, isShiftDown = false;

var rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial,voxel;

var helperGeo, helperMesh;

let orbitControl,transControl;

var objects = [];

let selectMesh;

let isAdd = false;

init();
render();

function isAddFn() {
    isAdd =! isAdd;
    if (isAdd){
        // roll-over helpers
        document.removeEventListener( 'click', onDocumentMouseClick, false );

        var rollOverGeo = new THREE.SphereGeometry( 10, 10, 10 );
        rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
        rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );

        // helper cube
        helperGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
        helperMesh = new THREE.Mesh( helperGeo, rollOverMaterial );

        // cubes

        cubeGeo = new THREE.SphereGeometry( 10, 50, 50 );
        cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
        scene.add( rollOverMesh );

    }else{

    }
    camera.position.set(0,1200,0);
    camera.lookAt(0,0,0);
    orbitControl.enabled = false;

    // document.removeEventListener( 'keydown', onDocumentKeyDown, false );
    // document.removeEventListener( 'keyup', onDocumentKeyUp, false );
}

function deleteMod() {
    if (selectMesh.name == 'v'){
        scene.remove(selectMesh);
        scene.remove(transControl);
        selectMesh = null;
        render();
    } else{
        alert('无选中模型')
    }
}
let save = new Array();

function exportMod() {
    if (selectMesh){
        for (let k=0;k<selectMesh.geometry.vertices.length;k++ ){
            save.push(selectMesh.geometry.vertices[k].x);
            save.push(selectMesh.geometry.vertices[k].y);
            save.push(selectMesh.geometry.vertices[k].z);
        }
        doSave(save, "text/latex", "exports.txt");
    } else{
        alert('无选中模型')
    }
}

function init() {

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 1200, 1200, 0 );
    camera.lookAt( 0, 0, 0 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    // grid

    var gridHelper = new THREE.GridHelper( 1000, 100 );
    console.log(gridHelper);
    scene.add( gridHelper );

    var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
    geometry.rotateX( - Math.PI / 2 );
    plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
    scene.add( plane );

    c = new THREE.MeshLambertMaterial( { color: 0xbfbfbf,map: new THREE.TextureLoader().load('img/texutre/clay1.jpg', render)} );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load('mod/level6.json', function (obj) {
        obj.scale.set(0.03,0.03,0.03);
        obj.position.set(-340, -465,220);
        obj.rotateX(Math.PI/180*270);
        scene.add( obj );
        render();
    });

    objects.push( plane );

    // lights

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
    scene.add( directionalLight );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    renderer.domElement.id = 'canvas';

    // controls
    orbitControl = new THREE.OrbitControls( camera, renderer.domElement );
    orbitControl.enableDamping = true;
    orbitControl.screenSpacePanning = false;
    orbitControl.maxPolarAngle = Math.PI / 2;
    orbitControl.enablePan = false;

    //trans control
    transControl = new THREE.TransformControls( camera, renderer.domElement );
    transControl.addEventListener( 'change', render );
    transControl.addEventListener( 'dragging-changed', function ( event ) {
        orbitControl.enabled = ! event.value;
    } );

    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.getElementById('canvas').addEventListener( 'click', onDocumentMouseClick, false );
    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    event.preventDefault();

    if (isAdd){

        mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( objects );

        if ( intersects.length > 0 ) {

            var intersect = intersects[ 0 ];

            rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
            rollOverMesh.position.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar( 2.5 );

        }
    }

    render();

}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        var intersect = intersects[ 0 ];

        // delete cube

        if ( isShiftDown ) {

            if ( intersect.object !== plane ) {
                scene.remove( intersect.object );
                objects.splice( objects.indexOf( intersect.object ), 1 );
            }

            // create cube

        } else {
            if (isAdd){
                voxel = new THREE.Mesh( cubeGeo, cubeMaterial );

                voxel.position.copy( intersect.point ).add( intersect.face.normal );
                voxel.position.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar( 2.5 );

                arr.push(voxel.position);
                groupArr.push(voxel);
                voxel.name = arr.length;
                scene.add( voxel );

                if (arr.length == 2){

                    let legX = arr[0].x-arr[1].x;
                    let legZ = arr[0].z-arr[1].z;
                    let hypotenuse = Math.sqrt(Math.pow(legX,2)+Math.pow(legZ,2));

                    let g = new THREE.BoxGeometry( 1, 100, 10 );
                    vArr[pointIndex] = new THREE.Mesh( g, c );
                    vArr[pointIndex].uuid=pointIndex;
                    vArr[pointIndex].scale.set(hypotenuse,1,1);

                    vArr[pointIndex].position.set(arr[0].x + (arr[1].x-arr[0].x)*0.5, 50, arr[0].z + (arr[1].z-arr[0].z)*0.5);
                    if (arr[0].x<arr[1].x){
                        vArr[pointIndex].rotateY(Math.asin(legZ/hypotenuse));
                    } else{
                        vArr[pointIndex].rotateY(-Math.asin(legZ/hypotenuse));
                    }
                    vArr[pointIndex].name = 'v';
                    scene.add( vArr[pointIndex] );

                    for (let i in groupArr){
                        scene.remove(groupArr[i])
                    }
                    scene.remove(rollOverMesh);
                    scene.remove(transControl);

                    groupIndex++;
                    isAdd = false;
                    arr.length = 0;
                    arrPoint.length = 0;
                    orbitControl.enabled = true;
                    pointIndex++;

                    // EnableClick=
                    // document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
                    // document.removeEventListener( 'mousedown', onDocumentMouseDown, false );
                    document.getElementById('canvas').addEventListener( 'click', onDocumentMouseClick, false );

                }


                objects.push( voxel );
            }
        }

        render();

    }



}

function onDocumentKeyDown( event ) {

    switch ( event.keyCode ) {

        case 16: isShiftDown = true; break;

    }

}

function onDocumentKeyUp( event ) {

    switch ( event.keyCode ) {

        case 16: isShiftDown = false; break;

    }

}

function onDocumentMouseClick(event) {
    orbitControl.enabled=true;
    //监听鼠标移动拾取物体
    event.preventDefault();
    var Sx = event.clientX;//鼠标单击位置横坐标
    var Sy = event.clientY;//鼠标单击位置纵坐标
    //屏幕坐标转标准设备坐标
    var x = (Sx / window.innerWidth) * 2 - 1;//标准设备横坐标
    var y = -(Sy / window.innerHeight) * 2 + 1;//标准设备纵坐标
    var standardVector = new THREE.Vector3(x, y, 0.5);//标准设备坐标
    //标准设备坐标转世界坐标
    var worldVector = standardVector.unproject(camera);
    //射线投射方向单位向量(worldVector坐标减相机位置坐标)
    var ray = worldVector.sub(camera.position).normalize();
    //创建射线投射器对象
    var raycaster = new THREE.Raycaster(camera.position, ray);
    //返回射线选中的对象
    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        selectMesh=intersects[0].object;
        if (selectMesh.name == 'v'){
            transControl.attach( selectMesh );
            scene.add( transControl );
        }else {
            if (event.path[0].id == 'canvas')
            scene.remove( transControl );
        }
    }
}

function render() {

    renderer.render( scene, camera );

}

function doSave(value, type, name) {
    var blob;
    if (typeof window.Blob == "function") {
        blob = new Blob([value], {type: type});
    } else {
        var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
        var bb = new BlobBuilder();
        bb.append(value);
        blob = bb.getBlob(type);
    }
    var URL = window.URL || window.webkitURL;
    var bloburl = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    if ('download' in anchor) {
        anchor.style.visibility = "hidden";
        anchor.href = bloburl;
        anchor.download = name;
        document.body.appendChild(anchor);
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        anchor.dispatchEvent(evt);
        document.body.removeChild(anchor);
    } else if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, name);
    } else {
        location.href = bloburl;
    }
}

function transMod() {
    transControl.setMode( "translate" )
}
function rotateMod() {
    transControl.setMode( "rotate" )
}
function scaleMod() {
    transControl.setMode( "scale" )
}
function changeTexture(index) {
    if (selectMesh){
        selectMesh.material.map.needsUpdate = true;
        selectMesh.material.map.wrapS = THREE.RepeatWrapping;
        selectMesh.material.map.image.src = 'img/texutre/clay'+index+'.jpg';
    }
}
