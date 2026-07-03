var searchData = null;
var searchLoading = false;
var searchDebounce = null;

function loadSearchData() {
  if (searchData) return Promise.resolve(searchData);
  if (searchLoading) return new Promise(function(resolve) {
    var check = setInterval(function() {
      if (searchData !== null) { clearInterval(check); resolve(searchData); }
    }, 100);
  });
  searchLoading = true;

  return fetch('/search.xml')
    .then(function(response) {
      if (!response.ok) throw new Error('Network error');
      return response.text();
    })
    .then(function(text) {
      var parser = new DOMParser();
      var xml = parser.parseFromString(text, 'text/xml');
      parseXML(xml);
      searchLoading = false;
    })
    .catch(function() {
      searchLoading = false;
      searchData = [];
    });
}

function parseXML(xml) {
  searchData = [];
  var entries = xml.getElementsByTagName('entry');
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    searchData.push({
      title: getText(entry, 'title'),
      url: getText(entry, 'url'),
      content: getText(entry, 'content')
    });
  }
}

function getText(parent, tag) {
  var el = parent.getElementsByTagName(tag)[0];
  return el ? (el.textContent || el.innerText || '') : '';
}

function doSearch() {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var query = input.value.trim().toLowerCase();

  if (query.length < 2) {
    results.innerHTML = '';
    return;
  }

  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(function() {
    loadSearchData().then(function() { showResults(query, results); });
  }, 300);
}

function showResults(query, resultsEl) {
  if (!query || query.length < 2) return;
  if (!searchData || searchData.length === 0) {
    resultsEl.innerHTML = '<div class="no-results">暂无搜索数据</div>';
    return;
  }

  var matches = [];
  searchData.forEach(function(item) {
    var score = 0;
    var titleLower = item.title.toLowerCase();
    var contentLower = item.content.toLowerCase();
    if (titleLower.indexOf(query) >= 0) score += 100;
    if (contentLower.indexOf(query) >= 0) score += contentLower.split(query).length - 1;
    if (score > 0) matches.push({ item: item, score: score });
  });

  matches.sort(function(a, b) { return b.score - a.score; });
  matches = matches.slice(0, 10);

  if (matches.length === 0) {
    resultsEl.innerHTML = '<div class="no-results">未找到相关结果</div>';
  } else {
    resultsEl.innerHTML = matches.map(function(m) {
      return '<a class="result-item" href="' + m.item.url + '">' +
        '<span class="result-title">' + highlightMatch(m.item.title, query) + '</span>' +
        '<br><span>' + highlightMatch(trimContent(m.item.content, 80), query) + '</span>' +
        '</a>';
    }).join('');
  }
}

function highlightMatch(text, query) {
  var re = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

function trimContent(content, len) {
  var text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > len ? text.substring(0, len) + '...' : text;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
