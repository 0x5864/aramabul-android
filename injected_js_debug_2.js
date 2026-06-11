
        try { localStorage.setItem('aramabul.auth.session.v1', '$sessionJson'); } catch(e) {}
        try { document.dispatchEvent(new CustomEvent('aramabul:authchange')); } catch(e) {}
        window.location.href = window.location.href.split('#')[0] + '?t=' + Date.now();
      