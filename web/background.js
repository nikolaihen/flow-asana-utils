chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, _) {
    if (changeInfo.url) {
      chrome.tabs.sendMessage(
        tabId, {
        url: changeInfo.url
      })
    }
  }
);