import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BufferAttribute, Color, Float32BufferAttribute } from 'three'
import cities from 'cities.json'



// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/*
Globe Particle Coordinates
*/
const latitudes = []
const longitudes = []

for (let i = 0; i < cities.length; i++) {
    latitudes.push(parseFloat(cities[i].lat))
    longitudes.push(parseFloat(cities[i].lng))
}

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
const globeRad = 1

const geoCoord = []
for (let i = 0; i < geoLengths; i++) {
    geoCoord[i] = getCoordinatesFromLatLng(latitudes[i], longitudes[i], globeRad)
}

const position = []

for (let i = 0; i < geoLengths; i++) {
    position.push(
        geoCoord[i].x,
        geoCoord[i].y,
        geoCoord[i].z
    )
}

ptCoor.setAttribute('position', new Float32BufferAttribute(position, 3))

const ptMat = new THREE.PointsMaterial({
    size: 0.002,
    color: 'red'
})

const mesh = new THREE.Points(ptCoor, ptMat)
scene.add(mesh)

/*
Sites Coordinate
*/
const sites = require('./sites.json')

const sitesLat = []
const sitesLng = []

for (let i = 0; i < sites.length; i++) {
    sitesLat.push(parseFloat(sites[i].latlng.lat))
    sitesLng.push(parseFloat(sites[i].latlng.lng))
}

// const sitesPts = new THREE.BufferGeometry()

const sitesCoord = []
const sitesPos = []

for (let i = 0; i < sites.length; i++) {
    sitesCoord[i] = getCoordinatesFromLatLng(sitesLat[i], sitesLng[i], globeRad)
}

for (let i = 0; i < sitesLat.length; i++) {
    sitesPos.push(
        sitesCoord[i].x,
        sitesCoord[i].y,
        sitesCoord[i].z
    )
}

// sitesPts.setAttribute('position', new Float32BufferAttribute(sitesPos, 3))

// const sitesMat = new THREE.PointsMaterial({
//     size: 0.02,
//     color: 'white'
// })

// const mesh2 = new THREE.Points(sitesPts, sitesMat)
// scene.add(mesh2)

const sitesPts = new THREE.PointLight(0xff0000, 100, 100)
const posArr = new Float32Array(sitesPos, 3)
sitesPts.position.set(posArr)
scene.add(sitesPts)

console.log(ptCoor)

//Particles
const particlesGeo = new THREE.BufferGeometry()
const particlesCount = 1000

const posArray = new Float32Array(particlesCount * 3)


for (let i = 0; i < particlesCount; i++) {
    posArray[i] = (Math.random() - 0.5) * 50
}

particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

const particleMat = new THREE.PointsMaterial({
    size: 0.0001
})

const particlesMesh = new THREE.Points(particlesGeo, particleMat)
scene.add(particlesMesh)


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
camera.position.z = 2
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
    mesh.rotation.y = .1 * elapsedTime
    sitesPts.rotation.y = .1 * elapsedTime

    particlesMesh.rotation.y = .1 * elapsedTime

    particlesMesh.rotation.x = mouseY * (elapsedTime * 0.00009)
    particlesMesh.rotation.y = mouseX * (elapsedTime * 0.00009)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()