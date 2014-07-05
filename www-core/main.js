var LEVEL = "A";

function loadSavedGame(cb) { console.log("in loadSavedGame"); cb(); }

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
                fi.style.MozTransform = "translateX(" + (dx) + "px) translateY(" + (dy) + "px)";
                fi.style.webkitTransform = "translateX(" + (dx) + "px) translateY(" + (dy) + "px)";
                fi.style.transform = "translateX(" + (dx) + "px) translateY(" + (dy) + "px)";

                var solved = 1;
                Array.prototype.slice.call(destspans).forEach(function(s) {
                    if (s.className == "revealed") solved += 1;
                });

                var blur = (5-solved) * 5;
                console.log(blur);

                rootbg.style.MozFilter = "blur(" + blur + "px)";
                rootbg.style.webkitFilter = "blur(" + blur + "px)";
                rootbg.style.filter = "blur(" + blur + "px)";

                setTimeout(function() {
                    fi.style.opacity = 0;
                    destspan.className = "revealed";
                    setTimeout(function() {
                        fi.style.display = "none";
                        fi.style.MozTransform = "translateX(0px) translateY(0px)";
                        fi.style.webkitTransform = "translateX(0px) translateY(0px)";
                        fi.style.transform = "translateX(0px) translateY(0px)";
                        fi.style.opacity = 1;
                    }, 300);
                }, 300);
            }
        }
    };
}

function chooseLetter(e) {
    chooseLevel(e.target.innerHTML);
}

function chooseLevel(newlevel) {
    LEVEL = newlevel;
    document.getElementById("clue").innerHTML = decodeURIComponent(ANSWERS[LEVEL].clue);
    var ans = document.getElementById("answer");
    ans.innerHTML = "";
    for (var i=0; i<ANSWERS[LEVEL].template.length; i++) {
        var span = document.createElement("span");
        var strong = document.createElement("strong");
        var b = document.createElement("b");
        strong.appendChild(document.createTextNode(ANSWERS[LEVEL].template[i]));
        b.appendChild(document.createTextNode(ANSWERS[LEVEL].template[i]));
        var em = document.createElement("em");
        em.appendChild(document.createTextNode(new Array(ANSWERS[LEVEL].template[i].length+1).join("-")));
        span.appendChild(strong);
        span.appendChild(em);
        span.appendChild(b);
        ans.appendChild(span);
        ans.appendChild(document.createTextNode(" "));
    }
    var img = "background-"  + LEVEL.toLowerCase() + ".jpg";
    if (LEVEL == "A") img = "astro.jpg";
    document.getElementById("rootbg").style.backgroundImage = "url(bgimages/" + img + ")";
}

function attachEventHandlers(cb) {
    var inp = document.getElementById("maininput");
    inp.addEventListener("focus", getInputFocusHandler(inp), false);
    inp.addEventListener("keyup", handleKey(inp), false);
    var myScroll = new IScroll('#letterchooser', { scrollX: true, scrollY: false, mouseWheel: true, tap: true });
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
