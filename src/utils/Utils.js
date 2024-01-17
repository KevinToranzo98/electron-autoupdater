const os = require('os');
const checkCertificateValidity = (notBefore, notAfter) => {
  const currentDate = new Date();
  notBefore = new Date(notBefore);
  notAfter = new Date(notAfter);

  return currentDate >= notBefore && currentDate <= notAfter;
};

const parseCertificateSubject = (subjectString) => {
  const parsedSubject = {};

  if (subjectString) {
    const fields = subjectString.split(', ');
    for (const field of fields) {
      const [key, value] = field.split('=');
      parsedSubject[key] = value;
    }
  }

  return parsedSubject;
};

const getSO = () => {
  return os.platform();
};

module.exports = { parseCertificateSubject, checkCertificateValidity, getSO };
