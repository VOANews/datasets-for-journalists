# Datasets for journalists #

This project provides a sortable list of datasets that may be of use to journalists. Most of the datasets and descriptions come from Jeremy Singer-Vine’s _[Data Is Plural](https://tinyletter.com/data-is-plural)_, “a weekly newsletter highlighting useful and curious datasets”.

You can explore the project [here](https://voanews.github.io/datasets-for-journalists/): https://voanews.github.io/datasets-for-journalists/



## About this project ##


Every week I get the _Data is Plural_ email listing interesting, useful (and sometimes unusual) datasets. But then work happens and later I can't remember what datasets I'd seen or when I'd seen them. Fortunately there's an archive of links stored in a [Google spreadsheet](https://docs.google.com/spreadsheets/d/1wZhPLMCHKJvwOkP4juclhjFgqIY8fQFMemwKL2c64vk/edit#gid=0). Unfortunately it's arranged in chronological order.

We wanted to create a way of sorting, saving and sharing the datasets. We're primarily thinking about this as a resource for VOA journalists, but recognize it may have value outside of [VOA News](https://www.voanews.com).

Users can share datasets by clicking on the link icon to display a permalink with the current dataset or query. They can send links to reporters showing them the datasets about [disease](https://projects.voanews.com/data-resources/?tags=disease), historical datasets about [racism in the US](https://projects.voanews.com/data-resources/?country=USA&tags=history+race), or a specific dataset about [boy bands](http://localhost:4000/?id=source650).

Users can also save a personal list of datasets to their browser. We're storing saved datasets in the browser using [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).  







## Getting set up ##

The site is built using Jekyll, a liberal use of JQuery and data baked out from a Google spreadsheet.

On most computers (with jekyll installed), you can run `jekyll serve`.

You'll periodically need to run `bundle update`.







## The spreadsheet data ##

We're maintaining the data in a copy of the original spreadsheet and adding columns for `region`, `updates`, `country`, `topics`, `id` and `source`.

Here's the [edited spreadsheet](https://docs.google.com/spreadsheets/d/e/2PACX-1vTyyWj6reapmWKRmpqxCLKOoN6vxR_ONNgJkgOSk-zUCLEE-uk78OuYCXERKLUJWzyuUu0S-xgBwZ74/pubhtml). There are additional sheets for `Tags`, `Countries` and `Regions` which are used to help with hinting/validation on the main `Items` spreadsheet.

We've also set up a secondary spreadsheet (using the same column names) for adding additional datasets to the mix. These datasets are either from VOA News stories or of likely interest for our journalists.






## Download fresh data ##

I'm using a small node app for pulling down the data ~~via [tabletop.js](https://github.com/jsoma/tabletop)~~. 

To download the latest data, switch to the `/download-spreadsheet-data-app/` folder and run: `$ node app.js`

~~I've set up an alternate app— `app-merge-datasources.js` — which loads the main spreadsheet, and then merges it with the secondary spreadsheet of datasets curated by us. It can be run by typing: `$ node app-merge-datasources.js`~~







## License ##

The original _Data is Plural_ [spreadsheet](https://docs.google.com/spreadsheets/d/1wZhPLMCHKJvwOkP4juclhjFgqIY8fQFMemwKL2c64vk/edit#gid=0) (and this remixed project) are published under a Creative Commons Attribution - Share Alike 4.0 International [license](https://creativecommons.org/licenses/by-sa/4.0/).





## Disclaimer ##

[Voice of America](https://www.voanews.com/) does not endorse and has not verified these datasets. This page was created as a resource for journalists to find potentially useful data to help report stories. 

VOA provides trusted and objective news and information in over 45 languages to a measured weekly audience of more than 275.2 million people around the world. For over 75 years, VOA journalists have told American stories and supplied content that many people cannot get locally: objective news and information about the US, their specific region and the world. [Learn more](https://www.insidevoa.com/p/5831.html)

