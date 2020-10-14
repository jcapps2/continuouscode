import { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import axios from "axios";
import { API } from "../../../config";
import { showSuccessMessage, showErrorMessage } from "../../../helpers/alerts";
import { getCookie, isAuth } from "../../../helpers/auth";

// a page for users to submit links
const Create = ({ token }) => {
  // create state
  const [state, setState] = useState({
    title: "",
    url: "",
    categories: [],
    loadedCategories: [],
    success: "",
    error: "",
    type: "",
    medium: ""
  });

  // destructure off the state
  const {
    title,
    url,
    categories,
    loadedCategories,
    success,
    error,
    type,
    medium
  } = state;

  // load categories when the component mounts
  //
  // run when there is a change to success (basically when a link is submitted)
  useEffect(() => {
    loadCategories();
  }, [success]);

  // loading in list of categories
  const loadCategories = async () => {
    const response = await axios.get(`${API}/categories`);
    setState({
      ...state,
      loadedCategories: response.data
    });
  };

  const handleTitleChange = e => {
    setState({
      ...state,
      title: e.target.value,
      error: "",
      success: ""
    });
  };

  const handleURLChange = e => {
    setState({
      ...state,
      url: e.target.value,
      error: "",
      success: ""
    });
  };

  // post all link-related info to backend on submit
  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API}/link`,
        { title, url, categories, type, medium },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // empty everything but the success message.
      // and since the success message is updated, that will
      // trigger useEffect to run above and reload the categories
      setState({
        ...state,
        title: "",
        url: "",
        success: "Link has been created",
        error: "",
        loadedCategories: [],
        categories: [],
        type: "",
        medium: ""
      });
    } catch (error) {
      console.log("LINK SUBMISSION ERROR", error);
      setState({ ...state, error: error.response.data.error });
    }
  };

  const handleTypeClick = e => {
    setState({ ...state, type: e.target.value, success: "", error: "" });
  };

  // free or paid selection display
  const showTypes = () => {
    return (
      <React.Fragment>
        <div className="form-check pl-5">
          <label className="form-check-label">
            <input
              type="radio"
              onClick={handleTypeClick}
              checked={type === "free"}
              value="free"
              className="form-check-input"
              name="type"
            />
            {"  "}
            Free
          </label>
        </div>
        <div className="form-check pl-5">
          <label className="form-check-label">
            <input
              type="radio"
              onClick={handleTypeClick}
              checked={type === "paid"}
              value="paid"
              className="form-check-input"
              name="type"
            />
            {"  "}
            Paid
          </label>
        </div>
      </React.Fragment>
    );
  };

  const handleMediumClick = e => {
    setState({ ...state, medium: e.target.value, success: "", error: "" });
  };

  // selection for what form of medium the content is in
  const showMedium = () => {
    return (
      <React.Fragment>
        <div className="form-check pl-5">
          <label className="form-check-label">
            <input
              type="radio"
              onClick={handleMediumClick}
              checked={medium === "video"}
              value="video"
              className="form-check-input"
              name="medium"
            />
            {"  "}
            Video
          </label>
        </div>
        <div className="form-check pl-5">
          <label className="form-check-label">
            <input
              type="radio"
              onClick={handleMediumClick}
              checked={medium === "book"}
              value="book"
              className="form-check-input"
              name="medium"
            />
            {"  "}
            Book
          </label>
        </div>
        <div className="form-check pl-5">
          <label className="form-check-label">
            <input
              type="radio"
              onClick={handleMediumClick}
              checked={medium === "article"}
              value="article"
              className="form-check-input"
              name="medium"
            />
            {"  "}
            Article
          </label>
        </div>
      </React.Fragment>
    );
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
    setState({ ...state, categories: all, success: "", error: "" });
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

  // form to create/submit link
  const submitLinkForm = () => {
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="text-muted">Title</label>
          <input
            type="text"
            className="form-control"
            onChange={handleTitleChange}
            value={title}
          />
        </div>
        <div className="form-group">
          <label className="text-muted">URL</label>
          <input
            type="url"
            className="form-control"
            onChange={handleURLChange}
            value={url}
          />
        </div>
        <div>
          <button
            disabled={!token}
            className="btn btn-outline-primary"
            type="submit"
          >
            {isAuth() || token ? "Post" : "Login to Post"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <Layout>
      <div className="row">
        <div className="col-md-12">
          <h1>Submit Link</h1>
          <br />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
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
            <label className="text-muted ml-4">Type</label>
            {showTypes()}
          </div>
          <div className="form-group">
            <label className="text-muted ml-4">Medium</label>
            {showMedium()}
          </div>
        </div>
        <div className="col-md-8">
          {success && showSuccessMessage(success)}
          {error && showErrorMessage(error)}
          {submitLinkForm()}
        </div>
      </div>
    </Layout>
  );
};

// getting the cookie
Create.getInitialProps = ({ req }) => {
  const token = getCookie("token", req);
  return { token };
};

// could use withUser() here, but want unauthenticated users to see the
// page so they will be encouraged to make an account to finish the
// process of submitting a link
export default Create;
