// Accessible as '/user'
import Layout from "../../components/Layout";
import Link from "next/link";
import Router from "next/router";
import axios from "axios";
import moment from "moment";
import { API } from "../../config";
import { getCookie } from "../../helpers/auth";
import withUser from "../withUser";

const User = ({ user, userLinks, token }) => {
  const confirmDelete = (e, id) => {
    e.preventDefault();

    // creates an alert window in the browser
    let answer = window.confirm(
      "Are you sure that you want to delete this category?"
    );

    if (answer) {
      handleDelete(id);
    }
  };

  const handleDelete = async id => {
    try {
      // sending the slug and the headers because
      // the user has to be an authenticated admin to delete
      const response = await axios.delete(`${API}/link/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("LINK SUCCESSFULLY DELETED", response);

      // redirect to dashboard
      Router.replace("/user");
    } catch (error) {
      console.log("LINK DELETE ERROR", error);
    }
  };

  const listOfLinks = () =>
    userLinks.map((link, index) => {
      return (
        <div key={index} className="row alert alert-primary p-2">
          <div className="col-md-8">
            <a href={link.url} target="_blank">
              <h5 className="pt-2">{link.title}</h5>
              <h6 className="pt-2 text-danger" style={{ fontSize: "12px" }}>
                {link.url}
              </h6>
            </a>
          </div>
          <div className="col-md-4 pt-2">
            <span className="pull-right">
              {moment(link.createdAt).fromNow()} by {link.postedBy.name}
            </span>
          </div>
          <div className="col-md-12">
            <span className="badge text-dark">
              {link.type} {link.medium}
            </span>
            {link.categories.map((c, i) => {
              // c = category
              // i = index
              return (
                <span key={i} className="badge text-success">
                  {c.name}
                </span>
              );
            })}
            <span className="badge text-secondary">{link.clicks} clicks</span>

            <Link href={`/user/link/${link._id}`}>
              <span className="badge text-primary pull-right">Update</span>
            </Link>

            <span
              onClick={e => confirmDelete(e, link._id)}
              className="badge text-danger pull-right"
            >
              Delete
            </span>
          </div>
        </div>
      );
    });

  return (
    <Layout>
      <h1>{user.name}'s Dashboard </h1>
      <hr />
      <div className="row">
        <div className="col-md-4">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link href="/user/link/create">
                <a className="nav link">Submit a link</a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/user/profile/update">
                <a className="nav link">Update profile</a>
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-md-8">
          <h2>Your links</h2>
          <br />
          {listOfLinks()}
        </div>
      </div>
    </Layout>
  );
};

// withUser ensures that user is authenticated, else
// they are redirected.
export default withUser(User);
