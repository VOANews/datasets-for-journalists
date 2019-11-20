var fs = require('fs');
var Tabletop = require('tabletop');



// "sheets" refer to "sheets" in the google document
var sheets = ["Items", "Tags", "Countries", "Regions"];

var datasets = [
	{"url": "1JiHp4bxS_KZY3Gwv4h2Ds65UrOO5sHgdg3xsxkENNys", "location": "../_data/"}
	//{"name": "dataSources", "url": "1JiHp4bxS_KZY3Gwv4h2Ds65UrOO5sHgdg3xsxkENNys", "location": "../_data/"}
	//{"name": "dataSources", "url": "1JiHp4bxS_KZY3Gwv4h2Ds65UrOO5sHgdg3xsxkENNys", "location": "../data/"},
];



for (var k = sheets.length - 1; k >= 0; k-- ){
	var sheet = sheets[k];
	fetchData(sheet);
}

//Load data from google spreadsheet and write it to JSON files.
function fetchData(sheetName){
	var currentSheet = sheetName;
	var currentSheetFolder = sheetName + "/";

	for (var i = datasets.length - 1; i >= 0; i--) {
		loadSheetsAll(datasets[i].name, datasets[i].url, datasets[i].location);
	}


	function loadSheetsAll(name, url, location){

		console.log('loading spreadsheet data: ' + currentSheet);

		var spreadsheet_url = url;

		var myData;


		function loadSheet(data, tabletop) {
			console.log("loading data from spreadsheet");

			//loadedSectorData = data.Sheet1.elements;
			//loadedSectorData = data[name].elements;
			loadedSectorData = data[currentSheet].elements;

			//Write updated data to .JSON files and update global variables.
			var currentNumber = 0;
			function writeJSON(){
				console.log("trying to write: " + currentSheet);


				// Save the data for baking into the HTML
				//var filename = '../_data/' + sheetName + '.json';

				var filename = location + currentSheet + '.json';
				const content = JSON.stringify(loadedSectorData);

				fs.writeFileSync(filename, content);

			}
			writeJSON();
			console.log("Successfully exported .JSON files");
		};


		var options = {
			key: spreadsheet_url,
			callback: loadSheet
		};

		Tabletop.init(options);

	}

}
