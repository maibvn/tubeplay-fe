import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
// import Layout from "./Layout";

function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [plUrl, setPlUrl] = useState(null);
  const navigate = useNavigate();

  const plRef = useRef();

  const searchPL = () => {
    const link = plRef.current.value;

    if (!link) return;
    setPlUrl(link);
    fetchPL(link);
  };
  const fetchPL = async (link) => {
    setIsLoading(true);
    const apiUrl = `${process.env.REACT_APP_API_DOMAIN}/api/playlist/generate/?plUrl=${link}`;
    const token = JSON.parse(localStorage.getItem("tubeplay-token"));

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      if (response.ok) {
        setIsLoading(false);
        const data = await response.json();

        const nonRegisterUserId = data.nonRegisterUserId;
        localStorage.setItem("nonRegisterUserId", nonRegisterUserId);

        navigate("/playlist", {
          state: { data: data },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div
        className="container-fluid text-center bg-dark"
        style={{ height: "100vh" }}
      >
        <div className="row justify-content-center ">
          <div>
            <input
              className="col-6 mt-4 p-2"
              ref={plRef}
              defaultValue={
                "https://youtube.com/playlist?list=PLe4G0yoIuLVWGkDFV9MuKq98GuZwncjnN"
              }
              placeholder="Playlist"
            ></input>
          </div>
          <button className="col-3 btn btn-danger mt-4 p-2" onClick={searchPL}>
            Get Playlist
          </button>
        </div>
        {isLoading && (
          <img
            style={{ width: "50px", height: "50px" }}
            src={process.env.REACT_APP_LOADING_GIF}
          ></img>
        )}
      </div>
    </>
  );
}

export default Home;
