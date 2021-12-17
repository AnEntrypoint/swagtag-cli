const inquirer = require('inquirer');
const fs = require('fs');
var b32 = require("hi-base32");
require('dotenv').config();
if(process.env.type == 'tun') {
	const out = require('./relay.js')().serve(process.env.key, process.env.port, false, process.env.host);
} else if(process.env.type == 'dns') {
      const out = require('./relay.js')().dns(process.env.key);
} else inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Select a mode of operation:',
      choices: ['uDDNS (the domain leads to your ip)', 'HyperWEB tunnel (the domain leads to an http host via this app)'],
    },
    {
      name: 'key',
      message: 'Provide a seed to randomise your keys with:',
    },
  ])
  .then(answers => {
    global.key = answers.key;
    if(answers.type.startsWith('uDDNS')) {
      const out = require('./relay.js')().dns(key);
	       fs.writeFileSync('.env',`
type=dns
key=${key}
`)
      console.log('Set your µDNS address to: ');
      console.log('ddns:'+b32.encode(out).replace('====','').toLowerCase());
    } else {
	setTimeout(()=>{
	inquirer.prompt([
	    {
	      name: 'host',
	      message: 'Host to tunnel to:',
	    },
	    {
	      name: 'port',
	      message: 'Port to tunnel to:',
	    },
	  ]).then((ans)=>{
		const out = require('./relay.js')().serve(key, ans.port, false, ans.host);
	       fs.writeFileSync('.env',`
type=tun
key=${key}
port=${ans.port}
host=${ans.host}
`)
	       console.log('Set your µDNS address to: ');
               console.log('tun:'+b32.encode(out).replace('====','').toLowerCase());
               console.log('Or visit');
               console.log('https://'+b32.encode(out).replace('====','').toLowerCase()+'.entrypoint.ga');
	});
	},1000);

    }
    console.log(answers)
  });