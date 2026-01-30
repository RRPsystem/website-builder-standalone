// js/previewPage-standalone.js
// Standalone preview: uses sessionStorage/opener only, no API calls
(async function(){
  console.log('[Preview Standalone] Initializing...');

  // Get page content from sessionStorage or opener
  async function fetchPageHtml(){
    // First try: sessionStorage (works even without opener)
    try {
      const stored = sessionStorage.getItem('wb_preview_content');
      if (stored && stored.trim()) {
        console.log('✅ Using content from sessionStorage');
        sessionStorage.removeItem('wb_preview_content'); // Clean up
        return stored;
      }
    } catch (e) {
      console.warn('sessionStorage not available:', e);
    }
    
    // Second try: get from opener window (if opened from builder)
    if (window.opener) {
      try {
        const canvas = window.opener.document.getElementById('canvas');
        if (canvas && canvas.innerHTML && canvas.innerHTML.trim()) {
          console.log('✅ Using content from builder canvas (opener)');
          return canvas.innerHTML;
        } else {
          console.warn('Canvas is empty or not found');
        }
      } catch (e) {
        console.error('Cannot access opener:', e);
      }
    } else {
      console.warn('No window.opener available');
    }
    
    return '<div class="pv-main" style="padding:40px;text-align:center;"><h2>Preview niet beschikbaar</h2><p>Open preview vanuit de builder om je pagina te zien.</p></div>';
  }

  // Inject page content (no header/footer in standalone mode)
  const pageHtml = await fetchPageHtml();
  document.getElementById('pv-body').innerHTML = pageHtml || '<div style="padding:40px;text-align:center;color:#64748b;"><h2>Geen content</h2><p>Open preview vanuit de builder om je pagina te zien.</p></div>';

  // Initialize timeline behaviors
  try {
    const timelines = document.querySelectorAll('.roadbook-animated-timeline-section');
    timelines.forEach((timeline) => {
      const itineraryWrap = timeline.querySelector('#itinerary-wrap');
      const tube = itineraryWrap ? itineraryWrap.querySelector('.roadbook-road') : null;
      const line = itineraryWrap ? itineraryWrap.querySelector('.roadbook-road-line') : null;
      const itinerary = itineraryWrap ? itineraryWrap.querySelector('.itinerary') : null;
      if (itineraryWrap && tube && line && itinerary) {
        const updateRoadHeight = () => {
          const days = Array.from(itinerary.querySelectorAll('.day'));
          let height = 500;
          if (days.length > 0) {
            const lastDay = days[days.length - 1];
            height = Math.max(lastDay.offsetTop + lastDay.offsetHeight, 500);
          }
          tube.style.height = height + 'px';
          line.style.height = height + 'px';
        };
        updateRoadHeight();
        setTimeout(updateRoadHeight, 500);
        setTimeout(updateRoadHeight, 1200);
        window.addEventListener('resize', updateRoadHeight);
      }

      if (window.RoadbookTimelineAnimation) {
        new window.RoadbookTimelineAnimation(timeline);
      }
    });
  } catch (e) {
    console.warn('timeline init failed', e);
  }

  // Initialize roadbook destination media (slides/videos)
  try {
    const parseSlidesAttr = (raw) => {
      let s = String(raw || '').trim();
      if (!s) return [];
      try {
        s = s.replace(/&quot;/g, '"').replace(/&#34;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
      } catch (e0) {}
      try {
        let decoded = decodeURIComponent(s);
        try { if (/%5B|%7B|%22/i.test(decoded)) decoded = decodeURIComponent(decoded); } catch (e11) {}
        const parsed = JSON.parse(decoded);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e1) {}
      try {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e2) {}
      try {
        const parts = s.split(/\s*[\|,]\s*/g).map(p => p.trim()).filter(Boolean);
        return parts;
      } catch (e3) {}
      return [];
    };

    const initRoadbookDestinationMedia = (root) => {
      const wraps = Array.from((root || document).querySelectorAll('.placeImg'));
      wraps.forEach((wrap) => {
        try {
          const imgEl = wrap.querySelector('img');
          const videoSrc = wrap.getAttribute('data-wb-video-src') || '';
          if (videoSrc) {
            let videoEl = wrap.querySelector('video');
            if (!videoEl) {
              videoEl = document.createElement('video');
              videoEl.muted = true;
              videoEl.loop = true;
              videoEl.playsInline = true;
              videoEl.autoplay = true;
              videoEl.controls = true;
              videoEl.style.width = '100%';
              videoEl.style.height = '100%';
              videoEl.style.objectFit = 'cover';
              videoEl.style.position = 'absolute';
              videoEl.style.inset = '0';
              try { wrap.insertBefore(videoEl, wrap.firstChild); } catch (e8) { wrap.appendChild(videoEl); }
            }
            try { videoEl.src = videoSrc; } catch (e9) {}
            try { videoEl.load(); } catch (e10) {}
            try {
              if (imgEl) {
                const pic = imgEl.closest ? imgEl.closest('picture') : null;
                if (pic) pic.style.display = 'none';
                else imgEl.style.display = 'none';
              }
            } catch (e11) {}
            try {
              const prevBtn = wrap.querySelector('.wb-slide-prev');
              const nextBtn = wrap.querySelector('.wb-slide-next');
              if (prevBtn) prevBtn.style.display = 'none';
              if (nextBtn) nextBtn.style.display = 'none';
            } catch (e12) {}
            try { videoEl.style.display = ''; } catch (e13) {}
            try { videoEl.play(); } catch (e14) {}
            return;
          }

          const slidesAttrRaw = wrap.getAttribute('data-wb-slides') || '';
          let slides = parseSlidesAttr(slidesAttrRaw);
          slides = Array.isArray(slides) ? slides.filter(Boolean) : [];
          if (slides.length <= 1 || !imgEl) return;

          wrap._wbSlides = slides;

          const setIdx = (nextIdx) => {
            const slidesNow = Array.isArray(wrap._wbSlides) ? wrap._wbSlides : slides;
            const n = slidesNow.length;
            let idx = parseInt(String(nextIdx), 10);
            if (Number.isNaN(idx)) idx = 0;
            idx = ((idx % n) + n) % n;
            wrap.setAttribute('data-wb-slide-idx', String(idx));
            imgEl.src = slidesNow[idx];
          };

          const stop = () => {
            try {
              if (wrap._wbSlideTimer) {
                clearInterval(wrap._wbSlideTimer);
                wrap._wbSlideTimer = null;
              }
            } catch (e5) {}
          };

          const start = () => {
            try {
              if (wrap._wbSlideTimer) return;
              wrap._wbSlideTimer = window.setInterval(() => {
                try {
                  const slidesNow = Array.isArray(wrap._wbSlides) ? wrap._wbSlides : slides;
                  if (!slidesNow || slidesNow.length <= 1) return;
                  const idx = parseInt(wrap.getAttribute('data-wb-slide-idx') || '0', 10) || 0;
                  setIdx(idx + 1);
                } catch (e3) {}
              }, 4500);
            } catch (e4) {}
          };

          try {
            const prevBtn = wrap.querySelector('.wb-slide-prev');
            const nextBtn = wrap.querySelector('.wb-slide-next');
            if (prevBtn) prevBtn.style.display = '';
            if (nextBtn) nextBtn.style.display = '';
          } catch (e20) {}

          try {
            const bindNav = (selector, delta) => {
              const b = wrap.querySelector(selector);
              if (!b || b.dataset.wbBound === '1') return;
              b.dataset.wbBound = '1';
              b.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                const idx = parseInt(wrap.getAttribute('data-wb-slide-idx') || '0', 10) || 0;
                setIdx(idx + delta);
                stop();
              }, true);
            };
            bindNav('.wb-slide-prev', -1);
            bindNav('.wb-slide-next', 1);
          } catch (e8) {}

          wrap.addEventListener('mouseenter', stop);
          wrap.addEventListener('mouseleave', start);

          setIdx(parseInt(wrap.getAttribute('data-wb-slide-idx') || '0', 10) || 0);
          start();
        } catch (eWrap) {}
      });
    };

    initRoadbookDestinationMedia(document);
    setTimeout(() => initRoadbookDestinationMedia(document), 600);
  } catch (e) {
    console.warn('roadbook media init failed', e);
  }

  // Initialize roadbook route maps
  try {
    if (window.ComponentFactory && typeof window.ComponentFactory.initRoadbookRouteMaps === 'function') {
      window.ComponentFactory.initRoadbookRouteMaps(document);
      setTimeout(() => { try { window.ComponentFactory.initRoadbookRouteMaps(document); } catch (e2) {} }, 800);
    }
  } catch (e) {
    console.warn('roadbook route map init failed', e);
  }

  console.log('[Preview Standalone] Initialization complete');
})();
