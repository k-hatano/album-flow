
const TOPSONGS_URL = "http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/ws/RSS/topsongs/country=jp/cc=jp/l=jp/sf=143462/limit=50/xml";

onload = _ => {
  loadTopSongs(result => loadedTopSongs(result));
};

function initialize() {

}

function loadTopSongs(callback) {
  const request = new XMLHttpRequest();
  request.addEventListener("load", callback);
  request.open("GET", TOPSONGS_URL);
  request.send();
}

function loadedTopSongs(result) {
  // console.dir(result.target.response);
  const parser = new DOMParser();
  const doc = parser.parseFromString(result.target.response, 'application/xml');
  const entries = doc.getElementsByTagName('entry');
  for (let i = 0; i < entries.length; i++) {
    let imgElem = $('<img></img>');
    let anchorElem = $('<a></a>').attr('target', '_blank');
    const children = Array.from(entries[i].children);
    // console.dir(children);
    children.forEach(child => {
      if (child.nodeName == 'id') {
        $(anchorElem).attr('href', child.textContent);
      }
      if (child.nodeName == 'title') {
        $(imgElem).attr('name', child.textContent);
      }
      if (child.nodeName == 'im:image') {
        $(imgElem).attr('src', child.textContent);
      }
    });
    $(anchorElem).append(imgElem);
    $('#result').append(anchorElem);
  }
}
