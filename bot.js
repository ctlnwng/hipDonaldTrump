
// DEPENDENCIES ===============================
// require Twitter library
var twit = require('twit');
// require configuration
var config = require('./config.js');

// pass consumer/access tokens to twit
var Twitter = new twit(config);
//=============================================

var trumpId = '25073877';
var testId = '920144750627508225';

//=============================================

console.log("The bot is starting...");
runStream();

// gets collection of tweets and posts them every 10 minutes
function getTweet() {
    var params = {
        user_id: trumpId,
        count: 10,
        max_id: '922951009277825024'
    }

    Twitter.get('statuses/user_timeline', params, callback);

    function callback(error, data, response) {
        var tweets = data;
        if (error) {
            console.log("Something went wrong");
        }
        else {
            var interval, i = tweets.length - 1;
            
            function dostuff() {
                var newMsg = replaceAllWords(tweets[i].text);
                console.log(newMsg);
                postTweet(newMsg);

                if(i > 0) i--;
                else clearInterval(interval);
            }
            
            interval = setInterval(dostuff, 1000 * 60);
        }
    }
}

// tweets given message
function postTweet(msg) {
    Twitter.post('statuses/update', { status: msg }, function (error, tweet, response) {
        if (error) {
            console.log(error);
        }
        console.log(tweet.text);  // Tweet body.
        // console.log(response);  // Raw response object.
    });
}

// tweets every time donald trump sends out a tweet
function runStream() {
    // listen for tweets
    var stream = Twitter.stream('statuses/filter', { follow: trumpId });
    stream.on('tweet', function (tweet) {
        if (isReply(tweet)) {
            return;
        }

        var tweetText = tweet.text.toLowerCase();
        var toPost = replaceAllWords(tweetText);
        toPost = toPost.replace(/\&amp;/g, "&");
        if (toPost.length < 134
            && toPost.substring(0, 4) != "...") {
            toPost = addPrefix(toPost);
        }
        postTweet(toPost);
    });
    stream.on('error', function (error) {
        console.log("Something went wrong with the stream.");
    });
}

function addPrefix(str) {
    var prefixes = [
        "Fam, ",
        "Bruh, ",
        "Tbh ",
        "Yo, "
    ]

    var pre = prefixes[Math.floor(Math.random()*prefixes.length)];

    return pre + str;
}

function runStreamTest() {
    // listen for tweets
    var stream = Twitter.stream('statuses/filter', { follow: testId });
    stream.on('tweet', function (tweet) {
        if (isReply(tweet)) {
            return;
        }

        var tweetText = tweet.text;
        var toPost = replaceAllWords(tweetText).toLowerCase();
        toPost = toPost.replace(/\&amp;/g, "&");

        if (toPost.length < 134
            && toPost.substring(0, 4) != "...") {
            toPost = addPrefix(toPost);
        }
        console.log(toPost);
    });
    stream.on('error', function (error) {
        console.log("Something went wrong with the stream.");
    });
}

function isReply(tweet) {
    if ( tweet.retweeted_status
      || tweet.in_reply_to_status_id
      || tweet.in_reply_to_status_id_str
      || tweet.in_reply_to_user_id
      || tweet.in_reply_to_user_id_str
      || tweet.in_reply_to_screen_name )
      return true
}

var wordMap = {
    and: "n",
    you: "u",
    your: "ur",
    with: "w",
    very: "v",
    love: "luv",
    thanks: "ty",
    for: "4",
    people: "ppl",
    great: "lit",
    amazing: "lit",
    greatest: "littest",
    finest: "littest",
    will: "finna",
    extremely: "hella",
    totally: "hella",
    really: "rlly",
    good: "gucci",
    big: "thicc",
    large: "dank",
    massive: "THICC",
    largest: "dankest",
    biggest: "thiccest",
    me: "ya boi",
    nice: "dank",
    be: "b"
}

function replaceAllWords(str) {
    var re = new RegExp("\\b(" + Object.keys(wordMap).join("|") + ")\\b", "gi");

    return str.replace(re, function(matched) {
        return wordMap[matched.toLowerCase()];
    });
}

/*

// constructs new status from the given tweet with some words replaced with slang
function constructStatus(str) {
    // split given string into words
    var splitTweet = str.split(" ");
    var newTweet = "";

    // for every word, replace if able to
    for (var i = 0; i < splitTweet.length; i++) {
        var before = "";
        var after = "";
        var current = splitTweet[i].toLowerCase();

        if (i > 0) {
            before = splitTweet[i - 1].toLowerCase();
        }

        if (i < splitTweet.length - 1) {
            before = splitTweet[i + 1].toLowerCase();
        }

        if (i == splitTweet.length - 1) {
            newTweet = newTweet + replaceWord(current, before, after);
        }
        else {
            newTweet = newTweet + replaceWord(current, before, after) + " ";
        }
    }
    return newTweet;
}

// replaces given word, looking at the word before and after if needed
function replaceWord(word, before, after) {
    var prev = before;
    switch (word) {
        // shorten tweet
        case "and":
            return "n";
            break;
        case "you":
            return "u";
            break;
        case "your":
        case "you're":
            return "ur";
            break;
        case "for":
            return "4";
            break;
        case "with":
            return "w";
            break;
        case "people":
            return "ppl";
            break;
        case "thanks":
            return "ty";
            break;
        case "love":
            return "luv";
            break;
        case "very":
            return "v";
            break;

        // slang    
        case "great":
        case "amazing":
            return "lit";
            break;
        case "wonderful":
            return "fire";
        case "will":
        case "going to":
            return "finna";
            break;
        case "extremely":
        case "really":
        case "so many":
        case "totally":
            return "hella";
            break;
        case "me":
            return "ya boi";
            break;
        case "finest":
        case "greatest":
            return "littest";
            break;
        case "good":
            return "gucci";
            break;
        case "big":
        case "large":
        case "massive":
        case "huge":
            return "thicc";
            break;
        case "biggest":
            return "thiccest";
            break;
        case "money":
        case "dollars":
            return "shh-money";
            break;
        case "news":

            if (prev == "fake") {
                return "bitches";
            }
            else { return word; }
            break;
        case "democrats":
        case "dems":
            return "thots";
        case "democrat":
            return "thot";
        default:
            return word;
            break;
    }
}
*/

