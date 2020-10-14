// auth/password/forgot
//
// page for resetting the user's password

import { useState } from "react";
import axios from "axios";
import { showSuccessMessage, showErrorMessage } from "../../../helpers/alerts";
import { API } from "../../../config";
import Layout from "../../../components/Layout";

const ForgotPassword = () => {
  const [state, setState] = useState({
    email: "",
    buttonText: "Forgot Password",
    success: "",
    error: ""
  });
  const { email, buttonText, success, error } = state;

  const handleChange = e => {
    setState({ ...state, email: e.target.value, success: "", error: "" });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // console.log("post email to ", email);

    // send email to the backend
    try {
      const response = await axios.put(`${API}/forgot-password`, { email });

      // if successful, update the state
      setState({
        ...state,
        email: "",
        buttonText: "Done",
        success: response.data.message
      });
    } catch (error) {
      console.log("FORGOT PASSWORD ERROR", error);

      // update state with error-related data
      setState({
        ...state,
        buttonText: "Forgot Password",
        error: error.response.data.error
      });
    }
  };

  const passwordForgotForm = () => {
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            className="form-control"
            onChange={handleChange}
            value={email}
            placeholder="Type in your email"
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
          <h1>Forgot Password</h1>
          <br />
          {success && showSuccessMessage(success)}
          {error && showErrorMessage(error)}
          {passwordForgotForm()}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
