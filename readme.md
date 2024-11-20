# cljs VS squint

An experiment to compare the same project created using ClojureScript (CLJS) and Squint by porting a Three.js example: [Instancing Performance](https://threejs.org/examples/#webgl_instancing_performance).

## Repositories
- [cljs](./cljs/)
- [squint](./squint/)

# Comparison

## CLJS

### Pros
- Targets the JavaScript ecosystem with Clojure
- Google Closure: an advanced whole-program optimizer
- Primarily used with the JVM

### Cons
- No support for ES6 modules
- No async/await support
- No support for JS destructuring
- No support for JSX
- Cannot compile ad-hoc small snippets (scripting, on-the-fly compilation)
- Difficulty in distributing compiled CLJS libraries on NPM for JS usage
- JVM dependency

## SQUINT

### Pros
- Lightweight
- Fast startup (no JVM)
- Compiles directly to JS
- Small bundle size
- Compatible with ES6 treeshakers for optimization

### Cons
- Setting up tests in your project can be tricky
- Lazy iterable values are not cached
- Cannot use existing CLJS libraries, only NPM
- nRepl support is incomplete (numerous bugs)
- No browser nRepl support (WIP)

## Diff
```bash
vimdiff squint/src/app/core.cljs cljs/src/app/core.cljs
```
> Lines: 5, 19, 29, 73, 121, and 132.

## Processing Times
The Three.js project ported includes three different strategies to instantiate geometries in the scene and benchmarks their performance:

| Method    | Count | cljs     | squint   |
| --------- | ----- | -------- | -------- |
| INSTANCED | 1000  | ~3 ms    | ~2 ms    |
| MERGED    | 1000  | ~100 ms  | ~104 ms  |
| NAIVE     | 1000  | ~12 ms   | ~12 ms   |
| INSTANCED | 10000 | ~4 ms    | ~4 ms    |
| MERGED    | 10000 | ~1180 ms | ~1172 ms |
| NAIVE     | 10000 | ~75 ms   | ~78 ms   |

## Bundle Sizes
| Bundle | JS     | Gzip   |
| ------ | ------ | ------ |
| squint | 528 kB | 134 kB |
| cljs   | 646 kB | 161 kB |

### Why?
**CLJS + app code bundled alone without libs is 113 kB (26 kB gzipped).**  
**Pros:**
- Includes all of Clojure's persistent/immutable CLJS data structures.

**Cons:**
- All of ClojureScript is included.
- Google Closure does not emit code optimized for ES6 treeshakers like esbuild or webpack.
- Everything is wrapped in one global object instead of ES6-idiomatic code.

**Squint + app code bundled is less than 15 kB without minification.**  
**Pros:**
- Maintains CLJS syntax but compiles directly to JS.
- Provides more direct JS interop.

**Cons:**
- No immutability; uses plain JS objects throughout.
