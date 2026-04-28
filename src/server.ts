import config from "./app/config";
import { Server } from "http";
import app from "./app";
import { seedSuperAdmin } from "./app/seed/seedSuperAdmin";

async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log("Server running on port ", config.port);
  });

  seedSuperAdmin();

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log("Server closed");
      });
    }
    process.exit(1);
  };

  const unexpectedErrorHandler = (error: unknown) => {
    console.error(error);
    exitHandler();
  };

  process.on("uncaughtException", unexpectedErrorHandler);
  process.on("unhandledRejection", unexpectedErrorHandler);
}

main();
