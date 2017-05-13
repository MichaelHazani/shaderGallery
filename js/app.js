var container, scene, camera, renderer, controls;
var clock = new THREE.Clock();

// custom global variables
var mesh;
var uniforms1;
var waterNormals;

init();
animate();

// FUNCTIONS 		
function init() {
    // SCENE
    scene = new THREE.Scene();
    // CAMERA
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 40000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(2050, 500, 1900);
    camera.lookAt(scene.position);
    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container = document.getElementById('container');
    container.appendChild(renderer.domElement);
    // CONTROLS
    // controls = new THREE.OrbitControls(camera, renderer.domElement);

    // LIGHT
    var light = new THREE.PointLight(0xffffff);
    light.position.set(100, 250, 100);
    scene.add(light);

    // SKYBOX
    var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
    var skyBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.BackSide });
    var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);


    //shader prep
    uniforms1 = {
        time: { type: 'f', value: 1.0 },
        resolution: { value: new THREE.Vector2() }
    };

    var params = [
        ['fragment_shader1', uniforms1],
        ['fragment_shader3', uniforms1],
        ['fragment_shader4', uniforms1],
        ['fragment_shader5', uniforms1],
        ['fragment_shader6', uniforms1],
    ];

    var geos = [
        new THREE.SphereGeometry(30, 32, 16),
        new THREE.BoxGeometry(40, 40, 40),
        new THREE.IcosahedronBufferGeometry(32),
        new THREE.CylinderBufferGeometry(30, 30, 40, 32),
        new THREE.OctahedronBufferGeometry(42),
        new THREE.TorusBufferGeometry(40, 3, 16, 100),
        new THREE.DodecahedronBufferGeometry(32),
        new THREE.TorusKnotBufferGeometry(20, 13, 100, 16),
    ];

    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            for (var k = 0; k < 10; k++) {
                var geometry = geos[i % 10];
                var material = new THREE.ShaderMaterial({

                    uniforms: uniforms1,
                    vertexShader: document.getElementById('vertexShader').textContent,
                    fragmentShader: document.getElementById(params[i % 5][0]).textContent
                });

                var mesh = new THREE.Mesh(geometry, material);
                mesh.position.x = i * 400 - 1000;
                mesh.position.y = j * 200 + 20;
                mesh.position.z = k * 400 - 1000;
                scene.add(mesh);

            }
        }
    }


    //water
    waterNormals = new THREE.TextureLoader().load('./images/waternormals.jpeg');
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    water = new THREE.Water(renderer, camera, scene, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        alpha: 1.0,
        sunDirection: light.position.clone().normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 50.0,
        fog: scene.fog != undefined
    });


    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(9000, 9000, 50, 50),
        water.material
    );
    floor.position.y = -0.5;
    floor.add(water);

    floor.rotation.x = Math.PI / -2;
    floor.position.set(400, 0, 400);
    scene.add(floor);





}

function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function update() {
    // controls.update();
}

function render() {
    renderer.render(scene, camera);
    var delta = clock.getDelta();
    water.material.uniforms.time.value += 1.0 / 60.0;
    water.render();
    uniforms1.time.value += delta * 5;
}



window.addEventListener('resize', onWindowResize, false);
function onWindowResize(event) {

    uniforms1.resolution.value.x = window.innerWidth;
    uniforms1.resolution.value.y = window.innerHeight;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

window.addEventListener('mousemove', onMouseMove, false);

function onMouseMove(e) {
    // console.log(e);
    camera.position.x += (e.clientX - camera.position.x) * .9;
    camera.position.y += (e.clientY - camera.position.y) * .9;
    camera.lookAt(scene.position);
}