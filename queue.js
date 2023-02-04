const EventEmitter = require("events");
const { update, ref } = require("firebase/database");
const { PassThrough } = require("stream");
const Throttle = require("throttle");
const { database } = require("./firebase");
const { readSong, generateRandomId } = require("./utils");
const { ytbDL } = require("./youtubeDl");
class Queue {
  constructor(id) {
    this._id = id;
    this._sinks = new Map(); // map of active sinks/writables
    this._songs = []; // list of queued up songs
    this._currentSong = null;
    this.stream = new EventEmitter();
  }
  init() {
    this._currentSong = {
      id: "NHE_0o6wXYE",
      title: "The Cassette - Ánh Đèn Phố (Official Lyric Video)",
      author: "The Cassette",
      thumbnail: "",
    };
  }
  makeResponseSink() {
    const id = generateRandomId();
    const responseSink = PassThrough();
    this._sinks.set(id, responseSink);
    return { id, responseSink };
  }
  removeResponseSink(id) {
    this._sinks.delete(id);
  }
  _broadcastToEverySink(chunk) {
    for (const [, sink] of this._sinks) {
      sink.write(chunk);
    }
  }
  _getBitRate(song) {
    try {
      const bitRate = ffprobeSync(Path.join(process.cwd(), song)).format
        .bit_rate;
      return parseInt(bitRate);
    } catch (err) {
      return 128000; // reasonable default
    }
  }
  /**
   * Call throttleTransformable to process a data
   * If songs left will get a new stream and format to mp3
   * If no song left will check if have a old stream will play it
   * and if no will get a new stream and format to mp3
   */
  _playLoop() {
    const throttleTransformable = new Throttle(128000 / 8);
    throttleTransformable.on("data", (chunk) => {
      this._broadcastToEverySink(chunk);
    });
    throttleTransformable.on("end", () => this._playLoop());
    if (this._songs.length) {
      //Check if  playlist not empty
      this._currentSong = this.removeFromQueue({ fromTop: true });
      ytbDL
        .downloadVideoAndStream(this._currentSong.id)
        .then((responseData) => {
          this.stream.emit("play", `${this._currentSong.id}.mp3`);
          this._updateDatabase();
          ytbDL.formatToMp3(responseData, throttleTransformable);
        })
        .catch((err) => {
          console.log(err)
        });
    } else {
      this._currentSong = this._currentSong;
      ytbDL
        .downloadVideoAndStream(this._currentSong.id)
        .then((responseData) => {
          this._updateDatabase();
          this.stream.emit("play", `${this._currentSong.id}.mp3`);
          ytbDL.formatToMp3(responseData, throttleTransformable);
        })
        .catch((err) => {
          console.log(err)
        });
    }
  }
  startStreaming() {
    this._playLoop();
  }
  _createAndAppendToSongs(song) {
    this._songs.push(song);
  }
  createAndAppendToQueue(song) {
    this._createAndAppendToSongs(song);
  }
  _removeFromSongs(index) {
    const adjustedIndex = index - 1;
    return this._songs.splice(adjustedIndex, 1);
  }
  removeFromQueue({ fromTop } = {}, indexCurrentSong = 1) {
    const index = fromTop ? 1 : indexCurrentSong;

    const [song] = this._removeFromSongs(index);
    return song;
  }
  // _changeOrderInSongs(boxChildrenIndex1, boxChildrenIndex2) {

  //     const songsArrayIndex1 = this._boxChildrenIndexToSongsIndex(boxChildrenIndex1);
  //     const songaArrayIndex2 = this._boxChildrenIndexToSongsIndex(boxChildrenIndex2);
  //     [
  //         this._songs[songsArrayIndex1], this._songs[songaArrayIndex2]
  //     ] = [
  //         this._songs[songaArrayIndex2], this._songs[songsArrayIndex1]
  //     ];
  // }
  // changeOrderQueue(key) {

  //     if (this.box.children.length === 1) {
  //         return;
  //     }
  //     const { index1, index2 } = this._changeOrderInBoxChildren(key);
  //     this._changeOrderInSongs(index1, index2);
  // }
  async _updateDatabase() {
    try {
      await update(ref(database, "rooms/" + this._id), {
        musicBox: {
          currentSong: this._currentSong,
          playlist: this._songs,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}
module.exports = Queue;
