// Papa Parse for parsing CSV Files
var Papa = require('papaparse');
// HTTP and FS to enable Papa parse to download remote CSVs via node streams.
var https = require('https');
var fs = require('fs');



/*

After several recent changes to Google sheets API, 
my new approach involves using Papa Parse to download the CSV and aggregate it into a single JSON object

There's an example using Papa Parse with Node here:

https://github.com/mholt/PapaParse/issues/440

Minor drawback is that you have to record the unique GID for each sheet.


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

NOTE: This code is borrowed from a project that uses different sheets for different language translations



// HOW TO RUN IT

From the `/download-data/` directory, run `npm install` (or `npm update`).

Then run `node app.js`

This will bake out the data defined in Google spreadsheet specified in `spreadsheets[i].url`.

The resulting JSON will be saved in  `/[location]/[name].json`




TO DO: merge VOA datasets with the main datasets

===================================================================================
*/



var spreadsheets = [
	{"name": "datasets", "id": "2PACX-1vTyyWj6reapmWKRmpqxCLKOoN6vxR_ONNgJkgOSk-zUCLEE-uk78OuYCXERKLUJWzyuUu0S-xgBwZ74", "location": "../_data/",
		'languages': [
			{
				'language': 'Items',
				'gid': 0
			},
			{
				'language': 'Tags',
				'gid': 1158508341
			},
			{
				'language': 'Regions',
				'gid': 665068264
			},
			{
				'language': 'Countries',
				'gid': 1796809700
			}
		]
	}/*,
	{"name": "voa", "id": "2PACX-1vQJxU2yRc7aBgXqkvCSwbfFOgLA93tekJPdgTakShTdMa-LQNHR0Sl26XaAe0q3JRHzy8dbt4LWqdxe", "location": "../_data/",
		'languages': [
			{
				'language': 'Items',
				'gid': 0
			}
		]
	}*/
];


const papa = require("papaparse");
const request = require("request");

const options = {header: true};//, encoding: "UTF-8"};


var spreadsheetData = {};


const storeData = (data, path) => {
	try {
		//console.log("Saving: " + path);
		fs.writeFileSync(path, JSON.stringify(data));
	} catch (err) {
		console.error(err)
	}
}


var currentSheetNumber = 0;
var currentLanguageNumber = 0;
function downloadLanguage(){
	if (currentSheetNumber < spreadsheets.length){

		var numberOfLanguages = spreadsheets[currentSheetNumber].languages.length;

		if (currentLanguageNumber < numberOfLanguages){

			var spreadsheetID = spreadsheets[currentSheetNumber].id;
			var languageGID = spreadsheets[currentSheetNumber].languages[currentLanguageNumber].gid;
			var language = spreadsheets[currentSheetNumber].languages[currentLanguageNumber].language;

			var feedURL = 'https://docs.google.com/spreadsheets/d/e/' + spreadsheetID + '/pub?gid=' + languageGID + '&single=true&output=csv';
			var data = [];

			const parseStream = papa.parse(papa.NODE_STREAM_INPUT, options);

			const dataStream = request
				.get(feedURL)
				.pipe(parseStream);

			parseStream.on("data", chunk => {
			    data.push(chunk);
			});

			dataStream.on("finish", () => {
				//console.log(data);
				//console.log(data.length);

				spreadsheetData[language] = data;// data[0]; 
				// console.log("\n\nCONFIG DATA OBJECT");
				// console.log(spreadsheetData);
				currentLanguageNumber++;

				downloadLanguage();
			});
		} else {

			var spreadsheetName = spreadsheets[currentSheetNumber].name;
			var location = spreadsheets[currentSheetNumber].location;

			//console.log(spreadsheetData);

			console.log("\n\nSaving the " + spreadsheetName + " data")
			console.log("(Saving the )" + location + spreadsheetName + ".json\n\n")
			storeData(spreadsheetData, location + spreadsheetName + ".json");

			currentSheetNumber++;
			currentLanguageNumber = 0;
			downloadLanguage();
		}
	} else {
		console.log("\n\nDONE\n\n");
	}

}


downloadLanguage();