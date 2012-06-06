importScripts("chrome://smartfilters/content/util.js",
              "chrome://smartfilters/content/mailing-list.js",
              "chrome://smartfilters/content/result.js",
              "chrome://smartfilters/content/hashmap.js",
              "chrome://smartfilters/content/dispmua-smartfilters.js",
              "chrome://smartfilters/content/dispmua-data.js");

// global vars
const MAX = 5000;
var data;
var filtersMap = {
  "mailing list" : MailingListUtil,
  "robot"        : RobotUtil,
};

function range(from, to) {
  var arr = [];
  for(var i = from; i < to; i++)
    arr.push(i);
  return arr;
}

onmessage = function(event) {
  var type = event.data.id;
  if (type == 'start') {
    data = event.data.data;
    var allMessages = range(0, data.messages.length);
    var results = [new SmartFiltersResult(allMessages, [], "", "", {type : 'nothing', email : ""})];
    var util = new Util(data);
    var filters = data.filters;
    for (var i = 0; i < filters.length; i++) {
      var pref = filters[i].name;
      var filt = filtersMap[pref];
      if (filt) {
        var prevResults = results;
        results = [];
        for(var k = 0; k < prevResults.length; k++) {
          filt.prototype = util;
          var filter = new filt(filters[i].prefix);
          var result = filter.process(prevResults[k]);
          for(var j = 0; j < result.length; j++)
            results.push(result[j]);
        }
        postMessage({id : pref, results: results});
      }
    }
  }
  postMessage({id : "end"});
}