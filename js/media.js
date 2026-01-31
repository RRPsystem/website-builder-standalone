// Simple Media Picker Modal
// Provides: MediaPicker.openImage(), MediaPicker.openVideo()
// Optional: window.MEDIA_CONFIG = { unsplashKey: '' }

class MediaPicker {
  static openImage(options = {}) {
    return this._open({ type: 'image', ...options });
  }

  static openVideo(options = {}) {
    return this._open({ type: 'video', ...options });
  }

  static _open({ type = 'image', defaultTab, searchQuery, multi = false, single = false } = {}) {
    return new Promise((resolve, reject) => {
      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'mp-overlay';
      // Drawer
      const drawer = document.createElement('div');
      drawer.className = 'mp-drawer';

      // Header
      const header = document.createElement('div');
      header.className = 'mp-header';
      header.innerHTML = `
        <h3>Media Selector</h3>
        <button class="mp-close"><i class="fas fa-times"></i></button>
      `;

      // Body with tabs
      const body = document.createElement('div');
      body.className = 'mp-body';
      body.innerHTML = `
        <div class="media-tabs">
          <button class="btn btn-secondary tab-btn active" data-tab="upload"><i class="fas fa-upload"></i> Upload</button>
          <button class="btn btn-secondary tab-btn" data-tab="unsplash"><i class="fab fa-unsplash"></i> Unsplash</button>
          <button class="btn btn-secondary tab-btn" data-tab="pexels"><i class="fas fa-video"></i> Pexels</button>
          <button class="btn tab-btn" data-tab="pixabay" style="background: #00ab6c; color: #fff; font-weight: 600; border: 2px solid #00ab6c;"><i class="fas fa-leaf"></i> Pixabay</button>
          <button class="btn tab-btn" data-tab="storyblocks" style="background: #eab308; color: #000; font-weight: 600; border: 2px solid #eab308;"><i class="fas fa-film"></i> Storyblocks</button>
          <button class="btn btn-secondary tab-btn" data-tab="my-videos"><i class="fas fa-film"></i> Mijn Video's</button>
        </div>

        <div class="tab-content" data-tab="upload">
          <input type="file" class="form-control" accept="${type === 'image' ? 'image/*' : 'video/*'}" />
          <p class="mp-help">Kies een bestand van je computer.</p>
        </div>

        <div class="tab-content" data-tab="unsplash" style="display:none;">
          <div class="mp-row" style="margin-bottom: 16px;">
            <input type="text" class="form-control unsplash-query" placeholder="Zoekterm (bv. mountains, beach)" value="travel" style="flex: 1; padding: 12px; font-size: 14px;" />
            <button class="btn btn-primary btn-lg unsplash-search" style="margin-left: 8px;"><i class="fas fa-search"></i> Zoeken</button>
          </div>
          <div class="unsplash-grid"></div>
          <div class="mp-row mp-between mp-more-row">
            <p class="unsplash-note" style="font-size: 12px; color: #666;"></p>
            <div style="display:flex; gap:12px; align-items:center;">
              <span class="unsplash-selected-count" style="font-size: 14px; color: #2563eb; font-weight: 600; display:none;">0 geselecteerd</span>
              <button class="btn btn-success unsplash-use-selected" disabled style="display:none;">Gebruik Geselecteerde</button>
              <button class="btn btn-primary btn-lg unsplash-more" disabled>Laad meer afbeeldingen</button>
            </div>
          </div>
        </div>

        <div class="tab-content" data-tab="pexels" style="display:none;">
          <div class="mp-row">
            <input type="text" class="form-control pexels-query" placeholder="Zoek video's (bv. Paris travel, beach sunset)" />
            <button class="btn btn-primary btn-lg pexels-search"><i class="fas fa-search"></i></button>
          </div>
          <div class="mp-help" style="margin-bottom: 12px; padding: 10px; background: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 4px;">
            <strong>✨ Multi-select:</strong> Klik op meerdere video's om een playlist te maken. Ze spelen automatisch achter elkaar af!
          </div>
          <div class="pexels-grid"></div>
          <div class="mp-row mp-between mp-more-row">
            <p class="pexels-note"></p>
            <div style="display: flex; gap: 12px; align-items: center;">
              <span class="pexels-selected-count" style="font-size: 14px; color: #22c55e; font-weight: 600;">0 video's geselecteerd</span>
              <button class="btn btn-success pexels-use-selected" disabled style="background: #22c55e;">Gebruik Geselecteerde</button>
              <button class="btn btn-primary btn-lg pexels-more" disabled>Laad meer</button>
            </div>
          </div>
        </div>

        <div class="tab-content" data-tab="pixabay" style="display:none;">
          <div class="mp-row">
            <input type="text" class="form-control pixabay-query" placeholder="Zoek gratis video's (bv. Dublin travel, nature drone)" />
            <button class="btn btn-primary btn-lg pixabay-search"><i class="fas fa-search"></i></button>
          </div>
          <div class="mp-help" style="margin-bottom: 12px; padding: 10px; background: #ecfdf5; border-left: 3px solid #00ab6c; border-radius: 4px;">
            <strong>🌿 Gratis Video's:</strong> Pixabay biedt gratis stock video's met goede geografische tagging. Multi-select voor playlists!
          </div>
          <div class="pixabay-grid"></div>
          <div class="mp-row mp-between mp-more-row">
            <p class="pixabay-note"></p>
            <div style="display: flex; gap: 12px; align-items: center;">
              <span class="pixabay-selected-count" style="font-size: 14px; color: #00ab6c; font-weight: 600;">0 video's geselecteerd</span>
              <button class="btn pixabay-use-selected" disabled style="background: #00ab6c; color: #fff; font-weight: 600;">Gebruik Geselecteerde</button>
              <button class="btn btn-lg pixabay-more" disabled style="background: #00ab6c; color: #fff; font-weight: 600;">Laad meer</button>
            </div>
          </div>
        </div>

        <div class="tab-content" data-tab="storyblocks" style="display:none;">
          <div class="mp-row">
            <input type="text" class="form-control storyblocks-query" placeholder="Zoek premium video's (bv. aerial city, nature)" />
            <button class="btn btn-primary btn-lg storyblocks-search"><i class="fas fa-search"></i></button>
          </div>
          <div class="mp-help" style="margin-bottom: 12px; padding: 10px; background: #fefce8; border-left: 3px solid #eab308; border-radius: 4px;">
            <strong>🎬 Premium Content:</strong> Storyblocks biedt professionele stock video's. Multi-select voor playlists!
          </div>
          <div class="storyblocks-grid"></div>
          <div class="mp-row mp-between mp-more-row">
            <p class="storyblocks-note"></p>
            <div style="display: flex; gap: 12px; align-items: center;">
              <span class="storyblocks-selected-count" style="font-size: 14px; color: #eab308; font-weight: 600;">0 video's geselecteerd</span>
              <button class="btn storyblocks-use-selected" disabled style="background: #eab308; color: #000; font-weight: 600;">Gebruik Geselecteerde</button>
              <button class="btn btn-lg storyblocks-more" disabled style="background: #eab308; color: #000; font-weight: 600;">Laad meer</button>
            </div>
          </div>
        </div>

        <div class="tab-content" data-tab="my-videos" style="display:none;">
          <div class="mp-row mp-between">
            <p class="my-videos-note">Jouw gegenereerde video's</p>
            <button class="btn btn-primary btn-lg my-videos-refresh"><i class="fas fa-sync-alt"></i> Ververs</button>
          </div>
          <div class="my-videos-grid"></div>
          <div class="my-videos-empty" style="display:none; text-align:center; padding:40px; color:#666;">
            <i class="fas fa-film" style="font-size:48px; margin-bottom:16px; opacity:0.3;"></i>
            <p>Nog geen video's gegenereerd</p>
            <p style="font-size:14px;">Gebruik de Video Generator om je eerste video te maken!</p>
          </div>
        </div>
      `;

      drawer.appendChild(header);
      drawer.appendChild(body);
      document.body.appendChild(overlay);
      document.body.appendChild(drawer);

      // Animate in
      requestAnimationFrame(() => {
        overlay.classList.add('open');
        drawer.classList.add('open');
      });

      const close = (e) => {
        if (e) e.stopPropagation();
        overlay.classList.remove('open');
        drawer.classList.remove('open');
        setTimeout(() => {
          try {
            if (overlay && overlay.parentNode) document.body.removeChild(overlay);
            if (drawer && drawer.parentNode) document.body.removeChild(drawer);
          } catch (err) {
            console.warn('Media Picker close error:', err);
          }
        }, 200);
        resolve(null); // Resolve with null when closed
      };
      
      const closeBtn = header.querySelector('.mp-close');
      if (closeBtn) {
        closeBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          close(e);
        };
      }
      
      overlay.onclick = (e) => {
        if (e.target === overlay) close(e);
      };

      // Tabs behavior
      const tabs = Array.from(body.querySelectorAll('.tab-btn'));
      const panes = Array.from(body.querySelectorAll('.tab-content'));
      const setTab = (name) => {
        console.log('[MediaPicker] Switching to tab:', name);
        tabs.forEach(t => {
          const isActive = t.getAttribute('data-tab') === name;
          if (isActive) {
            t.classList.add('active');
          } else {
            t.classList.remove('active');
          }
        });
        panes.forEach(p => {
          const isVisible = p.getAttribute('data-tab') === name;
          p.style.display = isVisible ? 'block' : 'none';
        });
      };
      tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const tabName = btn.getAttribute('data-tab');
          console.log('[MediaPicker] Tab button clicked:', tabName);
          setTab(tabName);
        });
      });

      // Upload
      const uploadPane = body.querySelector('.tab-content[data-tab="upload"] input[type="file"]');
      if (uploadPane) uploadPane.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve({ source: 'upload', type, dataUrl: ev.target.result, file });
          close();
        };
        reader.readAsDataURL(file);
      });

      // (No separate URL tab anymore)

      // Unsplash (if key present)
      if (true) {
        const unsplashPane = body.querySelector('.tab-content[data-tab="unsplash"]');
        const noteEl = unsplashPane ? unsplashPane.querySelector('.unsplash-note') : null;
        const grid = unsplashPane ? unsplashPane.querySelector('.unsplash-grid') : null;
        const moreBtn = unsplashPane ? unsplashPane.querySelector('.unsplash-more') : null;
        const selectedCountEl = unsplashPane ? unsplashPane.querySelector('.unsplash-selected-count') : null;
        const useSelectedBtn = unsplashPane ? unsplashPane.querySelector('.unsplash-use-selected') : null;
        const key = (window.MEDIA_CONFIG && (window.MEDIA_CONFIG.unsplashAccessKey || window.MEDIA_CONFIG.unsplashKey))
          ? (window.MEDIA_CONFIG.unsplashAccessKey || window.MEDIA_CONFIG.unsplashKey)
          : '';
        let selectedUrls = [];

        const updateSelectedUi = () => {
          try {
            if (!selectedCountEl || !useSelectedBtn) return;
            if (!multi || type !== 'image') {
              selectedCountEl.style.display = 'none';
              useSelectedBtn.style.display = 'none';
              return;
            }
            selectedCountEl.style.display = 'inline';
            useSelectedBtn.style.display = 'inline-flex';
            selectedCountEl.textContent = `${selectedUrls.length} geselecteerd`;
            useSelectedBtn.disabled = selectedUrls.length === 0;
          } catch (e) {}
        };

        // Note: Server-side API route is used when no client key is available
        if (noteEl) noteEl.textContent = '';
        let currentPage = 1;
        let currentQuery = '';
        const runSearch = async (append = false) => {
          const qInput = unsplashPane ? unsplashPane.querySelector('.unsplash-query') : null;
          const q = (qInput && qInput.value ? qInput.value.trim() : '') || 'travel';
          if (!append) {
            if (grid) grid.innerHTML = '<div style="color:#666;">Zoeken...</div>';
            currentPage = 1;
            currentQuery = q;
            selectedUrls = [];
            updateSelectedUi();
          }
          try {
            let data;
            
            // Use server-side API route (key is in Vercel env)
            if (!key || key === 'SERVER_SIDE') {
              const enhancedQuery = `${q} landmark highlights iconic famous tourist attraction`;
              const resp = await fetch(`/api/unsplash/search?query=${encodeURIComponent(enhancedQuery)}&per_page=12&page=${currentPage}&orientation=landscape`);
              data = await resp.json();
              if (!resp.ok) {
                throw new Error(data.error || data.detail || 'Unsplash search failed');
              }
            } else {
              // Use client-side key directly
              const enhancedQuery = `${q} landmark highlights iconic famous tourist attraction`;
              const resp = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(enhancedQuery)}&per_page=12&page=${currentPage}&orientation=landscape&order_by=relevant&content_filter=high` , {
                headers: { Authorization: `Client-ID ${key}` }
              });
              data = await resp.json();
            }
            if (!append && grid) grid.innerHTML = '';
            (data.results || []).forEach(item => {
              const urls = item.urls || {};
              // Use small for thumbnail display
              const small = urls.small || urls.thumb || urls.regular;
              // Use full or raw for actual background image (high-res)
              const full = urls.full || urls.raw || urls.regular || small;
              const regular = urls.regular || small;
              
              const img = document.createElement('img');
              img.src = small; // Show small thumbnail in picker
              img.className = 'mp-thumb';
              img.title = item.alt_description || '';
              const user = item.user || {};
              const links = item.links || {};
              img.onclick = () => {
                if (multi && type === 'image') {
                  const idx = selectedUrls.indexOf(full);
                  if (idx >= 0) {
                    selectedUrls.splice(idx, 1);
                    img.style.outline = '';
                  } else {
                    selectedUrls.push(full);
                    img.style.outline = '3px solid #2563eb';
                  }
                  updateSelectedUi();
                  return;
                }
                resolve({ source: 'unsplash', type: 'image', url: full, smallUrl: small, regularUrl: regular, fullUrl: full, credit: user.name || '', link: links.html || '' }); close();
              };
              if (grid) grid.appendChild(img);
            });
            const totalPages = data.total_pages || 0;
            if (moreBtn) moreBtn.disabled = !(currentPage < totalPages);
            updateSelectedUi();
          } catch (err) {
            if (grid) grid.innerHTML = '<div style="color:#c00;">Unsplash fout. Probeer later opnieuw.</div>';
            if (moreBtn) moreBtn.disabled = true;
          }
        };

        if (useSelectedBtn) {
          useSelectedBtn.addEventListener('click', () => {
            try {
              if (!multi || type !== 'image') return;
              const urls = Array.isArray(selectedUrls) ? selectedUrls.filter(Boolean) : [];
              if (urls.length === 0) return;
              resolve({ source: 'unsplash', type: 'image-list', urls, count: urls.length });
              close();
            } catch (e) {}
          });
        }
        const unsplashSearchBtn = unsplashPane ? unsplashPane.querySelector('.unsplash-search') : null;
        console.log('[MediaPicker] Unsplash search button found:', !!unsplashSearchBtn);
        if (unsplashSearchBtn) {
          unsplashSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[MediaPicker] Unsplash search button clicked!');
            runSearch(false);
          });
        }
        if (moreBtn) moreBtn.addEventListener('click', () => { currentPage += 1; runSearch(true); });
        // Add Enter key handler for search input
        const unsplashQueryInput = unsplashPane ? unsplashPane.querySelector('.unsplash-query') : null;
        if (unsplashQueryInput) {
          unsplashQueryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              console.log('[MediaPicker] Enter pressed in Unsplash search');
              runSearch(false);
            }
          });
        }
        // Auto-focus search input when tab opens and run default search
        const unsplashTabBtn = tabs.find(b => b.getAttribute('data-tab')==='unsplash');
        if (unsplashTabBtn) unsplashTabBtn.addEventListener('click', () => {
          setTimeout(() => {
            const uqi = unsplashPane ? unsplashPane.querySelector('.unsplash-query') : null;
            if (uqi) {
              uqi.focus();
              // Run default search if grid is empty
              if (grid && grid.children.length === 0) {
                runSearch(false);
              }
            }
          }, 0);
        });
        
        // Run default search if Unsplash is the default tab
        if (defaultTab === 'unsplash') {
          setTimeout(() => runSearch(false), 100);
        }

        updateSelectedUi();
      }

      // Pexels Videos
      if (true) {
        const pexelsPane = body.querySelector('.tab-content[data-tab="pexels"]');
        const noteEl = pexelsPane ? pexelsPane.querySelector('.pexels-note') : null;
        const grid = pexelsPane ? pexelsPane.querySelector('.pexels-grid') : null;
        const moreBtnPexels = pexelsPane ? pexelsPane.querySelector('.pexels-more') : null;
        const key = (window.MEDIA_CONFIG && window.MEDIA_CONFIG.pexelsKey)
          ? window.MEDIA_CONFIG.pexelsKey
          : '';

        // Clear any tip messages - we use server-side API routes
        if (noteEl) noteEl.textContent = '';

        let currentPage = 1;
        let currentQuery = '';

        const runPexelsSearch = async (append = false) => {
          const qInput = pexelsPane ? pexelsPane.querySelector('.pexels-query') : null;
          const q = (qInput && qInput.value ? qInput.value.trim() : '') || 'travel';
          if (!append) {
            if (grid) grid.innerHTML = '<div style="color:#666;">Zoeken...</div>';
            currentPage = 1;
            currentQuery = q;
          }
          
          try {
            let data;
            
            // Use server-side API route if no client-side key (key is in Vercel env)
            if (!key || key === 'SERVER_SIDE') {
              // Get already selected video IDs from VideoStudio to exclude them
              const excludeIds = window.VideoStudio?.selectedClips?.map(c => c.id).join(',') || '';
              const resp = await fetch(`/api/pexels/search?query=${encodeURIComponent(q)}&per_page=12&page=${currentPage}&orientation=landscape&exclude=${excludeIds}`);
              data = await resp.json();
              if (!resp.ok) {
                throw new Error(data.error || data.detail || 'Pexels search failed');
              }
            } else {
              // Use client-side key directly
              const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=12&page=${currentPage}&orientation=landscape`;
              const resp = await fetch(url, {
                headers: { 'Authorization': key }
              });
              data = await resp.json();
            }
            if (!append && grid) grid.innerHTML = '';
            
            // Render as 2-column thumbnail grid
            if (grid) {
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = '1fr 1fr';
              grid.style.gap = '10px';
            }
            
            (data.videos || []).forEach(video => {
              const videoFiles = video.video_files || [];
              const hdFile = videoFiles.find(f => f.quality === 'hd' && f.width >= 1280) || videoFiles[0];
              // Find a smaller preview file for hover
              const previewFile = videoFiles.find(f => (f.quality === 'sd' || f.width <= 640) && f.file_type === 'video/mp4') || 
                                  videoFiles.find(f => f.file_type === 'video/mp4') || 
                                  hdFile;
              if (!hdFile) return;
              
              const tile = document.createElement('div');
              tile.style.cssText = 'border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#f8f9fa; cursor:pointer; position:relative; transition: transform 0.2s, box-shadow 0.2s;';
              
              // Thumbnail image (shown by default)
              const thumbnail = document.createElement('img');
              thumbnail.src = video.image;
              thumbnail.alt = '';
              thumbnail.style.cssText = 'width:100%;height:140px;object-fit:cover;display:block;';
              
              // Video preview (hidden by default, shown on hover)
              const videoPreview = document.createElement('video');
              videoPreview.preload = 'metadata'; // Preload metadata for faster start
              videoPreview.loop = true;
              videoPreview.muted = true;
              videoPreview.playsInline = true;
              videoPreview.setAttribute('crossorigin', 'anonymous');
              videoPreview.style.cssText = 'width:100%;height:140px;object-fit:cover;display:none;position:absolute;top:0;left:0;';
              
              // Duration badge
              const badge = document.createElement('div');
              badge.style.cssText = 'position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.7); color:white; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600; z-index:2;';
              badge.innerHTML = `<i class="fas fa-play"></i> ${Math.floor(video.duration)}s`;
              
              // Play icon overlay (shows video is playable)
              const playIcon = document.createElement('div');
              playIcon.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:48px; height:48px; background:rgba(0,0,0,0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; pointer-events:none; transition: opacity 0.2s;';
              playIcon.innerHTML = '<i class="fas fa-play" style="color:white; font-size:20px; margin-left:3px;"></i>';
              
              // Hover effect overlay
              const hoverOverlay = document.createElement('div');
              hoverOverlay.style.cssText = 'position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(102,126,234,0.1); opacity:0; transition: opacity 0.2s; pointer-events:none;';
              
              // Video info on hover
              const videoInfo = document.createElement('div');
              videoInfo.style.cssText = 'position:absolute; bottom:8px; left:8px; right:8px; background:rgba(0,0,0,0.8); color:white; padding:6px 8px; border-radius:4px; font-size:11px; opacity:0; transition: opacity 0.2s; z-index:3;';
              videoInfo.textContent = `${video.width || '?'}x${video.height || '?'} • ${Math.floor(video.duration)}s`;
              if (video.user && video.user.name) {
                videoInfo.textContent += ` • ${video.user.name}`;
              }
              
              tile.appendChild(thumbnail);
              tile.appendChild(videoPreview);
              tile.appendChild(hoverOverlay);
              tile.appendChild(badge);
              tile.appendChild(playIcon);
              tile.appendChild(videoInfo);
              
              let isVideoLoaded = false;
              let hoverTimeout = null;
              
              // Preload video on first hover
              // Multi-select state
              let isSelected = false;
              const selectedCheckmark = document.createElement('div');
              selectedCheckmark.style.cssText = 'position:absolute; top:8px; left:8px; width:28px; height:28px; background:#22c55e; border-radius:50%; display:none; align-items:center; justify-content:center; z-index:4; box-shadow:0 2px 8px rgba(34,197,94,0.4);';
              selectedCheckmark.innerHTML = '<i class="fas fa-check" style="color:white; font-size:14px;"></i>';
              tile.appendChild(selectedCheckmark);
              
              tile.addEventListener('mouseenter', () => {
                if (!isSelected) {
                  tile.style.transform = 'scale(1.02)';
                  tile.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }
                hoverOverlay.style.opacity = '1';
                videoInfo.style.opacity = '1';
                playIcon.style.opacity = '0';
                
                // Load and play video
                if (!isVideoLoaded) {
                  videoPreview.src = previewFile.link;
                  isVideoLoaded = true;
                }
                
                // Small delay to ensure video is ready
                hoverTimeout = setTimeout(() => {
                  thumbnail.style.display = 'none';
                  videoPreview.style.display = 'block';
                  
                  const playPromise = videoPreview.play();
                  if (playPromise !== undefined) {
                    playPromise.catch(e => {
                      console.warn('Video preview play failed:', e);
                      // Fallback: show thumbnail with play icon
                      thumbnail.style.display = 'block';
                      videoPreview.style.display = 'none';
                      playIcon.style.opacity = '1';
                    });
                  }
                }, 200);
              });
              
              tile.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimeout);
                videoPreview.pause();
                videoPreview.currentTime = 0;
                videoPreview.style.display = 'none';
                thumbnail.style.display = 'block';
                if (!isSelected) {
                  tile.style.transform = 'scale(1)';
                  tile.style.boxShadow = 'none';
                }
                hoverOverlay.style.opacity = '0';
                videoInfo.style.opacity = '0';
                playIcon.style.opacity = '1';
              });
              
              // Click handler
              tile.onclick = () => {
                if (single) {
                  resolve({
                    source: 'pexels',
                    type: 'video',
                    url: hdFile.link,
                    videoUrl: hdFile.link,
                    thumbnail: video.image,
                    duration: video.duration,
                    width: hdFile.width,
                    height: hdFile.height,
                    id: video.id
                  });
                  close();
                  return;
                }
                isSelected = !isSelected;
                
                if (isSelected) {
                  // Add to selection
                  tile.style.border = '3px solid #22c55e';
                  tile.style.transform = 'scale(0.98)';
                  tile.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.2)';
                  selectedCheckmark.style.display = 'flex';
                  
                  if (!window._pexelsSelectedVideos) window._pexelsSelectedVideos = [];
                  window._pexelsSelectedVideos.push({
                    source: 'pexels',
                    type: 'video',
                    url: hdFile.link,
                    videoUrl: hdFile.link,
                    thumbnail: video.image,
                    duration: video.duration,
                    width: hdFile.width,
                    height: hdFile.height,
                    id: video.id
                  });
                } else {
                  // Remove from selection
                  tile.style.border = '1px solid #e5e7eb';
                  tile.style.transform = 'scale(1)';
                  tile.style.boxShadow = 'none';
                  selectedCheckmark.style.display = 'none';
                  
                  if (window._pexelsSelectedVideos) {
                    window._pexelsSelectedVideos = window._pexelsSelectedVideos.filter(v => v.id !== video.id);
                  }
                }
                
                // Update counter and button
                const count = window._pexelsSelectedVideos ? window._pexelsSelectedVideos.length : 0;
                const counterEl = pexelsPane ? pexelsPane.querySelector('.pexels-selected-count') : null;
                const useBtn = pexelsPane ? pexelsPane.querySelector('.pexels-use-selected') : null;
                
                if (counterEl) counterEl.textContent = `${count} video's geselecteerd`;
                if (useBtn) useBtn.disabled = count === 0;
              };
              if (grid) grid.appendChild(tile);
            });
            
            const totalResults = data.total_results || 0;
            const perPage = 12;
            const hasMore = (currentPage * perPage) < totalResults;
            if (moreBtnPexels) moreBtnPexels.disabled = !hasMore;
            if (noteEl) noteEl.textContent = `${totalResults} video's gevonden`;
          } catch (err) {
            console.error('Pexels error:', err);
            if (grid) grid.innerHTML = '<div style="color:#c00;">Pexels fout. Check API key.</div>';
            if (moreBtnPexels) moreBtnPexels.disabled = true;
          }
        };

        const pexelsSearchBtn = pexelsPane ? pexelsPane.querySelector('.pexels-search') : null;
        if (pexelsSearchBtn) pexelsSearchBtn.addEventListener('click', () => runPexelsSearch(false));
        if (moreBtnPexels) moreBtnPexels.addEventListener('click', () => { currentPage += 1; runPexelsSearch(true); });
        
        // Use Selected button handler
        const useSelectedBtn = pexelsPane ? pexelsPane.querySelector('.pexels-use-selected') : null;
        if (useSelectedBtn) {
          useSelectedBtn.addEventListener('click', () => {
            if (window._pexelsSelectedVideos && window._pexelsSelectedVideos.length > 0) {
              resolve({
                source: 'pexels',
                type: 'video-playlist',
                playlist: window._pexelsSelectedVideos,
                count: window._pexelsSelectedVideos.length
              });
              close();
            }
          });
        }
        
        // Auto-focus search input when tab opens
        const pexelsTabBtn = tabs.find(b => b.getAttribute('data-tab')==='pexels');
        if (pexelsTabBtn) pexelsTabBtn.addEventListener('click', () => {
          setTimeout(() => {
            const pqi = pexelsPane ? pexelsPane.querySelector('.pexels-query') : null;
            if (pqi) {
              pqi.focus();
              // Auto-search if field has value and grid is empty
              if (pqi.value && pqi.value.trim() && !grid.hasChildNodes()) {
                runPexelsSearch(false);
              }
            }
          }, 100);
        });
        
        // If searchQuery provided and this is the default tab, auto-search
        if (searchQuery && defaultTab === 'pexels') {
          const pqi = pexelsPane ? pexelsPane.querySelector('.pexels-query') : null;
          if (pqi) {
            pqi.value = searchQuery;
            setTimeout(() => runPexelsSearch(false), 200);
          }
        }
      }

      // Pixabay Videos
      if (true) {
        const pixabayPane = body.querySelector('.tab-content[data-tab="pixabay"]');
        const noteEl = pixabayPane ? pixabayPane.querySelector('.pixabay-note') : null;
        const grid = pixabayPane ? pixabayPane.querySelector('.pixabay-grid') : null;
        const moreBtnPixabay = pixabayPane ? pixabayPane.querySelector('.pixabay-more') : null;
        const selectedCountEl = pixabayPane ? pixabayPane.querySelector('.pixabay-selected-count') : null;
        const useSelectedBtn = pixabayPane ? pixabayPane.querySelector('.pixabay-use-selected') : null;

        if (noteEl) noteEl.textContent = '';

        let currentPage = 1;
        let currentQuery = '';

        const runPixabaySearch = async (append = false) => {
          const qInput = pixabayPane ? pixabayPane.querySelector('.pixabay-query') : null;
          const q = (qInput && qInput.value ? qInput.value.trim() : '') || 'travel';
          if (!append) {
            if (grid) grid.innerHTML = '<div style="color:#666;">Zoeken...</div>';
            currentPage = 1;
            currentQuery = q;
            if (window._pixabaySelectedVideos) window._pixabaySelectedVideos = [];
          }
          
          try {
            const url = `/api/pixabay/search?query=${encodeURIComponent(q)}&page=${currentPage}&per_page=20`;
            const resp = await fetch(url);
            const data = await resp.json();
            
            if (!resp.ok) {
              throw new Error(data.error || 'API error');
            }
            
            if (!append && grid) grid.innerHTML = '';
            
            if (grid) {
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = '1fr 1fr';
              grid.style.gap = '10px';
            }
            
            const videos = data.videos || [];
            videos.forEach(video => {
              const previewUrl = video.preview_url;
              const downloadUrl = video.download_url;
              const thumbnail = video.thumbnail;
              
              if (!downloadUrl) return;
              
              const tile = document.createElement('div');
              tile.style.cssText = 'border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#f8f9fa; cursor:pointer; position:relative; transition: transform 0.2s, box-shadow 0.2s;';
              
              const thumbnailImg = document.createElement('img');
              thumbnailImg.src = thumbnail || `https://i.vimeocdn.com/video/default_295x166.jpg`;
              thumbnailImg.alt = video.title || '';
              thumbnailImg.style.cssText = 'width:100%;height:140px;object-fit:cover;display:block;';
              
              const badge = document.createElement('div');
              badge.style.cssText = 'position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.7); color:white; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600; z-index:2;';
              badge.innerHTML = `<i class="fas fa-play"></i> ${Math.floor(video.duration || 0)}s`;
              
              const freeBadge = document.createElement('div');
              freeBadge.style.cssText = 'position:absolute; top:8px; left:8px; background:#00ab6c; color:#fff; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:700; z-index:2;';
              freeBadge.textContent = 'GRATIS';
              
              let isSelected = false;
              const selectedCheckmark = document.createElement('div');
              selectedCheckmark.style.cssText = 'position:absolute; top:8px; left:8px; width:28px; height:28px; background:#00ab6c; border-radius:50%; display:none; align-items:center; justify-content:center; z-index:4; box-shadow:0 2px 8px rgba(0,171,108,0.4);';
              selectedCheckmark.innerHTML = '<i class="fas fa-check" style="color:#fff; font-size:14px;"></i>';
              
              tile.appendChild(thumbnailImg);
              tile.appendChild(badge);
              tile.appendChild(freeBadge);
              tile.appendChild(selectedCheckmark);
              
              tile.addEventListener('mouseenter', () => {
                if (!isSelected) {
                  tile.style.transform = 'scale(1.02)';
                  tile.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }
              });
              
              tile.addEventListener('mouseleave', () => {
                if (!isSelected) {
                  tile.style.transform = 'scale(1)';
                  tile.style.boxShadow = 'none';
                }
              });
              
              tile.onclick = () => {
                if (single) {
                  resolve({
                    source: 'pixabay',
                    type: 'video',
                    url: downloadUrl,
                    videoUrl: downloadUrl,
                    thumbnail: thumbnail,
                    duration: video.duration,
                    width: video.width,
                    height: video.height,
                    id: video.id,
                    title: video.title
                  });
                  close();
                  return;
                }
                
                isSelected = !isSelected;
                
                if (isSelected) {
                  tile.style.border = '3px solid #00ab6c';
                  tile.style.transform = 'scale(0.98)';
                  tile.style.boxShadow = '0 0 0 3px rgba(0,171,108,0.2)';
                  selectedCheckmark.style.display = 'flex';
                  freeBadge.style.display = 'none';
                  
                  if (!window._pixabaySelectedVideos) window._pixabaySelectedVideos = [];
                  window._pixabaySelectedVideos.push({
                    source: 'pixabay',
                    type: 'video',
                    url: downloadUrl,
                    videoUrl: downloadUrl,
                    thumbnail: thumbnail,
                    duration: video.duration,
                    width: video.width,
                    height: video.height,
                    id: video.id,
                    title: video.title
                  });
                } else {
                  tile.style.border = '1px solid #e5e7eb';
                  tile.style.transform = 'scale(1)';
                  tile.style.boxShadow = 'none';
                  selectedCheckmark.style.display = 'none';
                  freeBadge.style.display = 'block';
                  
                  if (window._pixabaySelectedVideos) {
                    window._pixabaySelectedVideos = window._pixabaySelectedVideos.filter(v => v.id !== video.id);
                  }
                }
                
                const count = window._pixabaySelectedVideos ? window._pixabaySelectedVideos.length : 0;
                if (selectedCountEl) selectedCountEl.textContent = `${count} video's geselecteerd`;
                if (useSelectedBtn) useSelectedBtn.disabled = count === 0;
              };
              
              if (grid) grid.appendChild(tile);
            });
            
            const totalResults = data.total_results || 0;
            const hasMore = videos.length >= 20;
            if (moreBtnPixabay) moreBtnPixabay.disabled = !hasMore;
            if (noteEl) noteEl.textContent = `${totalResults} gratis video's gevonden`;
            
          } catch (err) {
            console.error('Pixabay error:', err);
            if (grid) grid.innerHTML = '<div style="color:#c00;">Pixabay fout: ' + err.message + '</div>';
            if (moreBtnPixabay) moreBtnPixabay.disabled = true;
          }
        };

        const pixabaySearchBtn = pixabayPane ? pixabayPane.querySelector('.pixabay-search') : null;
        if (pixabaySearchBtn) pixabaySearchBtn.addEventListener('click', () => runPixabaySearch(false));
        if (moreBtnPixabay) moreBtnPixabay.addEventListener('click', () => { currentPage += 1; runPixabaySearch(true); });
        
        if (useSelectedBtn) {
          useSelectedBtn.addEventListener('click', () => {
            if (window._pixabaySelectedVideos && window._pixabaySelectedVideos.length > 0) {
              resolve({
                source: 'pixabay',
                type: 'video-playlist',
                playlist: window._pixabaySelectedVideos,
                count: window._pixabaySelectedVideos.length
              });
              close();
            }
          });
        }
        
        const pixabayTabBtn = tabs.find(b => b.getAttribute('data-tab')==='pixabay');
        if (pixabayTabBtn) pixabayTabBtn.addEventListener('click', () => {
          setTimeout(() => {
            const pqi = pixabayPane ? pixabayPane.querySelector('.pixabay-query') : null;
            if (pqi) {
              pqi.focus();
              // Auto-search if searchQuery was provided and field has value
              if (pqi.value && pqi.value.trim() && !grid.hasChildNodes()) {
                runPixabaySearch(false);
              }
            }
          }, 100);
        });
        
        // If searchQuery provided and this is the default tab, auto-search
        if (searchQuery && defaultTab === 'pixabay') {
          const pqi = pixabayPane ? pixabayPane.querySelector('.pixabay-query') : null;
          if (pqi) {
            pqi.value = searchQuery;
            setTimeout(() => runPixabaySearch(false), 200);
          }
        }
      }

      // Storyblocks
      if (true) {
        const storyblocksPane = body.querySelector('.tab-content[data-tab="storyblocks"]');
        const noteEl = storyblocksPane ? storyblocksPane.querySelector('.storyblocks-note') : null;
        const grid = storyblocksPane ? storyblocksPane.querySelector('.storyblocks-grid') : null;
        const moreBtnStoryblocks = storyblocksPane ? storyblocksPane.querySelector('.storyblocks-more') : null;

        // Clear any tip messages - we use server-side API routes
        if (noteEl) noteEl.textContent = '';

        let currentPage = 1;
        let currentQuery = '';

        const runStoryblocksSearch = async (append = false) => {
          const qInput = storyblocksPane ? storyblocksPane.querySelector('.storyblocks-query') : null;
          const q = (qInput && qInput.value ? qInput.value.trim() : '') || 'travel';
          if (!append) {
            if (grid) grid.innerHTML = '<div style="color:#666;">Zoeken...</div>';
            currentPage = 1;
            currentQuery = q;
            if (window._storyblocksSelectedVideos) window._storyblocksSelectedVideos = [];
          }
          
          try {
            // Use our server-side API route
            const url = `/api/storyblocks/search?query=${encodeURIComponent(q)}&page=${currentPage}`;
            const resp = await fetch(url);
            const data = await resp.json();
            
            if (!resp.ok) {
              throw new Error(data.error || 'API error');
            }
            
            if (!append && grid) grid.innerHTML = '';
            
            // Render as 2-column thumbnail grid
            if (grid) {
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = '1fr 1fr';
              grid.style.gap = '10px';
            }
            
            const videos = data.results || [];
            videos.forEach(video => {
              // Get best quality preview
              const previewUrl = video.preview_urls?.mp4_preview || video.preview_urls?.webm_preview;
              const downloadUrl = video.download_url || previewUrl;
              const thumbnail = video.thumbnail_url;
              
              if (!downloadUrl || !thumbnail) return;
              
              const tile = document.createElement('div');
              tile.style.cssText = 'border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#f8f9fa; cursor:pointer; position:relative; transition: transform 0.2s, box-shadow 0.2s;';
              
              // Thumbnail
              const thumbnailImg = document.createElement('img');
              thumbnailImg.src = thumbnail;
              thumbnailImg.alt = video.title || '';
              thumbnailImg.style.cssText = 'width:100%;height:140px;object-fit:cover;display:block;';
              
              // Duration badge
              const badge = document.createElement('div');
              badge.style.cssText = 'position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.7); color:white; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600; z-index:2;';
              badge.innerHTML = `<i class="fas fa-play"></i> ${Math.floor(video.duration || 0)}s`;
              
              // Premium badge
              const premiumBadge = document.createElement('div');
              premiumBadge.style.cssText = 'position:absolute; top:8px; left:8px; background:#eab308; color:#000; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:700; z-index:2;';
              premiumBadge.textContent = 'PREMIUM';
              
              // Multi-select state
              let isSelected = false;
              const selectedCheckmark = document.createElement('div');
              selectedCheckmark.style.cssText = 'position:absolute; top:8px; left:8px; width:28px; height:28px; background:#eab308; border-radius:50%; display:none; align-items:center; justify-content:center; z-index:4; box-shadow:0 2px 8px rgba(234,179,8,0.4);';
              selectedCheckmark.innerHTML = '<i class="fas fa-check" style="color:#000; font-size:14px;"></i>';
              
              tile.appendChild(thumbnailImg);
              tile.appendChild(badge);
              tile.appendChild(premiumBadge);
              tile.appendChild(selectedCheckmark);
              
              tile.addEventListener('mouseenter', () => {
                if (!isSelected) {
                  tile.style.transform = 'scale(1.02)';
                  tile.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }
              });
              
              tile.addEventListener('mouseleave', () => {
                if (!isSelected) {
                  tile.style.transform = 'scale(1)';
                  tile.style.boxShadow = 'none';
                }
              });
              
              // Click handler (single-select or multi-select)
              tile.onclick = () => {
                try {
                  if (single) {
                    resolve({
                      source: 'storyblocks',
                      type: 'video',
                      url: downloadUrl,
                      videoUrl: downloadUrl,
                      thumbnail: thumbnail,
                      duration: video.duration,
                      width: video.width,
                      height: video.height,
                      id: video.id,
                      title: video.title
                    });
                    close();
                    return;
                  }
                } catch (e0) {}
                isSelected = !isSelected;
                
                if (isSelected) {
                  tile.style.border = '3px solid #eab308';
                  tile.style.transform = 'scale(0.98)';
                  tile.style.boxShadow = '0 0 0 3px rgba(234,179,8,0.2)';
                  selectedCheckmark.style.display = 'flex';
                  premiumBadge.style.display = 'none';
                  
                  if (!window._storyblocksSelectedVideos) window._storyblocksSelectedVideos = [];
                  window._storyblocksSelectedVideos.push({
                    source: 'storyblocks',
                    type: 'video',
                    url: downloadUrl,
                    videoUrl: downloadUrl,
                    thumbnail: thumbnail,
                    duration: video.duration,
                    width: video.width,
                    height: video.height,
                    id: video.id,
                    title: video.title
                  });
                } else {
                  tile.style.border = '1px solid #e5e7eb';
                  tile.style.transform = 'scale(1)';
                  tile.style.boxShadow = 'none';
                  selectedCheckmark.style.display = 'none';
                  premiumBadge.style.display = 'block';
                  
                  if (window._storyblocksSelectedVideos) {
                    window._storyblocksSelectedVideos = window._storyblocksSelectedVideos.filter(v => v.id !== video.id);
                  }
                }
                
                // Update counter and button
                const count = window._storyblocksSelectedVideos ? window._storyblocksSelectedVideos.length : 0;
                const counterEl = storyblocksPane ? storyblocksPane.querySelector('.storyblocks-selected-count') : null;
                const useBtn = storyblocksPane ? storyblocksPane.querySelector('.storyblocks-use-selected') : null;
                
                if (counterEl) counterEl.textContent = `${count} video's geselecteerd`;
                if (useBtn) useBtn.disabled = count === 0;
              };
              
              if (grid) grid.appendChild(tile);
            });
            
            const totalResults = data.info?.total_results || 0;
            const hasMore = videos.length >= 20; // Storyblocks returns 20 per page
            if (moreBtnStoryblocks) moreBtnStoryblocks.disabled = !hasMore;
            if (noteEl) noteEl.textContent = `${totalResults} premium video's gevonden`;
            
          } catch (err) {
            console.error('Storyblocks error:', err);
            if (grid) grid.innerHTML = '<div style="color:#c00;">Storyblocks fout: ' + err.message + '</div>';
            if (moreBtnStoryblocks) moreBtnStoryblocks.disabled = true;
          }
        };

        const storyblocksSearchBtn = storyblocksPane ? storyblocksPane.querySelector('.storyblocks-search') : null;
        if (storyblocksSearchBtn) storyblocksSearchBtn.addEventListener('click', () => runStoryblocksSearch(false));
        if (moreBtnStoryblocks) moreBtnStoryblocks.addEventListener('click', () => { currentPage += 1; runStoryblocksSearch(true); });
        
        // Use Selected button handler
        const useSelectedBtn = storyblocksPane ? storyblocksPane.querySelector('.storyblocks-use-selected') : null;
        if (useSelectedBtn) {
          useSelectedBtn.addEventListener('click', () => {
            if (window._storyblocksSelectedVideos && window._storyblocksSelectedVideos.length > 0) {
              resolve({
                source: 'storyblocks',
                type: 'video-playlist',
                playlist: window._storyblocksSelectedVideos,
                count: window._storyblocksSelectedVideos.length
              });
              close();
            }
          });
        }
        
        // Auto-focus search input when tab opens
        const storyblocksTabBtn = tabs.find(b => b.getAttribute('data-tab')==='storyblocks');
        if (storyblocksTabBtn) storyblocksTabBtn.addEventListener('click', () => {
          setTimeout(() => {
            const sqi = storyblocksPane ? storyblocksPane.querySelector('.storyblocks-query') : null;
            if (sqi) sqi.focus();
          }, 0);
        });
      }

      // YouTube
      if (true) {
        const ytPane = body.querySelector('.tab-content[data-tab="youtube"]');
        const noteEl = ytPane ? ytPane.querySelector('.yt-note') : null;
        const grid = ytPane ? ytPane.querySelector('.yt-grid') : null;
        const moreBtnYt = ytPane ? ytPane.querySelector('.yt-more') : null;
        const key = (window.MEDIA_CONFIG && (window.MEDIA_CONFIG.youtubeApiKey || window.MEDIA_CONFIG.youtubeKey))
          ? (window.MEDIA_CONFIG.youtubeApiKey || window.MEDIA_CONFIG.youtubeKey)
          : '';

        let nextPageToken = '';
        let lastQuery = '';

        const runYtSearch = async (append = false) => {
          const qInput = ytPane ? ytPane.querySelector('.yt-query') : null;
          const q = (qInput && qInput.value ? qInput.value.trim() : '') || 'travel';
          if (!append) {
            if (grid) grid.innerHTML = '<div style="color:#666;">Zoeken...</div>';
            nextPageToken = '';
            lastQuery = q;
          }
          if (!key) {
            if (noteEl) noteEl.textContent = 'Tip: voeg window.MEDIA_CONFIG.youtubeKey toe voor YouTube-zoekresultaten. Gebruik anders de URL-invoer hieronder.';
            if (grid) grid.innerHTML = '<div style="color:#666;">Geen API key: gebruik de URL-invoer hieronder.</div>';
            if (moreBtnYt) moreBtnYt.style.display = 'none';
            return;
          }
          try {
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(q)}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}&key=${key}`;
            const resp = await fetch(url);
            const data = await resp.json();
            if (!append && grid) grid.innerHTML = '';
            // Render as 2-column thumbnail grid without titles
            if (grid) {
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = '1fr 1fr';
              grid.style.gap = '10px';
            }
            (data.items || []).forEach(item => {
              const idObj = item.id || {};
              const snippet = item.snippet || {};
              const thumbs = (snippet.thumbnails || {});
              const vid = idObj.videoId;
              const thumb = (thumbs.medium && thumbs.medium.url) || (thumbs.default && thumbs.default.url);
              if (!vid) return;
              const tile = document.createElement('div');
              tile.style.cssText = 'border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#f8f9fa; cursor:pointer;';
              tile.innerHTML = `<img src="${thumb}" alt="" style="width:100%;height:140px;object-fit:cover;display:block;"/>`;
              tile.onclick = () => {
                const startInput = ytPane ? ytPane.querySelector('.yt-start') : null;
                const startSec = parseInt((startInput && startInput.value) ? startInput.value : '0', 10) || 0;
                const embed = `https://www.youtube.com/embed/${vid}${startSec>0?`?start=${startSec}`:''}`;
                resolve({ source: 'youtube', type: 'video', embedUrl: embed, id: vid, start: startSec });
                close();
              };
              if (grid) grid.appendChild(tile);
            });
            nextPageToken = data.nextPageToken || '';
            if (moreBtnYt) moreBtnYt.style.display = nextPageToken ? '' : 'none';
          } catch (err) {
            if (grid) grid.innerHTML = '<div style="color:#c00;">YouTube fout. Probeer later opnieuw.</div>';
            if (moreBtnYt) moreBtnYt.style.display = 'none';
          }
        };

        const ytSearchBtn = ytPane ? ytPane.querySelector('.yt-search') : null;
        if (ytSearchBtn) ytSearchBtn.addEventListener('click', () => runYtSearch(false));
        if (moreBtnYt) moreBtnYt.addEventListener('click', () => runYtSearch(true));
        const ytUseBtn = ytPane ? ytPane.querySelector('.yt-use') : null;
        if (ytUseBtn) ytUseBtn.addEventListener('click', () => {
          const urlInput = ytPane ? ytPane.querySelector('.yt-url') : null;
          const url = urlInput && urlInput.value ? urlInput.value.trim() : '';
          if (!url) {
            alert('Plak eerst een YouTube URL');
            return;
          }
          const id = MediaPicker.extractYouTubeId(url);
          if (!id) {
            alert('Ongeldige YouTube URL. Gebruik een URL zoals:\n- https://www.youtube.com/watch?v=...\n- https://youtu.be/...\n- https://www.youtube.com/shorts/...');
            return;
          }
          const startInput = ytPane ? ytPane.querySelector('.yt-start') : null;
          const startSec = parseInt((startInput && startInput.value) ? startInput.value : '0', 10) || 0;
          const embed = `https://www.youtube.com/embed/${id}${startSec>0?`?start=${startSec}`:''}`;
          resolve({ source: 'youtube', type: 'video', embedUrl: embed, id, url, start: startSec });
          close();
        });
      }

      // My Videos
      if (true) {
        const myVideosPane = body.querySelector('.tab-content[data-tab="my-videos"]');
        const noteEl = myVideosPane ? myVideosPane.querySelector('.my-videos-note') : null;
        const grid = myVideosPane ? myVideosPane.querySelector('.my-videos-grid') : null;
        const emptyEl = myVideosPane ? myVideosPane.querySelector('.my-videos-empty') : null;
        const refreshBtn = myVideosPane ? myVideosPane.querySelector('.my-videos-refresh') : null;

        const loadMyVideos = async () => {
          if (grid) grid.innerHTML = '<div style="color:#666;padding:20px;text-align:center;"><i class="fas fa-spinner fa-spin"></i> Laden...</div>';
          if (emptyEl) emptyEl.style.display = 'none';

          try {
            const resp = await fetch('/api/videos/list');
            const data = await resp.json();

            if (!data.success || !data.videos || data.videos.length === 0) {
              if (grid) grid.innerHTML = '';
              if (emptyEl) emptyEl.style.display = 'block';
              if (noteEl) noteEl.textContent = 'Nog geen video\'s';
              return;
            }

            if (grid) grid.innerHTML = '';
            if (noteEl) noteEl.textContent = `${data.videos.length} video${data.videos.length !== 1 ? '\'s' : ''}`;

            // Render as 2-column thumbnail grid
            if (grid) {
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = '1fr 1fr';
              grid.style.gap = '10px';
            }

            data.videos.forEach(video => {
              const tile = document.createElement('div');
              tile.style.cssText = 'border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#f8f9fa; position:relative; transition: transform 0.2s, box-shadow 0.2s;';

              // Thumbnail or video preview
              const thumbnail = document.createElement('img');
              thumbnail.src = video.thumbnail || video.videoUrl;
              thumbnail.alt = video.title;
              thumbnail.style.cssText = 'width:100%;height:140px;object-fit:cover;display:block;cursor:pointer;';
              thumbnail.onerror = () => {
                // Fallback if thumbnail doesn't exist
                thumbnail.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.style.cssText = 'width:100%;height:140px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;font-size:48px;cursor:pointer;';
                placeholder.innerHTML = '<i class="fas fa-film"></i>';
                tile.insertBefore(placeholder, tile.firstChild);
              };

              // Title overlay
              const titleOverlay = document.createElement('div');
              titleOverlay.style.cssText = 'position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent); color:white; padding:8px 8px 32px 8px; font-size:12px; font-weight:600; pointer-events:none;';
              titleOverlay.textContent = video.title;

              // Play icon
              const playIcon = document.createElement('div');
              playIcon.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:48px; height:48px; background:rgba(102,126,234,0.9); border-radius:50%; display:flex; align-items:center; justify-content:center; pointer-events:none;';
              playIcon.innerHTML = '<i class="fas fa-play" style="color:white; font-size:20px; margin-left:3px;"></i>';

              // Action buttons (bottom right)
              const actionButtons = document.createElement('div');
              actionButtons.style.cssText = 'position:absolute; bottom:8px; right:8px; display:flex; gap:4px; z-index:2;';
              
              // Download button
              const downloadBtn = document.createElement('a');
              downloadBtn.href = video.videoUrl;
              downloadBtn.download = `${video.title}.mp4`;
              downloadBtn.style.cssText = 'width:32px; height:32px; background:rgba(34,197,94,0.95); border-radius:6px; display:flex; align-items:center; justify-content:center; color:white; text-decoration:none; transition:background 0.2s;';
              downloadBtn.innerHTML = '<i class="fas fa-download" style="font-size:14px;"></i>';
              downloadBtn.title = 'Download video';
              downloadBtn.onclick = (e) => {
                e.stopPropagation();
              };
              downloadBtn.addEventListener('mouseenter', () => {
                downloadBtn.style.background = 'rgba(34,197,94,1)';
              });
              downloadBtn.addEventListener('mouseleave', () => {
                downloadBtn.style.background = 'rgba(34,197,94,0.95)';
              });

              // Use button
              const useBtn = document.createElement('button');
              useBtn.style.cssText = 'width:32px; height:32px; background:rgba(102,126,234,0.95); border:none; border-radius:6px; display:flex; align-items:center; justify-content:center; color:white; cursor:pointer; transition:background 0.2s;';
              useBtn.innerHTML = '<i class="fas fa-check" style="font-size:14px;"></i>';
              useBtn.title = 'Gebruik in Hero';
              useBtn.onclick = (e) => {
                e.stopPropagation();
                resolve({
                  source: 'my-videos',
                  type: 'video',
                  url: video.videoUrl,
                  videoUrl: video.videoUrl,
                  thumbnail: video.thumbnail,
                  title: video.title,
                  id: video.id
                });
                close();
              };
              useBtn.addEventListener('mouseenter', () => {
                useBtn.style.background = 'rgba(102,126,234,1)';
              });
              useBtn.addEventListener('mouseleave', () => {
                useBtn.style.background = 'rgba(102,126,234,0.95)';
              });

              actionButtons.appendChild(downloadBtn);
              actionButtons.appendChild(useBtn);

              tile.appendChild(thumbnail);
              tile.appendChild(titleOverlay);
              tile.appendChild(playIcon);
              tile.appendChild(actionButtons);

              // Hover effects
              tile.addEventListener('mouseenter', () => {
                tile.style.transform = 'scale(1.02)';
                tile.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              });

              tile.addEventListener('mouseleave', () => {
                tile.style.transform = 'scale(1)';
                tile.style.boxShadow = 'none';
              });

              // Click on thumbnail to use video
              thumbnail.onclick = () => {
                resolve({
                  source: 'my-videos',
                  type: 'video',
                  url: video.videoUrl,
                  videoUrl: video.videoUrl,
                  thumbnail: video.thumbnail,
                  title: video.title,
                  id: video.id
                });
                close();
              };

              if (grid) grid.appendChild(tile);
            });

          } catch (error) {
            console.error('[MyVideos] Error loading videos:', error);
            if (grid) grid.innerHTML = '<div style="color:#c00;padding:20px;text-align:center;">Fout bij laden van video\'s</div>';
          }
        };

        // Refresh button
        if (refreshBtn) {
          refreshBtn.addEventListener('click', () => loadMyVideos());
        }

        // Auto-load when tab opens
        const myVideosTabBtn = tabs.find(b => b.getAttribute('data-tab') === 'my-videos');
        if (myVideosTabBtn) {
          myVideosTabBtn.addEventListener('click', () => {
            loadMyVideos();
          });
        }
      }

      // Default tab
      const hasYtKey = !!(window.MEDIA_CONFIG && (window.MEDIA_CONFIG.youtubeApiKey || window.MEDIA_CONFIG.youtubeKey));
      const hasPexelsKey = !!(window.MEDIA_CONFIG && window.MEDIA_CONFIG.pexelsKey);
      const initialTab = defaultTab || (type === 'video' && hasPexelsKey ? 'pexels' : type === 'video' && hasYtKey ? 'youtube' : 'unsplash');
      setTab(initialTab);
      
      // Auto-fill search query if provided (wait for DOM to be ready)
      if (searchQuery) {
        console.log('[MediaPicker] Auto-filling search query:', searchQuery);
        setTimeout(() => {
          if (initialTab === 'pexels') {
            const pexelsInput = body.querySelector('.pexels-query');
            console.log('[MediaPicker] Pexels input found:', !!pexelsInput);
            if (pexelsInput) {
              pexelsInput.value = searchQuery;
              console.log('[MediaPicker] Search query set, triggering search...');
              // Auto-trigger search
              const searchBtn = body.querySelector('.pexels-search');
              if (searchBtn) {
                searchBtn.click();
                console.log('[MediaPicker] Search button clicked');
              }
            }
          } else if (initialTab === 'unsplash') {
            const unsplashInput = body.querySelector('.unsplash-query');
            if (unsplashInput) {
              unsplashInput.value = searchQuery;
              // Auto-trigger search
              const searchBtn = body.querySelector('.unsplash-search');
              if (searchBtn) searchBtn.click();
            }
          }
        }, 300); // Increased timeout to ensure DOM is ready
      }

      // Inject minimal styles for drawer
      if (!document.getElementById('media-picker-styles')) {
        const style = document.createElement('style');
        style.id = 'media-picker-styles';
        style.textContent = `
          .mp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); opacity: 0; transition: opacity .2s ease; z-index: 99998; }
          .mp-overlay.open { opacity: 1; }
          .mp-drawer { position: fixed; top: 0; right: 0; width: 420px; max-width: 92vw; height: 100%; background: #fff; box-shadow: -12px 0 30px rgba(0,0,0,.15); transform: translateX(100%); transition: transform .2s ease; z-index: 99999; display:flex; flex-direction:column; }
          .mp-drawer.open { transform: translateX(0); }
          .mp-header { display:flex; align-items:center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #e5e7eb; }
          .mp-header h3 { margin: 0; font-size: 16px; }
          .mp-header .mp-close { border: 0; background: transparent; cursor: pointer; font-size: 18px; }
          .mp-body { padding: 12px; overflow: auto; }
          .media-tabs { display:flex; gap:8px; margin-bottom: 12px; position: sticky; top: 0; background: #fff; padding: 8px 0 8px; z-index: 1; border-bottom: 1px solid #f1f5f9; }
          .media-tabs .tab-btn { border-color:#d1d5db; color:#374151; }
          .media-tabs .tab-btn.active { box-shadow: 0 0 0 2px rgba(59,130,246,0.15) inset; }
          .media-tabs .tab-btn[data-tab="unsplash"] { background:#ff7700; border-color:#ff7700; color:#fff; }
          .media-tabs .tab-btn[data-tab="unsplash"].active { filter: brightness(0.95); }
          .media-tabs .tab-btn[data-tab="pexels"] { background:#05A081; border-color:#05A081; color:#fff; }
          .media-tabs .tab-btn[data-tab="pexels"].active { filter: brightness(0.95); }
          .media-tabs .tab-btn[data-tab="youtube"] { background:#ff0000; border-color:#ff0000; color:#fff; }
          .media-tabs .tab-btn[data-tab="youtube"].active { filter: brightness(0.95); }
          .media-tabs .tab-btn[data-tab="my-videos"] { background:#667eea; border-color:#667eea; color:#fff; }
          .media-tabs .tab-btn[data-tab="my-videos"].active { filter: brightness(0.95); }
          .media-tabs .tab-btn[data-tab="upload"] { background:#f3f4f6; }
          .media-tabs .tab-btn[data-tab="url"] { background:#e0f2fe; border-color:#bae6fd; }
          .mp-help { color:#666; font-size: .9rem; margin-top: 8px; }
          .mp-row { display:flex; gap:8px; align-items:center; }
          .mp-between { justify-content: space-between; }
          .unsplash-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-top:12px; }
          .mp-more-row { margin-top: 14px; }
          .mp-thumb { width:100%; height:110px; object-fit: cover; border-radius: 8px; cursor: pointer; }
          .mp-body .btn.btn-lg { padding: 12px 20px; border-radius: 12px; font-weight: 700; }
          .mp-body .btn.btn-primary { background:#2563eb; border-color:#2563eb; color:#fff; }
          .mp-body .btn.btn-primary:hover { filter: brightness(0.95); }
          .btn.btn-primary[disabled] { opacity: .55; cursor: not-allowed; }
        `;
        document.head.appendChild(style);
      }
    });
  }

  static extractYouTubeId(url) {
    // Support multiple YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/,
      /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([A-Za-z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return '';
  }
}

// Public alias for generic open
MediaPicker.open = MediaPicker._open;
window.MediaPicker = MediaPicker;

// Default config namespace
window.MEDIA_CONFIG = window.MEDIA_CONFIG || { unsplashKey: '' };
