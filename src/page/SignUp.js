/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { SERVER_URL } from

function SignUp() {
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [response, setResponse] = useState({ isExisted: null });

  const navigate = useNavigate();

  const postSignup = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_API_DOMAIN}/api/auth/signup`,
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

    if (res.status === 201) {
      alert("Register successful. Please log in!");
      navigate("/login");
    } else if (res.status === 409) {
      setResponse(data);
    } else if (!res.ok) {
      console.log(res);
      // throw new Error(data.message || "Could not register an account!");
    }
    return null;
  };

  const postSignupHandler = (e) => {
    e.preventDefault();
    if (enteredEmail && enteredPassword) {
      postSignup();
    } else {
      alert("Please enter all fields!");
    }
  };

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center text-white text-center bg-dark"
      style={{ minHeight: "100vh" }}
    >
      <h2 className="fw-bold mb-4">Sign Up</h2>
      <form className="" onSubmit={postSignupHandler}>
        <input
          required
          type="email"
          value={enteredEmail}
          placeholder="Enter email"
          style={{ minWidth: "20rem" }}
          className="form-control p-3 mb-3"
          onChange={(e) => setEnteredEmail(e.target.value)}
        />

        {response.isExisted && (
          <p className="fs-7 text-danger">Email is already registered!</p>
        )}

        <input
          required
          type="password"
          value={enteredPassword}
          placeholder="Enter password"
          style={{ minWidth: "20rem" }}
          className="form-control p-3 mb-3"
          onChange={(e) => setEnteredPassword(e.target.value)}
        />

        <button
          type="submit"
          className="btn btn-danger w-100 p-3"
          disabled={enteredEmail === "" || enteredPassword === ""}
        >
          Create an account
        </button>
      </form>
    </div>
  );
}

export default SignUp;
