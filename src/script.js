import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BufferAttribute, Color, Float32BufferAttribute, Int8Attribute, Light, PointsMaterial } from 'three'
import cities from 'cities.json'
import * as POSTPROCESSING from 'postprocessing'
import * as TWEEN from 'tween'


let camera, scene, renderer, controls, composer, target, target2, globeParticles, particlesBackground
let mouseX = 0
let mouseY = 0

const clock = new THREE.Clock()
const globeRad = 1
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

var center = new THREE.Vector3()
var vectorStart = new THREE.Vector3()
var vectorEnd = new THREE.Vector3(0, 0, globeRad)
var normal = new THREE.Vector3()
var lookAt = new THREE.Vector3()
var angle = { value: 0 }
var angleEnd = { value: 0 }



init()
animate()


function init() {
    const canvas = document.querySelector('canvas.webgl')

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 0
    camera.position.y = 0
    camera.position.z = 1.75
    scene.add(camera)


    // Globe Particle Coordinate


    const latitudes = []
    const longitudes = []
    for (let i = 0; i < cities.length; i++) {
        latitudes.push(parseFloat(cities[i].lat))
        longitudes.push(parseFloat(cities[i].lng))
    }

    const geoCoord = []
    for (let i = 0; i < latitudes.length; i++) {
        geoCoord[i] = getCoordinatesFromLatLng(latitudes[i], longitudes[i], globeRad)
    }

    const position = []
    for (let i = 0; i < latitudes.length; i++) {
        position.push(
            geoCoord[i].x,
            geoCoord[i].y,
            geoCoord[i].z
        )
    }
    const ptCoor = new THREE.BufferGeometry()
    ptCoor.setAttribute('position', new Float32BufferAttribute(position, 3))
    const ptMat = new THREE.PointsMaterial({
        size: 0.001,
        color: 0xd0ed
    })
    globeParticles = new THREE.Points(ptCoor, ptMat)
    scene.add(globeParticles)


    //Target Sphere


    const geo = new THREE.SphereBufferGeometry(0.01, 30, 30)
    const geoMat = new THREE.MeshStandardMaterial({
        color: 0xffccaa,
        emissive: 0xffccaa,
        emissiveIntensity: 10000
    })
    target = new THREE.Mesh(geo, geoMat)
    target2 = new THREE.Mesh(geo, geoMat)
    scene.add(target)
    scene.add(target2)


    //Particles Background


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
    particlesBackground = new THREE.Points(particlesGeo, particleMat)
    scene.add(particlesBackground)


    // Renderer


    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(new THREE.Color("rgb(25, 25, 25)"))

    // composer = new POSTPROCESSING.EffectComposer(renderer)
    // composer.addPass(new POSTPROCESSING.RenderPass(scene, camera))
    // const effectPass = new POSTPROCESSING.EffectPass(
    //     camera,
    //     new POSTPROCESSING.BloomEffect()
    // )
    // effectPass.renderToScreen = true
    // composer.addPass(effectPass)


    // Update Sizes


    window.addEventListener('resize', onWindowResize)


    // Controls


    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true



    //Mouse


    document.addEventListener('mousemove', animateParticles)
    function animateParticles(event) {
        mouseY = event.clientY
        mouseX = event.clientX
    }

    //

    generateTarget()

}



function animate() {

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    // target.rotation.y = .08 * elapsedTime
    // globeParticles.rotation.y = .08 * elapsedTime

    particlesBackground.rotation.y = .1 * elapsedTime

    particlesBackground.rotation.x = mouseY * (elapsedTime * 0.00009)
    particlesBackground.rotation.y = mouseX * (elapsedTime * 0.00009)

    // Render
    renderer.render(scene, camera)
    // composer.render()

    //Update Tween
    TWEEN.update()

    // Call tick again on the next frame
    window.requestAnimationFrame(animate)

}


function onWindowResize() {

    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}


function getCoordinatesFromLatLng(latitude, longitude, radiusEarth) {

    let latitude_rad = latitude * Math.PI / 180
    let longitude_rad = longitude * Math.PI / 180

    let xPos = radiusEarth * - (Math.cos(latitude_rad)) * Math.cos(longitude_rad)
    let zPos = radiusEarth * Math.cos(latitude_rad) * Math.sin(longitude_rad)
    let yPos = radiusEarth * Math.sin(latitude_rad);

    return { x: xPos, y: yPos, z: zPos }
}


function generateTarget() {

    //Sites Coordinate
    const sites = require('./sites.json')
    const sitesLat = []
    const sitesLng = []

    for (let i = 0; i < sites.length; i++) {
        sitesLat.push(parseFloat(sites[i].latlng.lat))
        sitesLng.push(parseFloat(sites[i].latlng.lng))
    }

    const sitesCoord = []
    for (let i = 0; i < sites.length; i++) {
        sitesCoord[i] = getCoordinatesFromLatLng(sitesLat[i], sitesLng[i], globeRad)
    }

    //Random Site Coordinate
    const random = Math.floor(Math.random() * sitesCoord.length)

    //Target
    target.position.x = sitesCoord[random].x
    target.position.y = sitesCoord[random].y
    target.position.z = sitesCoord[random].z

    target2.position.x = sitesCoord[random].x
    target2.position.y = sitesCoord[random].y
    target2.position.z = sitesCoord[random].z

    /*
    TEST 1
    */

    //get Quaternion from Points
    // vectorStart = target.position
    // vectorStart.normalize()
    // vectorEnd.normalize()
    // var getQuaternion = new THREE.Quaternion()
    // getQuaternion.setFromUnitVectors(vectorStart, vectorEnd)

    // //Tweening
    // const euler = new THREE.Euler()
    // const startQuaternion = new THREE.Quaternion() 
    // const endQuaternion = getQuaternion

    // startQuaternion.copy(target.quaternion).normalize()

    // const tween = new TWEEN.Tween(startQuaternion)
    //     .to(endQuaternion, 2000)
    //     .delay(1000)
    //     .easing(TWEEN.Easing.Exponential.InOut)
    //     .onUpdate(function () {
    //         euler.setFromQuaternion(startQuaternion)
    //         target.setRotationFromEuler(euler)
    //     }).onComplete(generateTarget)
    // tween.start()

    /*
TEST 2
*/

    //get Vector, Angle, Normal
    vectorStart = target.position
    normal.copy(vectorStart).cross(vectorEnd).normalize()
    angle.value = 0
    angleEnd.value = vectorEnd.angleTo(vectorStart)

    const camVec = vectorEnd
    camVec.z = 1.75

    var tween = new TWEEN.Tween(angle)
        .to(angleEnd, 5000)
        .delay(1000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function () {
            camera.position.copy(camVec).applyAxisAngle(normal, - (angle.value) )  
            camera.lookAt(center)
        })
        .onComplete(generateTarget)
        tween.start()
    
    //Tween
    // var tween = new TWEEN.Tween(angle)
    //     .to(angleEnd, 5000)
    //     .delay(1000)
    //     .easing(TWEEN.Easing.Exponential.InOut)
    //     .onUpdate(function () {
    //         target.position.copy(vectorStart).applyAxisAngle(normal, angle.value)
    //         target.lookAt(lookAt.copy(target.position).normalize().multiplyScalar(globeRad))
    //     }).onComplete(generateTarget)
    // // tween.chain(tween)
    // tween.start()

    // setTimeout(generateTarget, 2000)

    // const sitesPos = []
    // for (let i = 0; i < sitesLat.length; i++) {
    //     sitesPos.push(
    //         sitesCoord[i].x,
    //         sitesCoord[i].y,
    //         sitesCoord[i].z
    //     )
    // }
    // const vec1 = []
    // // const vec2 = new THREE.Vector3(0, 0, 0)
    // // const sitesVec = []
    // for (let i = 0; i < sitesLat.length; i++) {
    //     vec1.push(new THREE.Vector3(sitesCoord[i].x, sitesCoord[i].y, sitesCoord[i].z))
    // }
    // const vecDir = []
    // for (let i = 0; i < sitesLat.length; i++) {
    //     var dirTemp = new THREE.Vector3()
    //     vecDir.push(dirTemp.subVectors(vec2, vec1[i]).normalize())
    // }
    // var num = 2.001
    // for (let i = 0; i < sitesLat.length; i++) {
    //     sitesVec.push(
    //         vecDir[i].x + vec1[i].x * num,
    //         vecDir[i].y + vec1[i].y * num,
    //         vecDir[i].z + vec1[i].z * num
    //     )
    // }

    // /**
    //  * Lights
    //  */
    // const ptLight = new THREE.PointLight(0xffccaa, 100, 1000000)
    // ptLight.position.set(sitesCoord[random].x, sitesCoord[random].y, sitesCoord[random].z)
    // scene.add(ptLight)
}