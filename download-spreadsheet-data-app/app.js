const request = require('request');
const https = require('https');
const fs = require('fs');
//const _ = require('underscore');


/*
===================================================================================

// sample google sheets json endpoint:
// https://spreadsheets.google.com/feeds/cells/1W1aBUgNp2LtCOgLMtfGmI77T-yuC30fzgWcp3KNUl4g/2/public/full?alt=json;

The google sheets endpoint isn't structured in a readable key/value format.

I'm looping over the data to create custom JSON that maps the cell values to the keys in the first row.
Because my spreadsheets generally use multiple sheets/tabs for languages, the resulting JSON 
has a separate object nested for each sheet.


The resulting JSON looks like this:

{
	"sheet 1 (e.g. 'english') ": [
		{
			row 1 data
		},
		{
			row 2 data
		}...
	],
	"pashto": [
		{
			row 1 data
		},
		{
			row 2 data
		}...
	]
}

// HOW TO RUN IT

From the directory, run `npm install` (or `npm update`).

Then run `node app.js`

This will bake out the data defined in Google spreadsheet specified in `spreadsheets[i].url`.

The resulting JSON will be saved in  `/[location]/[name].json`

NOTE: Because this is a larger spreadsheet (and an inefficient way of creating key/value pairs for JSON), the download will probably take 20+ minutes.

... also, currently doesn't include VOA datasets.

===================================================================================
*/

var destination = "";// defined in `spreadsheets` array. // "../_data/testData.json";
var googleKey = "";

// var sheets = ["Items", "Tags", "Countries", "Regions"];
// Creating an array of spreadsheets to loop over and save out. 
var spreadsheets = [
	{"name": "datasets", "url": "1JiHp4bxS_KZY3Gwv4h2Ds65UrOO5sHgdg3xsxkENNys", "location": "../_data/"}
];

var currentSpreadsheet = 0;// from spreadsheets array


var currentSheetNumber = 1; //tracking which sheet number (language) we're on
var numberOfSheets = 4; //currently manually restricting this, but we could also just wait for a failure.
var countRows = true; // on larger sheets, display the current row being processed;

let options = {json: true};

var timeStartInitial = Date.now();



var spreadsheetData = {};

function fetchSheet(){
	// Changing `currentSheetNumber`, changes the tab (and in this case, the language);
	var url = 'https://spreadsheets.google.com/feeds/cells/' + googleKey + '/' + currentSheetNumber + '/public/full?alt=json';

	// each language tab/sheet is a different request
	request(url, options, (error, res, body) => {

		if (error) {
			return  console.log(error)
		};

		if (!error && res.statusCode == 200) {
			// do something with JSON, using the 'body' variable
			// example: console.log(body.feed);

			var keyValues = "";
			var jsonStringTemp = "";

			// var maxColumns = body.feed["gs$colCount"]["$t"] * 1; // Includes empty columns :/
			var maxColumnsCalculated = 0; //better off calculating this.

			// There may be empty rows, but we'll check for them.
			var maxRows = body.feed["gs$rowCount"]["$t"] * 1;


			// Create the placeholder array for this tab/sheet (in our case, language)
			spreadsheetData[body.feed.title["$t"]] = [];
			console.log("\n\nCurrent sheet: " + body.feed.title["$t"] + " (sheet " + currentSheetNumber + ")");
			var countRows = true;

			// Loops through the rows
			for (var k = 1; k <= maxRows; k++ ){


				// create a string of the first row of the spreadsheet with placeholders ("col23x") for the cell value
				// these are replaced with actual data when available
				// ... or at the end, we loop through and replace any of the unchanged "col32424x" with empty strings.
				if (k == 1){

					// we'll save keyValues and then reuse them for each row. 
					keyValues = "{";
					for (var i = 0; i < body.feed.entry.length; i++ ){
						if (body.feed.entry[i]["gs$cell"].row == k){

							if (i > 0){
								// every row in the json needs a comma at the end except the last row.
								keyValues += ', ';
							}

							// Add the current key with a placeholder value that will be replaced later.
							keyValues += '"' + body.feed.entry[i].content["$t"] + '": col' + body.feed.entry[i]["gs$cell"].col + "x";
							
							// If there are empty columns, it throws off the value of maxColumns.
							// To avoid that, we'll only calculate the max number of columns in the header.
							// I think we have to multiply by 1 in order to convert the string into a number
							if ( body.feed.entry[i]["gs$cell"].col * 1 >= maxColumnsCalculated ){
								maxColumnsCalculated = body.feed.entry[i]["gs$cell"].col;
							}

						}
					}
					keyValues += "}";

				} else {

					jsonStringTemp = keyValues;

					// Time how long processing the row takes.
					var startTime = Date.now();


					// Replace the placeholder cells ("col24x") with actual cell data.
					//var initialStart = 1; // ...might be be faster if the initial "m" value changed each time we looped through it, to remember our place?
					for (var i = 0; i < body.feed.entry.length; i++ ){

						for (var m = 1; m < body.feed.entry.length; m++ ){
							if (body.feed.entry[m]["gs$cell"].row == k && body.feed.entry[m]["gs$cell"].col == body.feed.entry[i]["gs$cell"].col){

								// Escape characters that might break the JSON
								var tempVar = JSON.stringify(body.feed.entry[m].content["$t"]);
								jsonStringTemp = jsonStringTemp.replace("col" + body.feed.entry[i]["gs$cell"].col + "x", tempVar);
								//initialStart++;
								break;

							}
						}

					}

					// replace the cells with empty values with an empty string
					var checkEmptyCounter = 0;

					//for (var p = 0; p <= maxColumns; p++ ){
					for (var p = 0; p <= maxColumnsCalculated; p++ ){
						var substring = "col" + p + "x";

						// count the number of empty cells in the row
						// eventually we'll check to see if the entire row is empty
						if( jsonStringTemp.includes(substring) ){
							checkEmptyCounter++;
						}

						jsonStringTemp = jsonStringTemp.replace(substring, '""');
					}


					// Display the first row of data as way of checking it.
					if (k == 2){
						console.log("\nHere's the first row of data as JSON:\n")
						console.log(JSON.parse(jsonStringTemp))
					}

					if (countRows){

						// Create an estimate for how long it will take to finish this sheet
						// not important for small/medium-sized sheets, but large sheets ...
						var endTime = Date.now();
						var time = endTime - startTime;
						var estimatedTime = time * (maxRows - k);

						if (estimatedTime > 1000){
							console.log("\tCurrent row: " + k);
							console.log('\tTime: ' + time + "ms");
							console.log('\tEstimated time remaining:: ' + timePretty(estimatedTime) );//timePrettyMinutes + " minutes " + timePrettySeconds + " seconds\n");
						} else {
							countRows = false;
						}
					}


					if (checkEmptyCounter != maxColumnsCalculated){
						// Add the data for the current language.
						spreadsheetData[body.feed.title["$t"]].push(JSON.parse(jsonStringTemp))
					} else {
						// if the row is empty, stop building the json.
						console.log("\nRow " + k + " is empty. Closing this sheet.\n\n");
						console.log("---------------------------------------------\n\n")
						break;
					}

				}

			}

			currentSheetNumber++;
			fetchSheetCheck();
		} else {
			// if there are too many sheets requested, it'll output at the end.
			saveSpreadsheetData();
		}
	});

}



// Utility time functions for displaying time in "XX minutes YY seconds" format
function elapsedTime(start, end){
	var time = end - start;	
	return timePretty(time);
}

function timePretty(time) {
	var timePrettyMinutes = Math.floor(time / 1000 / 60);
	var timePrettySeconds = Math.floor(((time/1000/60/60) * 60 - timePrettyMinutes) * 60);

	if (timePrettyMinutes > 0){
		return timePrettyMinutes + " minutes " + timePrettySeconds + " seconds\n"
	} else if(timePrettySeconds > 1) {
		return timePrettySeconds + " seconds\n"
	} else {
		return time + " ms"
	}
}




function saveSpreadsheetData(){
	//console.log(spreadsheetData); // Display all of the JSON data.

	var timeEndFinal = Date.now();
	console.log("Total time: " + elapsedTime(timeStartInitial, timeEndFinal));

	storeData(spreadsheetData, destination);
}

// Check if there are still more languages, or if we're done, write the JSON
function fetchSheetCheck(){
	if (currentSheetNumber <= numberOfSheets){
		fetchSheet();
	} else {
		saveSpreadsheetData();
	}
}




// function for writing the .json files
const storeData = (data, path) => {
	try {
		console.log("Saving: " + path);
		fs.writeFileSync(path, JSON.stringify(data));

		currentSpreadsheet++;

		currentSheetNumber = 1;

		numberOfSheets = 4; // currently manually restricting this, but we could also just wait for a failure.
		countRows = true;   // on larger sheets, display the current row being processed;

		timeStartInitial = Date.now();
		spreadsheetData = {};
		loopOverAllSpreadsheets();
	} catch (err) {
		console.error(err)
	}
}



function loopOverAllSpreadsheets(){
	if (currentSpreadsheet < spreadsheets.length){

		//destination = "../_data/testData.json";
		destination = spreadsheets[currentSpreadsheet].location + spreadsheets[currentSpreadsheet].name + ".json";
		googleKey = spreadsheets[currentSpreadsheet].url;

		console.log("\n\n============================================")
		console.log("\n\nCURRENT SPREADSHEET: " + spreadsheets[currentSpreadsheet].name)
	
		fetchSheetCheck();
	} else {
		console.log("\n\n============================================\n\n")
		console.log("There aren't any more sheets\n\n")
		console.log("\t###\n\n")
	}
}

loopOverAllSpreadsheets();


/*
//There used to be a way of merging the VOA datasets with Data is Plural data...

//Load data from google spreadsheet and write it to JSON files.

function fetchDataVOA(){
	loadSheetsVOA("1iGB4SXipfnw03tKBhtap8pflknY58dDe2MmCNzs0GZM", location);

	function loadSheetsVOA(url, location){

		console.log('\n\nloading VOA spreadsheet data: ');

		var spreadsheet_url = url;

		var myData;


		function loadSheetVOA(data, tabletop) {
			console.log("loading data from VOA spreadsheet");

			loadedSectorData = data.Items.elements;

			//Write updated data to .JSON files and update global variables.
			function writeJSON(){
				console.log("trying to write VOA spreadsheet: ");

				var newJson = _.extend(dataIsPlural, loadedSectorData);
				newJson = _.sortBy(newJson, 'edition');
				// Save the data for baking into the HTML
				//var filename = '../_data/' + sheetName + '.json';

				var filename = location + 'Items.json';
				const content = JSON.stringify(newJson);

				fs.writeFileSync(filename, content);

			}
			writeJSON();
		};


		var options = {
			key: spreadsheet_url,
			callback: loadSheetVOA
		};

		Tabletop.init(options);

	}

}

*/