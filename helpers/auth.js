// Storing cookies in user's browser (local storage)
import cookie from "js-cookie";
import Router from "next/router";

// Set cookie
export const setCookie = (key, value) => {
  // Check if we are in client-side mode. Similar to if (window).
  if (process.browser) {
    // Expires in 1 day
    cookie.set(key, value, {
      expires: 1
    });
  }
};

// Remove cookie when user signs out
export const removeCookie = key => {
  // Check if we are in client-side mode. Similar to if (window).
  if (process.browser) {
    // Expires in 1 day
    cookie.remove(key);
  }
};

// Get token from stored cookie.
// Will be useful when we need to make a request
// to the server with the auth token.
export const getCookie = (key, req) => {
  // if (process.browser) {
  //   return cookie.get(key);
  // }

  // If we're in the client side, get the cookie. Otherwise,
  // get cookie from the server side (SSR functionality).
  return process.browser
    ? getCookieFromBrowser(key)
    : getCookieFromServer(key, req);
};

// Grab cookie from local storage in client side
export const getCookieFromBrowser = key => {
  return cookie.get(key);
};

// Client side hasn't rendered yet, so using SSR,
// grab the cookie (if exists) from headers.
export const getCookieFromServer = (key, req) => {
  if (!req.headers.cookie) {
    return undefined;
  }
  console.log("req.headers.cookie", req.headers.cookie);
  let token = req.headers.cookie
    .split(";")
    .find(c => c.trim().startsWith(`${key}=`));
  if (!token) {
    return undefined;
  }
  // Splitting and grabbing the token at value [1].
  // then returning that token value so that we can
  // send it to the server.
  let tokenValue = token.split("=")[1];
  // console.log("getCookieFromServer", tokenValue);
  return tokenValue;
};

// Set in local storage
export const setLocalStorage = (key, value) => {
  if (process.browser) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Remove from local storage
export const removeLocalStorage = key => {
  if (process.browser) {
    localStorage.removeItem(key);
  }
};

// Authenticate user by passing data to cookie and local storage during sign in.
//
// First argument is response from login.js in handleSubmit, and second argument
// is a callback function that will redirect user after they login.
export const authenticate = (response, next) => {
  // Setting cookie by the name of 'token' with a value of the previously generated token.
  setCookie("token", response.data.token);
  setLocalStorage("user", response.data.user);
  next();
};

// Access user info from local storage
export const isAuth = () => {
  if (process.browser) {
    // Checking if cookie exists
    const cookieChecked = getCookie("token");
    if (cookieChecked) {
      // if user is in local storage, get that info
      if (localStorage.getItem("user")) {
        // parse into json
        return JSON.parse(localStorage.getItem("user"));
      } else {
        // user does not exist in local storage
        return false;
      }
    }
  }
};

// Logout the user - remove user from local storage, and remove token from cookies
export const logout = () => {
  removeCookie("token");
  removeLocalStorage("user");

  // Redirect on logout
  Router.push("/login");
};

// for updating local storage when user profile is updated in the backend
// so user doesn't have to log out to see the changes
export const updateUser = (user, next) => {
  // check if we're in the client side
  if (process.browser) {
    if (localStorage.getItem("user")) {
      let auth = JSON.parse(localStorage.getItem("user"));
      auth = user;
      localStorage.setItem("user", JSON.stringify(auth));
      next();
    }
  }
};
