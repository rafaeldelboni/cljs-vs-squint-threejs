(ns app.core
  (:require
   ["three/addons/controls/OrbitControls.js" :refer [OrbitControls]]
   ["three/addons/libs/lil-gui.module.min.js" :refer [GUI]]
   ["three/addons/libs/stats.module.js$default" :as Stats]
   ["three/addons/utils/BufferGeometryUtils.js" :as BufferGeometryUtils]
   [three :refer [Object3D BufferGeometry BufferGeometryLoader Color InstancedMesh
                  Matrix4 Mesh MeshNormalMaterial PerspectiveCamera Quaternion
                  Scene Vector3 WebGLRenderer]]))

(def initial-state {:stats nil
                    :material nil
                    :scene nil
                    :camera nil
                    :renderer nil
                    :controls nil
                    :container nil
                    :gui nil
                    :api {:method "INSTANCED" :count 1000}})

(defonce state (atom initial-state))

(defn- prepare-container! [id]
  (let [container (js/document.getElementById id)]
    (set! (.-innerHTML container) "")
    container))

(defn- get-in-api [ks]
  (get-in @state [:api ks]))

(defn- randomize-matrix []
  (let [position (Vector3. (- (* (Math/random) 40) 20)
                           (- (* (Math/random) 40) 20)
                           (- (* (Math/random) 40) 20))
        quaternion (doto (new Quaternion) (.random))
        scale (new Vector3)]
    (fn [^Matrix4 matrix]
      (set! (.-x scale) (Math/random))
      (set! (.-y scale) (.-x scale))
      (set! (.-z scale) (.-x scale))
      (.compose matrix position quaternion scale))))

(defn traverse [object callback]
  (callback object)
  (let [children (.-children object)]
    (dotimes [i (.-length children)]
      (when-let [curent (get children i)]
        (traverse curent callback)))))

(defn- clean []
  (let [^Scene scene (:scene @state)]
    (when scene
      (traverse scene (fn [^Object3D object]
                        (when (and object (instance? Mesh object))
                          (.dispose ^Material (.-material object))
                          (.dispose ^BufferGeometry (.-geometry object))
                          (.remove scene object)))))))

(defn- make-instanced [geometry {:keys [scene material]}]
  (let [matrix (new Matrix4)
        mesh (new InstancedMesh geometry material (get-in-api :count))]
    (dotimes [i (get-in-api :count)]
      ((randomize-matrix) matrix)
      (.setMatrixAt mesh i matrix))
    (.add scene mesh)))

(defn- make-merged [geometry {:keys [scene material]}]
  (let [matrix (new Matrix4)
        geometries (map (fn [_] (let [^BufferGeometry instance-geometry (.clone geometry)]
                                  ((randomize-matrix) matrix)
                                  (.applyMatrix4 instance-geometry matrix)))
                        (range (get-in-api :count)))
        merged-geometry (BufferGeometryUtils/mergeGeometries (vec geometries))]
    (.add scene (new Mesh merged-geometry material))))

(defn- make-naive [geometry {:keys [scene material]}]
  (let [matrix (new Matrix4)]
    (dotimes [_i (get-in-api :count)]
      ((randomize-matrix) matrix)
      (let [mesh (new Mesh geometry material)]
        (.applyMatrix4 mesh matrix)
        (.add scene mesh)))))

(defn init-mesh []
  (clean)
  (.load (new BufferGeometryLoader)
         "https://raw.githubusercontent.com/mrdoob/three.js/refs/heads/dev/examples/models/json/suzanne_buffergeometry.json"
         (fn [^BufferGeometry geometry]
           (let [method (get-in-api :method)]
             (.computeVertexNormals geometry)
             (js/console.time (str method " (build)"))
             (case method
               "INSTANCED" (make-instanced geometry @state)
               "MERGED" (make-merged geometry @state)
               "NAIVE" (make-naive geometry @state))
             (js/console.timeEnd (str method " (build)"))))))

(defn- animate []
  (let [{:keys [controls renderer scene camera stats]} @state]
    (.update controls)
    (.render ^WebGLRenderer renderer scene camera)
    (.update stats)))

(defn- on-window-resize [^PerspectiveCamera camera
                         ^WebGLRenderer renderer]
  (let [width (.-innerWidth js/window)
        height (.-innerHeight js/window)]
    (set! (.-aspect camera) (/ width height))
    (.updateProjectionMatrix camera)
    (.setSize renderer width height)))

(defn init-three []
  (let [width (.-innerWidth js/window)
        height (.-innerHeight js/window)
        stats (new Stats)
        material (new MeshNormalMaterial)
        scene (doto (new Scene)
                (-> .-background (set! (new Color 0xffffff))))
        camera (doto (new PerspectiveCamera 70 (/ width height) 1 100)
                 (.translateZ 30))
        renderer (doto (new WebGLRenderer {:antialias true})
                   (.setPixelRatio (.-devicePixelRatio js/window))
                   (.setSize width height)
                   (.setAnimationLoop animate))
        controls (doto (new OrbitControls camera (.-domElement renderer))
                   (-> .-autoRotate (set! true)))
        container (doto (prepare-container! "app")
                    (.appendChild (.-domElement renderer))
                    (.appendChild (.-dom stats)))
        api (:api @state)
        gui (doto (new GUI)
              (-> (.add api "method" ["INSTANCED" "MERGED" "NAIVE"])
                  (.onChange init-mesh))
              (-> (.add api "count" 1 10000)
                  (.step 1)
                  (.onChange init-mesh)))]
    (.addEventListener js/window "resize" #(on-window-resize camera renderer))
    (swap! state assoc
           :stats stats
           :material material
           :scene scene
           :camera camera
           :renderer renderer
           :controls controls
           :container container
           :gui gui)))

(defn ^:export init []
  (reset! state initial-state)
  (init-three)
  (init-mesh))

(init)
