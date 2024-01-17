const { configUrl } = require('../configService.js');
const HttpService = require('../http/HttpService.js');

const getInfoForGenerateKeys = async (token, certificateRequestId) => {
  HttpService.setToken(token);
  const res = await HttpService.get(
    configUrl +
      `/api/v1/own/certificate-request/${certificateRequestId}/key-generation-info`
  );
  return res;
};

const savingInfoAboutGeneratedKeys = async (
  token,
  certificateRequestId,
  csr,
  fingerprint
) => {
  HttpService.setToken(token);
  const body = {
    csr,
    fingerprint,
  };

  const res = await HttpService.post(
    configUrl +
      `/api/v1/own/certificate-request/${certificateRequestId}/generated-keys-info`,
    body
  );
  return res;
};

const getInfoForInstallCertificate = async (
  token,
  certificateRequestId,
  fingerprint,
  approvalCode
) => {
  HttpService.setToken(token);
  const body = {
    fingerprint,
    approvalCode,
  };
  const res = await HttpService.post(
    configUrl +
      `/api/v1/own/certificate-request/${certificateRequestId}/certificate-install-info`,
    body
  );
  return res;
};

const notifyCertificateInstallation = async (token, certificateRequestId) => {
  HttpService.setToken(token);
  const res = await HttpService.post(
    configUrl +
      `/api/v1/own/certificate-request/${certificateRequestId}/notify-certificate-installation`
  );
  return res;
};

module.exports = {
  getInfoForGenerateKeys,
  savingInfoAboutGeneratedKeys,
  getInfoForInstallCertificate,
  notifyCertificateInstallation,
};
