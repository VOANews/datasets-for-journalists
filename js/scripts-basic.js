var searchQuery = "";
var currentTab = "#showListMobile"; // On mobile, there's a "List" tab that doesn't exist on larger screens.
var windowSize;


// Define and update this. Then build the query off it. 
// (Don't try to respond to individual updates)
var currentTopics = {
	"region": "",
	"country": "",
	"topics": []
}



// `folderObject` is the object for editing and updating the active query.
// As it is updated, we push the changes to localStorage, where they're saved as a string 
// The localStorage version is loaded and parsed on initial page load.
var folderObject = {};
if ( localStorage.getItem('folder') ){
	folderObject = JSON.parse(localStorage.getItem('folder'));
}


// =======================
// |  UTILITY FUNCTIONS  |
// =======================

// Basic function to replace console.log() statements so they can all be disabled as needed;
var debugMode = true;
function logger(logString){
	if (debugMode){
		console.log(logString);
	}
}

// Count the number of entries that match the current query.
function countEntries(){
	logger("counting entries")
	var entryCount = ($('.source').length - $('.source.hide').length);
	var entries = " entries";
	if (entryCount == 1){
		entries = " entry"
	}
	$("#countSelection, #countSelectionCloud").text( entryCount + entries);
}


// ====================================================================================================
// |                                        DOCUMENT READY                                            |
// ====================================================================================================

$(document).ready(function(){
	// disable console.logs when in production mode
	if (mode == "production"){
		debugMode = false;
	}


	// =================================
	// |  Regional dropdown selection  |
	// =================================

	$( "#dropdown" ).change(function() {
		var name = $(this).children("option:selected").val();
		var type = $(this).children("option:selected").data("type");

		if (type == "region"){
			currentTopics.region = name;
			currentTopics.country = "";
		} else if (type == "country") {
			currentTopics.country = name;
			currentTopics.region = "";
		} else {
			currentTopics.region = "";
			currentTopics.country = "";
			logger("Show all dataset cards")
		}

		updateSort();

		if (windowSize < 780){
			if (currentTab == "#showSearch"){
				currentTab = "#showListMobile";//showListMobile
				$(".voa__content__section.show").removeClass("show");
				$(currentTab).addClass("show");
				$(".voa__search-panel").removeClass("show");

				$(".voa__footer-nav__toggle li a").removeClass("current");
				$(currentTab).addClass("current");
			}
		}

	});





	// =================================================
	// |  Adding, removing and displaying SAVED cards  |
	// =================================================

	// Fold the corners on saved cards (from localStorage)
	for( source in folderObject){
		$("#" + folderObject[source].name ).addClass("saved");
	}

	updateList();

	// Update the list of saved sources
	function updateList(){
		logger("Updating the list of saved sources:")
		var counter = 0;
		var savedList = "";
		for( source in folderObject){
			logger("\t" + folderObject[source].name + ": " + folderObject[source].title);
			savedList += "<li><a href='" + folderObject[source].name + "' class='voa__saved__source'>" + folderObject[source].title + "</a><a href='#' class='voa__delete-saved__source' title='Delete this resource.'></a></li>";
			counter++;
		}

		$("#savedSources").html(savedList);
		if (counter > 0){
			$("#savedCounter").text(counter);
			$("#warningSavedSearch").css("display", "none");
		} else {
			$("#savedCounter").text("");
			$("#warningSavedSearch").css("display", "block");
		}
	}

	// fold the corners of sources when they are clicked and added to "saved"
	$(".source .voa__source__corner").click(function(){
		currentId = $(this).parent().attr("id");
		currentTitle = $(this).parent().find(".voa__source__title").text();

		if($(this).parent().hasClass("saved")){
			logger("Trying to delete: " + currentId);
			delete folderObject[currentId];
		} else {
			folderObject[currentId] = {};
			folderObject[currentId].name = currentId;
			folderObject[currentId].title = currentTitle;
		}
		localStorage.setItem('folder', JSON.stringify(folderObject))

		$(this).parent().toggleClass("saved");

		updateList();

		return false;
	})


	// Display single saved entry from list
	$('.voa__search-panel').on('click', 'a.voa__saved__source', function() {
		logger("Display single saved entry from list:  #" + $( this ).attr("href") );// not working yet.

		// remove the tags
		$("#filterList").html("");

		hideSources();
		// Display the selected saved source
		$("#" + $( this ).attr("href") ).removeClass("hide");

		return false;
	})

	// Remove saved entry from list
	$('.voa__search-panel').on('click', 'a.voa__delete-saved__source', function() {
		currentId = $( this ).siblings("a").attr("href");

		logger("Deleting source from saved list: " + currentId );

		delete folderObject[currentId];

		localStorage.setItem('folder', JSON.stringify(folderObject))

		$("#" + currentId).removeClass("saved");

		updateList();

		return false;
	})


	// Share/bookmark the saved collection button (inside the panel)
	$("#shareSaved").click(function(){
		var collection = "?id=";
		var initialCount = 0;

		for( source in folderObject){
			logger("updating via localStorage")
			if (initialCount > 0){
				collection += "+"
			}
			collection += folderObject[source].name;
			initialCount++;
		}
		$(this).attr("href", collection);
	})

	// Display the list of saved cards
	// Used for the footer nav.
	function showSourcesByID(){
		hideSources();

		var sort = "";
		var initialCount = 0;
		var permalink = "?id=";


		for( source in folderObject){
			if (initialCount > 0){
				sort += ", ";
				permalink += "+";
			}
			sort += "#" + folderObject[source].name;
			permalink += folderObject[source].name;

			initialCount++;
		}
		logger("saved cards sort query: " + sort);

		$( sort ).removeClass("hide");

		$("body, html").animate({ scrollTop: 0 }, 500)


		var entryCount = ($('.source').length - $('.source.hide').length);
		if (entryCount==0){
			tagCloud = '<div class="voa__filter-list__tag">You haven’t saved any datasets yet.</div>';
		} else if (entryCount==1) {
			tagCloud = '<div class="voa__filter-list__tag">You have 1 saved dataset:</div><div class="voa__filter-list__tag permalink"><a href="' + permalink + '" title="Share or bookmark this collection">&nbsp;</a></div>'; 
		} else {
			tagCloud = '<div class="voa__filter-list__tag">You have ' + entryCount + ' saved datasets:</div><div class="voa__filter-list__tag permalink"><a href="' + permalink + '" title="Share or bookmark this collection.">&nbsp;</a></div>';
		}
		$("#filterList").html(tagCloud);

		$("#countSelection").text("");

		return false;
	}




	//===============================================================
	// |  Add support for query strings                             |
	// |  Example:   /?country=United+Kingom&tags=entertainment     |
	//===============================================================
	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		    results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	var queryCountry = getParameterByName('country');
	var queryRegion = getParameterByName('region');
	var queryTags = getParameterByName('tags');
	var queryID = getParameterByName('id');



	// The order of operations is: ID > country + tags > region + tags
	if (queryID != "" && queryID !== null) {
		var query = "";
		var queryArray = queryID.split(" ");
		var initialCount = 0;
		
		logger("Creating list of query IDs to display: ");
		for (var i = 0; i < queryArray.length; i++){
			if (initialCount > 0){
				query += ", "
			}

			query += "#" + queryArray[i];
			initialCount++;
		}
		logger("query: " + query);
		hideSources();

		tagCloud = '<div class="voa__filter-list__tag">Displaying permalink of datasets</div><div class="voa__filter-list__tag remove-permalink"><a href="./">Reset list</a></div>';
		$("#filterList").html(tagCloud);

		// Display the query string of IDs
		$(query).removeClass("hide");

	} else if (queryRegion != "" || queryCountry != "" || queryTags != ""){
		var query = "";

		var tagCloud = "";

		if (queryRegion !== null && queryRegion != ""){
			currentTopics.region = queryRegion;
			updateSort();
		}
		if (queryCountry !== null && queryCountry != ""){
			currentTopics.country = queryCountry;
			updateSort();
		}
		if (queryTags !== null && queryTags != ""){
			var tempTopics = queryTags.split(" ");
			var tempTopicsValidated = [];
			logger("Attempting to validate query of topics:")
			logger(tempTopics);
			for (var i = 0; i < tempTopics.length; i++){

				if(topicsDictionary[tempTopics[i]]){ // checks to see if the tag exists in the dictionary
					logger("valid query: " + tempTopics[i]);
					tempTopicsValidated.push(tempTopics[i]); // This is the compressed and lowercased version
				} else {
					logger("invalid query: " + tempTopics[i])
				}

			}
			currentTopics.topics = tempTopicsValidated;
			logger("\n\ncurrentTopics (validated)")
			logger(currentTopics);
			logger("\n\n")

			updateSort();
		}
	}

	function hideSources(){
		$(".source").addClass("hide");
	}

	// Updating the sort by clicking (or shift-clicking) on the tags on the card
	// also works for dynamically added tags (for instance after the tag cloud is sorted)

	$('.voa__project').on('click', 'a.sortSources', function(e) {

		tempTagArray = $(this).text(); // get rid of any total counts on the tag (used in the tag cloud)
		tempTagArray = tempTagArray.split("(");
		var tag = tempTagArray[0];//$(this).text();


		// Update the currentTopics object.
		// If "shift" is pressed while selecting a tag,
		// add the tag to the current query. 
		// (Default behavior: replace the current query)
		if (e.shiftKey){
			logger("clicked while pressing the shift key");
			if ($(this).hasClass("region")){
				currentTopics.region = $(this).text();
				currentTopics.country = "";
			} else if ($(this).hasClass("country")){
				currentTopics.country = $(this).text();
				currentTopics.region = "";
			} else {
				var tempTag = tag;
				tempTag = tempTag.replace(/\s/g, '');
				tempTag = tempTag.toLowerCase();

				var checkIfTopicExists = false;

				for (var i = 0; i < currentTopics.topics.length; i++){
					if (currentTopics.topics[i] == tempTag){
						checkIfTopicExists = true
					}
				}

				if (!checkIfTopicExists){
					currentTopics.topics.push(tempTag)
				}

			}
		} else {
			if ($(this).hasClass("region")){
				currentTopics.region = $(this).text();
				currentTopics.country = "";
				currentTopics.topics = [];
			} else if ($(this).hasClass("country")){
				currentTopics.country = $(this).text();
				currentTopics.region = "";
				currentTopics.topics = [];
			} else {
				var tempTag = tag;
				tempTag = tempTag.replace(/\s/g, '');
				tempTag = tempTag.toLowerCase();

				currentTopics.topics = [];
				currentTopics.topics.push(tempTag)

				currentTopics.region = "";
				currentTopics.country = "";
			}
		}
		//logger(currentTopics);
		updateSort();

		if (windowSize < 780){
			if (currentTab == "#showSearch"){
				currentTab = "#showListMobile";//showListMobile
				$(".voa__content__section.show").removeClass("show");
				$(currentTab).addClass("show");
				$(".voa__search-panel").removeClass("show");

				$(".voa__footer-nav__toggle li a").removeClass("current");
				$(currentTab).addClass("current");
			}
		}

		return false;

	});


	// One function to make the updates to the current sort
	// used on:
	//		* query strings
	// 		* tags clicked
	//		* and the text input
	function updateSort(){
		var sort = "";
		var temp = "";
		var tagCloud = "";
		var relatedTagsArray = [];
		var permalink = "";
		var regionSet = false;

		logger("\n\nupdateSort()")

		// Reset the tagCloud in the panel
		$(".sortSources.voa__tags.cloud.selected").removeClass("selected");

		if (currentTopics.region != ""){
			temp = currentTopics.region;
			temp = temp.replace(/\s/g, '');
			sort = "." + temp;
			permalink = "?region=" + currentTopics.region;
			regionSet = true;

			logger("Adding region to tag cloud of search terms")
			tagCloud = '<div class="voa__filter-list__tag region">' + currentTopics.region + '<a href="#" class="close-tag"></a></div>';
		}
		if (currentTopics.country != ""){
			temp = currentTopics.country;
			temp = temp.replace(/\s/g, '');
			sort = "." + temp;
			permalink = "?country=" + currentTopics.country;
			regionSet = true;

			logger("Adding country to tag cloud of search terms")
			tagCloud = '<div class="voa__filter-list__tag country">' + currentTopics.country + '<a href="#" class="close-tag"></a></div>';
		}
		for (var i = 0; i < currentTopics.topics.length; i++){
			if (!regionSet && i == 0){
				permalink = "?tags=" + currentTopics.topics[i];
			} else if (i == 0) {
				permalink += "&tags=" + currentTopics.topics[i];
			} else {
				permalink += "+" + currentTopics.topics[i];
			}

			sort += "." + currentTopics.topics[i];
			tagCloud += '<div class="voa__filter-list__tag">' + topicsDictionary[ currentTopics.topics[i] ] + '<a href="#" class="close-tag"></a></div>';
			$("#tag_" + currentTopics.topics[i]).addClass("selected");
		}
		logger("\n\nThis is the new query: ");
		logger(sort);
		logger("(note: If the query is empty, it'll show all)")

		if (currentTopics.region == "" && currentTopics.country == "" && currentTopics.topics.length == 0){
			// there are no updates to the query (and no need to display a link)
		} else {
			tagCloud += '<div class="voa__filter-list__tag permalink"><a href="' + permalink + '" title="Open permalink for current filter.">&nbsp;</a></div>';
		}

		$("#filterList").append().html(tagCloud);


		hideSources();
		$(".source" + sort).removeClass("hide").each(function(){
			var temp = $(this).attr('class');
			temp = temp.split(" ");
			relatedTagsArray = relatedTagsArray.concat(temp);
		})

		relatedTagsArray = relatedTagsArray.filter(Boolean)

		// These are the tags that have additional overlaps
		var relatedTagsSet = new Set(relatedTagsArray);
		logger("relatedTagsSet:")
		logger(relatedTagsSet);

		relatedTagsArray = Array.from(relatedTagsSet)

		var overlappingTags = "";
		if (currentTopics.topics.length > 0){
			logger("Highlighting the overlapping tags");
			for (var i = 0; i < relatedTagsArray.length; i++){
				overlappingTags += "#tag_"+relatedTagsArray[i];
				if (i < relatedTagsArray.length - 1){
					overlappingTags += ", "
				}
			}
			$(".voa__tags.cloud").removeClass("overlap");
			$(overlappingTags).addClass("overlap");

		} else {
			logger("resetting all tags")
			$(".voa__tags.cloud").removeClass("overlap");
		}





		$("body, html").animate({ scrollTop: 0 }, 500);

		countEntries()
	}


	// Submit button for the text input
	$("#mySubmit").click(function(){
		submitTags();
	})

	// Add eventListener for the "enter" key on the text input
	$("input#topicInput").on('keyup',function(e) {
		if(e.keyCode == 13) {
			submitTags();
		};
	});



	function submitTags(){
		var tag = document.getElementById('topicInput').value;

		$(".voa__search-panel").removeClass("show");

		logger("validateTag(" + tag + ")")

		tag = tag.replace(/\s/g, '');
		tag = tag.toLowerCase();
		topics__array = tag.split(",");
		logger(topics__array);

		currentTopics.topics = [];//resetting

		for (var m = 0; m < topics__array.length; m++ ){
			var tempCheck = false;
			
			if ( !topicsDictionary[topics__array[m] ]){
				tempCheck = true;
			}
			if (!tempCheck){
				currentTopics.topics.push(topics__array[m]);

				$("#topicInput").val('');
				$(".voa__search-panel").removeClass("show");

			} else {
				console.log("something wrong with the keyword '" + topics__array[m] + "'");
			}
		}
		updateSort();


		// close all autocomplete lists in the document
		var autocompleteList = $(".autocomplete-items");
		for (var i = 0; i < autocompleteList.length; i++) {
			autocompleteList[i].parentNode.removeChild(x[i]);
		}

	}



	// ========================================================
	// |  Remove this tag from the list of tags in the sort.  |
	// ========================================================

	$('#filterList').on('click', 'a.close-tag', function() {

		var tagName = $(this).parent().text();
		logger("Trying to remove/close this tag: " + tagName);
		$(this).parent().remove();


		// remove the tag from currentTopics object
		if (currentTopics.region == tagName){
			currentTopics.region = "";
		} else if (currentTopics.country == tagName){
			currentTopics.country = "";
		} else {
			tagName = tagName.toLowerCase();
			tagName = tagName.replace(/\s/g, '');

		}
		for (var i = 0; i < currentTopics.topics.length; i++){
			if (currentTopics.topics[i] == tagName){
				currentTopics.topics.splice(i, 1); 
			}
		}

		// Rerun the sort with updated query
		updateSort();

		return false;
	});



	// =======================
	// |  Footer navigation  |
	// =======================

	function updateTab(tab, section){
		if (tab == "#showSaved"){
			showSourcesByID();
		} else if(currentTab == "#showSaved"){
			$(".source" ).removeClass("hide");
			$("body, html").animate({ scrollTop: 0 }, 500)
			$("#filterList").html("");
			countEntries();
		}

		//Updat the selected tab
		currentTab = tab;
		$(".voa__footer-nav__toggle li a").removeClass("current");
		$(currentTab).addClass("current");

		// reset the panel content
		$(".voa__content__section.show").removeClass("show");
		$(section).addClass("show");

		if (tab == "#showSaved"){
			// hide the panel on mobile
			$(".voa__search-panel").removeClass("show");
		} else {
			// display the panel
			$(".voa__search-panel").addClass("show");
		}

		return false;
	}

	$("#showSearch").click(function(){
		updateTab("#showSearch", "#sectionSearch")
	})

	$("#showSaved").click(function(){
		updateTab("#showSaved", "#sectionSaved");
	})

	$("#showAbout").click(function(){
		updateTab("#showAbout", "#sectionAbout");

		return false;
	})

	$("#showListMobile").click(function(){
		if(currentTab == "#showSaved" || currentTab == "#showListMobile" ){
			$(".source" ).removeClass("hide");
			$("body, html").animate({ scrollTop: 0 }, 500)
			$("#filterList").html("");

			countEntries();
		}

		currentTab = "#showListMobile";
		$(".voa__footer-nav__toggle li a").removeClass("current");
		$(currentTab).addClass("current");

		$(".voa__search-panel").removeClass("show");
	})




	// =======================================
	// |  Add/remove classes after resizing  |
	// |  to reset the styles.               |
	// =======================================

	function resized(){
		logger("resized();")
		windowSize = window.innerWidth;;

		if (windowSize >= 780){
			if (currentTab == "#showListMobile"){
				currentTab = "#showSearch";

				$(".voa__content__section.show").removeClass("show");
				$("#sectionSearch").addClass("show");
				$(".voa__search-panel").addClass("show");

				$(".voa__footer-nav__toggle li a").removeClass("current");
				$("#showSearch").addClass("current");
			}
		}
	}

	$(window).resize(resized);
	resized();




	// =======================================================
	// |  Add gesture support to close the panel (on mobile) |
	// =======================================================
	var myElement = document.getElementsByClassName("voa__search-panel")[0];
	var mc = new Hammer(myElement);

	mc.on("swipeleft", function(ev) {
		if (ev.type == "swipeleft"){
			$(".voa__search-panel").removeClass("show");
		}
	});




	// ====================================
	// |  Sorting the tag cloud by count  |
	// |  (in descending order)           |
	// ====================================

	$("#tagCloudLabel").click(function(){
		sortTagCloud();
	})

	function sortTagCloud(){
		var divList = $(".voa__tags.cloud");
		divList.sort(function(a, b){
			return $(b).data("count") - $(a).data("count")
		});
		$("#tagCloud").html(divList);
	}

	// Display/hide the tag cloud list of tags
	$("#toggleTagCloud").click(function(){
		$("#tagCloudContainer").toggleClass("show");
		$("#showTagCloud").toggleClass("show");
		$("#hideTagCloud").toggleClass("show");

		return false
	})

});

// After everything has loaded, turn off the skeleton view and display the cards.
$(window).on("load", function() {
	$(".voa__data-source-list.skeleton").addClass("hide");
	$(".voa__data-source-list.content").removeClass("hide");
	$("#initialInstructions").addClass("show");

	countEntries();
});
