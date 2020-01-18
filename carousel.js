(function() {
	if (!document.createElement) return;
	marqueeInit.ar = [];

	var c = 0,
            tTRE = [/^\s*$/, /^\s*/, /\s*$/, /[^\/]+$/],
	    req1 = {
                     "position": "relative",
                     "overflow": "hidden",
                   },
	    defaultconfig = {
		style: {
			"display": "block",
			"margin": "0 auto",
		},
		direction: "left",
		slowInc: 2, // used in "cursor" mode only.
		inc: 20, // regular speed in "pause" mode. Increased speed in "cursor" mode,
		mouse: "cursor", // "pause", "cursor" or false
		neutral: 150,
		saveDirection: false,
		random: true,
		fixImages: false, // AK: I forgot what it does, but seems like it always required for IE.
		pauseDuration: 0, // AK since 15.01.2020. Pause carousel when center of picture appears in center of page.
                addDelay: 0,
	}, dash, ie = false, oldie = 0, ie5 = false, iever = 0;

	/*@cc_on @*/
	/*@if(@_jscript_version >= 5)
	ie = true
	try{document.documentMode = 2000}catch(e){};
	iever = Math.min(document.documentMode, navigator.appVersion.replace(/^.*MSIE (\d+\.\d+).*$/, '$1'));
	if (iever < 6)
		oldie = 1;
	if (iever < 5.5) {
		Array.prototype.push = function(el) { this[this.length] = el; };
		ie5 = true;
		dash = /(-(.))/;
		String.prototype.encamel = function(s, m) {
			s = this;
			while((m = dash.exec(s)))
				s = s.replace(m[1], m[2].toUpperCase());
			return s;
		}
	}
	@end @*/

	if (!ie5) {
		dash = /-(.)/g;
		function toHump(a, b) {
			return b.toUpperCase();
		}
		String.prototype.encamel = function() {
			return this.replace(dash, toHump);
		}
	}

	if (ie && iever < 8) {
		marqueeInit.table = [];
		window.attachEvent("onload", function() {
			marqueeInit.OK = true;
			for (var i=0; i < marqueeInit.table.length; ++i)
				marqueeInit.run(marqueeInit.table[i]);
		})
	}

	function intable(el) {
		while ((el = el.parentNode))
			if (el.tagName && el.tagName.toLowerCase() === "table")
				return true;
		return false;
	}

	marqueeInit.run = function(id) {
		var e = document.getElementById(id);
		if (ie && !marqueeInit.OK && iever < 8 && intable(e)) {
			marqueeInit.table.push(id);
			return;
		}
		if (!e)
			setTimeout(function(){ marqueeInit.run(id); }, 300);
		else
			new Marq(c++, e); // AK 27.07.2018: AAAA!!! Тут ++c не сработает!! Нужен именно c++!!
	}

	function trimTags(tag) {
		var r = [], i = 0, e;
		while ((e = tag.firstChild) && e.nodeType === 3 && tTRE[0].test(e.nodeValue))
			tag.removeChild(e);
		while ((e = tag.lastChild) && e.nodeType === 3 && tTRE[0].test(e.nodeValue))
			tag.removeChild(e);
		if ((e = tag.firstChild) && e.nodeType === 3)
			e.nodeValue = e.nodeValue.replace(tTRE[1], "");
		if ((e = tag.lastChild) && e.nodeType === 3)
			e.nodeValue = e.nodeValue.replace(tTRE[2], "");
		while ((e = tag.firstChild))
			r[i++] = tag.removeChild(e);
		return r;
	}

	function randThem(tag) {
            var els = oldie ? tag.all : tag.getElementsByTagName("*"), i = els.length - 1, childEls = [], newEls = [];
            for (i; i>-1; --i)
              if (els[i].parentNode === tag) {
                childEls.push(els[i]);
                newEls.push(els[i].cloneNode(true));
              }

            newEls.sort(function(){ return 0.5 - Math.random(); });
            i = childEls.length - 1;
            for (i; i>-1; --i)
              tag.replaceChild(newEls[i], childEls[i]);
	}

        function fullWidth(tag) {
          var style = tag.currentStyle || window.getComputedStyle(tag),
              width = tag.offsetWidth, // or use style.width
              margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
              // padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
              // border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

          return width + margin;// 
        }

	function Marq(c, tag) {
		var p, u, s, a, ims, ic, i,
                  marqContent,
                  cObj = this;

		cObj.mq = marqueeInit.ar[c];
		for (p in defaultconfig)
			if ((cObj.mq.hasOwnProperty && !cObj.mq.hasOwnProperty(p)) || (!cObj.mq.hasOwnProperty && !cObj.mq[p]))
				cObj.mq[p] = defaultconfig[p];

		if (cObj.mq.random)
                  randThem(tag);
                // get width of the first (any) element
                if (cObj.mq.pauseDuration) {
                  var els = oldie ? tag.all : tag.getElementsByTagName("*");
                  cObj.mq.elWidth = (cObj.mq.firstEl = els.length ? els[0] : 0) ? fullWidth(cObj.mq.firstEl) : 0;
                }

		cObj.mq.style.width = !cObj.mq.style.width || isNaN(parseInt(cObj.mq.style.width)) ? "100%" : cObj.mq.style.width;
		cObj.mq.style.height = !tag.getElementsByTagName("img")[0] ?
			(!cObj.mq.style.height || isNaN(parseInt(cObj.mq.style.height)) ? tag.offsetHeight + 3+"px" : cObj.mq.style.height) :
			(!cObj.mq.style.height || isNaN(parseInt(cObj.mq.style.height)) ? "auto" : cObj.mq.style.height);

		u = cObj.mq.style.width.split(/\d/);
		cObj.cw = cObj.mq.style.width ? [parseInt(cObj.mq.style.width), u[u.length-1]] : ["a"];
		marqContent = trimTags(tag);

		// AK: why do we removing this all??
		tag.className = tag.id = "";
		tag.removeAttribute("class", 0);
		tag.removeAttribute("id", 0);
		if (ie) tag.removeAttribute("className", 0);

		tag.appendChild(tag.cloneNode(false));
		// tag.className = "marquee" + c; //["marquee", c].join(""); // AK 14.01.2020: this is kinda legacy? I see no use of "marquee"
		tag.style.overflow = "hidden";
		cObj.c = tag.firstChild;
		cObj.c.appendChild(cObj.c.cloneNode(false));
		cObj.c.style.visibility = "hidden";
		a = [[req1, cObj.c.style], [cObj.mq.style, cObj.c.style]];
		for (i = a.length-1; i>-1; --i) { // copy styles
			for (p in a[i][0])
				if ((a[i][0].hasOwnProperty && a[i][0].hasOwnProperty(p)) || !a[i][0].hasOwnProperty)
					a[i][1][p.encamel()] = a[i][0][p];
		}
		cObj.m = cObj.c.firstChild;
		if (cObj.mq.mouse === "pause") {
			cObj.c.onmouseover = function() { cObj.mq.stopped = 1; }
			cObj.c.onmouseout = function() { cObj.mq.stopped = 0; }
		}
		cObj.m.style.position = "absolute";
		cObj.m.style.left = "-9000000px";
		cObj.m.style.whiteSpace = "nowrap";
		if (ie5) cObj.c.firstChild.appendChild((cObj.m = document.createElement("nobr")));
		if (!cObj.mq.noAddedSpace)
			cObj.m.appendChild(document.createTextNode(" ")); // '\xa0' in non-unicode version
		for (i=0; marqContent[i]; ++i)
			cObj.m.appendChild(marqContent[i]);

		if (cObj.fixImages || ie) { //AK
			if (ie5) cObj.m = cObj.c.firstChild;
			ims = cObj.m.getElementsByTagName("img");
			if (ims.length)
				for (ic=0, i=0; i < ims.length; ++i) {
					ims[i].style.display = "inline";
					if (!ims[i].alt && !cObj.mq.noAddedAlt) {
						ims[i].alt = (tTRE[3].exec(ims[i].src)) || ("Image #" + [i + 1]);
						if (!ims[i].title)
							ims[i].title = "";
					}
					ims[i].style.display = "inline";
					ims[i].style.verticalAlign = ims[i].style.verticalAlign || "top";
					if (typeof ims[i].complete === "boolean" && ims[i].complete)
						++ic;
					else {
						ims[i].onload = ims[i].onerror = function() {
							if (++ic === ims.length)
								cObj.setup(c);
						}
					}
					if (ic === ims.length) cObj.setup(c);
				}
				return;
		}
		cObj.setup(c);
	}

	Marq.prototype.setup = function(c) {
		var s, w,
                    cObj = this,
                    mq = cObj.mq,
                    exit = 10000;

		if (mq.setup) return;
		mq.setup = this;
                mq.curTimeout = false; // AK

		if (cObj.c.style.height === "auto")
			cObj.c.style.height = cObj.m.offsetHeight + 4 + "px";
		cObj.c.appendChild(cObj.m.cloneNode(true));
		cObj.m = [cObj.m, cObj.m.nextSibling];
		if (mq.mouse === "cursor") {
			cObj.r = mq.neutral || 16;
			cObj.sinc = mq.inc;
			cObj.c.onmousemove = function(e) { mq.stopped = 0; cObj.directSpeed(e); }
			if (mq.slowInc) {
				mq.inc = mq.slowInc;
				if (mq.saveDirection) {
					if (mq.saveDirection === "reverse") {
						cObj.c.onmouseout = function(e) {
							if (cObj.contains(e)) return;
							mq.inc = mq.slowInc;
							mq.direction = mq.direction === "right" ? "left" : "right";
						}
					}else {
						mq.saveDirection = mq.direction;
						cObj.c.onmouseout = function(e) {
							if (cObj.contains(e)) return;
							mq.inc = mq.slowInc;
							mq.direction = mq.saveDirection;
						}
					}
				}else
					cObj.c.onmouseout = function(e) {
						if (!cObj.contains(e)) mq.inc = mq.slowInc;
					}
			}else {
				cObj.c.onmouseout = function(e) {
					if (!cObj.contains(e)) cObj.slowDeath();
				}
			}
		} 

		cObj.c.id = cObj.mq.containerId; // AK keep the container id, to be able to style it by container #id img. BEFORE the calculation of computed width!!
		                                 // For some reason legacy code removes the id in 2 different ways. But I think that it's mistake. We actually REQUIRE this ID.
		cObj.w = cObj.m[0].offsetWidth;
   
		cObj.m[0].style.left = 0;
		cObj.m[0].style.top = cObj.m[1].style.top = Math.floor((cObj.c.offsetHeight - cObj.m[0].offsetHeight) / 2 - oldie) + "px";

		// AK 16.01.2020: I see no reasons to remove an ID. Moreover, we require it for correct styling and comuting correct width of the sum of elements!
		// cObj.c.id = "";                                                                  
		// cObj.c.removeAttribute("id", 0);

		cObj.m[1].style.left = cObj.w+"px";
		s = mq.slowInc ? Math.max(mq.slowInc, cObj.sinc) : (cObj.sinc || mq.inc);
		while (cObj.c.offsetWidth > cObj.w - s && --exit) {
			w = isNaN(cObj.cw[0]) ? cObj.w - s : --cObj.cw[0];
			if (w < 1 || cObj.w < Math.max(1, s)) break;
			cObj.c.style.width = isNaN(cObj.cw[0]) ? cObj.w - s + "px" : --cObj.cw[0] + cObj.cw[1];
		}
		// cObj.c.id = cObj.mq.containerId; // AK keep the container id, to be able to style it by container #id img. BEFORE the calculation of computed width!!
		cObj.c.style.visibility = "visible";
		cObj.runIt();
	}

	Marq.prototype.slowDeath = function() {
		var cObj = this;
		if (cObj.mq.inc) {
			cObj.mq.inc -= 1;
			cObj.timer = setTimeout(function(){ cObj.slowDeath(); }, 100);
		}
	}

	Marq.prototype.runIt = function() {
		var cObj = this,
		    mq = cObj.mq;

		if (mq.stopped || mq.stopMarquee) {
			setTimeout(function(){ cObj.runIt(); }, 300);
			return;
		}


		var m0l = parseInt(cObj.m[0].style.left),
                    m1l = parseInt(cObj.m[1].style.left),
                    sleep = 0,
                    regularInc = (mq.mouse !== "cursor") ? mq.inc = Math.max(1, mq.inc) : mq.slowInc,
                    dir = mq.direction === "right" ? 1 : -1;


		if (dir * m0l >= cObj.w)
			cObj.m[0].style.left = (m0l = m1l - dir * cObj.w)+"px";
		if (dir * m1l >= cObj.w)
			cObj.m[1].style.left = (m1l = m0l - dir * cObj.w)+"px";

		dir*= mq.inc; // dir = dir * mq.inc;
		m0l+= dir; // m0l = m0l + dir * mq.inc;
		m1l+= dir; // m1l = m1l + dir * mq.inc;

		// AK check if the picture is in center of page.
                if (mq.pauseDuration  && ((mq.inc == mq.slowInc) || (mq.mouse !== "cursor"))) {
                  var marqueePos = m0l < 0 ? m0l : m1l,
                      halfStep = regularInc / 2,
                      pauseInterval = mq.elWidth + halfStep, // interval always static
                      pausePoint;

                  pausePoint = (mq.elWidth > window.innerWidth) ? // element wider than page!
                      Math.abs((marqueePos +
                                             (mq.elWidth / 2 - window.innerWidth / 2)
                                          ) % pauseInterval) :

                      Math.abs(marqueePos % pauseInterval) +
                                   (window.innerWidth / 2 - mq.elWidth / 2);

                  if ((pausePoint >= (pauseInterval - halfStep) && // lower point
                       pausePoint < pauseInterval + halfStep) // higher point used when elWidth less than page width
                     || (pausePoint < halfStep)) { // starting point used when elWidth is more than page width
                    sleep = mq.pauseDuration;
                  }
                }

		cObj.m[0].style.left = m0l+"px";
		cObj.m[1].style.left = m1l+"px";

		mq.curTimeout = setTimeout(function() { cObj.runIt(); }, // AK. Setup variable t clear timout when required.
                  30 + sleep + (mq.addDelay || 0));
	}

	Marq.prototype.directSpeed = function(e) {
		var cObj = this,
                    mq = cObj.mq;

		e = e || window.event;
		if (cObj.timer) clearTimeout(cObj.timer);
		var c = cObj.c,
		    w = c.offsetWidth,
		    l = c.offsetLeft,
		    mp = (typeof e.pageX === "number" ? e.pageX : e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft) - l,
		    lb = (w - cObj.r) / 2, rb = (w + cObj.r) / 2;

		while ((c = c.offsetParent)) mp -= c.offsetLeft;
		mq.direction = mp > rb ? "left" : "right";
		mq.inc = Math.round((mp > rb ? (mp - rb) : mp < lb ? (lb - mp) : 0) / lb * cObj.sinc);

	        if (mq.pauseDuration && mq.curTimeout) { // AK: make immediate step if paused
			clearTimeout(mq.curTimeout);
			cObj.runIt();
		}
	}

	Marq.prototype.contains = function(e) {
		if (e && e.relatedTarget) {
			var c = e.relatedTarget;
			if (c === this.c) return true;
			while (c = c.parentNode)
				if (c === this.c) return true;
		}
		return false;
	}

	function resize() { // related to all marquee lines
		for (var s, w, m, i=0; i < marqueeInit.ar.length; ++i)
			if (marqueeInit.ar[i] && marqueeInit.ar[i].setup) {
				m = marqueeInit.ar[i].setup;
				s = m.mq.slowInc ? Math.max(m.mq.slowInc, m.sinc) : (m.sinc || m.mq.inc);
				m.c.style.width = m.mq.style.width;
				m.cw[0] = m.cw.length > 1 ? parseInt(m.mq.style.width) : "a";

				if (m.w != m.m[0].offsetWidth) { // AK 16.01.2020: recalculate the width of marquee on resize!
                                  m.w = m.m[0].offsetWidth;

                                  // TODO: need more research.
                                  // if (parseInt(m.m[0].style.left) >= m.w)
                                    m.m[0].style.left = parseInt(m.m[1].style.left) - m.w+"px";
                                  // if (parseInt(m.m[1].style.left) >= m.w)
                                    m.m[1].style.left = parseInt(m.m[0].style.left) - m.w+"px";
				}

                                if (m.mq.pauseDuration) // AK 16.01.2020: update width of the first element
                                  m.mq.elWidth = fullWidth(m.mq.firstEl);

				while (m.c.offsetWidth > m.w - s) {
					w = isNaN(m.cw[0]) ? m.w - s : --m.cw[0];
					if (w < 1) break;
					m.c.style.width = isNaN(m.cw[0]) ? m.w - s+"px" : --m.cw[0] + m.cw[1];
				}
			}
	}

	if (window.addEventListener)
		window.addEventListener("resize", resize, false);
	else if (window.attachEvent)
		window.attachEvent("onresize", resize);
})()


function marqueeInit(config) {
    var e = document.getElementById(config.containerId);
    if (!e) return false; // Делаем невозможным преждевременный вызов.
    e.style.visibility = "visible"; // We absolutely always need it. No need to move to defaultconfig.style.

    marqueeInit.ar.push(config);
    marqueeInit.run(config.containerId);
}


// AK: try to initialize the carousel once  the script loaded.
if (typeof marqueeInitId != "undefined")
  marqueeInit({ uniqueid: marqueeInitId });
