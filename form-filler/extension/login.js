document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      console.log(response)
      const { token } = await response.json();
      console.log(token)
      // Store JWT in localStorage
      localStorage.setItem("jwtToken", token);

      alert("Login successful! Redirecting...");
      console.log("first")
      window.location.href = "popup.html"; // Redirect to a dashboard or home page
    } else {
      alert("Invalid credentials. Please try again.");
    }
  } catch (error) {
    alert("Error logging in. Please try again later.");
  }
});
