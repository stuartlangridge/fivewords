var LEVEL = "A", isc, MYANSWERS = {}, PULSING = "none";

function loadSavedGame(cb) { 
    "abcdefghijklmnoqrstuvwxyz".split("").forEach(function(l) {
        MYANSWERS[l] = {answers: [null,null,null,null,null]};
    });
    if (localStorage.fiveWordsSavedAnswers) {
        var sa;
        try {
            sa = JSON.parse(localStorage.fiveWordsSavedAnswers);
        } catch(e) {
            return cb();
        }
        for (var k in sa) {
            if (typeof(k) == "string" && k.length == 1) {
                var kl = k.toLowerCase();
                if (sa[kl].answers && sa[kl].answers.length == 5) {
                    MYANSWERS[kl] = {answers: sa[kl].answers};
                }
            }
        }
        Array.prototype.slice.call(document.querySelectorAll("#inner span")).forEach(function(f) {
            var ma = MYANSWERS[f.innerHTML.toLowerCase()];
            if (ma && ma.answers) {
                var foundbad = false;
                ma.answers.forEach(function(m) { if (!m) foundbad = true; });
                if (!foundbad) { f.className = "completed"; }
            }
        });
    }
    cb(); 
}

function getInputFocusHandler(inp) {
    var before = inp.offsetHeight, root = document.getElementById("root");
    return function(e) {
        if (inp.className == "game") {
            setTimeout(function() {
                document.body.scrollTop = 0;
            }, 0);
            return;
        }
        inp.className = "game";
        setTimeout(function() {
          if (document.body.scrollTop > 0) {
            // Browser does not readjust height of screen when keyboard appears
            root.style.height = (before - document.body.scrollTop - 10) + "px";
            document.body.scrollTop = 0;
          } else {
            // Browser readjusts height of screen when keyboard appears
            inp.style.top = (inp.offsetTop - parseInt(inp.style.bottom, 10)) + "px";
            inp.style.bottom = "auto";
            document.body.scrollTop = 0;
          }
          document.getElementById("coverall").style.display = "none";
        }, 250);
    };
}

function handleKey(inp) {
    var fi = document.getElementById("floatinginput");
    var rootbg = document.getElementById("rootbg");
    return function(e) {
        var attempt = exports.checksum(exports.strip(ANSWERS[LEVEL].clue + inp.value)),
            actual = ANSWERS[LEVEL].answer;
        for (var i=0; i<actual.length; i++) {
            if (attempt == actual[i]) {
                var destspans = document.querySelectorAll("#answer span");
                var destspan = destspans[i];
                if (destspan.className == "revealed") { return; }

                var templated_value = "";
                for (var j=0; j<inp.value.length; j++) {
                    if (ANSWERS[LEVEL].template[i].charAt(j) == "A") {
                        templated_value += inp.value.charAt(j).toUpperCase();
                    } else {
                        templated_value += inp.value.charAt(j).toLowerCase();
                    }
                }
                fi.value = templated_value;
                destspan.getElementsByTagName("strong")[0].innerHTML = templated_value;
                inp.value = "";
                fi.style.display = "block";
                var destx = destspan.offsetLeft, desty = destspan.offsetTop + destspan.offsetParent.offsetTop;
                var curx = fi.offsetLeft, cury = fi.offsetTop;
                var dx = (destx + (destspan.offsetWidth / 2)) - (curx + (fi.offsetWidth / 2)), dy = desty - cury;
                dy = dy + 1; // fudge factor.
                fi.style.MozTransform = "translateX(" + (dx) + "px) translateY(" + (dy) + "px)";
                fi.style.webkitTransform = "translateX(" + (dx) + "px) translateY(" + (dy) + "px)";
                fi.style.transform = "translateX(" + (dx) + "px) translateY(" + (dy) + "px)";
                fi.style.color = "white";

                var solved = 1;
                Array.prototype.slice.call(destspans).forEach(function(s) {
                    if (s.className == "revealed") solved += 1;
                });
                if (solved == 5) {
                    Array.prototype.slice.call(document.querySelectorAll("#inner span")).forEach(function(f) {
                        if (f.innerHTML.toLowerCase() == LEVEL.toLowerCase()) { f.className = "completed"; }
                    });
                    if (PULSING == "none") {
                        document.querySelectorAll("#inner span")[1].className = "pulse";
                        PULSING = "now";
                    }
                }

                MYANSWERS[LEVEL.toLowerCase()].answers[i] = templated_value;
                localStorage.setItem("fiveWordsSavedAnswers", JSON.stringify(MYANSWERS));

                destspan.className = "revealing";
                setTimeout(function() {
                    fi.style.opacity = 0;
                    destspan.className = "revealed";
                    setBGForLevel({fade: true});
                    setTimeout(function() {
                        fi.style.display = "none";
                        fi.style.MozTransform = "translateX(0px) translateY(0px)";
                        fi.style.webkitTransform = "translateX(0px) translateY(0px)";
                        fi.style.transform = "translateX(0px) translateY(0px)";
                        fi.style.opacity = 1;
                        fi.style.color = "black";
                    }, 300);
                }, 300);
            }
        }
    };
}

function setBGForLevel(options) {
    var answered = document.querySelectorAll("#answer span.revealed").length;
    var img = "bgimages/" + "bg-"  + LEVEL.toLowerCase() + "-" + (5-answered) + ".jpg";
    var i = new Image();
    i.onload = function() {
        var imgurl = "url(" + img + ")";
        if (options.fade) {
            document.getElementById("rootbgfader").style.backgroundImage = document.getElementById("rootbg").style.backgroundImage;
            document.getElementById("rootbgfader").style.opacity = 0;
            document.getElementById("rootbg").style.backgroundImage = imgurl;
            setTimeout(function() {
                document.getElementById("letterchooserfadeleft").style.backgroundImage = imgurl;
                document.getElementById("letterchooserfaderight").style.backgroundImage = imgurl;
                document.getElementById("rootbgfader").style.backgroundImage = "none";
                document.getElementById("rootbgfader").style.opacity = 1;
            }, 1300);
        } else {
            document.getElementById("rootbg").style.backgroundImage = imgurl;
            document.getElementById("letterchooserfadeleft").style.backgroundImage = imgurl;
            document.getElementById("letterchooserfaderight").style.backgroundImage = imgurl;
        }
    };
    i.src = img;
}

function resetGame() {
    localStorage.removeItem("fiveWordsSavedAnswers");
    location.reload();
}

function chooseLetter(e) {
    chooseLevel(e.target.innerHTML, e.target);
}

function chooseLevel(newlevel, letterScrollElement) {
    LEVEL = newlevel;
    if (PULSING == "now") {
        document.querySelectorAll("#inner span")[1].className = "";
        PULSING = "done";
    }
    document.getElementById("clue").innerHTML = decodeURIComponent(ANSWERS[LEVEL].clue);
    var ans = document.getElementById("answer");
    ans.innerHTML = "";
    for (var i=0; i<ANSWERS[LEVEL].template.length; i++) {
        var span = document.createElement("span");
        var strong = document.createElement("strong");
        var b = document.createElement("b");
        var textValue = ANSWERS[LEVEL].template[i];
        if (MYANSWERS[LEVEL.toLowerCase()].answers[i]) { 
            textValue = MYANSWERS[LEVEL.toLowerCase()].answers[i]; 
            span.className = "revealed";
        }
        strong.appendChild(document.createTextNode(textValue));
        b.appendChild(document.createTextNode(ANSWERS[LEVEL].template[i]));
        var em = document.createElement("em");
        em.appendChild(document.createTextNode(new Array(ANSWERS[LEVEL].template[i].length+1).join("-")));
        span.appendChild(strong);
        span.appendChild(em);
        span.appendChild(b);
        ans.appendChild(span);
        ans.appendChild(document.createTextNode(" "));
    }
    setBGForLevel({fade: false});
    if (!letterScrollElement) {
        Array.prototype.slice.call(document.querySelectorAll("#inner span")).forEach(function(f) {
            if (f.innerHTML == newlevel) {
                letterScrollElement = f;
            }
        });
    }
    if (letterScrollElement) {
        isc.scrollToElement(letterScrollElement, 200, true, true);
    }
}

function attachEventHandlers(cb) {
    var inp = document.getElementById("maininput");
    inp.addEventListener("focus", getInputFocusHandler(inp), false);
    inp.addEventListener("keyup", handleKey(inp), false);
    isc = new IScroll('#letterchooser', { scrollX: true, scrollY: false, mouseWheel: true, 
        tap: true });
    document.querySelector("#inner").addEventListener("tap", chooseLetter, false);
    document.addEventListener("touchmove", function(e) { e.preventDefault(); }, false);
    cb();
}

function checkIOSStandalone(cb) {
    if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone) {
        document.getElementById("coverall").innerHTML = "Add this to your home screen";
    } else {
        cb();
    }
}

function inSeriesDo() {
    var fns = Array.prototype.slice.call(arguments);
    var next = function() {
        if (fns.length > 0) { setTimeout(function() { fns.shift()(next); }, 0); }
    };
    next();
}

function startup() {
    inSeriesDo(
        checkIOSStandalone,
        attachEventHandlers,
        loadSavedGame,
        function() { chooseLevel("A"); }
    );
}
document.addEventListener("DOMContentLoaded", startup);
