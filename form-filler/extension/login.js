document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log('Attempting login with:', { username }); // Log login attempt

  try {
    const response = await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    console.log('Raw response:', response); // Log raw response

    const data = await response.json();
    console.log('Response data:', data); // Log parsed response

    if (data.token) {
      // Store token and user data
      chrome.storage.local.set({
        token: data.token,
        username: data.user.username,
        isLoggedIn: true
      }, function() {
        console.log('Data stored in chrome.storage'); // Log storage success
        window.location.href = "popup.html";
      });
    } else {
      alert(data.message || "Invalid credentials!");
    }
  } catch (error) {
    console.error('Login error:', error); // Log detailed error
    alert("Error logging in. Please try again later.");
  }
});
