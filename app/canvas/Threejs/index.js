import * as THREE from 'three'
import GUI from 'lil-gui'

export default class {
    constructor() {

        this.gui = new GUI()

        this.threejsCanvas = document.querySelector('.threejs__canvas__container')
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.scene = new THREE.Scene()
        this.fov = 75
        this.cameraZ = 50
        this.camera = new THREE.PerspectiveCamera(this.fov, this.width / this.height, 0.1, 1000)
        this.camera.position.z = this.cameraZ
        this.camera.lookAt(0, 0, 0)

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        })

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setClearColor(0xffffff)
        this.threejsCanvas.appendChild(this.renderer.domElement)

        // const axesHelper = new THREE.AxesHelper(50);
        // this.scene.add(axesHelper);

        this.mouse = new THREE.Vector2()
        this.handleClear()

        this.parameters = {
            color: 0x4cc9f0,
            thickness: 0.5
        }

        this.gui.addColor(this.parameters, 'color')
        this.gui.add(this.parameters, 'thickness').min(-3).max(3).step(0.1).name('thickness')

    }

    handleClear() {
        const clearButton = document.querySelector('.threejs button')
        clearButton.addEventListener('click', () => {
            this.destroy()
        })
    }

    addObject(x, y) {
        this.geometry = new THREE.CircleGeometry(this.parameters.thickness, 15);
        this.material = new THREE.MeshBasicMaterial({ color: this.parameters.color })
        this.object = new THREE.Mesh(this.geometry, this.material)

        this.object.position.set(x, y, 0)

        this.scene.add(this.object)
    }

    onMouseDown() {
        this.isHeld = true
    }

    onMouseUp() {
        this.isHeld = false
    }

    onMouseMove(event) {
        if(this.isHeld) {

            this.mouse.x = (event.clientX / this.width) * 2 - 1
            this.mouse.y = - (event.clientY / this.height) * 2 + 1
    
            const fovHalfRadians = Math.tan(Math.PI / 180 * this.fov / 2)
    
            const posX = this.mouse.x * this.cameraZ * fovHalfRadians * this.camera.aspect
            const posY = this.mouse.y * this.cameraZ * fovHalfRadians
    
            this.addObject(posX, posY)
        }

    }

    update() {
        this.renderer.render(this.scene, this.camera)
    }


    onResize() {
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

    }

    /**
     * Destroy.
     */
    destroy() {
        this.destroyThreejs(this.scene)
    }

    destroyThreejs(obj) {
        while (obj.children.length > 0) {
            this.destroyThreejs(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
            //in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach(prop => {
                if (!obj.material[prop])
                    return;
                if (obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')
                    obj.material[prop].dispose();
            })
            // obj.material.dispose();
        }
    }
}