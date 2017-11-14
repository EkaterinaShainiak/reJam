(function () {
  /**
       * Obtains parameters from the hash of the URL
       * @return Object
       */
  function getHashParams() {
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ((e = r.exec(q))) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  var userProfileSource = document.getElementById("user-profile-template")
    .innerHTML,
    userProfileTemplate = Handlebars.compile(userProfileSource),
    userProfilePlaceholder = document.getElementById("user-profile");

  var oauthSource = document.getElementById("oauth-template").innerHTML,
    oauthTemplate = Handlebars.compile(oauthSource),
    oauthPlaceholder = document.getElementById("oauth");

  var params = getHashParams();

  var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

  if (error) {
    alert("There was an error during the authentication");
  } else {
    if (access_token) {
      // render oauth info
      oauthPlaceholder.innerHTML = oauthTemplate({
        access_token: access_token,
        refresh_token: refresh_token
      });

      $.ajax({
        url: "https://api.spotify.com/v1/me",
        headers: {
          Authorization: "Bearer " + access_token
        },
        success: function (response) {
          userProfilePlaceholder.innerHTML = userProfileTemplate(response);

          $("#login").hide();
          $("#loggedin").show();
        }
      });
    } else {
      // render initial screen
      $("#login").show();
      $("#loggedin").hide();
    }

    document.getElementById("obtain-new-token").addEventListener(
      "click",
      function () {
        $.ajax({
          url: "/refresh_token",
          data: {
            refresh_token: refresh_token
          }
        }).done(function (data) {
          access_token = data.access_token;
          oauthPlaceholder.innerHTML = oauthTemplate({
            access_token: access_token,
            refresh_token: refresh_token
          });
        });
      },
      false
    );
    var setlistSongs;

    $("searchButton").on("click", function(){
      var setlistResponse;
      var userSearch = $("#input").text();
      console.log(userSearch);
      var setlistObj = searchSetlist(userSearch);
      listSetList(setlistObj);
    });
 
    function listSetList(obj) {
      for (var i = 0; i < obj.setlist.length; i++) {
        //display the reponse's venue city and date for all the results
        var a = $("<div><p>" + obj.setlist[i].venue + " " + obj.setlist[i].venue.city.name + "," + obj.setlist[i].venue.city.stateCode + " " + obj.setlist[i].eventDate + " " + obj.setlist[i].id + "</p></div>")
        $(a).attr({
          "idName": "response" + i,
          "idHash": obj.setlist[i].venue.id,
          "class": "aReponse"
        });
      }
    }

    $(".aResponse").on("click", function () {
      var id = this.idHash;
      setlistSongs = searchSetlist(id);
      listSetList(setListSongs);
    });



    // document.getElementById("check-album-search").addEventListener(
    //   "click",
    //   function() {
    //     $.ajax({
    //       url: "https://api.spotify.com/v1/search",
    //       headers: {
    //         Accept: "application / json",
    //         Authorization: "Bearer " + access_token
    //       },
    //       data: {
    //         q: "muse+absolution",
    //         type: "album"
    //       }
    //     }).done(function(data) {
    //       console.log(data);
    //     });
    //   },
    //   false
    // );

    function searchSpotify(searchString, searchType) {
      $.ajax({
        url: "/search_spotify",
        data: {
          q: searchString,
          type: searchType,
          access_token: access_token
        }
      }).done(function (data) {
        console.log(data);
        return data;
      });
    }

    function searchSetlist(searchString) {
      $.ajax({
        url: "/search_setlist",
        data: {
          artistName: searchString
        }
      }).done(function (data) {
        console.log(data);
        return data;
      });
    }
  }
})();
