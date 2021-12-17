const DHT = require("@hyperswarm/dht");
const crypto = require("hypercore-crypto");
var net = require("net");
var pump = require("pump");
const node = new DHT({});

module.exports = () => {
  return {
    /* share a local port remotely */
    serve: (key, port, stdio) => {
      const keyPair = crypto.keyPair(crypto.data(Buffer.from(key)));
      const server = node.createServer();
      server.on("connection", function(servsock) {
        console.log('connecting local '+port)
        //const socket = node.connect(keyPair.publicKey);
        var socket = net.connect(port, "localhost");
        socket.on('error', console.error);
        const local = servsock;
        let open = { local:true, remote:true };
        local.on('data', (d)=>{socket.write(d)});
        socket.on('data', (d)=>{local.write(d)});
      
        const remoteend = (type) => {
          console.log('local has ended, ending remote', type)
          if(open.remote) socket.end();
          open.remote = false;
        }
        const localend = (type) => {
          console.log('remote has ended, ending local', type)
          if(open.local) local.end();
          open.local = false;
        }
        local.on('error', remoteend)
        local.on('finish', remoteend)
        local.on('end', remoteend)
        socket.on('finish', localend)
        socket.on('error', localend)
        socket.on('end', localend)
          
      });
      server.listen(keyPair);
      return keyPair.publicKey;
    },
    dns: (key) => {
      const keyPair = crypto.keyPair(crypto.data(Buffer.from(key)));
      const server = node.createServer();
      server.on("connection", function(servsock) {
          servsock.write(Buffer.from(JSON.stringify(server.address())))
          servsock.end();
      });
      server.listen(keyPair);
      return keyPair.publicKey;
    },
    client: (hexPublicKey, port, stdio) => {
      const publicKey = Buffer.from(hexPublicKey, 'hex');
      if (stdio) {
        const socket = node.connect(publicKey);
        pump(process.stdin, socket, process.stdout);
      } else {
        var server = net.createServer(function(local) {
          const socket = node.connect(publicKey);
          let open = { local:true, remote:true };
          local.on('data', (d)=>{socket.write(d)});
          socket.on('data', (d)=>{local.write(d)});
        
          const remoteend = () => {
            if(open.remote) socket.end();
            open.remote = false;
          }
          const localend = () => {
            if(open.local) local.end();
            open.local = false;
          }
          local.on('error', remoteend)
          local.on('finish', remoteend)
          local.on('end', remoteend)
          socket.on('finish', localend)
          socket.on('error', localend)
          socket.on('end', localend)
        }); 
        server.listen(port, "127.0.0.1");
      }
      return publicKey;
    }
  };
};
