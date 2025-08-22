import { useEffect, useRef } from "react";

import { usePlayerStore } from "@/stores/PlayerStore";

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevSongRef = useRef<string | null>(null);

  const { isPlaying, currentSong, playNext } = usePlayerStore();

  //Handle Play/Pause Logic
  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  //Handle When The Song Ends
  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => {
      playNext();
    }

    audio?.addEventListener("ended", handleEnded);

    return () => audio?.removeEventListener("ended", handleEnded);
  }, [playNext]);

  //Handle Song Changes
  useEffect(() => {
    if (!audioRef.current || !currentSong) {
      return;
    }

    const audio = audioRef.current;

    //Check if This is Actually a New Song
    const isNewSong = prevSongRef.current !== currentSong?.audioUrl;

    if (isNewSong) {
      audio.src = currentSong?.audioUrl;
      audio.currentTime = 0;
      prevSongRef.current = currentSong?.audioUrl;

      if (isPlaying) {
        audio.play();
      }
    }
  }, [currentSong, isPlaying])

  return <audio ref={audioRef} />;
};

export default AudioPlayer;
