const os = require('os');
const si = require('systeminformation');

// Obtengo un número único de cada computadora
const getUniqueId = async () => {
  const data = await si.baseboard();
  if (data.serial) return data.serial;

  const networkInterfaces = os.networkInterfaces();

  for (const interfaceName of Object.keys(networkInterfaces)) {
    const interfaces = networkInterfaces[interfaceName];

    for (const iface of interfaces) {
      // Filtrar direcciones MAC no nulas y diferentes de '00:00:00:00:00:00'
      if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
        const macAddress = iface.mac.replace(/:/g, ''); // Eliminar los dos puntos
        return macAddress;
      }
    }
  }

  const dataDisk = await si.diskLayout();
  return dataDisk[0].serialNum;
};

module.exports = { getUniqueId };
