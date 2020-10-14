// protected route only for admin

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { API } from "../../../config";
import { showSuccessMessage, showErrorMessage } from "../../../helpers/alerts";
import Layout from "../../../components/Layout";
import withAdmin from "../../withAdmin";

// this page is for the admin to view all current categories
const Read = ({ user, token }) => {
  const [state, setState] = useState({
    error: "",
    success: "",
    categories: []
  });

  const { error, success, categories } = state;

  // runs when the component mounts
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const response = await axios.get(`${API}/categories`);
    setState({ ...state, categories: response.data });
  };

  const confirmDelete = (e, slug) => {
    e.preventDefault();

    // creates an alert window in the browser
    let answer = window.confirm(
      "Are you sure that you want to delete this category?"
    );

    if (answer) {
      handleDelete(slug);
    }
  };

  const handleDelete = async slug => {
    try {
      // sending the slug and the headers because
      // the user has to be an authenticated admin to delete
      const response = await axios.delete(`${API}/category/${slug}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("CATEGORY SUCCESSFULLY DELETED", response);

      // re-fetch all categories so deleted is no longer displayed
      loadCategories();
    } catch (error) {
      console.log("CATEGORY DELETE ERROR", error);
    }
  };

  // item for 'category' and i for 'index'
  const listCategories = () =>
    categories.map((item, i) => {
      return (
        <Link key={item._id} href={`/links/${item.slug}`}>
          <a className="border border-primary bg-light p-4 m-2 col-md-5">
            <div>
              <div className="row">
                <div className="col-md-3">
                  <img
                    src={item.image && item.image.url}
                    alt={item.name}
                    style={{ width: "100px", height: "auto" }}
                    className="pr-4"
                  />
                </div>
                <div className="col-md-6">
                  <h5>{item.name}</h5>
                </div>
                <div className="col-md-3">
                  <Link href={`/admin/category/${item.slug}`}>
                    <button className="btn btn-sm btn-outline-success btn-block mb-1">
                      Update
                    </button>
                  </Link>
                  <button
                    onClick={e => confirmDelete(e, item.slug)}
                    className="btn btn-sm btn-outline-danger btn-block"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </a>
        </Link>
      );
    });

  return (
    <Layout>
      <div className="row">
        <div className="col">
          <h1>List of categories</h1>
          <br />
        </div>
      </div>

      <div className="row">{listCategories()}</div>
    </Layout>
  );
};

export default withAdmin(Read);
