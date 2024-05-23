import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react';

function App() {
  const ffmpeg = useRef(new FFmpeg()).current

  const [video, setVideo] = useState<string>()

  const [audio, setAudio] = useState<string>()

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

    ffmpeg.on("log", ({ message }) => {
      console.log(message)
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    });
  }

  const convertWav2Mp3 = async (download: boolean = false) => {
    const audioURL = "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/audio-15s.wav";
    await ffmpeg.writeFile('audio.wav', await fetchFile(audioURL));
    await ffmpeg.exec(['-i', 'audio.wav', 'audio.mp3']);
    const fileData = await ffmpeg.readFile('audio.mp3');
    const data = new Uint8Array(fileData as ArrayBuffer);
    download && downLoad(data, 'mp3')
    setAudio(URL.createObjectURL(new Blob([data], { type: 'audio/mp3' })));
  }

  const downLoad = async (data: BlobPart, fileType: string) => {
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(new Blob([data], { type: `media/${fileType}` }));
    anchor.download = `media.${fileType}`;
    anchor.click();
  }

  const convertAvi2Mp4 = async () => {
    const videoURL = "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi";
    await ffmpeg.writeFile('video.avi', await fetchFile(videoURL));
    await ffmpeg.exec(['-i', 'video.avi', 'video.mp4']);
    const fileData = await ffmpeg.readFile('video.mp4');
    const data = new Uint8Array(fileData as ArrayBuffer);
    setVideo(URL.createObjectURL(new Blob([data], { type: 'video/mp4' })));
  }

  const start = async () => {
    try {
      await load();
      await Promise.all([
        convertWav2Mp3(),
        convertAvi2Mp4(),
      ])
    } catch (error) {
      console.log(error);
    }

  }

  useEffect(() => {
    start();

    return () => {
      ffmpeg.off("log", () => { }); // 取消日志事件监听
    };
  }, []);

  return (
    <div>
      <video src={video} controls></video>
      <audio src={audio} controls></audio>
    </div>
  )
}

export default App;
