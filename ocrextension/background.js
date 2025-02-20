chrome.runtime.onMessage.addListener(function (request) {
  if (request.action === "showNotification") {
      chrome.notifications.create({
          type: "basic",
          // iconUrl: "icons/icon.png",
          title: "OCR Extracted Text",
          message: request.text.substring(0, 100) + "..." // Show first 100 characters
      });
  }
});
