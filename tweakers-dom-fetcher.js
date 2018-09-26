/**
* @link https://github.com/laetificat/tweakers-to-google-docs
* @author Kevin Heruer <k.heruer@gmail.com>
* @copyright Copyright (c) 2018 Kevin Heruer <k.heruer@gmail.com>
* @license https://github.com/laetificat/tweakers-to-google-docs/blob/master/LICENSE
*/

/**
* Callback to handle the message from the background, scrapes the DOM, creates an array
* returns a reply with the array.
*
* @param request
* @param sender
* @param sendResponse
*/
function handleMessage(request, sender, sendResponse) {
	var productData = [];
	productData['title'] = document.getElementById("entity").getElementsByTagName("header")[0].getElementsByTagName("h1")[0].getElementsByTagName("a")[0].innerText.trim()
	productData['price'] = document.getElementById("listing").getElementsByTagName("tbody")[0].firstElementChild.getElementsByClassName("shop-price")[0].innerText.substring(1).trim();
	productData['url'] = window.location.href;

	sendResponse({response: productData});
}

// Check if the listener already exists
if (!browser.runtime.onMessage.hasListener(handleMessage)) {
	// Create a new listener
	browser.runtime.onMessage.addListener(handleMessage);
}