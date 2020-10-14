// protected route only for admin

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import axios from "axios";
import Resizer from "react-image-file-resizer";
// needs to be a dynamic import
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import { API } from "../../../config";
import { showSuccessMessage, showErrorMessage } from "../../../helpers/alerts";
import Layout from "../../../components/Layout";
import withAdmin from "../../withAdmin";
import "react-quill/dist/quill.bubble.css";

const Update = ({ oldCategory, token }) => {
  // FormData() is a browser API so
  // process.browser si checking to see if we are in the browser
  const [state, setState] = useState({
    name: oldCategory.name,
    error: "",
    success: "",
    buttonText: "Update",
    imagePreview: oldCategory.image.url,
    image: ""
  });

  const [content, setContent] = useState(oldCategory.content);

  const [imageUploadButtonName, setImageUploadButtonName] = useState(
    "Update image"
  );

  const { name, image, success, error, buttonText, imagePreview } = state;

  // dynamically updates whatever we pass to it (except
  // the image, which we handle in handleImage)
  const handleChange = name => e => {
    setState({
      ...state,
      [name]: e.target.value,
      error: "",
      success: ""
    });
  };

  const handleContent = e => {
    setContent(e);
    setState({ ...state, success: "", error: "" });
  };

  const handleImage = event => {
    let fileInput = false;
    if (event.target.files[0]) {
      fileInput = true;
    }

    // changing button text when image is added
    setImageUploadButtonName(event.target.files[0].name);

    // if an image has been uploaded, resize it
    if (fileInput) {
      Resizer.imageFileResizer(
        event.target.files[0],
        300,
        300,
        "JPEG",
        100,
        0,
        uri => {
          // console.log(uri);
          // set base64 image in state to later send to S3
          setState({ ...state, image: uri, success: "", error: "" });
        },
        "base64"
      );
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // change button text while submitting
    setState({ ...state, buttonText: "Updating..." });
    // console.log(...formData);

    // using withAdmin lets us access the bearer token
    try {
      const response = await axios.put(
        `${API}/category/${oldCategory.slug}`,
        { name, content, image },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("CATEGORY UPDATE RESPONSE", response);

      // reset button name after successful image upload
      setImageUploadButtonName("Update");

      // reset content after category is created
      setContent("");

      setState({
        ...state,
        imagePreview: response.data.image.url,
        success: `${response.data.name} is updated`
      });
    } catch (error) {
      console.log("CATEGORY UPDATE ERROR", error);
      setState({
        ...state,
        buttonText: "Create",
        error: error.response.data.error
      });
    }
  };

  const updateCategoryForm = () => {
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="text-muted">Name</label>
          <input
            onChange={handleChange("name")}
            value={name}
            type="text"
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label className="text-muted">Content</label>
          <ReactQuill
            value={content}
            onChange={handleContent}
            placeholder="Enter a description"
            theme="bubble"
            className="pb-5 mb-3"
            style={{ border: "1px solid #666" }}
          />
        </div>
        <div className="form-group">
          <label className="btn btn-outline-secondary">
            {imageUploadButtonName} {"  "}
            <span>
              <img src={imagePreview} alt="image" height="20" />
            </span>
            <input
              onChange={handleImage}
              type="file"
              accept="image/*"
              className="form-control"
              hidden
            />
          </label>
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
          <h1>Update category</h1>
          <br />
          {success && showSuccessMessage(success)}
          {error && showErrorMessage(error)}
          {updateCategoryForm()}
        </div>
      </div>
    </Layout>
  );
};

// getting req, query and token from context
Update.getInitialProps = async ({ req, query, token }) => {
  const response = await axios.post(`${API}/category/${query.slug}`);
  return {
    oldCategory: response.data.category,
    token
  };
};

export default withAdmin(Update);
