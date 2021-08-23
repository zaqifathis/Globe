import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BufferAttribute, Color, Float32BufferAttribute, Int8Attribute, Light, PointsMaterial } from 'three'
import cities from 'cities.json'
import * as POSTPROCESSING from 'postprocessing'
import * as TWEEN from 'tween'
import { update } from 'tween'
import * as dat from 'dat.gui'


let camera, scene, renderer, composer, target, target2,
    globeParticles, particlesBackground, geoCoord, guiLoc, cityLoc
let mouseX = 0
let mouseY = 0

const citiesName = []
const latitudes = []
const longitudes = []
const countryName = []
const clock = new THREE.Clock()
const globeRad = 1
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

var nextCity
var controls
var center = new THREE.Vector3()
var vectorStart = new THREE.Vector3()
var vectorEnd = new THREE.Vector3()
var normal = new THREE.Vector3()
var camVec = new THREE.Vector3()
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


    for (let i = 0; i < cities.length; i++) {
        latitudes.push(parseFloat(cities[i].lat))
        longitudes.push(parseFloat(cities[i].lng))
        citiesName.push(cities[i].name)
        countryName.push(cities[i].country)
    }

    geoCoord = []
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


    //DBF Project Locations


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

    const sitesPos = []
    for (let i = 0; i < sitesLat.length; i++) {
        sitesPos.push(
            sitesCoord[i].x,
            sitesCoord[i].y,
            sitesCoord[i].z
        )
    }
    const sphereGroup = new THREE.Group()
    const siteCoor = new THREE.SphereBufferGeometry(0.004, 30, 30)
    for (let i = 0; i < sitesLat.length; i++) {
        const siteMat = new THREE.MeshStandardMaterial({
            color: 0xffccaa,
            emissive: 0xffccaa,
            emissiveIntensity: 10000
        })
        target2 = new THREE.Mesh(siteCoor, siteMat)
        target2.position.x = sitesCoord[i].x
        target2.position.y = sitesCoord[i].y
        target2.position.z = sitesCoord[i].z
        sphereGroup.add(target2)
    }
    scene.add(sphereGroup)

    const ptLight = new THREE.PointLight(0xffccaa, 10000, 1000000)
    ptLight.position.set(sitesCoord.x, sitesCoord.y, sitesCoord.z)
    scene.add(ptLight)


    //Target Location


    const randGeo = new THREE.SphereBufferGeometry(0.005, 30, 30)
    const randGeoMat = new THREE.MeshPhongMaterial({
        color: 0xa00449,
        emissive: 0xea5f5f,
        shininess: 1000
    })
    target = new THREE.Mesh(randGeo, randGeoMat)
    target.position.x = 10
    target.position.y = 10
    scene.add(target)


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

    composer = new POSTPROCESSING.EffectComposer(renderer)
    composer.addPass(new POSTPROCESSING.RenderPass(scene, camera))
    const effectPass = new POSTPROCESSING.EffectPass(
        camera,
        new POSTPROCESSING.BloomEffect()
    )
    effectPass.renderToScreen = true
    composer.addPass(effectPass)


    // Update Sizes


    window.addEventListener('resize', onWindowResize)


    // Controls


    controls = new OrbitControls(camera, canvas)
    controls.enablePan = false
    controls.enableRotate = false
    controls.enableZoom = false
    controls.enablePan = false
    controls.target = center
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controls.update()

    document.addEventListener('keypress', function (ePress) {
        if (ePress.key === "Enter") {
            controls.autoRotate = false
            controls.update()
            vectorEnd.copy(camera.position)
            getCityCoordinate(nextCity)
        }
        else {
            controls.autoRotate = true
        }
    })


    //dat gui text input


    // const countriesName = require('./slim-2.json')
    const textLoc = {
        location: "Type your location"
    }

    guiLoc = new dat.GUI()
    guiLoc.add(textLoc, "location").onFinishChange(function (value) {
        nextCity = value.slice()
    })


    //Mouse


    document.addEventListener('mousemove', animateParticles)
    function animateParticles(event) {
        mouseY = event.clientY
        mouseX = event.clientX
    }
}



function getCityCoordinate(cityName) {
    const citiesTemp = []
    for (let i = 0; i < citiesName.length; i++) {
        if (cityName == (citiesName[i]).toLowerCase()) {
            cityLoc = getCoordinatesFromLatLng(latitudes[i], longitudes[i], globeRad)
            citiesTemp.push(cityLoc)
            target.position.x = citiesTemp[0].x
            target.position.y = citiesTemp[0].y
            target.position.z = citiesTemp[0].z

            generateTarget()
            console.log(citiesName[i], countryName[i], cityLoc)
        }
    }
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

    //get Vector, Angle, Normal
    vectorStart = target.position
    normal.copy(vectorStart).cross(vectorEnd).normalize()
    angle.value = 0
    angleEnd.value = vectorEnd.angleTo(vectorStart)

    //Tween

    const targetCamPos = new THREE.Vector3()
    const targetDirection = new THREE.Vector3()
    targetCamPos.copy(target.position)
    targetDirection.subVectors(targetCamPos, center).normalize()
    targetCamPos.add(targetDirection.multiplyScalar(.101))

    var targetCamPos1 = new THREE.Vector3()
    const targetDirection1 = new THREE.Vector3()
    targetCamPos1.copy(target.position)
    targetDirection1.subVectors(targetCamPos1, center)
    targetCamPos1.add(targetDirection1.multiplyScalar(.75))

    var tween = new TWEEN.Tween(angle)
        .to(angleEnd, 5000)
        .delay(200)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function () {
            camera.position.copy(vectorEnd).applyAxisAngle(normal, - (angle.value))
            camera.lookAt(center)
        })

    var tweenZoomIn = new TWEEN.Tween(camera.position)
        .to(targetCamPos, 2000)
        .easing(TWEEN.Easing.Exponential.InOut)

    var tweenZoomOut = new TWEEN.Tween(camera.position)
        .to(targetCamPos1, 3000)
        .delay(1000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onComplete(() => {
            camVec.copy(camera.position)
            vectorEnd.copy(camVec)
            var vectorCameraDirection = new THREE.Vector3()
            vectorCameraDirection.subVectors(camVec, center)
            vectorEnd.add(vectorCameraDirection.multiplyScalar(-.75))
            controls.autoRotate = true
        })

    tween.chain(tweenZoomIn)
    tweenZoomIn.chain(tweenZoomOut)
    tween.start()
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


function animate() {

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    particlesBackground.rotation.y = .1 * elapsedTime

    particlesBackground.rotation.x = mouseY * (elapsedTime * 0.00009)
    particlesBackground.rotation.y = mouseX * (elapsedTime * 0.00009)

    // Render
    // renderer.render(scene, camera)
    composer.render()

    //Update Tween
    TWEEN.update()

    //Update OrbitControls
    controls.update()

    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}