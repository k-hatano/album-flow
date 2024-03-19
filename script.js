
const TOPSONGS_URL_HTTPS = "https://itunes.apple.com/us/rss/topsongs/country=jp/cc=jp/l=jp/limit=50/xml";
const TOPSONGS_URL = "http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/ws/RSS/topsongs/country=jp/cc=jp/l=jp/limit=50/xml";

// 143462

let SF = undefined;

onload = _ => {
  initialize();
  loadTopSongs(result => loadedTopSongs(result));
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
  console.dir(params);
  if (params['sf'] != undefined) {
    SF = params['sf'];
  }
  //document.getElementById('feed_frame').addEventListener('load', loadedTopSongsFromFrame);
}

function loadTopSongs(callback) {
  // const request = new XMLHttpRequest();
  // request.addEventListener("load", callback, false);
  // let url = TOPSONGS_URL;
  // request.open("GET", url);
  // request.send(null);

  let url = TOPSONGS_URL;
  if (location.href.indexOf('https://') == 0) {
    url = TOPSONGS_URL_HTTPS;
  }
  if (SF != undefined) {
    url = url.replace("/xml", "/sf=" + SF + "/xml");
  }
    console.log(url);

  jQuery.ajax({
    crossDomain:true,
    url:url,
    method: "GET"
  }).then(result => {
    loadedTopSongs(result);
  });
}

function loadedTopSongs(result) {
  $("#loading").attr('class', 'hidden');
  let title = result.getElementsByTagName('title');
  console.dir(title);
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
        $(titleElem).text(child.textContent);
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
    select: function() {
      $('.coverflow .cover img').reflect();
    },
    change: function() {
      $('.coverflow .cover img').reflect();
    }
  });
  $('.coverflow .cover img').reflect();
}
