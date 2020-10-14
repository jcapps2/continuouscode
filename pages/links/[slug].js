// page for dynamically loading individual category
// page with submitte links

import Layout from "../../components/Layout";
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import InfiniteScroll from "react-infinite-scroller";
import axios from "axios";
import renderHTML from "react-render-html";
import { API, APP_NAME } from "../../config";
import moment from "moment";

const Links = ({
  query,
  category,
  links,
  totalLinks,
  linksLimit,
  linkSkip
}) => {
  // store links in state, so that when user clicks
  // 'load more', we just add them to the state
  const [allLinks, setAllLinks] = useState(links);

  const [limit, setLimit] = useState(linksLimit);

  const [skip, setSkip] = useState(0);

  const [size, setSize] = useState(totalLinks);

  const [popular, setPopular] = useState([]);

  // removes HTML from meta description
  const stripHTML = data => data.replace(/<\/?[^>]+(>|$)/g, "");

  // setting header for SEO purposes
  //
  // substring(0, 160) only grabs the first 160 characters (the maximum) for our SEO
  const head = () => {
    return (
      <Head>
        <title>
          {category.name} | {APP_NAME}
        </title>
        <meta
          name="description"
          content={stripHTML(category.content.substring(0, 160))}
        />
        <meta property="og:title" content={category.name} />
        <meta
          property="og:description"
          content={stripHTML(category.content.substring(0, 160))}
        />
        {/*for sharing link and ensuring that the image is there*/}
        <meta property="og:image" content={category.image.url} />
        <meta property="og:image:secure_url" content={category.image.url} />
      </Head>
    );
  };

  // load in the trending links for the specific category
  useEffect(() => {
    loadPopular();
  }, []);

  const loadPopular = async () => {
    const response = await axios.get(`${API}/link/popular/${category.slug}`);
    setPopular(response.data);
  };

  // makes a put request to update the click count on the back end
  const handleClick = async linkId => {
    const response = await axios.put(`${API}/click-count`, { linkId });
    loadPopular();
  };

  // updates the link state so users see it instantly
  const loadUpdatedLinks = async () => {
    const response = await axios.post(`${API}/category/${query.slug}`);
    setAllLinks(response.data.links);
  };

  // listing popular links
  const listOfPopularLinks = () =>
    popular.map((link, index) => {
      return (
        <div key={index} className="row alert alert-secondary p-2">
          <div className="col-md-12" onClick={() => handleClick(link._id)}>
            <a href={link.url} target="_blank">
              <h5 className="pt-2">{link.title}</h5>
              <h6 className="pt-2 text-danger" style={{ fontSize: "12px" }}>
                {link.url}
              </h6>
            </a>
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
          <div className="col-md-8" onClick={e => handleClick(link._id)}>
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
            <span className="badge text-secondary">{link.clicks} clicks</span>
          </div>
        </div>
      );
    });
  };

  const loadMore = async () => {
    let toSkip = skip + limit;
    const response = await axios.post(`${API}/category/${query.slug}`, {
      skip: toSkip,
      limit
    });

    // spread out existing links, as well as the new links just loaded in
    setAllLinks([...allLinks, ...response.data.links]);

    // calculate how many to skip
    setSize(response.data.links.length);
    setSkip(toSkip);
  };

  // main return statement
  return (
    <React.Fragment>
      {head()}
      <Layout>
        <div className="row">
          <div className="col-md-8">
            <h1 className="display-4 font-weight-bold">
              {category.name} - URL/Links
            </h1>
            <div className="lead alert alert-secondary pt-4">
              {renderHTML(category.content) || ""}
            </div>
          </div>
          <div className="col-md-4">
            <img
              src={category.image.url}
              alt={category.name}
              style={{ width: "auto", maxHeight: "200px" }}
            />
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
            <div className="col-md-8">{listOfLinks()}</div>
            <div className="col-md-4">
              <h2 className="lead">Most popular in {category.name}</h2>
              <div className="p-3">{listOfPopularLinks()}</div>
            </div>
          </div>
        </InfiniteScroll>
      </Layout>
    </React.Fragment>
  );
};

// getting the slug via server side rendering (destructuring query and req)
Links.getInitialProps = async ({ query, req }) => {
  let skip = 0;
  let limit = 20;

  // grabbing the category and associated links
  // and passing the amount we want to skip and limit
  const response = await axios.post(`${API}/category/${query.slug}`, {
    skip,
    limit
  });

  //
  return {
    query,
    category: response.data.category,
    links: response.data.links,
    totalLinks: response.data.links.length,
    linksLimit: limit,
    linkSkip: skip
  };
};

export default Links;
