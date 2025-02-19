function getTextFromPage() {
    let textContent = document.body.innerText;  // Get all visible text
    return textContent.trim();
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrape_and_read") {
      let text = getTextFromPage();
      sendResponse({ text });
    }
  });
  