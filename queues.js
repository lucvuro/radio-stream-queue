const Queue = require("./queue");

class Queues {
  constructor() {
    this._queues = [];
  }
  init() {}
  _addQueue(idRoom){
    const queue = new Queue(idRoom)
    queue.init()
    queue.startStreaming()
    this._queues.push(queue)
  }
  _findQueue(idRoom){
    let queueResult;
    this._queues.forEach((queue) => {
        if (queue._id === idRoom){
            queueResult = queue
        }
    })
    return queueResult
  }
}

const queues = new Queues()
exports.queues = queues
