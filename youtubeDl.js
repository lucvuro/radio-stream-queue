const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const { default: axios } = require("axios");
class youtubeDl {
  constructor() {}
  init() {}
  async downloadVideoAndStream(videoId) {
    try {
      const infos = await ytdl.getInfo(videoId);
      const audioFormat = ytdl.chooseFormat(infos.formats, {
        filter: "audioonly",
      });
      const audioResposne = await axios({
        method: "GET",
        url: audioFormat.url,
        responseType: "stream",
      })
      return audioResposne.data
      // streamFromQueue.emit("play", `${videoId}.mp3`);
      // await this.formatToMp3(audioResposne.data, throttleTransformable);
    } catch (err) {
      console.log(err);
      return null
    }
  }
  formatToMp3(stream, throttleTransformable) {
    return new Promise((resolve, reject) => {
      new ffmpeg({ source: stream })
        .setFfmpegPath(ffmpegPath)
        .toFormat("mp3")
        .on("end", () => {
          resolve();
        })
        .on("error", (err) => {
          reject(err);
        })
        .pipe(throttleTransformable);
    });
  }
  getInfoFromId (id) {
    return new Promise((resolve, reject) => {
      ytdl.getInfo(id)
        .then((videoData) => {
          const {videoId, thumbnails, title, author} = videoData.videoDetails
          const infoNeedForQueue = {
            id: videoId,
            title: title,
            author: author.name,
            thumbnail: thumbnails[0].url
          }
          resolve(infoNeedForQueue)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}
const ytbDL = new youtubeDl();
exports.ytbDL = ytbDL;
