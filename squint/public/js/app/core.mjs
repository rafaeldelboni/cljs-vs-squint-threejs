import * as squint_core from 'squint-cljs/core.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Object3D, BufferGeometry, BufferGeometryLoader, Color, InstancedMesh, Matrix4, Mesh, MeshNormalMaterial, PerspectiveCamera, Quaternion, Scene, Vector3, WebGLRenderer } from 'three';
var initial_state = ({ "api": ({ "method": "INSTANCED", "count": 1000 }), "controls": null, "gui": null, "renderer": null, "material": null, "container": null, "camera": null, "stats": null, "scene": null });
var state = squint_core.atom(initial_state);
var prepare_container_BANG_ = function (id) {
const container1 = document.getElementById(id);
container1.innerHTML = "";
return container1;
};
var get_in_api = function (ks) {
return squint_core.get_in(squint_core.deref(state), ["api", ks]);
};
var randomize_matrix = function () {
const position1 = new Vector3(((Math.random()) * (40)) - (20), ((Math.random()) * (40)) - (20), ((Math.random()) * (40)) - (20));
const quaternion2 = (() => {
const G__433 = new Quaternion();
G__433.random();
return G__433;
})();
const scale4 = new Vector3();
return function (matrix) {
scale4.x = Math.random();
scale4.y = scale4.x;
scale4.z = scale4.x;
return matrix.compose(position1, quaternion2, scale4);
};
};
var traverse = function (object, callback) {
callback(object);
const children1 = object.children;
const n__23494__auto__2 = children1.length;
let i3 = 0;
while(true){
if ((i3) < (n__23494__auto__2)) {
const temp__23676__auto__4 = squint_core.get(children1, i3);
if (squint_core.truth_(temp__23676__auto__4)) {
const curent5 = temp__23676__auto__4;
traverse(curent5, callback)};
let G__6 = (i3 + 1);
i3 = G__6;
continue;
};break;
}

};
var clean = function () {
const scene1 = squint_core.get(squint_core.deref(state), "scene");
if (squint_core.truth_(scene1)) {
return traverse(scene1, (function (object) {
if (squint_core.truth_((() => {
const and__24072__auto__2 = object;
if (squint_core.truth_(and__24072__auto__2)) {
const c__24003__auto__3 = Mesh;
const x__24004__auto__4 = object;
const ret__24005__auto__5 = (x__24004__auto__4 instanceof c__24003__auto__3);
return ret__24005__auto__5;} else {
return and__24072__auto__2;}
})())) {
object.material.dispose();
object.geometry.dispose();
return scene1.remove(object);}
}));}
};
var make_instanced = function (geometry, p__44) {
const map__12 = p__44;
const scene3 = squint_core.get(map__12, "scene");
const material4 = squint_core.get(map__12, "material");
const matrix5 = new Matrix4();
const mesh6 = new InstancedMesh(geometry, material4, get_in_api("count"));
const n__23494__auto__7 = get_in_api("count");
let i8 = 0;
while(true){
if ((i8) < (n__23494__auto__7)) {
randomize_matrix()(matrix5);
mesh6.setMatrixAt(i8, matrix5);
let G__9 = (i8 + 1);
i8 = G__9;
continue;
};break;
}
;
return scene3.add(mesh6);
};
var make_merged = function (geometry, p__45) {
const map__12 = p__45;
const scene3 = squint_core.get(map__12, "scene");
const material4 = squint_core.get(map__12, "material");
const matrix5 = new Matrix4();
const geometries6 = squint_core.map((function (_) {
const instance_geometry7 = geometry.clone();
randomize_matrix()(matrix5);
return instance_geometry7.applyMatrix4(matrix5);
}), squint_core.range(get_in_api("count")));
const merged_geometry8 = BufferGeometryUtils.mergeGeometries(squint_core.vec(geometries6));
return scene3.add(new Mesh(merged_geometry8, material4));
};
var make_naive = function (geometry, p__46) {
const map__12 = p__46;
const scene3 = squint_core.get(map__12, "scene");
const material4 = squint_core.get(map__12, "material");
const matrix5 = new Matrix4();
const n__23494__auto__6 = get_in_api("count");
let _i7 = 0;
while(true){
if ((_i7) < (n__23494__auto__6)) {
randomize_matrix()(matrix5);
const mesh8 = new Mesh(geometry, material4);
mesh8.applyMatrix4(matrix5);
scene3.add(mesh8);
let G__9 = (_i7 + 1);
_i7 = G__9;
continue;
};break;
}

};
var init_mesh = function () {
clean();
return new BufferGeometryLoader().load("https://raw.githubusercontent.com/mrdoob/three.js/refs/heads/dev/examples/models/json/suzanne_buffergeometry.json", (function (geometry) {
const method1 = get_in_api("method");
geometry.computeVertexNormals();
console.time(squint_core.str(method1, " (build)"));
const G__472 = method1;
switch (G__472) {case "INSTANCED":
make_instanced(geometry, squint_core.deref(state))
break;
case "MERGED":
make_merged(geometry, squint_core.deref(state))
break;
case "NAIVE":
make_naive(geometry, squint_core.deref(state))
break;
default:
throw new Error(squint_core.str("No matching clause: ", G__472))};
return console.timeEnd(squint_core.str(method1, " (build)"));
}));
};
var animate = function () {
const map__12 = squint_core.deref(state);
const controls3 = squint_core.get(map__12, "controls");
const renderer4 = squint_core.get(map__12, "renderer");
const scene5 = squint_core.get(map__12, "scene");
const camera6 = squint_core.get(map__12, "camera");
const stats7 = squint_core.get(map__12, "stats");
controls3.update();
renderer4.render(scene5, camera6);
return stats7.update();
};
var on_window_resize = function (camera, renderer) {
const width1 = window.innerWidth;
const height2 = window.innerHeight;
camera.aspect = (width1) / (height2);
camera.updateProjectionMatrix();
return renderer.setSize(width1, height2);
};
var init_three = function () {
const width1 = window.innerWidth;
const height2 = window.innerHeight;
const stats3 = new Stats();
const material4 = new MeshNormalMaterial();
const scene5 = (() => {
const G__486 = new Scene();
G__486.background = new Color(16777215);
return G__486;
})();
const camera7 = (() => {
const G__498 = new PerspectiveCamera(70, (width1) / (height2), 1, 100);
G__498.translateZ(30);
return G__498;
})();
const renderer9 = (() => {
const G__5010 = new WebGLRenderer(({ "antialias": true }));
G__5010.setPixelRatio(window.devicePixelRatio);
G__5010.setSize(width1, height2);
G__5010.setAnimationLoop(animate);
return G__5010;
})();
const controls11 = (() => {
const G__5112 = new OrbitControls(camera7, renderer9.domElement);
G__5112.autoRotate = true;
return G__5112;
})();
const container13 = (() => {
const G__5214 = prepare_container_BANG_("app");
G__5214.appendChild(renderer9.domElement);
G__5214.appendChild(stats3.dom);
return G__5214;
})();
const api15 = squint_core.get(squint_core.deref(state), "api");
const gui16 = (() => {
const G__5317 = new GUI();
G__5317.add(api15, "method", ["INSTANCED", "MERGED", "NAIVE"]).onChange(init_mesh);
G__5317.add(api15, "count", 1, 10000).step(1).onChange(init_mesh);
return G__5317;
})();
window.addEventListener("resize", (function () {
return on_window_resize(camera7, renderer9);
}));
return squint_core.swap_BANG_(state, squint_core.assoc, "stats", stats3, "material", material4, "scene", scene5, "camera", camera7, "renderer", renderer9, "controls", controls11, "container", container13, "gui", gui16);
};
var init = function () {
squint_core.reset_BANG_(state, initial_state);
init_three();
return init_mesh();
};
init();

export { initial_state, state, traverse, init_mesh, init_three, init }
