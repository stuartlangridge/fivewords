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
            inp.style.top = inp.offsetTop + "px";
            inp.style.bottom = "auto";
            document.body.scrollTop = 0;
          }
          document.getElementById("coverall").style.display = "none";
        }, 250);
    };
}

function chooseLetter(e) {
    document.querySelector("#clue").innerHTML = e.target.innerHTML;
}

function attachEventHandlers(cb) {
    var inp = document.getElementById("maininput");
    inp.addEventListener("focus", getInputFocusHandler(inp), false);
    var myScroll = new IScroll('#letterchooser', { scrollX: true, scrollY: false, mouseWheel: true, tap: true });
    document.querySelector("#inner").addEventListener("tap", chooseLetter, false);
    document.addEventListener("touchmove", function(e) { e.preventDefault(); }, false);
    cb();
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
        attachEventHandlers,
        loadSavedGame
    );
}
document.addEventListener("DOMContentLoaded", startup);
