const express = require('express');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let downloadProgress = '0%';

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/download', (req, res) => {
  const videoUrl = req.body.videoUrl;

  ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);

  const outputDir = './output/';
  const outputFilename = 'output.mp4';

  const proc = ffmpeg(videoUrl)
    .outputOptions('-c', 'copy')
    .output(outputDir + outputFilename)
    .on('progress', (progress) => {
      const percent = Math.floor(progress.percent);
      downloadProgress = `Download progress: ${percent}%`;
    })
    .on('end', () => {
      console.log('HLS stream downloaded successfully.');
      res.end();
    })
    .on('error', (err) => {
      console.error('Error downloading HLS stream:', err);
      res.sendStatus(500);
    });

  proc.run();
});

app.get('/progress', (req, res) => {
  res.send(downloadProgress);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
