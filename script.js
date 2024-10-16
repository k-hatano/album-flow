
const TOPSONGS_URL_HTTPS = "https://itunes.apple.com/us/rss/topsongs/country=us/cc=us/l=us/limit=10/xml";
const TOPSONGS_URL = "http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/ws/RSS/topsongs/country=us/cc=us/l=us/limit=10/xml";

const STOREFRONT_MAPPING_PATH = "2208578ba151d1d7c4edeeda15b4e9b1/storefrontmappings.json";

// 143462

let SF = undefined;
let L = undefined;

let gLimit = 10;

onload = _ => {
  initialize();
  loadTopSongs(0, result => {
    loadedTopSongs(0, result);
    updateCoverFlow();
  });
};

function initialize() {
  var params = {};
  var query = window.location.href.split("?")[1];
  if (query) {
      var rawParams = query.split('&');
      for (var i = 0; i < rawParams.length; i++) {
          var pair = rawParams[i].split('=');
          params[pair[0]] = pair[1];
      }
  }
  if (params['sf'] != undefined) {
    SF = params['sf'];
  }
  if (params['l'] != undefined) {
    L = params['l'];
  }

  loadStorefrontMappings(function(result){
    $('select#storefront option[id!=""]').remove();
    for (key in result) {
      var option = $("<option></option>").attr({
        "id": result[key].storefrontId,
        "value": result[key].storefrontId,
        "name": result[key].code
      }).text(result[key].name);
      $("select#storefront").append(option);
    }
  });

  $("select#storefront").on('change', storefrontChanged);
  $("button#button_prev").on('click', prevClicked);
  $("button#button_next").on('click', nextClicked);
  $("div#title_area").on('click', titleAreaClicked);
  $("div#album").on('click', albumClicked);
}

function storefrontChanged(event) {
  gLimit = 10;
  SF = event.target.value;
  L = $("select#storefront option:selected").attr("name").toLowerCase();
  loadTopSongs(0, result => {
    loadedTopSongs(0, result);
    updateCoverFlow();
  });
}

function prevClicked(event) {
  if (event.altKey) {
    $('.coverflow').coverflow('index', 0);
  } else {
    $('.coverflow').coverflow('index', $('.coverflow').coverflow('index') - 1);
  }
  
  event.stopPropagation();
}

function nextClicked(event) {
  if (event.altKey) {
    $('.coverflow').coverflow('index', -1);
  } else {
    $('.coverflow').coverflow('index',$('.coverflow').coverflow('index') + 1);
  }
  event.stopPropagation();
}

function titleAreaClicked(event) {
  if ($("#title_area")[0].className.indexOf('darken') >= 0) {
    $("#title_area")[0].className = '';
  } else {
    $("#title_area")[0].className = 'darken';
  }
}

function coverClicked(event) {
  console.log("coverClicked");
  if (event.currentTarget && event.currentTarget.className.indexOf("current") >= 0) {
    var aHref = $(".cover.current a").attr("href");
    console.log(aHref);
    var imgSrc = $(".cover.current img").attr("src");
    if (imgSrc != undefined) {
      $("#album_img").attr("src", imgSrc);
    }
    if ($("#album_container")[0].className.indexOf("gone") >= 0) {
      $("#album").attr("class", "album");
      $("#album_back").attr("class", "album_back");
      $("#album_container").attr("class", "album_container");
      setTimeout(function(){
        $("#album_back").html(getAlbumIframeHTML(aHref));
      }, 500);
      // $(".cover.current").attr("class", "cover current hidden");
    } else {
      $(".cover.current").attr("class", "cover current");
      $("#album").attr("class", "album gone");
      $("#album_back").attr("class", "album_back gone");
      $("#album_container").attr("class", "album_container gone");
      $("#album_back").html("");
    }
  }
}

function albumClicked(event) {
  console.log("albumClicked");
  console.dir(event);
  var aHref = $(".cover.current a").attr("href");
  $(".cover.current").attr("class", "cover current");
  $("#album").attr("class", "album gone");
  $("#album_back").attr("class", "album_back gone");
  $("#album_container").attr("class", "album_container gone");
  $("#album_back").html("");
}

function getAlbumIframeHTML(aHref) {
  var iframeSrc = aHref.replace("https://music.apple.com/", "https://embed.music.apple.com/");

  var result = "<iframe allow='autoplay *; encrypted-media *; fullscreen *; clipboard-write' " + 
    "frameborder='0' height='450' style='width:100%;max-width:660px;overflow:hidden;border-radius:10px;' " +
    "sandbox='allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation' "+
    "src='" + iframeSrc + "'></iframe>";

  return result;
}

function loadStorefrontMappings(callback) {
  jQuery.ajax({
    crossDomain:true,
    dataType:'json',
    isLocal:true,
    url:STOREFRONT_MAPPING_PATH,
    method: "GET"
  }).then(result => {
    if (callback != undefined) {
      callback(result);
    }
  });
}

function loadTopSongs(appendFrom, callback) {
  if (appendFrom == 0) {
    $("div.cover").remove();
    $("#loading").attr('class', '');
    $("#chart_title").text("").attr("href", "javascript:void(0);");
    $("#title_link").text("");
    $("#title_link").attr("href", "javascript:void(0);");
  }

  let url = TOPSONGS_URL;
  if (location.href.indexOf('https://') == 0) {
    url = TOPSONGS_URL_HTTPS;
  }
  if (SF != undefined) {
    url = url.replace("/xml", "/sf=" + SF + "/xml");
  }
  if (L != undefined) {
    var oldurl = "";
    while (url != oldurl) {
      oldurl = url;
      url = url.replace("us", L);
    }
  }
  if (gLimit > 10) {
    url = url.replace("/limit=10/", "/limit=" + gLimit + "/");
  }
  console.log(url);

  jQuery.ajax({
    crossDomain:true,
    url:url,
    method: "GET"
  }).then(result => {
    if (callback != undefined) {
      callback(result);
    }
  });
}

function loadedTopSongs(appendFrom, result) {
  console.dir(result);
  $("#loading").attr('class', 'hidden');
  let title = result.getElementsByTagName('title');
  $('#chart_title').text(title[0].textContent);
  console.dir(result.getElementsByTagName("link"));
  $('#chart_title').attr("href", result.getElementsByTagName("link")[0].getAttribute("href"));
  const entries = result.getElementsByTagName('entry');
  for (let i = 0; i < entries.length; i++) {
    if (i < appendFrom) {
      continue;
    }
    let imgElem = $('<img></img>');
    let coverElem = $('<div class="cover"></div>');
    let anchorElem = $('<a></a>').attr('target', '_blank');
    let titleElem = $('<a target="_blank" class="song_title"></a>');
    const children = Array.from(entries[i].children);
    children.forEach(child => {
      if (child.nodeName == 'id') {
        $(anchorElem).attr('href', child.textContent);
        $(titleElem).attr('href', child.textContent);
      }
      if (child.nodeName == 'title') {
        $(imgElem).attr('name', child.textContent);
        // $(titleElem).text(child.textContent);
      }
      if (child.nodeName == 'im:image') {
        $(imgElem).attr('src', child.textContent);
      }
    });
    $(anchorElem).append(imgElem);
    $(coverElem).append(imgElem).append(titleElem);
    $('#result').append(coverElem);
  }
  $('.coverflow').coverflow({
    select: function(e) {
      updateCoverFlow();
      if (e.target.__coverflow_frame >= gLimit - 4) {
        gLimit += 10;
        loadTopSongs(gLimit - 10, result => {
          loadedTopSongs(gLimit - 10, result);
          updateCoverFlow();
        });
      }
    },
    change: function(e) {
      updateCoverFlow();
      if (e.target.__coverflow_frame >= gLimit - 4) {
        gLimit += 10;
        loadTopSongs(gLimit - 10, result => {
          loadedTopSongs(gLimit - 10, result);
          updateCoverFlow();
        });
      }
    }
  });
  if (appendFrom == 0) {
    $('.coverflow').coverflow({index: 0});
    $('.coverflow').coverflow('refresh');
  }
  $('.coverflow').coverflow('refresh');
  $('.coverflow .cover img').reflect();
  $("div.cover").off('click');
  $("div#album_container").off('click');
  $("div.cover").on('click', coverClicked);
  $("div#album_container").on('click', albumClicked);
}

function updateCoverFlow(e) {
  $("#title_link").text($(".cover.current img").attr("name"));
  $("#title_link").attr("href", $(".cover.current a").attr("href"));
  $('.coverflow .cover img').reflect();
}