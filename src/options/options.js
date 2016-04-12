;
(function ($) {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
		chrome.storage.sync.get('options', function (storage) {
			var opts = storage.options || {};

			var deleteTabOnOpen = opts.deleteTabOnOpen || 'no';
			$('input[name="deleteTabOnOpen"][value="' + deleteTabOnOpen+ '"]').prop('checked', 'checked');

			var enableAltQ = opts.enableAltQ || 'no';
			$('input[name="enableAltQ"][value="' + enableAltQ + '"]').prop('checked', 'checked');

			var tabLimit = opts.tabLimit || '0';
			document.getElementById("tabLimit").value = tabLimit;

			var autoTabLimit = opts.autoTabLimit || 'no';
			$('input[name="autoTabLimit"][value="' + autoTabLimit + '"]').prop('checked', 'checked');
		});
	});

	document.getElementsByName('save')[0].addEventListener('click', function () {
		var deleteTabOnOpen = document.querySelector('input[name="deleteTabOnOpen"]:checked').value;
		var enableAltQ = document.querySelector('input[name="enableAltQ"]:checked').value;
		var tabLimit = document.getElementById("tabLimit").value;
		if (tabLimit !== parseInt(tabLimit, 10)) {tabLimit = 0;}else{tabLimit = parseInt(tabLimit, 10);}
		var autoTabLimit = document.querySelector('input[name="autoTabLimit"]:checked').value;

		chrome.storage.local.set({
			options: {
				deleteTabOnOpen: deleteTabOnOpen,
				enableAltQ: enableAltQ,
				tabLimit: tabLimit,
				autoTabLimit: autoTabLimit
			}
		}, function () {
			document.getElementById('saved').style.display = 'block';
			window.setTimeout(function () {
				document.getElementById('saved').style.display = 'none';
			}, 1000);
		});
	});

}(jQuery));
