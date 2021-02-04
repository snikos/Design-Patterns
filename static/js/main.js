"use strict";
let dpc = {
	dates: {},
	pagiCount: 0,
	deflang: 'en',
	defid: 5,
	curIdx: 5,
	atomIdx: 5,
	step: 5,
	len: 0,
	clicked: false,
	pagiPrev: [],
	pagiCur: [],
	pagiNext: [],
	activeElem: 0,
	addHtml(el, numArea, metod, tpl){
		//numArea=0|1|2|3; metod=html|text|elem
		//let arrArea = ['beforebegin','beforeend','afterbegin','afterend'];
		let mtd = {
		  html:'insertAdjacentHTML',
		  text:'insertAdjacentText',
		  elem:'insertAdjacentElement',
		  0:'beforebegin',
		  1:'afterbegin',
		  2:'beforeend',
		  3:'afterend'
		};
		el[mtd[metod]](mtd[numArea], tpl);
		return this;
	},
	loader(lang){
		let that = this;
		let url = `./static/json/${lang}_lang.json`;

		fetch(url)
		.then( res => res.json() )
		.then( data => {
			dpc.dates[lang] = data['woodoo'];
			dpc.dates['kindof'+lang] = data['kindof'];
		})
		.catch( (err) => {
			console.log(err)
		})
		.finally( (res) => {
			//if(res === undefined) rootid.innerHTML += `<p style="color:tomato">${err}</p>`;
		});
	},
	loaderSchema(key){
		let that = this;
		let urlSchema = `./static/json/schema.json`;
		fetch(urlSchema)
		.then( res => res.json() )
		.then( data => {
			that.dates['schuma'] = data;
			console.log('Schuma date was loaded!')
		})
		.catch( (err) => {
			console.log(err)
		})
		.finally( (res) => {
			//console.log('schema was created');
		});
	},
	init(lang){
		let that = this;

		if(that.dates[lang] === undefined){
			that.loader(lang);
		}

		if(that.dates['schuma'] === undefined){
			that.loaderSchema('schuma');
		}

		let timer = setInterval( () => {
			//console.log(that.dates[lang]);

			if( that.dates[lang] !== undefined && that.dates['schuma'] !== undefined ){
				//console.log(that.dates['kindof']);
				that.parsec(that.dates[lang], that.defid);
				that.pagiDesc(that.dates[lang]);
				that.pagiStart();
				that.handlePagi(that.dates[lang], that.defid);

				that.parsecSchema(that.dates['schuma'], that.defid);
				that.drawKindof(that.dates['kindof'+lang], that.activeElem);
				clearInterval(timer);
			}
		}, 10);
	},
	update(lang){
		let that = this;

		if(that.dates[lang] === undefined){
			that.loader(lang);
		}

		if(that.dates['schuma'] === undefined){
			that.loaderSchema('schuma');
		}

		let timer = setInterval( () => {
			if( that.dates[lang] !== undefined && that.dates['schuma'] !== undefined ){
			    that.parsec(that.dates[lang], that.defid);
			    that.parsecSchema(that.dates['schuma'], that.defid);
			    that.drawKindof(that.dates['kindof'+lang], that.activeElem);
				clearInterval(timer);
			}
		}, 10);
	},
	getTag(selector){
		return document.querySelectorAll(selector);
	},
	parsec(data, id){
		if( data!==undefined ) {
			let curModel = data.find( (o) => {
				if( +(o['id']) === +id ) return o;
			});
			this.drawDesc(curModel);
		}
	},
	parsecSchema(data, id){
		if( data!==undefined ) {
			let curModel = data.find( (o) => {
				if( +(o['id']) === +id ) return o;
			});
			this.drawSchema(curModel);
		}
	},
	drawKindof(data, activeElem){
		this.getTag('#kindofTypes')[0].innerHTML = '';
		this.getTag('#kindofBox')[0].innerHTML = '';
		data.forEach( (el, idx) => {
			let key = Object.keys(el);
			let setClass = (cls) => { return (idx===activeElem) ? cls : '' };
			this.addHtml(kindofTypes, 2, 'html', `<li><button type="button" data-kindof="${key}" class="btn btn-light btn-sm ${setClass('active')}">${key}</button></li>`);
			this.addHtml(kindofBox, 2, 'html', `<li class="${setClass('open')}" id="${key}">${el[key]}</li>`);
		});
	},
	drawDesc(data){
		let that = this;
		let uri = encodeURI('https://'+(that.deflang)+'.wikipedia.org/wiki/'+ data['wiki']);
		this.getTag('#title')[0].textContent = data['title'];
		this.getTag('#type')[0].textContent = data['type'];
		this.getTag('#wikiArticle')[0].setAttribute('href', uri);
		this.getTag('#wikiArticle')[0].setAttribute('title', data['wiki']);
		this.getTag('#wikiArticle')[0].textContent = data['wiki'];
		this.getTag('#whatitis')[0].textContent = data['whatitis'];
	},
	drawSchema(data){
		let that = this;
		this.getTag('#rootid')[0].innerHTML = '';

		let base = data.schema.base;
		let bgstyle = data.style;
		let kids = data.schema.kids;
		base.forEach( (el, idx) => {
			if( el.length < 1 ) return;
			let baseText = `<div class="title">${el[0]}</div>`;
			let coords = el[1].split(':');
			let child = el[3];
			let childText='';
			let kidArrow='';
			let eventText='';
			let sizeW = '';
			let sizeH = '';

			( el[4] !== undefined ) ? bgstyle = el[4] : bgstyle = data.style;
			if ( el[2].length > 0 ){
				sizeW = el[2].split(':')[0];
				sizeH = el[2].split(':')[1];
			}

			child.forEach( (kid, idx) => {
				childText += `<li>${kid}</li>`;
			});

			kids[idx].forEach( (arr, i) => {
				if( arr[0] === undefined ) return;

				let kidStyles = '';
				let kidWay = arr[0].split(" ");

				( arr[1].length > 0 ) ? kidStyles += `${arr[1]}` : kidStyles += '';
				( arr[2].length > 0 ) ? kidStyles += `${arr[2]}` : kidStyles += '';

				( arr[3] !== undefined ) ? eventText += `<span class="eventText">${arr[3]}</span>` : eventText += '';

				let kidClass = arr;

				kidArrow += `<span class="arrow ${kidClass[0]}" style="${kidStyles}">${eventText}</span>`;
				//console.log(arr)
			});

			if( childText.length > 0 ) childText = `<ul class="child">${childText}</ul>`;
			this.getTag('#rootid')[0].innerHTML += `<div class="baseBox" style="top:${coords[0]}px; left:${coords[1]}px; width:${sizeW}; height:${sizeH}; background-color: ${bgstyle}">${baseText}${childText}${kidArrow}</div>`;
		});
		this.swedishFamily();

			/* AND for All */
			let rootBox = this.getTag('#rootid')[0];
			let baseElems = this.getTag('#rootid .baseBox');
			let baseStartTop = [];
			let baseStartLeft = [];
			let baseTop=[];
			let baseLeft=[];
			[].forEach.call( baseElems, el => {
				baseStartTop.push(el.offsetTop);
				baseStartLeft.push(el.offsetLeft);
				baseTop.push(el.offsetTop   + el.clientHeight);
				baseLeft.push(el.offsetLeft + el.clientWidth);
			} );
			const minTop =  Math.min.apply( Math, baseStartTop );
			const minLeft = Math.min.apply( Math, baseStartLeft );
			const maxTop =  Math.max.apply( Math, baseTop );
			const maxLeft = Math.max.apply( Math, baseLeft );

			let x = (rootBox.clientWidth/2)  - ((maxLeft-minLeft)/2);
			let y = (rootBox.clientHeight/2) - ((maxTop-minTop)/2);

			[].forEach.call( baseElems, (el, idx) => {
				let top = el.offsetTop;
				let left = el.offsetLeft;
				
				el.style.top  = y + top + 'px';
				el.style.left = x + left + 'px';
			});
	},
	swedishFamily(){
		let coll = this.getTag('#rootid .baseBox');
		[].forEach.call( coll, (el, idx, arr) => {
			let elTop = el.offsetTop;
			let elLeft = el.offsetLeft;
			let elWidth = el.clientWidth;
			let elHeight = el.clientHeight;

			[].forEach.call( el.children, (child) => {
				if(child.tagName !== 'SPAN') return;
				let childClass = (child.classList.value).split(" ");
				let parentIndex = childClass[6].split("_")[1];

				let targetElem = coll[parentIndex];
				let tarTop = targetElem.offsetTop;
				let tarLeft = targetElem.offsetLeft;
				let tarWidth = targetElem.clientWidth;
				let tarHeight = targetElem.clientHeight;

				if ( childClass[1] === 'o_left' ){
					if(childClass[3] === 't270'){
						let width = elLeft - (tarLeft+tarWidth);
						child.style.width = width+'px';
						child.style.borderWidth = '1px 0 0 0';
						if(childClass[2] === 'lc'){
							child.style.width = width - 7 +'px';
							child.style.borderWidth = '1px 0 1px 1px';
						}
					}
					if(childClass[3] === 'tr'){
						let width = tarLeft - (elLeft+elWidth);
						child.style.width = width+'px';
					}
					if(childClass[3] === 't0'){
						let width = elLeft - (tarLeft+tarWidth/2);
						let height = (elTop+(elHeight/2)) - (tarTop + tarHeight);
						child.style.width = width+'px';
						child.style.height = height+'px';
						child.style.borderWidth = '0 0 1px 1px';
					}
					if(childClass[3] === 't180'){
						let width = elLeft - (tarLeft+tarWidth/2);
						let height = tarTop - (elTop+(elHeight/2));
						child.style.width = width+'px';
						child.style.height = height+'px';
						child.style.borderWidth = '1px 0 0 1px';
					}
				}
				if ( childClass[1] === 'o_top' ){
					if(childClass[3] === 't0'){
						let height = elTop - (tarTop+tarHeight);
						child.style.height = height+'px';
						child.style.borderWidth = '0 1px 0 0';
						if(childClass[2] === 'tc'){
							let nextElem = arr[idx+1];
							let nextTop = nextElem.offsetTop;
							let nextLeft = nextElem.offsetLeft;
							let nextWidth = nextElem.clientWidth;
							let nextHeight = nextElem.clientHeight;
							let width = (nextLeft+nextWidth/2) - (elLeft+(elWidth/2));
							child.style.height = height - 8 +'px';
							child.style.width  = width+'px';
							child.style.borderWidth = '1px 1px 0 1px';
						}
					}
					if(childClass[3] === 't90'){
						let width = tarLeft - (elLeft+elWidth/2);
						let height = elTop - (tarTop+tarHeight/2);
						child.style.width  = width+'px';
						child.style.height = height+'px';
						child.style.borderWidth = '1px 0 0 1px';
					}
					if(childClass[3] === 't270'){
						let height = elTop - (tarTop+tarHeight/2);
						let width = (elLeft+elWidth/2) - (tarLeft+tarWidth);
						child.style.height = height+'px';
						child.style.width  = width+'px';
						child.style.borderWidth = '1px 1px 0 0';
						if( childClass[2] === 'tl' ){
							child.style.left = 'auto';
						    child.style.right = '50%';
						}
					}
				}
				if ( childClass[1] === 'o_right' ){
					if(childClass[3] === 't0'){
						let width =  (tarLeft+tarWidth/2) - (elLeft+elWidth);
						let height = (elTop+elHeight/2) - (tarTop+tarHeight);
						child.style.width = width+'px';
						child.style.borderWidth = '0 1px 1px 0';
						child.style.height = height+'px';
						if( childClass[2] === 'tr' ){
							child.style.top = 'auto';
						    child.style.bottom = '50%';
						}
					}
					if(childClass[3] === 't90'){
						let width = tarLeft - (elLeft+elWidth);
						child.style.width = width+'px';
						child.style.borderWidth = '1px 0 0 0';
						if(childClass[2] === 'rc'){
							child.style.width = width - 7 +'px';
							child.style.borderWidth = '1px 1px 1px 0';
						}
					}
					if(childClass[3] === 't180'){
						let width =  (tarLeft+tarWidth/1.5) - (elLeft+elWidth);
						let height = (tarTop) - (elTop+elHeight/2);
						child.style.width = width+'px';
						child.style.height = height+'px';
						child.style.borderWidth = '1px 1px 0 0';
					}
				}
				if ( childClass[1] === 'o_bottom' ){
					if(childClass[3] === 't90'){
						let height = tarTop - (elTop+elHeight/2);
						let width = tarLeft - (elLeft + (elWidth/2));
						child.style.height = height+'px';
						child.style.width = width+'px';
						child.style.borderWidth = '0 0 1px 1px';
					}
					if(childClass[3] === 't180'){
						let height = tarTop - (elTop+elHeight);
						child.style.height = height+'px';
						child.style.borderWidth = '0 1px 0 0';
						if(childClass[2] === 'bc'){
							let nextElem = arr[idx+1];
							let nextTop = nextElem.offsetTop;
							let nextLeft = nextElem.offsetLeft;
							let nextWidth = nextElem.clientWidth;
							let nextHeight = nextElem.clientHeight;
							let width = (nextLeft+nextWidth/2) - (elLeft+(elWidth/2));
							child.style.width = width+'px';
						}
					}
					if(childClass[3] === 't270'){
						let width = (elLeft + (elWidth/2)) - (tarLeft+tarWidth);
						let height = tarTop - (elTop+elHeight);
						child.style.height = height+'px';
						child.style.width = width+'px';
						child.style.borderWidth = '0 1px 1px 0';
					}
				}
			});
		});
	},
	pagiDesc(data, defid){
		let that = this;
		for( let i=0; i<data.length; i++ ){
			that.getTag('.pagination')[0].innerHTML += `<li class="page-item"><button type="button" class="page-link" data-page="${i}">${i+1}</button></li>`;
		}
	},
	genPagiArray(curIdx){
		let that = this;
		that.pagiPrev=[];
		that.pagiCur =[];
		that.pagiNext=[];

		let allRight = Math.min(curIdx+(that.step*2), that.len);
		for( let i=(curIdx-that.step); i<curIdx; i++ ){
			if(i>=0) that.pagiPrev.push(i);
		}
		for( let i=curIdx; i<curIdx+that.step; i++ ){
			if( i<that.len ) that.pagiCur.push(i);
		}
		for( let i=(curIdx+that.step); i<allRight; i++ ){
			if(i<that.len) that.pagiNext.push(i);
		}
	},
	pagiStart(){
		let that = this;
		let leftElem = 0;

		that.genPagiArray(that.atomIdx);

		[].forEach.call( that.getTag('.pagination li'), (el, idx, arr) => {
			if( idx===0 || (idx%that.step)===0 ){
				leftElem = 0;
			} else {
				leftElem += el.clientWidth;//42;
			}

			el.style.left = leftElem+'px';
			that.len = arr.length;

			if( idx < that.curIdx ){
				el.classList.add('up');
			}
			if( idx >= that.curIdx && idx < that.curIdx+that.step ){
				el.classList.add('activo');
				if( idx === that.curIdx ){
					el.classList.add('active');
				}
			}
			if( idx >= (that.curIdx+that.step) ){
				el.classList.add('down');
			}
		});
	},
	handlePagi(data, id){
		let that = this;
		document.addEventListener('click', (ev) => {
			let tar = ev.target;

			if( tar.matches('[data-kindof]') ){
				[].forEach.call( that.getTag('#kindofTypes button'), (elem) => {
					if( elem===tar ) elem.classList.add('active');
					else elem.classList.remove('active');
				});
				[].forEach.call( that.getTag('#kindofBox li'), (elem, index) => {
					if( elem.id === tar.getAttribute('data-kindof') ) {
						elem.classList.add('open');
						that.activeElem = index;
					} else elem.classList.remove('open');
				});
				return false;
			}

			if( tar.matches('[data-page]') ){
				[].forEach.call( that.getTag('.page-item'), (el) => {
					if( el !== tar ) el.classList.remove('active');
				})
				let id = tar.getAttribute('data-page');
				that.defid = parseInt(id, 10);
				that.curIdx = parseInt(id, 10);
				tar.closest('.page-item').classList.add('active');
				that.update( that.deflang, that.defid );
				return false;
			}

			if( tar.matches('[class^=go-]') && !that.clicked ){
				ev.preventDefault();
				ev.stopPropagation();
				that.clicked = true;
				let btn = tar.classList[0].split('-')[1];
				let len = that.getTag('.page-item').length;
				let timer = 0;

				if( btn === 'prev' ){
					that.curIdx -= that.step;
					that.atomIdx -= that.step;
					that.getTag('.go-next')[0].removeAttribute('disabled');
				}
				if( btn === 'next' ){
					that.curIdx += that.step;
					that.atomIdx += that.step;
					that.getTag('.go-prev')[0].removeAttribute('disabled');
				}

				if(that.curIdx-that.step < 0){
					that.curIdx  = 0;
					that.atomIdx = 0;
					tar.setAttribute('disabled', true);
				}
				//if(that.curIdx+that.step > len){
				if(that.atomIdx+that.step > len){
					that.curIdx = (Math.ceil(len/that.step) * that.step - that.step);
					that.atomIdx = (Math.ceil(len/that.step) * that.step - that.step);
					tar.setAttribute('disabled', true);
				}

				that.defid = that.curIdx;

				that.genPagiArray(that.atomIdx);
				that.update( that.deflang, that.curIdx );

				if( btn === 'prev' ){
					that.pagiNext.forEach( (item, idx) => {
						setTimeout( () => {
							that.getTag('.page-item')[item].classList.remove('activo');
							that.getTag('.page-item')[item].classList.add('down');
						}, timer+=50);
					});
					that.pagiCur.reverse().forEach( (item, idx) => {
						setTimeout( () => {
							that.getTag('.page-item')[item].classList.remove('up');
							that.getTag('.page-item')[item].classList.add('activo');
						}, timer+=50);
					});
				}
				if( btn === 'next' ){
					that.pagiPrev.forEach( (item, idx) => {
						setTimeout( () => {
							that.getTag('.page-item')[item].classList.remove('activo');
							that.getTag('.page-item')[item].classList.add('up');
						}, timer+=50);
					});
					that.pagiCur.reverse().forEach( (item, idx) => {
						setTimeout( () => {
							that.getTag('.page-item')[item].classList.remove('down');
							that.getTag('.page-item')[item].classList.add('activo');
						}, timer+=50);
					});
				}

				[].forEach.call(that.getTag('.page-item'), (el, idx, arr) => {
					el.classList.remove('active');
					if( idx === that.curIdx ){
						el.classList.add('active');
					}
				});

				setTimeout( () => {
					that.clicked = false;
				}, 1000);
			}

		});

		document.addEventListener('input', (ev) => {
			let tar = ev.target;
			if(tar.matches('[id=toggleLand]')){
				that.deflang = tar.value;
				that.update( that.deflang, that.defid );
			}
		});

		window.addEventListener('resize', (ev) => {
			//console.log('Resize:'+ ev.type);
			that.parsecSchema(that.dates['schuma'], that.defid);
		});
	}
}
window.addEventListener('load', dpc.init( dpc.deflang ));