[![Build Status](https://github.com/axetroy/deno_pkger/workflows/test/badge.svg)](https://github.com/axetroy/deno_pkger/actions)

### Deno General Resources Packager

This is very painful for loading static resources

The library is to convert static resource files into ts files

Load from a virtual file system

### Usage

1. Install the command line tool

```bash
$ deno install -A --unstable https://raw.githubusercontent.com/axetroy/deno_pkger/master/pkger.ts
```

2. Generate file from static resource

```bash
$ tree ./static
./example/
├── index.html
└── views
    ├── home.html
$ pkger --include=./static --out=./dist
$ tree ./dist
dist/
├── index.html.bundle.ts
└── views
    └── home.html.bundle.ts
```

3. Load the static file

```typescript
import fs from 'https://denopkg.com/axetroy/deno_pkger/mod.ts'
import './dist/index.html.bundle.ts'

const stat = await fs.stat('/index.html')
console.log(stat)
// {
//   isFile: true,
//   isDirectory: false,
//   isSymlink: false,
//   size: 218,
//   mtime: new Date('2020-05-31T03:00:19.096Z'),
//   atime: new Date('2020-05-31T03:00:20.150Z'),
//   birthtime: new Date('2020-05-31T03:00:06.181Z'),
//   dev: 16777220,
//   ino: 4400719062,
//   mode: 33188,
//   nlink: 1,
//   uid: 501,
//   gid: 20,
//   rdev: 0,
//   blksize: 4096,
//   blocks: 8
// }
```
