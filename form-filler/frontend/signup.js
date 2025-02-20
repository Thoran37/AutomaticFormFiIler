document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:4000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      alert("Signup successful! Redirecting to login page...");
      window.location.href = "login.html";
    } else {
      const errorMessage = await response.json();
      alert(errorMessage.message || "Error signing up. Try again.");
    }
  } catch (error) {
    alert("Error signing up. Please try again later.");
  }
});
