const Queue = require("./queue");
const { queues } = require("./queues");
const { ytbDL } = require("./youtubeDl");
// const queues = [];
const plugin = {
  name: "streamServer",
  register: async (server) => {
    server.route({
      method: "GET",
      path: "/",
      handler: (_, h) => h.file("index.html"),
    });
    server.route({
      method: "GET",
      path: "/{filename}",
      handler: {
        file: (req) => req.params.filename,
      },
    });
    server.route({
      method: "GET",
      path: "/awake",
      handler: (request, h) => {
        return h
          .response({ message: "Awake up successfully", statusCode: 200 })
          .code(200);
      },
    });
    server.route({
      method: "GET",
      path: "/stream/{id}/init",
      handler: (request, h) => {
        queues._addQueue(request.params.id);
        return h
          .response({ message: "Khoi tao thanh cong", statusCode: 200 })
          .code(200);
      },
    });
    server.route({
      method: "POST",
      path: "/stream/{id}/add",
      handler: (request, h) => {
        const queue = queues._findQueue(request.params.id);
        let err;
        if (queue) {
          const { id } = request.payload;
          ytbDL
            .getInfoFromId(id)
            .then((song) => {
              queue.createAndAppendToQueue(song);
            })
            .catch((error) => {
              err = error;
            });
          if (err) {
            return h.response(err).code(500);
          }
          return h
            .response({ message: "Them thanh cong", statusCode: 200 })
            .code(200);
        } else {
          return h
            .response({ message: "Khong tim thay stream", statusCode: 404 })
            .code(404);
        }
      },
    });

    server.route({
      method: "GET",
      path: "/stream/{id}/view",
      handler: (request, h) => {
        // if (queues.length === 0) {
        //   console.log("haha");
        //   const queue = new Queue(request.params.id);
        //   const { id, responseSink } = queue.makeResponseSink();
        //   request.app.sinkId = id;
        //   queues.push(queue);
        //   queue.init();
        //   queue.startStreaming();
        //   return h.response(responseSink).type("audio/mpeg");
        // } else {
        const queue = queues._findQueue(request.params.id);
        if (queue) {
          const { id, responseSink } = queue.makeResponseSink();
          request.app.sinkId = id;
          return h.response(responseSink).type("audio/mpeg");
        } else {
          return h
            .response({ message: "Khong tim thay stream", statusCode: 404 })
            .code(404);
        }
      },
      options: {
        ext: {
          onPreResponse: {
            method: (request, h) => {
              request.events.once("disconnect", () => {
                const queue = queues._findQueue(request.params.id);
                if (queue) {
                  queue.removeResponseSink(request.app.sinkId);
                }
              });
              return h.continue;
            },
          },
        },
      },
    });
  },
};

module.exports = plugin;
