var Q = require("q");
var querystring = require('querystring');
var sprintf = require("sprintf-js").sprintf;
var text = require("mtextbelt");
var gm = require('googlemaps');
var https = require("https");
var cheerio = require("cheerio");
var geolib = require("geolib");



var settings = require("./config.json");
var dmvInfo = require("./DMV_Info.json");
var found = {};
console.log("Checking every "+settings.checkEveryMinutes+" minutes, at DMV offices "+settings.maxDistanceMiles+" miles from "+settings.home);
if(settings.textOnFind) {
  console.log("Will text "+settings.textNumber+" when a match is found.");
}




// Main programming flow
Q.fcall(getHomeLocation(settings.home))
  .then(getNearbyDMV(dmvInfo, settings.maxDistanceMiles))
  .then(checkLoop(settings))
  .catch(function(e){console.log(e);});




/**
 * Check Loop
 * @param  {settings} settings User Settings
 * @return {None}          Never actually returns
 */
function checkLoop(settings) {
  return function(dmvInfo) {
    var promise = Q.resolve();
    for(var i in dmvInfo) {
        promise = promise
          .then(makeDMVRequest(dmvInfo[i], settings))
          .then(checkAppointmentResult(dmvInfo[i].name, settings.dayOfWeeks))
          .delay(1000*settings.secondsBetweenRequests);
          
    }
    return promise.then(function() {
      return Q.resolve(dmvInfo);
    }).delay(settings.checkEveryMinutes*1000*60).fail(function(e){
            console.log("Error: "+JSON.stringify(e));
          }).then(checkLoop(settings));
  };
}

/**
 * Make DMV Request
 *
 * Makes a https request to the DMV website and returns the data as a promise
 * @param  {Object} dmvInfo  DMV's information
 * @param  {Object} settings User Settings
 * @return {Promise}         Promise to return the data
 */
function makeDMVRequest(dmvInfo, settings) {
  return function() {
    
    var deferred = Q.defer();
    try {
      var url="www.dmv.ca.gov";
      var path;
      var post_data = settings.appointmentInfo;
      post_data.officeId = dmvInfo.id;
      post_data.numberItems = 1;

      if(settings.behindTheWheelTest) {
        path = "/wasapp/foa/findDriveTest.do";
        post_data.requestedTask="DT";
      } else {
        path = "/wasapp/foa/findOfficeVisit.do";
        post_data.taskRWT = true;
      }


      var postString = querystring.stringify(post_data);
      var headers = {
        'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13',

        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postString.length
      };

      var options = {
        host: url,
        port: 443,
        path: path,
        method: 'POST',
        headers: headers
      };

      // Setup the request.  The options parameter is
      // the object we defined above.

      var req = https.request(options, function(res) {
        res.setEncoding('utf-8');
        var responseString = '';

        res.on('data', function(data) {
          responseString += data;
        });

        res.on('end', function() {
          deferred.resolve(responseString);
        });
        req.on('error', function(e) {
          deferred.reject(e);
        });
      });



      req.write(postString);
      req.end();
    } catch(e) {
      deferred.reject(e);
    }
    return deferred.promise;
    
  };
}










/**
 * Get Home Location
 *
 * Returns promise for the gps coordinates of the home address
 * @param  {String} home Home Address
 * @return {Object}      Promise for GPS Coordinates
 */
function getHomeLocation(home) {
  return function() {
  var deferred = Q.defer();
    gm.geocode(home, function(err, data){
      if(!err && data.hasOwnProperty("results") && data.results.hasOwnProperty(0) && data.results[0].hasOwnProperty("geometry")) {
        var coords = data.results[0].geometry.location;
        deferred.resolve(coords);
      } else {
        deferred.reject("Could not find your home location.");
      }
    });
    return deferred.promise;
  };
}

/**
 * Get Nearby DMVs
 * Get all DMVs within a radius
 * @param  {Object} dmvInfo           All DMV information
 * @param  {Integer} maxDistanceMiles Max distance to travel from Home
 * @return {Function}                 Function to pass to Q
 */
function getNearbyDMV(dmvInfo, maxDistanceMiles) {
  /**
   * @param  {[type]} homeLocation GPS Coordinates of home
   * @return {[type]}              An array of DMVs
   */
  return function(homeLocation) {
    var validDMVLocations = [];
    for(var dmvName in dmvInfo) {
      var distance = geolib.getDistance(
          {latitude: homeLocation.lat, longitude:homeLocation.lng},
          {latitude: dmvInfo[dmvName].lat, longitude: dmvInfo[dmvName].lng}
      );
      var distanceMiles = 0.000621371*distance;
      if(distanceMiles <= maxDistanceMiles) {
        var obj = dmvInfo[dmvName];
        obj.name = dmvName;
        obj.distanceMiles = distanceMiles;
        validDMVLocations.push(obj);
      }
    }
    return validDMVLocations;

  };
}
/**
 * Check appointment results
 * @param  {String} name     DMV Name
 * @param  {Object} schedule Schedule of classes
 * @return {function}        returns a function for Q to call
 */
function checkAppointmentResult(name, schedule) {
  /**
   * @param  {String} str HTML results of the page request
   */
  return function(str) {
    var $ = cheerio.load(str);

    var dateString = $("#ApptForm").parent().parent().parent().find("tr:nth-child(3) .alert").text().replace(" at "," ");
     console.log(name+":\t"+dateString);
    var date = new Date(Date.parse(dateString));
    var timeDiff = (date - (new Date()));
    // verify saturday

    // only on a saturday
    var daysUntil = timeDiff/1000/60/60/24;
    for(var day in schedule) {
      // why is triple equals not working?
      var isDayOfWeek = parseInt(day) === parseInt(date.getDay());
      //console.log(schedule[day].allowed)
      var withinTime = date.getHours() >= schedule[day].startHour &&
                        date.getHours() < schedule[day].endHour;
      var withinDays = daysUntil < settings.findAppointmentWithinDays;
      //console.log("within "+settings.findAppointmentWithinDays+" days: "+withinDays);
      if(withinDays && isDayOfWeek && withinTime && schedule[day].allowed) {

        if(!found[dateString+name]) {
          found[dateString+name] = true;
          console.log("FOUND NEW MATCH! \007 \n");

          if(settings.textOnFind) {
            text.send(settings.textNumber, sprintf("%20s", name)+": "+formatDate(date), function(){});
          }
        } else {
          console.log("found duplicate match!");
        }
      }

    }
  };
}



/**
 * Format Date
 * @param  {Date}        date 
 * @return {String}      Human readable date
 */
function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  var strTime = sprintf("%02d",hours) + ':' + sprintf("%02d",minutes) + ' ' + ampm;
  return sprintf("%02d",date.getMonth()+1) + "/" + sprintf("%02d",date.getDate()) + "/" + date.getFullYear() + " " + strTime;
}