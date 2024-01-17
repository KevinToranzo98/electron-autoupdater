const os = require('os');
const path = require('path');

// Función para cargar la librería de mToken CryptoID
const getLibPath = () => {
  const basePath = path.join(__dirname, '..', 'assets', 'libs', 'mToken');
  const platform = os.platform();
  let library = path.join(basePath, 'cryptoide_pkcs11_64.dll');
  if (platform === 'win32') {
    if (os.arch() === 'x64') {
      library = path.join(basePath, 'cryptoide_pkcs11_64.dll');
    } else {
      library = path.join(basePath, 'cryptoide_pkcs11_32.dll');
    }
  } else if (platform === 'linux') {
    library = path.join(basePath, 'cryptoide_pkcs11.so');
  } else {
    library = path.join(basePath, 'cryptoide_pkcs11.dylib');
  }
  return library;
};

module.exports = { getLibPath };
