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
      alert("Login successful!");
      window.location.href = "popup.html"; // Redirect to home page
    } else {
      alert("Invalid credentials!");
    }
  } catch (error) {
    alert("Error logging in. Please try again later.");
  }
});