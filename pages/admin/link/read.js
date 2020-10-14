// page for admin to view all links

import Layout from "../../../components/Layout";
import withAdmin from "../../withAdmin";
import { useState } from "react";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroller";
import axios from "axios";
import renderHTML from "react-render-html";
import { API } from "../../../config";
import moment from "moment";
import { getCookie } from "../../../helpers/auth";

const Links = ({ links, totalLinks, linksLimit, linkSkip, token }) => {
  // store links in state, so that when user clicks
  // 'load more', we just add them to the state
  const [allLinks, setAllLinks] = useState(links);

  const [limit, setLimit] = useState(linksLimit);

  const [skip, setSkip] = useState(0);

  const [size, setSize] = useState(totalLinks);

  const confirmDelete = (e, id) => {
    e.preventDefault();

    // creates an alert window in the browser
    let answer = window.confirm(
      "Are you sure that you want to delete this link?"
    );

    if (answer) {
      handleDelete(id);
    }
  };

  const handleDelete = async id => {
    try {
      // sending the slug and the headers because
      // the user has to be an authenticated admin to delete
      const response = await axios.delete(`${API}/link/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("LINK SUCCESSFULLY DELETED", response);

      // reload page after deleting link
      process.browser && window.location.reload();
    } catch (error) {
      console.log("LINK DELETE ERROR", error);
    }
  };

  const handleClick = () => {
    console.log("i have been clicked");
  };

  // iterate through links and return each one
  //
  // target="_blank" opens a new tab
  //
  // we need to pass a parameter, so for
  // handleClick(), we need to put the e =>
  // in front so that it won't execute immediately
  const listOfLinks = () => {
    return allLinks.map((link, index) => {
      return (
        <div key={index} className="row alert alert-primary p-2">
          <div className="col-md-8" onClick={e => handleClick(e, link._id)}>
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
            {link.categories.map((c, i) => (
              <span key={i} className="badge text-success">
                {c.name}
              </span>
            ))}
            <Link href={`/user/link/${link._id}`}>
              <a>
                <span className="badge text-primary pull-right">Update</span>
              </a>
            </Link>
            <span
              onClick={e => confirmDelete(e, link._id)}
              className="badge text-danger pull-right"
            >
              Delete
            </span>
            <span className="badge text-secondary">{link.clicks} clicks</span>
          </div>
        </div>
      );
    });
  };

  const loadMore = async () => {
    let toSkip = skip + limit;
    const response = await axios.post(
      `${API}/links`,
      { skip: toSkip, limit },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // spread out existing links, as well as the new links just loaded in
    setAllLinks([...allLinks, ...response.data]);

    // calculate how many to skip
    setSize(response.data.length);
    setSkip(toSkip);
  };

  // main return statement
  return (
    <Layout>
      <div className="row">
        <div className="col-md-12">
          <h1 className="display-4 font-weight-bold">All Links</h1>
        </div>
      </div>
      <br />

      <InfiniteScroll
        pageStart={0}
        loadMore={loadMore}
        hasMore={size > 0 && size >= limit}
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        <div className="row">
          <div className="col-md-12">{listOfLinks()}</div>
        </div>
      </InfiniteScroll>
    </Layout>
  );
};

// getting the slug via server side rendering (destructuring query and req)
Links.getInitialProps = async ({ req }) => {
  let skip = 0;
  let limit = 20;

  const token = getCookie("token", req);

  // grabbing the category and associated links
  // and passing the amount we want to skip and limit
  const response = await axios.post(
    `${API}/links`,
    { skip, limit },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  //
  return {
    links: response.data,
    totalLinks: response.data.length,
    linksLimit: limit,
    linkSkip: skip,
    token
  };
};

export default withAdmin(Links);
