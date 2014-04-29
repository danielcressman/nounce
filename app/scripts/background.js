'use strict';

var HOST = "http://apifree.forvo.com", API_KEY = "", FORMAT = "json", ACTION = "standard-pronunciation";

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: 'Nounce!'});

chrome.commands.onCommand.addListener(function(command) {
	console.log('Command:', command);

	if(command !== "lookup") {
		return;
	}

	if(API_KEY === "") {
		console.err("Please provide a suitable API key.")
	}

	chrome.tabs.executeScript({
		code : "window.getSelection().toString()"
	}, function (selection) {
		if(selection) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", getURL(selection));

			xhr.onload = function() {
				var forvoRes = JSON.parse(xhr.response);

				if(forvoRes && forvoRes.items && forvoRes.items[0].pathmp3) {
					var xhrSound = new XMLHttpRequest();
					xhrSound.open("GET", forvoRes.items[0].pathmp3);
					xhr.overrideMimeType("audio/mpeg3");
					xhrSound.responseType = "blob";

					xhrSound.onload = function(e) {
						var player = new window.Audio();
						player.src = window.URL.createObjectURL(xhrSound.response);
						player.play();
					}

					xhrSound.send();
				} else {
					console.err("Could not find matching Forvo entry.")
				}
			}

			xhr.send();
		}
		else {			
			console.err("No selection was found.");
		}
	});
});

function getURL(lookupWord) {
	var URL;
	if(lookupWord) {
		URL = HOST + "/key/" + API_KEY + "/action/" + ACTION 
				   + "/format/" + FORMAT + "/word/" + lookupWord;
	}
	return URL;
}
