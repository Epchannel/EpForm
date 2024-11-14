// background.js
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ isEnabled: true }, () => {
        console.log("Form Tool isEnabled set to true");
    });
});

// Đảm bảo `isEnabled` được thiết lập lại thành `true` mỗi khi extension khởi động
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.set({ isEnabled: true }, () => {
        console.log("Form Tool isEnabled set to true on startup");
    });
});
