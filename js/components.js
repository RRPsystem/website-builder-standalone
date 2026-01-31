// Component factory voor website builder

// Global helper: apply responsive src/srcset for known CDNs (e.g., Unsplash)
function __WB_applyResponsiveSrc(imageEl, url, opts = {}) {
    try {
        // Basic perf hints
        try { imageEl.decoding = 'async'; } catch (e) {}
        try { if (!imageEl.loading) imageEl.loading = 'lazy'; } catch (e) {}

        const u = new URL(url);
        const widths = opts.widths || [1280, 1920, 2560, 3200];
        const quality = String(opts.quality || 80);
        const fm = opts.format || 'webp';
        const currentSrc = imageEl.currentSrc || imageEl.src || '';
        const currentHost = (()=>{ try { return new URL(currentSrc).host; } catch (e) { return ''; } })();

        if (u.hostname.includes('images.unsplash.com')) {
            const base = `${u.origin}${u.pathname}`;
            const params = u.searchParams;
            const fit = params.get('fit') || 'crop';
            const auto = params.get('auto') || 'format';
            const srcs = widths.map(w => `${base}?q=${quality}&w=${w}&auto=${auto}&fit=${fit}&fm=${fm}`);
            const defaultSrc = srcs[1] || srcs[0];
            // Avoid unnecessary work if defaultSrc already set
            if (currentSrc === defaultSrc) return;
            const apply = () => {
                imageEl.src = defaultSrc;
                imageEl.srcset = srcs.map((s, i) => `${s} ${widths[i]}w`).join(', ');
                imageEl.sizes = opts.sizes || '100vw';
            };
            return (typeof requestAnimationFrame === 'function') ? requestAnimationFrame(apply) : apply();
        }

        // If switching CDN/host, drop previous srcset/sizes to prevent the browser from sticking to cached candidates
        if (currentHost && currentHost !== u.host) {
            try { imageEl.removeAttribute('srcset'); imageEl.removeAttribute('sizes'); } catch (e) {}
        }
    } catch (e) {}
    // Fallback: single src (batched)
    const setSingle = () => { imageEl.src = url; };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(setSingle); else setSingle();
}
class ComponentFactory {
    static createComponent(type, options = {}) {
        const components = {
            container: this.createContainer,
            row: this.createRow,
            column: this.createColumn,
            heading: this.createHeading,
            text: this.createText,
            image: this.createImage,
            button: this.createButton,
            'hero-travel': this.createHeroTravel,
            'hero-travel-search': this.createHeroTravelSearch,
            'hero-page': this.createHeroPage,
            'hero-banner-cta': this.createHeroBannerCta,
            'hero-video-cta': this.createHeroVideoCta,
            'feature-media': this.createFeatureMedia,
            'feature-highlight': this.createFeatureHighlight,
            'feature-icon-image': this.createFeatureIconImage,
            'content-flex': this.createContentFlex,
            'travel-types': this.createTravelTypes,
            'contact-info': this.createContactInfo,
            'contact-map-cta': this.createContactMapCta,
            'media-row': this.createMediaRow,
            'dest-tabs': this.createDestTabs,
            'news-article': this.createNewsArticle,
            'news-overview': this.createNewsOverview,
            'travel-overview': this.createTravelOverview,
            'jotform-embed': this.createJotformEmbed,
            'travel-card-transport': this.createTravelCardTransport,
            'travel-card-hotel': this.createTravelCardHotel,
            'travel-card-destination': this.createTravelCardDestination,
            'travel-card-transfer': this.createTravelCardTransfer,
            'travel-card-booking': this.createTravelCardBooking,
            'travel-card-emergency': this.createTravelCardEmergency,
            'travel-card-info': this.createTravelCardInfo,
            'travel-day-header': this.createTravelDayHeader,
            'travel-timeline': this.createTravelTimeline,
            'travel-hero': this.createTravelHero,
            'route-overview-btn': this.createRouteOverviewButton,
            'travel-intro': this.createTravelIntro,
            'animated-route-map': this.createAnimatedRouteMap,
            'travel-filter-bar': this.createTravelFilterBar,
            'roadbook': this.createRoadbook,
            'roadbook-v1': this.createRoadbookV1,
            'roadbook-animated-timeline': this.createRoadbookAnimatedTimeline
        };

        

        if (components[type]) {
            return components[type].call(this, options);
        } else {
            console.error(`Component type "${type}" not found`);
            return null;
        }

    }

    // DESTINATIONS: Tabs for Cities / Regions / UNESCO (cards grid)
    static createDestTabs(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-dest-tabs';
        section.setAttribute('data-component', 'dest-tabs');
        section.id = this.generateId('dest_tabs');

        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // State
        const defaults = (labelBase) => Array.from({ length: 5 }).map((_, i) => ({
            img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
            title: `${labelBase} ${i + 1}`,
            summary: 'Korte beschrijving (2Ã¢â‚¬“3 regels) over deze plek.',
            href: '#'
        }));
        section._tabs = {
            cities: options.cities || defaults('Stad'),
            regions: options.regions || defaults('Regio'),
            unesco: options.unesco || defaults('UNESCO')
        };
        section._activeTab = options.activeTab || 'cities';
        section._mobileSlider = options.mobileSlider !== false; // true by default

        // Header (tabs)
        const header = document.createElement('div');
        header.className = 'dt-header';
        header.style.cssText = 'max-width:1100px;margin:0 auto 8px;display:flex;gap:8px;align-items:center;padding:0 16px;';
        const mkTabBtn = (key, label) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn btn-secondary';
            b.textContent = label;
            b.setAttribute('data-tab', key);
            b.onclick = (e) => { e.stopPropagation(); section._activeTab = key; renderCards(); highlightActive(); };
            return b;
        };
        const tabCities = mkTabBtn('cities', 'Steden');
        const tabRegions = mkTabBtn('regions', 'Regio\'s');
        const tabUnesco = mkTabBtn('unesco', 'UNESCO');
        header.appendChild(tabCities);
        header.appendChild(tabRegions);
        header.appendChild(tabUnesco);

        // Body (cards container)
        const body = document.createElement('div');
        body.className = 'dt-body';
        body.style.cssText = 'max-width:1100px;margin:0 auto;padding:4px 16px;';

        const grid = document.createElement('div');
        grid.className = 'dt-grid';
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:12px;align-items:stretch;';
        body.appendChild(grid);

        const applyMobileBehavior = () => {
            try {
                const isMobile = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
                if (isMobile && section._mobileSlider) {
                    grid.style.display = 'flex';
                    grid.style.overflowX = 'auto';
                    grid.style.scrollSnapType = 'x mandatory';
                    grid.style.gap = '10px';
                } else {
                    grid.style.display = 'grid';
                    grid.style.overflowX = 'hidden';
                    grid.style.scrollSnapType = 'none';
                    grid.style.gridTemplateColumns = 'repeat(3,1fr)';
                    grid.style.gap = '12px';
                }
            } catch (e) {}
        };

        const renderCards = () => {
            grid.innerHTML = '';
            const list = section._tabs[section._activeTab] || [];
            list.forEach((item, idx) => {
                const card = document.createElement('a');
                card.className = 'dt-card';
                card.href = item.href || '#';
                card.style.cssText = 'display:block;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,0.05);text-decoration:none;color:#111827;min-width:68%;scroll-snap-align:start;';
                const img = document.createElement('img');
                __WB_applyResponsiveSrc(img, item.img);
                img.alt = item.title || '';
                img.style.cssText = 'width:100%;height:160px;object-fit:cover;display:block;';
                const wrap = document.createElement('div');
                wrap.style.cssText = 'padding:10px;';
                const h = document.createElement('div'); h.textContent = item.title || ''; h.style.cssText='font-weight:700;margin:0 0 4px;';
                const p = document.createElement('div'); p.textContent = item.summary || ''; p.style.cssText='color:#475569;font-size:14px;min-height:38px;';
                const more = document.createElement('div'); more.innerHTML = '<span style="color:#0ea5e9;font-weight:600;">Bekijk</span>'; more.style.marginTop='6px';
                wrap.appendChild(h); wrap.appendChild(p); wrap.appendChild(more);
                card.appendChild(img);
                card.appendChild(wrap);
                grid.appendChild(card);
            });
            applyMobileBehavior();
        };

        const highlightActive = () => {
            [tabCities, tabRegions, tabUnesco].forEach(b => {
                const on = b.getAttribute('data-tab') === section._activeTab;
                b.classList.toggle('btn-primary', on);
                b.classList.toggle('btn-secondary', !on);
            });
        };

        renderCards();
        highlightActive();

        // Responsive re-check on resize
        try { window.addEventListener('resize', () => applyMobileBehavior()); } catch (e) {}

        section.appendChild(header);
        section.appendChild(body);

        // Interactions
        this.makeSelectable(section);

        // API for PropertiesPanel
        section.__destTabsApi = {
            setActiveTab: (key) => { if (['cities','regions','unesco'].includes(key)) { section._activeTab = key; renderCards(); highlightActive(); } },
            getActiveTab: () => section._activeTab,
            getItems: (key) => (section._tabs[key] || []).slice(),
            setItems: (key, items) => { if (section._tabs[key]) { section._tabs[key] = (items || []).slice(0, 12); renderCards(); } },
            updateItem: (key, index, data) => {
                const arr = section._tabs[key];
                if (!arr) return;
                const it = arr[index];
                if (!it) return;
                section._tabs[key][index] = { ...it, ...data };
                renderCards();
            },
            reorder: (key, from, to) => {
                const arr = section._tabs[key];
                if (!arr) return;
                const f = Math.max(0, Math.min(from, arr.length-1));
                const t = Math.max(0, Math.min(to, arr.length-1));
                if (f === t) return;
                const moved = arr.splice(f,1)[0];
                arr.splice(t,0,moved);
                renderCards();
            },
            setMobileSlider: (on) => { section._mobileSlider = !!on; renderCards(); }
        };

        return section;
    }

    // NEWS: Article block with title, meta (date, author, tags) and body
    static createNewsArticle(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-news-article';
        section.setAttribute('data-component', 'news-article');
        section.id = this.generateId('news_article');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Defaults
        const title = options.title || 'Titel van het nieuwsartikel';
        const dateStr = options.date || new Date().toISOString().slice(0,10);
        const author = options.author || 'Auteur';
        const tags = Array.isArray(options.tags) ? options.tags : ['nieuws'];
        const bodyHtml = options.bodyHtml || '<p>Schrijf hier de inhoud van je nieuwsartikel. Deze tekst is bewerkbaar.</p>';

        // Header
        const header = document.createElement('header');
        header.className = 'na-header';
        header.innerHTML = `
            <h1 class="na-title" contenteditable="true">${title}</h1>
            <div class="na-meta" style="display:flex;gap:12px;align-items:center;color:#6b7280;font-size:14px;">
                <span class="na-date" contenteditable="true">${dateStr}</span>
                <span class="na-dot" aria-hidden="true">&bull;</span>
                <span class="na-author" contenteditable="true">${author}</span>
            </div>
            <ul class="na-tags" style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 12px;padding:0;list-style:none;"></ul>
        `;

        const tagsUl = header.querySelector('.na-tags');
        (tags || []).forEach(t => {
            const li = document.createElement('li');
            li.className = 'na-tag';
            li.textContent = String(t);
            li.style.cssText = 'background:#eef2ff;color:#3730a3;border:1px solid #e5e7eb;border-radius:20px;padding:4px 10px;font-size:12px;';
            tagsUl.appendChild(li);
        });

        // Body
        const body = document.createElement('div');
        body.className = 'na-body';
        body.contentEditable = true;
        body.innerHTML = bodyHtml;

        // Align like Content Flex: wrap inner content to limit width and add side padding
        const wrap = document.createElement('div');
        wrap.className = 'na-wrap';
        wrap.style.cssText = 'max-width:1100px;margin:0 auto;padding:8px 16px;';
        wrap.appendChild(header);
        wrap.appendChild(body);

        section.appendChild(wrap);

        this.makeSelectable(section);
        this.makeEditable(header.querySelector('.na-title'));
        return section;
    }

    // NEWS OVERVIEW: Grid of news articles with filtering
    static createNewsOverview(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-news-overview';
        section.setAttribute('data-component', 'news-overview');
        section.id = this.generateId('news_overview');

        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Container
        const container = document.createElement('div');
        container.style.maxWidth = '1200px';
        container.style.margin = '0 auto';
        container.style.padding = '60px 20px';

        // Header section
        const headerSection = document.createElement('div');
        headerSection.style.marginBottom = '40px';

        const badge = document.createElement('span');
        badge.textContent = options.badge || 'Nieuwste nieuwsjes';
        badge.contentEditable = true;
        badge.style.display = 'inline-block';
        badge.style.background = '#fff3e0';
        badge.style.color = '#ff8c00';
        badge.style.padding = '6px 16px';
        badge.style.borderRadius = '20px';
        badge.style.fontSize = '14px';
        badge.style.fontWeight = '600';
        badge.style.marginBottom = '16px';

        const title = document.createElement('h2');
        title.textContent = options.title || 'Blijf op de hoogte en check onze nieuwsberichten';
        title.contentEditable = true;
        title.style.fontSize = '42px';
        title.style.fontWeight = '700';
        title.style.color = '#1f2937';
        title.style.marginBottom = '20px';
        title.style.lineHeight = '1.2';

        const viewAllBtn = document.createElement('button');
        viewAllBtn.textContent = 'Alle berichten';
        viewAllBtn.style.position = 'absolute';
        viewAllBtn.style.top = '0';
        viewAllBtn.style.right = '0';
        viewAllBtn.style.background = '#ff8c00';
        viewAllBtn.style.color = '#fff';
        viewAllBtn.style.border = 'none';
        viewAllBtn.style.padding = '12px 24px';
        viewAllBtn.style.borderRadius = '8px';
        viewAllBtn.style.fontSize = '16px';
        viewAllBtn.style.fontWeight = '600';
        viewAllBtn.style.cursor = 'pointer';
        viewAllBtn.style.transition = 'background 0.3s ease';
        viewAllBtn.addEventListener('mouseenter', function() {
            this.style.background = '#ff7700';
        });
        viewAllBtn.addEventListener('mouseleave', function() {
            this.style.background = '#ff8c00';
        });

        headerSection.style.position = 'relative';
        headerSection.appendChild(badge);
        headerSection.appendChild(title);
        headerSection.appendChild(viewAllBtn);

        // Filter section (optional)
        const filterSection = document.createElement('div');
        filterSection.className = 'news-filters';
        filterSection.style.display = options.showFilters === false ? 'none' : 'flex';
        filterSection.style.gap = '12px';
        filterSection.style.flexWrap = 'wrap';
        filterSection.style.marginBottom = '40px';

        const filters = options.filters || ['Alle', 'Sport', 'Steden', 'Natuur', 'Cultuur'];
        filters.forEach((filter, index) => {
            const filterBtn = document.createElement('button');
            filterBtn.textContent = filter;
            filterBtn.className = 'news-filter-btn';
            filterBtn.dataset.filter = filter.toLowerCase();
            filterBtn.style.background = index === 0 ? '#ff8c00' : '#f3f4f6';
            filterBtn.style.color = index === 0 ? '#fff' : '#6b7280';
            filterBtn.style.border = 'none';
            filterBtn.style.padding = '10px 20px';
            filterBtn.style.borderRadius = '20px';
            filterBtn.style.fontSize = '14px';
            filterBtn.style.fontWeight = '600';
            filterBtn.style.cursor = 'pointer';
            filterBtn.style.transition = 'all 0.3s ease';
            
            filterBtn.addEventListener('click', function() {
                // Update active state
                filterSection.querySelectorAll('.news-filter-btn').forEach(btn => {
                    btn.style.background = '#f3f4f6';
                    btn.style.color = '#6b7280';
                });
                this.style.background = '#ff8c00';
                this.style.color = '#fff';
                
                // Filter articles
                const filterValue = this.dataset.filter;
                const articles = grid.querySelectorAll('.news-card');
                articles.forEach(article => {
                    const tags = article.dataset.tags || '';
                    if (filterValue === 'alle' || tags.includes(filterValue)) {
                        article.style.display = 'block';
                    } else {
                        article.style.display = 'none';
                    }
                });
            });
            
            filterSection.appendChild(filterBtn);
        });

        // News grid
        const grid = document.createElement('div');
        grid.className = 'news-grid';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
        grid.style.gap = '30px';

        // Sample articles (will be replaced with real data)
        const maxArticles = options.maxArticles || 6;
        const sampleArticles = options.articles || [
            { 
                image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
                date: '18 JUN',
                location: 'Sport',
                title: 'Olympische spelen 2024',
                excerpt: 'De regels de France en de buitenwijken van Parijs',
                tags: 'sport,parijs'
            },
            {
                image: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=600',
                date: '13 MEI',
                location: 'Steden',
                title: 'Dublin',
                excerpt: 'In Dublin, de bruisende hoofdstad van Ierland, is altijd wel',
                tags: 'steden,ierland'
            },
            {
                image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
                date: '06 APR',
                location: 'Steden',
                title: 'Hoe gaat het met De Notre Dame',
                excerpt: 'Nieuwsupdate: Herstel van de Notre-Dame-kathedraal in Parijs na de brand',
                tags: 'steden,parijs,cultuur'
            }
        ];

        sampleArticles.slice(0, maxArticles).forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card';
            card.dataset.tags = article.tags || '';
            card.style.background = '#fff';
            card.style.borderRadius = '12px';
            card.style.overflow = 'hidden';
            card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            card.style.cursor = 'pointer';

            // Image container
            const imageContainer = document.createElement('div');
            imageContainer.style.position = 'relative';
            imageContainer.style.height = '220px';
            imageContainer.style.overflow = 'hidden';

            const img = document.createElement('img');
            img.src = article.image;
            img.alt = article.title;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.transition = 'transform 0.3s ease';

            // Date badge
            const dateBadge = document.createElement('div');
            dateBadge.textContent = article.date;
            dateBadge.style.position = 'absolute';
            dateBadge.style.top = '16px';
            dateBadge.style.right = '16px';
            dateBadge.style.background = '#ff8c00';
            dateBadge.style.color = '#fff';
            dateBadge.style.padding = '8px 12px';
            dateBadge.style.borderRadius = '8px';
            dateBadge.style.fontSize = '12px';
            dateBadge.style.fontWeight = '700';
            dateBadge.style.textAlign = 'center';
            dateBadge.style.lineHeight = '1.2';

            // Location badge
            const locationBadge = document.createElement('div');
            locationBadge.textContent = article.location;
            locationBadge.style.position = 'absolute';
            locationBadge.style.bottom = '16px';
            locationBadge.style.left = '16px';
            locationBadge.style.background = 'rgba(255, 255, 255, 0.95)';
            locationBadge.style.color = '#1f2937';
            locationBadge.style.padding = '6px 12px';
            locationBadge.style.borderRadius = '6px';
            locationBadge.style.fontSize = '13px';
            locationBadge.style.fontWeight = '600';

            imageContainer.appendChild(img);
            imageContainer.appendChild(dateBadge);
            imageContainer.appendChild(locationBadge);

            // Content
            const content = document.createElement('div');
            content.style.padding = '20px';

            // Author/Comments
            const meta = document.createElement('div');
            meta.style.display = 'flex';
            meta.style.gap = '16px';
            meta.style.marginBottom = '12px';
            meta.style.fontSize = '13px';
            meta.style.color = '#6b7280';
            meta.innerHTML = `
                <span><i class="fas fa-user" style="color:#ff8c00;margin-right:6px;"></i>FlyerDrive</span>
                <span><i class="fas fa-comment" style="color:#ff8c00;margin-right:6px;"></i>0 Comments</span>
            `;

            const cardTitle = document.createElement('h3');
            cardTitle.textContent = article.title;
            cardTitle.style.fontSize = '20px';
            cardTitle.style.fontWeight = '700';
            cardTitle.style.color = '#1f2937';
            cardTitle.style.marginBottom = '12px';
            cardTitle.style.lineHeight = '1.3';

            const excerpt = document.createElement('p');
            excerpt.textContent = article.excerpt;
            excerpt.style.fontSize = '14px';
            excerpt.style.color = '#6b7280';
            excerpt.style.lineHeight = '1.6';
            excerpt.style.marginBottom = '16px';

            const readMore = document.createElement('a');
            readMore.textContent = 'Lees verder';
            readMore.href = '#';
            readMore.style.color = '#ff8c00';
            readMore.style.fontSize = '14px';
            readMore.style.fontWeight = '600';
            readMore.style.textDecoration = 'none';
            readMore.style.display = 'inline-flex';
            readMore.style.alignItems = 'center';
            readMore.style.gap = '6px';
            readMore.innerHTML = 'Lees verder <i class="fas fa-arrow-right"></i>';

            content.appendChild(meta);
            content.appendChild(cardTitle);
            content.appendChild(excerpt);
            content.appendChild(readMore);

            card.appendChild(imageContainer);
            card.appendChild(content);

            // Hover effects
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                img.style.transform = 'scale(1.05)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                img.style.transform = 'scale(1)';
            });

            grid.appendChild(card);
        });

        container.appendChild(headerSection);
        container.appendChild(filterSection);
        container.appendChild(grid);
        section.appendChild(container);

        this.makeSelectable(section);
        this.makeEditable(badge);
        this.makeEditable(title);

        return section;
    }

    // TRAVEL OVERVIEW: Grid of travel packages with filtering and search
    static createTravelOverview(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-travel-overview';
        section.setAttribute('data-component', 'travel-overview');
        section.id = this.generateId('travel_overview');

        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Container
        const container = document.createElement('div');
        container.style.maxWidth = '1200px';
        container.style.margin = '0 auto';
        container.style.padding = '60px 20px';

        // Header section
        const headerSection = document.createElement('div');
        headerSection.style.marginBottom = '40px';

        const badge = document.createElement('span');
        badge.textContent = options.badge || 'Ontdek & Boek';
        badge.contentEditable = true;
        badge.style.display = 'inline-block';
        badge.style.background = '#e0f2fe';
        badge.style.color = '#0284c7';
        badge.style.padding = '6px 16px';
        badge.style.borderRadius = '20px';
        badge.style.fontSize = '14px';
        badge.style.fontWeight = '600';
        badge.style.marginBottom = '16px';

        const title = document.createElement('h2');
        title.textContent = options.title || 'Onze Reizen - Vind jouw perfecte reis';
        title.contentEditable = true;
        title.style.fontSize = '42px';
        title.style.fontWeight = '700';
        title.style.color = '#1f2937';
        title.style.marginBottom = '20px';
        title.style.lineHeight = '1.2';

        const viewAllBtn = document.createElement('button');
        viewAllBtn.textContent = 'Alle reizen';
        viewAllBtn.style.position = 'absolute';
        viewAllBtn.style.top = '0';
        viewAllBtn.style.right = '0';
        viewAllBtn.style.background = '#0284c7';
        viewAllBtn.style.color = '#fff';
        viewAllBtn.style.border = 'none';
        viewAllBtn.style.padding = '12px 24px';
        viewAllBtn.style.borderRadius = '8px';
        viewAllBtn.style.fontSize = '16px';
        viewAllBtn.style.fontWeight = '600';
        viewAllBtn.style.cursor = 'pointer';
        viewAllBtn.style.transition = 'background 0.3s ease';
        viewAllBtn.addEventListener('mouseenter', function() {
            this.style.background = '#0369a1';
        });
        viewAllBtn.addEventListener('mouseleave', function() {
            this.style.background = '#0284c7';
        });

        headerSection.style.position = 'relative';
        headerSection.appendChild(badge);
        headerSection.appendChild(title);
        headerSection.appendChild(viewAllBtn);

        // Search and filter section
        const searchFilterSection = document.createElement('div');
        searchFilterSection.style.marginBottom = '40px';

        // Search bar
        const searchContainer = document.createElement('div');
        searchContainer.style.position = 'relative';
        searchContainer.style.marginBottom = '20px';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Zoek op bestemming, land of activiteit...';
        searchInput.className = 'travel-search-input';
        searchInput.style.width = '100%';
        searchInput.style.padding = '16px 50px 16px 20px';
        searchInput.style.border = '2px solid #e5e7eb';
        searchInput.style.borderRadius = '12px';
        searchInput.style.fontSize = '16px';
        searchInput.style.outline = 'none';
        searchInput.style.transition = 'border-color 0.3s ease';
        searchInput.addEventListener('focus', function() {
            this.style.borderColor = '#0284c7';
        });
        searchInput.addEventListener('blur', function() {
            this.style.borderColor = '#e5e7eb';
        });

        const searchIcon = document.createElement('i');
        searchIcon.className = 'fas fa-search';
        searchIcon.style.position = 'absolute';
        searchIcon.style.right = '20px';
        searchIcon.style.top = '50%';
        searchIcon.style.transform = 'translateY(-50%)';
        searchIcon.style.color = '#9ca3af';
        searchIcon.style.fontSize = '18px';

        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchIcon);

        // Filter section
        const filterSection = document.createElement('div');
        filterSection.className = 'travel-filters';
        filterSection.style.display = options.showFilters === false ? 'none' : 'flex';
        filterSection.style.gap = '12px';
        filterSection.style.flexWrap = 'wrap';

        const filters = options.filters || ['Alle', 'Strandvakanties', 'Rondreis', 'Stedentrip', 'Actief', 'Cultuur'];
        filters.forEach((filter, index) => {
            const filterBtn = document.createElement('button');
            filterBtn.textContent = filter;
            filterBtn.className = 'travel-filter-btn';
            filterBtn.dataset.filter = filter.toLowerCase();
            filterBtn.style.background = index === 0 ? '#0284c7' : '#f3f4f6';
            filterBtn.style.color = index === 0 ? '#fff' : '#6b7280';
            filterBtn.style.border = 'none';
            filterBtn.style.padding = '10px 20px';
            filterBtn.style.borderRadius = '20px';
            filterBtn.style.fontSize = '14px';
            filterBtn.style.fontWeight = '600';
            filterBtn.style.cursor = 'pointer';
            filterBtn.style.transition = 'all 0.3s ease';
            
            filterBtn.addEventListener('click', function() {
                // Update active state
                filterSection.querySelectorAll('.travel-filter-btn').forEach(btn => {
                    btn.style.background = '#f3f4f6';
                    btn.style.color = '#6b7280';
                });
                this.style.background = '#0284c7';
                this.style.color = '#fff';
                
                // Filter travels
                const filterValue = this.dataset.filter;
                const travels = grid.querySelectorAll('.travel-card');
                travels.forEach(travel => {
                    const tags = travel.dataset.tags || '';
                    if (filterValue === 'alle' || tags.includes(filterValue)) {
                        travel.style.display = 'block';
                    } else {
                        travel.style.display = 'none';
                    }
                });
            });
            
            filterSection.appendChild(filterBtn);
        });

        searchFilterSection.appendChild(searchContainer);
        searchFilterSection.appendChild(filterSection);

        // Search functionality
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const travels = grid.querySelectorAll('.travel-card');
            travels.forEach(travel => {
                const title = travel.querySelector('.travel-card-title')?.textContent.toLowerCase() || '';
                const location = travel.querySelector('.travel-card-location')?.textContent.toLowerCase() || '';
                const description = travel.querySelector('.travel-card-description')?.textContent.toLowerCase() || '';
                
                if (title.includes(searchTerm) || location.includes(searchTerm) || description.includes(searchTerm)) {
                    travel.style.display = 'block';
                } else {
                    travel.style.display = 'none';
                }
            });
        });

        // Travel grid
        const grid = document.createElement('div');
        grid.className = 'travel-grid';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
        grid.style.gap = '30px';

        // Loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.style.gridColumn = '1 / -1';
        loadingDiv.style.textAlign = 'center';
        loadingDiv.style.padding = '40px';
        loadingDiv.style.color = '#6b7280';
        loadingDiv.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="font-size: 32px; color: #0284c7;"></i><br><br>Reizen laden...';
        grid.appendChild(loadingDiv);

        // Load travels from TravelDataService
        const maxTravels = options.maxTravels || 999;
        const loadTravels = async () => {
            try {
                // Check if TravelDataService is available
                if (!window.TravelDataService) {
                    console.warn('[TravelOverview] TravelDataService not loaded, using sample data');
                    throw new Error('TravelDataService not available');
                }

                // Fetch travels
                const travels = await window.TravelDataService.getTravels({
                    status: 'published',
                    limit: maxTravels
                });

                console.log('[TravelOverview] Loaded travels:', travels.length);

                // Clear loading indicator
                loadingDiv.remove();

                // If no travels found, show message
                if (travels.length === 0) {
                    const noTravelsDiv = document.createElement('div');
                    noTravelsDiv.style.gridColumn = '1 / -1';
                    noTravelsDiv.style.textAlign = 'center';
                    noTravelsDiv.style.padding = '40px';
                    noTravelsDiv.style.color = '#6b7280';
                    noTravelsDiv.innerHTML = '<i class="fas fa-info-circle" style="font-size: 32px; color: #0284c7;"></i><br><br>Nog geen reizen beschikbaar. Voeg reizen toe via het Travel menu.';
                    grid.appendChild(noTravelsDiv);
                    return;
                }

                // Render travel cards
                travels.forEach(travel => {
                    const card = this.createTravelCard(travel);
                    grid.appendChild(card);
                });

            } catch (error) {
                console.error('[TravelOverview] Error loading travels:', error);
                loadingDiv.remove();
                
                // Show error message
                const errorDiv = document.createElement('div');
                errorDiv.style.gridColumn = '1 / -1';
                errorDiv.style.textAlign = 'center';
                errorDiv.style.padding = '40px';
                errorDiv.style.color = '#ef4444';
                errorDiv.innerHTML = '<i class="fas fa-exclamation-circle" style="font-size: 32px;"></i><br><br>Fout bij laden van reizen. Probeer het later opnieuw.';
                grid.appendChild(errorDiv);
            }
        };

        // Load travels async
        loadTravels();

        // Check URL parameters and apply filters automatically
        const applyUrlFilters = () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const location = urlParams.get('location');
                const type = urlParams.get('type');
                const duration = urlParams.get('duration');
                const price = urlParams.get('price');

                console.log('[TravelOverview] URL params:', { location, type, duration, price });

                // Apply location search
                if (location && searchInput) {
                    searchInput.value = location;
                    // Trigger search after a short delay to ensure travels are loaded
                    setTimeout(() => {
                        searchInput.dispatchEvent(new Event('input'));
                    }, 500);
                }

                // Apply type filter
                if (type) {
                    setTimeout(() => {
                        const filterBtns = filterSection.querySelectorAll('.travel-filter-btn');
                        filterBtns.forEach(btn => {
                            const btnText = btn.textContent.toLowerCase();
                            const typeText = type.toLowerCase();
                            if (btnText.includes(typeText) || typeText.includes(btnText)) {
                                btn.click();
                            }
                        });
                    }, 600);
                }

                // Scroll to component if coming from another page
                if (location || type || duration || price) {
                    setTimeout(() => {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 700);
                }
            } catch (error) {
                console.error('[TravelOverview] Error applying URL filters:', error);
            }
        };

        // Apply URL filters after component is mounted
        setTimeout(applyUrlFilters, 100);

        container.appendChild(headerSection);
        container.appendChild(searchFilterSection);
        container.appendChild(grid);
        section.appendChild(container);

        this.makeSelectable(section);
        this.makeEditable(badge);
        this.makeEditable(title);

        return section;
    }

    // Helper method to create a single travel card
    static createTravelCard(travel) {
        const card = document.createElement('div');
        card.className = 'travel-card';
        card.dataset.tags = travel.tags || '';
        card.dataset.travelId = travel.id || '';
        card.style.background = '#fff';
        card.style.borderRadius = '12px';
        card.style.overflow = 'hidden';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        card.style.cursor = 'pointer';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';

        // Featured badge (if travel is featured)
        if (travel.featured) {
            const featuredBadge = document.createElement('div');
            featuredBadge.innerHTML = '<i class="fas fa-star"></i> Uitgelicht';
            featuredBadge.style.position = 'absolute';
            featuredBadge.style.top = '16px';
            featuredBadge.style.left = '16px';
            featuredBadge.style.background = '#fbbf24';
            featuredBadge.style.color = '#78350f';
            featuredBadge.style.padding = '6px 12px';
            featuredBadge.style.borderRadius = '6px';
            featuredBadge.style.fontSize = '11px';
            featuredBadge.style.fontWeight = '700';
            featuredBadge.style.zIndex = '10';
            featuredBadge.style.display = 'flex';
            featuredBadge.style.alignItems = 'center';
            featuredBadge.style.gap = '4px';
        }

        // Image container
        const imageContainer = document.createElement('div');
        imageContainer.style.position = 'relative';
        imageContainer.style.height = '220px';
        imageContainer.style.overflow = 'hidden';

        const img = document.createElement('img');
        img.src = travel.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600';
        img.alt = travel.title;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.transition = 'transform 0.3s ease';

        // Duration badge
        const durationBadge = document.createElement('div');
        durationBadge.textContent = travel.duration;
        durationBadge.style.position = 'absolute';
        durationBadge.style.top = '16px';
        durationBadge.style.right = '16px';
        durationBadge.style.background = '#0284c7';
        durationBadge.style.color = '#fff';
        durationBadge.style.padding = '8px 12px';
        durationBadge.style.borderRadius = '8px';
        durationBadge.style.fontSize = '12px';
        durationBadge.style.fontWeight = '700';
        durationBadge.style.textAlign = 'center';
        durationBadge.style.lineHeight = '1.2';

        // Location badge
        const locationBadge = document.createElement('div');
        locationBadge.textContent = travel.location;
        locationBadge.className = 'travel-card-location';
        locationBadge.style.position = 'absolute';
        locationBadge.style.bottom = '16px';
        locationBadge.style.left = '16px';
        locationBadge.style.background = 'rgba(255, 255, 255, 0.95)';
        locationBadge.style.color = '#1f2937';
        locationBadge.style.padding = '6px 12px';
        locationBadge.style.borderRadius = '6px';
        locationBadge.style.fontSize = '13px';
        locationBadge.style.fontWeight = '600';
        locationBadge.style.display = 'flex';
        locationBadge.style.alignItems = 'center';
        locationBadge.style.gap = '6px';
        locationBadge.innerHTML = `<i class="fas fa-map-marker-alt" style="color:#0284c7;"></i>${travel.location}`;

        imageContainer.appendChild(img);
        if (travel.featured) {
            const featuredBadge = document.createElement('div');
            featuredBadge.innerHTML = '<i class="fas fa-star"></i> Uitgelicht';
            featuredBadge.style.position = 'absolute';
            featuredBadge.style.top = '16px';
            featuredBadge.style.left = '16px';
            featuredBadge.style.background = '#fbbf24';
            featuredBadge.style.color = '#78350f';
            featuredBadge.style.padding = '6px 12px';
            featuredBadge.style.borderRadius = '6px';
            featuredBadge.style.fontSize = '11px';
            featuredBadge.style.fontWeight = '700';
            featuredBadge.style.zIndex = '10';
            featuredBadge.style.display = 'flex';
            featuredBadge.style.alignItems = 'center';
            featuredBadge.style.gap = '4px';
            imageContainer.appendChild(featuredBadge);
        }
        imageContainer.appendChild(durationBadge);
        imageContainer.appendChild(locationBadge);

        // Content
        const content = document.createElement('div');
        content.style.padding = '20px';
        content.style.flex = '1';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';

        const cardTitle = document.createElement('h3');
        cardTitle.textContent = travel.title;
        cardTitle.className = 'travel-card-title';
        cardTitle.style.fontSize = '20px';
        cardTitle.style.fontWeight = '700';
        cardTitle.style.color = '#1f2937';
        cardTitle.style.marginBottom = '12px';
        cardTitle.style.lineHeight = '1.3';

        const description = document.createElement('p');
        description.textContent = travel.description;
        description.className = 'travel-card-description';
        description.style.fontSize = '14px';
        description.style.color = '#6b7280';
        description.style.lineHeight = '1.6';
        description.style.marginBottom = '16px';
        description.style.flex = '1';

        // Price and booking section
        const priceBookSection = document.createElement('div');
        priceBookSection.style.display = 'flex';
        priceBookSection.style.justifyContent = 'space-between';
        priceBookSection.style.alignItems = 'center';
        priceBookSection.style.paddingTop = '16px';
        priceBookSection.style.borderTop = '1px solid #e5e7eb';

        const priceContainer = document.createElement('div');
        const priceLabel = document.createElement('div');
        priceLabel.textContent = 'Vanaf';
        priceLabel.style.fontSize = '12px';
        priceLabel.style.color = '#6b7280';
        priceLabel.style.marginBottom = '4px';

        const price = document.createElement('div');
        price.textContent = travel.price;
        price.style.fontSize = '24px';
        price.style.fontWeight = '700';
        price.style.color = '#0284c7';

        priceContainer.appendChild(priceLabel);
        priceContainer.appendChild(price);

        const bookBtn = document.createElement('button');
        bookBtn.textContent = 'Boek nu';
        bookBtn.style.background = '#0284c7';
        bookBtn.style.color = '#fff';
        bookBtn.style.border = 'none';
        bookBtn.style.padding = '10px 20px';
        bookBtn.style.borderRadius = '8px';
        bookBtn.style.fontSize = '14px';
        bookBtn.style.fontWeight = '600';
        bookBtn.style.cursor = 'pointer';
        bookBtn.style.transition = 'background 0.3s ease';
        bookBtn.addEventListener('mouseenter', function() {
            this.style.background = '#0369a1';
        });
        bookBtn.addEventListener('mouseleave', function() {
            this.style.background = '#0284c7';
        });

        priceBookSection.appendChild(priceContainer);
        priceBookSection.appendChild(bookBtn);

        content.appendChild(cardTitle);
        content.appendChild(description);
        content.appendChild(priceBookSection);

        card.appendChild(imageContainer);
        card.appendChild(content);

        // Hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            img.style.transform = 'scale(1.05)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            img.style.transform = 'scale(1)';
        });

        // Click handler - navigate to travel detail page
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking the book button
            if (e.target === bookBtn || bookBtn.contains(e.target)) {
                e.stopPropagation();
                console.log('[TravelCard] Book clicked for:', travel.title);
                // TODO: Open booking form or redirect to booking page
                alert(`Boeken: ${travel.title}\n\nDeze functie wordt binnenkort toegevoegd!`);
                return;
            }
            
            // Navigate to detail page
            const targetId = travel.id || travel.slug;
            if (!targetId) {
                alert('Deze reis heeft geen geldige ID/slug om te openen.');
                return;
            }
            const url = `/trip/${encodeURIComponent(String(targetId))}`;
            console.log('[TravelCard] Card clicked, navigating to:', url);
            window.location.href = url;
        });

        return card;
    }

    // CONTENT: Flexible content block with optional side images
    static createContentFlex(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-content-flex';
        section.setAttribute('data-component', 'content-flex');
        section.id = this.generateId('content_flex');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Defaults
        const titleTxt = options.title || 'Titel van de sectie';
        const subTxt = options.subtitle || 'Korte subtitel of inleiding';
        const bodyTxt = options.body || 'Dit is een standaard content blok. Voeg hier je tekst toe.';
        const layout = options.layout || 'none'; // none|left|right|both
        const edge = !!options.edgeToEdge; // blocked by default
        const imgHeight = Number(options.imageHeight || 260) || 260;
        const radius = Number(options.radius || 14) || 14;
        const shadow = options.shadow !== false; // true by default

        // Structure
        const wrap = document.createElement('div');
        wrap.className = 'cf-wrap';

        const header = document.createElement('div');
        header.className = 'cf-header';
        const h1 = document.createElement('h2'); h1.className='cf-title'; h1.textContent = titleTxt; h1.contentEditable = true;
        const h2 = document.createElement('p'); h2.className='cf-subtitle'; h2.textContent = subTxt; h2.contentEditable = true;
        header.appendChild(h1); header.appendChild(h2);
        
        // Function to hide header if both title and subtitle are empty
        const updateHeaderVisibility = () => {
            const titleEmpty = !h1.textContent.trim();
            const subtitleEmpty = !h2.textContent.trim();
            if (titleEmpty && subtitleEmpty) {
                header.style.display = 'none';
            } else {
                header.style.display = '';
            }
        };
        
        // Check on input
        h1.addEventListener('input', updateHeaderVisibility);
        h2.addEventListener('input', updateHeaderVisibility);
        
        // Initial check
        updateHeaderVisibility();

        const content = document.createElement('div');
        content.className = 'cf-content';

        const left = document.createElement('div'); left.className='cf-media left';
        const leftImg = document.createElement('img'); leftImg.alt=''; left.appendChild(leftImg);
        const right = document.createElement('div'); right.className='cf-media right';
        const rightImg = document.createElement('img'); rightImg.alt=''; right.appendChild(rightImg);

        const text = document.createElement('div');
        text.className = 'cf-text';
        const p = document.createElement('div'); p.className='cf-body'; p.contentEditable = true; p.innerHTML = bodyTxt;
        text.appendChild(p);

        content.appendChild(left);
        content.appendChild(text);
        content.appendChild(right);

        wrap.appendChild(header);
        wrap.appendChild(content);
        section.appendChild(wrap);

        // Apply runtime settings
        section._layout = layout;
        section._imgHeight = imgHeight;
        section._radius = radius;
        section._shadow = shadow;
        if (edge) section.classList.add('edge-to-edge');

        const applyLayout = () => {
            section.classList.toggle('layout-none', section._layout==='none');
            section.classList.toggle('layout-left', section._layout==='left');
            section.classList.toggle('layout-right', section._layout==='right');
            section.classList.toggle('layout-both', section._layout==='both');
        };
        const applyStyles = () => {
            section.style.setProperty('--cf-img-height', section._imgHeight+'px');
            section.style.setProperty('--cf-radius', section._radius+'px');
            section.classList.toggle('cf-shadow', !!section._shadow);
        };

        applyLayout();
        applyStyles();

        // Media pickers
        left.addEventListener('click', async (e)=>{
            e.stopPropagation();
            if (!leftImg) return;
            try { if (!window.MediaPicker) return; const r = await window.MediaPicker.openImage(); const u = r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if (u){ __WB_applyResponsiveSrc(leftImg, u); } } catch (e) {}
        });
        right.addEventListener('click', async (e)=>{
            e.stopPropagation();
            if (!rightImg) return;
            try { if (!window.MediaPicker) return; const r = await window.MediaPicker.openImage(); const u = r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if (u){ __WB_applyResponsiveSrc(rightImg, u); } } catch (e) {}
        });

        // Interactions
        this.makeSelectable(section);

        // API for properties
        section.__contentFlexApi = {
            setTitle: (t)=>{ h1.textContent = t || ''; },
            setSubtitle: (t)=>{ h2.textContent = t || ''; },
            setBodyHtml: (html)=>{ p.innerHTML = html || ''; },
            setLayout: (mode)=>{ section._layout = ['none','left','right','both'].includes(mode)?mode:'none'; applyLayout(); },
            setEdgeToEdge: (on)=>{ section.classList.toggle('edge-to-edge', !!on); },
            setImageHeight: (px)=>{ section._imgHeight = Math.max(120, parseInt(px,10)||260); applyStyles(); },
            setRadius: (px)=>{ section._radius = Math.max(0, parseInt(px,10)||0); applyStyles(); },
            setShadow: (on)=>{ section._shadow = !!on; applyStyles(); },
            pickLeft: async ()=>{ try{ if(!window.MediaPicker) return; const r=await window.MediaPicker.openImage(); const u=r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if(u) __WB_applyResponsiveSrc(leftImg, u); }catch (e) {} },
            pickRight: async ()=>{ try{ if(!window.MediaPicker) return; const r=await window.MediaPicker.openImage(); const u=r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if(u) __WB_applyResponsiveSrc(rightImg, u); }catch (e) {} },
        };

        return section;
    }

    // FORMS: Jotform Embed (inline iframe or popup later)
    static createJotformEmbed(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-jotform';
        section.setAttribute('data-component', 'jotform-embed');
        section.id = this.generateId('jotform');

        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Defaults
        section._formId = String(options.formId || '233194240465353');
        section._height = parseInt(options.height, 10) || 1200;
        section._borderRadius = parseInt(options.radius, 10) || 12;
        section._shadow = options.shadow !== false; // true by default

        // Wrapper
        const wrap = document.createElement('div');
        wrap.style.maxWidth = '1100px';
        wrap.style.margin = '0 auto';
        wrap.style.background = '#ffffff';
        wrap.style.border = '1px solid #e5e7eb';
        wrap.style.borderRadius = section._borderRadius + 'px';
        wrap.style.overflow = 'hidden';
        wrap.style.boxShadow = section._shadow ? '0 6px 20px rgba(0,0,0,0.06)' : 'none';

        const iframe = document.createElement('iframe');
        iframe.title = 'Jotform';
        iframe.style.width = '100%';
        iframe.style.height = section._height + 'px';
        iframe.style.border = '0';
        // Use generic domain; Jotform will route as needed
        iframe.src = `https://form.jotform.com/${encodeURIComponent(section._formId)}`;

        wrap.appendChild(iframe);
        section.appendChild(wrap);

        // Interactions
        this.makeSelectable(section);

        // API for properties panel
        section.__jotformApi = {
            setFormId: (id) => {
                const val = String(id || '').trim();
                if (!val) return;
                section._formId = val;
                iframe.src = `https://form.jotform.com/${encodeURIComponent(val)}`;
            },
            setHeight: (px) => {
                const h = Math.max(400, parseInt(px, 10) || section._height);
                section._height = h;
                iframe.style.height = h + 'px';
            },
            setRadius: (px) => {
                const r = Math.max(0, parseInt(px,10) || 0);
                section._borderRadius = r;
                wrap.style.borderRadius = r + 'px';
            },
            setShadow: (on) => {
                section._shadow = !!on;
                wrap.style.boxShadow = on ? '0 6px 20px rgba(0,0,0,0.06)' : 'none';
            }
        };

        return section;
    }

    // MEDIA: Horizontal row of photos with optional carousel
    static createMediaRow(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-media-row';
        section.setAttribute('data-component', 'media-row');
        section.id = this.generateId('media_row');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Defaults
        const urls = options.images || [
            'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1519817914152-22d216bb9170?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1493550495486-2e3c0c6f5083?q=80&w=1200&auto=format&fit=crop'
        ];
        section._gap = options.gap ?? 16;          // px, 0 for no spacing
        section._height = options.height ?? 200;   // px
        section._radius = options.radius ?? 14;    // px
        section._shadow = options.shadow ?? true;  // boolean
        section._carousel = options.carousel ?? true; // boolean
        section._layout = options.layout || 'uniform'; // 'uniform' | 'spotlight'
        section._layoutPattern = options.layoutPattern || 'first'; // for spotlight: 'first' | 'center' | 'last'

        // Per-item meta (label, href) preserved across renders
        const meta = Array.from({ length: urls.length }, () => ({ label: '', href: '' }));

        // Track container
        const track = document.createElement('div');
        track.className = 'mr-track';
        section.appendChild(track);

        // Arrows for carousel
        const left = document.createElement('button');
        left.className = 'mr-arrow left'; left.type = 'button'; left.innerHTML = '<i class="fas fa-chevron-left"></i>';
        const right = document.createElement('button');
        right.className = 'mr-arrow right'; right.type = 'button'; right.innerHTML = '<i class="fas fa-chevron-right"></i>';
        section.appendChild(left); section.appendChild(right);

        // Autoplay timer (edge-to-edge)
        let autoTimer = null;
        const stopAutoplay = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
        const startAutoplay = () => {
            stopAutoplay();
            const isEdge = section.classList.contains('edge-to-edge');
            if (!isEdge || !section._carousel) return;
            const interval = Number(section._autoPlayMs || 3500) || 3500;
            autoTimer = setInterval(() => {
                const amt = scrollAmount()*2 || 0;
                if (!amt) return;
                // if near end, go back to start
                const nearEnd = (track.scrollLeft + track.clientWidth) >= (track.scrollWidth - 4);
                if (nearEnd) {
                    track.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    track.scrollBy({ left: amt, behavior: 'smooth' });
                }
            }, interval);
        };

        const applyStyles = () => {
            track.style.gap = section._gap + 'px';
            track.style.setProperty('--mr-item-height', section._height + 'px');
            track.style.setProperty('--mr-item-radius', section._radius + 'px');
            track.classList.toggle('shadow-on', !!section._shadow);
            section.classList.toggle('carousel-on', !!section._carousel);
            section.classList.toggle('layout-spotlight', section._layout === 'spotlight');
            // Layout behavior
            if (section._carousel) {
                track.style.gridAutoColumns = 'minmax(220px, 1fr)';
                track.style.overflowX = 'auto';
                track.style.scrollSnapType = 'x mandatory';
            } else {
                track.style.gridAutoColumns = '1fr';
                track.style.overflowX = 'hidden';
                track.style.scrollSnapType = 'none';
            }
            // Edge-to-edge: enable autoplay, hide arrows handled by CSS
            if (section.classList.contains('edge-to-edge')) {
                startAutoplay();
            } else {
                stopAutoplay();
            }
        };

        const applyLayout = () => {
            // Reset spans
            Array.from(track.children).forEach(it => { it.style.gridColumn = ''; });
            if (!section._carousel && section._layout === 'spotlight') {
                const items = track.querySelectorAll('.mr-item');
                if (items.length >= 3) {
                    let idx = 0;
                    if (section._layoutPattern === 'center') idx = 1; // second item
                    else if (section._layoutPattern === 'last') idx = 2; // third item
                    const el = items[idx];
                    if (el) el.style.gridColumn = 'span 2';
                }
            }
        };

        const renderItems = (arr) => {
            track.innerHTML = '';
            (arr || []).forEach((src, i) => {
                const item = document.createElement('div');
                item.className = 'mr-item';
                item.setAttribute('draggable', 'true');
                item.dataset.index = String(i);
                const img = document.createElement('img');
                img.alt = 'Media row image';
                img.decoding = 'async'; img.loading = 'lazy';
                __WB_applyResponsiveSrc(img, src);
                item.appendChild(img);
                // Optional meta placeholders
                const m = meta[i] || { label: '', href: '' };
                item._label = m.label || '';
                item._href = m.href || '';
                // Overlay with label (visual only in editor)
                const overlay = document.createElement('div');
                overlay.className = 'mr-info';
                overlay.innerHTML = `<span class="mr-label">${(m.label||'').replace(/</g,'&lt;')}</span>`;
                item.appendChild(overlay);
                // Replace button (explicit trigger avoids drag conflicts)
                const rep = document.createElement('button');
                rep.type = 'button';
                rep.className = 'mr-replace';
                rep.innerHTML = '<i class="fas fa-photo-film"></i>';
                rep.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        if (!window.MediaPicker || typeof window.MediaPicker.openImage !== 'function') return;
                        const res = await window.MediaPicker.openImage();
                        const newSrc = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                        if (!newSrc) return;
                        const list = Array.from(track.querySelectorAll('img')).map(n=>n.currentSrc || n.src);
                        list[i] = newSrc;
                        renderItems(list);
                    } catch(err) { console.warn('Media select canceled/failed', err); }
                });
                item.appendChild(rep);
                // Click to replace via MediaPicker
                item.style.cursor = 'pointer';
                item.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        if (!window.MediaPicker || typeof window.MediaPicker.openImage !== 'function') return;
                        const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                        const newSrc = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                        if (!newSrc) return;
                        const list = Array.from(track.querySelectorAll('img')).map(n=>n.src);
                        list[i] = newSrc;
                        renderItems(list);
                    } catch(err) { console.warn('Media select canceled/failed', err); }
                });
                track.appendChild(item);
            });
            attachDnD();
            applyLayout();
        };

        renderItems(urls);
        applyStyles();

        // Carousel behavior
        const scrollAmount = () => {
            const first = track.querySelector('.mr-item');
            if (!first) return 0;
            const gap = section._gap || 0;
            return first.clientWidth + gap;
        };
        left.addEventListener('click', (e)=>{ e.stopPropagation(); stopAutoplay(); track.scrollBy({left: -scrollAmount()*2, behavior:'smooth'}); });
        right.addEventListener('click', (e)=>{ e.stopPropagation(); stopAutoplay(); track.scrollBy({left: scrollAmount()*2, behavior:'smooth'}); });

        // Selection
        this.makeSelectable(section);

        // API for properties panel
        section.__mediaRowApi = {
            setImages: (arr) => { renderItems(arr || []); },
            addImages: (arr) => {
                const current = Array.from(track.querySelectorAll('img')).map(i=>i.src);
                const next = current.concat(arr||[]);
                while (meta.length < next.length) meta.push({ label: '', href: '' });
                renderItems(next);
            },
            reorder: (fromIdx, toIdx) => {
                const imgs = Array.from(track.querySelectorAll('img')).map(i=>i.src);
                const from = Math.max(0, Math.min(fromIdx, imgs.length-1));
                const to = Math.max(0, Math.min(toIdx, imgs.length-1));
                if (from === to) return;
                const movedImg = imgs.splice(from, 1)[0];
                const movedMeta = meta.splice(from, 1)[0] || { label: '', href: '' };
                imgs.splice(to, 0, movedImg);
                meta.splice(to, 0, movedMeta);
                renderItems(imgs);
            },
            setGap: (px) => { section._gap = Math.max(0, parseInt(px,10)||0); applyStyles(); },
            setHeight: (px) => { section._height = Math.max(80, parseInt(px,10)||200); applyStyles(); },
            setRadius: (px) => { section._radius = Math.max(0, parseInt(px,10)||0); applyStyles(); },
            setShadow: (on) => { section._shadow = !!on; applyStyles(); },
            setCarousel: (on) => { section._carousel = !!on; applyStyles(); },
            setLayout: (mode) => { section._layout = (mode === 'spotlight') ? 'spotlight' : 'uniform'; applyStyles(); applyLayout(); },
            setLayoutPattern: (pat) => { section._layoutPattern = (pat==='center'||pat==='last')?pat:'first'; applyLayout(); },
            setItemMeta: (index, {label, href}={}) => {
                meta[index] = { label: label || '', href: href || '' };
                const it = track.children[index];
                if (it) {
                    it._label = meta[index].label;
                    it._href = meta[index].href;
                    const ol = it.querySelector('.mr-info .mr-label');
                    if (ol) ol.textContent = meta[index].label || '';
                }
            },
            getImages: () => Array.from(track.querySelectorAll('img')).map(i=>i.src)
        };

        function attachDnD() {
            let dragIndex = -1;
            track.querySelectorAll('.mr-item').forEach((el, idx) => {
                el.addEventListener('dragstart', (e) => {
                    dragIndex = idx;
                    el.classList.add('dragging');
                    e.dataTransfer?.setData('text/plain', String(idx));
                });
                el.addEventListener('dragend', () => {
                    el.classList.remove('dragging');
                    dragIndex = -1;
                });
                el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drop-target'); });
                el.addEventListener('dragleave', () => { el.classList.remove('drop-target'); });
                el.addEventListener('drop', (e) => {
                    e.preventDefault();
                    el.classList.remove('drop-target');
                    const toIdx = Array.from(track.children).indexOf(el);
                    if (dragIndex < 0 || toIdx < 0 || toIdx === dragIndex) return;
                    const imgs = Array.from(track.querySelectorAll('img')).map(i=>i.src);
                    const moved = imgs.splice(dragIndex, 1)[0];
                    imgs.splice(toIdx, 0, moved);
                    renderItems(imgs);
                });
            });
        }

        return section;
    }

    // Simple Hero for internal pages with big word overlay
    static createHeroPage(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-hero-page edge-to-edge';
        section.setAttribute('data-component', 'hero-page');
        section.id = this.generateId('hero_page');

        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        const bgUrl = options.background || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop';
        const height = options.height || '600px';
        const overlayOpacity = options.overlayOpacity ?? 0.45;
        const wordText = options.wordText ?? 'NIEUWS';
        const wordColor = options.wordColor || '#ffffff';
        const wordSize = options.wordSize || '200px';
        const wordOpacity = options.wordOpacity ?? 1;
        const wordLeft = options.wordLeft || '5%';
        const wordBottom = options.wordBottom || '-6px';

        // Background
        const bg = document.createElement('div');
        bg.className = 'hp-bg';
        const img = document.createElement('img');
        __WB_applyResponsiveSrc(img, bgUrl);
        img.alt = 'Hero background';
        img.decoding = 'async';
        img.loading = 'eager';
        bg.appendChild(img);

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'hp-overlay';
        overlay.style.setProperty('--overlay-opacity', overlayOpacity);

        // Word layer (optional)
        const word = document.createElement('div');
        word.className = 'hp-word';
        word.textContent = wordText;
        word.contentEditable = true;
        word.style.color = wordColor;
        word.style.fontSize = wordSize;
        word.style.opacity = String(wordOpacity);
        word.style.left = wordLeft;
        word.style.bottom = wordBottom;

        section.style.minHeight = height;

        section.appendChild(bg);
        section.appendChild(overlay);
        section.appendChild(word);

        this.makeSelectable(section);
        this.makeEditable(word);

        // --- Media chooser: behave like other media components ---
        const mediaBtn = document.createElement('button');
        mediaBtn.type = 'button';
        mediaBtn.className = 'hero-media-chooser';
        mediaBtn.title = 'Achtergrond wijzigen (afbeelding)';
        mediaBtn.innerHTML = '<i class="fas fa-photo-video"></i>';
        section.appendChild(mediaBtn);

        const openImagePicker = async () => {
            try {
                let src = '';
                if (window.MediaPicker && typeof window.MediaPicker.openImage === 'function') {
                    const result = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    src = (result && (
                        result.fullUrl || result.regularUrl || result.url || result.dataUrl ||
                        result.src || result.imageUrl || result.downloadUrl || ''
                    )) || '';
                    try { console.debug('[hero-page] media chosen src', src, result); } catch (e) {}
                }
                if (!src) return;
                if (typeof window.__WB_applyResponsiveSrc === 'function') {
                    window.__WB_applyResponsiveSrc(img, src);
                } else if (typeof __WB_applyResponsiveSrc === 'function') {
                    __WB_applyResponsiveSrc(img, src);
                } else {
                    img.src = src;
                }
            } catch (e) { console.warn('Hero image select canceled/failed', e); }
        };

        mediaBtn.addEventListener('click', (e) => { e.stopPropagation(); openImagePicker(); });
        // Also allow clicking background to change when selected
        bg.addEventListener('click', (e) => { e.stopPropagation(); openImagePicker(); });

        return section;
    }

    // HERO: Full-bleed banner with gradient overlay + CTA buttons
    static createHeroBannerCta(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-hero-banner edge-to-edge';
        section.setAttribute('data-component', 'hero-banner-cta');
        section.id = this.generateId('hero_banner');
        // Default crossfade transition variables
        section.style.setProperty('--hero-xfade-duration', '.35s');
        section.style.setProperty('--hero-xfade-easing', 'ease');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Defaults
        const bgUrl = options.background || 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1600&auto=format&fit=crop';
        const title = options.title || 'Build your next great website';
        const subtitle = options.subtitle || 'Beautiful, responsive and fast. Designed for modern teams.';
        const overlayOpacity = options.overlayOpacity ?? 0.45;
        const primaryText = options.primaryText || 'Get Started';
        const primaryHref = options.primaryHref || '#';
        const secondaryText = options.secondaryText || 'Learn More';
        const secondaryHref = options.secondaryHref || '#';
        const height = options.height || '560px';

        // Background (image mode by default)
        const bg = document.createElement('div');
        bg.className = 'hero-bg';
        const imgA = document.createElement('img');
        const imgB = document.createElement('img');
        // Ensure images receive the current transition variables and hint for smoother fades
        try {
            const cs = getComputedStyle(section);
            const dur = cs.getPropertyValue('--hero-xfade-duration').trim() || '.35s';
            const easing = cs.getPropertyValue('--hero-xfade-easing').trim() || 'ease';
            imgA.style.setProperty('--hero-xfade-duration', dur);
            imgA.style.setProperty('--hero-xfade-easing', easing);
            imgB.style.setProperty('--hero-xfade-duration', dur);
            imgB.style.setProperty('--hero-xfade-easing', easing);
        } catch (e) {}
        imgA.style.willChange = 'opacity';
        imgB.style.willChange = 'opacity';
        __WB_applyResponsiveSrc(imgA, bgUrl);
        imgA.alt = 'Hero background';
        imgA.decoding = 'async';
        imgA.loading = 'eager';
        imgA.setAttribute('fetchpriority', 'high');
        imgB.alt = 'Hero background';
        imgB.decoding = 'async';
        imgB.loading = 'eager';
        imgA.style.opacity = '1';
        imgB.style.opacity = '0';
        bg.appendChild(imgA);
        bg.appendChild(imgB);
        // Track active layer and transition type
        section._activeImg = 'A';
        section._imgA = imgA;
        section._imgB = imgB;
        section._transitionType = section._transitionType || 'fade'; // 'fade' | 'slide'

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'hero-overlay';
        overlay.style.setProperty('--overlay-opacity', overlayOpacity);

        // Content
        const content = document.createElement('div');
        content.className = 'hero-content';

        const h1 = document.createElement('h1');
        h1.className = 'hero-title';
        h1.textContent = title;
        h1.contentEditable = true;

        const p = document.createElement('p');
        p.className = 'hero-subtitle';
        p.textContent = subtitle;
        p.contentEditable = true;

        const ctas = document.createElement('div');
        ctas.className = 'hero-cta';
        ctas.innerHTML = `
            <a class="btn btn-primary" href="${primaryHref}" target="_self"><span contenteditable="true">${primaryText}</span></a>
            <a class="btn outline" href="${secondaryHref}" target="_self"><span contenteditable="true">${secondaryText}</span></a>
        `;

        section.style.minHeight = height;

        // Widget mount point (hidden until used)
        const widgetWrap = document.createElement('div');
        widgetWrap.className = 'hero-widget-wrap';
        widgetWrap.style.display = 'none';
        widgetWrap.style.width = '100%';
        widgetWrap.style.maxWidth = '1100px';
        widgetWrap.style.margin = '0 auto';
        widgetWrap.style.borderRadius = '10px';
        widgetWrap.style.overflow = 'hidden';

        content.appendChild(h1);
        content.appendChild(p);
        content.appendChild(widgetWrap);
        content.appendChild(ctas);

        section.appendChild(bg);
        section.appendChild(overlay);
        section.appendChild(content);

        // Interactions
        this.makeSelectable(section);
        this.makeEditable(h1);
        this.makeEditable(p);

        // --- Media chooser button (top-right) ---
        const mediaBtn = document.createElement('button');
        mediaBtn.type = 'button';
        mediaBtn.className = 'hero-media-chooser';
        mediaBtn.title = 'Achtergrond wijzigen (afbeelding, slideshow of YouTube)';
        mediaBtn.innerHTML = '<i class="fas fa-photo-video"></i>';
        section.appendChild(mediaBtn);

        // Helper: clear any video layer
        const removeVideoLayer = () => {
            const video = section.querySelector('.hero-video');
            if (video) video.remove();
        };

        // Helper: stop slideshow if running
        const stopSlideshow = () => {
            if (section._slideshowTimer) {
                clearInterval(section._slideshowTimer);
                section._slideshowTimer = null;
            }
            section._slides = null;
            section._slideIndex = 0;
        };

        // Apply single image background
        const setImageBg = (url) => {
            removeVideoLayer();
            stopSlideshow();
            const current = section._activeImg === 'A' ? section._imgA : section._imgB;
            const next = section._activeImg === 'A' ? section._imgB : section._imgA;
            // prepare next based on transition
            if (section._transitionType === 'slide') {
                next.style.transform = 'translateX(10%)';
            }
            next.style.opacity = '0';
            next.onload = () => {
                // Fade in next, fade out current
                requestAnimationFrame(() => {
                    if (section._transitionType === 'slide') {
                        next.style.transform = 'translateX(0)';
                        current.style.transform = 'translateX(-6%)';
                    }
                    next.style.opacity = '1';
                    current.style.opacity = '0';
                });
                section._activeImg = section._activeImg === 'A' ? 'B' : 'A';
            };
            __WB_applyResponsiveSrc(next, url);
        };

        // Apply slideshow from array of urls
        const setSlideshow = (urls, intervalMs = 3500) => {
            removeVideoLayer();
            stopSlideshow();
            if (!urls || urls.length === 0) return;
            section._slides = urls.slice();
            section._slideIndex = 0;
            section._slideshowInterval = intervalMs;
            // Initialize on current active layer without fade
            const current = section._activeImg === 'A' ? section._imgA : section._imgB;
            const nextImg = section._activeImg === 'A' ? section._imgB : section._imgA;
            current.style.opacity = '1';
            current.style.transform = 'translateX(0)';
            nextImg.style.opacity = '0';
            nextImg.style.transform = section._transitionType === 'slide' ? 'translateX(10%)' : 'translateX(0)';
            __WB_applyResponsiveSrc(current, section._slides[0]);
            // Skip slideshow animations during edit to avoid jank
            if (document.body && document.body.dataset && document.body.dataset.wbMode === 'edit') {
                return;
            }
            section._slideshowTimer = setInterval(() => {
                if (!section._slides || section._slides.length === 0) return;
                section._slideIndex = (section._slideIndex + 1) % section._slides.length;
                const url = section._slides[section._slideIndex];
                const showing = section._activeImg === 'A' ? section._imgA : section._imgB;
                const hidden = section._activeImg === 'A' ? section._imgB : section._imgA;
                // prepare hidden for entry
                if (section._transitionType === 'slide') {
                    hidden.style.transform = 'translateX(10%)';
                }
                hidden.style.opacity = '0';
                hidden.onload = () => {
                    requestAnimationFrame(() => {
                        if (section._transitionType === 'slide') {
                            hidden.style.transform = 'translateX(0)';
                            showing.style.transform = 'translateX(-6%)';
                        }
                        hidden.style.opacity = '1';
                        showing.style.opacity = '0';
                    });
                    section._activeImg = section._activeImg === 'A' ? 'B' : 'A';
                };
                __WB_applyResponsiveSrc(hidden, url);
            }, intervalMs);
        };

        // Apply YouTube video background
        const setYouTubeBg = (embedUrl) => {
            const isEdit = !!(document.body && document.body.dataset && document.body.dataset.wbMode === 'edit');
            stopSlideshow();
            if (isEdit) {
                removeVideoLayer && removeVideoLayer();
                let ph = section.querySelector('.hero-video-ph');
                if (!ph) {
                    ph = document.createElement('div');
                    ph.className = 'hero-video-ph';
                    ph.style.position = 'absolute';
                    ph.style.top = '0';
                    ph.style.left = '0';
                    ph.style.right = '0';
                    ph.style.bottom = '0';
                    ph.style.backgroundSize = 'cover';
                    ph.style.backgroundPosition = 'center';
                    ph.style.cursor = 'pointer';
                    const btn = document.createElement('div');
                    btn.className = 'hero-video-play';
                    btn.style.position = 'absolute';
                    btn.style.top = '50%';
                    btn.style.left = '50%';
                    btn.style.transform = 'translate(-50%, -50%)';
                    btn.style.width = '68px';
                    btn.style.height = '48px';
                    btn.style.borderRadius = '8px';
                    btn.style.background = 'rgba(0,0,0,.45)';
                    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,.25)';
                    btn.style.pointerEvents = 'none';
                    btn.innerHTML = '<svg viewBox="0 0 68 48" style="width:100%;height:100%"><path d="M66.52 7.74a8 8 0 0 0-5.65-5.66C56.5 1 34 1 34 1S11.5 1 7.13 2.08A8 8 0 0 0 1.48 7.74 83.3 83.3 0 0 0 0 24a83.3 83.3 0 0 0 1.48 16.26 8 8 0 0 0 5.65 5.66C11.5 47 34 47 34 47s22.5 0 26.87-1.08a8 8 0 0 0 5.65-5.66A83.3 83.3 0 0 0 68 24a83.3 83.3 0 0 0-1.48-16.26Z" fill="#212121" fill-opacity=".8"/><path d="M45 24 27 14v20" fill="#fff"/></svg>';
                    ph.appendChild(btn);
                    section.insertBefore(ph, overlay);
                }
                try {
                    const url = new URL(embedUrl);
                    const m = url.pathname.match(/\/embed\/([^\/?#]+)/);
                    const vid = m ? m[1] : '';
                    if (vid) ph.style.backgroundImage = `url(https://img.youtube.com/vi/${vid}/hqdefault.jpg)`;
                } catch (e) {}
                ph.onclick = () => {
                    const overlayBg = document.createElement('div');
                    overlayBg.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99998;display:flex;align-items:center;justify-content:center';
                    const box = document.createElement('div');
                    box.style.cssText = 'position:relative;width:min(90vw,960px);aspect-ratio:16/9;background:#000;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.4);overflow:hidden';
                    const close = document.createElement('button');
                    close.textContent = 'Ãƒ””';
                    close.setAttribute('aria-label','Sluiten');
                    close.style.cssText = 'position:absolute;top:8px;right:12px;width:32px;height:32px;border:none;border-radius:6px;background:rgba(0,0,0,.5);color:#fff;font-size:20px;line-height:1;cursor:pointer;z-index:2';
                    const iframe = document.createElement('iframe');
                    iframe.setAttribute('title', 'Video preview');
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
                    const url = new URL(embedUrl);
                    const params = url.searchParams;
                    if (!params.has('autoplay')) params.set('autoplay', '1');
                    const opts = section._ytOptions || { mute: true, start: 0 };
                    if (opts.mute === false) { params.delete('mute'); } else { params.set('mute', '1'); }
                    if (!params.has('controls')) params.set('controls', '1');
                    if (!params.has('loop')) params.set('loop', '0');
                    const vidIdMatch = url.pathname.match(/\/embed\/([^\/?#]+)/);
                    if (vidIdMatch && !params.has('playlist')) params.set('playlist', vidIdMatch[1]);
                    const startSec = Math.max(0, parseInt(opts.start, 10) || 0);
                    if (startSec > 0) params.set('start', String(startSec)); else params.delete('start');
                    url.search = params.toString();
                    iframe.src = url.toString();
                    const cleanup = () => { try { document.body.removeChild(overlayBg); } catch (e) {} };
                    close.onclick = cleanup;
                    overlayBg.onclick = (e) => { if (e.target === overlayBg) cleanup(); };
                    box.appendChild(iframe);
                    box.appendChild(close);
                    overlayBg.appendChild(box);
                    document.body.appendChild(overlayBg);
                };
                return;
            }
            let videoWrap = section.querySelector('.hero-video');
            if (!videoWrap) {
                videoWrap = document.createElement('div');
                videoWrap.className = 'hero-video';
                const iframe = document.createElement('iframe');
                iframe.setAttribute('title', 'Hero Background Video');
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');
                iframe.style.position = 'absolute';
                iframe.style.top = '50%';
                iframe.style.left = '50%';
            const url = new URL(embedUrl);
            const params = url.searchParams;
            if (!params.has('autoplay')) params.set('autoplay', '1');
            const opts = section._ytOptions || { mute: true, start: 0 };
            if (opts.mute === false) { params.delete('mute'); } else { params.set('mute', '1'); }
            if (!params.has('controls')) params.set('controls', '1');
            if (!params.has('loop')) params.set('loop', '0');
            const vidIdMatch = url.pathname.match(/\/embed\/([^\/?#]+)/);
            if (vidIdMatch && !params.has('playlist')) params.set('playlist', vidIdMatch[1]);
            const startSec = Math.max(0, parseInt(opts.start, 10) || 0);
            if (startSec > 0) params.set('start', String(startSec)); else params.delete('start');
            url.search = params.toString();
            iframe.src = url.toString();
            const cleanup = () => { try { document.body.removeChild(overlayBg); } catch (e) {} };
            close.onclick = cleanup;
            overlayBg.onclick = (e) => { if (e.target === overlayBg) cleanup(); };
            box.appendChild(iframe);
            box.appendChild(close);
            overlayBg.appendChild(box);
            document.body.appendChild(overlayBg);
                if (!w || !h) return;
                const containerRatio = w / h;
                const videoRatio = 16 / 9;
                if (containerRatio < videoRatio) {
                    // container is taller -> match height, expand width
                    iframe.style.height = '100%';
                    iframe.style.width = `${Math.ceil(h * videoRatio)}px`;
                } else {
                    // container is wider -> match width, expand height
                    iframe.style.width = '100%';
                    iframe.style.height = `${Math.ceil(w / videoRatio)}px`;
                }
            };
            fitVideo();
            // Avoid multiple listeners
            if (!section._ytResizeHandler) {
                section._ytRafId = null;
                section._ytResizeHandler = () => {
                    if (section._ytRafId) cancelAnimationFrame(section._ytRafId);
                    section._ytRafId = requestAnimationFrame(() => { section._ytRafId = null; fitVideo(); });
                };
                try { window.addEventListener('resize', section._ytResizeHandler, { passive: true }); }
                catch (e) { window.addEventListener('resize', section._ytResizeHandler); }
            }
        };

        // Helper: clear any widget
        const removeWidgetLayer = () => {
            if (widgetWrap.firstChild) widgetWrap.innerHTML = '';
            widgetWrap.style.display = 'none';
            // Restore title/subtitle/ctas visibility
            h1.style.display = '';
            p.style.display = '';
            ctas.style.display = '';
        };

        // Add a widget via iframe inside content
        const setWidget = (url, heightPx = 560) => {
            stopSlideshow();
            removeVideoLayer();
            removeWidgetLayer();
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = '100%';
            iframe.style.height = `${Math.max(320, parseInt(heightPx, 10) || 560)}px`;
            iframe.style.border = '0';
            iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
            iframe.setAttribute('allow', 'clipboard-write; fullscreen');
            widgetWrap.appendChild(iframe);
            // Apply style preferences
            section._widgetStyle = section._widgetStyle || 'card';
            section._widgetMax = section._widgetMax || 1100;
            widgetWrap.classList.remove('card','edge');
            widgetWrap.classList.add(section._widgetStyle);
            widgetWrap.style.setProperty('--wb-widget-max', section._widgetMax + 'px');
            widgetWrap.style.display = 'block';
            // Optionally hide title/subtitle/ctas if widget should dominate
            h1.style.display = 'none';
            p.style.display = 'none';
            ctas.style.display = 'none';
        };

        const updateWidgetStyle = (style = 'card', maxWidthPx = 1100) => {
            section._widgetStyle = style;
            section._widgetMax = maxWidthPx;
            widgetWrap.classList.remove('card','edge');
            widgetWrap.classList.add(style);
            widgetWrap.style.setProperty('--wb-widget-max', maxWidthPx + 'px');
        };

        // Click handler: open image picker (single image). Slideshow/YouTube via Properties panel.
        mediaBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const result = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const src = result && (result.dataUrl || result.url || result.regularUrl || result.fullUrl);
                if (src) setImageBg(src);
            } catch (err) {
                console.warn('Media kiezen geannuleerd/mislukt', err);
            }
        });

        // Expose minimal API for Properties panel
        section.__heroBannerApi = {
            setImage: (url) => setImageBg(url),
            setSlideshow: (urls, ms) => setSlideshow(urls, ms || section._slideshowInterval || 3500),
            setYouTube: (embed) => { section._ytEmbedBase = embed; setYouTubeBg(embed); },
            setWidget: (url, height) => setWidget(url, height),
            clearWidget: () => removeWidgetLayer(),
            updateWidgetStyle: (style, maxPx) => updateWidgetStyle(style, maxPx),
            stopSlideshow: () => stopSlideshow(),
            isSlideshow: () => Array.isArray(section._slides) && section._slides.length > 1,
            updateYouTubeOptions: (updates = {}) => {
                const prev = Object.assign({}, section._ytOptions || { mute: true, start: 0 });
                section._ytOptions = Object.assign({}, prev, updates);
                const onlyStartChanged = ('start' in updates) && Object.keys(updates).every(k => k === 'start' || k === 'apply');
                const explicitApply = updates && updates.apply === true;
                if (onlyStartChanged && !explicitApply) {
                    // Do not reload iframe for start typing; wait for explicit apply or other option changes
                    clearTimeout(section._ytOptTimer);
                    section._ytOptTimer = setTimeout(() => {
                        // If user stops typing for a while, still avoid reload unless apply:true later
                    }, 500);
                    return;
                }
                // Apply strategy: if caller sets apply:true, apply quickly; otherwise debounce.
                clearTimeout(section._ytOptTimer);
                const delay = explicitApply ? 60 : 350;
                section._ytOptTimer = setTimeout(() => {
                    if (section._ytEmbedBase) setYouTubeBg(section._ytEmbedBase);
                }, delay);
            },
            applyYouTube: () => { if (section._ytEmbedBase) setYouTubeBg(section._ytEmbedBase); },
            getYouTubeOptions: () => Object.assign({}, section._ytOptions || { mute: true, start: 0 })
        };

        return section;
    }

    // CONTENT: Feature Highlight (big photo with inset, badge, metric; right side list)
    static createFeatureHighlight(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-feature-highlight';
        section.setAttribute('data-component', 'feature-highlight');
        section.id = this.generateId('feature_highlight');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        const position = options.position === 'right' ? 'right' : 'left';
        if (position === 'right') section.classList.add('right');

        // Defaults
        const mainImg = options.mainImg || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';
        const insetImg = options.insetImg || 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop';
        const badgeIcon = options.badgeIcon || 'fa-map-marker-alt';
        const metricNumber = options.metricNumber || '28';
        const metricLabel = options.metricLabel || 'Years of experience';
        const label = options.label || 'About Company';
        const title = options.title || 'Great opportunity for adventure & travels';
        const items = options.items || [
            { icon: 'fa-shield-alt', title: 'Safety first always', text: 'Set perspiciatis unde omnis estenatus voluptatem totarem aperiae.' },
            { icon: 'fa-hand-holding-usd', title: 'Low price & friendly', text: 'Quis autem vel eum iure voluptate velit esse nihilie consequat.' },
            { icon: 'fa-compass', title: 'Trusted travel guide', text: 'At vero accusamus dignissimos ducimus blanditiis deleniti atque quos.' }
        ];

        // Layout
        const wrap = document.createElement('div');
        wrap.className = 'fh-wrap';

        // Media column
        const media = document.createElement('div');
        media.className = 'fh-media';
        media.innerHTML = `
            <div class="fh-main">
                <img src="${mainImg}" alt="Feature image" />
                <div class="fh-badge"><i class="fas ${badgeIcon}"></i></div>
                <div class="fh-metric">
                    <div class="num" contenteditable="true">${metricNumber}</div>
                    <div class="lbl" contenteditable="true">${metricLabel}</div>
                </div>
            </div>
            <div class="fh-inset"><img src="${insetImg}" alt="Inset image" /></div>
        `;

        // Content column
        const content = document.createElement('div');
        content.className = 'fh-content';
        content.innerHTML = `
            <div class="fh-label" contenteditable="true">${label}</div>
            <h2 class="fh-title" contenteditable="true">${title}</h2>
            <div class="fh-list"></div>
        `;
        const list = content.querySelector('.fh-list');
        items.forEach(it => {
            const row = document.createElement('div');
            row.className = 'fh-item';
            row.innerHTML = `
                <div class="fh-bullet"><span></span></div>
                <div class="fh-ic"><i class="fas ${it.icon}"></i></div>
                <div class="fh-text">
                    <div class="fh-item-title" contenteditable="true">${it.title}</div>
                    <div class="fh-item-sub" contenteditable="true">${it.text}</div>
                </div>
            `;
            list.appendChild(row);
        });

        // Assemble
        if (position === 'left') {
            wrap.appendChild(media);
            wrap.appendChild(content);
        } else {
            wrap.appendChild(content);
            wrap.appendChild(media);
        }
        section.appendChild(wrap);

        // Interactions
        this.makeSelectable(section);

        return section;
    }

    // Feature Icon & Image - witte achtergrond, foto links/rechts, iconen tussen tekst en foto, label boven titel
    static createFeatureIconImage(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-feature-icon-image';
        section.setAttribute('data-component', 'feature-icon-image');
        section.id = this.generateId('feature_icon_image');

        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        const position = options.position === 'right' ? 'right' : 'left';
        const label = options.label || 'Stad van de maand';
        const title = options.title || "C'est la vie a Paris";
        const description = options.description || 'Parijs, de stad van de liefde en licht, schittert als de ultieme bestemming voor een stedentrip.';
        const image = options.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop';
        const items = options.items || [
            { icon: 'fa-ticket-alt', title: 'Activiteiten in Parijs', text: 'Boek gelijk je activiteiten mee en sla de wachtrij over.' },
            { icon: 'fa-hotel', title: 'Hotels in alle prijsklasses', text: 'Van budget hotels tot design en alles wat er tussen zit.' }
        ];
        const ctaIcon = options.ctaIcon || 'fa-train';
        const ctaTitle = options.ctaTitle || 'Met de trein naar Parijs';
        const ctaText = options.ctaText || 'Reis comfortabel en milieuvriendelijk naar Parijs met de trein!';
        const ctaButton = options.ctaButton || 'Stel je eigen stedentrip samen';

        const container = document.createElement('div');
        container.className = 'fii-container';
        container.style.cssText = 'max-width:1200px;margin:0 auto;padding:60px 20px;';

        const grid = document.createElement('div');
        grid.className = 'fii-grid';
        grid.style.cssText = `display:grid;grid-template-columns:${position === 'right' ? '1fr 1fr' : '1fr 1fr'};gap:60px;align-items:start;`;

        // Text column
        const textCol = document.createElement('div');
        textCol.className = 'fii-text';
        
        const labelEl = document.createElement('div');
        labelEl.className = 'fii-label';
        labelEl.contentEditable = 'true';
        labelEl.textContent = label;
        labelEl.style.cssText = 'display:inline-block;background:#fbbf24;color:#78350f;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;margin-bottom:16px;';

        const titleEl = document.createElement('h2');
        titleEl.className = 'fii-title';
        titleEl.contentEditable = 'true';
        titleEl.textContent = title;
        titleEl.style.cssText = 'font-size:36px;font-weight:700;color:#1f2937;margin:0 0 20px 0;line-height:1.2;';

        const descEl = document.createElement('p');
        descEl.className = 'fii-description';
        descEl.contentEditable = 'true';
        descEl.textContent = description;
        descEl.style.cssText = 'font-size:16px;line-height:1.6;color:#6b7280;margin-bottom:32px;';

        const itemsList = document.createElement('div');
        itemsList.className = 'fii-items';
        itemsList.style.cssText = 'display:flex;flex-direction:column;gap:24px;margin-bottom:32px;';

        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'fii-item';
            itemEl.style.cssText = 'display:flex;gap:16px;align-items:flex-start;';
            itemEl.innerHTML = `
                <div class="fii-item-icon" style="flex-shrink:0;width:48px;height:48px;background:#f97316;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="fii-item-content">
                    <h3 class="fii-item-title" contenteditable="true" style="font-size:18px;font-weight:700;color:#1f2937;margin:0 0 8px 0;">${item.title}</h3>
                    <p class="fii-item-text" contenteditable="true" style="font-size:14px;color:#6b7280;margin:0;line-height:1.5;">${item.text}</p>
                </div>
            `;
            itemsList.appendChild(itemEl);
        });

        const buttonEl = document.createElement('button');
        buttonEl.className = 'fii-button';
        buttonEl.contentEditable = 'true';
        buttonEl.textContent = ctaButton;
        buttonEl.style.cssText = 'background:#1e293b;color:white;border:none;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s;';

        textCol.appendChild(labelEl);
        textCol.appendChild(titleEl);
        textCol.appendChild(descEl);
        textCol.appendChild(itemsList);
        textCol.appendChild(buttonEl);

        // Image column with CTA card
        const imageCol = document.createElement('div');
        imageCol.className = 'fii-image-col';
        imageCol.style.cssText = 'position:relative;';

        const imageWrap = document.createElement('div');
        imageWrap.className = 'fii-image-wrap';
        imageWrap.style.cssText = 'border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);';
        
        const img = document.createElement('img');
        img.src = image;
        img.alt = title;
        img.style.cssText = 'width:100%;height:auto;display:block;';
        imageWrap.appendChild(img);

        const ctaCard = document.createElement('div');
        ctaCard.className = 'fii-cta-card';
        ctaCard.style.cssText = 'position:absolute;bottom:20px;left:20px;right:20px;background:#f97316;border-radius:12px;padding:24px;color:white;box-shadow:0 8px 24px rgba(0,0,0,0.2);';
        ctaCard.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;width:64px;height:64px;background:white;border-radius:50%;margin:0 auto 16px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <i class="fas ${ctaIcon}" style="font-size:28px;color:#f97316;"></i>
            </div>
            <h3 contenteditable="true" style="font-size:20px;font-weight:700;margin:0 0 12px 0;text-align:center;">${ctaTitle}</h3>
            <p contenteditable="true" style="font-size:14px;margin:0;text-align:center;opacity:0.95;">${ctaText}</p>
        `;

        imageCol.appendChild(imageWrap);
        imageCol.appendChild(ctaCard);

        // Assemble grid
        if (position === 'left') {
            grid.appendChild(imageCol);
            grid.appendChild(textCol);
        } else {
            grid.appendChild(textCol);
            grid.appendChild(imageCol);
        }

        container.appendChild(grid);
        section.appendChild(container);

        this.makeSelectable(section);
        return section;
    }

    // CONTACT: Label + Title + 3 Icon Cards (address/email/hotline)
    static createContactInfo(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-contact-info';
        section.setAttribute('data-component', 'contact-info');
        section.id = this.generateId('contact_info');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        const labelTxt = options.label || 'Contact us';
        const titleTxt = options.title || 'Ready to Get our best Services!\nFeel free to contact with us';

        const defaults = options.cards || [
            { icon: 'fa-location-dot', title: 'Office Location', lines: ['55 Main Street', '2nd Floor New York'] },
            { icon: 'fa-envelope', title: 'Email Address', lines: ['contact@example.com', 'info@example.com'] },
            { icon: 'fa-phone', title: 'Hotline', lines: ['+1(307) 776Ã¢â‚¬“0608', '666 8888 000'] }
        ];

        // Header
        const header = document.createElement('div');
        header.className = 'ci-header';
        header.innerHTML = `
            <span class="ci-label" contenteditable="true">${labelTxt}</span>
            <h2 class="ci-title" contenteditable="true">${titleTxt}</h2>
        `;

        // Grid
        const grid = document.createElement('div');
        grid.className = 'ci-grid';
        defaults.forEach((c) => {
            const card = document.createElement('div');
            card.className = 'ci-card';
            card.innerHTML = `
                <div class="ci-icon"><i class="fas ${c.icon}"></i></div>
                <h4 class="ci-card-title" contenteditable="true">${c.title}</h4>
                <p class="ci-line" contenteditable="true">${c.lines[0] || ''}</p>
                <p class="ci-line" contenteditable="true">${c.lines[1] || ''}</p>
            `;
            grid.appendChild(card);
        });

        section.appendChild(header);
        section.appendChild(grid);

        // Interactions
        this.makeSelectable(section);
        // inline edits already contentEditable

        return section;
    }

    // CONTACT: Map with overlay CTA banner
    static createContactMapCta(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-contact-mapcta';
        section.setAttribute('data-component', 'contact-map-cta');
        section.id = this.generateId('contact_map_cta');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Default to Google Maps embed (more reliable than OpenStreetMap)
        const mapUrl = options.mapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.5389066474447!2d-0.12775908422871687!3d51.50735097963595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604b900d26973%3A0x4291f3172409ea92!2slondon!5e0!3m2!1sen!2snl!4v1234567890';
        const title = options.title || 'Ready to adventure and enjoy natural';
        const subtitle = options.subtitle || 'Feel free to explore';
        const ctaText = options.ctaText || 'Explore More';
        const ctaHref = options.ctaHref || '#';
        const height = options.height || '420px';

        const mapWrap = document.createElement('div');
        mapWrap.className = 'cmc-map';
        mapWrap.style.height = height;
        mapWrap.style.position = 'relative';
        mapWrap.style.overflow = 'hidden';
        
        // Create iframe with proper map attributes
        const iframe = document.createElement('iframe');
        iframe.src = mapUrl;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('aria-label', 'Map');
        
        mapWrap.appendChild(iframe);

        const banner = document.createElement('div');
        banner.className = 'cmc-banner';
        banner.innerHTML = `
            <div class="cmc-left">
                <div class="cmc-icon"><i class="fas fa-map"></i></div>
                <div class="cmc-text">
                    <h3 class="cmc-title" contenteditable="true">${title}</h3>
                    <p class="cmc-subtitle" contenteditable="true">${subtitle}</p>
                </div>
            </div>
            <a class="btn cmc-cta cmc-cta-white" href="${ctaHref}" target="_self"><span>${ctaText}</span></a>
        `;

        section.appendChild(mapWrap);
        section.appendChild(banner);

        this.makeSelectable(section);
        return section;
    }

    static createHeroTravel(options = {}) {
        const section = document.createElement('section');
        // Default fullwidth for hero
        section.className = 'wb-component wb-hero-travel edge-to-edge';
        section.setAttribute('data-component', 'hero-travel');
        section.id = this.generateId('hero_travel');

        // Defaults
        const bgUrl = options.background || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop';
        const title = options.title || 'Where Would You Like To Go?';
        const subtitle = options.subtitle || 'Checkout Beautiful Places Around the World.';
        const overlayOpacity = options.overlayOpacity ?? 0.45;

        // Toolbar
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(section);

        // Force-Remove control (safety remove button for stubborn cases)
        const kill = document.createElement('button');
        kill.className = 'wb-dev-remove';
        kill.type = 'button';
        kill.title = 'Sectie verwijderen';
        kill.innerHTML = '<i class="fas fa-trash"></i>';
        kill.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Weet je zeker dat je deze Hero sectie wilt verwijderen?')) {
                section.remove();
            }
        });
        section.appendChild(kill);

        // Background image (use <img> for better sharpness)
        const bg = document.createElement('div');
        bg.className = 'hero-bg';
        const bgImg = document.createElement('img');
        bgImg.className = 'hero-bg-img';
        bgImg.src = bgUrl;
        bgImg.alt = 'Hero background';
        bgImg.decoding = 'async';
        bgImg.loading = 'eager';
        bg.appendChild(bgImg);

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'hero-overlay';
        overlay.style.setProperty('--overlay-opacity', overlayOpacity);

        // Content wrapper
        const content = document.createElement('div');
        content.className = 'hero-content';

        // Badge
        const badge = document.createElement('div');
        badge.className = 'hero-badge';
        badge.textContent = "Let's Explore";

        // Headings
        const h1 = document.createElement('h1');
        h1.className = 'hero-title';
        h1.textContent = title;
        h1.contentEditable = true;

        const p = document.createElement('p');
        p.className = 'hero-subtitle';
        p.textContent = subtitle;
        p.contentEditable = true;

        // Search bar
        const search = document.createElement('div');
        search.className = 'hero-search';
        search.innerHTML = `
            <div class="search-item">
                <label><i class="fas fa-location-dot"></i> Location</label>
                <div class="value" contenteditable="true">Where to Next?</div>
            </div>
            <div class="divider"></div>
            <div class="search-item">
                <label><i class="fas fa-shapes"></i> Type</label>
                <div class="value" contenteditable="true">Trip Types</div>
            </div>
            <div class="divider"></div>
            <div class="search-item">
                <label><i class="fas fa-clock"></i> Duration</label>
                <div class="value" contenteditable="true">3 Days - 3 Days</div>
            </div>
            <div class="divider"></div>
            <div class="search-item">
                <label><i class="fas fa-dollar-sign"></i> Price</label>
                <div class="value" contenteditable="true">$189 - $659</div>
            </div>
            <button class="btn btn-primary search-btn"><i class="fas fa-search"></i> Search</button>
        `;

        // Bridge search to app via CustomEvent
        const searchBtn = search.querySelector('.search-btn');
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const values = search.querySelectorAll('.search-item .value');
            const getVal = (i) => (values[i]?.textContent || '').trim();
            const payload = {
                location: getVal(0),
                type: getVal(1),
                duration: getVal(2),
                price: getVal(3),
                sectionId: section.id
            };
            const evt = new CustomEvent('heroSearch', { bubbles: true, detail: payload });
            section.dispatchEvent(evt);
        });

        // Decorative arrow
        const deco = document.createElement('div');
        deco.className = 'hero-deco';
        deco.innerHTML = '<i class="fas fa-angles-down"></i>';

        // Cards overlap
        const cardsWrap = document.createElement('div');
        cardsWrap.className = 'hero-cards-wrap';
        const cards = document.createElement('div');
        cards.className = 'hero-cards';

        const defaultCards = options.cards || [
            { icon: 'fa-campground', title: 'Adventure', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-umbrella-beach', title: 'Beach', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-compass', title: 'Adventure', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-globe', title: 'Discovery', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-person-biking', title: 'Mountain Biking', text: 'Lorem ipsum is simply sit of free text dolor.' }
        ];

        defaultCards.forEach(c => {
            const card = document.createElement('div');
            card.className = 'hero-card';
            card.innerHTML = `
                <div class="icon"><i class="fas ${c.icon}"></i></div>
                <h4 contenteditable="true">${c.title}</h4>
                <div class="sep"></div>
                <p contenteditable="true">${c.text}</p>
            `;
            cards.appendChild(card);
        });

        cardsWrap.appendChild(cards);

        // Assemble
        content.appendChild(badge);
        content.appendChild(h1);
        content.appendChild(p);
        content.appendChild(search);
        content.appendChild(deco);

        section.appendChild(bg);
        section.appendChild(overlay);
        section.appendChild(content);
        section.appendChild(cardsWrap);

        // Interactions
        this.makeSelectable(section);
        this.makeEditable(h1);
        this.makeEditable(p);

        return section;
    }

    // HERO: Travel Search - Hero met werkende zoek & boek functionaliteit
    static createHeroTravelSearch(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-hero-travel-search edge-to-edge';
        section.setAttribute('data-component', 'hero-travel-search');
        section.id = this.generateId('hero_travel_search');

        // Defaults
        const bgUrl = options.background || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop';
        const title = options.title || 'Vind Jouw Perfecte Reis';
        const subtitle = options.subtitle || 'Ontdek prachtige bestemmingen over de hele wereld';
        const overlayOpacity = options.overlayOpacity ?? 0.5;
        
        // Searchbox styling options
        const searchBoxBg = options.searchBoxBg || '#ffffff';
        const searchBoxOpacity = options.searchBoxOpacity ?? 1;
        const searchBoxPosition = options.searchBoxPosition || 'center'; // 'top', 'center', 'bottom', 'left', 'right'
        const searchBoxLayout = options.searchBoxLayout || 'horizontal'; // 'horizontal', 'vertical'

        // Toolbar
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Background image
        const bg = document.createElement('div');
        bg.className = 'hero-bg';
        bg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
        `;
        
        const bgImg = document.createElement('img');
        bgImg.src = bgUrl;
        bgImg.alt = 'Hero background';
        bgImg.decoding = 'async';
        bgImg.loading = 'eager';
        bgImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;
        bg.appendChild(bgImg);

        // Overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(0,0,0,${overlayOpacity}) 0%, rgba(0,0,0,${overlayOpacity * 0.7}) 100%);
            z-index: 1;
        `;

        // Content wrapper
        const content = document.createElement('div');
        const isVertical = searchBoxLayout === 'vertical';
        const isSide = searchBoxPosition === 'left' || searchBoxPosition === 'right';
        
        content.style.cssText = `
            position: relative;
            z-index: 2;
            max-width: ${isSide ? '100%' : '1200px'};
            margin: 0 auto;
            padding: ${searchBoxPosition === 'top' ? '80px 20px 120px' : searchBoxPosition === 'bottom' ? '120px 20px 80px' : '120px 20px 80px'};
            text-align: ${isSide ? 'left' : 'center'};
            min-height: 600px;
            display: ${isSide ? 'grid' : 'flex'};
            ${isSide ? `grid-template-columns: ${searchBoxPosition === 'left' ? '400px 1fr' : '1fr 400px'}; gap: 40px; align-items: center;` : 'flex-direction: column;'}
            justify-content: ${searchBoxPosition === 'top' ? 'flex-start' : searchBoxPosition === 'bottom' ? 'flex-end' : 'center'};
        `;

        // Badge
        const badge = document.createElement('div');
        badge.textContent = "Ontdek & Boek";
        badge.contentEditable = true;
        badge.style.cssText = `
            display: inline-block;
            background: #fbbf24;
            color: #78350f;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 24px;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;

        // Title
        const h1 = document.createElement('h1');
        h1.textContent = title;
        h1.contentEditable = true;
        h1.style.cssText = `
            font-size: 56px;
            font-weight: 800;
            color: white;
            margin: 0 0 16px 0;
            line-height: 1.2;
            text-shadow: 0 2px 20px rgba(0,0,0,0.3);
        `;

        // Subtitle
        const p = document.createElement('p');
        p.textContent = subtitle;
        p.contentEditable = true;
        p.style.cssText = `
            font-size: 20px;
            color: rgba(255,255,255,0.95);
            margin: 0 0 48px 0;
            text-shadow: 0 1px 10px rgba(0,0,0,0.3);
        `;

        // Search Box
        const searchBox = document.createElement('div');
        searchBox.className = 'travel-search-box';
        searchBox.dataset.position = searchBoxPosition;
        searchBox.dataset.layout = searchBoxLayout;
        
        // Convert hex to rgba for opacity
        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        
        const bgColor = searchBoxBg.startsWith('#') ? hexToRgba(searchBoxBg, searchBoxOpacity) : searchBoxBg;
        
        searchBox.style.cssText = `
            background: ${bgColor};
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            display: grid;
            grid-template-columns: ${searchBoxLayout === 'vertical' ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))'};
            gap: 16px;
            align-items: end;
            max-width: ${searchBoxLayout === 'vertical' ? '400px' : '1000px'};
            margin: 0 auto;
        `;

        // Search Fields
        const fields = [
            { 
                icon: 'fa-map-marker-alt', 
                label: 'Bestemming', 
                placeholder: 'Waar wil je naartoe?',
                id: 'searchLocation'
            },
            { 
                icon: 'fa-tag', 
                label: 'Type Reis', 
                placeholder: 'Strand, Rondreis, etc.',
                id: 'searchType'
            },
            { 
                icon: 'fa-calendar', 
                label: 'Duur', 
                placeholder: 'Aantal dagen',
                id: 'searchDuration'
            },
            { 
                icon: 'fa-euro-sign', 
                label: 'Budget', 
                placeholder: 'Max prijs',
                id: 'searchPrice'
            }
        ];

        fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 8px;
            `;

            const label = document.createElement('label');
            label.innerHTML = `<i class="fas ${field.icon}" style="color: #0284c7; margin-right: 8px;"></i>${field.label}`;
            label.style.cssText = `
                font-size: 14px;
                font-weight: 600;
                color: #6b7280;
                display: flex;
                align-items: center;
            `;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = field.id;
            input.placeholder = field.placeholder;
            input.style.cssText = `
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px 16px;
                font-size: 16px;
                outline: none;
                transition: border-color 0.3s ease;
            `;
            input.addEventListener('focus', function() {
                this.style.borderColor = '#0284c7';
            });
            input.addEventListener('blur', function() {
                this.style.borderColor = '#e5e7eb';
            });

            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            searchBox.appendChild(fieldDiv);
        });

        // Search Button
        const searchBtn = document.createElement('button');
        searchBtn.innerHTML = '<i class="fas fa-search"></i> Zoek Reizen';
        searchBtn.style.cssText = `
            background: #0284c7;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 32px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            height: 48px;
            margin-top: auto;
        `;
        searchBtn.addEventListener('mouseenter', function() {
            this.style.background = '#0369a1';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 20px rgba(2, 132, 199, 0.4)';
        });
        searchBtn.addEventListener('mouseleave', function() {
            this.style.background = '#0284c7';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });

        // Search functionality
        searchBtn.addEventListener('click', async () => {
            const location = document.getElementById('searchLocation')?.value.trim();
            const type = document.getElementById('searchType')?.value.trim();
            const duration = document.getElementById('searchDuration')?.value.trim();
            const price = document.getElementById('searchPrice')?.value.trim();

            console.log('[HeroTravelSearch] Searching:', { location, type, duration, price });

            // Check if Travel Overview exists on SAME page
            const travelOverview = document.querySelector('.wb-travel-overview');
            
            if (travelOverview) {
                // Same page: Apply filters directly
                const searchInput = travelOverview.querySelector('.travel-search-input');
                if (searchInput && location) {
                    searchInput.value = location;
                    searchInput.dispatchEvent(new Event('input'));
                }

                // Apply type filter
                if (type) {
                    const filterBtns = travelOverview.querySelectorAll('.travel-filter-btn');
                    filterBtns.forEach(btn => {
                        if (btn.textContent.toLowerCase().includes(type.toLowerCase())) {
                            btn.click();
                        }
                    });
                }

                // Smooth scroll to results
                travelOverview.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // Different page: Redirect to /reizen with URL parameters
                const params = new URLSearchParams();
                if (location) params.set('location', location);
                if (type) params.set('type', type);
                if (duration) params.set('duration', duration);
                if (price) params.set('price', price);
                
                const queryString = params.toString();
                const targetUrl = queryString ? `/reizen?${queryString}` : '/reizen';
                
                console.log('[HeroTravelSearch] Redirecting to:', targetUrl);
                window.location.href = targetUrl;
            }

            // Dispatch custom event for advanced integrations
            const searchEvent = new CustomEvent('travelSearch', {
                bubbles: true,
                detail: { location, type, duration, price }
            });
            section.dispatchEvent(searchEvent);
        });

        searchBox.appendChild(searchBtn);

        // Quick Links (Popular Destinations)
        const quickLinks = document.createElement('div');
        quickLinks.style.cssText = `
            margin-top: 32px;
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        `;

        const popularDestinations = options.popularDestinations || [
            'Thailand', 'Spanje', 'Italië', 'Griekenland', 'Frankrijk'
        ];

        const quickLabel = document.createElement('span');
        quickLabel.textContent = 'Populair:';
        quickLabel.style.cssText = `
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            font-weight: 600;
        `;
        quickLinks.appendChild(quickLabel);

        popularDestinations.forEach(dest => {
            const link = document.createElement('button');
            link.textContent = dest;
            link.style.cssText = `
                background: rgba(255,255,255,0.2);
                backdrop-filter: blur(10px);
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            link.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255,255,255,0.3)';
                this.style.borderColor = 'rgba(255,255,255,0.5)';
            });
            link.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255,255,255,0.2)';
                this.style.borderColor = 'rgba(255,255,255,0.3)';
            });
            link.addEventListener('click', () => {
                const locationInput = document.getElementById('searchLocation');
                if (locationInput) {
                    locationInput.value = dest;
                    searchBtn.click();
                }
            });
            quickLinks.appendChild(link);
        });

        // Assemble
        content.appendChild(badge);
        content.appendChild(h1);
        content.appendChild(p);
        content.appendChild(searchBox);
        content.appendChild(quickLinks);

        section.appendChild(bg);
        section.appendChild(overlay);
        section.appendChild(content);

        // Interactions
        this.makeSelectable(section);
        this.makeEditable(badge);
        this.makeEditable(h1);
        this.makeEditable(p);

        // Set min height
        section.style.minHeight = '600px';
        section.style.position = 'relative';

        return section;
    }

    // MEDIA: Soorten Reizen grid (8 cards)
    static createTravelTypes(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-travel-types';
        section.setAttribute('data-component', 'travel-types');
        section.id = this.generateId('travel_types');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        const title = options.title || 'Soorten Reizen';
        const subtitle = options.subtitle || 'Kies jouw perfecte reistype';

        const defaults = options.cards || [
            { label: 'Zonvakanties', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', href: '#' },
            { label: 'Stedentrips', img: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800', href: '#' },
            { label: 'Rondreizen', img: 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=800', href: '#' },
            { label: 'Huwelijksreizen', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', href: '#' },
            { label: 'Luxe Vakanties', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', href: '#' },
            { label: 'Wintersport', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800', href: '#' },
            { label: 'Cruises', img: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800', href: '#' },
            { label: 'All Inclusive', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800', href: '#' }
        ];

        // Content
        const header = document.createElement('div');
        header.className = 'tt-header';
        header.innerHTML = `
            <h2 class="tt-title" contenteditable="true">${title}</h2>
            <p class="tt-subtitle" contenteditable="true">${subtitle}</p>
        `;
        // Isolate header layout/paint to avoid impacting grid while typing
        try { header.style.contain = 'layout paint style'; } catch (e) {}
        try { header.style.contentVisibility = 'auto'; header.style.containIntrinsicSize = '600px 120px'; } catch (e) {}
        // Batch inline title typing to once-per-frame and signal builder to pause saves
        try {
            const titleEl = header.querySelector('.tt-title');
            let _raf = null;
            if (titleEl) {
                titleEl.addEventListener('input', (e) => {
                    // Prevent any global input listeners doing heavy work per keystroke
                    try { e.stopPropagation(); } catch (e) {}
                    if (_raf) return;
                    _raf = requestAnimationFrame(() => {
                        _raf = null;
                        try { window.websiteBuilder && typeof window.websiteBuilder.markTyping === 'function' && window.websiteBuilder.markTyping(800); } catch (e) {}
                    });
                });
            }
        } catch (e) {}

        const grid = document.createElement('div');
        grid.className = 'tt-grid';
        // Contain grid to limit reflow scope when text above changes
        try { grid.style.contain = 'layout paint style'; } catch (e) {}

        // Simple guard to avoid overlapping pickers/updates
        section._ttPickLock = false;

        // Shared replacer using card element (event delegation compatible)
        const pickAndReplaceSafe = async (cardEl) => {
            if (!cardEl) return;
            if (section._ttPickLock) return;
            section._ttPickLock = true;
            try {
                if (!window.MediaPicker || typeof window.MediaPicker.openImage !== 'function') return;
                const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const u = r?.fullUrl || r?.regularUrl || r?.url || r?.dataUrl;
                if (!u) return;
                const targetImg = cardEl.querySelector('img');
                if (!targetImg) return;
                try { targetImg.decoding = 'async'; targetImg.loading = 'lazy'; } catch (e) {}
                if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(targetImg, u);
                else if (typeof __WB_applyResponsiveSrc === 'function') __WB_applyResponsiveSrc(targetImg, u);
                else targetImg.src = u;
                try { targetImg.src = u; targetImg.removeAttribute('srcset'); targetImg.removeAttribute('sizes'); } catch (e) {}
                try { await new Promise(requestAnimationFrame); } catch (e) {}
            } catch (e) {}
            finally { section._ttPickLock = false; }
        };

        defaults.forEach((c, i) => {
            const card = document.createElement('a');
            card.className = 'tt-card';
            card.href = c.href || '#';
            card.target = '_self';
            card.setAttribute('data-index', String(i));

            const img = document.createElement('img');
            __WB_applyResponsiveSrc(img, c.img);
            img.alt = c.label;
            img.decoding = 'async';
            img.loading = 'lazy';
            // Avoid layout thrash during decode
            try { img.style.contentVisibility = 'auto'; img.style.containIntrinsicSize = '320px 200px'; } catch (e) {}
            // Helper to open picker and replace image
            const pickAndReplace = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (section._ttPickLock) return;
                section._ttPickLock = true;
                try {
                    if (!window.MediaPicker || typeof window.MediaPicker.openImage !== 'function') return;
                    const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    const u = r?.fullUrl || r?.regularUrl || r?.url || r?.dataUrl;
                    if (!u) return;
                    // Hint the browser to decode off main thread and avoid eager work
                    try { img.decoding = 'async'; img.loading = 'lazy'; } catch (e) {}
                    // Apply responsively; avoid double-setting where possible
                    if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(img, u);
                    else if (typeof __WB_applyResponsiveSrc === 'function') __WB_applyResponsiveSrc(img, u);
                    else img.src = u;
                    // Ensure immediate visual if browser keeps old srcset
                    try { img.src = u; img.removeAttribute('srcset'); img.removeAttribute('sizes'); } catch (e) {}
                    // Yield a frame to keep UI responsive after heavy image decode
                    try { await new Promise(requestAnimationFrame); } catch (e) {}
                } catch (e) {}
                finally { section._ttPickLock = false; }
            };
            // Allow clicking image to replace
            img.style.cursor = 'pointer';
            img.addEventListener('click', pickAndReplace);

            const overlay = document.createElement('div');
            overlay.className = 'tt-overlay';
            overlay.innerHTML = `<span class="tt-label" contenteditable="true">${c.label}</span>`;
            // Clicking overlay opens picker unless label text is targeted
            overlay.addEventListener('click', (e) => {
                const onLabel = e.target && (e.target.closest && e.target.closest('.tt-label'));
                if (onLabel) return; // allow editing label
                return pickAndReplace(e);
            });
            card.appendChild(img);
            card.appendChild(overlay);
            // Fallback: clicking card opens picker (except label)
            card.addEventListener('click', (e) => {
                const onLabel = e.target && (e.target.closest && e.target.closest('.tt-label'));
                if (onLabel) return;
                return pickAndReplace(e);
            });
            grid.appendChild(card);
        });

        // Event delegation: one handler for the whole grid
        try {
            grid.addEventListener('click', (e) => {
                const label = e.target && e.target.closest && e.target.closest('.tt-label');
                if (label) return; // allow label editing
                const card = e.target && e.target.closest && e.target.closest('.tt-card');
                if (!card) return;
                e.preventDefault();
                e.stopPropagation();
                pickAndReplaceSafe(card);
            }, { passive: true });
        } catch (e) {
            grid.addEventListener('click', (e) => {
                const label = e.target && e.target.closest && e.target.closest('.tt-label');
                if (label) return;
                const card = e.target && e.target.closest && e.target.closest('.tt-card');
                if (!card) return;
                e.preventDefault();
                e.stopPropagation();
                pickAndReplaceSafe(card);
            });
        }

        section.appendChild(header);
        section.appendChild(grid);

        // Interactions
        this.makeSelectable(section);

        return section;
    }

    // Hero Video CTA - Parallax background with video popup and feature buttons
    static createHeroVideoCta(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-hero-video-cta';
        section.setAttribute('data-component', 'hero-video-cta');
        section.id = this.generateId('hero_video_cta');

        const toolbar = this.createToolbar();
        section.appendChild(toolbar);

        // Parallax background image
        const bgImage = options.background || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920';
        section.style.backgroundImage = `url(${bgImage})`;
        section.style.backgroundAttachment = 'fixed';
        section.style.backgroundPosition = 'center';
        section.style.backgroundSize = 'cover';
        section.style.minHeight = '600px';
        section.style.position = 'relative';
        section.style.display = 'flex';
        section.style.alignItems = 'center';
        section.style.padding = '80px 20px';

        // Overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.background = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '1';
        section.appendChild(overlay);

        // Content container
        const container = document.createElement('div');
        container.style.maxWidth = '1200px';
        container.style.margin = '0 auto';
        container.style.width = '100%';
        container.style.position = 'relative';
        container.style.zIndex = '2';
        container.style.display = 'flex';
        container.style.gap = '60px';
        container.style.alignItems = 'center';

        // Left side: Video button + Title + CTA
        const leftSide = document.createElement('div');
        leftSide.style.flex = '1';
        leftSide.style.color = '#fff';

        // Video play button (round, orange)
        const videoBtn = document.createElement('button');
        videoBtn.className = 'wb-video-play-btn';
        videoBtn.innerHTML = '<i class="fas fa-play"></i>';
        videoBtn.style.width = '80px';
        videoBtn.style.height = '80px';
        videoBtn.style.borderRadius = '50%';
        videoBtn.style.background = '#ff8c00';
        videoBtn.style.border = 'none';
        videoBtn.style.color = '#fff';
        videoBtn.style.fontSize = '24px';
        videoBtn.style.cursor = 'pointer';
        videoBtn.style.marginBottom = '30px';
        videoBtn.style.display = 'flex';
        videoBtn.style.alignItems = 'center';
        videoBtn.style.justifyContent = 'center';
        videoBtn.style.transition = 'transform 0.3s ease';
        videoBtn.dataset.videoId = options.videoId || 'dQw4w9WgXcQ';
        
        videoBtn.addEventListener('click', function() {
            const videoId = this.dataset.videoId;
            if (!videoId) return;
            
            // Create modal
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.right = '0';
            modal.style.bottom = '0';
            modal.style.background = 'rgba(0, 0, 0, 0.9)';
            modal.style.zIndex = '9999';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.padding = '20px';
            
            const videoContainer = document.createElement('div');
            videoContainer.style.position = 'relative';
            videoContainer.style.width = '100%';
            videoContainer.style.maxWidth = '900px';
            videoContainer.style.aspectRatio = '16/9';
            
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.setAttribute('allowfullscreen', '');
            
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '-40px';
            closeBtn.style.right = '0';
            closeBtn.style.background = 'transparent';
            closeBtn.style.border = 'none';
            closeBtn.style.color = '#fff';
            closeBtn.style.fontSize = '32px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => modal.remove();
            
            videoContainer.appendChild(iframe);
            videoContainer.appendChild(closeBtn);
            modal.appendChild(videoContainer);
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
            document.body.appendChild(modal);
        });
        
        videoBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        videoBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });

        // Title
        const title = document.createElement('h2');
        title.textContent = options.title || 'Boek een compleet pakket, inclusief leuke activiteiten';
        title.contentEditable = true;
        title.style.fontSize = '42px';
        title.style.fontWeight = '700';
        title.style.marginBottom = '30px';
        title.style.lineHeight = '1.2';
        title.style.color = '#fff';

        // CTA Button
        const ctaBtn = document.createElement('button');
        ctaBtn.className = 'wb-cta-btn';
        ctaBtn.textContent = options.ctaText || 'Start met plannen';
        ctaBtn.contentEditable = true;
        ctaBtn.style.background = '#ff8c00';
        ctaBtn.style.color = '#fff';
        ctaBtn.style.border = 'none';
        ctaBtn.style.padding = '16px 32px';
        ctaBtn.style.fontSize = '18px';
        ctaBtn.style.fontWeight = '600';
        ctaBtn.style.borderRadius = '8px';
        ctaBtn.style.cursor = 'pointer';
        ctaBtn.style.transition = 'background 0.3s ease';
        
        ctaBtn.addEventListener('mouseenter', function() {
            this.style.background = '#ff7700';
        });
        ctaBtn.addEventListener('mouseleave', function() {
            this.style.background = '#ff8c00';
        });

        leftSide.appendChild(videoBtn);
        leftSide.appendChild(title);
        leftSide.appendChild(ctaBtn);

        // Right side: Feature buttons (2x2 grid)
        const rightSide = document.createElement('div');
        rightSide.style.display = 'grid';
        rightSide.style.gridTemplateColumns = 'repeat(2, 1fr)';
        rightSide.style.gap = '20px';
        rightSide.style.flex = '0 0 400px';

        const features = options.features || [
            { icon: 'fa-bicycle', label: 'Fiets\nTocht' },
            { icon: 'fa-route', label: 'Rondvaart\nSeine' },
            { icon: 'fa-shopping-cart', label: 'Shoppen' },
            { icon: 'fa-landmark', label: 'Monumenten' }
        ];

        features.forEach(feature => {
            const featureBtn = document.createElement('div');
            featureBtn.className = 'wb-feature-btn';
            featureBtn.style.background = options.transparentButtons ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 140, 0, 0.9)';
            featureBtn.style.backdropFilter = 'blur(10px)';
            featureBtn.style.border = '2px solid rgba(255, 255, 255, 0.3)';
            featureBtn.style.borderRadius = '12px';
            featureBtn.style.padding = '30px 20px';
            featureBtn.style.textAlign = 'center';
            featureBtn.style.color = '#fff';
            featureBtn.style.cursor = 'pointer';
            featureBtn.style.transition = 'all 0.3s ease';
            
            const icon = document.createElement('i');
            icon.className = `fas ${feature.icon}`;
            icon.style.fontSize = '40px';
            icon.style.marginBottom = '12px';
            icon.style.display = 'block';
            icon.style.color = '#ff8c00';
            
            const label = document.createElement('div');
            label.textContent = feature.label;
            label.contentEditable = true;
            label.style.fontSize = '16px';
            label.style.fontWeight = '600';
            label.style.whiteSpace = 'pre-line';
            
            featureBtn.appendChild(icon);
            featureBtn.appendChild(label);
            
            featureBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            });
            featureBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
            
            rightSide.appendChild(featureBtn);
        });

        container.appendChild(leftSide);
        container.appendChild(rightSide);
        section.appendChild(container);

        this.makeSelectable(section);
        this.makeEditable(title);
        this.makeEditable(ctaBtn);

        return section;
    }

    // Travel Card: Transport
    static createTravelCardTransport(options = {}) {
        const card = document.createElement('div');
        card.className = 'wb-component wb-travel-card transport';
        card.setAttribute('data-component', 'travel-card-transport');
        card.id = this.generateId('travel_card_transport');

        const toolbar = this.createToolbar();
        card.appendChild(toolbar);
        this.addTypeBadge(card);

        const departure = options.departure || 'Amsterdam';
        const arrival = options.arrival || 'Barcelona';
        const airline = options.airline || 'KLM';
        const flightNumber = options.flightNumber || 'KL1234';
        const departureTime = options.departureTime || '10:30';
        const arrivalTime = options.arrivalTime || '13:45';
        const duration = options.duration || '3u 15min';

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="wb-travel-card-header">
                <div class="wb-travel-card-icon">
                    <i class="fas fa-plane-departure"></i>
                </div>
                <div class="wb-travel-card-title">
                    <h3 contenteditable="true">Transport</h3>
                    <div class="subtitle" contenteditable="true">${departure} → ${arrival}</div>
                </div>
            </div>
            <div class="wb-travel-card-body">
                <div class="wb-travel-card-row">
                    <i class="fas fa-plane"></i>
                    <span contenteditable="true">${airline} Flight ${flightNumber}</span>
                </div>
                <div class="wb-travel-card-row">
                    <i class="fas fa-clock"></i>
                    <span contenteditable="true">${departureTime} - ${arrivalTime} (${duration})</span>
                </div>
            </div>
        `;
        card.appendChild(content);

        this.makeSelectable(card);
        return card;
    }

    // Travel Card: Hotel
    static createTravelCardHotel(options = {}) {
        const card = document.createElement('div');
        card.className = 'wb-component wb-travel-card hotel';
        card.setAttribute('data-component', 'travel-card-hotel');
        card.id = this.generateId('travel_card_hotel');

        const toolbar = this.createToolbar();
        card.appendChild(toolbar);
        this.addTypeBadge(card);

        const hotelName = options.hotelName || 'Hotel Barcelona Plaza';
        const stars = options.stars || 4;
        const nights = options.nights || 3;
        const persons = options.persons || 2;
        const roomType = options.roomType || 'Standaard kamer';
        const meals = options.meals || 'Ontbijt inbegrepen';
        const description = options.description || '';
        const facilities = options.facilities || [];
        const images = options.images || [];

        const starsHtml = '⭐'.repeat(stars);

        // Create image carousel HTML
        let carouselHtml = '';
        if (images.length > 0) {
            carouselHtml = `
                <div class="wb-travel-card-carousel">
                    <div class="carousel-images">
                        ${images.map((img, idx) => `
                            <div class="carousel-image ${idx === 0 ? 'active' : ''}" style="background-image: url('${img}');"></div>
                        `).join('')}
                    </div>
                    ${images.length > 1 ? `
                        <button class="carousel-prev" onclick="event.stopPropagation(); this.closest('.wb-travel-card-carousel').querySelector('.carousel-images').scrollBy({left: -300, behavior: 'smooth'})">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="carousel-next" onclick="event.stopPropagation(); this.closest('.wb-travel-card-carousel').querySelector('.carousel-images').scrollBy({left: 300, behavior: 'smooth'})">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <div class="carousel-dots">
                            ${images.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}"></span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        const content = document.createElement('div');
        content.innerHTML = `
            ${carouselHtml}
            <div class="wb-travel-card-header">
                <div class="wb-travel-card-icon">
                    <i class="fas fa-hotel"></i>
                </div>
                <div class="wb-travel-card-title">
                    <h3 contenteditable="true">Hotel</h3>
                    <div class="subtitle" contenteditable="true">${hotelName} ${starsHtml}</div>
                </div>
            </div>
            <div class="wb-travel-card-body">
                <div class="wb-travel-card-row">
                    <i class="fas fa-bed"></i>
                    <span contenteditable="true">${roomType}</span>
                </div>
                <div class="wb-travel-card-row">
                    <i class="fas fa-calendar-days"></i>
                    <span contenteditable="true">${nights} nachten, ${persons} personen</span>
                </div>
                <div class="wb-travel-card-row">
                    <i class="fas fa-utensils"></i>
                    <span contenteditable="true">${meals}</span>
                </div>
                ${facilities.length > 0 ? `
                    <div class="wb-travel-card-facilities">
                        ${facilities.map(f => `<span class="facility"><i class="${f.icon}"></i> ${f.description}</span>`).join('')}
                    </div>
                ` : ''}
                ${description ? `
                    <div class="wb-travel-card-description" contenteditable="true">${description}</div>
                ` : ''}
            </div>
        `;
        card.appendChild(content);

        this.makeSelectable(card);
        return card;
    }

    // Travel Card: Destination
    static createTravelCardDestination(options = {}) {
        const card = document.createElement('div');
        card.className = 'wb-component wb-travel-card destination';
        card.setAttribute('data-component', 'travel-card-destination');
        card.id = this.generateId('travel_card_destination');

        const toolbar = this.createToolbar();
        card.appendChild(toolbar);
        this.addTypeBadge(card);

        const activityName = options.activityName || 'Barcelona City Tour';
        const day = options.day || 'Dag 2';
        const location = options.location || 'Sagrada Familia';
        const duration = options.duration || '3 uur';
        const description = options.description || '';
        const images = options.images || [];

        // Create image carousel HTML
        let carouselHtml = '';
        if (images.length > 0) {
            carouselHtml = `
                <div class="wb-travel-card-carousel">
                    <div class="carousel-images">
                        ${images.map((img, idx) => `
                            <div class="carousel-image ${idx === 0 ? 'active' : ''}" style="background-image: url('${img}');"></div>
                        `).join('')}
                    </div>
                    ${images.length > 1 ? `
                        <button class="carousel-prev" onclick="event.stopPropagation(); this.closest('.wb-travel-card-carousel').querySelector('.carousel-images').scrollBy({left: -300, behavior: 'smooth'})">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="carousel-next" onclick="event.stopPropagation(); this.closest('.wb-travel-card-carousel').querySelector('.carousel-images').scrollBy({left: 300, behavior: 'smooth'})">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <div class="carousel-dots">
                            ${images.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}"></span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        const content = document.createElement('div');
        content.innerHTML = `
            ${carouselHtml}
            <div class="wb-travel-card-header">
                <div class="wb-travel-card-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="wb-travel-card-title">
                    <h3 contenteditable="true">Bestemming</h3>
                    <div class="subtitle" contenteditable="true">${activityName}</div>
                </div>
            </div>
            <div class="wb-travel-card-body">
                <div class="wb-travel-card-row">
                    <i class="fas fa-calendar"></i>
                    <span contenteditable="true">${day}: ${location}</span>
                </div>
                <div class="wb-travel-card-row">
                    <i class="fas fa-clock"></i>
                    <span contenteditable="true">${duration}</span>
                </div>
                ${description ? `
                    <div class="wb-travel-card-description" contenteditable="true">${description}</div>
                ` : ''}
            </div>
        `;
        card.appendChild(content);

        // Store destination data for map integration
        if (options.latitude && options.longitude) {
            card._destinationData = {
                name: activityName,
                latitude: options.latitude,
                longitude: options.longitude,
                fromDay: options.fromDay || 1,
                toDay: options.toDay || 1
            };
        }
        
        // Add click handler to open destination details panel (only on live site, not in builder)
        card.addEventListener('click', (e) => {
            // Don't open panel if clicking on editable content or in builder mode
            if (e.target.contentEditable === 'true' || e.target.closest('.wb-toolbar')) {
                return;
            }
            
            // Check if we're in builder mode
            const isBuilder = window.location.href.includes('ai-websitestudio.nl') || 
                             window.location.href.includes('localhost') ||
                             document.querySelector('.wb-sidebar');
            
            if (isBuilder) {
                return; // Don't open panel in builder
            }
            
            // On live site: open destination details panel
            if (typeof window.showDestinationDetails === 'function') {
                const destData = {
                    name: activityName,
                    location: location,
                    day: day,
                    duration: duration,
                    description: description,
                    images: images,
                    latitude: options.latitude,
                    longitude: options.longitude
                };
                window.showDestinationDetails(destData);
            }
        });

        this.makeSelectable(card);
        return card;
    }

    // Travel Card: Transfer
    static createTravelCardTransfer(options = {}) {
        const card = document.createElement('div');
        card.className = 'wb-component wb-travel-card transfer';
        card.setAttribute('data-component', 'travel-card-transfer');
        card.id = this.generateId('travel_card_transfer');

        const toolbar = this.createToolbar();
        card.appendChild(toolbar);
        this.addTypeBadge(card);

        const from = options.from || 'Luchthaven';
        const to = options.to || 'Hotel';
        const transferType = options.transferType || 'Private transfer';
        const duration = options.duration || '30 minuten';

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="wb-travel-card-header">
                <div class="wb-travel-card-icon">
                    <i class="fas fa-car"></i>
                </div>
                <div class="wb-travel-card-title">
                    <h3 contenteditable="true">Transfer</h3>
                    <div class="subtitle" contenteditable="true">${from} → ${to}</div>
                </div>
            </div>
            <div class="wb-travel-card-body">
                <div class="wb-travel-card-row">
                    <i class="fas fa-taxi"></i>
                    <span contenteditable="true">${transferType}</span>
                </div>
                <div class="wb-travel-card-row">
                    <i class="fas fa-clock"></i>
                    <span contenteditable="true">${duration}</span>
                </div>
            </div>
        `;
        card.appendChild(content);

        this.makeSelectable(card);
        return card;
    }

    // Travel Day Header
    static createTravelDayHeader(options = {}) {
        const header = document.createElement('div');
        header.className = 'wb-component wb-travel-day-header';
        header.setAttribute('data-component', 'travel-day-header');
        header.id = this.generateId('travel_day_header');

        const toolbar = this.createToolbar();
        header.appendChild(toolbar);
        this.addTypeBadge(header);

        const dayNumber = options.dayNumber || 1;
        const dayTitle = options.dayTitle || `Dag ${dayNumber}`;
        const dayDescription = options.dayDescription || 'Aankomst en check-in';
        const displayMode = options.displayMode || 'standard';
        const backgroundType = options.backgroundType || 'gradient'; // Default to gradient
        const destinations = options.destinations || [];

        // Get from/to locations from options
        const fromLocation = options.fromLocation || '';
        const toLocation = options.toLocation || '';
        const distance = options.distance || ''; // km for road trips
        const travelTime = options.travelTime || ''; // travel time
        
        // Store settings
        header._displayMode = displayMode;
        header._backgroundType = backgroundType;
        header._backgroundColor = options.backgroundColor || '#667eea';
        header._backgroundImage = options.backgroundImage || '';
        header._backgroundVideo = options.backgroundVideo || (backgroundType === 'video' ? 'fd36b09' : ''); // Default Iceland video
        header._overlayOpacity = options.overlayOpacity || 0.5; // Higher default for better text readability
        header._textColor = options.textColor || '#ffffff'; // Default white text
        header._destinations = destinations;
        header._fromLocation = fromLocation;
        header._toLocation = toLocation;
        header._distance = distance;
        header._travelTime = travelTime;

        const content = document.createElement('div');
        content.className = 'day-header-content';
        
        // Extract just the description from title if it contains "Dag X"
        const titleText = dayTitle.replace(/^Dag\s+\d+\s*[-:]?\s*/i, '').trim() || dayTitle;
        
        // Check if we need split layout (map or video)
        const useSplitLayout = backgroundType === 'map' || backgroundType === 'video';
        
        if (useSplitLayout) {
            // Split layout: info left, map/video right
            content.innerHTML = `
                <div class="day-header-split">
                    <div class="day-header-left">
                        <div class="day-header-top">
                            <div class="day-header-day-number">${dayNumber}</div>
                            <h2 contenteditable="true">Dag ${dayNumber}</h2>
                        </div>
                        <div class="day-header-info">
                            <p class="day-header-subtitle" contenteditable="true">${dayDescription}</p>
                            ${toLocation ? `
                                <div class="day-header-route">
                                    <div class="route-locations">
                                        ${fromLocation ? `<span class="route-from"><i class="fas fa-map-marker-alt"></i> ${fromLocation}</span>` : ''}
                                        ${fromLocation && toLocation ? `<i class="fas fa-arrow-right"></i>` : ''}
                                        <span class="route-to"><i class="fas fa-map-marker-alt"></i> ${toLocation}</span>
                                    </div>
                                    <div class="route-details">
                                        <span class="route-distance"><i class="fas fa-road"></i> <span contenteditable="true">${distance ? distance + ' km' : '... km'}</span></span>
                                        <span class="route-time"><i class="fas fa-clock"></i> <span contenteditable="true">${travelTime || '...'}</span></span>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="day-header-right">
                        <div class="day-header-bg-layer"></div>
                    </div>
                </div>
            `;
        } else {
            // Full card layout: background with overlay
            content.innerHTML = `
                <div class="day-header-background">
                    <div class="day-header-bg-layer"></div>
                    <div class="day-header-overlay"></div>
                </div>
                <div class="day-header-foreground">
                    <div class="day-header-info-full">
                        <div class="day-header-day-number">${dayNumber}</div>
                        <div class="day-header-text">
                            <h2 contenteditable="true">${titleText || 'Dag ' + dayNumber}</h2>
                            <p contenteditable="true">${dayDescription}</p>
                            ${fromLocation && toLocation ? `
                                <div class="day-header-route">
                                    <div class="route-locations">
                                        <span class="route-from"><i class="fas fa-map-marker-alt"></i> ${fromLocation}</span>
                                        <i class="fas fa-arrow-right"></i>
                                        <span class="route-to"><i class="fas fa-map-marker-alt"></i> ${toLocation}</span>
                                    </div>
                                    ${distance || travelTime ? `
                                        <div class="route-details">
                                            ${distance ? `<span class="route-distance"><i class="fas fa-road"></i> ${distance} km</span>` : ''}
                                            ${travelTime ? `<span class="route-time"><i class="fas fa-clock"></i> ${travelTime}</span>` : ''}
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        
        header.appendChild(content);

        // Auto-fetch destinations from Travel Hero if not provided
        if (destinations.length === 0) {
            const travelHero = document.querySelector('.wb-travel-hero');
            if (travelHero && travelHero._destinations && travelHero._destinations.length > 0) {
                header._destinations = travelHero._destinations;
                console.log('[Day Header] Auto-fetched destinations from Travel Hero:', travelHero._destinations.length);
            }
        }

        // Initialize background
        this.updateDayHeaderBackground(header);

        this.makeSelectable(header);
        return header;
    }

    static updateDayHeaderBackground(header) {
        const bgType = header._backgroundType || 'gradient';
        const currentLayout = header.querySelector('.day-header-split') ? 'split' : 'full';
        const needsSplitLayout = bgType === 'map' || bgType === 'video';
        const needsFullLayout = !needsSplitLayout;

        console.log('[Day Header BG]', {
            bgType,
            currentLayout,
            needsSplitLayout,
            needsFullLayout
        });

        // If layout type needs to change, rebuild the entire content
        if ((currentLayout === 'split' && needsFullLayout) || (currentLayout === 'full' && needsSplitLayout)) {
            console.log('[Day Header BG] Layout change needed, rebuilding...');
            
            // Get current values
            const dayNumberEl = header.querySelector('.day-header-day-number');
            const h2 = header.querySelector('h2');
            const p = header.querySelector('p');
            const routeDiv = header.querySelector('.day-header-route');
            
            const dayNumber = dayNumberEl ? dayNumberEl.textContent : '1';
            const titleText = h2 ? h2.textContent : 'Dag 1';
            const description = p ? p.textContent : '';
            const routeHTML = routeDiv ? routeDiv.outerHTML : '';
            
            // Remove old content
            const content = header.querySelector('.day-header-content');
            if (content) {
                content.remove();
            }
            
            // Rebuild with correct layout
            const newContent = document.createElement('div');
            newContent.className = 'day-header-content';
            
            if (needsSplitLayout) {
                // Split layout
                newContent.innerHTML = `
                    <div class="day-header-split">
                        <div class="day-header-left">
                            <div class="day-header-day-number">${dayNumber}</div>
                            <div class="day-header-info">
                                <h2 contenteditable="true">${titleText}</h2>
                                <p contenteditable="true">${description}</p>
                                ${routeHTML}
                            </div>
                        </div>
                        <div class="day-header-right">
                            <div class="day-header-bg-layer"></div>
                        </div>
                    </div>
                `;
            } else {
                // Full card layout
                newContent.innerHTML = `
                    <div class="day-header-background">
                        <div class="day-header-bg-layer"></div>
                        <div class="day-header-overlay"></div>
                    </div>
                    <div class="day-header-foreground">
                        <div class="day-header-info-full">
                            <div class="day-header-day-number">${dayNumber}</div>
                            <div class="day-header-text">
                                <h2 contenteditable="true">${titleText}</h2>
                                <p contenteditable="true">${description}</p>
                                ${routeHTML}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            header.appendChild(newContent);
        }

        // Now update the background
        const bgLayer = header.querySelector('.day-header-bg-layer');
        const overlay = header.querySelector('.day-header-overlay');

        if (!bgLayer) {
            console.warn('[Day Header BG] Missing bg layer!');
            return;
        }

        // Clear previous content
        bgLayer.innerHTML = '';
        bgLayer.style.background = '';
        bgLayer.style.backgroundImage = '';
        bgLayer.style.backgroundSize = '';
        bgLayer.style.backgroundPosition = '';

        // Set overlay opacity (only for full card layouts)
        if (overlay) {
            overlay.style.opacity = header._overlayOpacity || 0.3;
        }

        switch(bgType) {
            case 'color':
                const color = header._backgroundColor || '#667eea';
                bgLayer.style.background = color;
                console.log('[Day Header BG] Applied color:', color);
                break;
            
            case 'gradient':
                const gradStart = header._gradientStart || '#667eea';
                const gradEnd = header._gradientEnd || '#764ba2';
                const gradient = `linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 100%)`;
                bgLayer.style.background = gradient;
                console.log('[Day Header BG] Applied gradient:', gradient);
                break;
            
            case 'image':
                if (header._backgroundImage) {
                    bgLayer.style.backgroundImage = `url('${header._backgroundImage}')`;
                    bgLayer.style.backgroundSize = 'cover';
                    bgLayer.style.backgroundPosition = 'center';
                    console.log('[Day Header BG] Applied image:', header._backgroundImage);
                } else {
                    console.warn('[Day Header BG] No image URL set!');
                }
                break;
            
            case 'map':
                bgLayer.innerHTML = '<div class="day-header-map" id="day-map-' + header.id + '"></div>';
                console.log('[Day Header BG] Creating map...');
                setTimeout(() => this.initializeDayHeaderMap(header), 100);
                break;
            
            case 'video':
                if (header._backgroundVideo) {
                    const videoId = header._backgroundVideo.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?]+)/)?.[1] || header._backgroundVideo;
                    console.log('[Day Header BG] Creating video iframe for:', videoId);
                    bgLayer.style.position = 'absolute';
                    bgLayer.style.top = '0';
                    bgLayer.style.left = '0';
                    bgLayer.style.width = '100%';
                    bgLayer.style.height = '100%';
                    bgLayer.innerHTML = `
                        <iframe 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1"
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                        ></iframe>
                    `;
                    console.log('[Day Header BG] Video iframe created');
                } else {
                    console.warn('[Day Header BG] No video ID set!');
                    bgLayer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;background:#f3f4f6;font-size:14px;">🎬 Klik "Video Kiezen" om een achtergrond video te selecteren</div>';
                }
                break;
        }
    }

    static initializeDayHeaderMap(header) {
        const mapContainer = header.querySelector('.day-header-map');
        if (!mapContainer || !window.L) {
            console.warn('[Day Header Map] Missing container or Leaflet');
            return;
        }

        // Get current day number
        const dayNumberEl = header.querySelector('.day-header-day-number');
        const currentDay = dayNumberEl ? parseInt(dayNumberEl.textContent) : 1;

        // Try to get destinations from header, or from Travel Hero
        let allDestinations = header._destinations || [];
        
        if (allDestinations.length === 0) {
            // Try to find Travel Hero and get destinations from there
            const travelHero = document.querySelector('.wb-travel-hero');
            if (travelHero && travelHero._destinations) {
                allDestinations = travelHero._destinations;
                console.log('[Day Header Map] Using destinations from Travel Hero:', allDestinations.length);
            }
        }
        
        if (allDestinations.length === 0) {
            console.warn('[Day Header Map] No destinations found!');
            mapContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:white;text-align:center;padding:20px;background:rgba(0,0,0,0.3);font-size:14px;">🗺️ Kaart wordt automatisch geladen met bestemmingen uit Travel Compositor</div>';
            return;
        }

        // Filter destinations for this specific day
        // Find destinations that are active on this day (fromDay <= currentDay <= toDay)
        const dayDestinations = allDestinations.filter(d => 
            d.fromDay <= currentDay && d.toDay >= currentDay
        );
        
        // Also include previous day's destination as starting point
        const prevDayDest = allDestinations.find(d => d.toDay === currentDay - 1);
        
        let routePoints = [];
        if (prevDayDest && prevDayDest.latitude && prevDayDest.longitude) {
            routePoints.push(prevDayDest);
        }
        routePoints = routePoints.concat(dayDestinations);

        if (routePoints.length === 0) {
            console.warn('[Day Header Map] No destinations for day', currentDay);
            mapContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;text-align:center;padding:20px;font-size:14px;">🗺️ Geen route beschikbaar voor deze dag</div>';
            return;
        }

        // Create map with zoom controls enabled
        const map = L.map(mapContainer.id, {
            zoomControl: true,
            attributionControl: false,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo(map);

        // Add route line
        const routeCoords = routePoints.map(d => [d.latitude, d.longitude]);
        
        // Check if this is a car/road route
        // Heuristic: if distance between points is < 500km, assume it's a road trip
        let isCarRoute = false;
        if (routeCoords.length === 2) {
            const lat1 = routeCoords[0][0], lon1 = routeCoords[0][1];
            const lat2 = routeCoords[1][0], lon2 = routeCoords[1][1];
            const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
            isCarRoute = distance < 500; // Less than 500km = likely road trip
            console.log('[Day Header Map] Distance:', distance.toFixed(0), 'km, isCarRoute:', isCarRoute);
        }
        
        if (routeCoords.length > 1) {
            if (isCarRoute) {
                // Try to get driving route
                console.log('[Day Header Map] Fetching driving route...');
                this.fetchDrivingRoute(routeCoords, map, header);
            } else {
                // Draw straight line for flights
                L.polyline(routeCoords, {
                    color: '#ff6b6b',
                    weight: 3,
                    opacity: 0.8,
                    dashArray: '10, 10' // Dashed for flights
                }).addTo(map);
            }
        }

        // Add markers for start and end
        if (routeCoords.length > 0) {
            // Start marker (green)
            L.circleMarker(routeCoords[0], {
                radius: 8,
                fillColor: '#10b981',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            }).addTo(map);
            
            // End marker (red) - only if different from start
            if (routeCoords.length > 1) {
                L.circleMarker(routeCoords[routeCoords.length - 1], {
                    radius: 8,
                    fillColor: '#ef4444',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                }).addTo(map);
            }
        }

        // Fit bounds with better padding to show the whole route
        const bounds = L.latLngBounds(routeCoords);
        const zoomLevel = header._mapZoom || null; // Use custom zoom if set
        
        if (zoomLevel) {
            // Use custom zoom level
            const center = bounds.getCenter();
            map.setView(center, zoomLevel);
        } else {
            // Auto-fit with generous padding
            map.fitBounds(bounds, { 
                padding: [50, 50],
                maxZoom: 10 // Don't zoom in too much
            });
        }

        header._dayMap = map;
        console.log('[Day Header Map] Created map for day', currentDay, 'with', routePoints.length, 'points');
    }

    static calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula to calculate distance between two points
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    static async fetchDrivingRoute(routeCoords, map, header) {
        if (routeCoords.length < 2) return;
        
        try {
            // Use OpenRouteService for driving directions
            const start = routeCoords[0];
            const end = routeCoords[routeCoords.length - 1];
            
            // For now, use a simpler approach with OSRM (no API key needed)
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
            
            const response = await fetch(osrmUrl);
            const data = await response.json();
            
            if (data.code === 'Ok' && data.routes && data.routes[0]) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                
                // Draw the driving route
                L.polyline(coordinates, {
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.8
                }).addTo(map);
                
                // Calculate distance in km and duration
                const distanceKm = (route.distance / 1000).toFixed(0);
                const durationMinutes = Math.round(route.duration / 60);
                const hours = Math.floor(durationMinutes / 60);
                const minutes = durationMinutes % 60;
                const durationText = hours > 0 ? `${hours}u ${minutes}min` : `${minutes}min`;
                
                console.log('[Day Header Map] Driving route:', distanceKm, 'km,', durationText);
                
                // Update the header with distance and duration
                if (header) {
                    header._distance = distanceKm;
                    header._travelTime = durationText;
                    
                    // Update the UI with retry logic
                    const updateUI = (attempt = 1) => {
                        const distanceEl = header.querySelector('.route-distance');
                        const timeEl = header.querySelector('.route-time');
                        
                        if (distanceEl && timeEl) {
                            // Find the contenteditable spans inside
                            const distanceSpan = distanceEl.querySelector('span[contenteditable]');
                            const timeSpan = timeEl.querySelector('span[contenteditable]');
                            
                            if (distanceSpan) {
                                distanceSpan.textContent = `${distanceKm} km`;
                            } else {
                                distanceEl.innerHTML = `<i class="fas fa-road"></i> <span contenteditable="true">${distanceKm} km</span>`;
                            }
                            
                            if (timeSpan) {
                                timeSpan.textContent = durationText;
                            } else {
                                timeEl.innerHTML = `<i class="fas fa-clock"></i> <span contenteditable="true">${durationText}</span>`;
                            }
                            
                            console.log('[Day Header Map] ✅ UI updated:', distanceKm, 'km,', durationText);
                        } else if (attempt < 5) {
                            // Retry after a short delay (elements might not be in DOM yet)
                            console.log(`[Day Header Map] ⏳ Retry ${attempt}/5 - elements not ready`);
                            setTimeout(() => updateUI(attempt + 1), 100);
                        } else {
                            console.error('[Day Header Map] ❌ Failed to update UI after 5 attempts');
                        }
                    };
                    
                    updateUI();
                }
                
            } else {
                // Fallback to straight line
                console.warn('[Day Header Map] Could not fetch driving route, using straight line');
                L.polyline(routeCoords, {
                    color: '#3b82f6',
                    weight: 3,
                    opacity: 0.8
                }).addTo(map);
            }
        } catch (error) {
            console.error('[Day Header Map] Error fetching driving route:', error);
            // Fallback to straight line
            L.polyline(routeCoords, {
                color: '#3b82f6',
                weight: 3,
                opacity: 0.8
            }).addTo(map);
        }
    }

    static updateMiniRoadmap(header, currentDay, destinations) {
        const roadmap = header.querySelector('.day-mini-roadmap');
        if (!roadmap || destinations.length === 0) return;

        let html = '<div class="roadmap-dots">';
        
        destinations.forEach((dest, idx) => {
            const isActive = currentDay >= dest.fromDay && currentDay <= dest.toDay;
            const isPast = currentDay > dest.toDay;
            const isFuture = currentDay < dest.fromDay;
            
            let dotClass = 'roadmap-dot';
            if (isActive) dotClass += ' active';
            if (isPast) dotClass += ' past';
            if (isFuture) dotClass += ' future';
            
            html += `
                <div class="roadmap-item">
                    <div class="${dotClass}">${idx + 1}</div>
                    <span class="roadmap-label">${dest.name}</span>
                </div>
            `;
            
            // Add connector line if not last
            if (idx < destinations.length - 1) {
                html += '<div class="roadmap-line"></div>';
            }
        });
        
        html += '</div>';
        roadmap.innerHTML = html;
    }

    static applyDayDisplayMode(dayHeader, mode) {
        // Find all cards between this day header and the next one
        const cards = [];
        let nextElement = dayHeader.nextElementSibling;
        
        while (nextElement && !nextElement.classList.contains('wb-travel-day-header')) {
            if (nextElement.classList.contains('wb-travel-card')) {
                cards.push(nextElement);
            }
            nextElement = nextElement.nextElementSibling;
        }

        // Apply mode to cards
        cards.forEach(card => {
            card.classList.remove('display-standard', 'display-accordion', 'display-compact');
            card.classList.add(`display-${mode}`);
            
            // Remove existing expand button if any
            const existingBtn = card.querySelector('.card-expand-btn');
            if (existingBtn) existingBtn.remove();
            
            // Add expand button for compact mode
            if (mode === 'compact') {
                const expandBtn = document.createElement('button');
                expandBtn.className = 'card-expand-btn';
                expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                expandBtn.title = 'Uitklappen';
                expandBtn.onclick = (e) => {
                    e.stopPropagation();
                    card.classList.toggle('expanded');
                    expandBtn.innerHTML = card.classList.contains('expanded') 
                        ? '<i class="fas fa-chevron-up"></i>' 
                        : '<i class="fas fa-chevron-down"></i>';
                };
                card.appendChild(expandBtn);
            }
        });

        // For accordion mode, add toggle functionality
        if (mode === 'accordion') {
            dayHeader.classList.add('accordion-mode');
            dayHeader.onclick = (e) => {
                if (e.target.closest('.toolbar-btn') || e.target.closest('.day-display-mode')) return;
                dayHeader.classList.toggle('expanded');
                cards.forEach(card => {
                    card.style.display = dayHeader.classList.contains('expanded') ? 'block' : 'none';
                });
            };
            // Start collapsed
            if (!dayHeader.classList.contains('expanded')) {
                cards.forEach(card => card.style.display = 'none');
            }
        } else {
            dayHeader.classList.remove('accordion-mode', 'expanded');
            dayHeader.onclick = null;
            cards.forEach(card => card.style.display = 'block');
        }
    }

    // Travel Timeline Container
    static createTravelTimeline(options = {}) {
        const timeline = document.createElement('section');
        timeline.className = 'wb-component wb-travel-timeline';
        timeline.setAttribute('data-component', 'travel-timeline');
        timeline.id = this.generateId('travel_timeline');

        const toolbar = this.createToolbar();
        timeline.appendChild(toolbar);
        this.addTypeBadge(timeline);

        // Add example content
        const day1 = this.createTravelDayHeader({ dayNumber: 1, dayTitle: 'Dag 1', dayDescription: 'Aankomst' });
        const transport1 = this.createTravelCardTransport({});
        const transfer1 = this.createTravelCardTransfer({});
        const hotel1 = this.createTravelCardHotel({});

        timeline.appendChild(day1);
        timeline.appendChild(transport1);
        timeline.appendChild(transfer1);
        timeline.appendChild(hotel1);

        this.makeSelectable(timeline);
        return timeline;
    }

    static createContainer(options = {}) {
        const container = document.createElement('div');
        container.className = 'wb-component wb-container empty';
        container.setAttribute('data-component', 'container');
        container.id = this.generateId('container');
        
        // Toolbar
        const toolbar = this.createToolbar();
        container.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(container);
        
        // Drop zone
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone-small';
        dropZone.innerHTML = '<i class="fas fa-plus"></i> Sleep componenten hier';
        container.appendChild(dropZone);
        
        this.makeDroppable(container);
        this.makeSelectable(container);
        
        return container;
    }

    static createRow(options = {}) {
        const row = document.createElement('div');
        row.className = 'wb-component wb-row empty';
        row.setAttribute('data-component', 'row');
        row.id = this.generateId('row');
        
        // Toolbar
        const toolbar = this.createToolbar();
        row.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(row);
        
        // Default columns
        const columnsCount = options.columns || 2;
        for (let i = 0; i < columnsCount; i++) {
            const column = this.createColumn();
            row.appendChild(column);
        }
        
        this.makeSelectable(row);
        
        return row;
    }

    static createColumn(options = {}) {
        const column = document.createElement('div');
        column.className = 'wb-component wb-column empty';
        column.setAttribute('data-component', 'column');
        column.id = this.generateId('column');
        
        // Toolbar
        const toolbar = this.createToolbar();
        column.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(column);
        
        // Drop zone
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone-small';
        dropZone.innerHTML = '<i class="fas fa-plus"></i> Voeg content toe';
        column.appendChild(dropZone);
        
        this.makeDroppable(column);
        this.makeSelectable(column);
        
        return column;
    }

    static createHeading(options = {}) {
        const level = options.level || 'h2';
        const text = options.text || 'Nieuwe titel';
        
        const heading = document.createElement(level);
        heading.className = `wb-component wb-heading ${level}`;
        heading.setAttribute('data-component', 'heading');
        heading.id = this.generateId('heading');
        heading.textContent = text;
        heading.contentEditable = true;
        
        // Toolbar
        const toolbar = this.createToolbar();
        heading.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(heading);
        
        this.makeSelectable(heading);
        this.makeEditable(heading);
        
        return heading;
    }

    static createText(options = {}) {
        const text = options.text || 'Klik om te bewerken. Dit is een tekst paragraaf die je kunt aanpassen naar je eigen wensen.';
        
        const paragraph = document.createElement('p');
        paragraph.className = 'wb-component wb-text editable';
        paragraph.setAttribute('data-component', 'text');
        paragraph.id = this.generateId('text');
        paragraph.textContent = text;
        paragraph.contentEditable = true;
        
        // Toolbar
        const toolbar = this.createToolbar();
        paragraph.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(paragraph);
        
        this.makeSelectable(paragraph);
        this.makeEditable(paragraph);
        
        return paragraph;
    }

    static createImage(options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'wb-component wb-image placeholder';
        wrapper.setAttribute('data-component', 'image');
        wrapper.id = this.generateId('image');
        
        // Toolbar
        const toolbar = this.createToolbar();
        wrapper.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(wrapper);
        
        // Placeholder content
        const icon = document.createElement('i');
        icon.className = 'fas fa-image';
        
        const text = document.createElement('p');
        text.textContent = 'Klik om een afbeelding toe te voegen';
        
        wrapper.appendChild(icon);
        wrapper.appendChild(text);
        
        // Click to choose media via MediaPicker
        wrapper.addEventListener('click', async () => {
            try {
                const result = await window.MediaPicker.openImage();
                const src = result.dataUrl || result.url;
                if (!src) return;

                wrapper.className = 'wb-component wb-image';
                wrapper.innerHTML = '';
                wrapper.appendChild(toolbar);

                const img = document.createElement('img');
                img.src = src;
                img.alt = 'Selected image';
                wrapper.appendChild(img);
            } catch (err) {
                console.warn('MediaPicker canceled or failed', err);
            }
        });
        
        this.makeSelectable(wrapper);
        
        return wrapper;
    }

    // Feature + Media block: text with image/video on left or right
    static createFeatureMedia(options = {}) {
        const position = options.position === 'right' ? 'right' : 'left'; // default left
        const mediaType = options.mediaType === 'video' ? 'video' : 'image';
        const label = options.label || 'Onze expertise';
        const title = options.title || 'Waarom kiezen voor ons?';
        const subtitle = options.subtitle || 'Subtitel met een korte samenvatting om context te geven.';
        const text = options.text || 'Korte toelichting over deze feature sectie. Deze tekst is bewerkbaar.';
        const features = options.features || [
            { icon: 'fa-check', label: 'Betrouwbare service' },
            { icon: 'fa-check', label: 'Persoonlijke aanpak' },
            { icon: 'fa-check', label: 'Scherpe prijzen' }
        ];

        const section = document.createElement('section');
        section.className = `wb-component wb-feature-media ${position}`;
        section.setAttribute('data-component', 'feature-media');
        section.id = this.generateId('feature_media');

        // Toolbar
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(section);

        const inner = document.createElement('div');
        inner.className = 'fm-inner';

        const media = document.createElement('div');
        // Add a default depth class for subtle 3D effect; user can change via Properties
        media.className = 'fm-media depth-2';

        const content = document.createElement('div');
        content.className = 'fm-content';

        // Declare chooser reference early to avoid TDZ in helper functions
        let mediaChooser;

        // Helper to (re)open media picker
        // helper for responsive Unsplash images
        const applyResponsiveSrc = (imageEl, url) => {
            try {
                const u = new URL(url);
                if (u.hostname.includes('images.unsplash.com')) {
                    const base = `${u.origin}${u.pathname}`;
                    const params = u.searchParams;
                    const q = params.get('q') || '80';
                    const auto = params.get('auto') || 'format';
                    const fit = params.get('fit') || 'crop';
                    const src1200 = `${base}?q=${q}&w=1200&auto=${auto}&fit=${fit}`;
                    const src1800 = `${base}?q=${q}&w=1800&auto=${auto}&fit=${fit}`;
                    const src2400 = `${base}?q=${q}&w=2400&auto=${auto}&fit=${fit}`;
                    imageEl.src = src1200;
                    imageEl.srcset = `${src1200} 1200w, ${src1800} 1800w, ${src2400} 2400w`;
                    imageEl.sizes = '100vw';
                    return;
                }
            } catch (e) {}
            imageEl.src = url;
        };

        const openImagePicker = async () => {
            try {
                let src = '';
                if (window.MediaPicker && typeof window.MediaPicker.openImage === 'function') {
                    const result = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    src = result.fullUrl || result.regularUrl || result.dataUrl || result.url || '';
                } else {
                    // Fallback: native file input
                    await new Promise((resolve) => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return resolve();
                            const reader = new FileReader();
                            reader.onload = (ev) => { src = ev.target.result; resolve(); };
                            reader.readAsDataURL(file);
                        };
                        input.click();
                    });
                }
                if (!src) return;
                media.innerHTML = '';
                const img = document.createElement('img');
                __WB_applyResponsiveSrc(img, src);
                img.alt = 'Feature media';
                media.appendChild(img);
                if (mediaChooser) media.appendChild(mediaChooser); // keep chooser overlay
            } catch(err) { console.warn('Image select canceled/failed', err); }
        };

        // Media placeholder according to type
        if (mediaType === 'video') {
            const ph = document.createElement('div');
            ph.className = 'fm-video placeholder';
            ph.innerHTML = '<i class="fas fa-video"></i><span> Klik om video te kiezen</span>';
            ph.addEventListener('click', (e) => { e.stopPropagation(); openVideoPicker(); });
            media.appendChild(ph);
        } else {
            const ph = document.createElement('div');
            ph.className = 'fm-image placeholder';
            ph.innerHTML = '<i class="fas fa-image"></i><span> Klik om afbeelding te kiezen</span>';
            ph.addEventListener('click', (e) => { e.stopPropagation(); openImagePicker(); });
            media.appendChild(ph);
        }

        // Also open pickers if clicking the media area while placeholder is present
        media.addEventListener('click', (e) => {
            const hasImagePh = !!media.querySelector('.fm-image.placeholder');
            const hasVideoPh = !!media.querySelector('.fm-video.placeholder');
            if (hasImagePh) { e.stopPropagation(); openImagePicker(); }
            else if (hasVideoPh) { e.stopPropagation(); openVideoPicker(); }
        });

        // Media chooser overlay button (always present)
        mediaChooser = document.createElement('button');
        mediaChooser.type = 'button';
        mediaChooser.className = 'fm-media-chooser';
        mediaChooser.innerHTML = `<i class="fas ${mediaType === 'video' ? 'fa-video' : 'fa-camera'}"></i>`;
        mediaChooser.title = mediaType === 'video' ? 'Video wijzigen' : 'Afbeelding wijzigen';
        mediaChooser.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mediaType === 'video') return openVideoPicker();
            return openImagePicker();
        });
        media.appendChild(mediaChooser);

        // Textual content
        const labelEl = document.createElement('div');
        labelEl.className = 'fm-label';
        labelEl.textContent = label;

        const h2 = document.createElement('h2');
        h2.className = 'fm-title';
        h2.textContent = title;
        h2.contentEditable = true;

        const sub = document.createElement('p');
        sub.className = 'fm-subtitle';
        sub.textContent = subtitle;
        sub.contentEditable = true;

        const p = document.createElement('p');
        p.className = 'fm-text';
        p.textContent = text;
        p.contentEditable = true;

        const list = document.createElement('ul');
        list.className = 'fm-features';
        features.forEach(f => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas ${f.icon}"></i><span contenteditable="true">${f.label}</span>`;
            list.appendChild(li);
        });

        // Order according to position
        if (position === 'right') {
            inner.appendChild(content);
            inner.appendChild(media);
        } else {
            inner.appendChild(media);
            inner.appendChild(content);
        }

        content.appendChild(labelEl);
        content.appendChild(h2);
        content.appendChild(sub);
        content.appendChild(p);
        content.appendChild(list);

        // CTA bar
        const cta = document.createElement('div');
        cta.className = 'fm-cta';
        cta.innerHTML = `
            <a class="btn btn-primary" href="#" target="_blank"><span contenteditable="true">Plan een gesprek</span></a>
            <a class="btn btn-secondary outline" href="#" target="_blank"><span contenteditable="true">Meer info</span></a>
        `;
        // Allow double-click to set link
        cta.querySelectorAll('a.btn').forEach(a => {
            a.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const current = a.getAttribute('href') || '';
                const url = prompt('Voer een link URL in (bijv. https://voorbeeld.nl):', current);
                if (url !== null) {
                    a.setAttribute('href', url || '#');
                }
            });
        });
        content.appendChild(cta);

        section.appendChild(inner);

        // Interactions
        this.makeSelectable(section);
        this.makeEditable(h2);
        this.makeEditable(sub);
        this.makeEditable(p);

        return section;
    }

    static createButton(options = {}) {
        const text = options.text || 'Klik hier';
        const style = options.style || 'primary';
        
        const wrapper = document.createElement('div');
        wrapper.className = `wb-component wb-button ${style}`;
        wrapper.setAttribute('data-component', 'button');
        wrapper.id = this.generateId('button');
        
        // Toolbar
        const toolbar = this.createToolbar();
        wrapper.appendChild(toolbar);
        
        const button = document.createElement('button');
        button.textContent = text;
        button.contentEditable = true;
        
        wrapper.appendChild(button);
        
        this.makeSelectable(wrapper);
        this.makeEditable(button);
        
        return wrapper;
    }

    static createVideo(options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'wb-component wb-video placeholder';
        wrapper.setAttribute('data-component', 'video');
        wrapper.id = this.generateId('video');
        
        // Toolbar
        const toolbar = this.createToolbar();
        wrapper.appendChild(toolbar);
        
        // Placeholder content
        const icon = document.createElement('i');
        icon.className = 'fas fa-video';
        
        const text = document.createElement('span');
        text.textContent = 'Klik om video URL toe te voegen';
        
        wrapper.appendChild(icon);
        wrapper.appendChild(text);
        
        // Click to add video via MediaPicker
        wrapper.addEventListener('click', async () => {
            try {
                const result = await window.MediaPicker.openVideo();
                let url = '';
                if (result.embedUrl) {
                    url = result.embedUrl;
                } else if (result.url) {
                    url = result.url;
                }
                if (!url) return;
                this.embedVideo(wrapper, url, toolbar);
            } catch (err) {
                console.warn('MediaPicker canceled or failed', err);
            }
        });
        
        this.makeSelectable(wrapper);
        
        return wrapper;
    }

    static createGallery(options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'wb-component wb-gallery placeholder';
        wrapper.setAttribute('data-component', 'gallery');
        wrapper.id = this.generateId('gallery');
        
        // Toolbar
        const toolbar = this.createToolbar();
        wrapper.appendChild(toolbar);
        
        // Placeholder content
        const icon = document.createElement('i');
        icon.className = 'fas fa-images';
        
        const text = document.createElement('p');
        text.textContent = 'Klik om afbeeldingen toe te voegen';
        
        wrapper.appendChild(icon);
        wrapper.appendChild(text);
        
        // Click to upload multiple images
        wrapper.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.onchange = (e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                    this.createImageGallery(wrapper, files, toolbar);
                }
            };
            input.click();
        });
        
        this.makeSelectable(wrapper);
        
        return wrapper;
    }

    // Helper methods
    static createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'component-toolbar';

        const editBtn = document.createElement('button');
        editBtn.className = 'toolbar-btn';
        editBtn.setAttribute('data-action', 'edit');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Bewerken';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'toolbar-btn';
        copyBtn.setAttribute('data-action', 'copy');
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = 'KopiÃƒÂ«ren';

        // Move Up/Down buttons
        const upBtn = document.createElement('button');
        upBtn.className = 'toolbar-btn';
        upBtn.setAttribute('data-action', 'move-up');
        upBtn.title = 'Omhoog verplaatsen';
        upBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';

        const downBtn = document.createElement('button');
        downBtn.className = 'toolbar-btn';
        downBtn.setAttribute('data-action', 'move-down');
        downBtn.title = 'Omlaag verplaatsen';
        downBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';

        // AI Fill button (for content blocks)
        const aiBtn = document.createElement('button');
        aiBtn.className = 'toolbar-btn toolbar-btn-ai';
        aiBtn.setAttribute('data-action', 'ai-fill');
        aiBtn.title = 'AI vullen';
        aiBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i>';
        aiBtn.style.cssText = 'background:#8b5cf6;color:#fff;';

        // Copy handler
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const component = toolbar.parentElement;
            const clone = component.cloneNode(true);
            clone.id = ComponentFactory.generateId(clone.getAttribute('data-component'));
            component.parentElement.insertBefore(clone, component.nextSibling);
            // Rebind toolbar events on the clone
            ComponentFactory.rebindToolbar(clone);
            ComponentFactory.makeSelectable(clone);
        });

        // Move handlers
        const moveUp = (component) => {
            const parent = component?.parentElement; if (!parent) return;
            let prev = component.previousElementSibling;
            while (prev && !prev.classList.contains('wb-component')) prev = prev.previousElementSibling;
            if (prev) parent.insertBefore(component, prev);
            try { window.dragDropManager?.saveState?.(); } catch (e) {}
            try { component.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
            component.classList.add('selected');
        };
        const moveDown = (component) => {
            const parent = component?.parentElement; if (!parent) return;
            let next = component.nextElementSibling;
            while (next && !next.classList.contains('wb-component')) next = next.nextElementSibling;
            if (next) parent.insertBefore(next, component);
            try { window.dragDropManager?.saveState?.(); } catch (e) {}
            try { component.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
            component.classList.add('selected');
        };
        upBtn.addEventListener('click', (e) => { e.stopPropagation(); const comp = toolbar.parentElement; moveUp(comp); });
        downBtn.addEventListener('click', (e) => { e.stopPropagation(); const comp = toolbar.parentElement; moveDown(comp); });

        // AI handler
        aiBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const component = toolbar.parentElement;
            try {
                await ComponentFactory.fillWithAI(component);
            } catch (err) {
                console.warn('AI fill failed', err);
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('AI vullen mislukt', 'error');
                }
            }
        });

        toolbar.appendChild(editBtn);
        toolbar.appendChild(copyBtn);
        toolbar.appendChild(upBtn);
        toolbar.appendChild(downBtn);
        toolbar.appendChild(aiBtn);
        
        return toolbar;
    }

    static addTypeBadge(element) {
        try {
            const type = element.getAttribute('data-component') || '';
            const map = {
                'container': 'fa-square',
                'row': 'fa-grip-lines',
                'column': 'fa-columns',
                'heading': 'fa-heading',
                'text': 'fa-paragraph',
                'image': 'fa-image',
                'button': 'fa-mouse-pointer',
                'video': 'fa-video',
                'gallery': 'fa-images',
                'hero-travel': 'fa-mountain-sun',
                'feature-media': 'fa-square-split-horizontal',
                'feature-highlight': 'fa-image',
                'feature-icon-image': 'fa-image-portrait',
                'travel-types': 'fa-th-large',
                'contact-info': 'fa-address-card',
                'contact-map-cta': 'fa-map-location-dot',
                'media-row': 'fa-images',
                'news-article': 'fa-newspaper'
            };
            const icon = map[type];
            if (!icon) return;
            // Remove existing badge if any (e.g., on clone)
            element.querySelector('.wb-type-badge')?.remove();
            const badge = document.createElement('div');
            badge.className = 'wb-type-badge';
            badge.innerHTML = `<i class="fas ${icon}"></i>`;
            element.appendChild(badge);
        } catch (e) { /* noop */ }
    }

    static makeDroppable(element) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        });
        
        element.addEventListener('dragleave', (e) => {
            if (!element.contains(e.relatedTarget)) {
                element.classList.remove('drag-over');
            }
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            
            const componentType = e.dataTransfer.getData('text/plain');
            if (componentType) {
                const newComponent = this.createComponent(componentType);
                if (newComponent) {
                    // Remove empty class and drop zone
                    element.classList.remove('empty');
                    const dropZone = element.querySelector('.drop-zone-small');
                    if (dropZone) {
                        dropZone.remove();
                    }
                    
                    element.appendChild(newComponent);
                    newComponent.classList.add('fade-in');
                }
            }
        });
    }

    static makeSelectable(element) {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Remove selection from other elements
            document.querySelectorAll('.wb-component.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Select this element
            element.classList.add('selected');
            
            // Update properties panel
            if (window.PropertiesPanel) {
                try { ComponentFactory.ensureApiFor(element); } catch (e) {}
                window.PropertiesPanel.showProperties(element);
            }
        });
    }

    static makeEditable(element) {
        element.addEventListener('blur', () => {
            // Save changes when element loses focus
            console.log('Content updated:', element.textContent);
        });
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
            }
        });
    }

    static embedVideo(wrapper, url, toolbar) {
        let embedUrl = '';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = this.extractYouTubeId(url);
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('vimeo.com')) {
            const videoId = this.extractVimeoId(url);
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
        
        if (embedUrl) {
            wrapper.className = 'wb-component wb-video';
            wrapper.innerHTML = '';
            wrapper.appendChild(toolbar);
            
            const isEditMode = !!(document.body && document.body.dataset && document.body.dataset.wbMode === 'edit');
            try {
                const u = new URL(embedUrl);
                const p = u.searchParams;
                const isYT = /youtube\.com|youtu\.be/.test(u.href);
                const isVimeo = /vimeo\.com/.test(u.href);
                // Controls: on in editor, minimal in view
                p.set('controls', isEditMode ? '1' : (isYT ? '0' : p.get('controls') || '0'));
                // Autoplay/loop/mute
                p.set('autoplay', isEditMode ? '0' : '1');
                p.set('loop', isEditMode ? '0' : '1');
                if (isYT) {
                    p.set('playsinline', '1');
                    if (!p.has('mute')) p.set('mute', '1');
                    // For YouTube loop to work reliably, playlist must equal video id
                    const m = u.pathname.match(/\/embed\/([^\/?#]+)/);
                    if (!isEditMode && m && !p.has('playlist')) p.set('playlist', m[1]);
                }
                if (isVimeo) {
                    // Vimeo-specific safe params
                    if (!p.has('muted')) p.set('muted', isEditMode ? '0' : '1');
                    if (!p.has('background')) p.set('background', isEditMode ? '0' : '1');
                }
                u.search = p.toString();
                embedUrl = u.toString();
            } catch (e) {}

            const iframe = document.createElement('iframe');
            iframe.setAttribute('title', 'Embedded Video');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            try { iframe.dataset.src = embedUrl; } catch (e) {}

            // Lazy-load when visible
            try {
                const io = new IntersectionObserver((entries, obs) => {
                    entries.forEach(en => {
                        if (en.isIntersecting) {
                            try {
                                if (iframe.dataset && iframe.dataset.src) iframe.src = iframe.dataset.src; else iframe.src = embedUrl;
                            } catch (e) { iframe.src = embedUrl; }
                            try { obs.disconnect(); } catch (e) {}
                        }
                    });
                }, { root: null, threshold: 0.1 });
                io.observe(wrapper);
            } catch (e) {
                setTimeout(() => { try { if (!iframe.src) iframe.src = embedUrl; } catch (e) {} }, 0);
            }

            wrapper.appendChild(iframe);
        }
    }

    static createImageGallery(wrapper, files, toolbar) {
        wrapper.className = 'wb-component wb-gallery';
        wrapper.innerHTML = '';
        wrapper.appendChild(toolbar);
        
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                
                item.appendChild(img);
                grid.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
        
        wrapper.appendChild(grid);
    }

    static extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : '';
    }

    static extractVimeoId(url) {
        const regex = /vimeo\.com\/(\d+)/;
        const match = url.match(regex);
        return match ? match[1] : '';
    }

    static generateId(type) {
        return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Replace an element's toolbar with a fresh, wired toolbar
    static rebindToolbar(element) {
        const oldTb = element.querySelector('.component-toolbar');
        const newTb = this.createToolbar();
        if (oldTb) {
            oldTb.replaceWith(newTb);
        } else {
            element.insertBefore(newTb, element.firstChild);
        }
    }

    // Ensure legacy/loaded elements have their API attached for Properties panel
    static ensureApiFor(el) {
        try {
            if (!el || !el.getAttribute) return;
            const type = el.getAttribute('data-component');
            if (type === 'content-flex' && !el.__contentFlexApi) {
                const section = el;
                const h1 = section.querySelector('.cf-title') || section.querySelector('h1, .wb-heading, .cf-header h1');
                const h2 = section.querySelector('.cf-subtitle') || section.querySelector('h2, .cf-header h2');
                const body = section.querySelector('.cf-body') || section.querySelector('.cf-text, .cf-content');
                const applyLayout = () => {
                    section.classList.toggle('layout-none', section._layout === 'none');
                    section.classList.toggle('layout-left', section._layout === 'left');
                    section.classList.toggle('layout-right', section._layout === 'right');
                    section.classList.toggle('layout-both', section._layout === 'both');
                };
                const applyStyles = () => {
                    if (section._imgHeight != null) section.style.setProperty('--cf-img-height', section._imgHeight + 'px');
                    if (section._radius != null) section.style.setProperty('--cf-radius', section._radius + 'px');
                    section.classList.toggle('cf-shadow', !!section._shadow);
                };
                const findLeftImg = () => section.querySelector('.cf-left img') || section.querySelector('.cf-media-left img') || section.querySelector('img');
                const findRightImg = () => section.querySelector('.cf-right img') || section.querySelector('.cf-media-right img') || (section.querySelectorAll('img')[1] || section.querySelector('img'));
                el.__contentFlexApi = {
                    setTitle: (t) => { if (h1) h1.textContent = t || ''; },
                    setSubtitle: (t) => { if (h2) h2.textContent = t || ''; },
                    setBodyHtml: (html) => { if (body) body.innerHTML = html || ''; },
                    setLayout: (mode) => { section._layout = ['none','left','right','both'].includes(mode) ? mode : 'none'; applyLayout(); },
                    setEdgeToEdge: (on) => { section.classList.toggle('edge-to-edge', !!on); },
                    setImageHeight: (px) => { section._imgHeight = Math.max(120, parseInt(px,10) || 260); applyStyles(); },
                    setRadius: (px) => { section._radius = Math.max(0, parseInt(px,10) || 0); applyStyles(); },
                    setShadow: (on) => { section._shadow = !!on; applyStyles(); },
                    pickLeft: async () => {
                        try { if (!window.MediaPicker) return; const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' }); const u = r?.fullUrl || r?.regularUrl || r?.url || r?.dataUrl; const img = findLeftImg(); if (u && img) { if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(img, u); else img.src = u; } } catch (e) {}
                    },
                    pickRight: async () => {
                        try { if (!window.MediaPicker) return; const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' }); const u = r?.fullUrl || r?.regularUrl || r?.url || r?.dataUrl; const img = findRightImg(); if (u && img) { if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(img, u); else img.src = u; } } catch (e) {}
                    }
                };
                // Best effort: infer current state for layout/styles
                if (!section._layout) {
                    if (section.classList.contains('layout-left')) section._layout = 'left';
                    else if (section.classList.contains('layout-right')) section._layout = 'right';
                    else if (section.classList.contains('layout-both')) section._layout = 'both';
                    else section._layout = 'none';
                }
                try { applyLayout(); applyStyles(); } catch (e) {}
            }
        } catch (e) {}
    }

    // AI Fill: Generate content based on block context
    static async fillWithAI(component) {
        if (!component) return;
        
        const type = component.getAttribute('data-component');
        if (!type) return;

        // Check if AI module is available
        if (!window.BuilderAI || typeof window.BuilderAI.generate !== 'function') {
            alert('AI module niet geladen');
            return;
        }

        // Get page context
        const pageTitle = (()=>{
            try {
                const input = document.getElementById('pageTitleInput');
                if (input && input.value) return input.value;
                const h1 = document.querySelector('.na-title');
                if (h1) return h1.textContent.trim();
                return 'Pagina';
            } catch (e) { return 'Pagina'; }
        })();

        // Handle different component types
        if (type === 'content-flex') {
            await this._fillContentFlex(component, pageTitle);
        } else if (type === 'feature-media') {
            await this._fillFeatureMedia(component, pageTitle);
        } else if (type === 'feature-highlight') {
            await this._fillFeatureHighlight(component, pageTitle);
        } else if (type === 'news-article') {
            await this._fillNewsArticle(component, pageTitle);
        } else {
            console.warn('AI fill not supported for', type);
        }
    }

    static async _fillContentFlex(component, pageTitle) {
        const titleEl = component.querySelector('.cf-title');
        const subtitleEl = component.querySelector('.cf-subtitle');
        const bodyEl = component.querySelector('.cf-body');
        
        if (!bodyEl) return;

        let title = (titleEl && titleEl.textContent) ? titleEl.textContent.trim() : '';
        let subtitle = (subtitleEl && subtitleEl.textContent) ? subtitleEl.textContent.trim() : '';
        
        // If title is empty or generic, ask user for topic
        if (!title || title === 'Titel' || title === 'Title' || title.length < 3) {
            const userTopic = prompt('Waarover wil je tekst genereren?', title || '');
            if (!userTopic || !userTopic.trim()) {
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('Geannuleerd', 'info');
                }
                return;
            }
            title = userTopic.trim();
            // Update the title element with user input
            if (titleEl) titleEl.textContent = title;
        }
        
        // Show loading state
        const originalHtml = bodyEl.innerHTML;
        bodyEl.innerHTML = '<p style="color:#8b5cf6;"><i class="fas fa-circle-notch fa-spin"></i> AI genereert tekst...</p>';
        
        try {
            const result = await window.BuilderAI.generate('content_block', {
                page_title: pageTitle,
                section_title: title,
                subtitle: subtitle,
                language: 'nl',
                tone: 'professional'
            });

            const text = result?.text || result?.content_block?.text || result?.content || '';
            if (text) {
                // Convert to paragraphs
                const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('');
                bodyEl.innerHTML = paragraphs || originalHtml;
                
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('✨ AI tekst gegenereerd', 'success');
                }
            } else {
                throw new Error('Geen tekst ontvangen');
            }
        } catch (err) {
            console.warn('AI fill failed', err);
            bodyEl.innerHTML = originalHtml;
            if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                window.websiteBuilder.showNotification('AI genereren mislukt', 'error');
            }
        }
    }

    static async _fillFeatureMedia(component, pageTitle) {
        const titleEl = component.querySelector('h2, h3, .fm-title');
        const bodyEl = component.querySelector('p, .fm-body, .fm-text');
        
        if (!bodyEl) return;

        let title = (titleEl && titleEl.textContent) ? titleEl.textContent.trim() : '';
        
        // If title is empty or generic, ask user for topic
        if (!title || title === 'Titel' || title === 'Title' || title.length < 3) {
            const userTopic = prompt('Waarover wil je tekst genereren?', title || '');
            if (!userTopic || !userTopic.trim()) {
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('Geannuleerd', 'info');
                }
                return;
            }
            title = userTopic.trim();
            if (titleEl) titleEl.textContent = title;
        }
        
        const originalText = bodyEl.textContent;
        bodyEl.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> AI genereert...';
        
        try {
            const result = await window.BuilderAI.generate('feature_description', {
                page_title: pageTitle,
                feature_title: title,
                language: 'nl',
                length: 'medium'
            });

            const text = result?.text || result?.feature_description?.text || '';
            if (text) {
                bodyEl.textContent = text;
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('✨ AI tekst gegenereerd', 'success');
                }
            } else {
                throw new Error('Geen tekst ontvangen');
            }
        } catch (err) {
            console.warn('AI fill failed', err);
            bodyEl.textContent = originalText;
            if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                window.websiteBuilder.showNotification('AI genereren mislukt', 'error');
            }
        }
    }

    static async _fillFeatureHighlight(component, pageTitle) {
        const titleEl = component.querySelector('h2, h3');
        const listEl = component.querySelector('ul');
        
        if (!listEl) return;

        let title = (titleEl && titleEl.textContent) ? titleEl.textContent.trim() : '';
        
        // If title is empty or generic, ask user for topic
        if (!title || title === 'Titel' || title === 'Title' || title.length < 3) {
            const userTopic = prompt('Waarover wil je een lijst genereren?', title || '');
            if (!userTopic || !userTopic.trim()) {
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('Geannuleerd', 'info');
                }
                return;
            }
            title = userTopic.trim();
            if (titleEl) titleEl.textContent = title;
        }
        
        const originalHtml = listEl.innerHTML;
        listEl.innerHTML = '<li style="color:#8b5cf6;"><i class="fas fa-circle-notch fa-spin"></i> AI genereert...</li>';
        
        try {
            const result = await window.BuilderAI.generate('feature_list', {
                page_title: pageTitle,
                section_title: title,
                language: 'nl',
                count: 5
            });

            const items = result?.items || result?.feature_list || [];
            if (items.length) {
                listEl.innerHTML = items.map(item => {
                    const text = typeof item === 'string' ? item : (item.text || item.title || item.summary || '');
                    return `<li>${text}</li>`;
                }).join('');
                
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('✨ AI lijst gegenereerd', 'success');
                }
            } else {
                throw new Error('Geen items ontvangen');
            }
        } catch (err) {
            console.warn('AI fill failed', err);
            listEl.innerHTML = originalHtml;
            if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                window.websiteBuilder.showNotification('AI genereren mislukt', 'error');
            }
        }
    }

    static async _fillNewsArticle(component, pageTitle) {
        const titleEl = component.querySelector('.na-title');
        const bodyEl = component.querySelector('.na-body');
        
        if (!bodyEl) return;

        let title = (titleEl && titleEl.textContent) ? titleEl.textContent.trim() : pageTitle;
        
        // If title is empty or generic, ask user for topic
        if (!title || title === 'Titel' || title === 'Title' || title === 'Nieuw artikel' || title.length < 3) {
            const userTopic = prompt('Wat is het onderwerp van het nieuwsartikel?', title || '');
            if (!userTopic || !userTopic.trim()) {
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('Geannuleerd', 'info');
                }
                return;
            }
            title = userTopic.trim();
            if (titleEl) titleEl.textContent = title;
        }
        
        const originalHtml = bodyEl.innerHTML;
        bodyEl.innerHTML = '<p style="color:#8b5cf6;"><i class="fas fa-circle-notch fa-spin"></i> AI schrijft artikel...</p>';
        
        try {
            const result = await window.BuilderAI.generate('news_article', {
                title: title,
                language: 'nl',
                length: 'long'
            });

            const text = result?.text || result?.news_article?.text || result?.content || '';
            if (text) {
                const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('');
                bodyEl.innerHTML = paragraphs || originalHtml;
                
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('✨ AI artikel gegenereerd', 'success');
                }
            } else {
                throw new Error('Geen tekst ontvangen');
            }
        } catch (err) {
            console.warn('AI fill failed', err);
            bodyEl.innerHTML = originalHtml;
            if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                window.websiteBuilder.showNotification('AI genereren mislukt', 'error');
            }
        }
    }

    // Travel Hero - Interactive Map, Image, Video
    static createTravelHero(options = {}) {
        console.log('🔥 TRAVEL HERO V3 - MAP/IMAGE/VIDEO - 20 OKT 2025');
        const hero = document.createElement('div');
        hero.className = 'wb-component wb-travel-hero';
        hero.setAttribute('data-component', 'travel-hero');
        hero.id = this.generateId('travel_hero');
        
        // Full width styling met centered content
        hero.style.width = '100%';
        hero.style.margin = '0 auto';
        hero.style.borderRadius = '0';
        hero.style.minHeight = '600px';
        hero.style.marginBottom = '0';

        const toolbar = this.createToolbar();
        hero.appendChild(toolbar);
        this.addTypeBadge(hero);

        const currentStyle = options.style || 'interactive-map';
        const title = options.title || 'Ierland Rondreis';
        const subtitle = options.subtitle || '8 dagen door het groene eiland';

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="travel-hero-container">
                <select class="travel-hero-style-select" style="display:none;">
                    <option value="interactive-map" ${currentStyle === 'interactive-map' ? 'selected' : ''}>🗺️ Interactive Map</option>
                    <option value="image-hero" ${currentStyle === 'image-hero' ? 'selected' : ''}>📸 Image Hero</option>
                    <option value="video-hero" ${currentStyle === 'video-hero' ? 'selected' : ''}>🎬 Video Hero</option>
                </select>
                <div class="travel-hero-preview" data-style="${currentStyle}">
                    ${this.getTravelHeroHTML(currentStyle, hero.id, title, subtitle)}
                </div>
            </div>
        `;
        hero.appendChild(content);

        // Initialize based on style
        setTimeout(() => {
            if (currentStyle === 'interactive-map') {
                this.initializeTravelHeroMap(hero, options.destinations || []);
            }
        }, 100);

        this.makeSelectable(hero);
        return hero;
    }

    static getTravelHeroHTML(style, heroId, title, subtitle) {
        console.log('[getTravelHeroHTML] Style:', style, 'HeroId:', heroId);
        
        if (style === 'interactive-map') {
            return `
                <div class="travel-hero-map-container" id="hero-map-${heroId}"></div>
                <div class="travel-hero-overlay"></div>
                <div class="travel-hero-content">
                    <h1 contenteditable="true">${title}</h1>
                    <p contenteditable="true">${subtitle}</p>
                </div>
            `;
        } else if (style === 'image-hero') {
            console.log('[getTravelHeroHTML] Returning IMAGE HERO HTML');
            return `
                <div class="image-hero-background" style="background-image: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600');"></div>
                <div class="image-hero-overlay"></div>
                <div class="travel-hero-content">
                    <h1 contenteditable="true">${title}</h1>
                    <p contenteditable="true">${subtitle}</p>
                </div>
            `;
        } else if (style === 'video-hero') {
            console.log('[getTravelHeroHTML] Returning VIDEO HERO HTML');
            // Default video: Beautiful Ireland landscape (Ierland)
            const defaultVideoId = 'Yocja_N5s1I';
            return `
                <div class="video-hero-container">
                    <div class="video-hero-background" id="video-bg-${heroId}">
                        <iframe 
                            src="https://www.youtube.com/embed/${defaultVideoId}?autoplay=1&mute=1&loop=1&playlist=${defaultVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1"
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            style="position: absolute; top: 50%; left: 50%; width: 177.77777778vh; height: 100%; min-width: 100%; min-height: 56.25vw; transform: translate(-50%, -50%); pointer-events: none; border: none;"
                        ></iframe>
                    </div>
                    <div class="video-hero-overlay"></div>
                    <div class="travel-hero-content">
                        <h1 contenteditable="true">${title}</h1>
                        <p contenteditable="true">${subtitle}</p>
                    </div>
                </div>
            `;
        }
    }

    // VERWIJDER ALLE ANDERE HERO STYLES - we beginnen opnieuw
    static createTravelHeroOLD_BACKUP(options = {}) {
        // Oude code als backup
        const hero = document.createElement('div');
        const currentStyle = options.style || 'interactive-map';
        const title = options.title || 'Thailand Rondreis';
        const subtitle = options.subtitle || '20 dagen door het land van de glimlach';

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="travel-hero-container">
                <div class="travel-hero-preview" data-style="${currentStyle}">
                    ${currentStyle === 'timeline-slider' ? `
                        <div class="timeline-slider-background" style="background-image: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600');"></div>
                        <div class="timeline-slider-overlay"></div>
                        <div class="travel-hero-content timeline-slider-header">
                            <h1 contenteditable="true">${title}</h1>
                            <p contenteditable="true">${subtitle}</p>
                        </div>
                        <div class="timeline-slider-container">
                            <div class="timeline-slider-track" id="timeline-slider-${hero.id}">
                                <!-- Day cards will be added here -->
                            </div>
                            <button class="timeline-slider-prev">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="timeline-slider-next">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    ` : currentStyle === 'video-overlay' ? `
                        <div class="video-overlay-container">
                            <div class="video-background" id="video-bg-${hero.id}"></div>
                            <div class="video-overlay-dark"></div>
                        </div>
                    ` : currentStyle === 'parallax-photos' ? `
                        <div class="parallax-photos-container" id="parallax-${hero.id}">
                            <div class="parallax-layer parallax-bg"></div>
                            <div class="parallax-layer parallax-mid"></div>
                            <div class="parallax-layer parallax-front"></div>
                            <div class="travel-hero-content parallax-content">
                                <h1 contenteditable="true">${title}</h1>
                                <p contenteditable="true">${subtitle}</p>
                            </div>
                        </div>
                    ` : currentStyle === 'airplane-window' ? `
                        <div class="airplane-window-container">
                            <div class="airplane-window-frame">
                                <svg class="window-shape" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <clipPath id="window-clip-${hero.id}">
                                            <rect x="50" y="50" width="300" height="400" rx="150" />
                                        </clipPath>
                                    </defs>
                                    <rect x="40" y="40" width="320" height="420" rx="160" fill="#e5e7eb" stroke="#9ca3af" stroke-width="8"/>
                                    <rect x="50" y="50" width="300" height="400" rx="150" fill="#fff" stroke="#d1d5db" stroke-width="4"/>
                                </svg>
                                <div class="window-photos" id="window-photos-${hero.id}" style="clip-path: url(#window-clip-${hero.id});"></div>
                            </div>
                            <div class="travel-hero-content airplane-content">
                                <h1 contenteditable="true">${title}</h1>
                                <p contenteditable="true">${subtitle}</p>
                            </div>
                            <div class="airplane-features">
                                <div class="feature-item">
                                    <i class="fas fa-map-marked-alt"></i>
                                    <span>8 Bestemmingen</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>20 Dagen</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-hotel"></i>
                                    <span>Hotels Inclusief</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-utensils"></i>
                                    <span>Ontbijt Dagelijks</span>
                                </div>
                            </div>
                        </div>
                    ` : currentStyle === 'split-hero' ? `
                        <div class="split-hero-container">
                            <div class="split-hero-map" id="split-map-${hero.id}"></div>
                            <div class="split-hero-content">
                                <h1 contenteditable="true">${title}</h1>
                                <p class="split-subtitle" contenteditable="true">${subtitle}</p>
                                <div class="split-destinations"></div>
                                <div class="split-highlights">
                                    <div class="highlight-item" contenteditable="true">
                                        <i class="fas fa-check"></i>
                                        <span>8 Bestemmingen</span>
                                    </div>
                                    <div class="highlight-item" contenteditable="true">
                                        <i class="fas fa-check"></i>
                                        <span>Alle hotels inclusief</span>
                                    </div>
                                    <div class="highlight-item" contenteditable="true">
                                        <i class="fas fa-check"></i>
                                        <span>Ontbijt dagelijks</span>
                                    </div>
                                </div>
                            </div>
                            <div class="split-hero-photos" id="split-photos-${hero.id}"></div>
                        </div>
                    ` : `
                        <div class="travel-hero-content">
                            <h1 contenteditable="true">${title}</h1>
                            <p contenteditable="true">${subtitle}</p>
                            <div class="travel-hero-placeholder">
                                <i class="fas fa-image"></i>
                                <p>Hero Style: <strong>${this.getStyleName(currentStyle)}</strong></p>
                                <small>Bewerk in eigenschappen panel →</small>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
        hero.appendChild(content);

        // Initialize map for interactive-map style
        if (currentStyle === 'interactive-map') {
            setTimeout(() => this.initializeTravelHeroMap(hero, options.destinations || []), 100);
        }
        
        // Initialize timeline slider for timeline-slider style
        if (currentStyle === 'timeline-slider') {
            setTimeout(() => this.initializeTimelineSlider(hero, options.destinations || []), 100);
        }
        
        // Initialize parallax for parallax-photos style
        if (currentStyle === 'parallax-photos') {
            setTimeout(() => this.initializeParallaxPhotos(hero, options.destinations || []), 100);
        }
        
        // Initialize airplane window for airplane-window style
        if (currentStyle === 'airplane-window') {
            setTimeout(() => this.initializeAirplaneWindow(hero, options.destinations || []), 100);
        }
        
        // Initialize split hero for split-hero style
        if (currentStyle === 'split-hero') {
            setTimeout(() => this.initializeSplitHero(hero, options.destinations || []), 100);
        }

        this.makeSelectable(hero);
        return hero;
    }

    static initializeParallaxPhotos(hero, destinations) {
        const container = hero.querySelector('.parallax-photos-container');
        if (!container) return;

        const bgLayer = container.querySelector('.parallax-bg');
        const midLayer = container.querySelector('.parallax-mid');
        const frontLayer = container.querySelector('.parallax-front');

        // Set background images from destinations
        if (destinations && destinations.length > 0) {
            if (destinations[0]?.images?.[0]) bgLayer.style.backgroundImage = `url('${destinations[0].images[0]}')`;
            if (destinations[1]?.images?.[0]) midLayer.style.backgroundImage = `url('${destinations[1].images[0]}')`;
            if (destinations[2]?.images?.[0]) frontLayer.style.backgroundImage = `url('${destinations[2].images[0]}')`;
        }

        // Parallax scroll effect
        let ticking = false;
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const heroRect = hero.getBoundingClientRect();
            
            if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
                const offset = scrolled * 0.5;
                bgLayer.style.transform = `translateY(${offset * 0.3}px)`;
                midLayer.style.transform = `translateY(${offset * 0.6}px)`;
                frontLayer.style.transform = `translateY(${offset * 0.9}px)`;
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(handleScroll);
                ticking = true;
            }
        });
    }

    static initializeSplitHero(hero, destinations) {
        const mapContainer = hero.querySelector('.split-hero-map');
        const destinationsDiv = hero.querySelector('.split-destinations');
        const photosContainer = hero.querySelector('.split-hero-photos');
        
        if (!mapContainer) return;

        // Get destinations from timeline if not provided
        if (!destinations || destinations.length === 0) {
            const timeline = document.querySelector('.wb-travel-timeline');
            if (timeline) {
                const destinationCards = timeline.querySelectorAll('.wb-travel-card.destination');
                destinations = Array.from(destinationCards).map((card, idx) => ({
                    name: card.querySelector('.travel-card-title h3')?.textContent || `Bestemming ${idx + 1}`,
                    images: Array.from(card.querySelectorAll('.carousel-image')).map(img => 
                        img.style.backgroundImage?.replace(/url\(['"](.+)['"]\)/, '$1')
                    ).filter(Boolean)
                }));
            }
        }

        // Build destinations list
        if (destinationsDiv && destinations.length > 0) {
            const destNames = destinations.map(d => d.name).join(' | ');
            destinationsDiv.textContent = destNames;
        }

        // Build mini map with Leaflet
        if (typeof L !== 'undefined' && destinations.length > 0) {
            const map = L.map(mapContainer.id, {
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                scrollWheelZoom: false
            }).setView([13.7563, 100.5018], 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18
            }).addTo(map);

            // Add route line (mock coordinates for now)
            const routeCoords = [
                [13.7563, 100.5018], // Bangkok
                [18.7883, 98.9853],  // Chiang Mai
                [7.8804, 98.3923]    // Phuket
            ];
            
            L.polyline(routeCoords, {
                color: '#667eea',
                weight: 3,
                opacity: 0.8
            }).addTo(map);

            // Add markers
            routeCoords.forEach((coord, idx) => {
                L.circleMarker(coord, {
                    radius: 6,
                    fillColor: '#667eea',
                    color: '#fff',
                    weight: 2,
                    fillOpacity: 1
                }).addTo(map);
            });
        }

        // Build photo collage
        if (photosContainer && destinations.length > 0) {
            const allPhotos = [];
            destinations.forEach(dest => {
                if (dest.images && dest.images.length > 0) {
                    allPhotos.push(...dest.images);
                }
            });

            // Use first 3 photos
            const photos = allPhotos.slice(0, 3);
            if (photos.length === 0) {
                photos.push(
                    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600',
                    'https://images.unsplash.com/photo-1563492065213-f0e6c0a19e1f?w=600',
                    'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600'
                );
            }

            photos.forEach((photo, idx) => {
                const img = document.createElement('div');
                img.className = 'split-photo';
                img.style.backgroundImage = `url('${photo}')`;
                photosContainer.appendChild(img);
            });
        }
    }

    static initializeAirplaneWindow(hero, destinations) {
        const photosContainer = hero.querySelector('.window-photos');
        if (!photosContainer) return;

        // Get photos from destinations
        const photos = [];
        if (destinations && destinations.length > 0) {
            destinations.forEach(dest => {
                if (dest.images && dest.images.length > 0) {
                    photos.push(...dest.images);
                } else if (dest.image) {
                    photos.push(dest.image);
                }
            });
        }

        // Default photos if none provided
        if (photos.length === 0) {
            photos.push(
                'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
                'https://images.unsplash.com/photo-1563492065213-f0e6c0a19e1f?w=800',
                'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800'
            );
        }

        // Create photo slides
        photos.forEach((photo, idx) => {
            const slide = document.createElement('div');
            slide.className = 'window-slide';
            slide.style.backgroundImage = `url('${photo}')`;
            if (idx === 0) slide.classList.add('active');
            photosContainer.appendChild(slide);
        });

        // Auto-slide animation
        let currentSlide = 0;
        setInterval(() => {
            const slides = photosContainer.querySelectorAll('.window-slide');
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 3000);
    }

    static initializeTimelineSlider(hero, destinations) {
        const track = hero.querySelector('.timeline-slider-track');
        const prevBtn = hero.querySelector('.timeline-slider-prev');
        const nextBtn = hero.querySelector('.timeline-slider-next');
        
        if (!track) return;

        // Get destinations from timeline if not provided
        if (!destinations || destinations.length === 0) {
            const timeline = document.querySelector('.wb-travel-timeline');
            if (timeline) {
                const destinationCards = timeline.querySelectorAll('.wb-travel-card.destination');
                destinations = Array.from(destinationCards).map((card, idx) => ({
                    name: card.querySelector('.travel-card-title h3')?.textContent || `Dag ${idx + 1}`,
                    day: idx + 1,
                    image: card.querySelector('.carousel-image')?.style.backgroundImage?.replace(/url\(['"](.+)['"]\)/, '$1') || 
                           'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800'
                }));
            }
        }

        // Group consecutive destinations with same name
        const groupedDestinations = [];
        let currentGroup = null;
        
        destinations.forEach((dest, idx) => {
            const dayNum = dest.fromDay || dest.day || idx + 1;
            const name = dest.name;
            
            if (currentGroup && currentGroup.name === name) {
                // Extend current group
                currentGroup.toDay = dest.toDay || dayNum;
            } else {
                // Start new group
                if (currentGroup) groupedDestinations.push(currentGroup);
                currentGroup = {
                    name: name,
                    fromDay: dayNum,
                    toDay: dest.toDay || dayNum,
                    image: dest.image || dest.images?.[0] || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
                    originalIndex: idx
                };
            }
        });
        if (currentGroup) groupedDestinations.push(currentGroup);

        // Create day cards
        track.innerHTML = '';
        groupedDestinations.forEach((dest) => {
            const card = document.createElement('div');
            card.className = 'timeline-day-card';
            
            // Format day label
            const dayLabel = dest.fromDay === dest.toDay 
                ? `Dag ${dest.fromDay}` 
                : `Dag ${dest.fromDay}-${dest.toDay}`;
            
            card.innerHTML = `
                <div class="timeline-day-image" style="background-image: url('${dest.image}')"></div>
                <div class="timeline-day-info">
                    <div class="timeline-day-number">${dayLabel}</div>
                    <div class="timeline-day-name">${dest.name}</div>
                </div>
            `;
            
            // Click to scroll to timeline
            card.onclick = () => {
                const timeline = document.querySelector('.wb-travel-timeline');
                if (timeline) {
                    const dayHeaders = timeline.querySelectorAll('.wb-travel-day-header');
                    const targetDay = dayHeaders[dest.originalIndex];
                    if (targetDay) {
                        targetDay.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            };
            
            track.appendChild(card);
        });

        // Scroll functionality
        let currentScroll = 0;
        const cardWidth = 280; // card width + gap
        
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.stopPropagation();
                currentScroll = Math.max(0, currentScroll - cardWidth * 2);
                track.scrollTo({ left: currentScroll, behavior: 'smooth' });
            };
        }
        
        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                const maxScroll = track.scrollWidth - track.clientWidth;
                currentScroll = Math.min(maxScroll, currentScroll + cardWidth * 2);
                track.scrollTo({ left: currentScroll, behavior: 'smooth' });
            };
        }

        // Auto-scroll animation
        let autoScrollInterval;
        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                const maxScroll = track.scrollWidth - track.clientWidth;
                if (currentScroll >= maxScroll) {
                    currentScroll = 0;
                } else {
                    currentScroll += cardWidth;
                }
                track.scrollTo({ left: currentScroll, behavior: 'smooth' });
            }, 3000);
        };

        // Start auto-scroll
        startAutoScroll();

        // Pause on hover
        track.onmouseenter = () => clearInterval(autoScrollInterval);
        track.onmouseleave = () => startAutoScroll();

        // Store reference
        hero._timelineSlider = { track, prevBtn, nextBtn, autoScrollInterval };
    }

    static initializeTravelHeroMap(hero, destinations) {
        const mapContainer = hero.querySelector('.travel-hero-map-container');
        if (!mapContainer || typeof L === 'undefined') return;

        const mapId = mapContainer.id;
        
        // If no destinations, show default view of Thailand
        if (!destinations || destinations.length === 0) {
            const map = L.map(mapId, {
                zoomControl: false,
                attributionControl: false
            }).setView([13.7563, 100.5018], 6); // Bangkok center
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18
            }).addTo(map);
            
            hero._heroMap = map;
            return;
        }

        // Calculate center and bounds from destinations
        const lats = destinations.map(d => d.latitude);
        const lngs = destinations.map(d => d.longitude);
        const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
        const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
        
        // Create map
        const map = L.map(mapId, {
            zoomControl: false,
            attributionControl: false
        }).setView([centerLat, centerLng], 6);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo(map);
        
        // Create route line
        const routeCoords = destinations.map(d => [d.latitude, d.longitude]);
        L.polyline(routeCoords, {
            color: '#ff6b6b',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1
        }).addTo(map);
        
        // Add numbered markers
        destinations.forEach((dest, idx) => {
            const icon = L.divIcon({
                className: 'hero-route-marker',
                html: `<div class="hero-route-marker-inner">${idx + 1}</div>`,
                iconSize: [40, 40]
            });
            
            const marker = L.marker([dest.latitude, dest.longitude], { icon })
                .addTo(map);
            
            // Click handler to show detail panel
            marker.on('click', () => {
                if (window.ComponentFactory?.showDestinationDetail) {
                    window.ComponentFactory.showDestinationDetail(dest, idx + 1);
                }
            });
        });
        
        // Fit bounds
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
        
        // Store map reference and destinations
        hero._heroMap = map;
        hero._heroDestinations = destinations;
    }

    static refreshTravelHeroMap(hero) {
        if (!hero._heroMap) return;

        // Get current destinations from timeline
        const timeline = document.querySelector('.wb-travel-timeline');
        if (!timeline) return;

        const destinationCards = timeline.querySelectorAll('.wb-travel-card.destination');
        const newDestinations = [];

        destinationCards.forEach((card, idx) => {
            if (card._destinationData) {
                newDestinations.push({
                    ...card._destinationData,
                    markerNumber: idx + 1
                });
            }
        });

        if (newDestinations.length === 0) return;

        // Clear existing layers
        hero._heroMap.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                hero._heroMap.removeLayer(layer);
            }
        });

        // Redraw route line
        const routeCoords = newDestinations.map(d => [d.latitude, d.longitude]);
        L.polyline(routeCoords, {
            color: '#ff6b6b',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1
        }).addTo(hero._heroMap);

        // Redraw markers
        newDestinations.forEach((dest, idx) => {
            const icon = L.divIcon({
                className: 'hero-route-marker',
                html: `<div class="hero-route-marker-inner">${idx + 1}</div>`,
                iconSize: [40, 40]
            });

            const marker = L.marker([dest.latitude, dest.longitude], { icon })
                .addTo(hero._heroMap);

            marker.on('click', () => {
                if (window.ComponentFactory?.showDestinationDetail) {
                    window.ComponentFactory.showDestinationDetail(dest, idx + 1);
                }
            });
        });

        // Refit bounds
        const bounds = L.latLngBounds(routeCoords);
        hero._heroMap.fitBounds(bounds, { padding: [50, 50] });

        // Update stored destinations
        hero._heroDestinations = newDestinations;
    }

    static getStyleName(style) {
        const names = {
            'interactive-map': '🗺️ Interactive Map',
            'timeline-slider': '🎯 Timeline Slider',
            'video-overlay': '🎬 Video Overlay',
            'parallax-photos': '📸 Parallax Photos',
            'airplane-window': '✈️ Airplane Window',
            'split-hero': '📍 Split Hero'
        };
        return names[style] || style;
    }

    static showDestinationDetail(destination, markerNumber) {
        // Remove existing panel if any
        const existing = document.querySelector('.wb-destination-detail-panel');
        if (existing) existing.remove();

        // Create panel
        const panel = document.createElement('div');
        panel.className = 'wb-destination-detail-panel';

        // Build images HTML
        let imagesHtml = '';
        if (destination.images && destination.images.length > 0) {
            imagesHtml = `
                <div class="destination-detail-images">
                    ${destination.images.slice(0, 5).map(img => `
                        <div class="destination-detail-image">
                            <img src="${img}" alt="${destination.name}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Build hotel section if available
        let hotelHtml = '';
        if (destination.hotel) {
            const hotel = destination.hotel;
            let hotelImagesHtml = '';
            if (hotel.images && hotel.images.length > 0) {
                hotelImagesHtml = `
                    <div class="destination-detail-images">
                        ${hotel.images.slice(0, 5).map(img => `
                            <div class="destination-detail-image">
                                <img src="${img}" alt="${hotel.name}" loading="lazy">
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            let facilitiesHtml = '';
            if (hotel.facilities && hotel.facilities.length > 0) {
                facilitiesHtml = `
                    <div class="hotel-facilities">
                        ${hotel.facilities.map(f => `
                            <div class="hotel-facility">
                                <i class="${f.icon || 'fas fa-check'}"></i>
                                <span>${f.description}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            hotelHtml = `
                <div class="destination-detail-section">
                    <h3><i class="fas fa-hotel"></i> Hotel</h3>
                    ${hotelImagesHtml}
                    <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937;">${hotel.name}</h4>
                    ${hotel.description ? `<p class="destination-detail-description">${hotel.description}</p>` : ''}
                    <div class="destination-detail-info">
                        ${hotel.roomType ? `
                            <div class="destination-detail-info-row">
                                <i class="fas fa-bed"></i>
                                <span>${hotel.roomType}</span>
                            </div>
                        ` : ''}
                        ${hotel.meals ? `
                            <div class="destination-detail-info-row">
                                <i class="fas fa-utensils"></i>
                                <span>${hotel.meals}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${facilitiesHtml}
                </div>
            `;
        }

        panel.innerHTML = `
            <div class="destination-detail-header">
                <h2><span style="opacity: 0.7; margin-right: 8px;">${markerNumber}</span> ${destination.name}</h2>
                <button class="destination-detail-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="destination-detail-content">
                <div class="destination-detail-section">
                    <h3><i class="fas fa-map-marker-alt"></i> Bestemming</h3>
                    ${imagesHtml}
                    ${destination.description ? `<p class="destination-detail-description">${destination.description}</p>` : ''}
                    <div class="destination-detail-info">
                        <div class="destination-detail-info-row">
                            <i class="fas fa-calendar"></i>
                            <span>Dag ${destination.fromDay}${destination.toDay !== destination.fromDay ? ` - ${destination.toDay}` : ''}</span>
                        </div>
                        ${destination.duration ? `
                            <div class="destination-detail-info-row">
                                <i class="fas fa-clock"></i>
                                <span>${destination.duration}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                ${hotelHtml}
            </div>
        `;

        document.body.appendChild(panel);

        // Close button handler
        panel.querySelector('.destination-detail-close').onclick = () => {
            panel.classList.remove('active');
            setTimeout(() => panel.remove(), 300);
        };

        // Animate in
        setTimeout(() => panel.classList.add('active'), 10);
    }
}

ComponentFactory.createRoadbookRondreis = function(options = {}) {
    const section = document.createElement('section');
    section.className = 'wb-component wb-roadbook wb-roadbook-rondreis';
    section.setAttribute('data-component', 'roadbook');
    section.setAttribute('data-roadbook-variant', 'rondreis');
    section.id = this.generateId('roadbook_rondreis');

    const escapeHtml = (s) => {
        try {
            return String(s || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        } catch (e) {
            return String(s || '');
        }
    };

    const toolbar = this.createToolbar();
    section.appendChild(toolbar);
    this.addTypeBadge(section);

    const data = {
        title: options.title || 'Rondreis',
        departureDate: options.departureDate || '2025-06-15',
        transports: options.transports || [],
        hotels: options.hotels || [],
        itinerary: options.itinerary || [],
        destinations: options.destinations || [],
        travelBroUrl: options.travelBroUrl || options.travelbroUrl || options.broUrl || options.travel_bro_url || ''
    };
    section._roadbookData = data;

    let brandPrimary = '#066168';
    let brandLogo = '';
    try {
        const brandSettings = localStorage.getItem('brandSettings');
        if (brandSettings) {
            const brand = JSON.parse(brandSettings);
            if (brand && brand.logo) brandLogo = brand.logo;
            if (brand && brand.colors && brand.colors.primary) brandPrimary = brand.colors.primary;
            else if (brand && brand.primaryColor) brandPrimary = brand.primaryColor;
        }
    } catch (e) {}

    try {
        document.documentElement.style.setProperty('--brand-primary', brandPrimary);
    } catch (e) {}

    const normalizePlaceName = (v) => String(v || '').replace(/^Dag\s*\d+(\s*-\s*\d+)?\s*:?\s*/i, '').trim();
    const getLatLng = (d) => {
        try {
            const lat = d && (d.latitude != null ? d.latitude : (d.geolocation && d.geolocation.latitude));
            const lng = d && (d.longitude != null ? d.longitude : (d.geolocation && d.geolocation.longitude));
            if (lat == null || lng == null) return null;
            return { latitude: Number(lat), longitude: Number(lng) };
        } catch (e) { return null; }
    };

    const firstImg = (() => {
        try {
            const it0 = Array.isArray(data.itinerary) && data.itinerary[0] ? data.itinerary[0] : null;
            const u = it0 && (it0.image || it0.imageUrl || it0.photo || '');
            return u || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200';
        } catch (e) {
            return 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200';
        }
    })();

    const stops = Array.isArray(data.itinerary) ? data.itinerary : [];

    const groupedStops = (() => {
        const out = [];
        let current = null;
        const flush = () => {
            if (!current) return;
            const i = out.length;
            out.push({
                i,
                key: current.key,
                name: current.name,
                subtitle: current.subtitle,
                fromDay: current.fromDay,
                toDay: current.toDay,
                date: current.date,
                nights: current.nights,
                img: current.img,
                latitude: current.latitude,
                longitude: current.longitude,
                items: current.items
            });
            current = null;
        };

        stops.forEach((day, idx) => {
            const rawName = normalizePlaceName(day.title || day.destination || day.location || `Stop ${idx + 1}`);
            const key = rawName.toLowerCase();
            const dayNr = idx + 1;
            const img = day.image || day.imageUrl || firstImg;
            const subtitle = day.subtitle || day.location || '';
            const date = day.date || day.fromDate || '';
            const ll = getLatLng(day) || null;

            if (!current || current.key !== key) {
                flush();
                current = {
                    key,
                    name: rawName,
                    subtitle,
                    fromDay: dayNr,
                    toDay: dayNr,
                    date,
                    nights: day.nights || '',
                    img,
                    latitude: ll ? ll.latitude : null,
                    longitude: ll ? ll.longitude : null,
                    items: [day]
                };
                return;
            }

            current.toDay = dayNr;
            current.items.push(day);
            if (!current.img && img) current.img = img;
            if ((!current.latitude || !current.longitude) && ll) {
                current.latitude = ll.latitude;
                current.longitude = ll.longitude;
            }
        });
        flush();
        return out;
    })();

    // Enrich grouped stops with media arrays + matched hotel data
    try {
        const hotels = Array.isArray(data.hotels) ? data.hotels : [];
        groupedStops.forEach((s) => {
            try {
                // Destination images (from itinerary items + main image)
                const imgs = [];
                try {
                    (Array.isArray(s.items) ? s.items : []).forEach((it) => {
                        const u = it && (it.image || it.imageUrl || it.photo || '');
                        if (u) imgs.push(String(u));
                    });
                } catch (e0) {}
                if (s.img) imgs.unshift(String(s.img));
                const uniq = Array.from(new Set(imgs.filter(Boolean)));
                s.destImages = uniq.slice(0, 12);
                if (!s.destImages.length && s.img) s.destImages = [String(s.img)];

                // Match a hotel by place name
                const placeKey = String(normalizePlaceName(s.name) || '').trim().toLowerCase();
                const hit = hotels.find(h => {
                    try {
                        const hl = String(normalizePlaceName(h && (h.location || h.city || h.destination || '')) || '').trim().toLowerCase();
                        return hl && placeKey && (hl === placeKey || hl.includes(placeKey) || placeKey.includes(hl));
                    } catch (e) { return false; }
                }) || null;

                const hotelImgsRaw = (hit && (hit.images || hit.photos || [])) || [];
                const hotelImgs = (Array.isArray(hotelImgsRaw) ? hotelImgsRaw : [])
                    .map(x => x && typeof x === 'object' ? (x.url || x.src || '') : x)
                    .filter(Boolean)
                    .map(String);
                const hotelImg = (hit && (hit.image || (Array.isArray(hit.images) && hit.images[0]))) ? String(hit.image || hit.images[0]) : '';

                if (hit) {
                    s.hotel = {
                        name: hit.name ? String(hit.name) : '',
                        location: hit.location || hit.city || hit.destination ? String(hit.location || hit.city || hit.destination) : '',
                        description: String(hit.description || hit.fullDescription || ''),
                        roomType: String(hit.roomType || hit.roomTypes || ''),
                        meals: String(hit.mealPlan || hit.meals || ''),
                        images: Array.from(new Set([hotelImg, ...hotelImgs].filter(Boolean))).slice(0, 12)
                    };
                } else {
                    s.hotel = null;
                }
            } catch (e1) {}
        });
    } catch (e) {}

    try { section._rrGroupedStops = groupedStops; } catch (e) {}

    const routePoints = (() => {
        const fromDestinations = (Array.isArray(data.destinations) ? data.destinations : [])
            .map((d) => {
                const ll = getLatLng(d);
                if (!ll) return null;
                return {
                    name: normalizePlaceName(d.name || d.title || ''),
                    fromDay: d.fromDay || d.day || 1,
                    toDay: d.toDay || d.fromDay || d.day || 1,
                    latitude: ll.latitude,
                    longitude: ll.longitude
                };
            })
            .filter(Boolean);

        if (fromDestinations.length) return fromDestinations;

        return groupedStops
            .map((g) => {
                if (g.latitude == null || g.longitude == null) return null;
                return {
                    name: g.name,
                    fromDay: g.fromDay,
                    toDay: g.toDay,
                    latitude: g.latitude,
                    longitude: g.longitude
                };
            })
            .filter(Boolean);
    })();

    const routePointsAttr = (() => {
        try { return encodeURIComponent(JSON.stringify(routePoints)); } catch (e) { return ''; }
    })();

    const safeJson = (obj) => {
        try { return encodeURIComponent(JSON.stringify(obj)); } catch (e) { return ''; }
    };

    const detailsHtml = groupedStops.map((s) => {
        const placeKey = String(normalizePlaceName(s.name) || '').trim().toLowerCase();
        const hotels = Array.isArray(data.hotels) ? data.hotels : [];
        const hit = hotels.find(h => {
            try {
                const hl = String(normalizePlaceName(h && (h.location || h.city || h.destination || '')) || '').trim().toLowerCase();
                return hl && placeKey && (hl === placeKey || hl.includes(placeKey) || placeKey.includes(hl));
            } catch (e) { return false; }
        }) || null;
        const hotelName = hit && hit.name ? String(hit.name) : '';
        const hotelImg = (hit && (hit.image || (Array.isArray(hit.images) && hit.images[0]))) || s.img;
        const hotelImgsRaw = (hit && (hit.images || hit.photos || [])) || [];
        const hotelImgs = (Array.isArray(hotelImgsRaw) ? hotelImgsRaw : [])
            .map(x => x && typeof x === 'object' ? (x.url || x.src || '') : x)
            .filter(Boolean);
        const hotelSlides = safeJson((hotelImg ? [hotelImg, ...hotelImgs] : hotelImgs).slice(0, 12));

        const destSlides = safeJson([s.img].filter(Boolean));

        const transports = Array.isArray(data.transports) ? data.transports : [];
        const transportHtml = transports.length
            ? transports.map((t) => {
                const type = (t && t.type) ? String(t.type) : 'transport';
                const from = t.from || t.departure || '';
                const to = t.to || t.arrival || '';
                const time = (t.departureTime || t.time || '') + (t.arrivalTime ? ` - ${t.arrivalTime}` : '');
                const carrier = t.carrier || t.company || t.airline || '';
                const code = t.flightNumber || t.code || '';
                const icon = (type === 'flight' || type === 'plane') ? 'plane' : (type === 'car' ? 'car' : (type === 'train' ? 'train' : 'route'));
                return `
                    <div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;background:#fff;display:flex;gap:12px;align-items:flex-start;">
                        <div style="width:38px;height:38px;border-radius:10px;background:rgba(6,97,104,0.12);display:flex;align-items:center;justify-content:center;color:${brandPrimary};flex:0 0 auto;">
                            <i class="fas fa-${icon}"></i>
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:800;color:#111827;">${escapeHtml(from)} ${from && to ? '→' : ''} ${escapeHtml(to)}</div>
                            <div style="color:#6b7280;font-size:13px;margin-top:2px;">${escapeHtml(time)} ${carrier || code ? '·' : ''} ${escapeHtml([carrier, code].filter(Boolean).join(' '))}</div>
                        </div>
                    </div>
                `;
            }).join('')
            : `<div style="padding:14px 16px;border:1px dashed #d1d5db;border-radius:12px;color:#6b7280;background:#fff;">Nog geen transport gevonden</div>`;

        const destHtml = `
            <div class="placeImg" data-wb-slides="${destSlides}" data-wb-slide-idx="0" style="position:relative;border-radius:14px;overflow:hidden;height:240px;background:#f3f4f6;">
                <img src="${s.img}" alt="${escapeHtml(s.name)}" style="width:100%;height:100%;object-fit:cover;display:block;">
            </div>
            <div style="margin-top:14px;">
                <div style="font-weight:900;font-size:22px;color:#111827;" class="editable" contenteditable="true">${escapeHtml(s.name)}</div>
                <div style="color:#6b7280;margin-top:4px;" class="editable" contenteditable="true">${escapeHtml(s.subtitle || 'Bestemming')}</div>
                <div style="color:#374151;line-height:1.7;margin-top:10px;" class="editable" contenteditable="true">Beschrijving van deze bestemming...</div>
            </div>
        `;

        const hotelHtml = `
            <div class="placeImg" data-wb-slides="${hotelSlides}" data-wb-slide-idx="0" style="position:relative;border-radius:14px;overflow:hidden;height:240px;background:#f3f4f6;">
                <img src="${hotelImg}" alt="${escapeHtml(hotelName || 'Hotel')}" style="width:100%;height:100%;object-fit:cover;display:block;">
                <button type="button" class="wb-slide-prev" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.65);background:rgba(17,24,39,.45);color:#fff;font-weight:900;cursor:pointer;z-index:5;display:flex;align-items:center;justify-content:center;line-height:1;">&lsaquo;</button>
                <button type="button" class="wb-slide-next" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.65);background:rgba(17,24,39,.45);color:#fff;font-weight:900;cursor:pointer;z-index:5;display:flex;align-items:center;justify-content:center;line-height:1;">&rsaquo;</button>
            </div>
            <div style="margin-top:14px;">
                <div style="font-weight:900;font-size:22px;color:#111827;" class="editable" contenteditable="true">${escapeHtml(hotelName || 'Hotel')}</div>
                <div style="color:#374151;line-height:1.7;margin-top:10px;" class="editable" contenteditable="true">Hotel informatie...</div>
            </div>
        `;

        const excursiesHtml = `
            <div style="padding:14px 16px;border:1px dashed #d1d5db;border-radius:12px;color:#6b7280;background:#fff;" class="editable" contenteditable="true">Excursies (later: Activities API)</div>
        `;

        const dayLabel = `Dag ${s.fromDay}${(s.toDay && s.toDay !== s.fromDay) ? `-${s.toDay}` : ''}`;
        return `
            <div class="rr-stop-detail" data-stop-index="${s.i}" style="display:none;">
                <div class="rr-tabs" style="display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px 0;">
                    <button type="button" class="rr-tab-btn" data-tab="transport" style="border:1px solid #e5e7eb;background:#fff;border-radius:999px;padding:8px 12px;font-weight:800;font-size:13px;cursor:pointer;">Transport</button>
                    <button type="button" class="rr-tab-btn" data-tab="bestemming" style="border:1px solid #e5e7eb;background:#fff;border-radius:999px;padding:8px 12px;font-weight:800;font-size:13px;cursor:pointer;">Bestemming</button>
                    <button type="button" class="rr-tab-btn" data-tab="hotel" style="border:1px solid #e5e7eb;background:#fff;border-radius:999px;padding:8px 12px;font-weight:800;font-size:13px;cursor:pointer;">Hotel</button>
                    <button type="button" class="rr-tab-btn" data-tab="excursies" style="border:1px solid #e5e7eb;background:#fff;border-radius:999px;padding:8px 12px;font-weight:800;font-size:13px;cursor:pointer;">Excursies</button>
                </div>
                <div class="rr-tab-panel" data-tab="transport" style="display:none;">
                    <div style="display:grid;gap:12px;">${transportHtml}</div>
                </div>
                <div class="rr-tab-panel" data-tab="bestemming" style="display:none;">${destHtml}</div>
                <div class="rr-tab-panel" data-tab="hotel" style="display:none;">${hotelHtml}</div>
                <div class="rr-tab-panel" data-tab="excursies" style="display:none;">${excursiesHtml}</div>
                <div style="margin-top:12px;color:#6b7280;font-size:12px;font-weight:700;">${escapeHtml(dayLabel)} ${s.name ? '·' : ''} ${escapeHtml(s.name)}</div>
            </div>
        `;
    }).join('');

    const stopsListHtml = groupedStops.map((s) => {
        const dayLabel = `Dag ${s.fromDay}${(s.toDay && s.toDay !== s.fromDay) ? `-${s.toDay}` : ''}: ${s.name}`;
        return `
            <button type="button" class="rr-stop-item" data-stop-index="${s.i}" data-stop-img="${escapeHtml(s.img)}" style="width:100%;text-align:left;border:1px solid #e5e7eb;background:#fff;border-radius:12px;padding:12px 12px;display:grid;grid-template-columns:42px 1fr 34px;gap:10px;align-items:center;cursor:pointer;">
                <div style="width:42px;height:42px;border-radius:12px;background:${brandPrimary};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;">${String(s.i + 1).padStart(2, '0')}</div>
                <div style="min-width:0;">
                    <div style="font-weight:900;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(dayLabel)}</div>
                    <div style="color:#6b7280;font-size:12px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml([s.date, s.nights ? `${s.nights} nachten` : ''].filter(Boolean).join(' · '))}</div>
                </div>
                <div style="width:34px;height:34px;border-radius:999px;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;color:${brandPrimary};"><i class="fas fa-chevron-right"></i></div>
            </button>
        `;
    }).join('');

    section.innerHTML += `
        <div style="position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid #eef2f7;">
            <div style="max-width:1200px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:14px;">
                <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                    ${brandLogo ? `<img src="${brandLogo}" alt="Logo" style="height:34px;width:auto;">` : ''}
                    <div style="font-weight:900;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" class="editable" contenteditable="true">${escapeHtml(data.title)}</div>
                </div>
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
                    <a href="#" class="rr-nav" data-rr-nav="home" style="text-decoration:none;font-weight:900;font-size:13px;color:#0f172a;padding:8px 12px;border-radius:999px;background:#f1f5f9;">Home</a>
                    <a href="#rr-map" class="rr-nav" data-rr-nav="map" style="text-decoration:none;font-weight:900;font-size:13px;color:#0f172a;padding:8px 12px;border-radius:999px;background:#f1f5f9;">Kaart</a>
                    <a href="#rr-detail" class="rr-nav" data-rr-nav="detail" style="text-decoration:none;font-weight:900;font-size:13px;color:#0f172a;padding:8px 12px;border-radius:999px;background:#f1f5f9;">Schema</a>
                </div>
            </div>
        </div>

        <div class="rr-page rr-page-home" style="display:block;">
            <div class="rr-wrap" style="max-width:none;width:100%;margin:0 auto;padding:16px 24px;">
                <div class="rr-home" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:stretch;height:calc(100vh - 86px);min-height:640px;">
                <div class="rr-hero-media" style="position:relative;border-radius:18px;overflow:hidden;height:100%;background:#0b1220;">
                    <div class="rr-hero-img placeImg" data-wb-slides="${safeJson([firstImg])}" data-wb-slide-idx="0" style="position:absolute;inset:0;">
                        <img src="${firstImg}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;opacity:0.92;">
                    </div>
                    <div style="position:absolute;left:18px;right:18px;bottom:18px;color:#fff;z-index:2;">
                        <div style="font-weight:900;font-size:26px;line-height:1.1;" class="editable" contenteditable="true">${escapeHtml(data.title)}</div>
                        <div style="opacity:0.9;margin-top:6px;font-weight:700;" class="editable" contenteditable="true">${escapeHtml(new Date(data.departureDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }))} · ${escapeHtml(String(stops.length || '').trim() ? `${stops.length} dagen` : '')}</div>
                    </div>
                    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.0) 45%,rgba(0,0,0,0.55) 100%);pointer-events:none;"></div>
                </div>

                <div class="rr-right" style="display:flex;flex-direction:column;gap:18px;height:100%;min-height:0;">
                    <div id="rr-map" class="wb-component wb-roadbook-route-map" data-component="roadbook-route-map" data-wb-destinations="${routePointsAttr}" style="border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;background:#fff;flex:1;min-height:0;">
                        <div class="roadbook-route-map-canvas" style="width:100%;height:100%;margin:0;padding:0;display:flex;align-items:center;justify-content:center;color:#6b7280;font-weight:800;">Kaart wordt geladen...</div>
                    </div>

                    <div class="rr-panel" style="border:1px solid #e5e7eb;border-radius:18px;background:#fff;overflow:hidden;display:flex;flex-direction:column;flex:1;min-height:0;">
                        <div class="rr-places-view" style="display:flex;flex-direction:column;min-height:0;flex:1;">
                            <div style="padding:12px 14px;border-bottom:1px solid #eef2f7;font-weight:900;color:#111827;">Plaatsen</div>
                            <div class="rr-stops" style="padding:12px;display:grid;gap:10px;overflow:auto;flex:1;min-height:0;">${stopsListHtml}</div>
                        </div>

                        <div id="rr-detail" class="rr-detail-view" style="display:none;min-height:0;flex:1;flex-direction:column;">
                            <div style="padding:12px 14px;border-bottom:1px solid #eef2f7;display:flex;align-items:center;justify-content:space-between;gap:10px;">
                                <button type="button" class="rr-back-btn" style="border:1px solid #e5e7eb;background:#fff;border-radius:999px;padding:8px 12px;font-weight:900;cursor:pointer;">Terug</button>
                                <div style="font-weight:900;color:#111827;font-size:16px;">Details</div>
                                <div style="color:#6b7280;font-weight:800;font-size:12px;" class="rr-active-stop-label"></div>
                            </div>
                            <div class="rr-details" style="padding:12px;overflow:auto;flex:1;min-height:0;">${detailsHtml}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>

        <div class="rr-page rr-page-detail" style="display:none;">
            <div class="rr-wrap rr-detail-wrap" style="max-width:none;width:100%;margin:0 auto;padding:16px 24px;">
                <div class="rr-detail-page" style="display:grid;grid-template-columns:0.95fr 1.05fr;gap:18px;align-items:stretch;height:calc(100vh - 86px);min-height:640px;">
                    <div class="rr-detail-left" style="position:relative;border-radius:18px;overflow:hidden;height:100%;background:#0b1220;">
                        <div class="rr-detail-hero placeImg" data-wb-slides="${safeJson([firstImg])}" data-wb-slide-idx="0" style="position:absolute;inset:0;">
                            <img class="rr-detail-hero-img" src="${firstImg}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;opacity:0.92;">
                        </div>
                        <div style="position:absolute;left:16px;right:16px;bottom:16px;color:#fff;z-index:2;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;">
                            <div style="min-width:0;">
                                <div class="rr-detail-title" style="font-weight:900;font-size:24px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Bestemming</div>
                                <div class="rr-detail-sub" style="opacity:0.9;margin-top:6px;font-weight:800;font-size:13px;">Dag 1</div>
                            </div>
                            <div style="display:flex;gap:10px;align-items:center;flex:0 0 auto;">
                                <button type="button" class="rr-page-back" style="border:1px solid rgba(255,255,255,.65);background:rgba(17,24,39,.45);color:#fff;border-radius:999px;padding:10px 12px;font-weight:900;cursor:pointer;">Terug</button>
                                <button type="button" class="rr-page-prev" style="border:1px solid rgba(255,255,255,.65);background:rgba(17,24,39,.45);color:#fff;border-radius:999px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:900;cursor:pointer;">‹</button>
                                <button type="button" class="rr-page-next" style="border:1px solid rgba(255,255,255,.65);background:rgba(17,24,39,.45);color:#fff;border-radius:999px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:900;cursor:pointer;">›</button>
                            </div>
                        </div>
                        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.08) 35%,rgba(0,0,0,0.62) 100%);pointer-events:none;"></div>
                    </div>

                    <div class="rr-detail-right" style="border:1px solid #e5e7eb;border-radius:18px;background:#fff;overflow:hidden;display:flex;flex-direction:column;min-height:0;height:100%;">
                        <div class="rr-hotel-map" style="border-bottom:1px solid #eef2f7;background:#fff;">
                            <div class="rr-hotel-map-canvas" style="width:100%;height:170px;margin:0;padding:0;display:flex;align-items:center;justify-content:center;color:#6b7280;font-weight:800;">Ligging hotel</div>
                        </div>
                        <div class="rr-detail-scroll" style="padding:16px;overflow:auto;min-height:0;flex:1;">
                            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
                                <div style="min-width:0;">
                                    <div class="rr-detail-h1 editable" contenteditable="true" style="font-weight:900;color:#111827;font-size:20px;">Bestemming</div>
                                    <div class="rr-detail-hotel-line" style="margin-top:4px;color:#6b7280;font-weight:800;font-size:13px;display:none;"></div>
                                    <div class="rr-detail-hotel-meta" style="margin-top:3px;color:#6b7280;font-weight:700;font-size:12px;display:none;"></div>
                                </div>
                            </div>

                            <div class="rr-detail-text editable" contenteditable="true" style="margin-top:12px;color:#374151;line-height:1.75;">Beschrijving van de bestemming...</div>

                            <div class="rr-detail-thumbs" style="margin-top:14px;display:flex;gap:10px;overflow:auto;padding-bottom:6px;"></div>

                            <div style="height:1px;background:#eef2f7;margin:18px 0;"></div>

                            <div class="rr-hotel-section">
                                <div class="editable" contenteditable="true" style="font-weight:900;color:#111827;font-size:16px;">Hotel</div>
                                <div class="rr-hotel-title" style="margin-top:8px;font-weight:900;color:#111827;font-size:14px;"></div>
                                <div class="rr-hotel-meta" style="margin-top:3px;color:#6b7280;font-weight:800;font-size:12px;"></div>
                                <div class="rr-hotel-desc editable" contenteditable="true" style="margin-top:10px;color:#374151;line-height:1.75;">Hotel informatie...</div>
                                <div class="rr-hotel-thumbs" style="margin-top:14px;display:flex;gap:10px;overflow:auto;padding-bottom:6px;"></div>
                            </div>

                            <div style="height:1px;background:#eef2f7;margin:18px 0;"></div>

                            <div class="rr-excursies-section">
                                <div class="editable" contenteditable="true" style="font-weight:900;color:#111827;font-size:16px;">Excursies</div>
                                <div class="rr-excursies-text editable" contenteditable="true" style="margin-top:10px;color:#374151;line-height:1.75;">Excursies en tips...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    this.makeSelectable(section);

    setTimeout(() => {
        try {
            if (window.ComponentFactory && typeof window.ComponentFactory.initRoadbookRondreis === 'function') {
                window.ComponentFactory.initRoadbookRondreis(section);
            }
        } catch (e) {}
        try {
            if (window.ComponentFactory && typeof window.ComponentFactory.initRoadbookRouteMaps === 'function') {
                window.ComponentFactory.initRoadbookRouteMaps(section);
            }
        } catch (e) {}
    }, 50);

    return section;
};

// Export for use in other files
window.ComponentFactory = ComponentFactory;

// Ensure PropertiesPanel has a textarea helper regardless of script order
(function(){
    const patch = () => {
        try {
            // If instance exists, patch instance method
            const inst = window.PropertiesPanel;
            if (inst && typeof inst.createTextareaInput !== 'function' && typeof inst.createFormGroup === 'function') {
                inst.createTextareaInput = function(label, value, onChange) {
                    const group = this.createFormGroup(label);
                    const inputId = `prop_${label.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${Date.now()}`;
                    const ta = document.createElement('textarea');
                    ta.className = 'form-control';
                    ta.id = inputId;
                    ta.setAttribute('aria-label', label);
                    ta.rows = 6;
                    ta.value = value || '';
                    const lbl = group.querySelector('label');
                    if (lbl) lbl.setAttribute('for', inputId);
                    ta.addEventListener('input', (e) => onChange && onChange(e.target.value));
                    group.appendChild(ta);
                    this.panel.appendChild(group);
                    return group;
                };
                console.info('[WB] Polyfilled instance PropertiesPanel.createTextareaInput');
            }
            // If constructor is exposed separately, also patch prototype
            const Ctor = window.PropertiesPanel && window.PropertiesPanel.prototype ? window.PropertiesPanel : null;
            const Proto = Ctor && Ctor.prototype;
            if (Proto && typeof Proto.createTextareaInput !== 'function' && typeof Proto.createFormGroup === 'function') {
                Proto.createTextareaInput = function(label, value, onChange) {
                    const group = this.createFormGroup(label);
                    const inputId = `prop_${label.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${Date.now()}`;
                    const ta = document.createElement('textarea');
                    ta.className = 'form-control';
                    ta.id = inputId;
                    ta.setAttribute('aria-label', label);
                    ta.rows = 6;
                    ta.value = value || '';
                    const lbl = group.querySelector('label');
                    if (lbl) lbl.setAttribute('for', inputId);
                    ta.addEventListener('input', (e) => onChange && onChange(e.target.value));
                    group.appendChild(ta);
                    this.panel.appendChild(group);
                    return group;
                };
                console.info('[WB] Polyfilled prototype PropertiesPanel.createTextareaInput');
            }
        } catch (e) { /* noop */ }
    };
    if (document.readyState === 'complete') {
        patch();
    } else {
        window.addEventListener('load', patch);
    }
})();

// Attach remove-safety button to any existing hero-travel sections (migration)
const wbInitOnLoad = () => {
    // Upgrade existing hero-banner sections to two-image crossfade if needed
    try {
        document.querySelectorAll('.wb-hero-banner').forEach((section) => {
            const bg = section.querySelector('.hero-bg');
            if (!bg) return;
            const imgs = bg.querySelectorAll('img');
            if (imgs.length === 1) {
                const imgA = imgs[0];
                const imgB = document.createElement('img');
                imgB.alt = imgA.alt || 'Hero background';
                imgB.decoding = 'async';
                imgB.loading = 'eager';
                // Carry over current CSS vars
                const cs = getComputedStyle(section);
                const dur = cs.getPropertyValue('--hero-xfade-duration').trim() || '.35s';
                const easing = cs.getPropertyValue('--hero-xfade-easing').trim() || 'ease';
                imgA.style.setProperty('--hero-xfade-duration', dur);
                imgA.style.setProperty('--hero-xfade-easing', easing);
                imgB.style.setProperty('--hero-xfade-duration', dur);
                imgB.style.setProperty('--hero-xfade-easing', easing);
                imgA.style.willChange = 'opacity';
                imgB.style.willChange = 'opacity';
                // Set initial opacities and transforms
                imgA.style.opacity = imgA.style.opacity || '1';
                imgA.style.transform = 'translateX(0)';
                imgB.style.opacity = '0';
                imgB.style.transform = 'translateX(0)';
                bg.appendChild(imgB);
                // Runtime flags on section
                section._imgA = imgA;
                section._imgB = imgB;
                section._activeImg = 'A';
                section._transitionType = section._transitionType || 'fade';
            } else if (imgs.length >= 2) {
                // Ensure runtime fields exist
                section._imgA = imgs[0];
                section._imgB = imgs[1];
                section._activeImg = section._activeImg || 'A';
                section._transitionType = section._transitionType || 'fade';
            }
        });
    } catch (e) { /* noop */ }

    document.querySelectorAll('.wb-hero-travel').forEach(sec => {
        if (!sec.querySelector('.wb-dev-remove')) {
            const btn = document.createElement('button');
            btn.className = 'wb-dev-remove';
            btn.type = 'button';
            btn.title = 'Sectie verwijderen';
            btn.innerHTML = '<i class="fas fa-trash"></i>';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Weet je zeker dat je deze Hero sectie wilt verwijderen?')) {
                    sec.remove();
                }
            });
            sec.appendChild(btn);
        }
    });

    try {
        if (window.ComponentFactory && typeof window.ComponentFactory.initRoadbookRouteMaps === 'function') {
            window.ComponentFactory.initRoadbookRouteMaps(document);
        }
    } catch (e) {}

    try {
        if (window.ComponentFactory && typeof window.ComponentFactory.initRoadbookRondreis === 'function') {
            window.ComponentFactory.initRoadbookRondreis(document);
        }
    } catch (e) {}
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wbInitOnLoad);
} else {
    try { wbInitOnLoad(); } catch (e) {}
}

// Safety net: delegated handler so the trash always works, even on cloned nodes
document.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.toolbar-btn[data-action="delete"]');
    if (delBtn) {
        e.stopPropagation();
        e.preventDefault();
        const comp = delBtn.closest('.wb-component');
        if (comp && confirm('Weet je zeker dat je dit component wilt verwijderen?')) {
            comp.remove();
            if (window.dragDropManager) {
                // Update selection and history if available
                window.dragDropManager.deselectAll?.();
                window.dragDropManager.saveState?.();
            }
        }
    }
});

// Global Delete key to remove the currently selected component
document.addEventListener('keydown', (e) => {
    const isDelete = e.key === 'Delete' || e.key === 'Backspace';
    const isInput = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if (!isDelete || isInput) return;
    const sel = document.querySelector('.wb-component.selected');
    if (sel) {
        e.preventDefault();
        if (confirm('Geselecteerd component verwijderen?')) {
            sel.remove();
            if (window.dragDropManager) {
                window.dragDropManager.deselectAll?.();
                window.dragDropManager.saveState?.();
            }
        }
    }
});

// Route Overview Button Component - Fixed Left Side
ComponentFactory.createRouteOverviewButton = function(options = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'wb-component wb-route-overview-btn';
    wrapper.setAttribute('data-component', 'route-overview-btn');
    wrapper.id = this.generateId('route_overview_btn');
    
    const buttonText = options.buttonText || 'Bekijk Route';
    const buttonIcon = options.buttonIcon || 'fa-route';
    
    // Fixed positioning on the left side (works on live site)
    wrapper.style.cssText = `
        position: fixed;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        z-index: 1000;
        margin: 0;
        padding: 0;
    `;
    
    wrapper.innerHTML = `
        <button class="route-overview-trigger" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 20px 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 0 12px 12px 0;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 2px 0 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            min-height: 120px;
        ">
            <i class="fas ${buttonIcon}" style="writing-mode: horizontal-tb; font-size: 20px;"></i>
            <span contenteditable="true" style="writing-mode: vertical-rl;">${buttonText}</span>
        </button>
    `;
    
    // Add hover effect
    const btn = wrapper.querySelector('.route-overview-trigger');
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateX(5px)';
        btn.style.boxShadow = '4px 0 20px rgba(102, 126, 234, 0.6)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateX(0)';
        btn.style.boxShadow = '2px 0 15px rgba(102, 126, 234, 0.4)';
    });
    
    // Click handler to open route overview panel
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('[Route Button] Clicked - collecting travel data...');
        
        // Try to open the sliding panel
        if (typeof window.showRouteOverview === 'function') {
            // Collect travel data from page
            const canvas = document.querySelector('.canvas') || document.body;
            const travelData = {
                name: canvas.querySelector('.wb-travel-hero h1')?.textContent || 'Reis Route',
                destinations: [],
                hotels: [],
                transports: []
            };
            
            // Collect destinations from travel cards
            const destCards = canvas.querySelectorAll('.wb-travel-card.destination');
            destCards.forEach((card, index) => {
                const name = card.querySelector('.wb-travel-card-title h3')?.textContent || `Bestemming ${index + 1}`;
                const description = card.querySelector('.wb-travel-card-body p')?.textContent || '';
                travelData.destinations.push({
                    name,
                    description,
                    fromDay: index + 1,
                    toDay: index + 1
                });
            });
            
            // Collect hotels
            const hotelCards = canvas.querySelectorAll('.wb-travel-card.hotel');
            hotelCards.forEach((card, index) => {
                const name = card.querySelector('.wb-travel-card-title h3')?.textContent || `Hotel ${index + 1}`;
                const starsText = card.querySelector('.wb-travel-card-title .subtitle')?.textContent || '';
                const stars = (starsText.match(/⭐/g) || []).length || 3;
                travelData.hotels.push({
                    name,
                    stars,
                    fromDay: index + 1,
                    toDay: index + 2
                });
            });
            
            // Collect transports
            const transportCards = canvas.querySelectorAll('.wb-travel-card.transport');
            transportCards.forEach((card, index) => {
                const title = card.querySelector('.wb-travel-card-title h3')?.textContent || '';
                const [from, to] = title.split('→').map(s => s.trim());
                travelData.transports.push({
                    from: from || 'Start',
                    to: to || 'Einde',
                    fromDay: index + 1
                });
            });
            
            console.log('[Route Button] Travel data collected:', travelData);
            window.showRouteOverview(travelData);
        } else {
            console.error('[Route Button] showRouteOverview function not available');
            alert('Route Overview Panel wordt geladen...');
        }
    });
    
    return wrapper;
};

// Travel Intro Component (Title + Description + Route Button)
ComponentFactory.createTravelIntro = function(options = {}) {
    const section = document.createElement('section');
    section.className = 'wb-component wb-travel-intro';
    section.setAttribute('data-component', 'travel-intro');
    section.id = this.generateId('travel_intro');
    
    const title = options.title || 'Over deze reis';
    const description = options.description || 'Ontdek de mooiste plekken en beleef een onvergetelijke reis vol avontuur en ontspanning.';
    const buttonText = options.buttonText || 'Bekijk Route';
    
    section.style.cssText = `
        max-width: 1200px;
        margin: 40px auto;
        padding: 0 20px;
    `;
    
    section.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            <h2 contenteditable="true" style="
                font-size: 32px;
                font-weight: 700;
                color: #1a202c;
                margin-bottom: 20px;
                line-height: 1.3;
            ">${title}</h2>
            
            <p contenteditable="true" style="
                font-size: 18px;
                line-height: 1.8;
                color: #4a5568;
                margin-bottom: 32px;
            ">${description}</p>
            
            <button class="route-overview-trigger" style="
                display: inline-flex;
                align-items: center;
                gap: 12px;
                padding: 16px 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                font-size: 18px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
            ">
                <i class="fas fa-route"></i>
                <span contenteditable="true">${buttonText}</span>
            </button>
        </div>
    `;
    
    // Add hover effect to button
    const btn = section.querySelector('.route-overview-trigger');
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });
    
    // Click handler
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('[TravelIntro] Route button clicked');
        
        // Check if showRouteOverview exists
        if (!window.showRouteOverview) {
            console.error('[TravelIntro] showRouteOverview not found');
            alert('Route Overview functie nog niet geladen');
            return;
        }
        
        // Collect travel data from page
        const travelData = this.collectTravelDataFromPage();
        
        if (!travelData || travelData.destinations.length === 0) {
            alert('Geen reis data gevonden. Voeg eerst reis componenten toe aan de pagina.');
            return;
        }
        
        // Open route overview
        window.showRouteOverview(travelData);
    });
    
    return section;
};

ComponentFactory.initRoadbookRondreis = function(root) {
    try {
        const scope = root || document;
        const blocks = (() => {
            try {
                if (scope && scope.nodeType === 1 && scope.classList && scope.classList.contains('wb-roadbook-rondreis')) {
                    return [scope];
                }
            } catch (e0) {}
            try {
                return Array.from((scope || document).querySelectorAll('.wb-roadbook-rondreis'));
            } catch (e1) {
                return [];
            }
        })();
        blocks.forEach((block) => {
            try {
                if (!block || block.dataset.rrInited === '1') return;
                block.dataset.rrInited = '1';

                const pageHome = block.querySelector('.rr-page-home');
                const pageDetail = block.querySelector('.rr-page-detail');
                try {
                    if (pageHome && pageDetail && pageHome.contains(pageDetail) && pageHome.parentNode) {
                        pageHome.parentNode.insertBefore(pageDetail, pageHome.nextSibling);
                    }
                } catch (eFixNest) {}
                const placesView = block.querySelector('.rr-places-view');
                const detailView = block.querySelector('.rr-detail-view');
                const showPlaces = () => {
                    try {
                        if (pageHome && pageDetail) {
                            pageHome.style.display = 'block';
                            pageDetail.style.display = 'none';
                        } else {
                            if (placesView) placesView.style.display = 'flex';
                            if (detailView) detailView.style.display = 'none';
                        }
                    } catch (e) {}
                };
                const showDetail = () => {
                    try {
                        if (pageHome && pageDetail) {
                            pageHome.style.display = 'none';
                            pageDetail.style.display = 'block';
                        } else {
                            if (placesView) placesView.style.display = 'none';
                            if (detailView) detailView.style.display = 'flex';
                        }
                    } catch (e) {}
                };

                const rrData = (() => {
                    try {
                        const d = block._roadbookData || {};
                        const gs = block._rrGroupedStops;
                        return { data: d, groupedStops: Array.isArray(gs) ? gs : [] };
                    } catch (e) {
                        return { data: {}, groupedStops: [] };
                    }
                })();

                const renderThumbStrip = (wrapEl, images, kind, isEditMode) => {
                    try {
                        if (!wrapEl) return;
                        const imgs = (Array.isArray(images) ? images : []).filter(Boolean).slice(0, 12);
                        const canEdit = !!isEditMode;
                        const thumbsHtml = imgs.map((u, idx) => {
                            const slides = encodeURIComponent(JSON.stringify([String(u)]));
                            return `
                                <div class="rr-thumb placeImg" draggable="${canEdit ? 'true' : 'false'}" data-wb-slides="${slides}" data-wb-slide-idx="0" data-rr-thumb-kind="${String(kind || '')}" data-rr-thumb-idx="${idx}" style="position:relative;flex:0 0 auto;width:120px;height:78px;border-radius:12px;overflow:hidden;background:#f3f4f6;border:1px solid #e5e7eb;cursor:${canEdit ? 'grab' : 'pointer'};">
                                    <img src="${String(u)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
                                    ${canEdit ? `<button type="button" class="rr-thumb-remove" data-rr-thumb-kind="${String(kind || '')}" data-rr-thumb-idx="${idx}" style="position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:999px;border:1px solid rgba(255,255,255,.85);background:rgba(17,24,39,.55);color:#fff;font-weight:900;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;">×</button>` : ''}
                                </div>
                            `;
                        }).join('');
                        const addHtml = canEdit ? `
                            <button type="button" class="rr-thumb-add" data-rr-thumb-kind="${String(kind || '')}" style="flex:0 0 auto;width:120px;height:78px;border-radius:12px;border:1px dashed #cbd5e1;background:#fff;color:#0f172a;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;">+ Foto</button>
                        ` : '';
                        wrapEl.innerHTML = `${thumbsHtml}${addHtml}`;
                    } catch (e) {}
                };

                const getWbMode = () => {
                    try {
                        const m = (document.body && document.body.dataset && document.body.dataset.wbMode) || (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.wbMode) || '';
                        return String(m || '').trim().toLowerCase();
                    } catch (e) { return ''; }
                };
                const isEditMode = () => {
                    try {
                        const here = (
                            getWbMode() === 'edit' ||
                            !!window.PropertiesPanel ||
                            !!window.dragDropManager
                        );
                        if (here) return true;
                        // Builder sometimes injects edit controls in parent window
                        const p = window.parent;
                        return !!(p && (p.PropertiesPanel || p.dragDropManager));
                    } catch (e) {
                        return getWbMode() === 'edit';
                    }
                };

                const getStopBtnEl = (idx) => {
                    try { return block.querySelector(`.rr-stop-item[data-stop-index="${idx}"]`); } catch (e) { return null; }
                };
                const getStoredSlides = (btn, attr) => {
                    try {
                        if (!btn) return [];
                        const raw = btn.getAttribute(attr) || '';
                        const parsed = parseSlidesAttr(raw);
                        return (Array.isArray(parsed) ? parsed : []).filter(Boolean).map(String);
                    } catch (e) { return []; }
                };
                const setStoredSlides = (btn, attr, slides) => {
                    try {
                        if (!btn) return;
                        const list = (Array.isArray(slides) ? slides : []).filter(Boolean).map(String).slice(0, 12);
                        btn.setAttribute(attr, encodeURIComponent(JSON.stringify(list)));
                    } catch (e) {}
                };

                const setDetailStop = (idx) => {
                    try {
                        const i = parseInt(String(idx), 10);
                        if (Number.isNaN(i)) return;
                        const stops = rrData.groupedStops;
                        if (!Array.isArray(stops) || !stops.length) return;
                        const s = stops[i];
                        if (!s) return;
                        block._rrActiveIdx = i;

                        const heroWrap = block.querySelector('.rr-detail-hero.placeImg');
                        const heroImg = block.querySelector('.rr-detail-hero-img');
                        const titleEl = block.querySelector('.rr-detail-title');
                        const subEl = block.querySelector('.rr-detail-sub');
                        const h1El = block.querySelector('.rr-detail-h1');
                        const hotelLine = block.querySelector('.rr-detail-hotel-line');
                        const hotelMeta = block.querySelector('.rr-detail-hotel-meta');
                        const destText = block.querySelector('.rr-detail-text');
                        const hotelDesc = block.querySelector('.rr-hotel-desc');
                        const hotelTitleEl = block.querySelector('.rr-hotel-title');
                        const hotelMetaEl = block.querySelector('.rr-hotel-meta');
                        const thumbsDest = block.querySelector('.rr-detail-thumbs');
                        const thumbsHotel = block.querySelector('.rr-hotel-thumbs');
                        const excText = block.querySelector('.rr-excursies-text');
                        const hotelMapCanvas = block.querySelector('.rr-hotel-map-canvas');

                        const stopBtnEl = getStopBtnEl(i);

                        const dayLabel = `Dag ${s.fromDay}${(s.toDay && s.toDay !== s.fromDay) ? `-${s.toDay}` : ''}`;
                        const storedDest = getStoredSlides(stopBtnEl, 'data-rr-dest-slides');
                        const destImages = storedDest.length ? storedDest : (Array.isArray(s.destImages) && s.destImages.length ? s.destImages : [s.img].filter(Boolean));
                        const mainImg = destImages[0] || s.img;
                        if (heroImg && mainImg) heroImg.src = String(mainImg);
                        if (heroWrap) {
                            heroWrap._wbSlides = destImages;
                            heroWrap.dataset.wbSlideInited = '0';
                            heroWrap.dataset.wbSlideIdx = '0';
                            heroWrap.setAttribute('data-wb-slides', encodeURIComponent(JSON.stringify(destImages)));
                        }
                        if (titleEl) titleEl.textContent = s.name || 'Bestemming';
                        if (subEl) subEl.textContent = dayLabel;
                        if (h1El) h1El.textContent = s.name || 'Bestemming';

                        try {
                            const stripToText = (raw) => {
                                try {
                                    const s0 = String(raw || '');
                                    if (!s0.trim()) return '';
                                    // Decode common entities first (so &lt;p&gt; becomes <p>)
                                    const decoded = s0
                                        .replace(/&nbsp;/g, ' ')
                                        .replace(/&amp;/g, '&')
                                        .replace(/&lt;/g, '<')
                                        .replace(/&gt;/g, '>')
                                        .replace(/&quot;/g, '"')
                                        .replace(/&#39;/g, "'")
                                        .trim();

                                    // If HTML-like, parse and take textContent
                                    if (/[<>]/.test(decoded)) {
                                        const doc = new DOMParser().parseFromString(decoded, 'text/html');
                                        const txt = (doc && doc.body && doc.body.textContent) ? doc.body.textContent : '';
                                        return String(txt || '')
                                            .replace(/\u00a0/g, ' ')
                                            .replace(/\s+/g, ' ')
                                            .trim();
                                    }

                                    return decoded
                                        .replace(/\u00a0/g, ' ')
                                        .replace(/\s+/g, ' ')
                                        .trim();
                                } catch (e) {
                                    return String(raw || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                                }
                            };

                            const items = Array.isArray(s.items) ? s.items : [];
                            const descHitRaw = items
                                .map(it => it && (it.description || it.text || it.summary || it.fullDescription || ''))
                                .map(x => String(x || '').trim())
                                .find(x => !!x) || '';
                            const descHit = stripToText(descHitRaw);
                            if (destText) {
                                if (descHit) {
                                    destText.textContent = descHit;
                                } else {
                                    destText.textContent = 'Beschrijving van de bestemming...';
                                }
                            }
                        } catch (eD) {}

                        const h = s.hotel || null;
                        const hotelTitle = h && (h.name || h.location) ? [h.name, h.location].filter(Boolean).join(' · ') : (h && h.name ? h.name : 'Hotel');
                        if (hotelLine) {
                            hotelLine.textContent = '';
                            try { hotelLine.style.display = 'none'; } catch (e0) {}
                        }
                        try {
                            if (hotelDesc) {
                                const rawHotel = (h && h.description) ? String(h.description) : '';
                                const cleaned = (() => {
                                    try {
                                        const s0 = String(rawHotel || '').trim();
                                        if (!s0) return '';
                                        const decoded = s0
                                            .replace(/&nbsp;/g, ' ')
                                            .replace(/&amp;/g, '&')
                                            .replace(/&lt;/g, '<')
                                            .replace(/&gt;/g, '>')
                                            .replace(/&quot;/g, '"')
                                            .replace(/&#39;/g, "'")
                                            .trim();
                                        const withBreaks = decoded.replace(/<\s*br\s*\/?\s*>/gi, '\n');
                                        if (/[<>]/.test(withBreaks)) {
                                            const doc = new DOMParser().parseFromString(withBreaks, 'text/html');
                                            const txt = (doc && doc.body && doc.body.textContent) ? doc.body.textContent : '';
                                            return String(txt || '').replace(/\u00a0/g, ' ').replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n').trim();
                                        }
                                        return withBreaks.replace(/\u00a0/g, ' ').trim();
                                    } catch (e0) {
                                        return String(rawHotel || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                                    }
                                })();
                                hotelDesc.textContent = cleaned || 'Hotel informatie...';
                            }
                        } catch (eHDesc) {
                            if (hotelDesc) hotelDesc.textContent = (h && h.description) ? String(h.description) : 'Hotel informatie...';
                        }

                        try {
                            if (hotelMeta) {
                                hotelMeta.textContent = '';
                                try { hotelMeta.style.display = 'none'; } catch (e0) {}
                            }
                            if (hotelTitleEl) hotelTitleEl.textContent = hotelTitle || '';
                            if (hotelMetaEl) {
                                const metaParts = [h && h.roomType ? String(h.roomType) : '', h && h.meals ? String(h.meals) : '']
                                    .map(x => String(x || '').trim())
                                    .filter(Boolean);
                                hotelMetaEl.textContent = metaParts.join(' · ');
                            }
                        } catch (eHM) {}

                        try {
                            if (hotelMapCanvas) {
                                const lat = (s && s.latitude != null) ? Number(s.latitude) : null;
                                const lng = (s && s.longitude != null) ? Number(s.longitude) : null;
                                if (typeof L !== 'undefined' && lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
                                    try {
                                        if (block._rrHotelLeafletMap && typeof block._rrHotelLeafletMap.remove === 'function') {
                                            try { block._rrHotelLeafletMap.remove(); } catch (eR) {}
                                        }
                                        hotelMapCanvas.innerHTML = `<div class="rr-hotel-leaflet" style="width:100%;height:170px;"></div>`;
                                        const mapEl = hotelMapCanvas.querySelector('.rr-hotel-leaflet');
                                        const map = L.map(mapEl, { zoomControl: false, attributionControl: false, dragging: true }).setView([lat, lng], 13);
                                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
                                        L.marker([lat, lng]).addTo(map);
                                        block._rrHotelLeafletMap = map;
                                        setTimeout(() => { try { map.invalidateSize(); } catch (eInv) {} }, 50);
                                    } catch (eL) {
                                        hotelMapCanvas.textContent = 'Ligging hotel';
                                    }
                                } else if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
                                    const delta = 0.02;
                                    const left = lng - delta;
                                    const right = lng + delta;
                                    const top = lat + delta;
                                    const bottom = lat - delta;
                                    const bbox = encodeURIComponent([left, bottom, right, top].join(','));
                                    const marker = encodeURIComponent([lat, lng].join(','));
                                    hotelMapCanvas.innerHTML = `
                                        <iframe
                                            width="100%"
                                            height="170"
                                            frameborder="0"
                                            style="border:0;display:block;"
                                            src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}"
                                            allowfullscreen>
                                        </iframe>
                                    `;
                                } else {
                                    hotelMapCanvas.textContent = 'Ligging hotel';
                                }
                            }
                        } catch (eMap) {}

                        try {
                            const norm = (x) => String(x || '').replace(/^Dag\s*\d+\s*:\s*/i, '').trim().toLowerCase();
                            const placeKey = norm(s.name);
                            const all = Array.isArray(rrData.data && rrData.data.activities) ? rrData.data.activities : [];
                            const acts = all.filter(a => {
                                try {
                                    const lk = norm(a && (a.location || a.city || a.destination || ''));
                                    return lk && placeKey && (lk === placeKey || lk.includes(placeKey) || placeKey.includes(lk));
                                } catch (e0) { return false; }
                            }).slice(0, 6);
                            if (excText) {
                                if (!acts.length) {
                                    excText.textContent = 'Excursies en tips...';
                                } else {
                                    const safe = (v) => {
                                        try { return (typeof escapeHtml === 'function') ? escapeHtml(String(v || '')) : String(v || ''); } catch (e0) { return String(v || ''); }
                                    };
                                    excText.innerHTML = acts.map((a) => {
                                        const meta = [a.date || a.startDate || '', a.time || '', a.provider || ''].filter(Boolean).join(' · ');
                                        const loc = a.location || a.city || '';
                                        const meta2 = [meta, loc].filter(Boolean).join(' · ');
                                        const desc = String(a.description || '').trim();
                                        return `
                                            <div style="margin-bottom:12px;">
                                                <div style="font-weight:900;color:#111827;">${safe(a.name || 'Excursie')}</div>
                                                ${meta2 ? `<div style=\"margin-top:3px;color:#6b7280;font-weight:800;font-size:12px;\">${safe(meta2)}</div>` : ''}
                                                ${desc ? `<div style=\"margin-top:6px;\">${safe(desc)}</div>` : ''}
                                            </div>
                                        `;
                                    }).join('');
                                }
                            }
                        } catch (eAct) {}

                        const storedHotel = getStoredSlides(stopBtnEl, 'data-rr-hotel-slides');
                        const hotelImages = storedHotel.length ? storedHotel : (h && Array.isArray(h.images) ? h.images : []);
                        renderThumbStrip(thumbsDest, destImages, 'dest', isEditMode());
                        renderThumbStrip(thumbsHotel, hotelImages, 'hotel', isEditMode());

                        try { initSlideshows(); } catch (e2) {}
                    } catch (e) {}
                };

                const parseSlidesAttr = (raw) => {
                    let s = String(raw || '').trim();
                    if (!s) return [];
                    try {
                        s = s
                            .replace(/&quot;/g, '"')
                            .replace(/&#34;/g, '"')
                            .replace(/&#39;/g, "'")
                            .replace(/&amp;/g, '&');
                    } catch (e0) {}
                    try {
                        let decoded = decodeURIComponent(s);
                        try {
                            if (/%5B|%7B|%22/i.test(decoded)) decoded = decodeURIComponent(decoded);
                        } catch (e11) {}
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

                const initSlideshows = () => {
                    try {
                        const wraps = Array.from(block.querySelectorAll('.placeImg[data-wb-slides]'));
                        wraps.forEach((wrap) => {
                            try {
                                if (!wrap || wrap.dataset.wbSlideInited === '1') return;
                                const imgEl = wrap.querySelector('img');
                                if (!imgEl) return;
                                let slides = parseSlidesAttr(wrap.getAttribute('data-wb-slides') || '');
                                slides = Array.isArray(slides) ? slides.filter(Boolean) : [];
                                if (slides.length <= 1) return;
                                wrap.dataset.wbSlideInited = '1';
                                wrap._wbSlides = slides;
                                const setIdx = (nextIdx) => {
                                    try {
                                        const slidesNow = Array.isArray(wrap._wbSlides) ? wrap._wbSlides : slides;
                                        const n = slidesNow.length;
                                        let idx = parseInt(String(nextIdx), 10);
                                        if (Number.isNaN(idx)) idx = 0;
                                        idx = ((idx % n) + n) % n;
                                        wrap.dataset.wbSlideIdx = String(idx);
                                        imgEl.src = slidesNow[idx];
                                    } catch (e2) {}
                                };
                                setIdx(parseInt(wrap.dataset.wbSlideIdx || '0', 10) || 0);

                                const bindNav = (selector, delta) => {
                                    const b = wrap.querySelector(selector);
                                    if (!b || b.dataset.wbBound === '1') return;
                                    b.dataset.wbBound = '1';
                                    b.addEventListener('click', (ev) => {
                                        try {
                                            ev.preventDefault();
                                            ev.stopPropagation();
                                            const idx = parseInt(wrap.dataset.wbSlideIdx || '0', 10) || 0;
                                            setIdx(idx + delta);
                                        } catch (e9) {}
                                    }, true);
                                };
                                bindNav('.wb-slide-prev', -1);
                                bindNav('.wb-slide-next', 1);
                            } catch (e1) {}
                        });
                    } catch (e) {}
                };

                const setActiveStop = (idx) => {
                    try {
                        const i = parseInt(String(idx), 10);
                        if (Number.isNaN(i)) return;
                        const items = Array.from(block.querySelectorAll('.rr-stop-item'));
                        const details = Array.from(block.querySelectorAll('.rr-stop-detail'));

                        items.forEach((b) => {
                            const active = String(b.dataset.stopIndex) === String(i);
                            b.style.borderColor = active ? 'rgba(6,97,104,0.35)' : '#e5e7eb';
                            b.style.boxShadow = active ? '0 6px 20px rgba(0,0,0,0.08)' : 'none';
                        });
                        details.forEach((d) => {
                            d.style.display = (String(d.dataset.stopIndex) === String(i)) ? 'block' : 'none';
                        });

                        const activeItem = items.find(b => String(b.dataset.stopIndex) === String(i)) || null;
                        const label = block.querySelector('.rr-active-stop-label');
                        if (label && activeItem) {
                            const title = activeItem.querySelector('div[style*="font-weight:900"]');
                            label.textContent = title ? title.textContent.trim() : '';
                        }

                        const firstPanel = block.querySelector(`.rr-stop-detail[data-stop-index="${i}"] .rr-tab-panel[data-tab="transport"]`);
                        const det = block.querySelector(`.rr-stop-detail[data-stop-index="${i}"]`);
                        if (det) {
                            const panels = Array.from(det.querySelectorAll('.rr-tab-panel'));
                            const btns = Array.from(det.querySelectorAll('.rr-tab-btn'));
                            panels.forEach(p => p.style.display = 'none');
                            btns.forEach(b => {
                                b.style.background = '#fff';
                                b.style.borderColor = '#e5e7eb';
                                b.style.color = '#111827';
                            });
                            if (firstPanel) firstPanel.style.display = 'block';
                            const firstBtn = det.querySelector('.rr-tab-btn[data-tab="transport"]');
                            if (firstBtn) {
                                firstBtn.style.background = 'rgba(6,97,104,0.12)';
                                firstBtn.style.borderColor = 'rgba(6,97,104,0.25)';
                                firstBtn.style.color = '#0f172a';
                            }
                        }

                        initSlideshows();
                    } catch (e) {}
                };

                try {
                    block._rrSetActiveStop = setActiveStop;
                    block._rrShowDetail = showDetail;
                    block._rrShowPlaces = showPlaces;
                    block._rrSetDetailStop = setDetailStop;
                } catch (e00) {}

                try {
                    const backBtn = block.querySelector('.rr-back-btn');
                    if (backBtn && backBtn.dataset.rrBound !== '1') {
                        backBtn.dataset.rrBound = '1';
                        backBtn.addEventListener('click', (ev) => {
                            try {
                                ev.preventDefault();
                                ev.stopPropagation();
                                showPlaces();
                                const panel = block.querySelector('.rr-panel') || block.querySelector('.rr-right') || block;
                                if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            } catch (e) {}
                        }, true);
                    }
                } catch (e0) {}

                block.addEventListener('click', (e) => {
                    try {
                        const t = e && e.target ? (e.target.nodeType === 1 ? e.target : e.target.parentElement) : null;
                        if (!t || !t.closest) return;

                        const wbMode = (document.body && document.body.dataset && document.body.dataset.wbMode) || (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.wbMode) || '';
                        const isEdit = (() => {
                            try {
                                if (String(wbMode || '').trim().toLowerCase() === 'edit') return true;
                                if (window.PropertiesPanel || window.dragDropManager) return true;
                                const p = window.parent;
                                return !!(p && (p.PropertiesPanel || p.dragDropManager));
                            } catch (e) {
                                return String(wbMode || '').trim().toLowerCase() === 'edit';
                            }
                        })();

                        const thumbRemove = t.closest('.rr-thumb-remove');
                        if (thumbRemove && block.contains(thumbRemove) && isEdit) {
                            e.preventDefault();
                            e.stopPropagation();
                            const kind = String(thumbRemove.dataset.rrThumbKind || '').trim() || 'dest';
                            const idx = parseInt(String(thumbRemove.dataset.rrThumbIdx || '-1'), 10);
                            const cur = parseInt(String(block._rrActiveIdx || '0'), 10) || 0;
                            const stopBtnEl = getStopBtnEl(cur);
                            const attr = (kind === 'hotel') ? 'data-rr-hotel-slides' : 'data-rr-dest-slides';
                            let slides = getStoredSlides(stopBtnEl, attr);
                            if (!slides.length) {
                                const stops = rrData.groupedStops;
                                const s = stops && stops[cur] ? stops[cur] : null;
                                if (kind === 'hotel') slides = (s && s.hotel && Array.isArray(s.hotel.images)) ? s.hotel.images.slice() : [];
                                else slides = (s && Array.isArray(s.destImages)) ? s.destImages.slice() : [s && s.img].filter(Boolean);
                            }
                            if (!Number.isNaN(idx) && idx >= 0 && idx < slides.length) {
                                slides.splice(idx, 1);
                                setStoredSlides(stopBtnEl, attr, slides);
                            }
                            setDetailStop(cur);
                            return;
                        }

                        const thumbAdd = t.closest('.rr-thumb-add');
                        if (thumbAdd && block.contains(thumbAdd) && isEdit && window.MediaPicker && typeof window.MediaPicker.openImage === 'function') {
                            e.preventDefault();
                            e.stopPropagation();
                            (async () => {
                                try {
                                    const kind = String(thumbAdd.dataset.rrThumbKind || '').trim() || 'dest';
                                    const cur = parseInt(String(block._rrActiveIdx || '0'), 10) || 0;
                                    const stopBtnEl = getStopBtnEl(cur);
                                    const attr = (kind === 'hotel') ? 'data-rr-hotel-slides' : 'data-rr-dest-slides';
                                    let slides = getStoredSlides(stopBtnEl, attr);
                                    if (!slides.length) {
                                        const stops = rrData.groupedStops;
                                        const s = stops && stops[cur] ? stops[cur] : null;
                                        if (kind === 'hotel') slides = (s && s.hotel && Array.isArray(s.hotel.images)) ? s.hotel.images.slice() : [];
                                        else slides = (s && Array.isArray(s.destImages)) ? s.destImages.slice() : [s && s.img].filter(Boolean);
                                    }
                                    const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash', allowUpload: true });
                                    const pickedUrl = res && (res.fullUrl || res.regularUrl || res.url || res.dataUrl);
                                    if (!pickedUrl) return;
                                    slides.push(String(pickedUrl));
                                    setStoredSlides(stopBtnEl, attr, slides);
                                    setDetailStop(cur);
                                } catch (e0) {}
                            })();
                            return;
                        }

                        const nav = t.closest('.rr-nav');
                        if (nav && block.contains(nav)) {
                            try {
                                e.preventDefault();
                                e.stopPropagation();
                                const k = String(nav.dataset.rrNav || '').trim();
                                if (k === 'detail') {
                                    showDetail();
                                } else if (k === 'home') {
                                    showPlaces();
                                }
                                const href = nav.getAttribute('href') || '';
                                if (href && href.startsWith('#')) {
                                    const el = block.querySelector(href);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            } catch (e1) {}
                            return;
                        }

                        const stopBtn = t.closest('.rr-stop-item');
                        if (stopBtn && block.contains(stopBtn)) {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveStop(stopBtn.dataset.stopIndex);
                            try {
                                if (pageHome && pageDetail) {
                                    try { setDetailStop(stopBtn.dataset.stopIndex); } catch (e22) {}
                                    showDetail();
                                    if (pageDetail) pageDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                } else {
                                    showDetail();
                                    const detail = block.querySelector('#rr-detail') || block.querySelector('.rr-detail-view');
                                    if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            } catch (e2) {}
                            return;
                        }

                        const backPage = t.closest('.rr-page-back');
                        if (backPage && block.contains(backPage)) {
                            e.preventDefault();
                            e.stopPropagation();
                            showPlaces();
                            return;
                        }

                        const prevBtn = t.closest('.rr-page-prev');
                        if (prevBtn && block.contains(prevBtn)) {
                            e.preventDefault();
                            e.stopPropagation();
                            const cur = parseInt(String(block._rrActiveIdx || '0'), 10) || 0;
                            const n = rrData.groupedStops.length || 0;
                            const next = n ? ((cur - 1 + n) % n) : 0;
                            setDetailStop(next);
                            return;
                        }

                        const nextBtn = t.closest('.rr-page-next');
                        if (nextBtn && block.contains(nextBtn)) {
                            e.preventDefault();
                            e.stopPropagation();
                            const cur = parseInt(String(block._rrActiveIdx || '0'), 10) || 0;
                            const n = rrData.groupedStops.length || 0;
                            const next = n ? ((cur + 1) % n) : 0;
                            setDetailStop(next);
                            return;
                        }

                        const thumb = t.closest('.rr-thumb');
                        if (thumb && block.contains(thumb) && !isEdit) {
                            try {
                                const heroWrap = block.querySelector('.rr-detail-hero.placeImg');
                                const heroImg = block.querySelector('.rr-detail-hero-img');
                                const u = thumb.querySelector('img') ? thumb.querySelector('img').src : '';
                                if (u && heroImg) heroImg.src = u;
                                if (u && heroWrap) {
                                    const cur = parseInt(String(block._rrActiveIdx || '0'), 10) || 0;
                                    const stopBtnEl = getStopBtnEl(cur);
                                    setStoredSlides(stopBtnEl, 'data-rr-dest-slides', [u]);
                                    heroWrap.dataset.wbSlideIdx = '0';
                                    heroWrap._wbSlides = [u];
                                    heroWrap.setAttribute('data-wb-slides', encodeURIComponent(JSON.stringify([u])));
                                }
                            } catch (e9) {}
                            return;
                        }

                        const tabBtn = t.closest('.rr-tab-btn');
                        if (tabBtn && block.contains(tabBtn)) {
                            e.preventDefault();
                            e.stopPropagation();
                            const det = tabBtn.closest('.rr-stop-detail');
                            if (!det) return;
                            const tab = tabBtn.dataset.tab;
                            const panels = Array.from(det.querySelectorAll('.rr-tab-panel'));
                            const btns = Array.from(det.querySelectorAll('.rr-tab-btn'));
                            panels.forEach(p => p.style.display = (p.dataset.tab === tab) ? 'block' : 'none');
                            btns.forEach(b => {
                                const active = b.dataset.tab === tab;
                                b.style.background = active ? 'rgba(6,97,104,0.12)' : '#fff';
                                b.style.borderColor = active ? 'rgba(6,97,104,0.25)' : '#e5e7eb';
                                b.style.color = '#0f172a';
                            });
                            return;
                        }

                        if (isEdit && window.MediaPicker && (typeof window.MediaPicker.openImage === 'function' || typeof window.MediaPicker.openVideo === 'function')) {
                            try {
                                const sup = Number(block._rrSuppressMediaClickUntil || 0);
                                if (sup && Date.now() < sup) return;
                            } catch (eSup) {}
                            if (t.closest('.wb-slide-prev, .wb-slide-next')) return;
                            const ce = t.closest('[contenteditable="true"]');
                            // Keep normal text editing unless user explicitly wants media edit
                            if (ce && !(e && (e.altKey || e.shiftKey))) {
                                // Allow double-click on HOME hero title/subtitle to open picker
                                const inHomeHero = !!(ce && ce.closest && ce.closest('.rr-hero-media'));
                                const dbl = !!(e && typeof e.detail === 'number' && e.detail >= 2);
                                if (!(inHomeHero && dbl)) return;
                            }
                            let wrap = t.closest('.placeImg[data-wb-slides]') || t.closest('.placeImg');
                            if (!wrap) {
                                try {
                                    const hero = t.closest('.rr-hero-media') || t.closest('.rr-detail-left');
                                    if (hero) wrap = hero.querySelector('.placeImg[data-wb-slides]') || hero.querySelector('.placeImg');
                                } catch (e00) {}
                            }
                            // Prefer explicit home hero image wrapper when clicking inside home hero
                            try {
                                const homeHero = t.closest('.rr-hero-media');
                                if (homeHero) {
                                    const w = homeHero.querySelector('.rr-hero-img.placeImg[data-wb-slides]') || homeHero.querySelector('.rr-hero-img.placeImg') || null;
                                    if (w) wrap = w;
                                }
                            } catch (e00b) {}
                            if (!wrap || !block.contains(wrap)) return;
                            const imgEl = wrap.querySelector('img');
                            e.preventDefault();
                            e.stopPropagation();
                            (async () => {
                                try {
                                    const wantsVideo = !!(e && (e.altKey || e.shiftKey));
                                    const picker = (wantsVideo && typeof window.MediaPicker.openVideo === 'function')
                                        ? window.MediaPicker.openVideo
                                        : window.MediaPicker.openImage;
                                    if (typeof picker !== 'function') return;

                                    const res = await picker({ defaultTab: 'unsplash', allowUpload: true });
                                    const pickedUrl = res && (res.fullUrl || res.regularUrl || res.url || res.dataUrl || res.videoUrl || res.embedUrl);
                                    if (!pickedUrl) return;

                                    const isVideo = wantsVideo || (res && (res.type === 'video' || String(res.type || '').includes('video')));

                                    if (isVideo) {
                                        const hadNav = !!wrap.querySelector('.wb-slide-prev, .wb-slide-next');
                                        const url = String(pickedUrl);
                                        if (/youtube\.com|youtu\.be|vimeo\.com/.test(url)) {
                                            wrap.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;border:0;" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
                                        } else {
                                            wrap.innerHTML = `<video src="${url}" style="width:100%;height:100%;object-fit:cover;display:block;" autoplay muted loop playsinline controls></video>`;
                                        }
                                        if (hadNav) {
                                            try {
                                                // no-op: nav hidden for video
                                            } catch (e9) {}
                                        }
                                        return;
                                    }

                                    let slides = parseSlidesAttr(wrap.getAttribute('data-wb-slides') || '');
                                    slides = Array.isArray(slides) ? slides.filter(Boolean) : [];
                                    const idx = parseInt(wrap.dataset.wbSlideIdx || '0', 10) || 0;
                                    if (slides.length) {
                                        slides[idx] = pickedUrl;
                                    } else {
                                        slides = [pickedUrl];
                                        wrap.dataset.wbSlideIdx = '0';
                                    }
                                    wrap._wbSlides = slides;
                                    wrap.setAttribute('data-wb-slides', encodeURIComponent(JSON.stringify(slides)));
                                    if (imgEl) {
                                        if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(imgEl, pickedUrl);
                                        else imgEl.src = pickedUrl;
                                    } else {
                                        wrap.innerHTML = `<img src="${pickedUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">`;
                                    }

                                    try {
                                        const cur = parseInt(String(block._rrActiveIdx || '0'), 10) || 0;
                                        const stopBtnEl = getStopBtnEl(cur);
                                        if (stopBtnEl) {
                                            if (wrap.classList && wrap.classList.contains('rr-detail-hero')) {
                                                setStoredSlides(stopBtnEl, 'data-rr-dest-slides', slides);
                                            } else if (wrap.closest && wrap.closest('.rr-detail-thumbs')) {
                                                setStoredSlides(stopBtnEl, 'data-rr-dest-slides', slides);
                                            } else if (wrap.closest && wrap.closest('.rr-hotel-thumbs')) {
                                                setStoredSlides(stopBtnEl, 'data-rr-hotel-slides', slides);
                                            }
                                        }
                                    } catch (ePersist) {}
                                    try {
                                        wrap.dataset.wbSlideInited = '0';
                                        initSlideshows();
                                    } catch (e3) {}
                                } catch (e4) {}
                            })();
                            return;
                        }
                    } catch (e0) {}
                }, true);

                try {
                    if (block.dataset.rrHomeHeroMediaBound !== '1') {
                        block.dataset.rrHomeHeroMediaBound = '1';
                        const openHomeHeroPicker = (ev, isDbl) => {
                            try {
                                const isEdit = isEditMode();
                                if (!isEdit) return;
                                if (!window.MediaPicker || (typeof window.MediaPicker.openImage !== 'function' && typeof window.MediaPicker.openVideo !== 'function')) return;
                                const t0 = (ev && ev.target) ? (ev.target.nodeType === 1 ? ev.target : ev.target.parentElement) : null;
                                let t1 = null;
                                try {
                                    if (typeof ev.clientX === 'number' && typeof ev.clientY === 'number') {
                                        t1 = document.elementFromPoint(ev.clientX, ev.clientY);
                                    }
                                } catch (ePt) {}
                                const nodes = [t0, t1].filter(Boolean);
                                const homeHero = nodes.map(n => (n && n.closest) ? n.closest('.rr-page-home .rr-hero-media') : null).find(Boolean);
                                if (!homeHero || !block.contains(homeHero)) return;
                                const ce = nodes.map(n => (n && n.closest) ? n.closest('[contenteditable="true"]') : null).find(Boolean);
                                if (ce && !(ev && (ev.altKey || ev.shiftKey)) && !isDbl) return;
                                const wrap = homeHero.querySelector('.rr-hero-img.placeImg[data-wb-slides]') || homeHero.querySelector('.rr-hero-img.placeImg');
                                if (!wrap) return;
                                try { block._rrSuppressMediaClickUntil = Date.now() + 700; } catch (eSup2) {}
                                ev.preventDefault();
                                ev.stopPropagation();
                                (async () => {
                                    try {
                                        const wantsVideo = !!(ev && (ev.altKey || ev.shiftKey));
                                        const picker = (wantsVideo && typeof window.MediaPicker.openVideo === 'function')
                                            ? window.MediaPicker.openVideo
                                            : window.MediaPicker.openImage;
                                        if (typeof picker !== 'function') return;
                                        const res = await picker({ defaultTab: 'unsplash', allowUpload: true });
                                        const pickedUrl = res && (res.fullUrl || res.regularUrl || res.url || res.dataUrl || res.videoUrl || res.embedUrl);
                                        if (!pickedUrl) return;
                                        const imgEl = wrap.querySelector('img');
                                        const isVideo = wantsVideo || (res && (res.type === 'video' || String(res.type || '').includes('video')));
                                        if (isVideo) {
                                            const url = String(pickedUrl);
                                            if (/youtube\.com|youtu\.be|vimeo\.com/.test(url)) {
                                                wrap.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;border:0;" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
                                            } else {
                                                wrap.innerHTML = `<video src="${url}" style="width:100%;height:100%;object-fit:cover;display:block;" autoplay muted loop playsinline controls></video>`;
                                            }
                                            return;
                                        }
                                        let slides = parseSlidesAttr(wrap.getAttribute('data-wb-slides') || '');
                                        slides = Array.isArray(slides) ? slides.filter(Boolean) : [];
                                        const idx = parseInt(wrap.dataset.wbSlideIdx || '0', 10) || 0;
                                        if (slides.length) slides[idx] = pickedUrl;
                                        else {
                                            slides = [pickedUrl];
                                            wrap.dataset.wbSlideIdx = '0';
                                        }
                                        wrap._wbSlides = slides;
                                        wrap.setAttribute('data-wb-slides', encodeURIComponent(JSON.stringify(slides)));
                                        if (imgEl) {
                                            if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(imgEl, pickedUrl);
                                            else imgEl.src = pickedUrl;
                                        } else {
                                            wrap.innerHTML = `<img src="${pickedUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">`;
                                        }
                                        try {
                                            wrap.dataset.wbSlideInited = '0';
                                            initSlideshows();
                                        } catch (eRe) {}
                                    } catch (eOpen) {}
                                })();
                            } catch (eH) {}
                        };
                        block.addEventListener('pointerdown', (ev) => openHomeHeroPicker(ev, false), true);
                        block.addEventListener('dblclick', (ev) => openHomeHeroPicker(ev, true), true);
                    }
                } catch (eBindHero) {}

                // Drag & drop reorder for thumbnails (dest/hotel)
                try {
                    if (block.dataset.rrThumbDndBound !== '1') {
                        block.dataset.rrThumbDndBound = '1';
                        block._rrThumbDrag = null;

                        block.addEventListener('dragstart', (ev) => {
                            try {
                                const isEdit = isEditMode();
                                if (!isEdit) return;
                                const el = ev && ev.target ? (ev.target.nodeType === 1 ? ev.target : ev.target.parentElement) : null;
                                const thumb = el && el.closest ? el.closest('.rr-thumb') : null;
                                if (!thumb || !block.contains(thumb)) return;
                                const kind = String(thumb.dataset.rrThumbKind || '').trim() || 'dest';
                                const fromIdx = parseInt(String(thumb.dataset.rrThumbIdx || '0'), 10);
                                if (Number.isNaN(fromIdx)) return;
                                block._rrThumbDrag = { kind, fromIdx };
                                try {
                                    ev.dataTransfer.effectAllowed = 'move';
                                    ev.dataTransfer.setData('text/plain', `${kind}:${fromIdx}`);
                                } catch (e0) {}
                            } catch (e) {}
                        }, true);

                        block.addEventListener('dragover', (ev) => {
                            try {
                                const isEdit = isEditMode();
                                if (!isEdit) return;
                                const el = ev && ev.target ? (ev.target.nodeType === 1 ? ev.target : ev.target.parentElement) : null;
                                const over = el && el.closest ? (el.closest('.rr-thumb') || el.closest('.rr-thumb-add') || el.closest('.rr-detail-thumbs') || el.closest('.rr-hotel-thumbs')) : null;
                                if (!over || !block.contains(over)) return;
                                ev.preventDefault();
                                try { ev.dataTransfer.dropEffect = 'move'; } catch (e0) {}
                            } catch (e) {}
                        }, true);

                        block.addEventListener('drop', (ev) => {
                            try {
                                const isEdit = isEditMode();
                                if (!isEdit) return;
                                const drag = block._rrThumbDrag;
                                if (!drag || !drag.kind) return;

                                const el = ev && ev.target ? (ev.target.nodeType === 1 ? ev.target : ev.target.parentElement) : null;
                                if (!el || !el.closest) return;

                                const cur = parseInt(String(block._rrActiveIdx || '0'), 10) || 0;
                                const stopBtnEl = getStopBtnEl(cur);
                                const attr = (drag.kind === 'hotel') ? 'data-rr-hotel-slides' : 'data-rr-dest-slides';

                                const strip = el.closest(drag.kind === 'hotel' ? '.rr-hotel-thumbs' : '.rr-detail-thumbs');
                                if (!strip || !block.contains(strip)) return;

                                let toIdx = null;
                                const toThumb = el.closest('.rr-thumb');
                                if (toThumb && strip.contains(toThumb)) {
                                    const v = parseInt(String(toThumb.dataset.rrThumbIdx || '0'), 10);
                                    if (!Number.isNaN(v)) toIdx = v;
                                } else {
                                    // drop on strip / add button => to end
                                    toIdx = 9999;
                                }

                                // Rebuild current list from stored slides OR current DOM
                                let slides = getStoredSlides(stopBtnEl, attr);
                                if (!slides.length) {
                                    slides = Array.from(strip.querySelectorAll('.rr-thumb img')).map(n => (n.currentSrc || n.src)).filter(Boolean);
                                }
                                slides = Array.isArray(slides) ? slides.filter(Boolean).map(String) : [];
                                if (!slides.length) return;

                                const fromIdx = drag.fromIdx;
                                if (fromIdx < 0 || fromIdx >= slides.length) return;

                                ev.preventDefault();
                                ev.stopPropagation();

                                const [moved] = slides.splice(fromIdx, 1);
                                let insertAt = (toIdx == null) ? slides.length : toIdx;
                                if (insertAt < 0) insertAt = 0;
                                if (insertAt > slides.length) insertAt = slides.length;
                                slides.splice(insertAt, 0, moved);

                                setStoredSlides(stopBtnEl, attr, slides);
                                block._rrThumbDrag = null;
                                try { setDetailStop(cur); } catch (e1) {}
                            } catch (e) {}
                        }, true);

                        block.addEventListener('dragend', () => {
                            try { block._rrThumbDrag = null; } catch (e) {}
                        }, true);
                    }
                } catch (eDnd) {}

                try {
                    const first = block.querySelector('.rr-stop-item');
                    if (first) setActiveStop(first.dataset.stopIndex || '0');
                    if (pageHome && pageDetail) {
                        try { setDetailStop(first ? (first.dataset.stopIndex || '0') : '0'); } catch (e7) {}
                    }
                } catch (e1) {}

                try { showPlaces(); } catch (e3) {}

                try { initSlideshows(); } catch (e2) {}
            } catch (e0) {}
        });
    } catch (e) {}
};
// Fallback: ensure stop clicks always open details, even if init timing was missed
try {
    if (document && document.documentElement && document.documentElement.dataset.wbRrClickFallback !== '1') {
        document.documentElement.dataset.wbRrClickFallback = '1';
        document.addEventListener('click', (e) => {
            try {
                const t = e && e.target ? (e.target.nodeType === 1 ? e.target : e.target.parentElement) : null;
                if (!t || !t.closest) return;

                const backBtn = t.closest('.rr-page-back');
                if (backBtn) {
                    const block = backBtn.closest('.wb-roadbook-rondreis');
                    if (!block) return;

                    // If not inited yet, init just this block
                    try {
                        if (block.dataset.rrInited !== '1' && window.ComponentFactory && typeof window.ComponentFactory.initRoadbookRondreis === 'function') {
                            window.ComponentFactory.initRoadbookRondreis(block);
                        }
                    } catch (e1) {}

                    try {
                        e.preventDefault();
                        e.stopPropagation();
                    } catch (e2) {}

                    try {
                        block._rrShowPlaces && block._rrShowPlaces();
                    } catch (e3) {}

                    try {
                        const pageHome = block.querySelector('.rr-page-home');
                        const pageDetail = block.querySelector('.rr-page-detail');
                        if (pageHome && pageDetail) {
                            try { pageHome.style.display = 'block'; } catch (e66) {}
                            try { pageDetail.style.display = 'none'; } catch (e67) {}
                            try { pageHome.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e68) {}
                            return;
                        }
                    } catch (e4) {}
                    return;
                }
                const stopBtn = t.closest('.rr-stop-item');
                if (!stopBtn) return;
                const block = stopBtn.closest('.wb-roadbook-rondreis');
                if (!block) return;

                // If not inited yet, init just this block
                try {
                    if (block.dataset.rrInited !== '1' && window.ComponentFactory && typeof window.ComponentFactory.initRoadbookRondreis === 'function') {
                        window.ComponentFactory.initRoadbookRondreis(block);
                    }
                } catch (e1) {}

                // Drive UI
                try {
                    e.preventDefault();
                    e.stopPropagation();
                } catch (e2) {}

                try { block._rrSetActiveStop && block._rrSetActiveStop(stopBtn.dataset.stopIndex); } catch (e3) {}
                try { block._rrSetDetailStop && block._rrSetDetailStop(stopBtn.dataset.stopIndex); } catch (e33) {}
                try { block._rrShowDetail && block._rrShowDetail(); } catch (e4) {}
                try {
                    const pageHome = block.querySelector('.rr-page-home');
                    const pageDetail = block.querySelector('.rr-page-detail');
                    try {
                        if (pageHome && pageDetail && pageHome.contains(pageDetail) && pageHome.parentNode) {
                            pageHome.parentNode.insertBefore(pageDetail, pageHome.nextSibling);
                        }
                    } catch (eFixNest2) {}
                    if (pageHome && pageDetail) {
                        try { pageHome.style.display = 'none'; } catch (e66) {}
                        try { pageDetail.style.display = 'block'; } catch (e67) {}
                    }
                    if (pageDetail && getComputedStyle(pageDetail).display !== 'none') {
                        pageDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        return;
                    }
                } catch (e55) {}
                try {
                    const detail = block.querySelector('#rr-detail') || block.querySelector('.rr-detail-view');
                    if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } catch (e5) {}
            } catch (e0) {}
        }, true);
    }
} catch (e) {}

try {
    if (document && document.documentElement && document.documentElement.dataset.wbRrHomeHeroGlobalBound !== '1') {
        document.documentElement.dataset.wbRrHomeHeroGlobalBound = '1';

        const __rrIsEdit = () => {
            try {
                const wbMode = (document.body && document.body.dataset && document.body.dataset.wbMode) || (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.wbMode) || '';
                if (String(wbMode || '').trim().toLowerCase() === 'edit') return true;
                if (window.PropertiesPanel || window.dragDropManager) return true;
                const p = window.parent;
                return !!(p && (p.PropertiesPanel || p.dragDropManager));
            } catch (e) { return false; }
        };

        const __rrOpenHomeHero = (ev, isDbl) => {
            try {
                if (!__rrIsEdit()) return;
                if (!window.MediaPicker || (typeof window.MediaPicker.openImage !== 'function' && typeof window.MediaPicker.openVideo !== 'function')) return;

                const x = (ev && typeof ev.clientX === 'number') ? ev.clientX : null;
                const y = (ev && typeof ev.clientY === 'number') ? ev.clientY : null;
                if (x == null || y == null) return;

                let hero = null;
                try {
                    const els = (typeof document.elementsFromPoint === 'function') ? document.elementsFromPoint(x, y) : [];
                    hero = (els || []).map(n => (n && n.closest) ? n.closest('.rr-page-home .rr-hero-media') : null).find(Boolean) || null;
                } catch (e0) { hero = null; }
                if (!hero) return;

                const block = hero.closest('.wb-roadbook-rondreis');
                if (!block) return;

                try {
                    const sup = Number(block._rrSuppressMediaClickUntil || 0);
                    if (sup && Date.now() < sup) return;
                } catch (eSup) {}

                const ce = (ev && ev.target && ev.target.closest) ? ev.target.closest('[contenteditable="true"]') : null;
                if (ce && !(ev && (ev.altKey || ev.shiftKey)) && !isDbl) return;

                const wrap = hero.querySelector('.rr-hero-img.placeImg[data-wb-slides]') || hero.querySelector('.rr-hero-img.placeImg');
                if (!wrap) return;

                try { block._rrSuppressMediaClickUntil = Date.now() + 700; } catch (eSup2) {}
                try {
                    ev.preventDefault();
                    ev.stopPropagation();
                } catch (eP) {}

                (async () => {
                    try {
                        const wantsVideo = !!(ev && (ev.altKey || ev.shiftKey));
                        const picker = (wantsVideo && typeof window.MediaPicker.openVideo === 'function')
                            ? window.MediaPicker.openVideo
                            : window.MediaPicker.openImage;
                        if (typeof picker !== 'function') return;

                        const res = await picker({ defaultTab: 'unsplash', allowUpload: true });
                        const pickedUrl = res && (res.fullUrl || res.regularUrl || res.url || res.dataUrl || res.videoUrl || res.embedUrl);
                        if (!pickedUrl) return;

                        const imgEl = wrap.querySelector('img');
                        const isVideo = wantsVideo || (res && (res.type === 'video' || String(res.type || '').includes('video')));
                        if (isVideo) {
                            const url = String(pickedUrl);
                            if (/youtube\.com|youtu\.be|vimeo\.com/.test(url)) {
                                wrap.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;border:0;" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
                            } else {
                                wrap.innerHTML = `<video src="${url}" style="width:100%;height:100%;object-fit:cover;display:block;" autoplay muted loop playsinline controls></video>`;
                            }
                            return;
                        }

                        let slides = parseSlidesAttr(wrap.getAttribute('data-wb-slides') || '');
                        slides = Array.isArray(slides) ? slides.filter(Boolean) : [];
                        const idx = parseInt(wrap.dataset.wbSlideIdx || '0', 10) || 0;
                        if (slides.length) slides[idx] = pickedUrl;
                        else {
                            slides = [pickedUrl];
                            wrap.dataset.wbSlideIdx = '0';
                        }
                        wrap._wbSlides = slides;
                        wrap.setAttribute('data-wb-slides', encodeURIComponent(JSON.stringify(slides)));
                        if (imgEl) {
                            if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(imgEl, pickedUrl);
                            else imgEl.src = pickedUrl;
                        } else {
                            wrap.innerHTML = `<img src="${pickedUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">`;
                        }
                        try {
                            wrap.dataset.wbSlideInited = '0';
                            if (block && typeof block._wbInitSlideshows === 'function') block._wbInitSlideshows();
                        } catch (eRe) {}
                    } catch (e1) {}
                })();
            } catch (e2) {}
        };

        document.addEventListener('pointerdown', (ev) => __rrOpenHomeHero(ev, false), true);
        document.addEventListener('dblclick', (ev) => __rrOpenHomeHero(ev, true), true);
    }
} catch (e) {}

// Animated Travel Route Map - Mapbox GL JS animated routes
ComponentFactory.createAnimatedRouteMap = function(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-animated-route-map';
        section.setAttribute('data-component', 'animated-route-map');
        section.id = this.generateId('animated_route_map');
        
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);
        
        // Container for map
        const mapContainer = document.createElement('div');
        mapContainer.className = 'animated-map-container';
        mapContainer.style.cssText = 'width: 100%; height: 600px; position: relative; border-radius: 12px; overflow: hidden;';
        
        // Map element
        const mapEl = document.createElement('div');
        mapEl.className = 'animated-map';
        mapEl.style.cssText = 'width: 100%; height: 100%;';
        mapContainer.appendChild(mapEl);
        
        // Control panel
        const controls = document.createElement('div');
        controls.className = 'map-controls';
        controls.style.cssText = 'position: absolute; top: 20px; right: 20px; z-index: 10; display: flex; gap: 8px;';
        controls.innerHTML = `
            <button class="btn btn-primary map-play" style="background: #667eea; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                <i class="fas fa-play"></i> Afspelen
            </button>
            <button class="btn btn-secondary map-reset" style="background: #f3f4f6; color: #374151; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                <i class="fas fa-redo"></i> Reset
            </button>
        `;
        mapContainer.appendChild(controls);
        
        section.appendChild(mapContainer);
        
        // Default routes
        const defaultRoutes = options.routes || [
            {
                from: { name: 'Amsterdam', coords: [4.9041, 52.3676] },
                to: { name: 'New York', coords: [-74.0060, 40.7128] },
                mode: 'flight',
                duration: 3000
            },
            {
                from: { name: 'New York', coords: [-74.0060, 40.7128] },
                to: { name: 'Boston', coords: [-71.0589, 42.3601] },
                mode: 'car',
                duration: 2000
            }
        ];
        
        // Store routes on section
        section._routes = defaultRoutes;
        
        // Initialize map when section is added to DOM
        const initMap = () => {
            // Check if element is in DOM
            if (!mapEl.offsetParent && !document.body.contains(mapEl)) {
                console.log('[AnimatedRouteMap] Element not in DOM yet, waiting...');
                setTimeout(initMap, 100);
                return;
            }
            
            if (typeof AnimatedTravelMap !== 'undefined') {
                console.log('[AnimatedRouteMap] Initializing map...');
                const travelMap = new AnimatedTravelMap(mapEl, {
                    routes: section._routes,
                    autoplay: false,
                    style: 'mapbox://styles/mapbox/light-v11'
                });
                
                section._travelMap = travelMap;
                
                // Control buttons
                const playBtn = controls.querySelector('.map-play');
                const resetBtn = controls.querySelector('.map-reset');
                
                playBtn.addEventListener('click', () => {
                    console.log('[AnimatedRouteMap] Play button clicked');
                    // Wait for map to be fully loaded
                    const startWhenReady = () => {
                        if (travelMap.map && travelMap.map.loaded()) {
                            travelMap.startAnimation();
                        } else {
                            console.log('[AnimatedRouteMap] Waiting for map to load...');
                            setTimeout(startWhenReady, 500);
                        }
                    };
                    startWhenReady();
                });
                
                resetBtn.addEventListener('click', () => {
                    console.log('[AnimatedRouteMap] Reset button clicked');
                    if (travelMap.map && travelMap.map.loaded()) {
                        travelMap.reset();
                    }
                });
            } else {
                console.error('[AnimatedRouteMap] AnimatedTravelMap class not loaded');
                mapEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;"><div><i class="fas fa-exclamation-triangle" style="font-size:48px;margin-bottom:12px;"></i><div>Mapbox GL JS niet geladen</div></div></div>';
            }
        };
        
        // Start initialization
        setTimeout(initMap, 100);
        
        this.makeSelectable(section);
        
        return section;
};

// Travel Filter Bar - Standalone filter component
ComponentFactory.createTravelFilterBar = function(options = {}) {
    const section = document.createElement('section');
    section.className = 'wb-component wb-travel-filter-bar';
    section.setAttribute('data-component', 'travel-filter-bar');
    section.id = this.generateId('travel_filter_bar');
    
    const toolbar = this.createToolbar();
    section.appendChild(toolbar);
    this.addTypeBadge(section);
    
    const title = options.title || 'Filter Reizen';
    const filters = options.filters || ['Alle', 'Strand', 'Rondreis', 'Stedentrip', 'Safari', 'Cultuur', 'Natuur', 'Avontuur', 'Luxe'];
    const activeFilter = options.activeFilter || 'Alle';
    
    section.style.cssText = `
        max-width: 1200px;
        margin: 40px auto;
        padding: 0 20px;
    `;
    
    const container = document.createElement('div');
    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
            <h3 contenteditable="true" style="
                font-size: 24px;
                font-weight: 700;
                color: #1a202c;
                margin: 0;
            ">${title}</h3>
        </div>
        
        <div class="filter-buttons" style="
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
            align-items: center;
        ">
            ${filters.map(filter => `
                <button 
                    class="travel-filter-btn ${filter === activeFilter ? 'active' : ''}" 
                    data-filter="${filter.toLowerCase()}"
                    style="
                        padding: 12px 24px;
                        border: 2px solid ${filter === activeFilter ? '#667eea' : '#e5e7eb'};
                        background: ${filter === activeFilter ? '#667eea' : 'white'};
                        color: ${filter === activeFilter ? 'white' : '#374151'};
                        border-radius: 24px;
                        font-weight: 600;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        white-space: nowrap;
                    "
                    onmouseover="if(!this.classList.contains('active')) { this.style.borderColor='#667eea'; this.style.color='#667eea'; }"
                    onmouseout="if(!this.classList.contains('active')) { this.style.borderColor='#e5e7eb'; this.style.color='#374151'; }"
                >
                    ${filter}
                </button>
            `).join('')}
        </div>
        
        <div style="
            text-align: center;
            margin-top: 20px;
            font-size: 13px;
            color: #6b7280;
        ">
            <i class="fas fa-info-circle"></i> Klik op een filter om reizen te filteren
        </div>
    `;
    
    section.appendChild(container);
    
    // Add click handlers for filters
    setTimeout(() => {
        const filterBtns = section.querySelectorAll('.travel-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Remove active from all
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'white';
                    b.style.color = '#374151';
                    b.style.borderColor = '#e5e7eb';
                });
                
                // Add active to clicked
                btn.classList.add('active');
                btn.style.background = '#667eea';
                btn.style.color = 'white';
                btn.style.borderColor = '#667eea';
                
                const filter = btn.dataset.filter;
                console.log('[TravelFilterBar] Filter selected:', filter);
                
                // Dispatch custom event for Travel Overview to listen to
                const filterEvent = new CustomEvent('travelFilterChange', {
                    bubbles: true,
                    detail: { filter: filter }
                });
                document.dispatchEvent(filterEvent);
                
                // Try to find and trigger Travel Overview filter
                const travelOverview = document.querySelector('.wb-travel-overview');
                if (travelOverview) {
                    const overviewFilterBtn = Array.from(travelOverview.querySelectorAll('.travel-filter-btn'))
                        .find(b => b.textContent.toLowerCase().includes(filter) || filter === 'alle');
                    
                    if (overviewFilterBtn) {
                        overviewFilterBtn.click();
                        
                        // Smooth scroll to Travel Overview
                        setTimeout(() => {
                            travelOverview.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                    }
                }
            });
        });
    }, 100);
    
    this.makeSelectable(section);
    return section;
};

ComponentFactory.initRoadbookRouteMaps = function(root) {
    try {
        const scope = root || document;
        const banners = Array.from(scope.querySelectorAll('.wb-roadbook-route-map'));
        banners.forEach((banner) => {
            try {
                if (!banner || banner.dataset.wbMapInited === '1') return;
                const mapEl = banner.querySelector('.roadbook-route-map-canvas');
                if (!mapEl) return;

                if (!window.L) {
                    try {
                        mapEl.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#6b7280;font-weight:800;">Kaart niet beschikbaar</div>';
                    } catch (e0) {}
                    banner.dataset.wbMapInited = '1';
                    return;
                }

                let destinations = [];
                try {
                    const raw = banner.getAttribute('data-wb-destinations') || '';
                    const decoded = decodeURIComponent(raw);
                    destinations = JSON.parse(decoded) || [];
                } catch (e1) { destinations = []; }
                destinations = Array.isArray(destinations) ? destinations.filter(d => d && d.latitude != null && d.longitude != null) : [];

                banner.dataset.wbMapInited = '1';

                if (!destinations.length) {
                    try {
                        mapEl.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#6b7280;font-weight:800;">Geen routepunten gevonden</div>';
                    } catch (e00) {}
                    return;
                }

                try { mapEl.innerHTML = ''; } catch (e01) {}

                const lats = destinations.map(d => Number(d.latitude));
                const lngs = destinations.map(d => Number(d.longitude));
                const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
                const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;

                const map = L.map(mapEl, {
                    zoomControl: true,
                    attributionControl: false,
                    dragging: true,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    touchZoom: true
                }).setView([centerLat, centerLng], 6);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 18
                }).addTo(map);

                const routeCoords = destinations.map(d => [Number(d.latitude), Number(d.longitude)]);

                if (routeCoords.length >= 2) {
                    L.polyline(routeCoords, {
                        color: '#3b82f6',
                        weight: 4,
                        opacity: 0.85,
                        smoothFactor: 1
                    }).addTo(map);
                }

                destinations.forEach((dest, idx) => {
                    const icon = L.divIcon({
                        className: '',
                        html: `<div style="width:32px;height:32px;border-radius:999px;background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.25);">${idx + 1}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });
                    const label = String(dest.name || dest.title || '').trim();
                    const dayTxt = `Dag ${dest.fromDay || 1}${(dest.toDay && dest.toDay !== dest.fromDay) ? ` - ${dest.toDay}` : ''}`;
                    L.marker([Number(dest.latitude), Number(dest.longitude)], { icon })
                        .bindPopup(label ? `<b>${label}</b><br>${dayTxt}` : dayTxt)
                        .addTo(map);
                });

                try {
                    if (routeCoords.length >= 2) {
                        const bounds = L.latLngBounds(routeCoords);
                        map.fitBounds(bounds, { padding: [50, 50] });
                    } else {
                        map.setView(routeCoords[0], 7);
                    }
                } catch (e2) {}

                try { banner._wbLeafletMap = map; } catch (e3) {}
                setTimeout(() => { try { map.invalidateSize(); } catch (e4) {} }, 50);
            } catch (e0) {}
        });
    } catch (e) {}
};

// Travel Search Card - Metadata voor Zoek & Boek overzicht
ComponentFactory.createTravelSearchCard = function(options = {}) {
    const section = document.createElement('section');
    section.className = 'wb-component wb-travel-search-card';
    section.setAttribute('data-component', 'travel-search-card');
    section.id = this.generateId('travel_search_card');
    
    // Default values
    const title = options.title || 'Reis Titel';
    const location = options.location || 'Bestemming';
    const duration = options.duration || '7 dagen';
    const price = options.price || '€ 1.299';
    const description = options.description || 'Korte beschrijving van deze prachtige reis...';
    const image = options.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
    const tags = options.tags || 'strand,luxe';
    
    section.style.cssText = `
        display: none !important;
        position: absolute;
        top: -9999px;
        left: -9999px;
        visibility: hidden;
    `;
    
    // Store metadata as data attributes (for Travel Overview to read)
    section.setAttribute('data-travel-title', title);
    section.setAttribute('data-travel-location', location);
    section.setAttribute('data-travel-duration', duration);
    section.setAttribute('data-travel-price', price);
    section.setAttribute('data-travel-description', description);
    section.setAttribute('data-travel-image', image);
    section.setAttribute('data-travel-tags', tags);
    
    section.innerHTML = `
        <div style="
            background: white;
            border: 2px dashed #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            max-width: 800px;
            margin: 0 auto;
        ">
            <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            ">
                <span style="font-size: 32px;">🔍</span>
                <h3 style="
                    font-size: 20px;
                    font-weight: 700;
                    color: #1a202c;
                    margin: 0;
                ">Zoek & Boek Card Metadata</h3>
            </div>
            
            <p style="
                color: #6b7280;
                margin-bottom: 20px;
                line-height: 1.6;
            ">
                Dit component is <strong>onzichtbaar</strong> op de live website, maar bevat metadata 
                die gebruikt wordt in het Zoek & Boek overzicht. Vul de velden in via het properties panel.
            </p>
            
            <div style="
                background: #f9fafb;
                border-radius: 8px;
                padding: 16px;
                font-size: 14px;
                line-height: 1.8;
            ">
                <div><strong>Titel:</strong> <span data-field="title">${title}</span></div>
                <div><strong>Locatie:</strong> <span data-field="location">${location}</span></div>
                <div><strong>Duur:</strong> <span data-field="duration">${duration}</span></div>
                <div><strong>Prijs:</strong> <span data-field="price">${price}</span></div>
                <div><strong>Tags:</strong> <span data-field="tags">${tags}</span></div>
            </div>
        </div>
    `;
    
    this.makeSelectable(section);
    return section;
};

// ============================================
// ROADBOOK COMPONENT (Layout 1 - Classic)
// ============================================
ComponentFactory.createRoadbook = function(options = {}) {
    try {
        const v = String((options && options.meta && options.meta.roadbook_variant) || window.CURRENT_ROADBOOK_VARIANT || '').trim().toLowerCase();
        if (v === 'rondreis') {
            return this.createRoadbookRondreis(options);
        }
    } catch (e) {}
    const section = document.createElement('section');
    section.className = 'wb-component wb-roadbook';
    section.setAttribute('data-component', 'roadbook');
    section.id = this.generateId('roadbook');

    const routeMapId = this.generateId('roadbook_route_map');
    const accommodationsId = this.generateId('roadbook_accommodaties');
    const routeMapSectionId = this.generateId('roadbook_routekaart');
    const travelBroSectionId = this.generateId('roadbook_travelbro');
    
    const toolbar = this.createToolbar();
    section.appendChild(toolbar);
    this.addTypeBadge(section);
    
    // Default data structure
    const data = {
        title: options.title || 'Jouw Droomreis',
        departureDate: options.departureDate || '2025-06-15',
        transports: options.transports || [],
        hotels: options.hotels || [],
        itinerary: options.itinerary || [],
        destinations: options.destinations || [],
        travelBroUrl: options.travelBroUrl || options.travelbroUrl || options.broUrl || options.travel_bro_url || ''
    };
    
    // Store data on component
    section._roadbookData = data;
    
    // Get brand logo and colors from localStorage
    let brandLogo = 'https://via.placeholder.com/120x40/667eea/ffffff?text=Logo';
    let brandPrimary = '#99cc34'; // Your green color as default
    try {
        const brandSettings = localStorage.getItem('brandSettings');
        console.log('[Roadbook] Brand settings from localStorage:', brandSettings ? 'Found' : 'Not found');
        if (brandSettings) {
            const brand = JSON.parse(brandSettings);
            console.log('[Roadbook] Parsed brand:', {
                hasLogo: !!brand.logo,
                logoLength: brand.logo ? brand.logo.length : 0,
                logoPreview: brand.logo ? brand.logo.substring(0, 50) + '...' : 'none'
            });
            if (brand.logo && brand.logo.trim()) {
                brandLogo = brand.logo;
                console.log('[Roadbook] ✅ Using brand logo from settings');
            } else {
                console.warn('[Roadbook] ⚠️ No logo in brand settings, using placeholder');
            }
            // Check both old and new format
            if (brand.colors && brand.colors.primary) {
                brandPrimary = brand.colors.primary;
                console.log('[Roadbook] Using brand.colors.primary:', brandPrimary);
            } else if (brand.primaryColor) {
                brandPrimary = brand.primaryColor;
                console.log('[Roadbook] Using brand.primaryColor:', brandPrimary);
            }
        } else {
            console.log('[Roadbook] No brand settings found, using defaults');
        }
        // Apply to CSS variable
        document.documentElement.style.setProperty('--brand-primary', brandPrimary);
        console.log('[Roadbook] Applied brand color to CSS:', brandPrimary);
    } catch (e) {
        console.error('[Roadbook] Error loading brand settings:', e);
    }
    
    const routePoints = (Array.isArray(data.destinations) ? data.destinations : [])
        .map((d) => {
            try {
                const lat = d && (d.latitude != null ? d.latitude : (d.geolocation && d.geolocation.latitude));
                const lng = d && (d.longitude != null ? d.longitude : (d.geolocation && d.geolocation.longitude));
                if (lat == null || lng == null) return null;
                return {
                    name: d.name || d.title || '',
                    fromDay: d.fromDay || d.day || 1,
                    toDay: d.toDay || d.fromDay || d.day || 1,
                    latitude: lat,
                    longitude: lng
                };
            } catch (e) {
                return null;
            }
        })
        .filter(Boolean);

    const routePointsAttr = (() => {
        try { return encodeURIComponent(JSON.stringify(routePoints)); } catch (e) { return ''; }
    })();

    const itineraryPadBottom = (routePoints.length > 1) ? '0px' : '100px';
    const showRouteMap = (routePoints.length > 1);
    const travelBroUrl = String(data.travelBroUrl || '').trim();
    const hasTravelBroUrl = !!travelBroUrl;
    const showTravelBro = true;
    const showAccommodations = ((data.transports || []).length > 0 || (data.hotels || []).length > 0 || (data.cars || []).length > 0 || (data.activities || []).length > 0);
    const showItinerary = (data.itinerary && data.itinerary.length > 0);
    const itinerarySectionStyle = showRouteMap ? 'margin-bottom:0 !important;padding-bottom:0 !important;' : '';

    section.innerHTML += `
            <!-- Countdown Hero (fullwidth) -->
            <div class="roadbook-hero">
                <h1 class="roadbook-title" contenteditable="true">${data.title}</h1>
                <div class="roadbook-countdown" data-departure="${data.departureDate}">
                    <div class="countdown-item">
                        <span class="countdown-value">--</span>
                        <span class="countdown-label">Dagen</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-value">--</span>
                        <span class="countdown-label">Uren</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-value">--</span>
                        <span class="countdown-label">Minuten</span>
                    </div>
                </div>
                <p class="roadbook-departure">Vertrek: <span>${new Date(data.departureDate).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
            </div>
            
            <!-- Sticky Navigation Menu -->
            <nav class="roadbook-nav">
                <div class="roadbook-nav-content">
                    <div class="roadbook-nav-logo">
                        <img src="${brandLogo}" alt="Logo" />
                    </div>
                    <ul class="roadbook-nav-menu">
                        ${showAccommodations ? `<li><a href="#${accommodationsId}"><i class="fas fa-home"></i> Accommodaties</a></li>` : ''}
                        ${showItinerary ? `<li><a href="#itinerary"><i class="fas fa-map-marked-alt"></i> Itinerary</a></li>` : ''}
                        ${showRouteMap ? `<li><a href="#${routeMapSectionId}"><i class="fas fa-route"></i> Routekaart</a></li>` : ''}
                        ${showTravelBro ? `<li><a href="#${travelBroSectionId}"><i class="fas fa-comments"></i> TravelBRO</a></li>` : ''}
                    </ul>
                </div>
            </nav>
            
            <!-- Intro Section -->
            <div class="roadbook-intro">
                <div class="roadbook-intro-content">
                    <div class="roadbook-intro-left">
                        <h1 class="roadbook-intro-title editable" contenteditable="true" data-field="title">
                            ${data.title || 'MARIANA TRENCH'}
                            <span class="roadbook-intro-underline"></span>
                        </h1>
                        <p class="roadbook-intro-subtitle editable" contenteditable="true" data-field="subtitle">${data.subtitle || 'Deepest Place In The Ocean'}</p>
                    </div>
                    <div class="roadbook-intro-right">
                        <p class="roadbook-intro-text editable" contenteditable="true" data-field="description">${data.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sollicitudin purus sit amet elementum blandit. Sed ex quam, malesuada sem libero eu ante. Quis nec arcu eget enim. Sed cursus volutpat finibus. Morbi ut ornare purus. Vivamus congue suscipit ius nec. Fusce. Nam auctor velit nec nisi molestie, ut maximus bibendum amet. Nam dolor nunc, consequat nec sollicitudin vel, non modo vitae ex. Vestibulum molestie massa latis in auctor. Donec et ultrices erat, eu pulvinar est. Integer pretium laoreet ac sollicitudin commodo.'}</p>
                    </div>
                </div>
                
                <div class="roadbook-intro-stats">
                    <div class="roadbook-stat" data-stat-type="date">
                        <div class="roadbook-stat-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="roadbook-stat-content">
                            <div class="roadbook-stat-label editable" contenteditable="true">Aankomst Bestemming</div>
                            <div class="roadbook-stat-value editable" contenteditable="true">${new Date(data.departureDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                    </div>
                    <div class="roadbook-stat" data-stat-type="duration">
                        <div class="roadbook-stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="roadbook-stat-content">
                            <div class="roadbook-stat-label editable" contenteditable="true">Duur</div>
                            <div class="roadbook-stat-value editable" contenteditable="true">${data.duration || (data.itinerary?.length || 5)} Dagen</div>
                        </div>
                    </div>
                    <div class="roadbook-stat" data-stat-type="weather">
                        <div class="roadbook-stat-icon">
                            <i class="fas fa-sun"></i>
                        </div>
                        <div class="roadbook-stat-content">
                            <div class="roadbook-stat-label editable" contenteditable="true">Weerstype</div>
                            <div class="roadbook-stat-value editable" contenteditable="true">Zomer - 95° tot 100°</div>
                        </div>
                    </div>
                </div>
            </div>
            
        <div class="roadbook-wrapper">
            <!-- Timeline: Transport + Hotels Combined -->
            ${((data.transports || []).length > 0 || (data.hotels || []).length > 0 || (data.cars || []).length > 0 || (data.activities || []).length > 0) ? `
                <div class="roadbook-section" id="${accommodationsId}">
                    <h2 class="roadbook-section-title editable" contenteditable="true">Jouw Reis Timeline</h2>
                    <div class="roadbook-cards-carousel-wrapper">
                        <div class="roadbook-cards-grid" data-carousel="timeline">
                        ${this.createTimelineCards(data).join('')}
                        </div>
                        <div class="roadbook-carousel-nav">
                            <button class="roadbook-carousel-nav-btn" onclick="window.ComponentFactory.scrollCarousel(this, 'prev')">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="roadbook-carousel-nav-btn" onclick="window.ComponentFactory.scrollCarousel(this, 'next')">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <!-- OLD SECTIONS REMOVED -->
            ${false && data.transports.length > 0 ? `
                <div class="roadbook-section">
                    <h2 class="roadbook-section-title">Jouw Vervoer</h2>
                    <div class="roadbook-cards-carousel-wrapper">
                        <div class="roadbook-cards-grid" data-carousel="transport">
                        ${data.transports.map((t, i) => `
                            <div class="roadbook-card transport-card">
                                <div class="roadbook-card-badge">
                                    <i class="fas fa-${t.type === 'train' ? 'train' : t.type === 'bus' ? 'bus' : 'plane'}"></i>
                                </div>
                                <div class="roadbook-card-content">
                                    <div class="roadbook-card-detail" style="margin-bottom: 12px; color: var(--brand-primary, #84cc16); font-weight: 600;">
                                        <i class="fas fa-calendar-alt"></i>
                                        <span>VERTREK: ${t.date || '25 JAN, 2018'}</span>
                                    </div>
                                    
                                    <div class="roadbook-transport-route">
                                        <div class="roadbook-transport-station">
                                            <div class="roadbook-transport-station-name">${t.from || 'LOREM STA'}</div>
                                            <div class="roadbook-transport-time">${t.departureTime || '09.30'}</div>
                                            <div class="roadbook-transport-address">${t.departureAddress || 'Avenue Thiers DP 1463 06008 Nice Cedex 1'}</div>
                                        </div>
                                        <div class="roadbook-transport-arrow">
                                            <i class="fas fa-arrow-right"></i>
                                        </div>
                                        <div class="roadbook-transport-station">
                                            <div class="roadbook-transport-station-name">${t.to || 'LOREM STA'}</div>
                                            <div class="roadbook-transport-time">${t.arrivalTime || '09.30'}</div>
                                            <div class="roadbook-transport-address">${t.arrivalAddress || 'Avenue Thiers DP 1463 06008 Nice Cedex 1'}</div>
                                        </div>
                                    </div>
                                    
                                    ${t.arrivalDate ? `
                                        <div class="roadbook-card-detail" style="margin-top: 12px; color: var(--brand-primary, #84cc16); font-weight: 600;">
                                            <i class="fas fa-calendar-check"></i>
                                            <span>AANKOMST: ${t.arrivalDate}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                        </div>
                        <div class="roadbook-carousel-nav">
                            <button class="roadbook-carousel-nav-btn" onclick="window.ComponentFactory.scrollCarousel(this, 'prev')">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="roadbook-carousel-nav-btn" onclick="window.ComponentFactory.scrollCarousel(this, 'next')">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <!-- Hotels are now in the timeline above, no separate section needed -->
            
            <!-- Animated Timeline: Dag bij Dag - WordPress Style -->
            ${data.itinerary.length > 0 ? `
                <div id="itinerary" class="roadbook-animated-timeline-section" style="background: linear-gradient(to bottom, ${brandPrimary} 300px, #f9fafb 300px) !important;${itinerarySectionStyle}">
                    <!-- Header -->
                    <div class="roadbook-timeline-header">
                        <h2 class="editable" contenteditable="true">DE REIS <strong>DAG BIJ DAG</strong></h2>
                        <p class="editable" contenteditable="true">Highlights Of Your Journey</p>
                    </div>
                    
                    <!-- Inline styles for road - guaranteed to work -->
                    <style>
                        :root {
                            --brand-primary: ${brandPrimary} !important;
                        }
                        #itinerary-wrap {
                            position: relative !important;
                            padding-bottom: ${itineraryPadBottom} !important;
                            margin-bottom: 0 !important;
                        }
                        .roadbook-animated-timeline-section {
                            margin-bottom: 0 !important;
                            padding-bottom: 0 !important;
                        }
                        #itinerary-wrap > .roadbook-road {
                            position: absolute !important;
                            top: 0 !important;
                            left: 50% !important;
                            bottom: auto !important;
                            width: 74px !important;
                            background: #6b7280 !important;
                            margin-left: -37px !important;
                            border-radius: 100px !important;
                            z-index: 40 !important;
                            pointer-events: none !important;
                        }
                        #itinerary-wrap > .roadbook-road-line {
                            position: absolute !important;
                            top: 0 !important;
                            left: 50% !important;
                            bottom: auto !important;
                            width: 3px !important;
                            margin-left: -1.5px !important;
                            border: none !important;
                            border-left: none !important;
                            background-image: repeating-linear-gradient(to bottom, #fff 0px, #fff 15px, transparent 15px, transparent 30px) !important;
                            z-index: 41 !important;
                            pointer-events: none !important;
                        }
                        #car {
                            position: fixed !important;
                            left: 50% !important;
                            top: 50% !important;
                            transform: translate(-50%, -50%) !important;
                            z-index: 100 !important;
                            width: 50px !important;
                            pointer-events: none !important;
                            transition: opacity 0.3s ease !important;
                        }
                        .day .dayNum {
                            background: ${brandPrimary} !important;
                            z-index: 60 !important;
                        }
                        #itinerary-wrap > .roadbook-road-line::before {
                            content: none !important;
                            display: none !important;
                        }
                        .day .delight {
                            background: ${brandPrimary} !important;
                        }
                        .day ul li i {
                            color: ${brandPrimary} !important;
                        }
                    </style>
                    
                    <!-- Itinerary Wrap -->
                    <div id="itinerary-wrap" class="roadbook-itinerary-wrap">
                        <!-- ROAD: Gray background -->
                        <div class="roadbook-road"></div>
                        <!-- ROAD LINE: White dashed -->
                        <div class="roadbook-road-line"></div>
                        <!-- CAR: Animated car (fixed position, stays in center while scrolling) -->
                        <div id="car"><img src="/images/auto.png" alt="Car" style="width: 100%; height: auto;" onerror="this.parentElement.innerHTML='<span style=&quot;display:block;font-size:40px;line-height:1;text-align:center;&quot;>🚗</span>'; "></div>
                        
                        <!-- ITINERARY: Contains days -->
                        <div class="itinerary" style="position: relative;">
                            <!-- DAYS -->
                            ${data.itinerary.map((day, i) => {
                                const location = day.title || day.destination || 'Bestemming';
                                const isEven = i % 2 === 0;
                                const dayLabel = 'Stop ' + (i + 1);
                                const imgSrc = day.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
                                const rawImgs = day.images || day.imageUrls || day.photos || [];
                                let imgs = (Array.isArray(rawImgs) ? rawImgs : [])
                                    .map(img => img && typeof img === 'object' ? (img.url || img.src || '') : img)
                                    .filter(Boolean);
                                if (imgSrc && !imgs.includes(imgSrc)) imgs = [imgSrc, ...imgs];
                                if (!imgs.length) imgs = [imgSrc];
                                const slidesAttr = encodeURIComponent(JSON.stringify(imgs.slice(0, 12)));
                                const hasSlides = imgs.length > 1;
                                const subtitle = day.subtitle || day.location || 'Provincie / Stad';
                                const description = day.description || 'Beschrijving van deze dag...';
                                const normalizePlaceName = (s) => String(s || '').replace(/^Dag\s*\d+\s*:\s*/i, '').trim().toLowerCase();
                                const placeKey = normalizePlaceName(day.destination || day.location || location);
                                let hotelName = '';
                                try {
                                    const hotels = Array.isArray(data.hotels) ? data.hotels : [];
                                    if (placeKey && hotels.length) {
                                        const hit = hotels.find(h => {
                                            const hl = normalizePlaceName(h && (h.location || ''));
                                            return (hl && (hl === placeKey || hl.includes(placeKey) || placeKey.includes(hl)));
                                        }) || null;
                                        hotelName = hit && hit.name ? String(hit.name) : '';
                                    }
                                } catch (e) {}
                                const delight = hotelName || day.delight || 'Special experience';
                                
                                if (isEven) {
                                    // Photo LEFT, Info RIGHT
                                    return '<div class="day">' +
                                        '<div class="left placeImg" data-wb-slides="' + slidesAttr + '" data-wb-slide-idx="0">' +
                                            '<img src="' + imgSrc + '" alt="' + location + '" style="width:100%;height:100%;object-fit:cover;">' +
                                            '<button type="button" class="wb-slide-prev" style="' + (hasSlides ? 'position:absolute;left:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.65);background:rgba(17,24,39,.45);color:#fff;font-weight:900;cursor:pointer;z-index:5;display:flex;align-items:center;justify-content:center;line-height:1;' : 'display:none;') + '">&lsaquo;</button>' +
                                            '<button type="button" class="wb-slide-next" style="' + (hasSlides ? 'position:absolute;right:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.65);background:rgba(17,24,39,.45);color:#fff;font-weight:900;cursor:pointer;z-index:5;display:flex;align-items:center;justify-content:center;line-height:1;' : 'display:none;') + '">&rsaquo;</button>' +
                                        '</div>' +
                                        '<div class="right placeInfo">' +
                                            '<div class="dayNum editable" contenteditable="true">' + dayLabel + '</div>' +
                                            '<h3 class="editable" contenteditable="true">' + location + '</h3>' +
                                            '<span class="editable" contenteditable="true">' + subtitle + '</span>' +
                                            '<p class="editable" contenteditable="true">' + description + '</p>' +
                                            '<ul>' +
                                                '<li><i class="fas fa-map-marker-alt" data-wb-icon="fa-map-marker-alt" style="cursor:pointer;"></i><h6 class="editable" contenteditable="true">Bezienswaardigheid</h6><span class="editable" contenteditable="true">Bezienswaardigheden</span></li>' +
                                                '<li><i class="fas fa-shopping-bag" data-wb-icon="fa-shopping-bag" style="cursor:pointer;"></i><h6 class="editable" contenteditable="true">Winkelen</h6><span class="editable" contenteditable="true">Lokale producten</span></li>' +
                                                '<li><i class="fas fa-utensils" data-wb-icon="fa-utensils" style="cursor:pointer;"></i><h6 class="editable" contenteditable="true">Restaurant</h6><span class="editable" contenteditable="true">Lokale gerechten</span></li>' +
                                                '<li><i class="fas fa-hiking" data-wb-icon="fa-hiking" style="cursor:pointer;"></i><h6 class="editable" contenteditable="true">Activiteit</h6><span class="editable" contenteditable="true">Activiteiten</span></li>' +
                                            '</ul>' +
                                            '<div class="delight"><i class="fas fa-hotel"></i><h6>HOTEL:</h6><span class="editable" contenteditable="true">' + delight + '</span></div>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div><div class="clear"></div>';
                                } else {
                                    // Info LEFT, Photo RIGHT
                                    return '<div class="day">' +
                                        '<div class="left placeInfo">' +
                                            '<div class="dayNum editable" contenteditable="true">' + dayLabel + '</div>' +
                                            '<h3 class="editable" contenteditable="true">' + location + '</h3>' +
                                            '<span class="editable" contenteditable="true">' + subtitle + '</span>' +
                                            '<p class="editable" contenteditable="true">' + description + '</p>' +
                                            '<ul>' +
                                                '<li><i class="fas fa-map-marker-alt" data-wb-icon="fa-map-marker-alt" style="cursor:pointer;"></i><h6 class="editable" contenteditable="true">Bezienswaardigheid</h6><span class="editable" contenteditable="true">Bezienswaardigheden</span></li>' +
                                                '<li><i class="fas fa-shopping-bag" data-wb-icon="fa-shopping-bag" style="cursor:pointer;"></i><h6 class="editable" contenteditable="true">Winkelen</h6><span class="editable" contenteditable="true">Lokale producten</span></li>' +
                                                '<li><i class="fas fa-utensils" data-wb-icon="fa-utensils" style="cursor:pointer;"></i><h6 class="editable" contenteditable="true">Restaurant</h6><span class="editable" contenteditable="true">Lokale gerechten</span></li>' +
                                                '<li><i class="fas fa-hiking" data-wb-icon="fa-hiking" style="cursor:pointer;"></i><h6 class="editable" contenteditable="true">Activiteit</h6><span class="editable" contenteditable="true">Activiteiten</span></li>' +
                                            '</ul>' +
                                            '<div class="delight"><i class="fas fa-hotel"></i><h6>HOTEL:</h6><span class="editable" contenteditable="true">' + delight + '</span></div>' +
                                        '</div>' +
                                        '<div class="right placeImg" data-wb-slides="' + slidesAttr + '" data-wb-slide-idx="0">' +
                                            '<img src="' + imgSrc + '" alt="' + location + '" style="width:100%;height:100%;object-fit:cover;">' +
                                            '<button type="button" class="wb-slide-prev" style="' + (hasSlides ? 'position:absolute;left:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.65);background:rgba(17,24,39,.45);color:#fff;font-weight:900;cursor:pointer;z-index:5;display:flex;align-items:center;justify-content:center;line-height:1;' : 'display:none;') + '">&lsaquo;</button>' +
                                            '<button type="button" class="wb-slide-next" style="' + (hasSlides ? 'position:absolute;right:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.65);background:rgba(17,24,39,.45);color:#fff;font-weight:900;cursor:pointer;z-index:5;display:flex;align-items:center;justify-content:center;line-height:1;' : 'display:none;') + '">&rsaquo;</button>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div><div class="clear"></div>';
                                }
                            }).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>

        ${(routePoints.length > 1) ? `
            <div id="${routeMapSectionId}" class="wb-component edge-to-edge wb-roadbook-route-map" data-component="roadbook-route-map" data-wb-destinations="${routePointsAttr}" style="width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);margin-top:0;padding:0;">
                <div id="${routeMapId}" class="roadbook-route-map-canvas" style="width:100%;height:420px;margin:0;padding:0;"></div>
            </div>
        ` : ''}

        ${showTravelBro ? `
            <div id="${travelBroSectionId}" class="roadbook-section" style="max-width:1200px;margin:0 auto;padding:50px 24px;">
                <h2 class="roadbook-section-title editable" contenteditable="true">TravelBRO</h2>
                <div class="editable" contenteditable="true" style="color:#6b7280;margin-bottom:18px;">Scan de QR code om TravelBRO te openen.</div>
                <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">
                    ${hasTravelBroUrl ? `
                        <div style="width:220px;height:220px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;">
                            <img alt="TravelBRO QR" style="width:220px;height:220px;display:block;" src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(travelBroUrl)}" />
                        </div>
                    ` : `
                        <div style="width:220px;height:220px;border:1px dashed #d1d5db;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center;color:#6b7280;font-weight:700;text-align:center;padding:18px;box-sizing:border-box;">
                            QR volgt
                        </div>
                    `}
                    <div style="min-width:240px;flex:1;">
                        ${hasTravelBroUrl ? `<a class="editable" contenteditable="true" href="${travelBroUrl}" target="_blank" rel="noopener" style="display:inline-block;color:${brandPrimary};font-weight:700;text-decoration:none;">Open TravelBRO</a>` : `<div class="editable" contenteditable="true" style="display:inline-block;color:#6b7280;font-weight:700;">Nog geen TravelBRO gekoppeld</div>`}
                        <div class="editable" contenteditable="true" style="color:#6b7280;margin-top:10px;">(Chat / integratie met BOLT volgt.)</div>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
    
    // Start countdown
    setTimeout(() => {
        const countdownEl = section.querySelector('.roadbook-countdown');
        if (countdownEl) ComponentFactory.startRoadbookCountdown(countdownEl);
    }, 100);
    
    // Initialize animated timeline
    setTimeout(() => {
        console.log('[Roadbook] Looking for timeline section...');
        const timelineSection = section.querySelector('.roadbook-animated-timeline-section');
        console.log('[Roadbook] Timeline section found:', !!timelineSection);
        console.log('[Roadbook] RoadbookTimelineAnimation available:', !!window.RoadbookTimelineAnimation);
        if (timelineSection && window.RoadbookTimelineAnimation) {
            console.log('[Roadbook] Initializing timeline animation...');
            new window.RoadbookTimelineAnimation(timelineSection);
        } else {
            console.warn('[Roadbook] Cannot initialize timeline:', {
                section: !!timelineSection,
                animation: !!window.RoadbookTimelineAnimation
            });
        }
        
        // Set tube and line height based on itinerary content height
        const itineraryWrap = section.querySelector('#itinerary-wrap');
        const tube = itineraryWrap ? itineraryWrap.querySelector('.roadbook-road') : null;
        const line = itineraryWrap ? itineraryWrap.querySelector('.roadbook-road-line') : null;
        const itinerary = itineraryWrap ? itineraryWrap.querySelector('.itinerary') : null;
        
        console.log('[Roadbook] Road elements found:', {
            wrap: !!itineraryWrap,
            tube: !!tube,
            line: !!line,
            itinerary: !!itinerary
        });
        
        if (itineraryWrap && tube && line && itinerary) {
            const updateRoadHeight = () => {
                // End the road exactly at the bottom of the last day.
                // Using scrollHeight/offsetHeight can include extra whitespace (e.g. preview padding).
                const days = Array.from(itinerary.querySelectorAll('.day'));
                let height = 500;
                if (days.length > 0) {
                    const lastDay = days[days.length - 1];
                    height = Math.max(lastDay.offsetTop + lastDay.offsetHeight, 500);
                }
                console.log('[Roadbook] Setting road height to:', height, '(days:', days.length, ')');
                tube.style.height = height + 'px';
                line.style.height = height + 'px';
            };
            
            // Update immediately and after images load
            updateRoadHeight();
            setTimeout(updateRoadHeight, 500);
            setTimeout(updateRoadHeight, 1000);
            setTimeout(updateRoadHeight, 2000);
            setTimeout(updateRoadHeight, 3000);
            
            // Also update on window resize
            window.addEventListener('resize', updateRoadHeight);
        } else {
            console.warn('[Roadbook] Could not find road elements');
        }

        try {
            const parseSlidesAttr = (raw) => {
                let s = String(raw || '').trim();
                if (!s) return [];
                try {
                    // handle HTML-escaped attributes from stored HTML
                    s = s
                        .replace(/&quot;/g, '"')
                        .replace(/&#34;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/&amp;/g, '&');
                } catch (e0) {}
                try {
                    let decoded = decodeURIComponent(s);
                    // some content ends up double-encoded
                    try {
                        if (/%5B|%7B|%22/i.test(decoded)) decoded = decodeURIComponent(decoded);
                    } catch (e11) {}
                    const parsed = JSON.parse(decoded);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e1) {}
                try {
                    const parsed = JSON.parse(s);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e2) {}
                try {
                    // Legacy: comma or pipe separated URLs
                    const parts = s.split(/\s*[\|,]\s*/g).map(p => p.trim()).filter(Boolean);
                    return parts;
                } catch (e3) {}
                return [];
            };

            const initSlideshows = () => {
                const wraps = Array.from(section.querySelectorAll('.placeImg[data-wb-slides]'));
                wraps.forEach((wrap) => {
                    try {
                        if (!wrap || wrap.dataset.wbSlideInited === '1') return;

                        const imgEl = wrap.querySelector('img');
                        if (!imgEl) return;

                        const slidesAttrRaw = wrap.getAttribute('data-wb-slides') || '';
                        let slides = parseSlidesAttr(slidesAttrRaw);
                        slides = Array.isArray(slides) ? slides.filter(Boolean) : [];
                        if (slides.length <= 1) {
                            // Do NOT mark inited, so it can be re-initialized if slides get added later.
                            return;
                        }

                        wrap.dataset.wbSlideInited = '1';

                        wrap._wbSlides = slides;

                        const setIdx = (nextIdx, animate = true) => {
                            try {
                                const slidesNow = Array.isArray(wrap._wbSlides) ? wrap._wbSlides : slides;
                                const n = slidesNow.length;
                                let idx = parseInt(String(nextIdx), 10);
                                if (Number.isNaN(idx)) idx = 0;
                                idx = ((idx % n) + n) % n;
                                wrap.dataset.wbSlideIdx = String(idx);
                                
                                if (animate && imgEl.src) {
                                    // Add smooth fade transition for subsequent slides
                                    imgEl.style.transition = 'opacity 0.5s ease-in-out';
                                    imgEl.style.opacity = '0';
                                    setTimeout(() => {
                                        imgEl.src = slidesNow[idx];
                                        imgEl.style.opacity = '1';
                                    }, 250);
                                } else {
                                    // No animation for initial load
                                    imgEl.src = slidesNow[idx];
                                }
                            } catch (e2) {}
                        };
                        // Initial load without animation
                        setIdx(parseInt(wrap.dataset.wbSlideIdx || '0', 10) || 0, false);

                        const start = () => {
                            try {
                                // Stop any existing timer first to prevent flickering
                                if (wrap._wbSlideTimer) {
                                    clearInterval(wrap._wbSlideTimer);
                                    wrap._wbSlideTimer = null;
                                }
                                wrap._wbSlideTimer = window.setInterval(() => {
                                    try {
                                        const slidesNow = Array.isArray(wrap._wbSlides) ? wrap._wbSlides : slides;
                                        if (!slidesNow || slidesNow.length <= 1) return;
                                        const idx = parseInt(wrap.dataset.wbSlideIdx || '0', 10) || 0;
                                        setIdx(idx + 1);
                                    } catch (e3) {}
                                }, 4500);
                            } catch (e4) {}
                        };
                        const stop = () => {
                            try {
                                if (wrap._wbSlideTimer) {
                                    clearInterval(wrap._wbSlideTimer);
                                    wrap._wbSlideTimer = null;
                                }
                            } catch (e5) {}
                        };

                        wrap.addEventListener('mouseenter', stop);
                        wrap.addEventListener('mouseleave', start);

                        wrap._wbSetIdx = setIdx;
                        wrap._wbStartSlides = start;
                        wrap._wbStopSlides = stop;

                        // Bind prev/next directly to avoid any delegation edge cases
                        try {
                            const bindNav = (selector, delta) => {
                                const b = wrap.querySelector(selector);
                                if (!b || b.dataset.wbBound === '1') return;
                                b.dataset.wbBound = '1';
                                b.addEventListener('click', (ev) => {
                                    try {
                                        ev.preventDefault();
                                        ev.stopPropagation();
                                        const idx = parseInt(wrap.dataset.wbSlideIdx || '0', 10) || 0;
                                        setIdx(idx + delta);
                                        stop();
                                    } catch (e9) {}
                                }, true);
                            };
                            bindNav('.wb-slide-prev', -1);
                            bindNav('.wb-slide-next', 1);
                        } catch (e8) {}

                        start();
                    } catch (e1) {}
                });
            };

            // expose for media edits
            try { section._wbInitSlideshows = initSlideshows; } catch (e0) {}
            initSlideshows();

            if (!window.__wbRoadbookSlideshowBound) {
                window.__wbRoadbookSlideshowBound = true;
                document.addEventListener('click', (e) => {
                    try {
                        const t = (e && e.target)
                            ? (e.target.nodeType === 1 ? e.target : e.target.parentElement)
                            : null;
                        const btn = t && t.closest ? t.closest('.wb-slide-prev, .wb-slide-next') : null;
                        if (!btn) return;
                        const wrap = btn.closest('.placeImg[data-wb-slides]');
                        if (!wrap) return;

                        e.preventDefault();
                        e.stopPropagation();

                        const imgEl = wrap.querySelector('img');
                        if (!imgEl) return;

                        let slides = [];
                        try {
                            slides = JSON.parse(decodeURIComponent(wrap.getAttribute('data-wb-slides') || '')) || [];
                        } catch (e2) { slides = []; }
                        slides = Array.isArray(slides) ? slides.filter(Boolean) : [];
                        if (slides.length <= 1) return;

                        const idx = parseInt(wrap.dataset.wbSlideIdx || '0', 10) || 0;
                        const delta = btn.classList.contains('wb-slide-next') ? 1 : -1;
                        const n = slides.length;
                        const next = ((idx + delta) % n + n) % n;
                        wrap.dataset.wbSlideIdx = String(next);
                        imgEl.src = slides[next];

                        try {
                            if (wrap._wbSlideTimer) {
                                clearInterval(wrap._wbSlideTimer);
                                wrap._wbSlideTimer = null;
                            }
                        } catch (e3) {}
                    } catch (e1) {}
                }, true);
            }
        } catch (e) {}
    }, 500);

    // Allow editing destination images via MediaPicker (edit mode only)
    try {
        if (!window.__wbRoadbookMediaEditBound) {
            window.__wbRoadbookMediaEditBound = true;
            document.addEventListener('click', async (e) => {
                try {
                    const isEdit = !!(document.body && document.body.dataset && document.body.dataset.wbMode === 'edit');
                    if (!isEdit) return;
                    const t = (e && e.target)
                        ? (e.target.nodeType === 1 ? e.target : e.target.parentElement)
                        : null;
                    if (!t || !t.closest) return;
                    if (t.closest('.wb-slide-prev, .wb-slide-next')) return;
                    const imgEl = t.closest('.placeImg') ? t.closest('.placeImg').querySelector('img') : null;
                    if (!imgEl) return;
                    const wrap = imgEl.closest('.placeImg[data-wb-slides]') || imgEl.closest('.placeImg');
                    if (!wrap) return;
                    if (!section || !section.contains(wrap)) return;

                    if (!window.MediaPicker || typeof window.MediaPicker.openImage !== 'function') return;

                    e.preventDefault();
                    e.stopPropagation();

                    // Shift-click: video, otherwise image
                    if (e.shiftKey && typeof window.MediaPicker.openVideo === 'function') {
                        const vr = await window.MediaPicker.openVideo({ defaultTab: 'pexels', single: true });
                        const vUrl =
                            (vr && vr.type === 'video-playlist' && Array.isArray(vr.playlist) && vr.playlist[0]
                                ? (vr.playlist[0].url || vr.playlist[0].videoUrl || '')
                                : '') ||
                            vr?.videoUrl || vr?.fullUrl || vr?.regularUrl || vr?.url || vr?.dataUrl;
                        if (!vUrl) return;

                        const vThumb =
                            (vr && vr.type === 'video-playlist' && Array.isArray(vr.playlist) && vr.playlist[0]
                                ? (vr.playlist[0].thumbnail || vr.playlist[0].thumb || '')
                                : '') ||
                            vr?.thumbnail || vr?.thumb || '';

                        // Stop slideshow timer if running
                        try {
                            if (wrap._wbSlideTimer) {
                                clearInterval(wrap._wbSlideTimer);
                                wrap._wbSlideTimer = null;
                            }
                        } catch (e7) {}

                        // Swap to video element
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
                            try {
                                const firstChild = wrap.firstChild;
                                wrap.insertBefore(videoEl, firstChild);
                            } catch (e8) {
                                wrap.appendChild(videoEl);
                            }
                        }
                        try { videoEl.src = vUrl; } catch (e9) {}
                        try { wrap.dataset.wbVideoSrc = vUrl; } catch (e10) {}

                        // Hide image (or picture wrapper) + slideshow buttons for video
                        try {
                            const pic = imgEl.closest ? imgEl.closest('picture') : null;
                            if (pic) pic.style.display = 'none';
                            else imgEl.style.display = 'none';
                        } catch (e11) {}
                        try {
                            const prevBtn = wrap.querySelector('.wb-slide-prev');
                            const nextBtn = wrap.querySelector('.wb-slide-next');
                            if (prevBtn) prevBtn.style.display = 'none';
                            if (nextBtn) nextBtn.style.display = 'none';
                        } catch (e12) {}
                        try { videoEl.style.display = ''; } catch (e13) {}
                        try { if (vThumb) videoEl.poster = vThumb; } catch (e131) {}
                        try { videoEl.load(); } catch (e132) {}
                        try { await videoEl.play(); } catch (e14) {}

                        try { wrap.dispatchEvent(new Event('input', { bubbles: true })); } catch (e15) {}
                        try { wrap.dispatchEvent(new Event('change', { bubbles: true })); } catch (e16) {}
                        return;
                    }

                    const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash', multi: true });
                    if (!res) return;

                    const pickedList = (res && res.type === 'image-list' && Array.isArray(res.urls)) ? res.urls.filter(Boolean) : [];
                    const pickedSingle = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                    const picked = pickedList.length ? pickedList : (pickedSingle ? [pickedSingle] : []);
                    if (!picked.length) return;

                    const doAppend = !!e.altKey;

                    // If video was previously set, remove it and show image again
                    try {
                        const v = wrap.querySelector('video');
                        if (v && v.parentNode) v.parentNode.removeChild(v);
                    } catch (e17) {}
                    try { delete wrap.dataset.wbVideoSrc; } catch (e18) {}
                    try {
                        const pic = imgEl.closest ? imgEl.closest('picture') : null;
                        if (pic) pic.style.display = '';
                        else imgEl.style.display = '';
                    } catch (e19) {}

                    let slides = [];
                    try {
                        slides = JSON.parse(decodeURIComponent(wrap.getAttribute('data-wb-slides') || '')) || [];
                    } catch (e2) { slides = []; }
                    slides = Array.isArray(slides) ? slides.filter(Boolean) : [];
                    if (!slides.length) slides = [imgEl.currentSrc || imgEl.src].filter(Boolean);

                    if (doAppend) {
                        const merged = slides.concat(picked);
                        slides = Array.from(new Set(merged)).filter(Boolean);
                    } else {
                        slides = picked.slice();
                    }

                    wrap.dataset.wbSlideIdx = '0';
                    try { wrap.setAttribute('data-wb-slides', encodeURIComponent(JSON.stringify(slides.slice(0, 12)))); } catch (e3) {}
                    try { wrap._wbSlides = slides.slice(0, 12); } catch (e30) {}

                    const newSrc = slides[0];
                    try {
                        if (typeof window.__WB_applyResponsiveSrc === 'function') {
                            window.__WB_applyResponsiveSrc(imgEl, newSrc);
                        } else {
                            imgEl.src = newSrc;
                        }
                    } catch (e4) { imgEl.src = newSrc; }

                    // Show slideshow buttons again if applicable
                    try {
                        const prevBtn = wrap.querySelector('.wb-slide-prev');
                        const nextBtn = wrap.querySelector('.wb-slide-next');
                        if (prevBtn) prevBtn.style.display = (slides.length > 1) ? '' : 'none';
                        if (nextBtn) nextBtn.style.display = (slides.length > 1) ? '' : 'none';
                    } catch (e20) {}

                    try {
                        if (wrap._wbStopSlides) wrap._wbStopSlides();
                        // Allow re-init if this wrap wasn't initialized before due to legacy slide data.
                        try { wrap.dataset.wbSlideInited = '0'; } catch (e211) {}
                        try { if (section && typeof section._wbInitSlideshows === 'function') section._wbInitSlideshows(); } catch (e212) {}
                        if (slides.length > 1 && wrap._wbStartSlides) wrap._wbStartSlides();
                    } catch (e21) {}

                    try { imgEl.dispatchEvent(new Event('input', { bubbles: true })); } catch (e5) {}
                    try { imgEl.dispatchEvent(new Event('change', { bubbles: true })); } catch (e6) {}
                } catch (err) {}
            }, true);
        }
    } catch (e) {}
    
    // Store hotel data on cards for carousel
    setTimeout(() => {
        const hotelCards = section.querySelectorAll('.hotel-card');
        let hotelIndex = 0;
        hotelCards.forEach((card) => {
            const hotelData = data.hotels[hotelIndex];
            if (hotelData) {
                const images = hotelData.images || [hotelData.image] || ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'];
                card._hotelData = {
                    images: images,
                    currentImageIndex: 0
                };
                hotelIndex++;
            }
        });
    }, 100);
    
    // Setup scroll animation for timeline
    setTimeout(() => {
        const timeline = section.querySelector('.roadbook-timeline-container');
        if (timeline) ComponentFactory.setupRoadbookTimelineAnimation(timeline);
    }, 100);
    
    // Setup active menu tracking on scroll
    setTimeout(() => {
        const menuLinks = section.querySelectorAll('.roadbook-nav-menu a');
        const sections = Array.from(menuLinks).map(link => {
            const href = link.getAttribute('href');
            return href ? section.querySelector(href) : null;
        }).filter(Boolean);
        
        const updateActiveMenu = () => {
            const scrollPos = window.scrollY + 100;
            
            sections.forEach((sec, index) => {
                const top = sec.offsetTop;
                const bottom = top + sec.offsetHeight;
                
                if (scrollPos >= top && scrollPos < bottom) {
                    menuLinks.forEach(link => link.classList.remove('active'));
                    menuLinks[index]?.classList.add('active');
                }
            });
        };
        
        window.addEventListener('scroll', updateActiveMenu);
        updateActiveMenu();
    }, 100);

    // Smooth scroll for in-page Roadbook menu (works in builder + preview)
    setTimeout(() => {
        try {
            if (section.dataset.wbNavBound === '1') return;
            section.dataset.wbNavBound = '1';

            section.addEventListener('click', (e) => {
                try {
                    const t = e && e.target ? (e.target.nodeType === 1 ? e.target : e.target.parentElement) : null;
                    const a = t && t.closest ? t.closest('.roadbook-nav-menu a[href^="#"]') : null;
                    if (!a) return;

                    const href = a.getAttribute('href') || '';
                    if (!href || href.charAt(0) !== '#') return;
                    const target = section.querySelector(href);
                    if (!target) return;

                    e.preventDefault();
                    e.stopPropagation();

                    const nav = section.querySelector('.roadbook-nav');
                    const navH = nav ? (nav.getBoundingClientRect().height || 0) : 0;
                    const top = target.getBoundingClientRect().top + window.pageYOffset - navH - 10;
                    window.scrollTo({ top, behavior: 'smooth' });
                } catch (e1) {}
            }, true);
        } catch (e0) {}
    }, 120);

    try {
        if (!window.__wbRoadbookIconEditBound) {
            window.__wbRoadbookIconEditBound = true;
            document.addEventListener('click', (e) => {
                try {
                    const t = e && e.target ? e.target : null;
                    if (!t || !t.matches) return;
                    if (!t.matches('.wb-roadbook i[data-wb-icon]')) return;
                    e.preventDefault();
                    e.stopPropagation();

                    const current = (t.getAttribute('data-wb-icon') || '').trim() || 'fa-star';

                    const applyIcon = (cls) => {
                        try {
                            const clean = String(cls || '').trim();
                            if (!clean) return;
                            t.setAttribute('data-wb-icon', clean);
                            t.className = `fas ${clean}`;
                            try { t.dispatchEvent(new Event('input', { bubbles: true })); } catch (e2) {}
                            try { t.dispatchEvent(new Event('change', { bubbles: true })); } catch (e3) {}
                        } catch (e4) {}
                    };

                    // Preferred: reuse existing IconPicker modal
                    if (window.IconPicker && typeof window.IconPicker.open === 'function') {
                        window.IconPicker.open({ current, compact: true })
                            .then((res) => {
                                try {
                                    const picked = res && res.icon ? res.icon : '';
                                    if (picked) applyIcon(picked);
                                } catch (e5) {}
                            })
                            .catch(() => {});
                        return;
                    }

                    // Fallback: prompt if IconPicker isn't available
                    const next = window.prompt('FontAwesome icon class (bijv. fa-hiking):', current);
                    if (!next) return;
                    applyIcon(next);
                } catch (e1) {}
            }, true);
        }
    } catch (e) {}
    
    // Apply roadbook colors on load
    setTimeout(() => {
        // Get brand primary color if no custom color is set
        const brandPrimary = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim() || '#84cc16';
        const primaryColor = section.dataset.roadbookPrimaryColor || brandPrimary;
        
        // Set default if not already set
        if (!section.dataset.roadbookPrimaryColor) {
            section.dataset.roadbookPrimaryColor = brandPrimary;
        }
        
        // Apply primary color (but keep section titles black)
        const nav = section.querySelector('.roadbook-nav');
        if (nav) nav.style.borderBottomColor = primaryColor;
        const subtitle = section.querySelector('.roadbook-intro-subtitle');
        if (subtitle) subtitle.style.color = primaryColor;
        const underline = section.querySelector('.roadbook-intro-underline');
        if (underline) underline.style.background = primaryColor;
        section.querySelectorAll('.roadbook-stat-icon').forEach(icon => {
            icon.style.background = primaryColor;
        });
        // Apply to card badges
        section.querySelectorAll('.roadbook-card-badge').forEach(badge => {
            badge.style.background = primaryColor;
        });
        
        // Apply secondary color
        if (section.dataset.roadbookSecondaryColor) {
            const color = section.dataset.roadbookSecondaryColor;
            section.querySelectorAll('.roadbook-card-more').forEach(btn => {
                btn.style.backgroundColor = color;
                btn.style.borderColor = color;
            });
        }
    }, 200);
    
    this.makeSelectable(section);
    return section;
};

// Create Timeline Cards (Transport + Hotels in chronological order)
ComponentFactory.createTimelineCards = function(data) {
    console.log('[createTimelineCards] Input data:', {
        transports: data.transports?.length,
        cars: data.cars?.length,
        activities: data.activities?.length,
        hotels: data.hotels?.length,
        firstHotel: data.hotels?.[0]
    });
    
    // Get brand primary color
    const brandPrimary = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim() || '#84cc16';
    
    const cards = [];
    
    // Add transport cards
    (data.transports || []).forEach((t, i) => {
        cards.push({
            type: 'transport',
            date: t.date || t.departureDate,
            html: `
                <div class="roadbook-card transport-card">
                    <div class="roadbook-card-badge">
                        <i class="fas fa-${t.type === 'train' ? 'train' : t.type === 'bus' ? 'bus' : 'plane'}"></i>
                    </div>
                    <div class="roadbook-card-content">
                        <div style="margin-bottom: 16px;">
                            <div style="margin-bottom: 8px;">
                                <i class="fas fa-plane" style="color: ${brandPrimary}; font-size: 1.2rem;"></i>
                            </div>
                            <div class="editable" contenteditable="true" style="color: ${brandPrimary}; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                VERTREK: ${t.date || '25 JAN, 2018'}
                            </div>
                        </div>
                        
                        ${t.company ? `
                            <div class="roadbook-card-detail" style="margin-bottom: 8px; font-weight: 600; font-size: 1rem;">
                                <i class="fas fa-building" style="color: #6b7280;"></i>
                                <span class="editable" contenteditable="true">${t.company}</span>
                            </div>
                        ` : ''}
                        
                        ${t.flightNumber ? `
                            <div class="roadbook-card-detail" style="margin-bottom: 12px; color: #6b7280;">
                                <i class="fas fa-ticket-alt"></i>
                                <span class="editable" contenteditable="true">Vlucht ${t.flightNumber}</span>
                            </div>
                        ` : ''}
                        
                        <div class="roadbook-transport-route">
                            <div class="roadbook-transport-station">
                                <div class="roadbook-transport-station-name editable" contenteditable="true">${t.from || 'VERTREK'}</div>
                                <div class="roadbook-transport-time editable" contenteditable="true">${t.departureTime || '09:30'}</div>
                                <div class="roadbook-transport-address editable" contenteditable="true">${t.fromCity || t.from || 'Luchthaven'}</div>
                            </div>
                            <div class="roadbook-transport-arrow">
                                <i class="fas fa-arrow-right"></i>
                                ${t.duration ? `<div style="font-size: 0.75rem; color: #9ca3af; margin-top: 4px;">${t.duration}</div>` : ''}
                            </div>
                            <div class="roadbook-transport-station">
                                <div class="roadbook-transport-station-name editable" contenteditable="true">${t.to || 'AANKOMST'}</div>
                                <div class="roadbook-transport-time editable" contenteditable="true">${t.arrivalTime || '09:30'}</div>
                                <div class="roadbook-transport-address editable" contenteditable="true">${t.toCity || t.to || 'Luchthaven'}</div>
                            </div>
                        </div>
                        
                        ${t.baggageInfo ? `
                            <div class="roadbook-card-detail" style="margin-top: 12px; color: #6b7280;">
                                <i class="fas fa-suitcase"></i>
                                <span class="editable" contenteditable="true">Bagage: ${t.baggageInfo}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `
        });
    });

    // Add rental car cards
    (data.cars || []).forEach((c, i) => {
        const date = c.pickupDate || c.pickUpDate || c.date || c.startDate || '';
        const provider = c.provider || c.company || 'Huurauto';
        const vehicle = c.vehicle || c.model || '';
        const pickup = c.pickupLocation || c.pickUpLocation || '';
        const dropoff = c.dropoffLocation || c.dropOffLocation || '';

        cards.push({
            type: 'car',
            date,
            html: `
                <div class="roadbook-card transport-card">
                    <div class="roadbook-card-badge">
                        <i class="fas fa-car"></i>
                    </div>
                    <div class="roadbook-card-content">
                        <div style="margin-bottom: 16px;">
                            <div style="margin-bottom: 8px;">
                                <i class="fas fa-car" style="color: ${brandPrimary}; font-size: 1.2rem;"></i>
                            </div>
                            <div class="editable" contenteditable="true" style="color: ${brandPrimary}; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                HUURAUTO: ${date || ''}
                            </div>
                        </div>

                        <div class="roadbook-card-detail" style="margin-bottom: 8px; font-weight: 600; font-size: 1rem;">
                            <i class="fas fa-building" style="color: #6b7280;"></i>
                            <span class="editable" contenteditable="true">${provider}</span>
                        </div>

                        ${vehicle ? `
                            <div class="roadbook-card-detail" style="margin-bottom: 12px; color: #6b7280;">
                                <i class="fas fa-car-side"></i>
                                <span class="editable" contenteditable="true">${vehicle}</span>
                            </div>
                        ` : ''}

                        <div class="roadbook-transport-route">
                            <div class="roadbook-transport-station">
                                <div class="roadbook-transport-station-name editable" contenteditable="true">PICK-UP</div>
                                <div class="roadbook-transport-time editable" contenteditable="true">${c.pickupTime || c.pickUpTime || ''}</div>
                                <div class="roadbook-transport-address editable" contenteditable="true">${pickup || ''}</div>
                            </div>
                            <div class="roadbook-transport-arrow">
                                <i class="fas fa-arrow-right"></i>
                            </div>
                            <div class="roadbook-transport-station">
                                <div class="roadbook-transport-station-name editable" contenteditable="true">DROP-OFF</div>
                                <div class="roadbook-transport-time editable" contenteditable="true">${c.dropoffTime || c.dropOffTime || ''}</div>
                                <div class="roadbook-transport-address editable" contenteditable="true">${dropoff || ''}</div>
                            </div>
                        </div>

                        ${(c.dropoffDate || c.dropOffDate) ? `
                            <div class="roadbook-card-detail" style="margin-top: 12px; color: #6b7280;">
                                <i class="fas fa-calendar-check"></i>
                                <span class="editable" contenteditable="true">Inleveren: ${(c.dropoffDate || c.dropOffDate) || ''}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `
        });
    });

    // Add activity / excursion cards
    (data.activities || []).forEach((a, i) => {
        const date = a.date || a.startDate || '';
        const title = a.name || 'Excursie';
        const location = a.location || '';
        const time = a.time || '';
        const provider = a.provider || '';

        cards.push({
            type: 'activity',
            date,
            html: `
                <div class="roadbook-card transport-card">
                    <div class="roadbook-card-badge">
                        <i class="fas fa-map-signs"></i>
                    </div>
                    <div class="roadbook-card-content">
                        <div style="margin-bottom: 16px;">
                            <div style="margin-bottom: 8px;">
                                <i class="fas fa-map-signs" style="color: ${brandPrimary}; font-size: 1.2rem;"></i>
                            </div>
                            <div class="editable" contenteditable="true" style="color: ${brandPrimary}; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                ACTIVITEIT: ${date || ''}
                            </div>
                        </div>

                        <div class="roadbook-card-detail" style="margin-bottom: 8px; font-weight: 700; font-size: 1.05rem;">
                            <i class="fas fa-star" style="color: #6b7280;"></i>
                            <span class="editable" contenteditable="true">${title}</span>
                        </div>

                        ${(provider || location) ? `
                            <div class="roadbook-card-detail" style="margin-bottom: 10px; color: #6b7280;">
                                <i class="fas fa-map-marker-alt"></i>
                                <span class="editable" contenteditable="true">${[provider, location].filter(Boolean).join(' • ')}</span>
                            </div>
                        ` : ''}

                        ${time ? `
                            <div class="roadbook-card-detail" style="margin-bottom: 10px; color: #6b7280;">
                                <i class="fas fa-clock"></i>
                                <span class="editable" contenteditable="true">${time}</span>
                            </div>
                        ` : ''}

                        ${a.description ? `
                            <p class="roadbook-card-description editable" contenteditable="true">${String(a.description).substring(0, 150)}${String(a.description).length > 150 ? '...' : ''}</p>
                        ` : ''}
                    </div>
                </div>
            `
        });
    });
    
    // Add hotel cards
    (data.hotels || []).forEach((h, i) => {
        const hotelImages = h.images || [h.image] || ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'];
        console.log(`[createTimelineCards] Hotel ${i}:`, {
            name: h.name,
            checkIn: h.checkIn,
            images: hotelImages.length,
            description: h.description?.substring(0, 30)
        });
        
        cards.push({
            type: 'hotel',
            date: h.checkIn,
            html: `
                <div class="roadbook-card hotel-card" data-hotel-index="${i}">
                    <div class="roadbook-card-image">
                        <img src="${hotelImages[0]}" alt="${h.name || 'Hotel'}">
                        <div class="roadbook-card-overlay"></div>
                        <div class="roadbook-card-badge">
                            <i class="fas fa-hotel"></i>
                        </div>
                        ${hotelImages.length > 1 ? `
                            <div class="roadbook-card-carousel-controls">
                                <button class="roadbook-carousel-btn" onclick="window.ComponentFactory.prevHotelImage(this)">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="roadbook-carousel-btn" onclick="window.ComponentFactory.nextHotelImage(this)">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="roadbook-card-content">
                        <h3 class="editable" contenteditable="true">${h.name || 'Hotel'}</h3>
                        ${h.chain ? `
                            <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 8px; font-weight: 500;">
                                ${h.chain}
                            </div>
                        ` : ''}
                        ${h.description ? `
                            <p class="roadbook-card-description editable" contenteditable="true">${h.description.substring(0, 150)}${h.description.length > 150 ? '...' : ''}</p>
                        ` : ''}
                        <div class="roadbook-card-details">
                            <div class="roadbook-card-detail">
                                <i class="fas fa-map-marker-alt"></i>
                                <span class="editable" contenteditable="true">${h.location || 'Locatie'}</span>
                            </div>
                            <div class="roadbook-card-detail">
                                <i class="fas fa-calendar"></i>
                                <span class="editable" contenteditable="true">${h.checkIn || 'Check-in'} - ${h.checkOut || 'Check-out'}</span>
                            </div>
                            ${h.nights ? `
                                <div class="roadbook-card-detail">
                                    <i class="fas fa-moon"></i>
                                    <span class="editable" contenteditable="true">${h.nights} ${h.nights === 1 ? 'nacht' : 'nachten'}</span>
                                </div>
                            ` : ''}
                            ${h.roomType ? `
                                <div class="roadbook-card-detail">
                                    <i class="fas fa-bed"></i>
                                    <span class="editable" contenteditable="true">${h.roomType}</span>
                                </div>
                            ` : ''}
                            ${h.mealPlan ? `
                                <div class="roadbook-card-detail">
                                    <i class="fas fa-utensils"></i>
                                    <span class="editable" contenteditable="true">${h.mealPlan}</span>
                                </div>
                            ` : ''}
                        </div>
                        <button class="roadbook-card-more" onclick="window.ComponentFactory.openHotelDetailPanel(${JSON.stringify(h).replace(/"/g, '&quot;')})">
                            <i class="fas fa-info-circle"></i> Meer informatie
                        </button>
                    </div>
                </div>
            `
        });
    });
    
    // Sort by date (chronological order)
    console.log('[createTimelineCards] Before sort:', cards.map(c => ({ type: c.type, date: c.date })));
    
    cards.sort((a, b) => {
        // Parse dates more reliably
        const parseDate = (dateStr) => {
            if (!dateStr) return new Date('2099-12-31');
            // Handle YYYY-MM-DD format
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
                return new Date(dateStr);
            }
            return new Date(dateStr);
        };
        
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateA - dateB;
    });
    
    console.log('[createTimelineCards] After sort:', cards.map(c => ({ type: c.type, date: c.date })));
    
    return cards.map(c => c.html);
};

// Cards Carousel Navigation
ComponentFactory.scrollCarousel = function(btn, direction) {
    const wrapper = btn.closest('.roadbook-cards-carousel-wrapper');
    const carousel = wrapper.querySelector('.roadbook-cards-grid');
    const cardWidth = 380 + 24; // card width + gap
    const scrollAmount = direction === 'prev' ? -cardWidth : cardWidth;
    
    carousel.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
};

// Hotel Image Carousel Functions
ComponentFactory.prevHotelImage = function(btn) {
    const card = btn.closest('.hotel-card');
    const img = card.querySelector('.roadbook-card-image img');
    const hotelData = card._hotelData || { images: [img.src] };
    const currentIndex = hotelData.currentImageIndex || 0;
    const newIndex = currentIndex === 0 ? hotelData.images.length - 1 : currentIndex - 1;
    hotelData.currentImageIndex = newIndex;
    img.src = hotelData.images[newIndex];
    card._hotelData = hotelData;
};

ComponentFactory.nextHotelImage = function(btn) {
    const card = btn.closest('.hotel-card');
    const img = card.querySelector('.roadbook-card-image img');
    const hotelData = card._hotelData || { images: [img.src] };
    const currentIndex = hotelData.currentImageIndex || 0;
    const newIndex = (currentIndex + 1) % hotelData.images.length;
    hotelData.currentImageIndex = newIndex;
    img.src = hotelData.images[newIndex];
    card._hotelData = hotelData;
};

// Hotel Detail Panel
ComponentFactory.openHotelDetailPanel = function(hotelData) {
    // Remove existing panel
    const existing = document.querySelector('.roadbook-detail-panel');
    if (existing) existing.remove();
    const existingOverlay = document.querySelector('.roadbook-panel-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'roadbook-panel-overlay';
    overlay.onclick = () => ComponentFactory.closeHotelDetailPanel();
    document.body.appendChild(overlay);
    
    // Get hotel images
    const hotelImages = hotelData.images || [hotelData.image] || ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'];
    
    // Create panel
    const panel = document.createElement('div');
    panel.className = 'roadbook-detail-panel';
    panel.innerHTML = `
        <div class="roadbook-panel-header">
            <h2 class="roadbook-panel-title">${hotelData.name || 'Hotel Details'}</h2>
            <button class="roadbook-panel-close" onclick="window.ComponentFactory.closeHotelDetailPanel()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="roadbook-panel-content">
            <!-- Gallery -->
            <div class="roadbook-panel-gallery">
                <div class="roadbook-panel-main-image" id="panel-main-image">
                    <img src="${hotelImages[0]}" alt="${hotelData.name}">
                </div>
                ${hotelImages.length > 1 ? `
                    <div class="roadbook-panel-thumbnails">
                        ${hotelImages.map((img, i) => `
                            <div class="roadbook-panel-thumbnail ${i === 0 ? 'active' : ''}" onclick="window.ComponentFactory.switchPanelImage(${i})">
                                <img src="${img}" alt="Photo ${i + 1}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <!-- Info Grid -->
            <div class="roadbook-panel-section">
                <h3 class="roadbook-panel-section-title">
                    <i class="fas fa-info-circle"></i>
                    Informatie
                </h3>
                <div class="roadbook-panel-info-grid">
                    <div class="roadbook-panel-info-item">
                        <div class="roadbook-panel-info-icon">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div class="roadbook-panel-info-text">
                            <div class="roadbook-panel-info-label">Locatie</div>
                            <div class="roadbook-panel-info-value">${hotelData.location || 'Niet opgegeven'}</div>
                        </div>
                    </div>
                    <div class="roadbook-panel-info-item">
                        <div class="roadbook-panel-info-icon">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="roadbook-panel-info-text">
                            <div class="roadbook-panel-info-label">Check-in</div>
                            <div class="roadbook-panel-info-value">${hotelData.checkIn || 'Niet opgegeven'}</div>
                        </div>
                    </div>
                    <div class="roadbook-panel-info-item">
                        <div class="roadbook-panel-info-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="roadbook-panel-info-text">
                            <div class="roadbook-panel-info-label">Check-out</div>
                            <div class="roadbook-panel-info-value">${hotelData.checkOut || 'Niet opgegeven'}</div>
                        </div>
                    </div>
                    <div class="roadbook-panel-info-item">
                        <div class="roadbook-panel-info-icon">
                            <i class="fas fa-moon"></i>
                        </div>
                        <div class="roadbook-panel-info-text">
                            <div class="roadbook-panel-info-label">Nachten</div>
                            <div class="roadbook-panel-info-value">${hotelData.nights || 0} nachten</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Description -->
            ${hotelData.fullDescription || hotelData.description ? `
                <div class="roadbook-panel-section">
                    <h3 class="roadbook-panel-section-title">
                        <i class="fas fa-align-left"></i>
                        Beschrijving
                    </h3>
                    <p class="roadbook-panel-text">${hotelData.fullDescription || hotelData.description}</p>
                </div>
            ` : ''}
            
            <!-- Facilities -->
            <div class="roadbook-panel-section">
                <h3 class="roadbook-panel-section-title">
                    <i class="fas fa-star"></i>
                    Faciliteiten
                </h3>
                <div class="roadbook-panel-facilities">
                    <div class="roadbook-facility-tag"><i class="fas fa-wifi"></i> Gratis WiFi</div>
                    <div class="roadbook-facility-tag"><i class="fas fa-swimming-pool"></i> Zwembad</div>
                    <div class="roadbook-facility-tag"><i class="fas fa-dumbbell"></i> Fitness</div>
                    <div class="roadbook-facility-tag"><i class="fas fa-spa"></i> Spa</div>
                    <div class="roadbook-facility-tag"><i class="fas fa-utensils"></i> Restaurant</div>
                    <div class="roadbook-facility-tag"><i class="fas fa-parking"></i> Parkeren</div>
                    <div class="roadbook-facility-tag"><i class="fas fa-concierge-bell"></i> Roomservice</div>
                    <div class="roadbook-facility-tag"><i class="fas fa-cocktail"></i> Bar</div>
                </div>
            </div>
            
            <!-- Map (after facilities) -->
            ${hotelData.location ? `
                <div class="roadbook-panel-section">
                    <h3 class="roadbook-panel-section-title">
                        <i class="fas fa-map-marked-alt"></i>
                        Locatie
                    </h3>
                    <div class="roadbook-panel-map">
                        <iframe 
                            width="100%" 
                            height="250" 
                            frameborder="0" 
                            style="border:0; border-radius: 8px;" 
                            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(hotelData.location + (hotelData.name ? ' ' + hotelData.name : ''))}&zoom=14"
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    document.body.appendChild(panel);
    
    // Store images on panel for switching
    panel._hotelImages = hotelImages;
    
    // Trigger animation
    setTimeout(() => {
        overlay.classList.add('open');
        panel.classList.add('open');
    }, 10);
};

ComponentFactory.switchPanelImage = function(index) {
    const panel = document.querySelector('.roadbook-detail-panel');
    const mainImage = panel.querySelector('#panel-main-image img');
    const thumbnails = panel.querySelectorAll('.roadbook-panel-thumbnail');
    
    if (panel._hotelImages && panel._hotelImages[index]) {
        mainImage.src = panel._hotelImages[index];
        
        // Update active thumbnail
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
};

ComponentFactory.closeHotelDetailPanel = function() {
    const panel = document.querySelector('.roadbook-detail-panel');
    const overlay = document.querySelector('.roadbook-panel-overlay');
    
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    
    setTimeout(() => {
        if (panel) panel.remove();
        if (overlay) overlay.remove();
    }, 400);
};

ComponentFactory.startRoadbookCountdown = function(countdownEl) {
    if (!countdownEl) return;
    
    const departureDate = new Date(countdownEl.dataset.departure).getTime();
    
    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = departureDate - now;
        
        if (distance < 0) {
            countdownEl.innerHTML = '<p style="font-size: 24px; font-weight: 700; color: #10b981;">De reis is begonnen! 🎉</p>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        const values = countdownEl.querySelectorAll('.countdown-value');
        if (values[0]) values[0].textContent = days;
        if (values[1]) values[1].textContent = hours;
        if (values[2]) values[2].textContent = minutes;
    };
    
    updateCountdown();
    setInterval(updateCountdown, 60000); // Update every minute
};

ComponentFactory.setupRoadbookTimelineAnimation = function(container) {
    const icon = container.querySelector('.roadbook-timeline-icon');
    if (!icon) return;
    
    const updateIconPosition = () => {
        const containerRect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate scroll progress
        const scrollProgress = Math.max(0, Math.min(1, 
            (windowHeight / 2 - containerRect.top) / containerRect.height
        ));
        
        // Move icon
        const iconTop = scrollProgress * (containerRect.height - 100);
        icon.style.top = `${Math.max(0, iconTop)}px`;
    };
    
    window.addEventListener('scroll', updateIconPosition);
    updateIconPosition();
};

// Create Roadbook Animated Timeline
ComponentFactory.createRoadbookAnimatedTimeline = function(options = {}) {
    const section = document.createElement('section');
    section.className = 'wb-component roadbook-animated-timeline';
    section.setAttribute('data-component', 'roadbook-animated-timeline');
    section.id = this.generateId('roadbook_animated_timeline');
    
    const toolbar = this.createToolbar();
    section.appendChild(toolbar);
    this.addTypeBadge(section);
    
    // Get brand primary color from localStorage
    let brandPrimary = '#99cc34'; // Your green color as default
    try {
        const brandSettings = localStorage.getItem('brandSettings');
        console.log('[Timeline] Brand settings:', brandSettings);
        if (brandSettings) {
            const brand = JSON.parse(brandSettings);
            if (brand.colors && brand.colors.primary) {
                brandPrimary = brand.colors.primary;
            } else if (brand.primaryColor) {
                brandPrimary = brand.primaryColor;
            }
        }
        document.documentElement.style.setProperty('--brand-primary', brandPrimary);
        console.log('[Timeline] Applied brand color:', brandPrimary);
    } catch (e) {
        console.error('[Timeline] Error loading brand:', e);
    }
    
    // Sample data
    const days = options.days || [
        {
            day: 1,
            location: 'Penguin Beach',
            subtitle: 'Province / Penguin City',
            distance: '0 km vanaf start',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sollicitudin purus sit amet elementum blandit.',
            image: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800',
            highlights: [
                { icon: 'fa-map-marker-alt', title: 'Tourist Attraction:', text: 'Sunrise Point of Riverview' },
                { icon: 'fa-shopping-bag', title: 'Best Buy Of This Place:', text: 'Handmade Wooden Accessories' },
                { icon: 'fa-utensils', title: 'Food Speciality:', text: 'Sushie' },
                { icon: 'fa-hiking', title: 'Activity:', text: 'Two Hours Boating Ride' }
            ],
            hotel: 'TOUR DELIGHT: Dinner with Ice Cream Treat'
        },
        {
            day: 2,
            location: 'Lake City',
            subtitle: 'Province / Lake City',
            distance: '45 km vanaf Penguin Beach',
            description: 'Vivamus congue suscipit ius nec. Fusce. Nam auctor velit nec nisi molestie, ut maximus bibendum amet.',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            highlights: [
                { icon: 'fa-map-marker-alt', title: 'Tourist Attraction:', text: 'Sunrise Point of Riverview' },
                { icon: 'fa-shopping-bag', title: 'Best Buy Of This Place:', text: 'Handmade Wooden Accessories' },
                { icon: 'fa-utensils', title: 'Food Speciality:', text: 'Sushie' },
                { icon: 'fa-hiking', title: 'Activity:', text: 'Two Hours Boating Ride' }
            ],
            hotel: 'TOUR DELIGHT: Dinner with Ice Cream Treat'
        },
        {
            day: 3,
            location: 'Blue Sky City',
            subtitle: 'Province / Blue Sky',
            distance: '78 km vanaf Lake City',
            description: 'Nam dolor nunc, consequat nec sollicitudin vel, non modo vitae ex. Vestibulum molestie massa latis in auctor.',
            image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
            highlights: [
                { icon: 'fa-map-marker-alt', title: 'Tourist Attraction:', text: 'Sunrise Point of Riverview' },
                { icon: 'fa-shopping-bag', title: 'Best Buy Of This Place:', text: 'Handmade Wooden Accessories' },
                { icon: 'fa-utensils', title: 'Food Speciality:', text: 'Sushie' },
                { icon: 'fa-hiking', title: 'Activity:', text: 'Two Hours Boating Ride' }
            ],
            hotel: 'TOUR DELIGHT: Dinner with Ice Cream Treat'
        }
    ];
    
    section.innerHTML = `
        <!-- Header -->
        <div class="roadbook-timeline-header">
            <h2 class="editable" contenteditable="true">DE REIS <strong>DAG BIJ DAG</strong></h2>
            <p class="editable" contenteditable="true">Highlights Of Your Journey</p>
        </div>
        
        <!-- Timeline Road -->
        <div class="roadbook-timeline-road">
            <!-- Start Badge -->
            <div class="roadbook-start-badge">START</div>
            
            <!-- Vertical Road Line -->
            <div class="roadbook-road-line"></div>
            
            <!-- Animated Car -->
            <div class="roadbook-timeline-car">
                <i class="fas fa-car"></i>
            </div>
            
            <!-- Days -->
            ${days.map((day, index) => `
                <div class="roadbook-day-item" data-day="${day.day}">
                    <!-- Day Badge -->
                    <div class="roadbook-day-badge">Day ${day.day}</div>
                    
                    <!-- Day Content -->
                    <div class="roadbook-day-content">
                        <!-- Photo -->
                        <div class="roadbook-day-photo">
                            <img src="${day.image}" alt="${day.location}">
                        </div>
                        
                        <!-- Info -->
                        <div class="roadbook-day-info">
                            <h3 class="roadbook-day-location editable" contenteditable="true">${day.location}</h3>
                            <p class="roadbook-day-subtitle editable" contenteditable="true">${day.subtitle}</p>
                            <p class="roadbook-day-distance editable" contenteditable="true">${day.distance}</p>
                            
                            <p class="roadbook-day-description editable" contenteditable="true">${day.description}</p>
                            
                            <a href="#" class="roadbook-read-more" onclick="event.preventDefault(); alert('Open slide panel met meer info');">
                                Lees verder <i class="fas fa-arrow-right"></i>
                            </a>
                            
                            <!-- Highlights -->
                            <div class="roadbook-day-highlights">
                                ${day.highlights.map(h => `
                                    <div class="roadbook-highlight-item">
                                        <div class="roadbook-highlight-icon">
                                            <i class="fas ${h.icon}"></i>
                                        </div>
                                        <div class="roadbook-highlight-content">
                                            <h4 class="editable" contenteditable="true">${h.title}</h4>
                                            <p class="editable" contenteditable="true">${h.text}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <!-- Hotel Bar -->
                            <div class="roadbook-hotel-bar">
                                <i class="fas fa-star"></i>
                                <span class="editable" contenteditable="true"><strong>${day.hotel}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Initialize animation after render
    setTimeout(() => {
        if (window.RoadbookTimelineAnimation) {
            new window.RoadbookTimelineAnimation(section);
        }
    }, 100);
    
    this.makeSelectable(section);
    return section;
};

// Export ComponentFactory globally
if (typeof window !== 'undefined') {
    window.ComponentFactory = ComponentFactory;
}
