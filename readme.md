# cljs VS squint

An experiment to compare the same project created using ClojureScript (CLJS) and Squint by porting a Three.js example [instancing performance](https://threejs.org/examples/#webgl_instancing_performance)

## Repositories
- [cljs](./cljs/)
- [squint](./squint/)

## Comparison

### Cljs

#### Pros
- Targets JavaScript ecosystem with Clojure
- Google Closure: advanced whole program optimizer
- Mostly used from JVM
#### Cons
- No support for ES6 modules
- Async/await
- No support to JS destructuring
- No support for JSX
- No compiling ad-hoc small snippets (scripting, on the fly compilation)
- Hard to distribute compiled CLJS libraries on NPM for usage from JS
- JVM dependency

### Squint

#### Pros
- Light-weight
- Fast starup (no JVM)
- Compiles directly to JS
- Small bundle size
- Can be optimized by ES6 treeshakers
#### Cons
- Setup tests in your project can be tricky
- Lazy iterable values results are not cached
- No support to use existing cljs libraries only NPM
- No support fully working nRepl support (Lots of bugs)
- No browser nRepl (WIP)

### Diff
```bash
vimdiff squint/src/app/core.cljs cljs/src/app/core.cljs
```
> Lines: 5, 19, 29, 73, 121 and 132.

### Processing times
The threejs project ported has 3 different strategies to instanciate geometries in the scene and does some benchmarks between each method:

| method    | count | cljs     | squint   |
| --------- | ----- | -------- | -------- |
| INSTANCED | 1000  | ~3 ms    | ~2 ms    |
| MERGED    | 1000  | ~100 ms  | ~104 ms  |
| NAIVE     | 1000  | ~12 ms   | ~12 ms   |
| INSTANCED | 10000 | ~4 ms    | ~4 ms    |
| MERGED    | 10000 | ~1180 ms | ~1172 ms |
| NAIVE     | 10000 | ~75 ms   | ~78 ms   |

### Bundle Sizes
| bundle | js     | gzip   |
| ------ | ------ | ------ |
| squint | 528 kB | 134 kB |
| cljs   | 646 kB | 161 kB |

#### Why?
**Cljs + app code bundled alone without libs is 113 kB (26 kB gzipped).**  
Pros:
- This is because it has all Clojure's persistent/immutable CLJS data structures.
Cons:
- All of ClojureScript is included
- Google Closure does not emit code that can be optimized by ES6 treeshakers like esbuild, webpack
- Everything is wrapped in one global object, instead of ES6-idiomatic code

**Squint + app code bundled is less than 15 kB without minification.**  
Pros:
- CLJS syntax but compiles directly to JS
- More direct JS interop
Cons:
- No immutability, just JS objects all the way down

