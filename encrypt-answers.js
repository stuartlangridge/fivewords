#!/usr/bin/node
var utils = require("./www-core/utils.js"),
    fs = require("fs");


function readAnswers(callback) {
    var answers = {};
    // First, read the base answers file
    fs.readFile("base-answers.json", function(err, json) {
        if (err) return callback(err);
        answers = JSON.parse(json);
        // Then override it with the real answers file, if it exists, which is not in github
        fs.readFile("real-answers.json", function(err, json) {
            if (err) return callback(null, answers);
            var ranswers = JSON.parse(json);
            for (var k in ranswers) {
                answers[k] = ranswers[k];
            }
            callback(null, answers);
        });
    });
}

function computeHashes(answers, callback) {
    var hashed = {};
    for (var k in answers) {
        var template = [];
        var answer = [];
        answers[k].answer.split(" ").forEach(function(word) {
            answer.push(utils.checksum(utils.strip(encodeURIComponent(answers[k].clue) + word)));
            var wtempl = [];
            for (var i=0; i<word.length; i++) {
                var l = word.charAt(i);
                if (l >= "A" && l <= "Z") {
                    wtempl.push("A");
                } else if (l >= "a" && l <= "z") {
                    wtempl.push("a");
                } else if (l == " ") {
                    wtempl.push(" ");
                } else {
                    throw new Error("Found unknown character '" + l + "' in answer '" + answers[k].answer + "'");
                }
            }
            template.push(wtempl.join(""));
        });

        hashed[k] = {
            clue: encodeURIComponent(answers[k].clue),
            answer: answer,
            template: template
        };
    }
    callback(hashed);
}

if(require.main === module) {
    readAnswers(function(err, answers) {
        computeHashes(answers, function(hashed) {
            fs.writeFile("./www-core/answers.js", "var ANSWERS = " + JSON.stringify(hashed, null, 4), function(err) {
                if (err) throw err;
                console.log("Written OK.");
            });
        });
    });
}
