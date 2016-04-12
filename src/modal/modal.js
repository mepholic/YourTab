;
(function (m) {
	chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
		switch (req.action) {
		case 'create-modal':
			createModal(req.tabsArr);
			//chrome.runtime.sendMessage({ action: 'create-modal', tabsArr: req.tabsArr });
			break;
		default:
			sendRes('nope');
			break;
		}
	});

	// Probably more elegant to do it via mithril but don't wanna waste more time trying to find out how it works
	function createModal(tabsArr) {
		//TODO check if alr clicked/ modal already exists
		// White Overlay
		var wrapperDiv = $('<div> </div>').css({
			"position": "fixed",
			"left": "0px",
			"top": "0px",
			"background-color": "rgb(255, 255, 255)",
			"opacity": "0.5",
			"z-index": "2000",
			"height": "1083px",
			"width": "100%"
		});
		wrapperDiv.click(function () {
			$(dialogDiv).remove();
			$(wrapperDiv).remove();
		});

		var dialogDiv = $('<div id="dialog"> </div>');
		dialogDiv.css({
			"position": "fixed",
			"width": "350px",
			"border": "1px solid rgb(51, 102, 153)",
			"padding": "10px",
			"background-color": "rgb(255, 255, 255)",
			"z-index": "2001",
			"overflow": "auto",
			"text-align": "left",
			"top": "20%",
			"left": "43%",
			"max-height": "65%"
		});

		// Title
		var title = $('<h3></h3>').text("Select Tabs to Save");
		dialogDiv.append(title);

		//Each tab = row + favIcon + checkbox + tabTitle
		var targetTabs = filterTabs(tabsArr);
		targetTabs.forEach(function (tab) {
			tab.selected = true;
			var row = $('<div id="row"> </div>');
			row.css({
				"padding": "1em",
				"cursor": "pointer"
			});
			row.hover(
				function () {
					$(this).css({
						"text-decoration": "underline"
					});
				},
				function () {
					$(this).css({
						"text-decoration": "none"
					});
				}
			);

			var favIcon = $('<span></span>');
			favIcon.css({
				"background": "url(" + tab.favIconUrl + ")",
				"height": "16px",
				"width": "16px",
				"background-size": "contain",
				"float": "left",
				"margin-left": "0.5em",
				"position": "absolute"
			});

			var checkbox = $('<input>', {
				type: "checkbox",
				"checked": true
			});
			checkbox.css({
				"vertical-align": "middle"
			});
			checkbox.click(function () {
				tab.selected = !tab.selected;
				console.log("Checkbox clicked: " + tab.selected);
			});

			var tabTitle = $("<p> </p>").text(tab.title);
			tabTitle.css({
				"display": "inline",
				"margin-left": "2.5em"
			});
			tabTitle.click(function () {
				checkbox.click();
			});

			row.append(checkbox);
			row.append(favIcon);
			row.append(tabTitle);
			dialogDiv.append(row);
		});

		// Buttons
		var saveButton = $("<button> Save </button>");
		saveButton.click(function () {
			var selectedTabs = targetTabs.filter(function (tab) {
				return tab.selected;
			});
			console.log(selectedTabs);
			chrome.runtime.sendMessage({action: 'save', tabsArr: selectedTabs}, function (res) {
				if (res === 'ok') {
					// if we are not saved/closed yet remove these
					$(dialogDiv).remove();
					$(wrapperDiv).remove();
				}
			});
		});
		saveButton.css({
			"position": "relative",
			"left": "30%",
			"width": "40%"
		});
		dialogDiv.append(saveButton);

		$(document.body).append(wrapperDiv);
		$(document.body).append(dialogDiv);

	}
})();

function filterTabs(tabsArr) {
	return tabsArr.filter(function (tab) {
		return !tab.pinned && !isOurTab(tab);
	});
}

function isOurTab(tab) {
	return tab.url == chrome.extension.getURL('src/background/background.html');
}
