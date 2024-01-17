const cors = require('cors');
const express = require('express');
const { getUniqueId } = require('../utils/GetUniqueId');
const {
  verifyVersion,
  signHash,
  getDataCertificates,
  generateCSRCrypto,
  saveCertificate,
} = require('../functions/Functions');
const certificateRequestService = require('./certificateRequest/certificateRequestService');

const app35114 = express();
const app35115 = express();
const app35116 = express();
const port35114 = 35114;
const port35115 = 35115;
const port35116 = 35116;
app35114.use(express.json());
app35115.use(express.json());
app35116.use(express.json());
app35114.use(cors());
app35115.use(cors());
app35116.use(cors());

app35114.post('/', async (req, res) => {
  const { token, certificateRequestId, pin } = req.body;
  if (!token || !certificateRequestId || !pin) {
    return res.status(422).json({
      message:
        'El token, el ID de solicitud de certificado y el pin del token son requeridos.',
    });
  }

  try {
    const infoForGenerateKeys =
      await certificateRequestService.getInfoForGenerateKeys(
        token,
        certificateRequestId
      );

    if (infoForGenerateKeys.status !== 200) {
      return res.status(infoForGenerateKeys.status).json({
        message:
          infoForGenerateKeys?.error?.message ||
          'Hubo un error al obtener la información para generar las claves.',
      });
    }

    const fingerprint = await getUniqueId();
    const csr = await generateCSRCrypto(infoForGenerateKeys.data, pin);

    if (csr.status !== 200) {
      return res.status(csr.status).json({
        message:
          csr?.error?.message ||
          csr?.message ||
          'Ocurrió un error al generar las claves.',
      });
    }

    const savingPairKeys =
      await certificateRequestService.savingInfoAboutGeneratedKeys(
        token,
        certificateRequestId,
        csr.csr,
        fingerprint
      );

    if (savingPairKeys.status !== 200) {
      return res
        .status(savingPairKeys.status)
        .json({ message: 'Hubo un error al guardar el par de claves.' });
    }

    res.status(200).json({ message: 'El par de claves se guardó con éxito.' });
  } catch (error) {
    return res.status(error?.response?.status || 500).json({
      message:
        error?.response?.data?.message || 'Hubo un error en el servidor.',
    });
  }
});

app35114.listen(port35114, () => {
  console.log(`Servidor escuchando en el puerto ${port35114}`);
});

app35115.post('/', async (req, res) => {
  const { token, certificateRequestId, pin, approvalCode } = req.body;

  if (!token || !certificateRequestId || !approvalCode || !pin) {
    return res.status(422).json({
      message:
        'El token, el ID de solicitud de certificado, el código de aprobación y el pin del token son requeridos.',
    });
  }

  try {
    const fingerprint = await getUniqueId();
    const certificateBase64 =
      await certificateRequestService.getInfoForInstallCertificate(
        token,
        certificateRequestId,
        fingerprint,
        approvalCode
      );

    const certBase64 = certificateBase64?.data?.base64Pem;

    if (certificateBase64?.status === 200) {
      const installCert = await saveCertificate(certBase64, pin);

      if (installCert.status === 200) {
        const notifyInstallCert =
          await certificateRequestService.notifyCertificateInstallation(
            token,
            certificateRequestId
          );

        if (notifyInstallCert.status === 200) {
          return res.status(notifyInstallCert?.status || 200).json({
            message:
              notifyInstallCert?.message ||
              'El certificado se instaló con éxito.',
          });
        } else {
          return res.status(notifyInstallCert?.status).json({
            message:
              notifyInstallCert?.error?.message ||
              'Hubo un error al intentar instalar el certificado.',
          });
        }
      } else {
        return res.status(installCert?.status || 500).json({
          message:
            installCert?.message || 'Hubo un error al instalar el certificado.',
        });
      }
    } else {
      return res.status(certificateBase64?.status).json({
        message:
          certificateBase64?.error?.message ||
          'Hubo un error al intentar obtener la información necesaria para instalar el certificado.',
      });
    }
  } catch (error) {
    return res.status(error?.response?.status || 500).json({
      message:
        error?.response?.data?.message || 'Hubo un error en el servidor.',
    });
  }
});

app35115.listen(port35115, () => {
  console.log(`Servidor escuchando en el puerto ${port35115}`);
});

app35116.get('/verify-version/pin=:pin', async (req, res) => {
  const pin = req.params.pin;
  const data = verifyVersion(pin);
  return res.status(data?.status || 200).json(data);
});

app35116.post('/sign-hash', async (req, res) => {
  const { alias, pin, hash } = req.body;
  const signature = await signHash(alias, pin, hash);
  return res.status(signature?.status || 201).json({
    signature,
  });
});

app35116.get('/certificates/pin=:pin', async (req, res) => {
  const pin = req.params.pin;
  const data = await getDataCertificates(pin);
  return res.status(data?.status || 200).json(data);
});

app35116.listen(port35116, () => {
  console.log(`Servidor escuchando en el puerto ${port35116}`);
});

function stopServers() {
  app35114.close();
  app35115.close();
  app35116.close();
}

module.exports = { stopServers };
