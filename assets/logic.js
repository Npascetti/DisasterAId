function createButtons(i, response) {
  var button = $('<button>').attr({
    id: "disasterButton" + i, //+ i to assign incremented id's
    class: "fluid ui orange button DISBUTTON"
  });
  $(button).text(response.data[i].fields.name);
  $("#disasterDiv").append(button);
}

//creates job description link for <a> tag in job list//
function createJobDescriptions(j, response) {
  let jobsDescriptionQuery = response.data[j].href;
  //call to get job url for <a> href//
  $.ajax({
    url: jobsDescriptionQuery,
    method: "GET"
  })
  .then(function(response) {
    $( `#jobAnchor${j}` ).attr({
      href: response.data[0].fields.url_alias
    })
  })
}

function createEventListener(i, response, myMap, lat, lon) {
  $("#disasterButton" + i).click(function () {
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let formattedDate = new Date(response.data[i].fields.date.created.substring(0,19))
    console.log(formattedDate.toLocaleDateString("en-US", options));
    $(".disLocation").text("");
    $("#disType").text(response.data[i].fields.primary_type.name + " in ");
    $("#disDate").text(formattedDate.toLocaleDateString("en-US", options))
    $(".disLocation").append(response.data[i].fields.primary_country.name);
    $("#jobsInfo").text("");
    $("#disDescription").html(response.data[i].fields["description-html"]);
    myMap(lat, lon);
    var localJobs = response.data[i].fields.primary_country.name;
    var jobsQuery = "https://api.reliefweb.int/v1/jobs?appname=apidoc&filter[field]=country&filter[value]=" + localJobs;
    $.ajax({
      url: jobsQuery,
      method: "GET"
    })
      .then(function (response) {
        for (j = 0; j < response.data.length; j++) {
          $("#jobsInfo").append(
            $("<a>").attr({
              id: "jobAnchor" + j,
              class: "jobsInfoElement",
              target:"_blank"
            })
            .text(response.data[j].fields.title))
          $( `#jobAnchor${j}` ).wrap( "<li class='jobListElement'></li>" );
          createJobDescriptions(j, response);
        }
      });
  });
}

//on ready
$(document).ready(function () {
$('.ui.accordion').accordion({ exclusive: false });
  function myMap(lat, lon) {
    var mapProp = {
      center: new google.maps.LatLng(lat, lon),
      zoom: 5,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
  }
  // myMap();

  //query for disasters
  var queryURL = "https://api.reliefweb.int/v1/disasters?profile=full&limit=10&sort[]=date:desc"



  //ajax call
  $.ajax({
    url: queryURL,
    method: "GET"
  })

    .then(function (response) {

      //iterate through the response data
      for (var i = 0; i < response.data.length; i++) {

        var countryName = response.data[i].fields.primary_country.name;
        var lat = response.data[i].fields.primary_country.location.lat;
        var lon = response.data[i].fields.primary_country.location.lon;
        //console.log(response.data[i].fields.primary_country.location.lat);

        //call createButtons
        createButtons(i, response);
        //ajax job call
        createEventListener(i, response, myMap, lat, lon);
      }

      $("#disasterButton0").click();


    });


});
