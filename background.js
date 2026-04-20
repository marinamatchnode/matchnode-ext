chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' });
});

// Fetch an image URL and return it as a base64 data URL.
// This runs in the extension context so it bypasses the page's CSP.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'FETCH_IMAGE') return false;
  fetch(msg.url)
    .then(res => {
      if (!res.ok) throw new Error(res.status);
      return res.blob();
    })
    .then(blob => {
      const reader = new FileReader();
      reader.onloadend = () => sendResponse({ dataUrl: reader.result });
      reader.readAsDataURL(blob);
    })
    .catch(() => sendResponse({ dataUrl: null }));
  return true; // keep the message channel open for async response
});
