/**
 * 自动生成文章目录 (TOC)
 * 从 kb-main / blog-main article 中的 h2,h3 生成
 * 含平滑加速度滚动 (easeInOutCubic)
 */
(function() {
  var article = document.querySelector('.kb-main article, .blog-main article');
  var tocNav = document.getElementById('tocNav');
  if (!article || !tocNav) return;

  var headings = article.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    tocNav.innerHTML = '<span style="color:var(--text-secondary);font-size:18px;">暂无目录</span>';
    return;
  }

  headings.forEach(function(h) {
    var a = document.createElement('a');
    a.textContent = h.textContent;
    a.href = '#' + h.id;
    a.className = 'toc-' + h.tagName.toLowerCase();

    if (!h.id) {
      h.id = 'heading-' + Math.random().toString(36).substr(2, 8);
      a.href = '#' + h.id;
    }

    // 平滑加速度滚动
    a.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.getElementById(h.id);
      if (!target) return;
      smoothScrollTo(target.offsetTop - 80, 600);
      // 移动端关闭目录面板（kb 模式 + blog 模式）
      var tocKb = document.getElementById('kbToc');
      if (tocKb) tocKb.classList.remove('open');
      var tocBlog = document.getElementById('blogToc');
      if (tocBlog) tocBlog.classList.remove('open');
    });

    tocNav.appendChild(a);
  });

  // easeInOutCubic 平滑滚动
  function smoothScrollTo(targetY, duration) {
    var startY = window.scrollY;
    var diff = targetY - startY;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo(0, startY + diff * ease);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  // 滚动高亮
  var tocLinks = tocNav.querySelectorAll('a');
  if (tocLinks.length === 0) return;
  var headingElements = [];
  tocLinks.forEach(function(a) {
    var el = document.getElementById(a.getAttribute('href').replace('#',''));
    if (el) headingElements.push(el);
  });

  window.addEventListener('scroll', function() {
    var scrollPos = window.scrollY + 120;
    var activeIndex = -1;
    headingElements.forEach(function(el, i) {
      if (el.offsetTop <= scrollPos) activeIndex = i;
    });
    tocLinks.forEach(function(a) { a.classList.remove('active'); });
    if (activeIndex >= 0 && activeIndex < tocLinks.length) {
      tocLinks[activeIndex].classList.add('active');
    }
  });
})();
