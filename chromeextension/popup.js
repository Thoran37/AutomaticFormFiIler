document.getElementById("scrapeBtn").addEventListener("click", async () => {
  document.getElementById("status").innerText = "Fetching content...";

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    let url = tabs[0].url;

    // Prevent execution on restricted pages
    if (url.startsWith("chrome://") || url.startsWith("https://chrome.google.com/webstore")) {
      document.getElementById("status").innerText = "This page cannot be scraped.";
      return;
    }

    try {
      let [result] = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: scrapeAndRead
      });

      if (result && result.result) {
        speakText(result.result);
        document.getElementById("status").innerText = "Reading content...";
      } else {
        document.getElementById("status").innerText = "No readable content found.";
      }
    } catch (error) {
      console.error("Script execution error:", error);
      document.getElementById("status").innerText = "Error fetching content.";
    }
  });
});

function scrapeAndRead() {
  return document.body.innerText.trim(); // Extract text from the webpage
}

function speakText(text) {
  if (!text) {
    console.log("No text to read.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}
