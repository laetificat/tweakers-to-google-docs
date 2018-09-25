/**
* @link https://github.com/laetificat/tweakers-to-google-docs
* @author Kevin Heruer <k.heruer@gmail.com>
* @copyright Copyright (c) 2018 Kevin Heruer <k.heruer@gmail.com>
* @license https://github.com/laetificat/tweakers-to-google-docs/blob/master/LICENSE
*/

/**
* @var tabId
*/
var tabId = null;

// Check if the listener already exists
if (!browser.webNavigation.onCompleted.hasListener(createContextMenus)) {
	// Listen to the change url event
	browser.webNavigation.onCompleted.addListener(createContextMenus);
}

// Check if the listener already exists
if (!browser.tabs.onActivated.hasListener(onTabActivatedListener)) {
	// Listen to the active tab event and set a promise to get the tab info
	browser.tabs.onActivated.addListener(onTabActivatedListener);
}

/**
* Checks if the given tab matches http(s)://(www.)tweakers.net/pricewatch/(id)/(slug).html
* and creates a context (right click) menu item with a contextMenuItemOnClickListener.
* Also sets the global tabId.
*
* @param tabInfo
*/
function createContextMenus(tabInfo) {
	// Set the tab ID
	tabId = tabInfo.id;

	// Check if the URL matches what we want
	if (tabInfo.url.match(/https?:\/\/(www\.)?tweakers\.net\/pricewatch\/[0-9]+\/.*\.html/gm) == null) {
		browser.menus.remove("copy-data").then(onRemoveContextMenuItemSuccess, onRemoveContextMenuItemError);
		browser.menus.onClicked.removeListener(contextMenuItemOnClickListener);
		tabId = null;
		return;
	}

	// Create a menu item
	browser.menus.create({
		id: "copy-data",
		title: browser.i18n.getMessage("menuItemCopyData"),
		contexts: ["all"],
		type: "normal",
		icons: {
			"32": "assets/icons/icon-32.png",
			"16": "assets/icons/icon-16.png"
		}
	}, onContextMenuCreated);

	// Check if a listener already exists
	if (!browser.menus.onClicked.hasListener(contextMenuItemOnClickListener)) {
		// Add listener to menu items
		browser.menus.onClicked.addListener(contextMenuItemOnClickListener);
	}
	
}

/**
* Formats the received data from the content script and will call another content script called
* clipboard-helper to copy the data to the clipboard.
* This is done because Firefox does not really support clipboard writing.
*
* @param message
*/
var callClipboardToCopyData = function(message) {
	var response = message.response;
	var productData = response['title'] + "\t" + "1" + "\t" + response['price'] + "\t\t" + response['url'];

	const code = "copyToClipboard(" + JSON.stringify(productData) + ");";

	browser.tabs.executeScript({
        code: "typeof copyToClipboard === 'function';",
    }).then((results) => {
        if (!results || results[0] !== true) {
            return browser.tabs.executeScript(tabId, {
                file: "clipboard-helper.js",
            });
        }
    }).then(() => {
        return browser.tabs.executeScript(tabId, {
            code,
        });
    }).catch((error) => {
        console.error("Failed to copy text: " + error);
	});
}

/**
* A listener for the context menu item, when a click event happens it will send a message
* to the content script tweakers-dom-fetcher to ask for the product data scraped from the DOM.
*
* @param info
* @param tab
*/
function contextMenuItemOnClickListener(info, tab) {
	switch(info.menuItemId) {
		case "copy-data":
			browser.tabs.sendMessage(
				tab.id,
				{getProductInfo: true}
			).then(callClipboardToCopyData).catch(requestDomError);
			break;
	}
}

/**
* A listener for the tab activation, grabs the tab and passes it to the createContextMenus method.
*
* @param activeInfo
*/
function onTabActivatedListener(activeInfo) {
	browser.tabs.get(activeInfo.tabId).then(createContextMenus, onGetTabPromiseError);
}

/**
* Handles the context menu created callback
*/
var onContextMenuCreated = function() {

}

/**
* Handles the context menu removed callback
*/
var onRemoveContextMenuItemSuccess = function() {
	
}

/**
* Handles the context menu removed error callback
*/
var onRemoveContextMenuItemError = function(error) {
	console.log("Failed to remove menu item: " + error)
}

/**
* Handles the get tab error callback
*/
var onGetTabPromiseError = function(error) {
	console.log('Error: ' + error);
}

/**
* Handles the request DOM callback error from the content script
*/
var requestDomError = function(error) {
	console.log(error);
}

/**
* Handles the write to clipboard success callback
*/
var writeToClipboardSuccess = function() {

}

/**
* Handles the write to clipboard error callback
*/
var writeToClipboardError = function() {
	
}




