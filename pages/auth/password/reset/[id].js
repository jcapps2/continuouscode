// uses a dynamic id in route
//
// dynamically generated page, that user will
// be directed to once they click on the password
// reset link that they receive via email

import { useState, useEffect } from "react";
import axios from "axios";
import {
  showSuccessMessage,
  showErrorMessage
} from "../../../../helpers/alerts";
import { API } from "../../../../config";
import Router, { withRouter } from "next/router";
import jwt from "jsonwebtoken";
import Layout from "../../../../components/Layout";

// router prop is availble because of withRouter, which
// is how we will grab the id (token) out of the url
const ResetPassword = ({ router }) => {
  const [state, setState] = useState({
    name: "",
    token: "",
    newPassword: "",
    buttonText: "Reset Password",
    success: "",
    error: ""
  });

  const { name, token, newPassword, buttonText, success, error } = state;

  // as soon as the page loads, we want to grab the
  // route parameter (the id in the url), decode it
  // and populate the state
  //
  // data may not be available when the component
  // first mounts, so passing [router] as a second
  // argument to run useEffect again if there are
  // any changes involving router
  useEffect(() => {
    // it is 'id' because we named it [id].js
    // if we would have named it [token], it
    // would be router.query.token
    const decoded = jwt.decode(router.query.id);

    // if we have a decoded jwt, then populate
    // the state with the user's name and the token
    if (decoded) {
      setState({ ...state, name: decoded.name, token: router.query.id });
    }
  }, [router]);

  const handleChange = e => {
    // sets newPassword in state and empties out any success or error messages
    setState({ ...state, newPassword: e.target.value, success: "", error: "" });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // console.log("post email to ", email);

    // briefly update buttonText while action is being performed
    // to let the user know that something is happening
    setState({ ...state, buttonText: "Sending" });

    // send email to the backend
    try {
      // server is expecting resetPasswordLink, so that's why we're using it here
      const response = await axios.put(`${API}/reset-password`, {
        resetPasswordLink: token,
        newPassword
      });

      // if successful, update the state
      setState({
        ...state,
        newPassword: "",
        buttonText: "Done",
        success: response.data.message
      });
    } catch (error) {
      console.log("RESET PASSWORD ERROR", error);

      // update state with error-related data
      setState({
        ...state,
        buttonText: "Reset Password",
        error: error.response.data.error
      });
    }
  };

  const passwordResetForm = () => {
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="password"
            className="form-control"
            onChange={handleChange}
            value={newPassword}
            placeholder="Type in new password"
            required
          />
        </div>
        <div>
          <button className="btn btn-outline-primary">{buttonText}</button>
        </div>
      </form>
    );
  };

  return (
    <Layout>
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h1>Hi {name}, let's reset your password</h1>
          <br />
          {success && showSuccessMessage(success)}
          {error && showErrorMessage(error)}
          {passwordResetForm()}
        </div>
      </div>
    </Layout>
  );
};

export default withRouter(ResetPassword);
