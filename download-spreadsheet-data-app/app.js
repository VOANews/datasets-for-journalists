var _ = require('underscore');
var fs = require('fs');
var Tabletop = require('tabletop');
var counter = 0;
var dataIsPlural = [];


// sheet names in the google document
var sheets = ["Items", "Tags", "Countries", "Regions"];
var dataIsPluralSpreadsheet = "1JiHp4bxS_KZY3Gwv4h2Ds65UrOO5sHgdg3xsxkENNys";

var location = "../_data/";



for (var k = sheets.length - 1; k >= 0; k-- ){
	var sheet = sheets[k];
	fetchDataIsPlural(sheet);
}



//Load data from google spreadsheet and write it to JSON files.
function fetchDataIsPlural(sheetName){
	var currentSheet = sheetName;

	loadSheetsAll(dataIsPluralSpreadsheet, location);

	function loadSheetsAll(url, location){

		console.log('loading spreadsheet data: ' + currentSheet);

		var spreadsheet_url = url;

		var myData;


		function loadSheet(data, tabletop) {
			console.log("loading data from spreadsheet");

			loadedSectorData = data[currentSheet].elements;

			//Write updated data to .JSON files and update global variables.
			function writeJSON(){
				console.log("trying to write: " + currentSheet);


				// Save the data for baking into the HTML
				//var filename = '../_data/' + sheetName + '.json';

				var filename = location + currentSheet + '.json';
				const content = JSON.stringify(loadedSectorData);

				fs.writeFileSync(filename, content);


				if (currentSheet == "Items"){
					dataIsPlural = loadedSectorData;
				}
			}
			writeJSON();
			counter++;


			console.log("Successfully exported .JSON files: " + counter);

			if (counter == sheets.length ){
				console.log("DONE importing 'Data is Plural'");
				console.log("Load alternate datasets and merge them.");
				fetchDataVOA();
			}

		};


		var options = {
			key: spreadsheet_url,
			callback: loadSheet
		};

		Tabletop.init(options);

	}

}


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
