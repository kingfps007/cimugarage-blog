// 暗色模式切换：localStorage 持久化，不跟随系统
(function() {
  var KEY = 'cimu-dark';
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var isDark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem(KEY, isDark ? 'dark' : 'light'); } catch (e) {}
  });
})();
