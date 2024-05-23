import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react';

function App() {
  const ffmpeg = useRef(new FFmpeg()).current;

  const [loaded, setLoaded] = useState(false)

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

    ffmpeg.on("log", ({ message }) => {
      console.log(message)
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    })

    setLoaded(true)
  }
  const convert = async () => {
    try {
      await ffmpeg.writeFile('audio.amr', await fetchFile('./assets/audio.amr'))
      await ffmpeg.exec(['-i', 'audio.amr', 'audio.mp3'])
      await ffmpeg.readFile('input.mp3')
    } catch (error) {
      console.log(error)
    }
  }

  const start = async () => {
    await load()
    await convert()
  }

  useEffect(() => {
    start()
  }, [])

  return (
    <div>
      {String(loaded)}
    </div>
  )
}

export default App
