import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { Color } from 'three'
import cities from 'cities.json'

// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Sphere
const geometry = new THREE.SphereBufferGeometry(1, 30, 30)
const material = new THREE.PointsMaterial({
    size: 0.008
})
const sphere = new THREE.Points(geometry, material)
scene.add(sphere)

/*
Get Coordinates 
from lat, lng > vector3
*/
const latitudes = []
const longitudes = []

for (let i = 0; i < cities.length; i++) {
    latitudes.push(parseFloat(cities[i].lat))
    longitudes.push(parseFloat(cities[i].lng))
}

console.log(latitudes.length)

var getCoordinatesFromLatLng = function (latitude, longitude, radiusEarth) {
    let latitude_rad = latitude * Math.PI / 180;
    let longitude_rad = longitude * Math.PI / 180;

    let xPos = radiusEarth * Math.cos(latitude_rad) * Math.cos(longitude_rad);
    let zPos = radiusEarth * Math.cos(latitude_rad) * Math.sin(longitude_rad);
    let yPos = radiusEarth * Math.sin(latitude_rad);

    return { x: xPos, y: yPos, z: zPos };
}

const ptCoor = new THREE.BufferGeometry()

const geoLengths = latitudes.length
const geoCoord = []
for (let i = 0; i < geoLengths; i++) {
    geoCoord[i] = getCoordinatesFromLatLng(latitudes[i], longitudes[i], 3)
}

const geoLocs = new Float32Array(geoLengths * 3)

console.log(geoCoord[0])
console.log(geoCoord[0].x)
console.log(geoCoord[0].y)
console.log(geoCoord[0].z)


const countryLoc = getCoordinatesFromLatLng(42.46372, 1.49129, 1)

const pt = new THREE.BufferGeometry()
const ptLoc = new Float32Array(3)

ptLoc[0] = countryLoc.x
ptLoc[1] = countryLoc.y
ptLoc[2] = countryLoc.z

pt.setAttribute('position', new THREE.BufferAttribute(ptLoc, 3))
const ptMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 'red'
})

const mesh = new THREE.Points(pt, ptMat)
scene.add(mesh)

//Particles
// const particlesGeo = new THREE.BufferGeometry()
// const particlesCount = 6000

// const posArray = new Float32Array(particlesCount * 3)


// for (let i = 0; i < particlesCount; i++) {
//     posArray[i] = (Math.random() - 0.5) * 50
// }

// particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

// console.log(particlesGeo.attributes.position.array.length)
// console.log(particlesGeo.attributes)

// const particleMat = new THREE.PointsMaterial({
//     size: 0.02
// })

// const particlesMesh = new THREE.Points(particlesGeo, particleMat)
// scene.add(particlesMesh)



// Update Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(new THREE.Color("rgb(15, 22, 26)"))

//Mouse
document.addEventListener('mousemove', animateParticles)

let mouseX = 0
let mouseY = 0

function animateParticles(event) {
    mouseY = event.clientY
    mouseX = event.clientX
}

// Animation
const clock = new THREE.Clock()

const animate = () => {

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = .15 * elapsedTime

    // particlesMesh.position.z = .3 * elapsedTime

    // for (let i = 0; i < particlesMesh.position.count; i++) {
    //     if (particlesMesh[i].position.z > 3) {
    //         particlesMesh[i].position.z = 0
    //     }
    // }

    // particlesMesh.rotation.z = .01 * elapsedTime
    // particlesMesh.rotation.z = mouseY * (elapsedTime * 0.00009)
    // particlesMesh.rotation.y = mouseX * (elapsedTime * 0.00009)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()