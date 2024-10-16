import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Audio from "./components/Audio";
import styles from "./components/Audio.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesome
import {
  faHeart,
  faMusic,
  faClock,
  faList,
  faDownload,
} from "@fortawesome/free-solid-svg-icons"; // Import relevant icons

const AudioPlayerList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [playlist, setPlaylist] = useState({ plTitle: "", songs: [] });
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();
  const { nonRegisterUserId, playlistId, playlistInfo } = location.state?.data;

  const token = JSON.parse(localStorage.getItem("tubeplay-token"));
  const unregUserId = JSON.parse(localStorage.getItem("nonRegisterUserId"));

  useEffect(() => {
    // Fetch the list of MP3 files from the backend
    const fetchFiles = async (url) => {
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        setPlaylist(data);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
      }
    };

    if (unregUserId && playlistInfo) {
      // User has not signed in -- create 1 playlist only
      setPlaylist(playlistInfo);
    } else if (unregUserId && !playlistId) {
      // Fetch folder /temp
      const url = `${process.env.REACT_APP_API_DOMAIN}/api/playlist/temp/${unregUserId}`;
      fetchFiles(url);
    } else {
      // User has signed in
      const url = `${process.env.REACT_APP_API_DOMAIN}/api/playlist/${playlistId}`;
      fetchFiles(url);
    }
  }, []);

  const handleLikeClick = (playlistId) => {
    const addlikesHandler = async (plId) => {
      const url = `${process.env.REACT_APP_API_DOMAIN}/api/playlist/like-playlist/${plId}`;
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          alert("You have to log in to add likes!");
          return;
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPlaylist(data.playlist);
      } catch (error) {
        setError(error.message);
      }
    };

    setIsLiked(true);
    addlikesHandler(playlistId);

    setTimeout(() => {
      setIsLiked(false);
    }, 500); // Reset after 0.5 seconds
  };
  const hanldeDownload = () => {
    console.log(playlist);
  };

  function formatDuration(durationStr) {
    const [hours, minutes] = durationStr.split(":").map(Number);

    let formattedDuration = "";
    if (hours > 0) {
      formattedDuration += `${hours} hour${hours > 1 ? "s" : ""} `;
    }
    if (minutes > 0) {
      formattedDuration += `${minutes} min${minutes > 1 ? "s" : ""} `;
    }

    return formattedDuration.trim(); // Trim to remove any trailing spaces
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div className="text-center text-white bg-dark pt-4">
      <div className="container-fluid text-white bg-dark">
        <div className="container px-0 pb-4 pt-2">
          {playlist.songs?.length === 0 && isLoading ? (
            <p>No audio files found</p>
          ) : (
            <div>
              <div className="container-fluid d-flex justify-content-center p-0">
                <div
                  className={styles.header}
                  style={{
                    backgroundImage: `url(${playlist.songs[0].thumbnail.url})`,
                  }}
                >
                  <h1 className={styles.plTitle}>{playlist.plTitle}</h1>
                </div>
              </div>
              <div className="container-fluid d-flex justify-content-center p-0">
                <div
                  className="col-4 d-flex flex-column text-success"
                  style={{ width: "35%" }}
                >
                  <div className="d-flex align-items-center mb-3">
                    <FontAwesomeIcon
                      icon={faList}
                      className="me-2"
                      style={{
                        fontSize: "2em",
                      }}
                    />
                    <span>{playlist.plSongNum} tracks</span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="me-2"
                      style={{
                        fontSize: "2em",
                      }}
                    />
                    <span>About {formatDuration(playlist.totalDuration)}</span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FontAwesomeIcon
                      icon={faHeart}
                      className="me-2"
                      style={{
                        fontSize: "2em",
                      }}
                    />
                    <span>{playlist.likes ? playlist.likes : 123} hearts</span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="me-2"
                      onClick={hanldeDownload}
                      style={{
                        cursor: "pointer",
                        fontSize: "2em",
                      }}
                    />
                    <span>Dowload this playlist</span>
                  </div>
                </div>
                <div className="col-8" style={{ width: "65%" }}>
                  <Audio playlist={playlist} onAddLike={handleLikeClick} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerList;
