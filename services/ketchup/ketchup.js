var express = require("express"),
    app = express(),
    HttpStatus = require("http-status-codes"),
    morgan = require("morgan")

const cheerio = require('cheerio')
const superagent = require('superagent')

//LOGGING
//don't show log when it is test
if(process.env.NODE_ENV !== "test"){
    //use morgan to log at command line with Apache style
    app.use(morgan("combined"))
}

app.get('/', function (req, res) {
    res.redirect("/empty")
})

baseURL = "https://www.rottentomatoes.com/m/"

app.get('/:id', function (req, res) {
    console.log("INF: Request for " + req.params.id)

    //check whether URL is empty
    if(req.params.id !== "empty") {
        //TODO: check database for valid entry to avoid asking rotten tomatoes again
        //get HTML of requested URL
        superagent.get(baseURL + req.params.id)
            .end((err, response) => {
                if (err) {
                    error = "ERR: got a " + err.status + " for "+  baseURL + req.params.id + " 😭😭😭"
                    console.log(error)
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    res.send(error)
                } else {
                    //parse HTML for tomatoUserRating
                    var $ = cheerio.load(response.text)
                    tomatoUserRatingRaw = $("div.meter-value").find("span").text()
                    //check whether rating could be found
                    indexOfPercentageCharacter = tomatoUserRatingRaw.indexOf("%")
                    if(indexOfPercentageCharacter != -1) {
                        //cut off % of rating
                        tomatoUserRating = tomatoUserRatingRaw.substring(0, indexOfPercentageCharacter)
                        //TODO: check whether rating can be - or N/A or similar and act
                        //respond with rating
                        console.log("INF: Got it! ✌️  Rating is: " + tomatoUserRating + " for " + req.params.id)
                        res.status(HttpStatus.OK)
                        res.json({tomatoUserRating})
                        //TODO: save rating in database to cache result
                    } else {
                        error = "ERR: couldn't find a rating for " + req.params.id + " - sorry 😭😭😭"
                        console.log(error)
                        res.send(error)
                    }
                }
            }
        )
    } else {
        error = "ERR: URL missing"
        console.log(error)
        res.status(HttpStatus.EXPECTATION_FAILED)
        res.send(error)
    }
});

//PORT is defined by environment variable or 8080
const PORT = process.env.PORT || 8080
const HOST = '0.0.0.0'
const MODE = process.env.NODE_ENV || "default"
const RELEASE = process.env.RELEASE || "snapshot"
app.listen(PORT, HOST, () => {
    console.log("🍅🍅🍅 KETCHUP - happy squeezing!")
    console.log(RELEASE + " started on " + HOST + ":" + PORT)
    console.log("mode: " + MODE)
})

//expose for integration testing with mocha
module.exports = app