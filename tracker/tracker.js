(function () {
  var script = document.currentScript;
  var API = script && script.src
    ? new URL(script.src).origin
    : 'http://localhost:5000';

  var KEY = 'cf_session_id';
  var sid = null;
  try { sid = localStorage.getItem(KEY); } catch (e) {}
  if (!sid) {
    sid = 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    try { localStorage.setItem(KEY, sid); } catch (e) {}
  }

  function base(type) {
    return {
      session_id: sid,
      type: type,
      page_url: location.origin + location.pathname,
      timestamp: new Date().toISOString()
    };
  }

  function send(ev) {
    try {
      fetch(API + '/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  send(base('page_view'));

  document.addEventListener('click', function (e) {
    var ev = base('click');
    ev.x = Math.round(e.pageX);
    ev.y = Math.round(e.pageY);
    ev.page_width = document.documentElement.scrollWidth;
    ev.page_height = document.documentElement.scrollHeight;
    send(ev);
  }, true);
})();