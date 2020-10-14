// This component uses server side rendering to
// make sure that, as a user navigates through the
// website, they are still authenticated.
//
// It essentially restricts access to any page that
// you apply it to, and requires an authenticated user
// to access said page.

import axios from "axios";
import { API } from "../config";
import { getCookie } from "../helpers/auth";

// Takes the page we're on as the argument
const withUser = Page => {
  // return Page with all props
  const WithAuthUser = props => <Page {...props} />;

  // getInititalProps give us access to context
  WithAuthUser.getInitialProps = async context => {
    // get auth token from local storage if it exists
    const token = getCookie("token", context.req);

    let user = null;
    let userLinks = [];

    // if there is a token, get user endpoint
    if (token) {
      try {
        const response = await axios.get(`${API}/user`, {
          headers: {
            authorization: `Bearer ${token}`,
            contentType: "application/json"
          }
        });
        console.log("response in withUser", response);
        // Now we have the user here
        user = response.data.user;
        userLinks = response.data.links;
      } catch (error) {
        // Only concerned with unauthorized error - invalid user token (or no token)
        if (error.response.status === 401) {
          // if unauthorized, then we don't have a user
          user = null;
        }
      }
    }

    // Redirect if we don't have a user. Because if user is null,
    // we don't want to allow access to premium content.
    if (user === null) {
      // Redirect
      context.res.writeHead(302, {
        Location: "/"
      });
      context.res.end();
    } else {
      return {
        ...(Page.getInitialProps ? await Page.getInitialProps(context) : {}),
        user,
        token,
        userLinks
      };
    }
  };

  return WithAuthUser;
};

export default withUser;
