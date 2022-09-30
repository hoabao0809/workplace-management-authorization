exports.options = {
  format: 'A4',
  orientation: 'portrait',
  border: '10mm',
  header: {
    height: '45mm',
  },
  footer: {
    height: '28mm',
  },
  childProcessOptions: { env: { OPENSSL_CONF: '/dev/null' } },
};
