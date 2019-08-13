/*by: ZIMONH src: https://github.com/zimonh/Dumpert-Next
License: https://creativecommons.org/licenses/by-nc-sa/4.0/*/
// ==UserScript==
// @name     Dumpert Next
// @version  3.1
// @description  A button for dumpert.nl to go to the next or previous video.
// @author       ZIMONH
// @include  https://www.dumpert.nl/*
// @grant    none
// ==/UserScript==
/*jshint esversion: 6 */
(() => {

	const under = document.createElement('div');
	const meta = document.querySelector('.dump-meta');
	under.innerHTML = meta;
	document.querySelector('.dump-meta').remove();
	document.querySelector('.dump-main').append(meta);
	const TEST_WATERS = true;

	const DumpertNext = {

		log(){
			console.log('DumpertNext:', ...arguments);
		},

		dumpertNextButtonHTML(data, direction){

			DumpertNext.log('dumpertNextButtonHTML: ', data, direction);

		return `<div style="display: inline-block;"><h1>${direction}</h1><a href="https://www.dumpert.nl/mediabase/${data.id.replace("_", "/")}" class="dumpthumb" title="${data.title}">
				<img src="${data.thumbnail}" alt="${data.title}" title="${data.title}" width="100" height="100">
				<span class="foto"></span>
				<div class="details">
					<h1>${data.title}</h1>
					<date>${data.date}</date>
					<p class="description">${data.description.replace(/<\/?a[^>]*>/g,'')}</p>
				</div>
			</a></div>`;
		},

		allmovies:'',

		done(){

			DumpertNext.allmovies = JSON.parse(localStorage.getItem("fast_load_allmovies"));

			DumpertNext.log('done: ', DumpertNext.allmovies);
			let regex = new RegExp(/([0-9]{6,12})[/_]([A-z0-9]+)(?:$|_|\/)/);
			let id = regex.exec(window.location.href);
			id = id[1]+'_'+id[2];

			DumpertNext.log('current id: ', id);
			const currentMovieIndex = DumpertNext.allmovies.findIndex(e => e.id === id);
			DumpertNext.log('current index: ', currentMovieIndex);
			let result = '';

			if(currentMovieIndex !== 0) result += DumpertNext.dumpertNextButtonHTML(DumpertNext.allmovies[currentMovieIndex-1],'Back');
			result += DumpertNext.dumpertNextButtonHTML(DumpertNext.allmovies[currentMovieIndex+1],'Next');

			const buttons = document.createElement('div');
			buttons.innerHTML = result;
			buttons.style.float = 'left';
			document.querySelector('.dump-meta').append(buttons);

		},

		allmovies_local: [],

		fetcher(nr, testWaters = false){
			DumpertNext.log('page: ' + nr, 'test waters: ', testWaters);
			const origin = "https://api.dumpert.nl/mobile_api/json/latest/" + nr;
			const nrOfTests = 15;
			fetch(origin)
			.then(data => data.text())
			.then(json => JSON.parse(json).items)
			.then(result => {

				//test first page
				let itemsThatAreTheSame = 0;
				if(localStorage.getItem("fast_load_allmovies") !== null){
					const localItems = JSON.parse(localStorage.getItem("fast_load_allmovies"));
					for (var i = 0; i < nrOfTests; i++){
						if(result[i] !== undefined && localItems[i] !== undefined){
							const localItemId = localItems[i].id;
							const resultItemId = result[i].id;
							if(localItemId === resultItemId){
								itemsThatAreTheSame++;
								DumpertNext.log(localItemId + ' = ' + resultItemId);
							}else{
								DumpertNext.log(localItemId + ' != ' + resultItemId);
							}
						}

					}

				}
				//result comes in...
				if( testWaters ) DumpertNext.log('Up to date:', itemsThatAreTheSame === nrOfTests);

				//all done
				if( testWaters && itemsThatAreTheSame === nrOfTests){
					DumpertNext.log('Triggerd done()');
					DumpertNext.done();

				//parse 30 pages
				}else{
					DumpertNext.log('parse Dumpert Pages:', nr);
					if(nr < 30){

						DumpertNext.allmovies_local.push(...result);
						nr++;
						DumpertNext.fetcher(nr);

					}else if(nr === 30){

						localStorage.setItem("fast_load_allmovies", JSON.stringify(DumpertNext.allmovies_local));
						DumpertNext.done();

					}
				}
			});
		}
	};

	if (localStorage.getItem("fast_load_allmovies") === null){
		DumpertNext.log('Nothing Stored');
		const startPage = 0;
		DumpertNext.fetcher(startPage);
	}else{
		DumpertNext.log('Something Stored');
		const startPage = 0;
		DumpertNext.fetcher(startPage, TEST_WATERS);
	}

})();













