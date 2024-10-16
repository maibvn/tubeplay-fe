/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function Login({ setIsLogin, setUser }) {
  const navigate = useNavigate();
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [response, setResponse] = useState({
    isAuthenticated: null,
  });

  const postLogin = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_API_DOMAIN}/api/auth/login`,
      {
        method: "POST",
        body: JSON.stringify({
          email: enteredEmail,
          password: enteredPassword,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    console.log(data);
    // Saving token for next signin in
    if (data.token) {
      localStorage.setItem("tubeplay-token", JSON.stringify(data.token));
      navigate("/");
      window.location.reload();
    }
    if (!res.ok) {
      throw new Error("Could not login!");
    }
    setResponse(data);
    return null;
  };

  const postLoginHandler = (e) => {
    e.preventDefault();
    if (enteredEmail && enteredPassword) {
      postLogin();
    } else {
      alert("Please enter all fields!");
    }
  };
  // Log in with Google
  const handleLoginSuccess = async (response) => {
    try {
      // Send the token to the backend for verification and authentication
      const res = await axios.post(
        `${process.env.REACT_APP_API_DOMAIN}/api/auth/google`,

        { token: response.credential },
        { withCredentials: true } // Include credentials for session
      );
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Error authenticating user:", err);
    }
  };

  const handleLoginFailure = (error) => {
    console.error("Login Failed:", error);
  };

  useEffect(() => {
    if (response.isAuthenticated) {
      setIsLogin(true);
      setUser(response.user);
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ isLogin: true, user: response.user })
      );
      navigate("/");
    } else {
      setEnteredPassword("");
    }
  }, [response]);

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center text-center text-white  bg-dark"
      style={{ minHeight: "100vh" }}
    >
      <h2 className="fw-bold mb-4">Log In</h2>
      <form className="" onSubmit={postLoginHandler}>
        <input
          required
          type="email"
          value={enteredEmail}
          placeholder="Enter email"
          style={{ minWidth: "20rem" }}
          className="form-control p-3 mb-3"
          onChange={(e) => setEnteredEmail(e.target.value)}
        />

        <input
          required
          type="password"
          value={enteredPassword}
          placeholder="Enter password"
          style={{ minWidth: "20rem" }}
          className="form-control p-3 mb-3"
          onChange={(e) => setEnteredPassword(e.target.value)}
        />

        {response.isAuthenticated === false && (
          <p className="fs-7 text-danger">Email or password is incorrect!</p>
        )}

        <button
          type="submit"
          className="btn btn-danger w-100 p-3"
          disabled={enteredEmail === "" || enteredPassword === ""}
        >
          Log in
        </button>
      </form>
      <br />
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <div>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onFailure={handleLoginFailure}
            cookiePolicy="single_host_origin"
          />
        </div>
      </GoogleOAuthProvider>
    </div>
  );
}

export default Login;
