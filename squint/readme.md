# Threejs vs squint

## Requirements
- [npm](https://www.npmjs.com/)
- [babashka](https://babashka.org/)

## Instructions

### Bootstrap
```bash
npm install
```

### Watch
```bash
npm run watch
```

### Release Build (public/dist)
```bash
npm run release
```

#### Serve Release bundle
```bash
gzip public/dist/assets/*.js
npx http-server public/dist -g
```
