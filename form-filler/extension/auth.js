document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    // Redirect to login if no token is found
    window.location.href = "login.html";
  } else {
    // Optionally, verify token validity by calling an API
    console.log("User is already logged in.");
  }
});
