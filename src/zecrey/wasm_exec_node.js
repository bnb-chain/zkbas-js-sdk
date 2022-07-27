// Copyright 2021 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

'use strict';

globalThis.require = require;
globalThis.fs = require('fs');
globalThis.TextEncoder = require('util').TextEncoder;
globalThis.TextDecoder = require('util').TextDecoder;

globalThis.performance = {
  now() {
    const [sec, nsec] = process.hrtime();
    return sec * 1000 + nsec / 1000000;
  }
};

const crypto = require('crypto');
globalThis.crypto = {
  getRandomValues(b) {
    crypto.randomFillSync(b);
  }
};

require('./wasm_exec');

const go = new Go();
go.argv = process.argv.slice(2);
go.env = Object.assign({ TMPDIR: require('os').tmpdir() }, process.env);
go.exit = process.exit;

let func = process.argv[3];
let funcArgs = process.argv.slice(4)

WebAssembly.instantiate(fs.readFileSync(process.argv[2]), go.importObject)
  .then((result) => {
    process.on('exit', (code) => {
			const result = globalThis[func](...funcArgs);
      console.log(result);
      process.exit();
    });
    return go.run(result.instance);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
