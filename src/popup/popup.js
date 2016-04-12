;
(function () {
	'use strict';

	// all tabs
	document.getElementById('save-all').addEventListener('click', function () {
		chrome.tabs.query({currentWindow: true}, function (tabsArr) {
			var currentTab = tabsArr.filter(function (tab) {
				return tab.active;
			})[0];
			chrome.tabs.sendMessage(currentTab.id, {action: 'create-modal', tabsArr: tabsArr});
			window.close();
		});
	});

	// open background page
	document.getElementById('open-background-page').addEventListener('click', function () {
		chrome.runtime.sendMessage({action: 'openbackgroundpage'}, function (res) {
			if (res === 'ok') {
				window.close();
			}
		});
	});

	document.getElementById('options').addEventListener('click', function () {
		chrome.tabs.create({url: chrome.extension.getURL('src/options/options.html')});
	});

	document.getElementById('save-current').addEventListener('click', function () {
		chrome.runtime.sendMessage({action: 'save-current'});
		window.close();
	});
	
	document.getElementById('tab-limit').addEventListener('click', function () {
		chrome.runtime.sendMessage({action: 'tab-limit'});
		window.close();
	});

}());
