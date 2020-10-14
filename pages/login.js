import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Link from "next/link";
import Router from "next/router";
import axios from "axios";
import { showSuccessMessage, showErrorMessage } from "../helpers/alerts";
import { API } from "../config";
import { authenticate, isAuth } from "../helpers/auth";

const Login = () => {
  const [state, setState] = useState({
    email: "",
    password: "",
    error: "",
    success: "",
    buttonText: "Login"
  });

  // Runs when component mounts and unmounts.
  //
  // Running isAuth from /helpers/auth to see if
  // user is already logged in, and if they are,
  // direct them to the homepage. This means if they
  // try to manually navigate to the /login, they
  // are automatically redirected to home.
  useEffect(() => {
    isAuth() && Router.push("/");
  }, []);

  // Destructuring off of the state, so that we don't have to
  // type 'state.' over and over again.
  const { email, password, error, success, buttonText } = state;

  // Returns a function.
  // Dynamically handling change so that we can reuse this function
  // for all text inputs.
  //
  // Spreading the rest of the current state, assigning the event value
  // to whichever part of state we're handling, clearing any potential
  // error/success message, and making sure the button text stays at
  // 'Login'
  const handleChange = name => e => {
    setState({
      ...state,
      [name]: e.target.value,
      error: "",
      success: "",
      buttonText: "Login"
    });
  };

  // Makes post request to the back end
  const handleSubmit = async e => {
    e.preventDefault();

    // Set buttonText to registering until operation is completed
    setState({ ...state, buttonText: "Logging in" });

    try {
      // First argument is endpoint, second is the data you wish to send
      const response = await axios.post(`${API}/login`, {
        email,
        password
      });
      // console.log(response);

      // in /helpers/auth.js
      authenticate(response, () => {
        // redirect user after login
        //
        // original - should maybe route to /dashboard in boilerplate?
        // Router.push("/");
        //
        // The one that redirects based in role - will be removing for boilerplate.
        //
        // Logic is, if isAuth() is true, then use it and check the role.
        // If the role is 'admin' redirect to '/admin', but if the role is
        // not 'admin' it must be 'subscriber', so redirect to '/user'
        isAuth() && isAuth().role === "admin"
          ? Router.push("/admin")
          : Router.push("/user");
      });
    } catch (error) {
      console.log(error);
      setState({
        ...state,
        buttonText: "Login",
        error: error.response.data.error
      }); // axios way of showing error
    }
  };

  const loginForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          value={email}
          type="email"
          className="form-control"
          placeholder="Type your email"
          onChange={handleChange("email")}
          required
        />
      </div>
      <div className="form-group">
        <input
          value={password}
          type="password"
          className="form-control"
          placeholder="Type your password"
          onChange={handleChange("password")}
          required
        />
      </div>
      <div className="form-group">
        <button className="btn btn-outline-primary">{buttonText}</button>
      </div>
    </form>
  );

  return (
    <Layout>
      <div className="col-md-6 offset-md-3">
        <h1>Login</h1>
        <br />
        {success && showSuccessMessage(success)}
        {error && showErrorMessage(error)}
        {loginForm()}
        <Link href="/auth/password/forgot">
          <a className="text-danger float-right">Forgot Password</a>
        </Link>
      </div>
    </Layout>
  );
};

export default Login;
