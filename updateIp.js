const os = require('os');
const fs = require('fs');

let localIp = '10.0.2.2'; // default for android emulator
const nets = os.networkInterfaces();
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      if (net.address.startsWith('192.168.') || net.address.startsWith('10.')) {
        localIp = net.address;
      }
    }
  }
}

const file = 'd:/Tugas/Medium/mobile/src/api/axiosClient.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/http:\/\/(localhost|10\.0\.2\.2|[0-9\.]+):3001/g, `http://${localIp}:3001`);
fs.writeFileSync(file, code);
console.log('IP updated to:', localIp);
