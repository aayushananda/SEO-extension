// Service Worker (Manifest V3)
// Currently inactive. Ready for future background tasks (e.g., alarms, context menus).

chrome.runtime.onInstalled.addListener(() => {
  console.log("SEO Ext V1 installed and ready.");
});
