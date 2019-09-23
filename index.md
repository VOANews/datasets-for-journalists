---
layout: default
date: 2019-09-18
---
{% assign site_info = site.site_info__object.english %}
{% assign current_language = "english" %}
{% assign random = site.time | date: "%s%N" %}


{% assign dataSources = site.data.Items %}
{% assign dictionaryTags = site.data.Tags %}
{% assign countries = site.data.Countries %}
{% assign regions = site.data.Regions %}




<script type="text/javascript">
{% assign tagDictionaryTemp = '{' %}
{% for tag in dictionaryTags %}
	{% assign tagCondensed = tag.tag | downcase | replace: " ", "" %}
	{% assign tagDictionaryTemp = tagDictionaryTemp | append: '"' | append: tagCondensed | append: '": '%}
	{% assign tagDictionaryTemp = tagDictionaryTemp | append: '"' | append: tag.tag | append: '"'%}
	{% unless forloop.last %}{% assign tagDictionaryTemp = tagDictionaryTemp | append: ', ' %}{% endunless %}
{% endfor %}
{% assign tagDictionaryTemp = tagDictionaryTemp | append: '}' %}

// Creating a dictionary to help map simplified names to display names e.g. "socialmedia" to "social media"
var topicsDictionary = {{tagDictionaryTemp}};

</script>





<section class="voa__section black" style="overflow-x: hidden; padding-top: 40px;">

<div class="voa__grid__full" style="position: relative; ">



	<div class="voa__search-panel__container">

		<div class="voa__search-panel__grid-full">

			<div class="voa__search-panel" aria-live="polite">

				<div id="sectionSearch" class="voa__content__section voa__grid__full show">

					<div class="voa__grid" style="padding-bottom: 60px;">

						<div style="padding-bottom: 20px; border-bottom: 1px dotted #CCC;">							
							<p style="font-weight: bold;">{{ site_info.project_description }}</p>

						</div>


{% assign regionString = "" %}
{% for entry in dataSources %}
	{% assign regionString = regionString | append: entry.region | append: "," %}
{% endfor %}
{% assign regionArray = regionString | split: ","| compact | uniq | sort %}


{% assign countryString = "" %}
{% for entry in dataSources %}
	{% assign countryString = countryString | append: entry.country | append: "," %}
{% endfor %}
{% assign countryArray = countryString | split: ","| compact | uniq | sort  %}


						<div class="voa__grid__full">

							<h4 style="margin-bottom: 5px;">Select a region</h4>

							<div class="voa__selection-region">

								<select id="dropdown" name="dropdownmenu" size="1" style="margin: 0 auto 20px auto; display: block; position: relative; border-color: #CCC; font-size: 16px; height: 29px; padding: 5px; width: 100%;">
									<option value="showAll" data-type="showAll">Show all</option>

{% assign tempCounter = 0 %}

{% for source in dataSources %}
	{% assign tagRegions = source.region %}
	{% for tagRegion in tagRegions %}
		{% if tagRegion == "global" %}
			{% assign tempCounter = tempCounter | plus: 1 %}
		{% endif %}
	{% endfor %}

{% endfor %}

{% if region != "" %}<option value="global" data-type="region">global <span class="voa__tag__count">({{ tempCounter}})</span></option>{% endif %}


{% for region in regionArray %}
	{% if region != "global" %}
		{% assign tempCounter = 0 %}
		{% assign currentTagRegion = region %}

		{% for source in dataSources %}
			{% assign tagRegions = source.region %}
			{% for tagRegion in tagRegions %}
				{% if tagRegion == currentTagRegion %}
					{% assign tempCounter = tempCounter | plus: 1 %}
				{% endif %}
			{% endfor %}

		{% endfor %}

		{% if region != "" %}<option value="{{ region }}" data-type="region">{{ region }} <span class="voa__tag__count">({{ tempCounter}})</span></option>{% endif %}
	{% endif %}
{% endfor %}

<option value="" disabled="disabled">─────────────</option>

{% for country in countryArray %}
	{% if country != "" %}
		{% assign tempCounter = 0 %}
		{% assign currentTagRegion = country %}

		{% for source in dataSources %}
			{% assign tagRegions = source.country %}
			{% for tagRegion in tagRegions %}
				{% if tagRegion == currentTagRegion %}

					{% assign tempCounter = tempCounter | plus: 1 %}
				{% endif %}
			{% endfor %}

		{% endfor %}

		<option value="{{ country }}" data-type="country">{{ country }} <span class="voa__tag__count">({{ tempCounter}})</span></option>
	{% endif %}
{% endfor %}

								</select>

							</div>
							
						</div>


						<div class="voa__grid__full" style="margin-bottom: 20px;">
							<h4 style="">Sort by tags</h4>

							<form autocomplete="off" action="">
								<div class="autocomplete">
									<input id="topicInput" type="text" name="topic" placeholder="tags" autocapitalize="none">
								</div>

								<a id="mySubmit" class="submitButton" title="Search"></a>
							</form>


							<a id="toggleTagCloud" href="#"><span id="showTagCloud" class="show">Show</span><span id="hideTagCloud">Hide</span> tag list</a>




							<div id="tagCloudContainer" class="voa__tag-cloud__container">
								
								<h4 id="tagCloudLabel" style="margin: 40px 0 10px 0;width: 49%; display: inline-block;">Tags</h4>
								<div id="countSelectionCloud" style="font-family: Arial, sans-serif; font-size: 15px; text-align: right; width: 49%; display: inline-block;"></div>

								<div class="voa__grid__full">

									<div id="tagCloud">

	
{% for entry in dictionaryTags %}

	{% assign tempCounter = 0 %}
	{% assign currentTag = entry.tag %}
	{% assign currentTagSimplified = currentTag | replace: " ", "" | downcase %}

	{% for source in dataSources %}
		{% assign tags = source.tag | split: ", " | sort %}
		{% for tag in tags %}
			{% if tag == currentTag %}

				{% assign tempCounter = tempCounter | plus: 1 %}
			{% endif %}
		{% endfor %}

	{% endfor %}

	<div style="display: inline-block;"><a id="tag_{{currentTagSimplified}}" class="sortSources voa__tags cloud" href="{{ currentTag | replace: ' ', '' }}" data-count="{{ tempCounter }}">{{ currentTag }} <span class="voa__tag__count">({{ tempCounter}})</span></a></div>

{% endfor %}

									</div>

								</div>

							</div>

							<div style="border-top: 1px dotted #CCC; margin-top: 30px;">

{% assign sorted-posts = site.posts | where: "slug","instructions" %}
{% for post in sorted-posts %}
								<h4>{{ post.title | default: "Search tips" }}</h4>
								{{ post.content }}
{% endfor %}

							</div>

						</div>

					</div>

				</div>

				<div id="sectionSaved" class="voa__content__section voa__section__saved-sources">
					<div class="voa__grid">
						<h4 style="margin-top: 0;">Saved datasets </h4>

						<div id="warningSavedSearch" style="background-color: #FFF; border-radius: 4px; box-shadow: 0 0 4px rgba(20,20,20,.2); margin-top: 20px; padding: 15px 20px;"><p>You can save a data set for future reference by clicking the "+" at the top right-hand corner of the dataset cards.</p>
							
						</div>
					</div>
					<ul id="savedSources" class="voa__saved__sources"></ul>

					<div class="voa__grid" style="margin-top: 40px;">
						<a id="shareSaved" href="#" class="voa__share-saved" title="Share or bookmark this collection"></a>
						<span style="font-family: Arial, sans-serif; ">Share or bookmark this collection</span>

					</div>
				</div>


				<div id="sectionAbout" class="voa__content__section voa__section__saved-sources">
					<div class="voa__grid" style="padding-top: 20px; padding-bottom: 60px;">

{% assign sorted-posts = site.posts | where: "slug","about" %}
{% for post in sorted-posts %}
						<h3>{{ post.title | default: "About this project" }}</h3>
						{{ post.content }}
{% endfor %}

					</div>
				</div>

			</div>



			<nav class="voa__footer-nav__container">
				<div class="voa__footer-nav voa__grid__full">
					<ul class="voa__footer-nav__toggle">
						<li><a id="showSearch" href="javascript:void(0);" style="background-image: url(img/icons_search.png);">Search</a></li><!--
						--><li><a id="showListMobile" class="current" href="javascript:void(0);"  style="background-image: url(img/icons_list.png);">List</a></li><!--
						--><li><a id="showSaved" href="javascript:void(0);" style="background-image: url(img/icons_saved.png);">Saved<span id="savedCounter" class="voa__saved__counter"></span></a></li><!--
						--><li><a id="showAbout" href="about.html" style="background-image: url(img/icons_about.png);">About</a></li><!--
						-->
					</ul>
				</div>
			</nav>



		</div>
	</div>




	<div class="voa__grid__full" style="border-right: 1px solid #E5E5E5;">
		<div class="voa__filter-list__container">
			<div class="voa__grid__full" style="position: relative;">
				
				<div id="filterList" class="voa__filter-list">
					<div id="initialInstructions">Click on a <div class="voa__filter-list__tag">tag</div><div class="voa__filter-list__tag">region</div> or <div class="voa__filter-list__tag">country</div> to filter the list of datasets:</div>
				</div>
				<div id="countSelection" class="voa__selection__counter"></div>

			</div>
		</div>




		<div class="voa__grid" style="padding-top: 20px; padding-bottom: 60px;">
			<div class="voa__data-source-list skeleton"><!--

			--><div id="fakeCard" class="source voa__loading-card">
					<div class="voa__loading-card__label"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__paragraph loading"></div>
					<div class="voa__loading-card__links"></div>
					<div class="voa__loading-card__links"></div>
				</div><!--


			--><div id="fakeCard" class="source voa__loading-card">
					<div class="voa__loading-card__label"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__paragraph loading"></div>
					<div class="voa__loading-card__links"></div>
					<div class="voa__loading-card__links"></div>
				</div><!--

			--><div id="fakeCard" class="source voa__loading-card">
					<div class="voa__loading-card__label"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__paragraph loading"></div>
					<div class="voa__loading-card__links"></div>
					<div class="voa__loading-card__links"></div>
				</div><!--


			--><div id="fakeCard" class="source voa__loading-card">
					<div class="voa__loading-card__label"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__paragraph loading"></div>
					<div class="voa__loading-card__links"></div>
					<div class="voa__loading-card__links"></div>
				</div><!--

			--><div id="fakeCard" class="source voa__loading-card">
					<div class="voa__loading-card__label"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__paragraph loading"></div>
					<div class="voa__loading-card__links"></div>
					<div class="voa__loading-card__links"></div>
				</div><!--
			--><div id="fakeCard" class="source voa__loading-card">
					<div class="voa__loading-card__label"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__headline loading"></div>
					<div class="voa__loading-card__paragraph loading"></div>
					<div class="voa__loading-card__links"></div>
					<div class="voa__loading-card__links"></div>
				</div>
		</div>
		<div class="voa__data-source-list content hide" aria-live="polite"><!--

	{% for source in dataSources reversed %}
		{% assign tags = source.tag | split: ", " | sort %}
			--><div id="source{{ source.id }}" class="source {{ source.region | replace: ' ', '' }} {{ source.country | replace: ' ', '' }} {% for tag in tags %}{{ tag | replace: ' ', '' | downcase }} {% endfor %}{{ source.source | replace: " ", "" }} " {% if source.update != "" %}style="padding-bottom: 0;" {% endif %}>
		{% assign hattipLink = "" %}
		{% if source.hattips != "" %}{% assign hattipLink = "<a href='" | append: source.hattips | append: "'>[h/t" %}{% endif %}
		{% assign links = source.links | split: " " %}
				<h3 class="voa__label small region"><a class="sortSources region" href="{{ source.region | replace: ' ', '' }}">{{ source.region }}</a> {% if source.country != "" %}> <a class="sortSources country" href="{{ source.country | replace: ' ', '' }}">{{ source.country }}</a>{% endif %}</h3>
				<h3 class="voa__source__title" style="{% if source.position=='1' %}font-size: 36px;{% else %} font-size: 24px;{% endif %}">{{ source.headline }}</h3>
				<a href="?id=source{{ source.id }}" class="voa__source__link" title="export link"></a>
				<a href="#" class="voa__source__corner" title="Save this data source"></a>
				<p>{{ source.text | replace: "[h/t", hattipLink }}{% if source.hattips != "" %}</a>{% endif %} — {{ source.source}}: {{ source.edition | date: "%B %-d, %Y" }}</p>

				<p><strong>Links:</strong></p>
				<ul>{% for link in links %}<li><a href="{{ link }}" target="_blank">{{ link }}</a></li>{% endfor %}</ul>
				<p><strong>Tags:</strong> {% for tag in tags %}<a class="sortSources voa__tags" href="{{ tag | replace: ' ', '' }}">{{ tag }}</a>{% endfor %}
				</p>
				{% if source.update != "" %}<p class="update"><strong>UPDATE:</strong> {{ source.update }}</p>{% endif %}
			</div><!--
	{% endfor %}
		--></div>
		</div>
	</div>




</div>

</section>



<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
<script type="text/javascript" src="https://hammerjs.github.io/dist/hammer.js"></script>
<script src="{{ site.url_base }}/js/scripts-basic.js?{{ random }}"></script>



<script type="text/javascript">

// Experimenting with automcomplete:
// https://www.w3schools.com/howto/howto_js_autocomplete.asp

var topics = [
{% for entry in dictionaryTags %}'{{entry.tag}}',{% endfor %}
];

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}

autocomplete(document.getElementById("topicInput"), topics);

</script>