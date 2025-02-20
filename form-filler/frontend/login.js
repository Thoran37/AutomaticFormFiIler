document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log('Attempting login with:', { username }); // Log login attempt

  try {
    // Your login authentication logic here
    // For example:
    if (username && password) { // Replace with actual authentication
      // Store user info in chrome.storage
      await chrome.storage.local.set({
        isLoggedIn: true,
        username: username
      });

      // Set the popup
      await chrome.action.setPopup({ popup: 'popup.html' });

      // Notify background script of successful login
      chrome.runtime.sendMessage({ action: 'loginSuccess' });
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error('Login failed:', error);
    alert('Login failed. Please try again.');
  }
});