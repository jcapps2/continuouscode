import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { API } from "../config";
import Link from "next/link";
import moment from "moment";

// categories is available straight away
// because of Home.getInitialProps()
const Home = ({ categories }) => {
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    loadPopular();
  }, []);

  // makes a request to the backend to fetch
  // all popular posts
  const loadPopular = async () => {
    const response = await axios.get(`${API}/link/popular`);
    setPopular(response.data);
  };

  // for updating the click count on the popular links
  // when clicked on the homepage
  const handleClick = async linkId => {
    const response = await axios.put(`${API}/click-count`, { linkId });

    // reload the popular links after click count
    // has been incremented
    loadPopular();
  };

  // listing popular links
  const listOfLinks = () =>
    popular.map((link, index) => {
      return (
        <div key={index} className="row alert alert-secondary p-2">
          <div className="col-md-8" onClick={() => handleClick(link._id)}>
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
            <span className="badge text-secondary pull-right">
              {link.clicks} clicks
            </span>
          </div>
        </div>
      );
    });

  const listCategories = () =>
    categories.map((item, i) => {
      return (
        <Link key={i} href={`/links/${item.slug}`}>
          <a className="border border-primary bg-light p-4 m-2 col-md-3">
            <div>
              <div className="row">
                <div className="col-md-4">
                  <img
                    src={item.image && item.image.url}
                    alt={item.name}
                    style={{ width: "100px", height: "auto" }}
                    className="pr-4"
                  />
                </div>
                <div className="col-md-8">
                  <h5>{item.name}</h5>
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
        <div className="col-md-12">
          <h1 className="font-weight-bold">Browse Tutorials</h1>
        </div>
      </div>

      <div className="row">{listCategories()}</div>

      <div className="row pt-5">
        <h2 className="font-weight-bold pb-3">Popular</h2>
        <div className="col-md-12 overflow-hidden">{listOfLinks()}</div>
      </div>
    </Layout>
  );
};

// our SSR before component renders on the client
//
// will make sure that the categories are loaded
// before user can even view them. good for SEO
// and performance
Home.getInitialProps = async () => {
  const response = await axios.get(`${API}/categories`);

  return {
    categories: response.data
  };
};

export default Home;
