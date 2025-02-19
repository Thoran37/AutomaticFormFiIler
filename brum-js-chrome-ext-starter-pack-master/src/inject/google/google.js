chrome.extension.sendMessage({}, function (response) {
  var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      // ----------------------------------------------------------
      // This part of the script triggers when page is done loading
      console.log("Hello. This message was sent from scripts/inject.js");
      // ----------------------------------------------------------
    }
  }, 10);
});

function brummify() {
  const googleLogo = document.querySelector('[alt="Google"]');
  const brumJsLogo = chrome.runtime.getURL("images/brum_js_google.png");
  googleLogo.src = brumJsLogo;
  googleLogo.srcset = brumJsLogo;
}

window.onload = brummify();
