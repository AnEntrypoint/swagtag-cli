#!/usr/bin/env node
var b32 = require("hi-base32");
if(process.argv.length == 5) {
  const port = parseInt(process.argv[process.argv.length-3]);
  const addr = parseInt(process.argv[process.argv.length-2]);
  const key = process.argv[process.argv.length-1];
  const out = require('./relay.js')().serve(key, port, false, addr);
  console.log('listening', b32.encode(out).replace('====','').toLowerCase());
  console.log('hex', out);
} else console.log("usage: hyper-tcp-relay-server <port> <addr> <key>");
