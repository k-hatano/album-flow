
const TOPSONGS_URL_HTTPS = "https://itunes.apple.com/us/rss/topsongs/country=us/cc=us/l=us/limit=50/xml";
const TOPSONGS_URL = "http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/ws/RSS/topsongs/country=us/cc=us/l=us/limit=50/xml";

const STOREFRONT_MAPPING_PATH = "2208578ba151d1d7c4edeeda15b4e9b1/storefrontmappings.json";

// 143462

let SF = undefined;
let L = undefined;

onload = _ => {
  initialize();
  loadTopSongs(result => {
    loadedTopSongs(result);
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
}

function storefrontChanged(event) {
  SF = event.target.value;
  L = $("select#storefront option:selected").attr("name").toLowerCase();
  loadTopSongs(result => {
    loadedTopSongs(result);
    updateCoverFlow();
  });
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

function loadTopSongs(callback) {
  $("#loading").attr('class', '');
  $("div.cover").remove();

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

function loadedTopSongs(result) {
  $("#loading").attr('class', 'hidden');
  let title = result.getElementsByTagName('title');
  $('#chart_title').text(title[0].textContent);
  const entries = result.getElementsByTagName('entry');
  for (let i = 0; i < entries.length; i++) {
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
    index: 0,
    select: function() {
      updateCoverFlow();
    },
    change: function() {
      updateCoverFlow();
    }
  });
  $('.coverflow').coverflow('refresh');
  $('.coverflow .cover img').reflect();
}

function updateCoverFlow(e) {
  $("#title_link").text($(".cover.current img").attr("name"));
  $("#title_link").attr("href", $(".cover.current a").attr("href"));
  $('.coverflow .cover img').reflect();
}