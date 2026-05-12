const app = require('./app');
const logger = require('./logger');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => logger.info('server started', { port: PORT }));

['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, () => {
    logger.info('shutdown', { signal: sig });
    server.close(() => process.exit(0));
  });
});
