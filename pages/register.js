import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Router from "next/router";
import axios from "axios";
import { showSuccessMessage, showErrorMessage } from "../helpers/alerts";
import { API } from "../config";
import { isAuth } from "../helpers/auth";

const Register = () => {
  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    error: "",
    success: "",
    buttonText: "Register",
    loadedCategories: [],
    categories: []
  });

  // Destructuring off of the state, so that we don't have to
  // type 'state.' over and over again.
  const {
    name,
    email,
    password,
    error,
    success,
    buttonText,
    loadedCategories,
    categories
  } = state;

  // Runs when component mounts and unmounts.
  //
  // Running isAuth from /helpers/auth to see if
  // user is already logged in, and if they are,
  // direct them to the homepage. This means if they
  // try to manually navigate to the /register, they
  // are automatically redirected to home.
  useEffect(() => {
    isAuth() && Router.push("/");
  }, []);

  // load categories when the component mounts
  //
  // run when there is a change to success (basically when a link is submitted)
  useEffect(() => {
    loadCategories();
  }, []);

  // loading in list of categories
  const loadCategories = async () => {
    const response = await axios.get(`${API}/categories`);
    setState({
      ...state,
      loadedCategories: response.data
    });
  };

  // add checked categories into state
  // and remove them if user unchecks them
  const handleToggle = category => () => {
    // if the category already exists in the state
    // then the index will be returned
    //
    // if it DOES NOT exist in the state, then -1
    // should be returned
    const clickedCategory = categories.indexOf(category);

    // spread out all current categories
    const all = [...categories];

    // if the checked category isn't in the state,
    // push it into the state
    if (clickedCategory === -1) {
      all.push(category);
    } else {
      // otherwise, the user must be trying to remove
      // the category they selected, so remove it from
      // the state
      all.splice(clickedCategory, 1);
    }

    // add/remove categories to/from state
    // and remove any success/error messages
    setState({
      ...state,
      categories: all,
      success: "",
      error: ""
    });
  };

  // show categories checkboxes
  //
  // categories are already in the state as loadedCategories
  const showCategories = () => {
    // check if we have loadedCategories
    // if we do, map through and return each one
    return (
      loadedCategories &&
      loadedCategories.map((category, index) => {
        return (
          <li className="list-unstyled" key={category._id}>
            <input
              type="checkbox"
              onChange={handleToggle(category._id)}
              className="mr-2"
            />
            <label className="form-check-label">{category.name}</label>
          </li>
        );
      })
    );
  };

  // Returns a function.
  // Dynamically handling change so that we can reuse this function
  // for all text inputs.
  //
  // Spreading the rest of the current state, assigning the event value
  // to whichever part of state we're handling, clearing any potential
  // error/success message, and making sure the button text stays at
  // 'Register.'
  const handleChange = name => e => {
    setState({
      ...state,
      [name]: e.target.value,
      error: "",
      success: "",
      buttonText: "Register"
    });
  };

  // Makes post request to the back end
  const handleSubmit = async e => {
    e.preventDefault();

    // Set buttonText to registering until operation is completed
    setState({ ...state, buttonText: "Registering" });

    try {
      // First argument is endpoint, second is the data you wish to send
      const response = await axios.post(`${API}/register`, {
        name,
        email,
        password,
        categories
      });

      console.log(response);
      setState({
        ...state,
        name: "",
        email: "",
        password: "",
        buttonText: "Submitted",
        success: response.data.message
      });
    } catch (error) {
      console.log(error);
      setState({
        ...state,
        buttonText: "Register",
        error: error.response.data.error
      }); // axios way of showing error
    }
  };

  const registerForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          value={name}
          type="text"
          className="form-control"
          placeholder="Type your name"
          onChange={handleChange("name")}
          required
        />
      </div>
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
        <label className="text-muted ml-4">Category</label>
        <ul
          style={{
            maxHeight: "100px",
            overflowY: "scroll"
          }}
        >
          {showCategories()}
        </ul>
      </div>
      <div className="form-group">
        <button className="btn btn-outline-primary">{buttonText}</button>
      </div>
    </form>
  );

  return (
    <Layout>
      <div className="col-md-6 offset-md-3">
        <h1>Register</h1>
        <br />
        {success && showSuccessMessage(success)}
        {error && showErrorMessage(error)}
        {registerForm()}
      </div>
    </Layout>
  );
};

export default Register;
