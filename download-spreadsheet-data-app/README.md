# Spreadsheet data download app #

This app is used to grab Google spreadsheet data and save it locally as a series of JSON files.

In this instance the data is stored in `_data/` for reference by Jekyll, but you could also save it in `data/` for reference by JavaScript.



### How it works ###

A Google spreadsheet provides the editable data. [The spreadsheet](https://docs.google.com/spreadsheets/d/e/2PACX-1vTyyWj6reapmWKRmpqxCLKOoN6vxR_ONNgJkgOSk-zUCLEE-uk78OuYCXERKLUJWzyuUu0S-xgBwZ74/pubhtml) has:

* 1 sheet with the data from "Data is Plural" (but with columns added for `updates`, `regions`, `country`, `tag` and `id`)
* 1 sheet with a list of the tags
* 1 sheet with a list of countries
* 1 sheet with a list of regions

I was using [Tabletop.js](https://github.com/jsoma/tabletop) to save the data to a series of JSON files. But in Aug. 2021, the Google Sheets API changed and Tabletop ceased to work. 

So I wrote a basic app that loops through Google's JSON endpoint for a spreadsheet.

NOTE: Because this is a larger spreadsheet (and an inefficient way of creating key/value pairs for JSON), the download will probably take 30+ minutes. Also, it doesn't currently merge the separate datasets list from VOA.




### Running the app ###

To run the application, download the JSON and serve the files:

* Switch to the `/download-spreadsheet-data-app/` directory
* run `$ node app.js`

~~I've set up an alternate app— `app-merge-datasources.js` — which loads the main spreadsheet, and then merges it with the secondary spreadsheet of datasets curated by VOA. It can be run by typing: `$ node app-merge-datasources.js`~~