// replacement for 'ip' module
// will switch back to 'ip' once  this issue
// https://github.com/indutny/node-ip/issues/136 is resolved
const os = require('os');
const getLocalIPAddress = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];

    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null; // No external IPv4 address found
};

module.exports = {address: getLocalIPAddress};
