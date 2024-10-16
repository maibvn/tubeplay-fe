import React, { useRef, useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faRandom,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Audio.module.css";
import heart from "../../assets/heart-effect.png";

const Audio = ({ playlist, onAddLike }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [isLoopMode, setIsLoopMode] = useState(false);
  const [shuffledPlaylist, setShuffledPlaylist] = useState(playlist.songs);
  const [isAnimated, setIsAnimated] = useState(false);

  const audioRefs = useRef([]);

  // const playAudio = (index) => {
  //   audioRefs.current.forEach((audio, idx) => {
  //     if (audio && idx !== index) {
  //       audio.pause();
  //       audio.currentTime = 0;
  //       setProgress((prev) => {
  //         const newProgress = [...prev];
  //         newProgress[idx] = 0;
  //         return newProgress;
  //       });
  //     }
  //   });

  //   const currentAudio = audioRefs.current[index];
  //   if (currentAudio) {
  //     if (currentAudio.paused) {
  //       console.log(currentAudio.paused);
  //       currentAudio
  //         .play()
  //         .then(() => {
  //           setIsPlaying(true);
  //           setCurrentTrackIndex(index);
  //         })
  //         .catch((error) => {
  //           currentAudio.pause();
  //           console.error("Audio play error: ", error);
  //         });
  //     } else {
  //       currentAudio.pause();
  //       setIsPlaying(false);
  //     }
  //   }
  // };
  const playAudio = (index) => {
    const currentAudio = audioRefs.current[index];

    if (currentAudio) {
      if (currentAudio.paused) {
        // Pause all other audios first, and then attempt to play the current one
        audioRefs.current.forEach((audio, idx) => {
          if (audio && idx !== index && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
            setProgress((prev) => {
              const newProgress = [...prev];
              newProgress[idx] = 0;
              return newProgress;
            });
          }
        });

        currentAudio
          .play()
          .then(() => {
            setIsPlaying(true);
            setCurrentTrackIndex(index);
          })
          .catch((error) => {
            console.error("Play request was interrupted:", error);
          });
      } else {
        currentAudio.pause();
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    const currentAudio = audioRefs.current[currentTrackIndex];
    const handleEnded = () => {
      const nextIndex = (currentTrackIndex + 1) % shuffledPlaylist.length;
      if (nextIndex !== 0 || isLoopMode) playAudio(nextIndex);
    };

    currentAudio?.addEventListener("ended", handleEnded);
    return () => currentAudio?.removeEventListener("ended", handleEnded);
  }, [currentTrackIndex, shuffledPlaylist, isLoopMode]);

  const handleTimeUpdate = (index, audio) => {
    setProgress((prev) => {
      const newProgress = [...prev];
      newProgress[index] = (audio.currentTime / audio.duration) * 100;
      return newProgress;
    });
  };

  const toggleShuffle = useCallback(() => {
    setIsPlaying(false);
    setProgress(Array(shuffledPlaylist.length).fill(0));
    setShuffledPlaylist((prev) =>
      isShuffleMode
        ? playlist.songs
        : [...playlist.songs].sort(() => Math.random() - 0.5)
    );
    setIsShuffleMode((prev) => !prev);
    setCurrentTrackIndex(0);
  }, [isShuffleMode, playlist.songs]);

  const handleLikeClick = (id) => {
    setIsAnimated(true);
    onAddLike(id);
    // Reset the animation after 0.5 seconds
    setTimeout(() => {
      setIsAnimated(false);
    }, 500);
  };

  return (
    <div>
      <div style={{ textAlign: "center", display: "flex" }}>
        <button
          onClick={() => playAudio(currentTrackIndex)}
          className={`${styles.controlButton} ${
            isPlaying ? styles.active : styles.inactive
          }`}
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        <button
          onClick={toggleShuffle}
          className={`${styles.controlButton} ${
            isShuffleMode ? styles.active : styles.inactive
          }`}
        >
          <FontAwesomeIcon icon={faRandom} />
        </button>
        <button
          onClick={() => setIsLoopMode((prev) => !prev)}
          className={`${styles.controlButton} ${
            isLoopMode ? styles.active : styles.inactive
          }`}
        >
          <FontAwesomeIcon icon={faRedo} />
        </button>
        {/* HEART */}
        <div className={styles.heartContainer}>
          <div
            style={{ backgroundImage: `url(${heart})` }}
            className={`${styles.heartAnimation} ${
              isAnimated ? styles.animate : ""
            }`}
            onClick={() => handleLikeClick(playlist._id)}
          ></div>
        </div>
      </div>

      <ul className={styles.audioList}>
        {shuffledPlaylist.map((song, index) => (
          <li
            key={index}
            className={`${styles.listItem} ${
              index === currentTrackIndex ? styles.activeTrack : ""
            }`}
            onClick={() => playAudio(index)}
          >
            <div
              className={styles.progressBar}
              style={{
                width: `${progress[index]}%`,
                display: currentTrackIndex === index ? "block" : "none",
              }}
            />
            <div className={styles.songInfo}>
              <img
                src={song.thumbnail.url}
                style={{ width: "100px", zIndex: 2 }}
                alt={song.title}
              />
              <h5
                className={styles.songTitle}
                style={{
                  zIndex: 2,
                  color: index === currentTrackIndex && "white",
                }}
              >
                {song.title}
              </h5>
              <audio
                ref={(el) => (audioRefs.current[index] = el)}
                src={song.dropboxUrl}
                onTimeUpdate={() =>
                  handleTimeUpdate(index, audioRefs.current[index])
                }
                style={{ display: "none" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Audio;
