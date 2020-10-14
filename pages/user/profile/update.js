// page for users to update their profile

import { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import Router from "next/router";
import axios from "axios";
import { showSuccessMessage, showErrorMessage } from "../../../helpers/alerts";
import { API } from "../../../config";
import { isAuth } from "../../../helpers/auth";
import withUser from "../../withUser";
import { updateUser } from "../../../helpers/auth";

const Profile = ({ user, token }) => {
  const [state, setState] = useState({
    name: user.name,
    email: user.email,
    password: "",
    error: "",
    success: "",
    buttonText: "Update",
    loadedCategories: [],
    categories: user.categories
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
              checked={categories.includes(category._id)}
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
      buttonText: "Update"
    });
  };

  // Makes post request to the back end
  const handleSubmit = async e => {
    e.preventDefault();

    // Set buttonText to registering until operation is completed
    setState({ ...state, buttonText: "Updating..." });

    try {
      // First argument is endpoint, second is the data you wish to send
      const response = await axios.put(
        `${API}/user`,
        {
          name,
          password,
          categories
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // update local storage to reflect what is in the db
      // after the user updates their profile
      updateUser(response.data, () => {
        // sets state, but also sends to local storage
        setState({
          ...state,
          buttonText: "Updated",
          success: "Profile has been updated"
        });
      });
    } catch (error) {
      console.log(error);
      setState({
        ...state,
        buttonText: "Update",
        error: error.response.data.error
      }); // axios way of showing error
    }
  };

  const updateForm = () => (
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
          disabled
        />
      </div>
      <div className="form-group">
        <input
          value={password}
          type="password"
          className="form-control"
          placeholder="Type your password"
          onChange={handleChange("password")}
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
        <h1>Update Profile</h1>
        <br />
        {success && showSuccessMessage(success)}
        {error && showErrorMessage(error)}
        {updateForm()}
      </div>
    </Layout>
  );
};

export default withUser(Profile);
