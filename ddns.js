#!/usr/bin/env node
var b32 = require("hi-base32");
const crypto = require("hypercore-crypto");
const DHT = require("@hyperswarm/dht");
const node = new DHT({});
const serve = (key) => {
  const keyPair = crypto.keyPair(crypto.data(Buffer.from(key)));
  const server = node.createServer();
  server.on("connection", function(servsock) {
      servsock.write(Buffer.from(JSON.stringify(server.address())))
      servsock.end();
  });
  server.listen(keyPair);
  return keyPair.publicKey;
}
const key = process.argv[process.argv.length-1];
const out = serve(key);
console.log('Set your universal dns entry to:');
console.log('ddns:'+b32.encode(out).replace('====','').toLowerCase());

