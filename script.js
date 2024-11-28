
const TOPSONGS_URL_HTTPS = "https://itunes.apple.com/us/rss/topsongs/country=us/cc=us/l=us/limit=10/xml";
const TOPSONGS_URL = "http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/ws/RSS/topsongs/country=us/cc=us/l=us/limit=10/xml";

const STOREFRONT_MAPPING_PATH = "2208578ba151d1d7c4edeeda15b4e9b1/storefrontmappings.json";

// 143462

let SF = undefined;
let L = undefined;

let gLimit = 10;
let gMock = false;

let gPressingPrev = false;
let gPressingNext = false;
let gRefusePrev = false;
let gRefuseNext = false;

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
  if (params['mock'] != undefined) {
    gMock = params['mock'] == 'true';
  }

  loadStorefrontMappings(function(result){
    $('select#storefront option[id!=""]').remove();
    for (key in result) {
      var option = $("<option></option>").attr({
        "id": result[key].storefrontId,
        "value": result[key].storefrontId,
        "name": result[key].code,
        "checked": (result[key].storefrontId == SF || result[key].code == SF)
      }).text(result[key].name);
      $("select#storefront").append(option);
    }
  });

  $('div#song_list_content').text();
  $("select#storefront").on('change', storefrontChanged);
  $("button#button_prev").on('mousedown', prevMouseDown);
  $("button#button_prev").on('mouseup', prevMouseUp);
  $("button#button_prev").on('mouseleave', prevMouseUp);
  $("button#button_prev").on('click', prevClicked);
  $("button#button_next").on('mousedown', nextMouseDown);
  $("button#button_next").on('mouseup', nextMouseUp);
  $("button#button_next").on('mouseleave', nextMouseUp);
  $("button#button_next").on('click', nextClicked);
  $("button#close_song_list").on('click', closeSongList);
  $("button#toggle_song_list").on('click', toggleSongList);
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
  if (gRefusePrev) {
    gRefusePrev = false;
    event.stopPropagation();
    return;
  }
  if ($('.coverflow').coverflow('index') == 0) {
    $("div#song_list").attr("class", "");
  } else {
    if (event.altKey) {
      $('.coverflow').coverflow('index', 0);
    } else {
      $('.coverflow').coverflow('index', $('.coverflow').coverflow('index') - 1);
    }
  }
  
  event.stopPropagation();
}

function prevMouseDown(event) {
  gPressingPrev = true;
  setTimeout(prevPressing, 1000);
  event.stopPropagation();
}

function prevMouseUp(event) {
  gPressingPrev = false;
  event.stopPropagation();
}

function prevPressing() {
  if (gPressingPrev == false || parseInt($('.coverflow').coverflow('index')) == 0) {
    return;
  }
  gRefusePrev = true;
  $('.coverflow').coverflow('index',$('.coverflow').coverflow('index') - 1);
  setTimeout(prevPressing, 250);
}

function nextClicked(event) {
  if (gRefuseNext) {
    gRefuseNext = false;
    event.stopPropagation();
    return;
  }
  if (event.altKey) {
    $('.coverflow').coverflow('index', -1);
  } else {
    $('.coverflow').coverflow('index',$('.coverflow').coverflow('index') + 1);
  }
  event.stopPropagation();
}

function nextMouseDown(event) {
  gPressingNext = true;
  setTimeout(nextPressing, 1000);
  event.stopPropagation();
}

function nextMouseUp(event) {
  gPressingNext = false;
  event.stopPropagation();
}

function nextPressing() {
  if (gPressingNext == false) {
    return;
  }
  gRefuseNext = true;
  $('.coverflow').coverflow('index',$('.coverflow').coverflow('index') + 1);
  setTimeout(nextPressing, 250);
}

function titleAreaClicked(event) {
  if ($("#title_area")[0].className.indexOf('darken') >= 0) {
    $("#title_area").attr('class', '');
    $(".button_area").attr('class', 'button_area');
    $("#storefront").attr('class', '');
    $("#toggle_song_list").attr('class', 'circle_button');
  } else {
    $("#title_area").attr('class', 'darken');
    $(".button_area").attr('class', 'button_area hidden');
    $("#storefront").attr('class', 'hidden');
    $("#toggle_song_list").attr('class', 'circle_button hidden');

    if ($("div#song_list")[0].className.indexOf("gone") < 0) {
      $("div#song_list").attr("class", "gone");
    }
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
      $("#album_background").attr("class", "album_background");
      setTimeout(function(){
        $("#album_back").html(getAlbumIframeHTML(aHref));
      }, 750);
      $(".cover.current").attr("class", "cover current hidden");
    } else {
      $(".cover.current").attr("class", "cover current");
      $("#album").attr("class", "album leaving");
      $("#album").attr("class", "album gone");
      $("#album_back").attr("class", "album_back gone");
      $("#album_container").attr("class", "album_container gone");
      $("#album_background").attr("class", "album_background gone");
      $("#album_back").html("");
    }
  }
}

function albumClicked(event) {
  console.log("albumClicked");
  console.dir(event);
  var aHref = $(".cover.current a").attr("href");
  $(".cover.current").attr("class", "cover current hidden");
  $("#album_back").attr("class", "album_back gone");
  $("#album_back").html("");
  $("#album").attr("class", "album leaving");
  $("#album").attr("class", "album gone");
  $("#album_background").attr("class", "album_background leaving");
  $("#album_background").attr("class", "album_background gone");
  setTimeout(function(){
    $("#album_container").attr("class", "album_container gone");
    $(".cover.current").attr("class", "cover current");
  }, 750);
}

function getAlbumIframeHTML(aHref) {
  var iframeSrc = aHref.replace("https://music.apple.com/", "https://embed.music.apple.com/");

  var result = "<iframe allow='autoplay *; encrypted-media *; fullscreen *; clipboard-write' " + 
    "frameborder='0' height='450' style='margin: 16px;width:calc(100% - 32px);overflow:hidden;border-radius:10px;' " +
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
    $('div#song_list_content').text("");
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
  if (gMock) {
    url = 'mock.xml';
  }
  console.log(url);

  jQuery.ajax({
    crossDomain:true,
    url:url,
    method: "GET"
  }).then(result => {
    console.log(result);
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
    let songListItemScript = "javascript:$(\'.coverflow\').coverflow(\'index\', " + i +")";
    let songListItemAnchor = $("<a href='javascript:void(0);'></a>").attr("href", songListItemScript);
    const children = Array.from(entries[i].children);
    children.forEach(child => {
      if (child.nodeName == 'id') {
        $(anchorElem).attr('href', child.textContent);
        $(titleElem).attr('href', child.textContent);
      }
      if (child.nodeName == 'title') {
        $(imgElem).attr('name', child.textContent);
        // $(titleElem).text(child.textContent);
        songListItemAnchor.text(child.textContent);
      }
      if (child.nodeName == 'im:image') {
        $(imgElem).attr('src', child.textContent);
      }
    });
    $(anchorElem).append(imgElem);
    $(coverElem).append(imgElem).append(titleElem);
    $('#result').append(coverElem);

    let songListItem = $("<li></li>").append(songListItemAnchor);
    $('div#song_list_content').append(songListItem);
  }
  $('.coverflow').coverflow({
    select: function(e) {
      updateCoverFlow();
      if (e.target.__coverflow_frame >= gLimit - 3) {
        gLimit += 10;
        loadTopSongs(gLimit - 10, result => {
          loadedTopSongs(gLimit - 10, result);
          updateCoverFlow();
        });
      }
    },
    change: function(e) {
      updateCoverFlow();
      if (e.target.__coverflow_frame >= gLimit - 3) {
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

function loadRest() {
  gLimit += 10;
  $("#load_rest").text("Loading...");
  loadTopSongs(gLimit - 10, result => {
    loadedTopSongs(gLimit - 10, result);
    updateCoverFlow();
    $("#load_rest").text("Load rest");
  });
}

function updateCoverFlow(e) {
  $("#title_link").text($(".cover.current img").attr("name"));
  $("#title_link").attr("href", $(".cover.current a").attr("href"));
  $('.coverflow .cover img').reflect();

  if ($(".coverflow").coverflow("index") == 0) {
    $("#button_prev").text("≡");
  } else {
    $("#button_prev").text("<");
  }
}

function toggleSongList() {
  if ($("div#song_list")[0].className.indexOf("gone") >= 0) {
    $("div#song_list").attr("class", "");
  } else {
    $("div#song_list").attr("class", "gone");
  }
}

function closeSongList() {
  $("div#song_list").attr("class", "gone");
}