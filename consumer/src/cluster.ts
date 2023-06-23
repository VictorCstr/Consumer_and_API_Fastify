import cluster from "cluster";
import os from "os";
import http from "http";

const host = "localhost";
const port = 9090;

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end("Server running and receiving messages from the api");
};

if (cluster.isPrimary) {
  console.log(`Running on master ${process.pid}`);

  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();

    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
    });
  }
} else {
  console.log(`Worker ${process.pid} initialized`);

  const server = http.createServer(requestListener);
  server.listen(port, host);
}
