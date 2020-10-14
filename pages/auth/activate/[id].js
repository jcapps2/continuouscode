// Auth folder acts just like login and register do,
// meaning that auth is a "page" that can be navigated to.
// So the "activate" folder inside of "auth" is equivalent
// to auth/activate and this dynamic js file is the dynamically
// generated id for /auth/activate/[id].
//
// [id] means it will be dynamic, kinda like using template literals
//
// Also, the [id] is able to be grabbed like grabbing a field
// off of an object.

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import axios from "axios";
import { showSuccessMessage, showErrorMessage } from "../../../helpers/alerts";
import { API } from "../../../config";
import { withRouter } from "next/router";
import Layout from "../../../components/Layout";

const ActivateAccount = ({ router }) => {
  const [state, setState] = useState({
    name: "",
    token: "",
    buttonText: "Activate Account",
    success: "",
    error: ""
  });

  const { name, token, buttonText, success, error } = state;

  // Similar to componentDidMount
  //
  // Runs when component mounts, and changing state causes a re-render
  // so this will run infinitely. Passing an array as a second parameter
  // causes it to only run once, or when the passed dependent value changes (router in this case).
  useEffect(() => {
    let token = router.query.id;

    // if there is a token, decode it and grab name off of it.
    // then set state with previous state, plus the updated name
    // and token values.
    if (token) {
      const { name } = jwt.decode(token);
      setState({ ...state, name, token });
    }
  }, [router]);

  const clickSubmit = async e => {
    e.preventDefault();

    // Changing button text while process is running
    setState({ ...state, buttonText: "Activating" });

    try {
      const response = await axios.post(`${API}/register/activate`, { token });
      // console.log('account activation response', response)

      // Once done, reset state, change button text, and add success message from the back end
      setState({
        ...state,
        name: "",
        token: "",
        buttonText: "Activated",
        success: response.data.message
      });
    } catch (error) {
      console.log(error);

      // If there is an error, reset button text and populate error field in state
      setState({
        ...state,
        buttonText: "Activate Account",
        error: error.response.data.error
      });
    }
  };

  return (
    <Layout>
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h1>Hi {name}, are you ready to activate your account?</h1>
          <br />
          {success && showSuccessMessage(success)}
          {error && showErrorMessage(error)}
          <button
            onClick={clickSubmit}
            className="btn btn-outline-primary btn-block"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default withRouter(ActivateAccount);
