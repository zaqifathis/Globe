import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

// Debug
//const gui = new dat.GUI()

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

//Particles
const particlesGeo = new THREE.BufferGeometry()
const particlesCount = 6000

const posArray = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount; i++) {
    posArray[i] = (Math.random() - 0.5) * 50
}

particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

console.log(particlesGeo.attributes.position.array)

const particleMat = new THREE.PointsMaterial({
    size: 0.008
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
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
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

    particlesMesh.rotation.y = .05 * elapsedTime
    particlesMesh.rotation.x = mouseY * (elapsedTime * 0.00009)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()