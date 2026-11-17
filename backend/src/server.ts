import { createApp } from "./app.js";
import { config } from "./config/environment.js";

const app = createApp();

app.listen(config.PORT, () => {
  process.stdout.write(
    `[SERVER] Running in ${config.NODE_ENV} mode on port ${config.PORT}\n`
  );
});
