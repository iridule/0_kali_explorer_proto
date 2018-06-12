const THREE = require("three");
const {Explorer} = require("./graphics");

const canvas = document.getElementById("target");
const renderer = new THREE.WebGLRenderer({canvas});
setSize();

const camera = new THREE.PerspectiveCamera(45, width / height, 10, 1000);
const scene = new THREE.Scene();

function setup() {
    explorer = new Explorer(width, height);
    explorer.addToScene(scene);
    // camera.position.set(0, 0, 10);
}

function animate() {
    explorer.update();
    renderer.render(scene, camera);
}

function loop() {
    requestAnimationFrame(loop);
    animate();
}

function setSize(w, h) {
    width = canvas.width = canvas.style.width = w || window.innerWidth;
    height = canvas.height = canvas.style.height = h || window.innerHeight;
    renderer.setSize(width, height);
}

window.addEventListener("load", () => {
    setup();
    loop();
});

window.addEventListener("resize", () => {
    setSize();
});
