function toggleTreeNode(el) {
  el.classList.toggle('collapsed');
  var children = el.parentElement.querySelector('.tree-children');
  if (children) {
    children.style.display = children.style.display === 'none' ? 'block' : 'none';
  }
}

// v3.0 通用化：kb 模式（kbSidebar）| blog 模式（blogArticleList）
function toggleSidebar() {
  // 同时支持两种 id
  var sidebar = document.getElementById('kbSidebar') || document.getElementById('blogArticleList');
  if (!sidebar) return;
  var wasOpen = sidebar.classList.contains('open');
  if (typeof closeAllPanels === 'function') closeAllPanels();
  if (!wasOpen) sidebar.classList.add('open');
}

function toggleToc() {
  var toc = document.getElementById('kbToc');
  if (!toc) return;
  var wasOpen = toc.classList.contains('open');
  if (typeof closeAllPanels === 'function') closeAllPanels();
  if (!wasOpen) toc.classList.add('open');
}

function toggleKbSwitcher(e) {
  e.stopPropagation();
  var dd = document.getElementById('kbSwitcherDropdown');
  if (dd) dd.classList.toggle('show');
}

document.addEventListener('click', function(e) {
  var dd = document.getElementById('kbSwitcherDropdown');
  if (dd && dd.classList.contains('show') && !e.target.closest('.kb-switcher')) {
    dd.classList.remove('show');
  }
  // kb 模式侧边栏
  var kbSidebar = document.getElementById('kbSidebar');
  if (kbSidebar && kbSidebar.classList.contains('open') && !e.target.closest('#kbSidebar') && !e.target.closest('.sidebar-toggle')) {
    kbSidebar.classList.remove('open');
  }
  // blog 模式侧边栏
  var blogList = document.getElementById('blogArticleList');
  if (blogList && blogList.classList.contains('open') && !e.target.closest('#blogArticleList') && !e.target.closest('.sidebar-toggle')) {
    blogList.classList.remove('open');
  }
  // 通用 TOC
  var toc = document.getElementById('kbToc');
  if (toc && toc.classList.contains('open') && !e.target.closest('#kbToc') && !e.target.closest('.toc-toggle')) {
    toc.classList.remove('open');
  }
});

(function() {
  var currentPath = window.location.pathname.replace(/\/$/, '');

  // 高亮侧边栏树中的当前文章（kb 模式）
  function normPath(p) {
    return (p || '').replace(/\/$/, '').replace(/\.html$/, '').replace(/^\//, '');
  }
  var cn = normPath(currentPath);
  document.querySelectorAll('.kb-sidebar .tree a').forEach(function(link) {
    var href = normPath(link.getAttribute('href') || '');
    if (href === cn) {
      link.classList.add('current');
    }
  });

  // KB 切换逻辑（仅 kb 模式生效，blog 模式没有 kbSwitcherData）
  var dataEl = document.getElementById('kbSwitcherData');
  if (!dataEl) return;
  try {
    var data = JSON.parse(dataEl.textContent);
    var activeKb = null;
    var norm = function(p) { return p.replace(/\/$/, '').replace(/\.html$/, '').replace(/^\//, ''); };
    var cn = norm(currentPath);

    for (var id in data.paths) {
      if (!data.paths.hasOwnProperty(id)) continue;
      var matched = data.paths[id].some(function(p) {
        var c = norm(p);
        return cn === c || cn === c + '/index';
      });
      if (matched) { activeKb = id; break; }
    }
    if (!activeKb) {
      for (var kid in data.paths) {
        if (!data.paths.hasOwnProperty(kid)) continue;
        var matched = data.paths[kid].some(function(p) {
          var c = norm(p);
          if (c.length > 4 && c.indexOf('kb/') >= 0) return cn.indexOf(c) >= 0;
          return false;
        });
        if (matched) { activeKb = kid; break; }
      }
    }

    if (activeKb) {
      var label = document.getElementById('currentKbLabel');
      if (label && data.names[activeKb]) label.textContent = data.names[activeKb];
      var opts = document.querySelectorAll('.kb-option');
      opts.forEach(function(o) { o.classList.toggle('active', o.dataset.kb === activeKb); });
      for (var kw in data.paths) {
        if (data.paths.hasOwnProperty(kw)) {
          var nav = document.getElementById('nav-' + kw);
          if (nav) nav.style.display = kw === activeKb ? 'block' : 'none';
        }
      }
      document.querySelectorAll('.kb-option').forEach(function(l) {
        l.classList.toggle('active', l.getAttribute('data-kb') === activeKb);
      });
    }
  } catch(e) {}
})();
