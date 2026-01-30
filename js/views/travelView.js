// js/views/travelView.js
// Travel Compositor integration view
// Version: 2025-11-11-22:26 (with BOLT save)

(function() {
  console.log('[TravelView] Loading version 2025-11-11-22:26 with BOLT save functionality');
  
  const TravelView = {
    currentIdea: null,
    micrositeId: null,
    tcLanguage: 'NL',
    selectedRoadbookVariant: 'autorondreis',

    mount(container) {
      if (!container) return;
      
      console.log('[TravelView] Mounting travel view...');
      console.log('[TravelView] URL params:', window.location.search);
      console.log('[TravelView] Hash:', window.location.hash);
      
      // Check if there's an id in URL params - if not, we're creating NEW travel
      const urlParams = new URLSearchParams(window.location.search);
      const tripId = urlParams.get('id');
      
      if (tripId) {
        console.log('[TravelView] Trip ID found in URL, attempting to load:', tripId);
        // Load existing trip - this will be handled by router/loadTravel
      } else {
        console.log('[TravelView] No trip ID - showing new travel form');
        // Clear any old state
        this.currentIdea = null;
      }
      
      // Get microsite ID from environment or config
      this.micrositeId = this.getMicrositeId();

      // Load preferred TC language
      try {
        this.tcLanguage = localStorage.getItem('tc_language') || 'NL';
      } catch (e) {
        this.tcLanguage = 'NL';
      }

      try {
        this.selectedRoadbookVariant = String(window.CURRENT_ROADBOOK_VARIANT || 'autorondreis');
      } catch (e) {
        this.selectedRoadbookVariant = 'autorondreis';
      }
      
      container.innerHTML = this.renderHTML();
      this.attachEventListeners(container);
      
      console.log('[TravelView] Mount complete - formulier should be visible');
    },

    getMicrositeId() {
      // Try to get from various sources
      return window.TC_MICROSITE_ID || 
             localStorage.getItem('tc_microsite_id') || 
             ''; // Will be prompted if empty
    },

    renderHTML() {
      return `
        <div style="max-width: 900px; margin: 0 auto; padding: 20px; max-height: 90vh; overflow-y: auto;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; color: white;">
            <h1 style="margin: 0 0 4px 0; font-size: 24px; font-weight: 700;">
              <i class="fas fa-plane-departure"></i> Reis Toevoegen
            </h1>
            <p style="margin: 0; opacity: 0.9; font-size: 13px;">
              Kies hoe je de reis wilt aanmaken
            </p>
          </div>

          <!-- Import Method Selection (Compact 4 Buttons) -->
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #111827;">
              <i class="fas fa-wand-magic-sparkles"></i> Selecteer Import Methode
            </h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 16px;">
              <!-- Method 1: Travel Compositor -->
              <div class="import-method-card" data-method="tc" style="
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                box-shadow: 0 4px 12px -2px rgba(102, 126, 234, 0.3);
                transform: translateY(0);
              ">
                <div style="text-align: center; color: white;">
                  <div style="font-size: 32px; margin-bottom: 8px;">
                    <i class="fas fa-link"></i>
                  </div>
                  <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Travel Compositor</div>
                  <div style="font-size: 11px; opacity: 0.9;">Importeer via TC ID</div>
                </div>
              </div>

              <!-- Method 2: PDF Upload -->
              <div class="import-method-card" data-method="pdf" style="
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
                box-shadow: 0 4px 12px -2px rgba(245, 158, 11, 0.3);
                transform: translateY(0);
              ">
                <div style="text-align: center; color: white;">
                  <div style="font-size: 32px; margin-bottom: 8px;">
                    <i class="fas fa-file-pdf"></i>
                  </div>
                  <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">PDF Upload</div>
                  <div style="font-size: 11px; opacity: 0.9;">Boekingsbevestiging</div>
                </div>
              </div>

              <!-- Method 3: URL Import -->
              <div class="import-method-card" data-method="url" style="
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
                box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.3);
                transform: translateY(0);
              ">
                <div style="text-align: center; color: white;">
                  <div style="font-size: 32px; margin-bottom: 8px;">
                    <i class="fas fa-globe"></i>
                  </div>
                  <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">URL Importeren</div>
                  <div style="font-size: 11px; opacity: 0.9;">Online booking</div>
                </div>
              </div>

              <!-- Method 4: Manual -->
              <div class="import-method-card" data-method="manual" style="
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                box-shadow: 0 4px 12px -2px rgba(139, 92, 246, 0.3);
                transform: translateY(0);
              ">
                <div style="text-align: center; color: white;">
                  <div style="font-size: 32px; margin-bottom: 8px;">
                    <i class="fas fa-pencil"></i>
                  </div>
                  <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Handmatig</div>
                  <div style="font-size: 11px; opacity: 0.9;">Zelf samenstellen</div>
                </div>
              </div>
            </div>

            <div style="text-align: center;">
              <button 
                id="backToPageModeBtn" 
                style="height: 36px; padding: 0 20px; background: #6b7280; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;"
              >
                <i class="fas fa-arrow-left"></i> Terug
              </button>
            </div>
          </div>

          <!-- Dynamic Content Area -->
          <div id="methodContent" style="display: none;"></div>

          <!-- Status/Loading -->
          <div id="travelStatus" style="display: none; padding: 16px; border-radius: 8px; margin-bottom: 24px;"></div>

          <!-- Travel Content -->
          <div id="travelContent" style="display: none;">
            <!-- Will be populated with travel data -->
          </div>
        </div>
      `;
    },

    attachEventListeners(container) {
      const backBtn = container.querySelector('#backToPageModeBtn');
      const methodCards = container.querySelectorAll('.import-method-card');
      const methodContent = container.querySelector('#methodContent');

      this.selectedTemplate = '1';

      methodCards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 20px 35px -5px rgba(0, 0, 0, 0.3)';
        });
        card.addEventListener('mouseleave', (e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
        });
        card.addEventListener('click', () => {
          const method = card.dataset.method;
          console.log('[TravelView] Import method selected:', method);
          this.currentMethod = method;
          this.showMethodContent(method, methodContent);
        });
      });

      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.WB_setMode) window.WB_setMode('page');
        });
      }
    },

    showMethodContent(method, container) {
      if (!container) return;
      container.style.display = 'block';
      setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
      switch(method) {
        case 'tc': this.renderTCForm(container); break;
        case 'pdf': this.renderPDFUpload(container); break;
        case 'url': this.renderURLImport(container); break;
        case 'manual': this.renderManualMode(container); break;
      }
    },

    renderTemplateSelector() {
      return `<div style="padding-top: 16px; border-top: 1px solid #e5e7eb; margin-top: 16px;">
        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #374151; font-size: 13px;"><i class="fas fa-palette"></i> Kies Output Format</label>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
          <div class="template-card" data-template="1" style="position: relative; border: 2px solid #a5b4fc; border-radius: 8px; padding: 8px; cursor: pointer; background: #f5f7ff;">
            <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 100%); border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; color: #4f46e5; font-size: 18px;"><i class="fas fa-plane-departure"></i></div>
            <div style="font-weight: 600; font-size: 11px; color: #374151; text-align: center;">Standaard</div>
          </div>
          <div class="template-card" data-template="roadbook" style="position: relative; border: 2px solid #e5e7eb; border-radius: 8px; padding: 8px; cursor: pointer; background: white;">
            <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; color: #059669; font-size: 18px;"><i class="fas fa-map-marked-alt"></i></div>
            <div style="font-weight: 600; font-size: 11px; color: #374151; text-align: center;">Roadbook</div>
          </div>
          <div class="template-card" data-template="2" style="position: relative; border: 2px solid #e5e7eb; border-radius: 8px; padding: 8px; cursor: not-allowed; background: #f9fafb; opacity: 0.6;">
            <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #fed7aa 0%, #fecaca 100%); border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; color: #dc2626; font-size: 18px;"><i class="fas fa-mountain"></i></div>
            <div style="font-weight: 600; font-size: 11px; color: #6b7280; text-align: center;">Avontuur</div>
            <div style="position: absolute; top: 4px; right: 4px; background: #fbbf24; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">SOON</div>
          </div>
          <div class="template-card" data-template="3" style="position: relative; border: 2px solid #e5e7eb; border-radius: 8px; padding: 8px; cursor: not-allowed; background: #f9fafb; opacity: 0.6;">
            <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #a7f3d0 0%, #a5f3fc 100%); border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; color: #059669; font-size: 18px;"><i class="fas fa-umbrella-beach"></i></div>
            <div style="font-weight: 600; font-size: 11px; color: #6b7280; text-align: center;">Strand & Zon</div>
            <div style="position: absolute; top: 4px; right: 4px; background: #fbbf24; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">SOON</div>
          </div>
          <div class="template-card" data-template="4" style="position: relative; border: 2px solid #e5e7eb; border-radius: 8px; padding: 8px; cursor: not-allowed; background: #f9fafb; opacity: 0.6;">
            <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #fdba74 0%, #fca5a5 100%); border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; color: #dc2626; font-size: 18px;"><i class="fas fa-ticket"></i></div>
            <div style="font-weight: 600; font-size: 11px; color: #6b7280; text-align: center;">Voucher</div>
            <div style="position: absolute; top: 4px; right: 4px; background: #fbbf24; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">SOON</div>
          </div>
        </div>

        <div id="roadbookVariantSelector" style="display:none; margin-top: 10px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb;">
          <div style="font-weight: 700; font-size: 12px; color: #111827; margin-bottom: 8px; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-route" style="color:#059669;"></i>
            <span>Roadbook type</span>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="roadbook-variant-btn" data-variant="autorondreis" style="padding:6px 10px; border-radius:999px; border:1px solid #e5e7eb; background:white; color:#374151; font-weight:700; font-size:11px; cursor:pointer;">Autorondreis</button>
            <button type="button" class="roadbook-variant-btn" data-variant="rondreis" style="padding:6px 10px; border-radius:999px; border:1px solid #e5e7eb; background:white; color:#374151; font-weight:700; font-size:11px; cursor:pointer;">Rondreis Roadbook</button>
            <button type="button" class="roadbook-variant-btn" data-variant="eilandhop" style="padding:6px 10px; border-radius:999px; border:1px solid #e5e7eb; background:white; color:#374151; font-weight:700; font-size:11px; cursor:pointer;">Eilandhop</button>
            <button type="button" class="roadbook-variant-btn" data-variant="combinatiereis" style="padding:6px 10px; border-radius:999px; border:1px solid #e5e7eb; background:white; color:#374151; font-weight:700; font-size:11px; cursor:pointer;">Combinatiereis</button>
            <button type="button" class="roadbook-variant-btn" data-variant="autorondreis-offerte" style="padding:6px 10px; border-radius:999px; border:1px solid #e5e7eb; background:white; color:#374151; font-weight:700; font-size:11px; cursor:pointer;">Autorondreis Offerte</button>
          </div>
        </div>
      </div>`;
    },

    attachTemplateListeners(container) {
      const templateCards = container.querySelectorAll('.template-card');
      const roadbookVariantSelector = container.querySelector('#roadbookVariantSelector');
      const variantButtons = container.querySelectorAll('.roadbook-variant-btn');

      const setVariant = (variant) => {
        try {
          this.selectedRoadbookVariant = String(variant || 'autorondreis');
          window.CURRENT_ROADBOOK_VARIANT = this.selectedRoadbookVariant;
        } catch (e) {}
        try {
          variantButtons.forEach(btn => {
            const active = btn.dataset.variant === this.selectedRoadbookVariant;
            btn.style.borderColor = active ? '#10b981' : '#e5e7eb';
            btn.style.background = active ? '#ecfdf5' : 'white';
            btn.style.color = active ? '#065f46' : '#374151';
          });
        } catch (e) {}
      };

      try {
        variantButtons.forEach(btn => {
          btn.addEventListener('click', () => setVariant(btn.dataset.variant));
        });
      } catch (e) {}

      templateCards.forEach(card => {
        card.addEventListener('click', () => {
          templateCards.forEach(c => { c.style.border = '2px solid #e5e7eb'; c.style.background = 'white'; });
          this.selectedTemplate = card.dataset.template;
          card.style.border = '2px solid #667eea';
          card.style.background = '#f8f9ff';
          try {
            if (roadbookVariantSelector) {
              roadbookVariantSelector.style.display = (this.selectedTemplate === 'roadbook') ? 'block' : 'none';
            }
          } catch (e) {}
          if (this.selectedTemplate === 'roadbook') {
            setVariant(this.selectedRoadbookVariant || window.CURRENT_ROADBOOK_VARIANT || 'autorondreis');
          }
        });
      });

      try {
        if (roadbookVariantSelector) {
          roadbookVariantSelector.style.display = (this.selectedTemplate === 'roadbook') ? 'block' : 'none';
        }
      } catch (e) {}
      if (this.selectedTemplate === 'roadbook') {
        setVariant(this.selectedRoadbookVariant || window.CURRENT_ROADBOOK_VARIANT || 'autorondreis');
      }
    },

    async renderTCForm(container) {
      // Load available microsites
      const microsites = await this.loadAvailableMicrosites();
      const micrositeOptions = microsites.map(ms =>
        `<option value="${ms.id}">${ms.name}</option>`
      ).join('');

      container.innerHTML = `<div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;"><i class="fas fa-link" style="color: #667eea;"></i> Travel Compositor Import</h3>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
          <div style="flex: 1; min-width: 200px;"><label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;"><i class="fas fa-hashtag"></i> Travel Compositor ID</label>
            <input type="text" id="tcIdeaIdInput" placeholder="Bijv. 12345" style="width: 100%; height: 40px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px;" /></div>
          <div style="flex: 1; min-width: 200px;"><label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;"><i class="fas fa-building"></i> Microsite ID</label>
            <select id="tcMicrositeIdInput" style="width: 100%; height: 40px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: white; cursor: pointer;">
              ${micrositeOptions}
            </select>
          </div>
          <div style="flex: 1; min-width: 160px;"><label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;"><i class="fas fa-language"></i> Taal</label>
            <select id="tcLanguageInput" style="width: 100%; height: 40px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: white; cursor: pointer;">
              <option value="NL" ${String(this.tcLanguage || 'NL').toUpperCase() === 'NL' ? 'selected' : ''}>Nederlands</option>
              <option value="EN" ${String(this.tcLanguage || '').toUpperCase() === 'EN' ? 'selected' : ''}>English</option>
              <option value="DE" ${String(this.tcLanguage || '').toUpperCase() === 'DE' ? 'selected' : ''}>Deutsch</option>
              <option value="FR" ${String(this.tcLanguage || '').toUpperCase() === 'FR' ? 'selected' : ''}>Français</option>
            </select>
          </div>
        </div>
        ${this.renderTemplateSelector()}
        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button id="loadTravelBtn" style="height: 48px; padding: 0 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; border: none; border-radius: 8px; color: white !important; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;"><i class="fas fa-download"></i> Reis Laden</button>
          <button id="testApiBtn" style="height: 48px; padding: 0 24px; background: #6b7280 !important; border: none; border-radius: 8px; color: white !important; font-weight: 600; cursor: pointer;"><i class="fas fa-flask"></i> Test API</button>
        </div>
      </div>`;

      const loadBtn = container.querySelector('#loadTravelBtn');
      const testBtn = container.querySelector('#testApiBtn');
      const ideaInput = container.querySelector('#tcIdeaIdInput');
      const micrositeInput = container.querySelector('#tcMicrositeIdInput');
      const langInput = container.querySelector('#tcLanguageInput');

      this.attachTemplateListeners(container);

      if (loadBtn) {
        loadBtn.addEventListener('click', async () => {
          const ideaId = ideaInput?.value?.trim();
          const micrositeId = micrositeInput?.value?.trim();
          const language = (langInput?.value || this.tcLanguage || 'NL').trim();
          if (!ideaId || !micrositeId) { this.showStatus('error', 'Voer beide velden in'); return; }
          this.micrositeId = micrositeId;
          localStorage.setItem('tc_microsite_id', micrositeId);
          try { localStorage.setItem('tc_language', language); } catch (e) {}
          this.tcLanguage = language;
          await this.loadTravel(ideaId, micrositeId, this.selectedTemplate, language);
        });
      }
      if (testBtn) testBtn.addEventListener('click', () => this.testApiConfiguration());
      if (ideaInput) ideaInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') loadBtn?.click(); });
    },

    async loadAvailableMicrosites() {
      try {
        const apiBase = this.getApiBase();
        const response = await fetch(`${apiBase}/api/config/microsites`);
        if (response.ok) {
          const data = await response.json();
          return data.microsites || [];
        }
      } catch (error) {
        console.warn('[TravelView] Could not load microsites:', error);
      }
      // Fallback to default
      return [{ id: 'rondreis-planner', name: 'Rondreis Planner', hasCredentials: true }];
    },

    renderPDFUpload(container) {
      container.innerHTML = `<div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;"><i class="fas fa-file-pdf" style="color: #ef4444;"></i> PDF Boekingsbevestiging</h3>
        <div id="pdfDropZone" style="border: 2px dashed #d1d5db; border-radius: 12px; padding: 40px; text-align: center; background: #f9fafb; margin-bottom: 24px; transition: all 0.2s;">
          <div style="font-size: 48px; color: #9ca3af; margin-bottom: 16px;"><i class="fas fa-cloud-upload-alt"></i></div>
          <div style="font-weight: 600; color: #374151; margin-bottom: 8px;">Sleep PDF hier of klik om te uploaden</div>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">Max 10MB</div>
          <input type="file" id="pdfFileInput" accept=".pdf" style="display: none;" />
          <button id="selectPdfBtn" style="height: 40px; padding: 0 24px; background: #ef4444; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;"><i class="fas fa-file-upload"></i> Selecteer PDF</button>
        </div>
        <div id="pdfPreview" style="display: none; padding: 16px; background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-file-pdf" style="font-size: 32px; color: #ef4444;"></i>
            <div style="flex: 1;">
              <div id="pdfFileName" style="font-weight: 600; color: #374151;"></div>
              <div id="pdfFileSize" style="font-size: 14px; color: #6b7280;"></div>
            </div>
            <button id="removePdfBtn" style="padding: 8px 16px; background: #ef4444; border: none; border-radius: 6px; color: white; cursor: pointer;"><i class="fas fa-times"></i></button>
          </div>
        </div>
        ${this.renderTemplateSelector()}
        <button id="uploadPdfBtn" disabled style="height: 48px; padding: 0 32px; background: #9ca3af; border: none; border-radius: 8px; color: white; font-weight: 700; cursor: not-allowed; display: flex; align-items: center; gap: 8px; margin-top: 20px;"><i class="fas fa-magic"></i> PDF Uitlezen & Reis Maken</button>
        <div style="margin-top: 16px; padding: 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 6px; font-size: 13px; color: #1e40af;">
          <strong><i class="fas fa-info-circle"></i> Wat wordt uitgelezen:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>Vluchtgegevens (PNR, tijden, vluchtnummers)</li>
            <li>Hotelgegevens (naam, adres, kamertype)</li>
            <li>Klantgegevens en aantal personen</li>
            <li>Datums en prijzen</li>
          </ul>
        </div>
      </div>`;
      
      this.attachTemplateListeners(container);
      
      const selectBtn = container.querySelector('#selectPdfBtn');
      const fileInput = container.querySelector('#pdfFileInput');
      const uploadBtn = container.querySelector('#uploadPdfBtn');
      const preview = container.querySelector('#pdfPreview');
      const removeBtn = container.querySelector('#removePdfBtn');
      const dropZone = container.querySelector('#pdfDropZone');
      
      let selectedFile = null;
      
      // File select
      selectBtn?.addEventListener('click', () => fileInput?.click());
      
      // File input change
      fileInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
          selectedFile = file;
          this.showPDFPreview(file, preview, uploadBtn);
        } else if (file) {
          this.showStatus('error', 'Alleen PDF bestanden zijn toegestaan');
        }
      });
      
      // Drag and drop
      dropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ef4444';
        dropZone.style.background = '#fef2f2';
      });
      
      dropZone?.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#d1d5db';
        dropZone.style.background = '#f9fafb';
      });
      
      dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#d1d5db';
        dropZone.style.background = '#f9fafb';
        
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type === 'application/pdf') {
          selectedFile = file;
          fileInput.files = e.dataTransfer.files;
          this.showPDFPreview(file, preview, uploadBtn);
        } else if (file) {
          this.showStatus('error', 'Alleen PDF bestanden zijn toegestaan');
        }
      });
      
      // Remove file
      removeBtn?.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        preview.style.display = 'none';
        uploadBtn.disabled = true;
        uploadBtn.style.background = '#9ca3af';
        uploadBtn.style.cursor = 'not-allowed';
      });
      
      // Upload and parse
      uploadBtn?.addEventListener('click', async () => {
        if (!selectedFile) return;
        await this.uploadAndParsePDF(selectedFile, this.selectedTemplate);
      });
    },
    
    showPDFPreview(file, preview, uploadBtn) {
      preview.style.display = 'block';
      preview.querySelector('#pdfFileName').textContent = file.name;
      preview.querySelector('#pdfFileSize').textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      uploadBtn.disabled = false;
      uploadBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)';
      uploadBtn.style.cursor = 'pointer';
    },
    
    async uploadAndParsePDF(file, template) {
      this.showStatus('loading', '<i class="fas fa-circle-notch fa-spin"></i> PDF aan het uitlezen...');
      
      try {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('template', template);
        
        const apiBase = this.getApiBase();
        const response = await fetch(`${apiBase}/api/booking/parse`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || error.error || 'PDF parsing failed');
        }
        
        const result = await response.json();
        console.log('[TravelView] PDF parsed successfully:', result);
        
        this.showStatus('success', '<i class="fas fa-check-circle"></i> PDF succesvol uitgelezen!');
        
        // Convert booking data to travel idea format
        const travelData = this.convertBookingToTravel(result.data);
        
        // DEBUG: Log the final travel data being sent
        console.log('[TravelView] ===== FINAL TRAVEL DATA =====');
        console.log('[TravelView] Transports:', JSON.stringify(travelData.transports, null, 2));
        console.log('[TravelView] Hotels:', JSON.stringify(travelData.hotels, null, 2));
        console.log('[TravelView] Destinations:', JSON.stringify(travelData.destinations, null, 2));
        console.log('[TravelView] ==============================');
        
        // Store for debugging
        window.lastTravelData = travelData;
        
        setTimeout(() => {
          // Check if roadbook template is selected
          if (this.selectedTemplate === 'roadbook') {
            console.log('[TravelView] Loading as Roadbook');
            this.loadAsRoadbook(travelData, '1');
          } else if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
            console.log('[TravelView] Calling loadTravelIdea with:', travelData);
            window.websiteBuilder.loadTravelIdea(travelData);
            if (window.WB_setMode) window.WB_setMode('page');
          }
        }, 1000);
        
      } catch (error) {
        console.error('[TravelView] PDF upload error:', error);
        this.showStatus('error', `<i class="fas fa-exclamation-circle"></i> Fout: ${error.message}`);
      }
    },
    
    convertBookingToTravel(bookingData) {
      console.log('[TravelView] Converting booking data:', bookingData);
      
      // Support both old 'flights' and new 'transports' format
      const rawTransports = bookingData.transports || bookingData.flights || [];
      console.log('[TravelView] Raw transports found:', rawTransports);
      
      // Convert to TC transport format
      const transports = rawTransports.map((transport, idx) => {
        console.log(`[TravelView] Converting transport ${idx}:`, transport);
        
        const converted = {
          type: transport.type || 'flight',
          departureCity: transport.from || transport.departureCity || '',
          arrivalCity: transport.to || transport.arrivalCity || '',
          from: transport.from || transport.departureCity || '',
          to: transport.to || transport.arrivalCity || '',
          departureDate: transport.date || transport.departureDate || '',
          departureTime: transport.time || transport.departureTime || '',
          flightNumber: transport.transportNumber || transport.flightNumber || '',
          airline: transport.carrier || transport.airline || '',
          duration: transport.duration || '',
          class: transport.class || ''
        };
        
        console.log(`[TravelView] Converted transport:`, converted);
        return converted;
      });
      
      console.log('[TravelView] All transports:', transports);
      
      // Convert hotel to hotels array (TC format)
      const hotels = [];
      if (bookingData.hotel) {
        hotels.push({
          name: bookingData.hotel.name || 'Hotel',
          hotelName: bookingData.hotel.name || 'Hotel',
          address: bookingData.hotel.address || '',
          checkIn: bookingData.hotel.checkIn || '',
          checkOut: bookingData.hotel.checkOut || '',
          roomType: bookingData.hotel.roomType || '',
          nights: bookingData.hotel.nights || 0,
          stars: 4, // Default
          board: 'Logies & Ontbijt'
        });
      }
      
      // Create destinations array from title or last transport destination
      const destinations = [];
      
      // Try to get destination from title
      let destinationName = bookingData.title || '';
      
      // Or from last transport arrival
      if (!destinationName && transports.length > 0) {
        const lastTransport = transports[transports.length - 1];
        destinationName = lastTransport.to || lastTransport.arrivalCity || '';
      }
      
      // Or from hotel address (last resort, take city part)
      if (!destinationName && bookingData.hotel?.address) {
        // Try to extract city from address (usually last part before country)
        const addressParts = bookingData.hotel.address.split(',').map(p => p.trim());
        destinationName = addressParts.length > 1 ? addressParts[addressParts.length - 2] : addressParts[0];
      }
      
      if (destinationName) {
        destinations.push({
          name: destinationName,
          title: destinationName,
          description: bookingData.hotel ? `Verblijf in ${bookingData.hotel.name || 'hotel'}` : '',
          nights: bookingData.hotel?.nights || 0
        });
      }
      
      // Convert to TC format
      const travelData = {
        name: bookingData.title || 'Nieuwe Reis',
        title: bookingData.title || 'Nieuwe Reis',
        description: bookingData.bookingReference 
          ? `Boeking ${bookingData.bookingReference}` 
          : 'Geïmporteerd uit PDF',
        bookingReference: bookingData.bookingReference,
        
        // TC format arrays
        transports: transports,
        hotels: hotels,
        destinations: destinations,
        transfers: [], // Can be added later
        
        // Additional data
        travelers: bookingData.travelers || [],
        price: {
          total: bookingData.price?.total || 0,
          currency: bookingData.price?.currency || 'EUR'
        },
        dates: bookingData.dates || {
          departure: rawTransports[0]?.date,
          return: rawTransports[rawTransports.length - 1]?.date
        }
      };
      
      console.log('[TravelView] Converted to TC format:', travelData);
      return travelData;
    },

    renderURLImport(container) {
      container.innerHTML = `<div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;"><i class="fas fa-globe" style="color: #10b981;"></i> URL Importeren</h3>
        <div style="margin-bottom: 24px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;"><i class="fas fa-link"></i> Booking URL</label>
          <input type="url" id="urlInput" placeholder="https://example.com/booking/12345" style="width: 100%; height: 48px; padding: 0 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;" />
          <div style="font-size: 13px; color: #6b7280; margin-top: 6px;">Plak de volledige URL van de boekingspagina</div>
        </div>
        ${this.renderTemplateSelector()}
        <button id="importUrlBtn" style="height: 48px; padding: 0 32px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); border: none; border-radius: 8px; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-top: 20px;"><i class="fas fa-download"></i> URL Importeren & Reis Maken</button>
        <div style="margin-top: 16px; padding: 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 6px; font-size: 13px; color: #1e40af;">
          <strong><i class="fas fa-info-circle"></i> Wat wordt uitgelezen:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>Complete reisgegevens van de website</li>
            <li>Vlucht-, hotel- en activiteiteninfo</li>
            <li>Prijzen, datums en inclusies</li>
            <li>Foto's en beschrijvingen</li>
          </ul>
        </div>
      </div>`;
      
      this.attachTemplateListeners(container);
      
      const importBtn = container.querySelector('#importUrlBtn');
      const urlInput = container.querySelector('#urlInput');
      
      importBtn?.addEventListener('click', async () => {
        const url = urlInput?.value?.trim();
        if (!url) {
          this.showStatus('error', 'Voer een geldige URL in');
          return;
        }
        
        // Validate URL format
        try {
          new URL(url);
        } catch (e) {
          this.showStatus('error', 'Ongeldige URL. Zorg dat de URL begint met http:// of https://');
          return;
        }
        
        await this.importFromURL(url, this.selectedTemplate);
      });
      
      // Enter key support
      urlInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') importBtn?.click();
      });
    },
    
    async importFromURL(url, template) {
      this.showStatus('loading', '<i class="fas fa-circle-notch fa-spin"></i> Website aan het uitlezen...');
      
      try {
        const apiBase = this.getApiBase();
        const response = await fetch(`${apiBase}/api/booking/url-import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url, template })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || error.error || 'URL import failed');
        }
        
        const result = await response.json();
        console.log('[TravelView] URL imported successfully:', result);
        
        this.showStatus('success', '<i class="fas fa-check-circle"></i> Website succesvol uitgelezen!');
        
        // Load into builder
        setTimeout(() => {
          // Check if roadbook template is selected
          if (this.selectedTemplate === 'roadbook') {
            console.log('[TravelView] Loading as Roadbook');
            this.loadAsRoadbook(result.data, '1');
          } else if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
            window.websiteBuilder.loadTravelIdea(result.data);
            if (window.WB_setMode) window.WB_setMode('page');
          }
        }, 1000);
        
      } catch (error) {
        console.error('[TravelView] URL import error:', error);
        this.showStatus('error', `<i class="fas fa-exclamation-circle"></i> Fout: ${error.message}`);
      }
    },

    renderManualMode(container) {
      container.innerHTML = `<div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;"><i class="fas fa-pencil" style="color: #8b5cf6;"></i> Handmatig Samenstellen</h3>
        <div style="margin-bottom: 24px;"><label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;"><i class="fas fa-heading"></i> Reis Titel</label>
          <input type="text" id="manualTitleInput" placeholder="Bijv. Rondreis Japan" style="width: 100%; height: 48px; padding: 0 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;" /></div>
        ${this.renderTemplateSelector()}
        <button id="startManualBtn" style="height: 48px; padding: 0 32px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border: none; border-radius: 8px; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-top: 20px;"><i class="fas fa-play"></i> Start met Lege Template</button>
        <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-left: 3px solid #3b82f6; border-radius: 6px; font-size: 13px; color: #1e40af;"><strong><i class="fas fa-info-circle"></i> Info:</strong> Start met lege template en voeg reiskaarten toe</div>
      </div>`;
      this.attachTemplateListeners(container);
      const startBtn = container.querySelector('#startManualBtn');
      const titleInput = container.querySelector('#manualTitleInput');
      startBtn?.addEventListener('click', () => {
        const title = titleInput?.value?.trim() || 'Nieuwe Reis';
        const travelData = { name: title, title };
        
        // Check if roadbook template is selected
        if (this.selectedTemplate === 'roadbook') {
          console.log('[TravelView] Loading as Roadbook');
          this.loadAsRoadbook(travelData, '1');
        } else if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
          window.websiteBuilder.loadTravelIdea(travelData);
          if (window.WB_setMode) window.WB_setMode('page');
        } else {
          this.showStatus('error', 'Builder niet beschikbaar');
        }
      });
    },

    async testApiConfiguration() {
      this.showStatus('loading', '<i class="fas fa-circle-notch fa-spin"></i> API configuratie testen...');

      try {
        const apiBase = this.getApiBase();
        const url = `${apiBase}/api/ideas/test`;

        console.log('[TravelView] Testing API configuration:', url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('[TravelView] API test result:', data);

        if (data.ok) {
          this.showStatus('success', `<i class="fas fa-check-circle"></i> API is correct geconfigureerd! (${data.config.authMode})`);
        } else {
          let missing = [];
          if (!data.config.hasBaseUrl) missing.push('TC_BASE_URL');
          if (!data.config.hasMicrositeId) missing.push('TC_MICROSITE_ID');
          if (!data.config.hasToken && !data.config.hasUsername) missing.push('TC_TOKEN of TC_USERNAME/TC_PASSWORD');
          
          this.showStatus('error', `<i class="fas fa-exclamation-circle"></i> Ontbrekende configuratie: ${missing.join(', ')}<br><small>Stel deze in via Vercel Environment Variables</small>`);
        }

        // Auto-hide after 5 seconds
        setTimeout(() => {
          const statusEl = document.getElementById('travelStatus');
          if (statusEl) statusEl.style.display = 'none';
        }, 5000);

      } catch (error) {
        console.error('[TravelView] API test failed:', error);
        this.showStatus('error', `<i class="fas fa-exclamation-circle"></i> API test mislukt: ${error.message}`);
      }
    },

    async loadTravel(ideaId, micrositeId, template = '1', language = 'NL') {
      this.showStatus('loading', `<i class="fas fa-circle-notch fa-spin"></i> Reis aan het laden met Template ${template}...`);

      try {
        // Determine API endpoint
        const apiBase = this.getApiBase();
        const lang = String(language || 'NL').trim() || 'NL';
        const url = `${apiBase}/api/ideas/${encodeURIComponent(ideaId)}?micrositeId=${encodeURIComponent(micrositeId)}&language=${encodeURIComponent(lang)}&lang=${encodeURIComponent(lang)}`;

        console.log('🔍 ===== DEBUG: TRAVEL COMPOSITOR CALL =====');
        console.log('📋 Parameters:', {
          ideaId,
          micrositeId,
          template,
          apiBase,
          fullUrl: url
        });

        const response = await fetch(url);
        
        console.log('📡 Response Status:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { rawText: errorText };
          }
          
          console.error('❌ ===== API ERROR DETAILS =====');
          console.error('Status:', response.status);
          console.error('Status Text:', response.statusText);
          console.error('Error Data:', errorData);
          console.error('Error Data (full JSON):', JSON.stringify(errorData, null, 2));
          console.error('Request URL:', url);
          console.error('Request Params:', { ideaId, micrositeId });
          console.error('Has upstreamUrl?', errorData.upstreamUrl);
          console.error('TC Auth Mode?', errorData.authMode);
          console.error('TC Error Detail?', errorData.detail);
          
          // Show detailed error with all info
          let errorMsg = errorData.error || `HTTP ${response.status}`;
          if (errorData.detail) {
            errorMsg += ': ' + (typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail));
          }
          if (errorData.authUrl) {
            console.error('[TravelView] Auth URL used:', errorData.authUrl);
          }
          
          throw new Error(errorMsg);
        }

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('❌ Failed to parse JSON response:', responseText);
          throw new Error('Invalid JSON response from TC API');
        }
        
        console.log('✅ ===== TC API SUCCESS =====');
        console.log('📦 Response Data:', data);
        console.log('📊 Data Keys:', Object.keys(data));
        if (data.destinations) console.log('📍 Destinations:', data.destinations.length);
        if (data.hotels) console.log('🏨 Hotels:', data.hotels.length);
        if (data.transports) console.log('✈️ Transports:', data.transports.length);

        this.currentIdea = data;
        
        // Save to BOLT database
        try {
          if (window.TravelDataService) {
            console.log('[TravelView] Saving travel to BOLT...');
            
            // Extract data from TC response structure
            const firstDestination = data.destinations?.[0];
            const firstHotel = data.hotels?.[0];
            const totalNights = data.hotels?.reduce((sum, h) => sum + (h.nights || 0), 0) || 0;
            
            // Create title from destinations (e.g. "Rondreis Dublin, Belfast, Galway")
            const destinationNames = [...new Set(data.destinations?.map(d => d.name) || [])];
            const title = destinationNames.length > 0 
              ? `Rondreis ${destinationNames.slice(0, 3).join(', ')}${destinationNames.length > 3 ? '...' : ''}`
              : 'Rondreis';
            
            // Calculate total price from all components
            let totalPrice = 0;
            data.hotels?.forEach(h => totalPrice += h.priceBreakdown?.totalPrice?.microsite?.amount || 0);
            data.transports?.forEach(t => totalPrice += t.priceBreakdown?.totalPrice?.microsite?.amount || 0);
            data.cars?.forEach(c => totalPrice += c.priceBreakdown?.totalPrice?.microsite?.amount || 0);
            
            // Generate HTML content from Travel Compositor data
            const htmlContent = this.generateTravelHTML(data, title, totalPrice, totalNights);
            
            const travelData = {
              // Don't set id - let BOLT auto-generate UUID
              title: title,
              slug: ideaId,  // Use IFD number as slug
              description: firstDestination?.description || '',
              featured_image: firstDestination?.imageUrls?.[0] || firstHotel?.hotelData?.images?.[0]?.url || '',
              price: Math.round(totalPrice),
              duration_days: totalNights,
              content: htmlContent,
              html: htmlContent,
              // Don't set destination_id - BOLT expects UUID, not code
              status: 'draft',
              source: 'travel-compositor',
              tc_idea_id: ideaId  // Store TC idea ID for reference
            };
            
            console.log('[TravelView] Prepared data for save:', travelData);
            
            const savedTravel = await window.TravelDataService.saveTravel(travelData);
            console.log('[TravelView] Travel saved to BOLT:', savedTravel);
            
            // Create trip_brand_assignment to make it visible on website
            if (savedTravel && savedTravel.id) {
              try {
                const urlParams = new URLSearchParams(window.location.search);
                const brand_id = urlParams.get('brand_id') || window.BOLT_DB?.brandId;
                const baseUrl = window.BOLT_DB.url.replace(/\/functions\/v1$/, '');
                const jwtToken = urlParams.get('token') || window.BOLT_DB?.token || window.BOLT_DB?.jwt || '';
                const authHeader = jwtToken ? `Bearer ${jwtToken}` : `Bearer ${window.BOLT_DB.anonKey}`;

                const isLikelySupabaseJwt = (() => {
                  try {
                    const parts = String(jwtToken || '').split('.');
                    if (parts.length < 2) return false;
                    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                    const json = atob(b64);
                    const payload = JSON.parse(json);
                    const iss = payload && payload.iss ? String(payload.iss) : '';
                    if (!iss) return false;
                    return /supabase/i.test(iss) || /\/auth\/v1/i.test(iss);
                  } catch (e) {
                    return false;
                  }
                })();

                if (!isLikelySupabaseJwt) {
                  console.info('[TravelView] Skipping trip_brand_assignments create (token is not a Supabase JWT)');
                  // Continue anyway
                  throw null;
                }
                
                console.log('[TravelView] Creating trip assignment for brand:', brand_id);
                
                const normStatus = (s) => String(s || '').trim().toLowerCase();
                const tripStatus = normStatus(savedTravel.status || travelData.status);
                const shouldPublish = tripStatus === 'live';
                
                const assignmentData = {
                  trip_id: savedTravel.id,
                  brand_id: brand_id,
                  is_published: shouldPublish,
                  status: shouldPublish ? 'accepted' : 'draft',
                  priority: 999
                };
                
                const assignmentResp = await fetch(`${baseUrl}/rest/v1/trip_brand_assignments`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': window.BOLT_DB.anonKey,
                    'Authorization': authHeader,
                    'Prefer': 'return=representation'
                  },
                  body: JSON.stringify(assignmentData)
                });
                
                if (assignmentResp.ok) {
                  console.log('[TravelView] Trip assignment created successfully');
                } else {
                  const error = await assignmentResp.text();
                  console.warn('[TravelView] Could not create assignment:', error);
                  // Don't fail the whole import if assignment fails
                }
              } catch (assignError) {
                if (assignError) {
                  console.warn('[TravelView] Assignment creation failed:', assignError);
                }
                // Continue anyway
              }
            }
            
            // Update URL with trip ID to prevent duplicates on next save
            if (savedTravel && savedTravel.id) {
              const url = new URL(window.location.href);
              url.searchParams.set('id', savedTravel.id);
              url.searchParams.set('trip_id', savedTravel.id);
              window.history.replaceState({}, '', url);
              console.log('[TravelView] Updated URL with trip ID:', savedTravel.id);
              
              // Also update WebBuilder's currentPageId if available
              if (window.WebBuilder && window.WebBuilder.currentPageId !== savedTravel.id) {
                window.WebBuilder.currentPageId = savedTravel.id;
                console.log('[TravelView] Updated WebBuilder.currentPageId:', savedTravel.id);
              }
            }
            
            // DEBUG: Show success and wait before redirect
            this.showStatus('success', `✅ Importeren gelukt! Reis is opgeslagen - ID: ${savedTravel.id}`);
            
            // Wait 2 seconds to show success message
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (saveError) {
          console.error('[TravelView] Error saving to BOLT:', saveError);
          this.showStatus('error', `❌ Fout bij opslaan: ${saveError.message}`);
          // Don't redirect on error
          return;
        }
        
        // Check if roadbook template is selected - load directly
        if (template === 'roadbook') {
          console.log('[TravelView] Loading as Roadbook directly');
          this.loadAsRoadbook(data, '1');
        } else {
          this.renderTravelContent(data);
        }

        // Hide status after 3 seconds
        setTimeout(() => {
          const statusEl = document.getElementById('travelStatus');
          if (statusEl) statusEl.style.display = 'none';
        }, 3000);

      } catch (error) {
        console.error('[TravelView] Error loading travel:', error);
        
        // Try to parse error response for more details
        let errorMsg = error.message;
        let errorDetails = null;
        
        try {
          const errorText = await response.text();
          errorDetails = JSON.parse(errorText);
          console.error('[TravelView] Error response:', errorDetails);
          
          if (errorDetails.detail) {
            errorMsg = typeof errorDetails.detail === 'string' 
              ? errorDetails.detail 
              : JSON.stringify(errorDetails.detail);
          }
          if (errorDetails.authUrl) {
            console.error('[TravelView] Auth URL:', errorDetails.authUrl);
          }
          if (errorDetails.status) {
            errorMsg = `HTTP ${errorDetails.status}: ${errorMsg}`;
          }
        } catch (e) {
          // Response already consumed or not JSON
        }
        
        this.showStatus('error', `<i class="fas fa-exclamation-circle"></i> Fout bij laden: ${errorMsg}<br><small>Check console voor details</small>`);
      }
    },

    getApiBase() {
      // Check if we're in development with local proxy
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Check if local proxy is running
        return 'http://localhost:5050';
      }
      // In production, use Vercel serverless functions
      return '';
    },

    showStatus(type, message) {
      const statusEl = document.getElementById('travelStatus');
      if (!statusEl) return;

      const colors = {
        loading: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
        success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534' },
        error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }
      };

      const color = colors[type] || colors.loading;

      statusEl.style.display = 'block';
      statusEl.style.background = color.bg;
      statusEl.style.borderLeft = `3px solid ${color.border}`;
      statusEl.style.color = color.text;
      statusEl.innerHTML = message;
    },

    generateTravelHTML(data, title, totalPrice, totalNights) {
      const destinations = data.destinations || [];
      const hotels = data.hotels || [];
      const transports = data.transports || [];
      
      let html = `
        <div class="travel-content">
          <h1>${title}</h1>
          <div class="travel-summary">
            <p><strong>Duur:</strong> ${totalNights} nachten</p>
            <p><strong>Prijs:</strong> €${Math.round(totalPrice)}</p>
          </div>
      `;
      
      if (destinations.length > 0) {
        html += '<h2>Bestemmingen</h2><ul>';
        destinations.forEach(dest => {
          html += `<li><strong>${dest.name}</strong>`;
          if (dest.description) {
            html += ` - ${dest.description}`;
          }
          html += '</li>';
        });
        html += '</ul>';
      }
      
      if (hotels.length > 0) {
        html += '<h2>Accommodaties</h2>';
        hotels.forEach(hotel => {
          const hotelData = hotel.hotelData || {};
          html += `
            <div class="hotel">
              <h3>${hotelData.name || 'Hotel'}</h3>
              ${hotelData.description ? `<p>${hotelData.description}</p>` : ''}
              ${hotel.checkInDate ? `<p><strong>Check-in:</strong> ${hotel.checkInDate}</p>` : ''}
              ${hotel.checkOutDate ? `<p><strong>Check-out:</strong> ${hotel.checkOutDate}</p>` : ''}
            </div>
          `;
        });
      }
      
      html += '</div>';
      return html;
    },

    renderTravelContent(data) {
      const contentEl = document.getElementById('travelContent');
      if (!contentEl) return;

      // Hide import method selection when loading existing travel
      const importMethodEl = document.querySelector('.import-method-card')?.closest('div[style*="background: white"]');
      if (importMethodEl) {
        importMethodEl.style.display = 'none';
      }

      // Extract key information
      const title = data.name || data.title || 'Reis';
      const description = data.description || data.intro || '';
      const days = data.days || [];
      const price = data.price || data.totalPrice || null;
      const currency = data.currency || 'EUR';
      const duration = data.duration || days.length || 0;
      const destination = data.destination || data.country || '';
      const image = data.image || data.mainImage || data.headerImage || '';

      contentEl.style.display = 'block';
      contentEl.innerHTML = `
        <!-- Travel Header -->
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${image ? `
            <div style="margin-bottom: 20px; border-radius: 8px; overflow: hidden; max-height: 300px;">
              <img src="${image}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          ` : ''}
          
          <h2 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; color: #111827;">
            ${title}
          </h2>

          <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 16px; color: #6b7280; font-size: 14px;">
            ${destination ? `
              <div style="display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-map-marker-alt" style="color: #ef4444;"></i>
                <span>${destination}</span>
              </div>
            ` : ''}
            ${duration ? `
              <div style="display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-calendar-days" style="color: #3b82f6;"></i>
                <span>${duration} dagen</span>
              </div>
            ` : ''}
            ${price ? `
              <div style="display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-euro-sign" style="color: #22c55e;"></i>
                <span>${this.formatPrice(price, currency)}</span>
              </div>
            ` : ''}
          </div>

          ${description ? `
            <div style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              ${description}
            </div>
          ` : ''}

          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button id="editTravelBtn" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px; background: #667eea !important; color: white !important; border: none;">
              <i class="fas fa-edit"></i> Bewerken in Builder
            </button>
            <button id="generateVideoBtn" class="btn btn-video" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%) !important; border: none; color: white !important;">
              <i class="fas fa-video"></i> Maak Video
            </button>
            <button id="viewJsonBtn" class="btn btn-secondary" style="display: flex; align-items: center; gap: 8px; background: #6b7280 !important; color: white !important; border: none;">
              <i class="fas fa-code"></i> Bekijk JSON
            </button>
          </div>
        </div>

        <!-- Days/Itinerary -->
        ${days.length > 0 ? `
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #111827;">
              <i class="fas fa-route"></i> Reisschema
            </h3>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${days.map((day, index) => this.renderDay(day, index + 1)).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Raw JSON (hidden by default) -->
        <div id="jsonViewer" style="display: none; background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px; overflow: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; color: #f1f5f9; font-size: 18px;">
              <i class="fas fa-code"></i> Raw JSON Data
            </h3>
            <button id="closeJsonBtn" class="btn btn-sm" style="background: #475569; color: white; border: none; padding: 6px 12px; border-radius: 6px;">
              <i class="fas fa-times"></i> Sluiten
            </button>
          </div>
          <pre style="margin: 0; color: #e2e8f0; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;

      // Attach event listeners for new buttons
      const editBtn = contentEl.querySelector('#editTravelBtn');
      const generateVideoBtn = contentEl.querySelector('#generateVideoBtn');
      const viewJsonBtn = contentEl.querySelector('#viewJsonBtn');
      const closeJsonBtn = contentEl.querySelector('#closeJsonBtn');
      const jsonViewer = contentEl.querySelector('#jsonViewer');
      
      // Edit in builder button
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          this.editInBuilder(data);
        });
      }

      if (generateVideoBtn) {
        generateVideoBtn.addEventListener('click', () => {
          this.openVideoGenerator(data);
        });
      }

      if (viewJsonBtn && jsonViewer) {
        viewJsonBtn.addEventListener('click', () => {
          jsonViewer.style.display = jsonViewer.style.display === 'none' ? 'block' : 'none';
        });
      }

      if (closeJsonBtn && jsonViewer) {
        closeJsonBtn.addEventListener('click', () => {
          jsonViewer.style.display = 'none';
        });
      }
    },

    renderDay(day, dayNumber) {
      const title = day.title || day.name || `Dag ${dayNumber}`;
      const description = day.description || day.text || '';
      const activities = day.activities || [];
      const accommodation = day.accommodation || day.hotel || null;
      const transport = day.transport || [];

      return `
        <div style="border-left: 3px solid #667eea; padding-left: 16px; position: relative;">
          <div style="position: absolute; left: -12px; top: 0; width: 20px; height: 20px; background: #667eea; border-radius: 50%; border: 3px solid white;"></div>
          
          <div style="font-weight: 700; font-size: 18px; color: #111827; margin-bottom: 8px;">
            ${title}
          </div>

          ${description ? `
            <div style="color: #6b7280; margin-bottom: 12px; line-height: 1.5;">
              ${description}
            </div>
          ` : ''}

          ${activities.length > 0 ? `
            <div style="margin-top: 12px;">
              <div style="font-weight: 600; color: #374151; margin-bottom: 6px; font-size: 14px;">
                <i class="fas fa-hiking"></i> Activiteiten:
              </div>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
                ${activities.map(act => `<li>${act.name || act.title || act}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${accommodation ? `
            <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 14px;">
              <i class="fas fa-hotel" style="color: #f59e0b;"></i>
              <span>${accommodation.name || accommodation}</span>
            </div>
          ` : ''}

          ${transport.length > 0 ? `
            <div style="margin-top: 12px;">
              <div style="font-weight: 600; color: #374151; margin-bottom: 6px; font-size: 14px;">
                <i class="fas fa-plane"></i> Transport:
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                ${transport.map(t => t.type || t.name || t).join(', ')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    },

    formatPrice(price, currency) {
      const num = typeof price === 'number' ? price : parseFloat(price);
      if (isNaN(num)) return price;

      const formatted = new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: currency || 'EUR'
      }).format(num);

      return formatted;
    },

    editInBuilder(data) {
      console.log('[TravelView] editInBuilder called with data:', data);
      
      // Convert Travel Compositor themes to tags
      if (data.themes && Array.isArray(data.themes)) {
        const tags = data.themes
          .map(theme => {
            if (typeof theme === 'string') return theme;
            if (theme && theme.name) return theme.name;
            return null;
          })
          .filter(Boolean)
          .map(tag => tag.toLowerCase())
          .join(',');
        
        data.tags = tags;
        console.log('[TravelView] Converted themes to tags:', tags);
      }
      
      // Switch to page mode and load the travel data into the builder
      if (window.websiteBuilder && typeof window.websiteBuilder.loadTravelIdea === 'function') {
        console.log('[TravelView] Calling websiteBuilder.loadTravelIdea...');
        window.websiteBuilder.loadTravelIdea(data);
        console.log('[TravelView] Switching to page mode...');
        if (window.WB_setMode) {
          window.WB_setMode('page');
        }
      } else {
        console.error('[TravelView] Builder not available!', {
          hasWebsiteBuilder: !!window.websiteBuilder,
          hasLoadTravelIdea: typeof window.websiteBuilder?.loadTravelIdea
        });
        alert('Builder functie nog niet beschikbaar. Implementeer websiteBuilder.loadTravelIdea()');
      }
    },

    openVideoGenerator(data) {
      console.log('[TravelView] Opening video generator with data:', data);
      
      // Check if VideoGeneratorView is loaded
      if (!window.VideoGeneratorView) {
        console.error('[TravelView] VideoGeneratorView not loaded!');
        alert('Video generator nog niet geladen. Herlaad de pagina.');
        return;
      }

      // Get or create video generator container
      let container = document.getElementById('videoGeneratorContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'videoGeneratorContainer';
        container.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #f9fafb; z-index: 10000; overflow-y: auto; overflow-x: hidden;';
        document.body.appendChild(container);
      } else {
        // Ensure scrolling is enabled if container already exists
        container.style.overflowY = 'auto';
        container.style.overflowX = 'hidden';
      }

      // Mount video generator
      window.VideoGeneratorView.mount(container, data);
    },
    
    // NEW: Show output format selector (Reis Pagina, Roadbook, Offerte, Voucher)
    showOutputFormatSelector(data) {
      // Create modal overlay
      const modal = document.createElement('div');
      modal.className = 'output-format-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 20000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s;';
      
      modal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 32px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s;">
          <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #111827;">
            <i class="fas fa-magic"></i> Kies Output Format
          </h2>
          <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
            Hoe wil je deze reis gebruiken?
          </p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <!-- Reis Pagina -->
            <div class="output-format-card" data-format="travel-page" style="
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              cursor: pointer;
              transition: all 0.3s;
              text-align: center;
            ">
              <div style="font-size: 48px; margin-bottom: 12px; color: #667eea;">
                <i class="fas fa-plane-departure"></i>
              </div>
              <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827;">Reis Pagina</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">Standaard reis website</p>
            </div>
            
            <!-- Roadbook -->
            <div class="output-format-card" data-format="roadbook" style="
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              cursor: pointer;
              transition: all 0.3s;
              text-align: center;
            ">
              <div style="font-size: 48px; margin-bottom: 12px; color: #10b981;">
                <i class="fas fa-map-marked-alt"></i>
              </div>
              <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827;">Roadbook</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">1-page reisboekje</p>
            </div>
            
            <!-- Offerte (Coming Soon) -->
            <div class="output-format-card" data-format="quote" style="
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              cursor: not-allowed;
              transition: all 0.3s;
              text-align: center;
              opacity: 0.5;
              position: relative;
            ">
              <div style="position: absolute; top: 8px; right: 8px; background: #fbbf24; color: white; font-size: 9px; padding: 3px 8px; border-radius: 4px; font-weight: 700;">SOON</div>
              <div style="font-size: 48px; margin-bottom: 12px; color: #f59e0b;">
                <i class="fas fa-file-invoice-dollar"></i>
              </div>
              <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827;">Offerte</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">Prijsopgave document</p>
            </div>
            
            <!-- Voucher (Coming Soon) -->
            <div class="output-format-card" data-format="voucher" style="
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              cursor: not-allowed;
              transition: all 0.3s;
              text-align: center;
              opacity: 0.5;
              position: relative;
            ">
              <div style="position: absolute; top: 8px; right: 8px; background: #fbbf24; color: white; font-size: 9px; padding: 3px 8px; border-radius: 4px; font-weight: 700;">SOON</div>
              <div style="font-size: 48px; margin-bottom: 12px; color: #ec4899;">
                <i class="fas fa-ticket-alt"></i>
              </div>
              <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827;">Voucher</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">Reis voucher</p>
            </div>
          </div>
          
          <!-- Roadbook Layout Selector (hidden by default) -->
          <div id="roadbookLayoutSelector" style="display: none; padding: 20px; background: #f9fafb; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #111827;">
              <i class="fas fa-palette"></i> Kies Roadbook Layout
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
              <div class="roadbook-layout-card" data-layout="1" style="
                border: 2px solid #10b981;
                border-radius: 8px;
                padding: 12px;
                cursor: pointer;
                background: white;
                text-align: center;
              ">
                <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 6px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; color: #059669; font-size: 24px;">
                  <i class="fas fa-map-marked-alt"></i>
                </div>
                <div style="font-weight: 600; font-size: 13px; color: #111827;">Layout 1</div>
                <div style="font-size: 11px; color: #6b7280;">Classic</div>
              </div>
              
              <div class="roadbook-layout-card" data-layout="2" style="
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                cursor: not-allowed;
                background: #f9fafb;
                text-align: center;
                opacity: 0.6;
                position: relative;
              ">
                <div style="position: absolute; top: 6px; right: 6px; background: #fbbf24; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">SOON</div>
                <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 6px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; color: #d97706; font-size: 24px;">
                  <i class="fas fa-route"></i>
                </div>
                <div style="font-weight: 600; font-size: 13px; color: #6b7280;">Layout 2</div>
                <div style="font-size: 11px; color: #9ca3af;">Modern</div>
              </div>
              
              <div class="roadbook-layout-card" data-layout="3" style="
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                cursor: not-allowed;
                background: #f9fafb;
                text-align: center;
                opacity: 0.6;
                position: relative;
              ">
                <div style="position: absolute; top: 6px; right: 6px; background: #fbbf24; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">SOON</div>
                <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%); border-radius: 6px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; color: #7c3aed; font-size: 24px;">
                  <i class="fas fa-compass"></i>
                </div>
                <div style="font-weight: 600; font-size: 13px; color: #6b7280;">Layout 3</div>
                <div style="font-size: 11px; color: #9ca3af;">Minimal</div>
              </div>
            </div>
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="cancelFormatBtn" style="
              padding: 12px 24px;
              background: #6b7280;
              border: none;
              border-radius: 8px;
              color: white;
              font-weight: 600;
              cursor: pointer;
            ">
              <i class="fas fa-times"></i> Annuleren
            </button>
            <button id="confirmFormatBtn" disabled style="
              padding: 12px 24px;
              background: #9ca3af;
              border: none;
              border-radius: 8px;
              color: white;
              font-weight: 600;
              cursor: not-allowed;
            ">
              <i class="fas fa-check"></i> Doorgaan
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add animations
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .output-format-card:hover:not([data-format="quote"]):not([data-format="voucher"]) {
          border-color: #667eea !important;
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
        }
        .roadbook-layout-card:hover:not([data-layout="2"]):not([data-layout="3"]) {
          border-color: #10b981 !important;
          transform: scale(1.05);
        }
      `;
      document.head.appendChild(style);
      
      // State
      let selectedFormat = null;
      let selectedLayout = null;
      
      const confirmBtn = modal.querySelector('#confirmFormatBtn');
      const cancelBtn = modal.querySelector('#cancelFormatBtn');
      const roadbookLayoutSelector = modal.querySelector('#roadbookLayoutSelector');
      
      // Format card selection
      modal.querySelectorAll('.output-format-card').forEach(card => {
        if (card.dataset.format === 'quote' || card.dataset.format === 'voucher') return;
        
        card.addEventListener('click', () => {
          // Deselect all
          modal.querySelectorAll('.output-format-card').forEach(c => {
            c.style.borderColor = '#e5e7eb';
            c.style.background = 'white';
          });
          
          // Select this one
          card.style.borderColor = '#667eea';
          card.style.background = '#f8f9ff';
          selectedFormat = card.dataset.format;
          
          // Show roadbook layout selector if roadbook selected
          if (selectedFormat === 'roadbook') {
            roadbookLayoutSelector.style.display = 'block';
            confirmBtn.disabled = true;
            confirmBtn.style.background = '#9ca3af';
            confirmBtn.style.cursor = 'not-allowed';
            selectedLayout = null;
          } else {
            roadbookLayoutSelector.style.display = 'none';
            confirmBtn.disabled = false;
            confirmBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            confirmBtn.style.cursor = 'pointer';
          }
        });
      });
      
      // Roadbook layout selection
      modal.querySelectorAll('.roadbook-layout-card').forEach(card => {
        if (card.dataset.layout === '2' || card.dataset.layout === '3') return;
        
        card.addEventListener('click', () => {
          // Deselect all
          modal.querySelectorAll('.roadbook-layout-card').forEach(c => {
            c.style.borderColor = '#e5e7eb';
            c.style.background = 'white';
          });
          
          // Select this one
          card.style.borderColor = '#10b981';
          card.style.background = '#f0fdf4';
          selectedLayout = card.dataset.layout;
          
          // Enable confirm button
          confirmBtn.disabled = false;
          confirmBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
          confirmBtn.style.cursor = 'pointer';
        });
      });
      
      // Cancel button
      cancelBtn.addEventListener('click', () => {
        modal.remove();
        style.remove();
      });
      
      // Confirm button
      confirmBtn.addEventListener('click', () => {
        if (!selectedFormat) return;
        
        modal.remove();
        style.remove();
        
        if (selectedFormat === 'travel-page') {
          // Load as normal travel page
          this.editInBuilder(data);
        } else if (selectedFormat === 'roadbook') {
          // Load as roadbook with selected layout
          this.loadAsRoadbook(data, selectedLayout);
        }
      });
      
      // Close on overlay click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
          style.remove();
        }
      });
    },
    
    // NEW: Load data as roadbook
    loadAsRoadbook(data, layout) {
      console.log('[TravelView] Loading as Roadbook with layout:', layout);
      console.log('[TravelView] TC Data:', data);
      
      // Convert TC data to roadbook format
      const roadbookData = this.convertTCToRoadbook(data);
      try {
        const v = String(this.selectedRoadbookVariant || window.CURRENT_ROADBOOK_VARIANT || 'autorondreis');
        roadbookData.meta = roadbookData.meta || {};
        roadbookData.meta.roadbook_variant = v;
        window.CURRENT_ROADBOOK_VARIANT = v;
        window.CURRENT_ROADBOOK_DOC_TYPE = (v === 'autorondreis-offerte') ? 'quote' : 'roadbook';
      } catch (e) {}
      console.log('[TravelView] Converted Roadbook Data:', roadbookData);
      
      // Close travel view
      if (window.WB_setMode) window.WB_setMode('page');
      
      // Wait for mode switch, then add roadbook to canvas
      setTimeout(() => {
        const canvas = document.getElementById('canvas');
        if (!canvas) {
          console.error('[TravelView] Canvas not found');
          return;
        }
        
        // Clear canvas
        canvas.innerHTML = '';
        
        // Create roadbook component
        if (window.ComponentFactory && window.ComponentFactory.createRoadbook) {
          const roadbook = window.ComponentFactory.createRoadbook(roadbookData);
          canvas.appendChild(roadbook);
          
          this.showStatus('success', `✅ Roadbook Layout ${layout} geladen!`);
          
          // Hide status after 3 seconds
          setTimeout(() => {
            const statusEl = document.getElementById('travelStatus');
            if (statusEl) statusEl.style.display = 'none';
          }, 3000);
        } else {
          console.error('[TravelView] ComponentFactory.createRoadbook not found');
        }
      }, 300);
    },
    
    // Convert Travel Compositor data to Roadbook format
    convertTCToRoadbook(tcData) {
      console.log('[TravelView] Converting TC data to Roadbook format...');
      console.log('[TravelView] Full TC Data:', JSON.stringify(tcData, null, 2));

      const preferredLang = String(this.tcLanguage || 'NL').trim().toUpperCase() || 'NL';
      const pickText = (v) => {
        try {
          if (v == null) return '';
          if (typeof v === 'string') return v;
          if (typeof v === 'number' || typeof v === 'boolean') return String(v);
          if (typeof v === 'object') {
            const obj = v;
            const direct = obj[preferredLang];
            if (typeof direct === 'string' && direct.trim()) return direct;
            const nl = obj.NL || obj.nl;
            if (typeof nl === 'string' && nl.trim()) return nl;
            const en = obj.EN || obj.en;
            if (typeof en === 'string' && en.trim()) return en;
            const firstKey = Object.keys(obj || {})[0];
            const firstVal = firstKey ? obj[firstKey] : '';
            return (typeof firstVal === 'string') ? firstVal : '';
          }
          return '';
        } catch (e) {
          return '';
        }
      };
      
      // Store for debugging
      window.lastTravelData = tcData;
      
      // Extract title
      const title = pickText(tcData.title) || pickText(tcData.name) || 'Jouw Reis';
      
      // Extract departure date - try multiple sources
      let departureDate = null;
      
      // 1. Check first hotel check-in (most reliable for auto trips)
      if (tcData.hotels && tcData.hotels.length > 0 && tcData.hotels[0].checkInDate) {
        departureDate = tcData.hotels[0].checkInDate;
        console.log('[TravelView] Using first hotel check-in as departure:', departureDate);
      }
      // 2. Check dates object
      else if (tcData.dates && tcData.dates.departure) {
        departureDate = tcData.dates.departure;
      }
      // 3. Check first transport
      else if (tcData.transports && tcData.transports.length > 0) {
        departureDate = tcData.transports[0].departureDate || tcData.transports[0].date;
      }
      // 4. Check destinations
      else if (tcData.destinations && tcData.destinations.length > 0 && tcData.destinations[0].startDate) {
        departureDate = tcData.destinations[0].startDate;
      }
      
      // Default to 3 months from now if no date found
      if (!departureDate) {
        const future = new Date();
        future.setMonth(future.getMonth() + 3);
        departureDate = future.toISOString().split('T')[0];
      }
      
      console.log('[TravelView] Final departure date:', departureDate);
      
      // Convert transports - use ALL available data
      const transports = (tcData.transports || []).map(t => ({
        from: t.originCode || t.departureCity || t.from || 'Vertrek',
        to: t.targetCode || t.arrivalCity || t.to || 'Aankomst',
        fromCity: t.originDestinationCode || t.originCode || '',
        toCity: t.targetDestinationCode || t.targetCode || '',
        date: t.departureDate || t.date || '',
        departureTime: t.departureTime || t.time || '',
        arrivalTime: t.arrivalTime || '',
        arrivalDate: t.arrivalDate || '',
        flightNumber: t.transportNumber || t.flightNumber || '',
        company: t.company || '',
        duration: t.duration || '',
        baggageInfo: t.baggageInfo || '',
        type: t.transportType?.toLowerCase() || t.type || 'flight'
      }));

      // Convert cars (rental cars)
      const cars = (tcData.cars || tcData.carRentals || []).map(c => {
        const carData = c.carData || c.car || c;
        const pickUp = c.pickUp || c.pickup || c.pickUpLocation || c.pickupLocation || carData.pickUp || carData.pickup || {};
        const dropOff = c.dropOff || c.dropoff || c.dropOffLocation || c.dropoffLocation || carData.dropOff || carData.dropoff || {};

        const pickupDate = c.pickUpDate || c.pickupDate || c.startDate || c.date || carData.pickUpDate || carData.pickupDate || '';
        const dropoffDate = c.dropOffDate || c.dropoffDate || c.endDate || carData.dropOffDate || carData.dropoffDate || '';

        return {
          provider: c.company || c.vendor || c.supplier || carData.company || carData.vendor || carData.supplier || '',
          bookingReference: c.bookingReference || c.reservationNumber || carData.bookingReference || '',
          pickupDate,
          pickupTime: c.pickUpTime || c.pickupTime || carData.pickUpTime || carData.pickupTime || '',
          dropoffDate,
          dropoffTime: c.dropOffTime || c.dropoffTime || carData.dropOffTime || carData.dropoffTime || '',
          pickupLocation: pickUp.name || pickUp.location || pickUp.address || c.pickUpLocationName || c.pickupLocationName || '',
          dropoffLocation: dropOff.name || dropOff.location || dropOff.address || c.dropOffLocationName || c.dropoffLocationName || '',
          vehicle: carData.vehicle || carData.carName || carData.model || carData.category || c.vehicle || c.model || c.category || '',
          type: 'car'
        };
      });

      // Convert activities / excursions
      const activities = (tcData.activities || tcData.excursions || tcData.experiences || tcData.tours || []).map(a => {
        const act = a.activityData || a.activity || a.experienceData || a.experience || a;

        const date = a.date || a.startDate || a.activityDate || act.date || act.startDate || '';
        const endDate = a.endDate || a.finishDate || act.endDate || '';
        const time = a.time || a.startTime || act.time || act.startTime || '';

        return {
          name: pickText(act.name) || pickText(a.name) || pickText(a.title) || 'Excursie',
          description: pickText(act.description) || pickText(a.description) || '',
          location: act.destination?.name || act.location || a.location || a.city || '',
          date,
          endDate,
          time,
          duration: act.duration || a.duration || '',
          provider: a.company || a.vendor || act.company || act.vendor || '',
          image: (act.images && (act.images[0]?.url || act.images[0])) || act.image || a.image || '',
          type: 'activity'
        };
      });
      
      // Convert hotels - extract from hotelData nested object
      const hotels = (tcData.hotels || tcData.accommodations || []).map((h, idx) => {
        const hotelData = h.hotelData || h.hotel || h;
        
        // Extract image URLs from images array
        const images = hotelData.images?.map(img => img.url || img) || [];
        
        return {
          name: pickText(hotelData.name) || pickText(h.hotelName) || 'Hotel',
          location: hotelData.destination?.name || hotelData.address || 'Locatie',
          checkIn: h.checkInDate || h.checkIn || '',
          checkOut: h.checkOutDate || h.checkOut || '',
          nights: h.nights || 0,
          roomType: h.roomTypes || '',
          mealPlan: h.mealPlan || '',
          image: images[0] || '',
          images: images,
          description: pickText(hotelData.description) || '',
          fullDescription: pickText(hotelData.description) || '',
          address: hotelData.address || '',
          phone: hotelData.phoneNumber || '',
          chain: hotelData.chain || ''
        };
      });
      
      // Convert itinerary (from days or itinerary array)
      let days = tcData.days || tcData.itinerary || tcData.dayToDay || [];
      
      // If no days, create from destinations (expand by fromDay/toDay)
      if (days.length === 0 && tcData.destinations && tcData.destinations.length > 0) {
        console.log('[TravelView] No days found, creating from destinations');
        days = [];
        
        tcData.destinations.forEach(dest => {
          const fromDay = dest.fromDay || 1;
          const toDay = dest.toDay || fromDay;
          const numDays = toDay - fromDay + 1;
          const destName = pickText(dest.name) || dest.name || 'Bestemming';
          
          // Create a day entry for each day in this destination
          for (let i = 0; i < numDays; i++) {
            const dayNum = fromDay + i;
            const destImgsRaw = dest.imageUrls || dest.images || [];
            const destImgs = (Array.isArray(destImgsRaw) ? destImgsRaw : [])
              .map(img => img && typeof img === 'object' ? (img.url || img.src || '') : img)
              .filter(Boolean);
            days.push({
              title: `Dag ${dayNum}: ${destName}`,
              description: i === 0 ? (pickText(dest.description) || `Bezoek aan ${destName}`) : `Vervolg in ${destName}`,
              image: (destImgs.length ? destImgs[i % destImgs.length] : '') || dest.image || dest.imageUrl || '',
              images: destImgs,
              destination: destName
            });
          }
        });
      }
      
      const itinerary = days.map((day, index) => {
        const rawImgs = day.images || day.imageUrls || day.photos || [];
        let images = (Array.isArray(rawImgs) ? rawImgs : [])
          .map(img => img && typeof img === 'object' ? (img.url || img.src || '') : img)
          .filter(Boolean);
        const first = day.image || day.imageUrl || images[0] || '';
        if (first && !images.includes(first)) images = [first, ...images];

        return {
          title: pickText(day.title) || pickText(day.name) || `Dag ${index + 1}`,
          description: pickText(day.description) || pickText(day.text) || pickText(day.summary) || '',
          image: first,
          images
        };
      });

      const destinations = (tcData.destinations || []).map((d, idx) => {
        const geo = d.geolocation || d.geo || d.location || {};
        const latitude = (d.latitude != null ? d.latitude : (geo.latitude != null ? geo.latitude : null));
        const longitude = (d.longitude != null ? d.longitude : (geo.longitude != null ? geo.longitude : null));
        const fromDay = d.fromDay || d.day || 1;
        const toDay = d.toDay || fromDay;
        const name = pickText(d.name) || pickText(d.title) || d.name || d.title || `Bestemming ${idx + 1}`;
        return {
          name,
          title: name,
          description: pickText(d.description) || '',
          fromDay,
          toDay,
          latitude,
          longitude
        };
      }).filter(d => d && d.latitude != null && d.longitude != null);
      
      // Extract description/intro text
      const description = pickText(tcData.description) || pickText(tcData.summary) || pickText(tcData.intro) || '';
      
      // Extract subtitle
      const subtitle = pickText(tcData.subtitle) || pickText(tcData.tagline) || pickText(tcData.slogan) || '';
      
      // Extract duration - calculate from dates if not provided
      let duration = tcData.duration || tcData.numberOfDays || 0;
      
      // If no duration, calculate from departure and return dates
      if (!duration && tcData.departureDate && tcData.returnDate) {
        const start = new Date(tcData.departureDate);
        const end = new Date(tcData.returnDate);
        // Add 1 to include both start and end day (12-19 juni = 8 dagen)
        duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }
      
      // Fallback to itinerary length
      if (!duration) {
        duration = itinerary.length || 0;
      }
      
      console.log('[TravelView] Converted:', {
        title,
        departureDate,
        description: description.substring(0, 50) + '...',
        duration,
        transports: transports.length,
        hotels: hotels.length,
        cars: cars.length,
        activities: activities.length,
        itinerary: itinerary.length
      });
      
      return {
        title,
        subtitle,
        departureDate,
        description,
        duration,
        transports,
        cars,
        activities,
        hotels,
        itinerary,
        destinations
      };
    }
  };

  // Expose globally
  window.TravelView = TravelView;
  console.log('[TravelView] ✅ Module loaded and registered successfully');
  
  // Dispatch event to notify router that TravelView is ready
  try {
    window.dispatchEvent(new CustomEvent('travelViewReady'));
  } catch (e) {}
})();
