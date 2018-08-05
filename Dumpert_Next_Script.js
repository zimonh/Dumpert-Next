// ==UserScript==
// @name         Dumpert - Next
// @version      1
// @description  A button for dumpert.nl to go to the next or previous video.
// @author       ZIMONH
// @include  *://www.dumpert.nl/*
// @grant    none
// ==/UserScript==

/* by: ZIMONH src: https://github.com/zimonh/Dumpert-Next
   License: https://creativecommons.org/licenses/by-nc-sa/4.0/ */

let allmovies_local = [];
const BuildUrlArray_local = html =>{
	const temp = document.createElement('div');	temp.innerHTML = html;
	const movies = temp.querySelectorAll('.dumpthumb');
	for(let movie of Array.from(movies)){
		allmovies_local.push(movie.outerHTML.replace(/["]/g, "♠").replace(/[']/g, "♣"));
	}
};


let urls = [];
let allmovies = [];
const BuildUrlArray = html => {
	const temp = document.createElement('div');	temp.innerHTML = html;
	const movies = temp.querySelectorAll('.dumpthumb');
	for (let movie of Array.from(movies)) {
		allmovies.push(movie);
		urls.push(movie.outerHTML.match(/href="(.+\.html)"/)[1]);
	}
};


const done = () => {

	const temp = document.createElement('div');
	localStorage.getItem("fast_load_allmovies").split('♥').map(e => {
		temp.innerHTML += e.replace(/♠/g, '"').replace(/♣/g, "'");
	});


	BuildUrlArray(temp.innerHTML);

	const PositionOnPage = urls.findIndex(e => e == window.location.href);

	let result = '';

	if(PositionOnPage === 0){result = `
			<div style="display: inline-block;"><h1>Next</h1>${allmovies[PositionOnPage+1].outerHTML}</div>
		`;
	}else{result = `
			<div style="display: inline-block;"><h1>Prev</h1>${allmovies[PositionOnPage-1].outerHTML}</div>
			<div style="display: inline-block;"><h1>Next</h1>${allmovies[PositionOnPage+1].outerHTML}</div>
		`;}

	const temp2 = document.createElement('div'); temp2.innerHTML = result; temp2.style.float = 'left';
	document.querySelector('.dump-meta').append(temp2);
};



const refresh_date = new Date();
let half_hours = Math.floor(refresh_date.getTime() / 18e5);
let stored = Number(localStorage.getItem("h_hours"));


if (stored === 0 || stored !== half_hours) {
	localStorage.setItem("h_hours", half_hours);

	fetch("https://www.dumpert.nl/")
	.then(data => data.text())
	.then(html => { BuildUrlArray_local(html); })
	.then(() => {
		fetch("https://www.dumpert.nl/2/")
		.then(data => data.text())
		.then(html => { BuildUrlArray_local(html); })
		.then(() => {
			fetch("https://www.dumpert.nl/3/")
			.then(data => data.text())
			.then(html => { BuildUrlArray_local(html); })
			.then(() => {
				fetch("https://www.dumpert.nl/4/")
				.then(data => data.text())
				.then(html => { BuildUrlArray_local(html); })
				.then(() => {
					fetch("https://www.dumpert.nl/5/")
					.then(data => data.text())
					.then(html => { BuildUrlArray_local(html); })
					.then(() => { localStorage.setItem("fast_load_allmovies", allmovies_local.join('♥')); done();});
				});
			});
		});
	});
}else if(stored === half_hours){ done(); }
