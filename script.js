const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 500, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("solarCanvas"), antialias: true });
renderer.setSize(window.innerWidth, 500);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / 500;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, 500);
});

const light = new THREE.PointLight(0xffffff, 1.5);
light.position.set(0, 0, 0);
scene.add(light);

const sunGeo = new THREE.SphereGeometry(3, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

const planets = [];
const speeds = {};
const planetData = [
    { name: 'Mercury', radius: 0.5, distance: 5, speed: 0.04, color: 0xaaaaaa },
    { name: 'Venus', radius: 0.6, distance: 7, speed: 0.03, color: 0xffcc00 },
    { name: 'Earth', radius: 0.7, distance: 10, speed: 0.02, color: 0x0000ff },
    { name: 'Mars', radius: 0.6, distance: 13, speed: 0.017, color: 0xff3300 },
    { name: 'Jupiter', radius: 1.5, distance: 17, speed: 0.01, color: 0xff9966 },
    { name: 'Saturn', radius: 1.2, distance: 21, speed: 0.008, color: 0xffcc99 },
    { name: 'Uranus', radius: 1, distance: 25, speed: 0.006, color: 0x66ccff },
    { name: 'Neptune', radius: 1, distance: 29, speed: 0.005, color: 0x3333ff }
];

planetData.forEach(p => {
    const geo = new THREE.SphereGeometry(p.radius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: p.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { angle: Math.random() * Math.PI * 2 };
    scene.add(mesh);
    planets.push({ mesh, data: p });
    speeds[p.name] = p.speed;

    const div = document.createElement('div');
    div.className = 'control-group';
    div.innerHTML = `
        <label>${p.name}</label>
        <input type="range" min="0.001" max="0.1" step="0.001" value="${p.speed}" data-name="${p.name}"/>
      `;
    document.getElementById('controls').appendChild(div);
});

document.querySelectorAll('input[type=range]').forEach(input => {
    input.addEventListener('input', (e) => {
        const planetName = e.target.dataset.name;
        speeds[planetName] = parseFloat(e.target.value);
    });
});

let isPaused = false;
document.getElementById("toggleAnimation").addEventListener("click", () => {
    isPaused = !isPaused;
    document.getElementById("toggleAnimation").textContent = isPaused ? "▶️ Resume" : "⏸ Pause";
});

document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
});

function createStars(count) {
    const starGeo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < count; i++) {
        positions.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
}
createStars(1000);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById("tooltip");

document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
    if (intersects.length > 0) {
        tooltip.style.display = "block";
        tooltip.style.left = e.clientX + 10 + "px";
        tooltip.style.top = e.clientY + 10 + "px";
        tooltip.innerText = planets.find(p => p.mesh === intersects[0].object).data.name;
    } else {
        tooltip.style.display = "none";
    }
});

document.addEventListener("click", (e) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
    if (intersects.length > 0) {
        const planet = intersects[0].object;
        const target = new THREE.Vector3().copy(planet.position);
        camera.position.set(target.x + 5, target.y + 5, target.z + 5);
        camera.lookAt(target);
    }
});

camera.position.z = 40;

function animate() {
    requestAnimationFrame(animate);
    if (!isPaused) {
        planets.forEach(({ mesh, data }) => {
            mesh.userData.angle += speeds[data.name];
            mesh.position.x = Math.cos(mesh.userData.angle) * data.distance;
            mesh.position.z = Math.sin(mesh.userData.angle) * data.distance;
        });
    }
    renderer.render(scene, camera);
}
animate();
