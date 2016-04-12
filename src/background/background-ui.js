chrome.storage.local.get(function (storage) {
	init(storage);
});

var TabGroups = [],
	Options;

function init(storage) {
	if (typeof storage.tabGroups !== 'undefined') {
		TabGroups = storage.tabGroups.sort(function (a, b) {
			return b.id - a.id;
		});
	}

	Options = storage.options || {
		deleteTabOnOpen: 'no'
	};
	
	// Tab Groups
	var tabGroups = {};
	tabGroups.controller = function () {
		var ctrl = this;
		// Operations
		ctrl.removeGroup = function (idx) {
			TabGroups.splice(idx, 1);
		};
		ctrl.restoreAll = function (idx) {
			var tabGroup = TabGroups[idx];
			tabGroup.tabs.forEach(function (tab) {
				chrome.tabs.create({
					url: tab.url
				});
			});
			if (Options.deleteTabOnOpen === 'yes') {
				ctrl.removeGroup(idx);
				ctrl.save();
			}
		};
		ctrl.save = function () {
			chrome.storage.local.set({tabGroups: TabGroups});
		};
		ctrl.moveItem = function (srcGroupIdx, srcItemIdx, toGroupIdx) {
			var srcGroup = TabGroups[srcGroupIdx].tabs;
			var srcTab = srcGroup[srcItemIdx];
			TabGroups[toGroupIdx].tabs.push(srcTab);
			if (srcGroup.length > 1) {
				srcGroup.splice(srcItemIdx, 1);
			} else {
				ctrl.removeGroup(srcGroupIdx);
			}
		};
		ctrl.renameGroup = function (idx) {
			console.log(idx);
			TabGroups[idx].name = prompt("Rename Group to: ", TabGroups[idx].name)
		};

		// Handlers
		ctrl.onDragLeave = function () {
			return function (event) {
				event.preventDefault();
				if (--dragCounter == 0 && (target = getDropzone(event.target)) != null) {
					target.style.background = "";
				}
			}
		};
		ctrl.onDragEnter = function () {
			return function (event) {
				event.preventDefault();
				if (dragCounter++ < 1 && (target = getDropzone(event.target)) != null) {
					target.style.background = 'rgb(238, 238, 238)';
				}
			};
		};
		ctrl.onDrop = function (groupIdx) {
			return function (event) {
				event.preventDefault();
				var target;
				if ((target = getDropzone(event.target)) != null) {
					target.style.background = "";
					var item;
					while (item = dragged.pop()) {
						if (item.groupIndex != groupIdx) {
							ctrl.moveItem(item.groupIndex, item.itemIndex, groupIdx);
						}
					}
					ctrl.save();
				}
				dragCounter = 0;
				dragged = [];
			};
		};
	};
	// probably more efficient to just set all children as dropzones
	function getDropzone(elem) {
		if (elem == null) {
			return null;
		}
		return elem.className == 'group' ? elem : getDropzone(elem.parentNode)
	}

	tabGroups.view = function (ctrl) {
		return TabGroups.map(function (group, idx) {
			return m('div.group', {
				ondragenter: ctrl.onDragEnter(),
				ondragover: function (event) {
					event.preventDefault()
				},
				ondragleave: ctrl.onDragLeave(),
				ondrop: ctrl.onDrop(idx)
			}, [
				m('div.group-title', [
					m('span.delete-link', {
						onclick: function () {
							if(confirm('Are you sure you want to delete this group?')){
								ctrl.removeGroup(idx);
								ctrl.save();
							}
						}
					}),
					m('span.group-name', group.name == null || group.name === '' ? group.tabs.length + ' Tabs' : group.name),
					' ',
					m('span.group-date', moment(new Date(group.id)).fromNow()),
					' ',
					m('span.clickable', {
						onclick: function () {
							ctrl.restoreAll(idx);
						}
					}, 'Restore All'),
					' ',
					m('span.clickable', {
						onclick: function () {
							ctrl.renameGroup(idx);
							ctrl.save();
						}
					}, 'Rename')
				]),
				m('ul', tabs.view(new tabs.controller(ctrl, group.tabs, idx))
				 )
			])
		});
	};

	// List of tabs in each Tab Group
	var tabs = {},
		dragged = [],
		dragCounter = 0;
	tabs.controller = function (mainCtrl, items, groupIdx) {
		var ctrl = this;
		ctrl.tabs = items;
		ctrl.removeTab = function (idx) {
			if (ctrl.tabs.length <= 1) {
				mainCtrl.removeGroup(groupIdx);
			} else {
				ctrl.tabs.splice(idx, 1);
			}
		};
		ctrl.save = function () {
			mainCtrl.save();
		};

		// Drag & drop
		ctrl.onDragStart = function (idx) {
			return function () {
				dragged.push({
					itemIndex: idx,
					groupIndex: groupIdx
				});
			};
		};
		ctrl.onDrop = function () {
			return function (event) {
				event.preventDefault();
				var target;
				if ((target = getDropzone(event.target)) != null) {
					target.style.background = "";
					var item;
					while (item = dragged.pop()) {
						if (item.groupIndex != groupIdx) {
							mainCtrl.moveItem(item.groupIndex, item.itemIndex, groupIdx);
						}
					}
					//ctrl.save();
				}
				dragCounter = 0;
				dragged = [];
			};
		};
	};
	tabs.view = function (ctrl) {
		return ctrl.tabs.map(function (tab, idx) {
			return m('li[draggable=true]', {
				ondragstart: ctrl.onDragStart(idx),
				ondrop: ctrl.onDrop()
			}, [
				m('span.delete-link', {
					onclick: function () {
						ctrl.removeTab(idx);
						ctrl.save();
					}
				}),
				m('img', {src: tab.favIconUrl, height: '16', width: '16'}),
				' ',
				m('a.link', {
					onclick: function () {
						if (Options.deleteTabOnOpen === 'yes') {
							ctrl.removeTab(idx);
						}
					},
					href: tab.url
				}, tab.title),
				' ',
				m('span.grabbable', '||')
			]);
		})
	};

	chrome.storage.onChanged.addListener(function (changes, namespace) {
		if (changes.tabGroups != null) {
			TabGroups = changes.tabGroups.newValue.sort(function (a, b) {
				return b.id - a.id;
			});
			m.redraw();
		}
	});

	m.module(document.getElementById('groups'), {controller: tabGroups.controller, view: tabGroups.view});
}
