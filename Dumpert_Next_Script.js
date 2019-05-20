// ==UserScript==
// @name     Dumpert Next
// @version  2
// @description  A button for dumpert.nl to go to the next or previous video.
// @author       ZIMONH
// @include  https://www.dumpert.nl/*
// @grant    none
// ==/UserScript==
/*by: ZIMONH src: https://github.com/zimonh/Dumpert-Next
License: https://creativecommons.org/licenses/by-nc-sa/4.0/*/


// ==UserScript==
// @name     Dumpert Next
// @version  2
// @description  A button for dumpert.nl to go to the next or previous video.
// @author       ZIMONH
// @include  https://www.dumpert.nl/*
// @grant    none
// ==/UserScript==
/*by: ZIMONH src: https://github.com/zimonh/Dumpert-Next
License: https://creativecommons.org/licenses/by-nc-sa/4.0/*/

(() => {
  

	const DumpertNext = {


		TESTWATERS: 1,

		log(){
			console.log('DumpertNext:', ...arguments);
		},


		createArticleObjectArray(html, origin, testWaters){

			const array = [];
			const temp = document.createElement('div');
			temp.innerHTML = html;
			const movies = temp.querySelectorAll('.dumpthumb');

			for(let movie of Array.from(movies)){

				const item = {
					url:movie.getAttribute("href"),
					img:movie.querySelector('img').getAttribute("src"),
					title:movie.querySelector('.details h1').innerHTML,
					date:movie.querySelector('.details date').innerHTML,
					description:movie.querySelector('.details p.description').innerHTML,
					origin};

				array.push(item);

			}

			return array;

		},

		getMovieUniqueId(string){

			const regex = /mediabase\/([0-9]+)/g;
			return regex.exec(string)[1];

		},



		dumpertNextButtonHTML(data, direction){

			DumpertNext.log('dumpertNextButtonHTML: ', data, direction);

			return `<div style="display: inline-block;"><h1>${direction}</h1><a href="${data.url}" class="dumpthumb" title="${data.title}">
				<img src="${data.img}" alt="${data.title}" title="${data.title}" width="100" height="100">
				<span class="foto"></span>
				<div class="details">
					<h1>${data.title}</h1>
					<date>${data.date}</date>
					<p class="stats">${data.origin}</p>
					<p class="description">${data.description}</p>
				</div>
			</a></div>`;

		},

		allmovies:'',


		done(){

			DumpertNext.allmovies = JSON.parse(localStorage.getItem("fast_load_allmovies"));

			DumpertNext.log('done: ', DumpertNext.allmovies);

			const currentMovie = DumpertNext.allmovies.findIndex(e => DumpertNext.getMovieUniqueId(e.url) === DumpertNext.getMovieUniqueId(window.location.href));
			let result = '';

			if(currentMovie !== 0) result += DumpertNext.dumpertNextButtonHTML(DumpertNext.allmovies[currentMovie-1],'Back');
			result += DumpertNext.dumpertNextButtonHTML(DumpertNext.allmovies[currentMovie+1],'Next');

			const buttons = document.createElement('div');
			buttons.innerHTML = result;
			buttons.style.display = 'block';
			document.querySelector('#bekijkook').before(buttons);

		},


		allmovies_local: [],


		fetcher(nr, testWaters = 0){
	        DumpertNext.log('page: ' + nr, 'test waters: ', testWaters);

			const origin = "https://www.dumpert.nl/" + nr;

			fetch(origin)
			.then(data => data.text())
			.then(html => DumpertNext.createArticleObjectArray(html, origin, testWaters))
			.then(result => {
				if(testWaters) DumpertNext.log('Up to date:', result[0].url === JSON.parse(localStorage.getItem("fast_load_allmovies"))[0].url);

				if(
					testWaters &&
					DumpertNext.getMovieUniqueId(result[0].url) ===
					DumpertNext.getMovieUniqueId(JSON.parse(localStorage.getItem("fast_load_allmovies"))[0].url)
				){
	                DumpertNext.log('Triggerd done()');
	                DumpertNext.done();
				}else{
	                DumpertNext.log('parse Dumpert Pages:', nr);
	                if(nr < 20){

	                    DumpertNext.allmovies_local.push(...result);
	                    nr++;
	                    DumpertNext.fetcher(nr);

	                }else if(nr === 20){

	                    localStorage.setItem("fast_load_allmovies", JSON.stringify(DumpertNext.allmovies_local));
	                    DumpertNext.done();

	                }
	            }
			});
		}
	};


	if (localStorage.getItem("fast_load_allmovies") === null){
	    DumpertNext.log('Nothing Stored');
		DumpertNext.fetcher(1);
	}else{
	    DumpertNext.log('Something Stored');
	    DumpertNext.fetcher(1, DumpertNext.TESTWATERS);
	}

})();









