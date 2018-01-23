
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

// tweets the given status
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

        // do not tweet if the tweet is a reply or retweet
        if (isReply(tweet)) {
            return;
        }

        // remove any links
        var tweetText = tweet.extended_tweet.full_text.replace(/(?:https?|ftp):\/\/[\n\S]+/g,"")

        // replace words in tweet
        var toPost = replaceAllWords(tweetText).toLowerCase();

        // deal with ampersand
        toPost = toPost.replace(/\&amp;/g, "&");

        // add prefix if tweet is short enough
        if (toPost.length < 274
            && toPost.substring(0, 2) != "..") {
            toPost = addPrefix(toPost);
        }

        // post tweet to account
        postTweet(toPost);
    });
    stream.on('error', function (error) {
        console.log("Something went wrong with the stream.");
    });
}

// for testing
function runStreamTest() {
    // listen for tweets
    var stream = Twitter.stream('statuses/filter', { follow: testId });
    stream.on('tweet', function (tweet) {
        // do not tweet if the tweet is a reply or retweet
        if (isReply(tweet)) {
            return;
        }

        // remove any links
        var tweetText = tweet.extended_tweet.full_text.replace(/(?:https?|ftp):\/\/[\n\S]+/g,"")

        // replace words in tweet
        var toPost = replaceAllWords(tweetText).toLowerCase();

        // deal with ampersand
        toPost = toPost.replace(/\&amp;/g, "&");

        // add prefix if tweet is short enough
        if (toPost.length < 274
            && toPost.substring(0, 2) != "..") {
            toPost = addPrefix(toPost);
        }

        console.log(toPost);
    });
    stream.on('error', function (error) {
        console.log("Something went wrong with the stream.");
    });
}

// returns true if the given tweet is not an original tweet by the user
function isReply(tweet) {
    if ( tweet.retweeted_status
      || tweet.in_reply_to_status_id
      || tweet.in_reply_to_status_id_str
      || tweet.in_reply_to_user_id
      || tweet.in_reply_to_user_id_str
      || tweet.in_reply_to_screen_name )
      return true
}

// word -> slang word map
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
    amazing: "fuego",
    hot: "fire",
    greatest: "littest",
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
    be: "b",
    this: "dis",
    something: "smth",
    through: "thru"
}

// uses above wordMap to map words in string
function replaceAllWords(str) {
    var re = new RegExp("\\b(" + Object.keys(wordMap).join("|") + ")\\b", "gi");

    return str.replace(re, function(matched) {
        return wordMap[matched.toLowerCase()];
    });
}

// adds a prefix word to the given string
function addPrefix(str) {
    var prefixes = [
        "fam, ",
        "bruh, ",
        "tbh ",
        "yo, ",
        "imo ",
        "lmao "
    ]

    // choose a random prefix to prepend given string with
    var pre = prefixes[Math.floor(Math.random()*prefixes.length)];

    return pre + str;
}

//=============================================

// FOR PLAYING AROUND: Gets collection of tweets and posts them every 10 minutes
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


