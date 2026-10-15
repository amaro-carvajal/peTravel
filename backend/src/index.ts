import app from "./app";
import config from "./utils/config";
import logger from "./utils/logger";

app.listen(Number(config.PORT), config.HOST, () => {
  logger.info(`Servidor escuchando en http://${config.HOST}:${config.PORT}`);
});
