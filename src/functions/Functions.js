const {
  checkCertificateValidity,
  parseCertificateSubject,
  getSO,
} = require('../utils/Utils');
const { getLibPath } = require('../utils/GetLibCryptoID');
const pkcs11js = require('pkcs11js');
const { Crypto } = require('node-webcrypto-p11');
const x509 = require('../assets/libs/@peculiar/x509');
const { MechanismEnum } = require('graphene-pk11');
const graphene = require('graphene-pk11');
const forge = require('node-forge');

const getDataAndPem = async (pin = '12345678') => {
  let session;
  let result = [];
  try {
    const Module = graphene.Module;
    const library = getLibPath();
    const mod = Module.load(library, 'CryptoID');
    mod.initialize();
    const slot = mod.getSlots(0);
    session = slot.open();
    session.login(pin);

    const certHandles = session.find({
      class: graphene.ObjectClass.CERTIFICATE,
    });

    const arrayOfCertsWithPem = [];
    for (let i = 0; i < certHandles.length; i++) {
      const certificate = certHandles.items(i).toType();
      const certificateBuffer = certificate.getAttribute({
        value: null,
      }).value;

      const pemCertificate = `-----BEGIN CERTIFICATE-----\n${certificateBuffer.toString(
        'base64'
      )}\n-----END CERTIFICATE-----`;

      arrayOfCertsWithPem.push({
        label: certificate.label,
        pem: pemCertificate,
      });
    }
    result = arrayOfCertsWithPem;
  } catch (_) {
    // console.error('Error al obtener los datos y PEM de los certificados:', error);
  }
  session?.logout();
  session?.close();
  return result;
};
const getTokenError = (pin = '12345678') => {
  let error;
  const pkcs11 = new pkcs11js.PKCS11();
  pkcs11.load(getLibPath());
  try {
    pkcs11.C_Initialize({ flags: pkcs11js.CKR_TOKEN_NOT_PRESENT });
    const slots = pkcs11.C_GetSlotList(true);
    if (!slots.length) throw new Error('NO_TOKEN');
    const slot = slots[0];
    const session = pkcs11.C_OpenSession(
      slot,
      pkcs11js.CKF_RW_SESSION | pkcs11js.CKF_SERIAL_SESSION
    );
    pkcs11.C_Login(session, 1, pin);
    pkcs11.C_Logout(session);
    pkcs11.C_CloseSession(session);
  } catch (e) {
    if (e.message === 'NO_TOKEN') {
      error = { message: 'No se detectó ningún token conectado.', status: 404 };
    } else if (e.method === 'C_Login') {
      error = { message: 'El PIN del token es inválido.', status: 403 };
    } else {
      error = {
        message: 'Hubo un error al obtener acceso al token.',
        status: 400,
      };
    }
  }
  pkcs11.C_Finalize();
  return error;
};
const getCertFromSession = (session, pkeyId) => {
  let certs = session.find({
    class: graphene.ObjectClass.CERTIFICATE,
  }).innerItems;

  for (let i = 0; i < certs.length; i++) {
    let cert = session.getObject(certs[i]);
    if (pkeyId == cert.id.toString('hex')) {
      let decoded = forge.asn1.fromDer(cert.value.toString('binary'));
      let c = forge.pki.certificateFromAsn1(decoded);

      return c;
    }
  }
  // @todo throw
};
const deletePairKeys = () => {
  const pkcs11 = new pkcs11js.PKCS11();
  const library = getLibPath();
  pkcs11.load(library);
  pkcs11.C_Initialize();
  const slots = pkcs11.C_GetSlotList(true);
  const slot = slots[0];
  const session = pkcs11.C_OpenSession(
    slot,
    pkcs11js.CKF_RW_SESSION | pkcs11js.CKF_SERIAL_SESSION
  );
  pkcs11.C_Login(session, 1, '12345678');

  const tempPub = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_PUBLIC_KEY },
    { type: pkcs11js.CKA_TOKEN, value: true },
  ];
  const tempPriv = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_PRIVATE_KEY },
    { type: pkcs11js.CKA_TOKEN, value: true },
  ];

  const _pkcs11FindObjects = (pkcs11, pkcs11Session, pkcs11Template) => {
    pkcs11.C_FindObjectsInit(pkcs11Session, pkcs11Template);
    let objs = [];
    let obj = pkcs11.C_FindObjects(pkcs11Session);
    while (obj) {
      objs.push(obj);
      obj = pkcs11.C_FindObjects(pkcs11Session);
    }
    pkcs11.C_FindObjectsFinal(pkcs11Session);
    return objs;
  };

  const pubKeysHandle = _pkcs11FindObjects(pkcs11, session, tempPub);
  const privKeysHandle = _pkcs11FindObjects(pkcs11, session, tempPriv);

  // Eliminar certificado
  const tempCert = [
    { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_CERTIFICATE },
    { type: pkcs11js.CKA_TOKEN, value: true },
  ];
  const cert = _pkcs11FindObjects(pkcs11, session, tempCert);
  pkcs11.C_DestroyObject(session, cert[0]);

  pkcs11.C_DestroyObject(session, pubKeysHandle[0]);
  pkcs11.C_DestroyObject(session, privKeysHandle[0]);

  // if (pubKeysHandle.length > 0 || privKeysHandle.length > 0) {
  //   for (let i = 0; i < pubKeysHandle.length; i) {
  //     pkcs11.C_DestroyObject(session, pubKeysHandle[i]);
  //     pkcs11.C_DestroyObject(session, privKeysHandle[i]);
  //   }
  // }

  pkcs11.C_Logout(session);
  pkcs11.C_CloseSession(session);
};
const verifyVersion = (pin = '12345678') => {
  let res;
  const os = getSO();
  const library = getLibPath();
  const pkcs11 = new pkcs11js.PKCS11();

  try {
    pkcs11.load(library);
    pkcs11.C_Initialize({ flags: pkcs11js.CKR_TOKEN_NOT_PRESENT });
    const slots = pkcs11.C_GetSlotList(true);
    const slot = slots[0];
    if (!slot) throw new Error('NO_TOKEN');

    // si no es windows debe iniciar sesión
    if (os !== 'win32') {
      startSession(pkcs11, slot, pin);
    }
    res = {
      data: { name: library, info: 'SunPKCS11-cryptoide', version: '1.5.0' },
      status: 200,
    };
  } catch (e) {
    if (e.message === 'NO_TOKEN') {
      res = {
        message: 'No hay dispositivo token conectado.',
        status: 404,
      };
    } else {
      res = {
        message: 'El PIN del token es inválido.',
        status: 403,
      };
    }
  }
  pkcs11.C_Finalize();
  return res;
};
const startSession = (pkcs11, slot, pin) => {
  const session = pkcs11.C_OpenSession(
    slot,
    pkcs11js.CKF_RW_SESSION | pkcs11js.CKF_SERIAL_SESSION
  );

  if (!session) throw new Error();
  pkcs11.C_Login(session, 1, pin);
  pkcs11.C_Logout(session);
  pkcs11.C_CloseSession(session);
};
const generateCSRCrypto = async (infoCertificateRequest, pin = '12345678') => {
  const infoToken = getTokenError(pin);
  if (infoToken) return infoToken;
  try {
    const config = {
      library: getLibPath(),
      name: 'CryptoIDE_PKCS11',
      slot: 0,
      readWrite: true,
      pin,
    };
    const crypto = new Crypto(config);
    const alg = {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: infoCertificateRequest?.keyLength || 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
      token: true,
      sensitive: true,
      local: true,
    };
    const keys = await crypto.subtle.generateKey(
      alg,
      infoCertificateRequest?.exportable || false,
      ['sign', 'verify']
    );
    // Add keys to the token
    await crypto.keyStorage.setItem(keys.privateKey);
    await crypto.keyStorage.setItem(keys.publicKey);
    // Generate CSR
    const csrGenerated = await x509.Pkcs10CertificateRequestGenerator.create(
      {
        name: infoCertificateRequest?.subject,
        // name: 'CN=Franco Baigorria, serialNumber=12121212, C=Argentina, ST=Cordoba, L=Cordoba, O=Box Custodia y Gestión Digital S.A., OU=Box Custodia de Archivos S.A.,',
        keys,
        signingAlgorithm: alg,
        attributes: [new x509.ChallengePasswordAttribute(pin)],
      },
      crypto
    );
    return { csr: csrGenerated.toString('pem'), status: 200 };
  } catch (error) {
    return {
      error: {
        message: 'Ocurrió un error al generar el par de claves.',
      },
      status: 500,
    };
  }
};
const saveCertificate = async (pem, pin = '12345678') => {
  const tokenError = getTokenError(pin);
  const library = getLibPath();
  if (tokenError) return tokenError;
  try {
    const config = {
      library,
      name: 'CryptoIDE_PKCS11',
      slot: 0,
      readWrite: true,
      pin,
    };
    const crypto = new Crypto(config);
    const cert = await crypto.certStorage.importCert(
      'pem',
      pem,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      ['verify']
    );
    await crypto.certStorage.setItem(cert);
    return {
      message: 'El certificado fue instalado con éxito.',
      status: 200,
    };
  } catch (error) {
    return {
      error: {
        message: 'Ocurrió un error al guardar el certificado.',
      },
      status: 500,
    };
  }
};
const getDataCertificates = async (pin = '12345678') => {
  let crypto;
  const tokenError = getTokenError(pin);
  if (tokenError) return tokenError;
  try {
    const library = getLibPath();
    const arrayOfCertsWithPem = await getDataAndPem(pin);
    crypto = new Crypto({
      library,
      pin,
    });
    // Obtiene todos los certificados del token
    const certificates = await crypto.certStorage.keys();

    const dataCertificates = [];
    for (const certificateId of certificates) {
      const certificate = await crypto.certStorage.getItem(certificateId);
      const dataCertificateAux = {
        alias: certificate.label,
        commonName:
          parseCertificateSubject(certificate.subjectName).CN ||
          'No Common Name',
        digestAlgorithm: 'SHA1',
        issuer: parseCertificateSubject(certificate.issuerName).CN,
        notBefore: certificate.notBefore,
        notAfter: certificate.notAfter,
        serialNumber: certificate.serialNumber,
        signatureSize: certificate.publicKey.algorithm.modulusLength || 2048,
        type: certificate.type,
        valid: checkCertificateValidity(
          certificate.notBefore,
          certificate.notAfter
        ),
      };

      if (
        !(
          dataCertificateAux.commonName === 'AC-BOX CUSTODIA FIRMA DIGITAL' ||
          dataCertificateAux.commonName === 'AC Raíz'
        )
      ) {
        // Buscamos un objeto en el segundo array con la propiedad "label" igual a "alias" del primer array
        const foundedObj = arrayOfCertsWithPem.find(
          (dataCertAux) => dataCertAux.label === dataCertificateAux.alias
        );
        // Si encontramos una coincidencia, agregamos la propiedad "pem" al objeto del primer array
        if (foundedObj) dataCertificateAux.pem = foundedObj.pem;
        dataCertificates.push(dataCertificateAux);
      }
    }

    crypto.close();
    return { size: dataCertificates.length, dataCertificates, status: 200 };
  } catch (error) {
    // Cierra el módulo PKCS#11
    crypto?.close?.();
    return {
      message: `Ocurrió un error al obtener los datos del certificado.`,
      status: 500,
    };
  }
};

const signHash = async (alias, pin, hashes) => {
  let session;
  let response;
  let mod;
  try {
    await getDataAndPem(pin);
    const Module = graphene.Module;
    const library = getLibPath();
    mod = Module.load(library, 'CryptoID');
    mod.initialize();
    const slots = mod.getSlots(true);
    if (!slots.innerItems.length) throw new Error('NO_TOKEN');
    const slot = mod.getSlots(0);
    session = slot.open();
    session.login(pin || '12345678');

    const certificateLabel = alias;

    const certificasteHandle = session.find({
      class: graphene.ObjectClass.CERTIFICATE,
    });

    let certificateFound;
    for (let i = 0; i < certificasteHandle.length; i++) {
      const certificate = certificasteHandle.items(i).toType();
      if (certificate.label === certificateLabel) {
        certificateFound = certificate;
        break;
      }
    }

    if (!certificateFound) {
      response = {
        error: {
          message: `No se encontró un certificado con el alias ${alias}.`,
        },
        status: 422,
      };
    }

    const certificateId = certificateFound.getAttribute({ id: null }).id;
    const privateKey =
      session.find({
        class: graphene.ObjectClass.PRIVATE_KEY,
        value: certificateId,
      }).innerItems[0] ||
      session.find({
        class: graphene.ObjectClass.PRIVATE_KEY,
      }).innerItems[0];

    if (!privateKey) {
      response = {
        error: {
          message: `No se encontraron las claves del certificado con el alias ${alias}.`,
        },
        status: 422,
      };
    }

    let pkeyObject = session.getObject(privateKey);

    const hashArray = Array.isArray(hashes) ? hashes : [hashes];

    for (const hashObj of hashArray) {
      const hash = hashObj.hash;
      const hashBuffer = Buffer.from(hash, 'hex');

      let signer = {};
      signer.sign = (md, algo) => {
        const prefix = Buffer.from([
          0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65,
          0x03, 0x04, 0x02, 0x01, 0x05, 0x00, 0x04, 0x20,
        ]);
        const buf = Buffer.concat([
          prefix,
          Buffer.from(md.digest().toHex(), 'hex'),
        ]);
        const sign = session.createSign(
          MechanismEnum.SHA1_RSA_PKCS,
          pkeyObject
        );
        return sign.once(buf).toString('binary');
      };
      const certificate = getCertFromSession(
        session,
        pkeyObject.id.toString('hex')
      );

      const p7 = forge.pkcs7.createSignedData();
      p7.content = forge.util.createBuffer(hashBuffer);

      p7.addCertificate(certificate);
      p7.addSigner({
        key: signer,
        certificate,
        digestAlgorithm: forge.pki.oids.sha1,
        authenticatedAttributes: [
          {
            type: forge.pki.oids.contentType,
            value: forge.pki.oids.data,
          },
          {
            type: forge.pki.oids.messageDigest,
            value: hash,
          },
        ],
      });

      p7.sign();

      const p7Asn1 = forge.asn1.toDer(p7.toAsn1()).getBytes();
      const p7Hex = forge.util.bytesToHex(p7Asn1);
      const signedDocumentHash = p7Hex;

      // Actualiza la propiedad 'hash' con 'signature'
      hashObj.hash = signedDocumentHash;
    }

    response = hashes;
  } catch (error) {
    // 'C_Logout' && code = 257 -> Pin de token incorrecto
    if (error.code === 257) {
      response = {
        error: { message: 'El PIN del token es inválido.', status: 403 },
      };
      // 'C_Logout' && code = 50 -> No hay token conectado
    } else if (error.code === 50 || error.message === 'NO_TOKEN') {
      response = {
        error: {
          message: 'No se detectó ningún token conectado.',
          status: 400,
        },
      };
    } else {
      response = {
        error: {
          message: 'Ocurrió un error al firmar el hash.',
        },
        status: 500,
      };
    }
  }
  session && session.logout();
  session && session.close();
  mod && mod.finalize();
  return response;
};

module.exports = {
  deletePairKeys,
  verifyVersion,
  generateCSRCrypto,
  saveCertificate,
  getDataCertificates,
  signHash,
};
