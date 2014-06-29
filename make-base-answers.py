import string, json, codecs

answers = {}

for letter in string.uppercase:
    # fake answer looks like B Bb bbb BBBB Bbbbbb
    fake_answer = ("%(l)s %(l)s%(u)s %(u)s%(u)s%(u)s %(l)s%(l)s%(l)s%(l)s "
            "%(l)s%(u)s%(u)s%(u)s%(u)s") % {"l":letter, "u": letter.lower()}
    answers[letter] = {
        "answer": fake_answer,
        "clue": "Answer is %s" % (fake_answer,)
    }
fp = codecs.open("base-answers.json", "w", "utf8")
fp.write(json.dumps(answers, indent=4))
fp.close()
