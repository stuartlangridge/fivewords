function loadSavedGame(cb) { console.log("in loadSavedGame"); cb(); }
function loadAnswers(cb) { console.log("in loadAnswers"); cb(); }
function arrangeScreen(cb) { console.log("in arrangeScreen"); cb(); }

function getInputFocusHandler(inp) {
    var before = inp.offsetHeight;
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
            inp.style.top = (before - document.body.scrollTop - inp.offsetHeight - 10) + "px";
            inp.style.bottom = "auto";
            document.body.scrollTop = 0;
          } else {
            inp.style.top = inp.offsetTop + "px";
            inp.style.bottom = "auto";
            document.body.scrollTop = 0;
          }
        }, 0);
    };
}

function attachEventHandlers(cb) {
    var inp = document.getElementById("maininput");
    inp.addEventListener("focus", getInputFocusHandler(inp), false);
    document.addEventListener("touchmove", function(e) { e.preventDefault(); }, false);
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
        loadSavedGame,
        loadAnswers,
        arrangeScreen
    );
}
document.addEventListener("DOMContentLoaded", startup);
