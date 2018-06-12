const THREE = require("three");
const dat = require("dat.gui");

class Explorer {

    constructor(w, h) {
        this.setupGraphics(w, h);
        this.setupProps();
        this.setupGui();
    }

    setupProps() {
        this.props = {
            numRings: 8,
            numSpirals: 8,
            zoomAmount: 2,
            foldAmount: 2,
            rotateSpeed: 0.1,
            colorSpread: 0.3,
            shapeSize: 1.,
            colorA: [255, 200, 0],
            colorB: [0, 200, 255],
            colorC: [50, 0, 50]            
        }
    }

    update() {
        
        this.uniforms.time.value += this.timeStep;
        this.uniforms.numRings.value = this.props.numRings;
        this.uniforms.numSpirals.value = this.props.numSpirals;
        this.uniforms.zoomAmount.value = this.props.zoomAmount;
        this.uniforms.rotateSpeed.value = this.props.rotateSpeed;
        this.uniforms.colorSpread.value = this.props.colorSpread;
        this.uniforms.foldAmount.value = this.props.foldAmount;
        this.uniforms.shapeSize.value = this.props.shapeSize;        
        
        this.uniforms.colorA.value.x = this.props.colorA[0] / 255;
        this.uniforms.colorA.value.y = this.props.colorA[1] / 255;
        this.uniforms.colorA.value.z = this.props.colorA[2] / 255;

        this.uniforms.colorB.value.x = this.props.colorB[0] / 255;
        this.uniforms.colorB.value.y = this.props.colorB[1] / 255;
        this.uniforms.colorB.value.z = this.props.colorB[2] / 255;

        this.uniforms.colorC.value.x = this.props.colorC[0] / 255;
        this.uniforms.colorC.value.y = this.props.colorC[1] / 255;
        this.uniforms.colorC.value.z = this.props.colorC[2] / 255;

        }

    setupGui() {
        this.gui = new dat.GUI();
        this.gui.add(this.props, "rotateSpeed", -10, 10).step(0.01);
        this.gui.add(this.props, "zoomAmount", 0.01, 10).step(0.1);
        this.gui.add(this.props, "numRings", 2, 40).step(0.25);
        this.gui.add(this.props, "numSpirals", 2, 256).step(2.);
        this.gui.add(this.props, "colorSpread", 0.01, 5.).step(0.05);
        this.gui.add(this.props, "foldAmount", 1., 16.).step(0.25);
        this.gui.add(this.props, "shapeSize", 1., 8).step(0.01);
        this.gui.addColor(this.props, "colorA");
        this.gui.addColor(this.props, "colorB");
        this.gui.addColor(this.props, "colorC");        
    }

    setupGraphics(w, h) {

        // general params
        this.timeStep = .001;

        this.vertexShader = `
            varying vec2 texcoord;
            void main(void) {
                texcoord = uv;
                gl_Position = vec4(position, 1.);
            }
        `
        this.fragmentShader = `

            #define TWO_PI 6.28318530718
            #define rotate(a) mat2(cos(a), sin(a), -sin(a), cos(a))
            #define spiral(u, a, r, t, d) abs(sin(t + r * length(u) + a * (d * atan(u.y, u.x))))
            #define flower(u, a, r, t) spiral(u, a, r, t, 1.) * spiral(u, a, r, t, -1.)
            #define sinp(a) .5 + sin(a) * .5
            #define polar(a, t) a * vec2(cos(t), sin(t))

            uniform float time;
            uniform vec2 resolution;

            uniform float zoomAmount;
            uniform float rotateSpeed;
            uniform float numRings;
            uniform float numSpirals;
            uniform float colorSpread;
            uniform float numPetals;
            uniform float foldAmount;
            uniform float shapeSize;

            uniform vec3 colorA;
            uniform vec3 colorB;
            uniform vec3 colorC;            

            varying vec2 texcoord;

            void main() {

                vec2 st = (2. * gl_FragCoord.xy - resolution.xy) / resolution.y;
                st = rotate((time * rotateSpeed)) * st;
                st *= zoomAmount;
                st = fract(st) - .5;

                vec3 col;
                vec2 v;
                float t = time;

                for (int i = 0; i < 3; i++) {
                    
                    for (float i = 0.; i < TWO_PI; i += TWO_PI / 16.) {
                        
                        t += (colorSpread) * 
                            flower(
                                vec2(st + polar(shapeSize, i)
                            ), 
                            numSpirals, 
                            numRings, 
                            time / 10.
                        );

                    }
                
                    col[i] = sin(5. * t + length(st) * foldAmount * sinp(t));
                
                }

                vec3 mix1 = mix(
                    col,
                    colorA,
                    col.r
                );

                vec3 mix2 = mix(
                    mix1,
                    colorB,
                    col.g
                );

                vec3 final = mix(
                    mix2,
                    colorC,
                    col.b
                );

                gl_FragColor = vec4(
                    final
                , 1.0);


            }
        `

        // keep time and resolution private
        // other uniforms are adjustable
        this.uniforms = {

            time: new THREE.Uniform(0),
            resolution: new THREE.Uniform(new THREE.Vector2(width, height)),

            rotateSpeed: new THREE.Uniform(.2),
            zoomAmount: new THREE.Uniform(2),
            numRings: new THREE.Uniform(8),
            numSpirals: new THREE.Uniform(8),
            colorSpread: new THREE.Uniform(8),
            foldAmount: new THREE.Uniform(2),
            shapeSize: new THREE.Uniform(1),
            
            colorA: new THREE.Uniform(new THREE.Vector3(0)),
            colorB: new THREE.Uniform(new THREE.Vector3(0)),
            colorC: new THREE.Uniform(new THREE.Vector3(0))
            

        }

        this.geometry = new THREE.PlaneGeometry(w, h);
        this.material = new THREE.ShaderMaterial({
            fragmentShader: this.fragmentShader,
            vertexShader: this.vertexShader,
            uniforms: this.uniforms
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

    }

    addToScene(scene) {
        scene.add(this.mesh);
    }

}

module.exports = {Explorer};