import React from "react";
import AudioPlayerList from "./page/AudioPlayerList";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
import axios from "axios";
import Login from "./page/Login";
import SignUp from "./page/SignUp";
import Home from "./page/Home";
import NavBar from "./page/NavBar";

function App() {
  // set state of login
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState({});
  // const [validToken, setValidToken] = useState(false);
  // const location = useLocation();
  const token = JSON.parse(localStorage.getItem("tubeplay-token"));

  // const navigationType = useNavigationType();
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_DOMAIN}/api/auth/checkauth`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true, // Properly include this within the options object
          }
        );
        if (res.data.mode === "token") {
          const userEmail = res.data.email;
          setUser({ email: userEmail });
          setIsLogin(true);
        } else if (res.data.mode === "session") {
          setUser(res.data.user);
          setIsLogin(true);
        }
      } catch (err) {
        // If the response error has a status, handle it accordingly
        if (err.response && err.response.status === 401) {
          console.error(
            "Unauthorized: User not authenticated. Please try again!"
          );
          // localStorage.removeItem("tubeplay-token");
        } else {
          console.error("Error verifying token:", err);
        }
      }
    };

    if (userInfo) {
      setIsLogin(userInfo.isLogin);
      setUser(userInfo.user);
    } else {
      fetchUser();
    }

    // Check session for google acc auto login
    // const checkAuth = async () => {
    //   try {
    //     const res = await axios.get(
    //       `${process.env.REACT_APP_API_DOMAIN}/api/auth/checkauth`,
    //       {
    //         headers: { Authorization: `Bearer ${token}` },
    //         withCredentials: true, // Properly include this within the options object
    //       }
    //     );

    //     if (res.data.user) {
    //       setUser(res.data.user);
    //       setIsLogin(true);
    //     }
    //   } catch (error) {
    //     console.error("Session check error:", error);
    //   }
    // };

    // checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <NavBar
        isLogin={isLogin}
        setIsLogin={(value) => setIsLogin(value)}
        user={user}
        setUser={(value) => setUser(value)}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/login"
          element={
            <Login
              setIsLogin={(value) => setIsLogin(value)}
              setUser={(value) => setUser(value)}
            />
          }
        />
        <Route path="/playlist" element={<AudioPlayerList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
