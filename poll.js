var sprintf = require("sprintf-js").sprintf;

var https = require("https");
var cheerio = require("cheerio");

var stagger_request_seconds = 1;
var offices = {
"ALTURAS":537,"ARLETA":587,"ARVIN":661,"AUBURN":570,"BAKERSFIELD":529,"BAKERSFIELD SW":679,
"BANNING":641,"BARSTOW":582,"BELL GARDENS":576,"BELLFLOWER":606,"BISHOP":585,"BLYTHE":528,
"BRAWLEY":597,"CAPITOLA":550,"CARMICHAEL":625,"CHICO":520,"CHULA VISTA":613,"CLOVIS":580,
"COALINGA":603,"COLUSA":564,"COMPTON":581,"CONCORD":523,"CORTE MADERA":534,"COSTA MESA":628,
"CRESCENT CITY":524,"CULVER CITY":514,"DALY CITY":599,"DAVIS":598,"DELANO":615,"EL CAJON":669,
"EL CENTRO":527,"EL CERRITO":556,"EL MONTE":685,"EUREKA":526,"FAIRFIELD":621,"FALL RIVER MILLS":643,
"FOLSOM":655,"FONTANA":657,"FORT BRAGG":590,"FREMONT":644,"FRESNO":505,"FRESNO NORTH":646,
"FULLERTON":607,"GARBERVILLE":627,"GILROY":623,"GLENDALE":510,"GOLETA":670,"GRASS VALLEY":541,
"HANFORD":565,"HAWTHORNE":609,"HAYWARD":579,"HEMET":635,"HOLLISTER":546,"HOLLYWOOD":508,
"HOLLYWOOD WEST":652,"INDIO":578,"INGLEWOOD":610,"JACKSON":521,"KING CITY":647,"LAGUNA HILLS":605,
"LAKE ISABELLA":687,"LAKEPORT":530,"LANCASTER":595,"LINCOLN PARK":617,"LODI":622,
"LOMPOC":589,"LOMPOC DLPC":692,"LONG BEACH":507,"LOS ANGELES":502,"LOS ANGELES DLPC":693,
"LOS BANOS":650,"LOS GATOS":640,"MADERA":533,"MANTECA":658,"MARIPOSA":566,"MERCED":536,
"MODESTO":557,"MONTEBELLO":511,"MOUNT SHASTA":639,"NAPA":540,"NEEDLES":584,"NEWHALL":662,
"NORCO":586,"NOVATO":686,"OAKLAND CLAREMONT":504,"OAKLAND COLISEUM":604,"OCEANSIDE":596,
"OROVILLE":522,"OXNARD":636,"PALM DESERT":683,"PALM SPRINGS":659,"PALMDALE":690,"PARADISE":601,
"PASADENA":509,"PASO ROBLES":574,"PETALUMA":634,"PITTSBURG":592,"PLACERVILLE":525,"PLEASANTON":631,
"POMONA":532,"PORTERVILLE":573,"POWAY":676,"QUINCY":544,"RANCHO CUCAMONGA":612,"RED BLUFF":558,
"REDDING":551,"REDLANDS":626,"REDWOOD CITY":548,"REEDLEY":633,"RIDGECREST":577,"RIVERSIDE":545,
"RIVERSIDE EAST":656,"ROCKLIN":673,"ROSEVILLE":543,"SACRAMENTO":501,"SACRAMENTO SOUTH":602,
"SALINAS":539,"SAN ANDREAS":568,"SAN BERNARDINO":512,"SAN CLEMENTE":648,"SAN DIEGO":506,
"SAN DIEGO CLAIREMONT":519,"SAN FRANCISCO":503,"SAN JOSE":516,"SAN JOSE DLPC":645,
"SAN LUIS OBISPO":547,"SAN MARCOS":620,"SAN MATEO":593,"SAN PEDRO":619,"SAN YSIDRO":677,
"SANTA ANA":542,"SANTA BARBARA":549,"SANTA CLARA":632,"SANTA MARIA":563,"SANTA MONICA":616,
"SANTA PAULA":630,"SANTA ROSA":555,"SANTA TERESA":668,"SEASIDE":567,"SHAFTER":660,"SIMI VALLEY":680,
"SONORA":569,"SOUTH LAKE TAHOE":538,"STANTON DLPC":698,"STOCKTON":517,"SUSANVILLE":531,"TAFT":575,
"TEMECULA":672,"THOUSAND OAKS":663,"TORRANCE":608,"TRACY":642,"TRUCKEE":513,"TULARE":594,
"TULELAKE":553,"TURLOCK":649,"TWENTYNINE PALMS":638,"UKIAH":535,"VACAVILLE":588,"VALLEJO":554,
"VAN NUYS":515,"VENTURA":560,"VICTORVILLE":629,"VISALIA":559,"WALNUT CREEK":624,"WATSONVILLE":583,
"WEAVERVILLE":572,"WEST COVINA":618,"WESTMINSTER":611,"WHITTIER":591,"WILLOWS":571,"WINNETKA":637,
"WOODLAND":561,"YREKA":552,"YUBA CITY":562
};
// uncomment out the offices you would like to check.
var check = [
//	"ALTURAS",
//	"ARLETA",
//	"ARVIN",
//	"AUBURN",
//	"BAKERSFIELD",
//	"BAKERSFIELD SW",
//	"BANNING",
//	"BARSTOW",
//	"BELL GARDENS",
	"BELLFLOWER",
//	"BISHOP",
//	"BLYTHE",
//	"BRAWLEY",
//	"CAPITOLA",
//	"CARMICHAEL",
//	"CHICO",
//	"CHULA VISTA",
//	"CLOVIS",
//	"COALINGA",
//	"COLUSA",
//	"COMPTON",
//	"CONCORD",
//	"CORTE MADERA",
	"COSTA MESA",
//	"CRESCENT CITY",
	"CULVER CITY",
//	"DALY CITY",
//	"DAVIS",
//	"DELANO",
//	"EL CAJON",
//	"EL CENTRO",
//	"EL CERRITO",
//	"EL MONTE",
//	"EUREKA",
//	"FAIRFIELD",
//	"FALL RIVER MILLS",
//	"FOLSOM",
//	"FONTANA",
//	"FORT BRAGG",
//	"FREMONT",
//	"FRESNO",
//	"FRESNO NORTH",
//	"FULLERTON",
//	"GARBERVILLE",
//	"GILROY",
//	"GLENDALE",
//	"GOLETA",
//	"GRASS VALLEY",
//	"HANFORD",
	"HAWTHORNE",
//	"HAYWARD",
//	"HEMET",
//	"HOLLISTER",
	"HOLLYWOOD",
//	"HOLLYWOOD WEST",
//	"INDIO",
	"INGLEWOOD",
//	"JACKSON",
//	"KING CITY",
//	"LAGUNA HILLS",
//	"LAKE ISABELLA",
//	"LAKEPORT",
//	"LANCASTER",
//	"LINCOLN PARK",
//	"LODI",
//	"LOMPOC",
//	"LOMPOC DLPC",
	"LONG BEACH",
	"LOS ANGELES",
	"LOS ANGELES DLPC",
//	"LOS BANOS",
//	"LOS GATOS",
//	"MADERA",
//	"MANTECA",
//	"MARIPOSA",
//	"MERCED",
//	"MODESTO",
//	"MONTEBELLO",
//	"MOUNT SHASTA",
//	"NAPA",
//	"NEEDLES",
//	"NEWHALL",
//	"NORCO",
//	"NOVATO",
//	"OAKLAND CLAREMONT",
//	"OAKLAND COLISEUM",
//	"OCEANSIDE",
//	"OROVILLE",
//	"OXNARD",
//	"PALM DESERT",
//	"PALM SPRINGS",
//	"PALMDALE",
//	"PARADISE",
//	"PASADENA",
//	"PASO ROBLES",
//	"PETALUMA",
//	"PITTSBURG",
//	"PLACERVILLE",
//	"PLEASANTON",
//	"POMONA",
//	"PORTERVILLE",
//	"POWAY",
//	"QUINCY",
//	"RANCHO CUCAMONGA",
//	"RED BLUFF",
//	"REDDING",
//	"REDLANDS",
//	"REDWOOD CITY",
//	"REEDLEY",
//	"RIDGECREST",
//	"RIVERSIDE",
//	"RIVERSIDE EAST",
//	"ROCKLIN",
//	"ROSEVILLE",
//	"SACRAMENTO",
//	"SACRAMENTO SOUTH",
//	"SALINAS",
//	"SAN ANDREAS",
//	"SAN BERNARDINO",
	"SAN CLEMENTE",
//	"SAN DIEGO",
//	"SAN DIEGO CLAIREMONT",
//	"SAN FRANCISCO",
//	"SAN JOSE",
//	"SAN JOSE DLPC",
//	"SAN LUIS OBISPO",
//	"SAN MARCOS",
//	"SAN MATEO",
	"SAN PEDRO",
//	"SAN YSIDRO",
//	"SANTA ANA",
//	"SANTA BARBARA",
//	"SANTA CLARA",
//	"SANTA MARIA",
	"SANTA MONICA",
//	"SANTA PAULA",
//	"SANTA ROSA",
//	"SANTA TERESA",
//	"SEASIDE",
//	"SHAFTER",
//	"SIMI VALLEY",
//	"SONORA",
//	"SOUTH LAKE TAHOE",
//	"STANTON DLPC",
//	"STOCKTON",
//	"SUSANVILLE",
//	"TAFT",
//	"TEMECULA",
//	"THOUSAND OAKS",
	"TORRANCE",
//	"TRACY",
//	"TRUCKEE",
//	"TULARE",
//	"TULELAKE",
//	"TURLOCK",
//	"TWENTYNINE PALMS",
//	"UKIAH",
//	"VACAVILLE",
//	"VALLEJO",
//	"VAN NUYS",
//	"VENTURA",
//	"VICTORVILLE",
//	"VISALIA",
//	"WALNUT CREEK",
//	"WATSONVILLE",
//	"WEAVERVILLE",
//	"WEST COVINA",
//	"WESTMINSTER",
//	"WHITTIER",
//	"WILLOWS",
//	"WINNETKA",
//	"WOODLAND",
//	"YREKA",
//	"YUBA CITY",
];
function delayCheck(i, name) {
		setTimeout(function() {
			getEarliest(name);
		}, 1000*stagger_request_seconds*i);
}
for(var i in check) {
	delayCheck(i,check[i]);
}
//getEarliest(officeId);
function getEarliest(name) {
var id = offices[name];
var URL = "https://www.dmv.ca.gov/wasapp/foa/findOfficeVisit.do?officeId="+id+"&numberItems=1&taskRWT=true&firstName=fake&lastName=name&telArea=555&telPrefix=555&telSuffix=5555&resetCheckFields=true";
https.get(URL, function(res) {
       var str = '';
        //console.log('Response is '+res.statusCode);

        res.on('data', function (chunk) {
              //console.log('BODY: ' + chunk);
               str += chunk;
         });

        res.on('end', function () {
             //console.log(str);
             var $ = cheerio.load(str);
             var dateString = $("#ApptForm").parent().parent().parent().find("tr:nth-child(3) .alert").text().replace(" at "," ");
            // console.log(name+":\t"+dateString);
             var date = new Date(Date.parse(dateString));
             console.log(sprintf("%20s", name)+": "+formatDate(date));//.find("td:nth-child(2)"));
        });

}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
}
function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  var strTime = sprintf("%02d",hours) + ':' + sprintf("%02d",minutes) + ' ' + ampm;
  return sprintf("%02d",date.getMonth()+1) + "/" + sprintf("%02d",date.getDate()) + "/" + date.getFullYear() + " " + strTime;
}