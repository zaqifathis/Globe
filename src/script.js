import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BufferAttribute, Color, Float32BufferAttribute, Light, PointsMaterial } from 'three'
import cities from 'cities.json'
import * as POSTPROCESSING from 'postprocessing'



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

console.log(geoLengths)

const ptMat = new THREE.PointsMaterial({
    size: 0.001,
    color: 0xd0ed
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

//vector Direction 
const vec1 = []
const vec2 = new THREE.Vector3(0, 0, 0)
const sitesVec = []

for (let i = 0; i < sitesLat.length; i++) {
    vec1.push(new THREE.Vector3(sitesCoord[i].x, sitesCoord[i].y, sitesCoord[i].z))
}

const vecDir = []
for (let i = 0; i < sitesLat.length; i++) {
    var dirTemp = new THREE.Vector3()
    vecDir.push(dirTemp.subVectors(vec2, vec1[i]).normalize())
}

var num = 2.001

for (let i = 0; i < sitesLat.length; i++) {
    sitesVec.push(
        vecDir[i].x + vec1[i].x * num,
        vecDir[i].y + vec1[i].y * num,
        vecDir[i].z + vec1[i].z * num
    )
}


//test

const sphereGroup = new THREE.Group()
const geo = new THREE.SphereBufferGeometry(0.004, 30, 30)

for (let i = 0; i < sites.length; i++) {
    const geoMat = new THREE.MeshStandardMaterial({
        color: 0xffccaa,
        emissive: 0xffccaa,
        emissiveIntensity: 10000
    })
    const sphere = new THREE.Mesh(geo, geoMat)
    sphere.position.x = vec1[i].x
    sphere.position.y = vec1[i].y
    sphere.position.z = vec1[i].z
    sphereGroup.add(sphere)
}

scene.add(sphereGroup)

/**
 * Lights
 */
const ptLight = new THREE.PointLight(0xffccaa, 100, 1000000)
ptLight.position.set(sitesCoord.x, sitesCoord.y, sitesCoord.z)
scene.add(ptLight)


//Particles
const particlesGeo = new THREE.BufferGeometry()
const particlesCount = 1000

const posArray = new Float32Array(particlesCount * 3)


for (let i = 0; i < particlesCount; i++) {
    posArray[i] = (Math.random() - 0.5) * 50
}

particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

const particleMat = new THREE.PointsMaterial({
    size: 0.0001,
    color: 0xf7f7f7
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
camera.position.z = 1.75
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(new THREE.Color("rgb(48, 48, 48)"))

// const composer = new POSTPROCESSING.EffectComposer(renderer)
// composer.addPass(new POSTPROCESSING.RenderPass(scene, camera))

// const effectPass = new POSTPROCESSING.EffectPass(
//     camera,
//     new POSTPROCESSING.BloomEffect()
// )

// effectPass.renderToScreen = true
// composer.addPass(effectPass)

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
    mesh.rotation.y = .08 * elapsedTime
    sphereGroup.rotation.y = .08 * elapsedTime

    particlesMesh.rotation.y = .1 * elapsedTime

    particlesMesh.rotation.x = mouseY * (elapsedTime * 0.00009)
    particlesMesh.rotation.y = mouseX * (elapsedTime * 0.00009)

    // Render
    renderer.render(scene, camera)
    // composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()