// Export functionaliteit voor website builder
class ExportManager {
    constructor() {
        this.setupExportButtons();
    }

    setupExportButtons() {
        const exportBtn = document.getElementById('exportBtn');
        const previewBtn = document.getElementById('previewBtn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.showExportModal();
            });
        }
        
        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                this.showPreview(e);
            });
            // Tooltip hint for users
            try { previewBtn.title = 'Preview (alleen voor controle, niet delen! Gebruik Publiceer voor deelbare link)'; } catch (e) {}
        }
    }

    async showPreview(evt) {
        // Open full web-based preview in a new tab using preview.html
        try {
            // Process canvas with PageExporter first (for roadbook videos, etc.)
            const canvas = document.getElementById('canvas');
            if (canvas && canvas.innerHTML) {
                // Clone canvas to avoid modifying the editor
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = canvas.innerHTML;
                
                // Run PageExporter processing
                if (window.PageExporter && typeof window.PageExporter.processRoadbookVideosSync === 'function') {
                    console.log('[Export] Processing roadbook videos...');
                    window.PageExporter.processRoadbookVideosSync(tempDiv);
                }
                
                // Save processed content
                sessionStorage.setItem('wb_preview_content', tempDiv.innerHTML);
                console.log('✅ Saved canvas content to sessionStorage');
            }
            
            const meta = getCurrentPageMeta();
            const slug = meta.slug || '';
            const params = new URLSearchParams();
            // Prefer existing globals set by index.html/router; fallback to URL query
            const curUrl = new URL(window.location.href);
            const brandId = window.CURRENT_BRAND_ID || curUrl.searchParams.get('brand_id') || '';
            const apiBase = (window.BOLT_API && window.BOLT_API.baseUrl) || curUrl.searchParams.get('api') || '';
            const token = window.CURRENT_TOKEN || curUrl.searchParams.get('token') || '';
            const apikey = curUrl.searchParams.get('apikey') || '';
            if (brandId) params.set('brand_id', brandId);
            if (apiBase) params.set('api', apiBase);
            if (token) params.set('token', token);
            if (apikey) params.set('apikey', apikey);
            // Default behavior: homepage; if user holds Shift/Alt, include current page slug
            const wantCurrentPage = !!(evt && (evt.shiftKey || evt.altKey));
            if (wantCurrentPage && slug) params.set('page', slug);
            // Cache bust for dev
            params.set('v', 'preview-' + Date.now());
            // Standalone version uses preview-standalone.html (no API required)
            const previewUrl = `preview-standalone.html?${params.toString()}`;
            // Use window.open to maintain opener relationship
            window.open(previewUrl, '_blank', 'noopener=no');
            return;
        } catch (e) {
            console.warn('Fallback inline preview due to error:', e);
        }
        // Fallback to inline iframe preview if something above fails
        const modal = document.getElementById('previewModal');
        const iframe = document.getElementById('previewFrame');
        
        // Use inline CSS for preview to avoid CSP issues
        const html = await this.generatePreviewHTML();
        
        iframe.removeAttribute('src');
        iframe.srcdoc = html;
        modal.style.display = 'block';
        const closeBtn = modal.querySelector('.modal-close');
        const closeModal = () => { modal.style.display = 'none'; };
        closeBtn.onclick = closeModal;
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };
        const handleEsc = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', handleEsc); } };
        document.addEventListener('keydown', handleEsc);
    }
    showExportModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.maxWidth = '600px';
        
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `
            <h3>Website Exporteren</h3>
            <button class="modal-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">Exporteer als:</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <button class="btn btn-primary export-option" data-type="html">
                        <i class="fas fa-code"></i>
                        <div>
                            <div style="font-weight: 600;">HTML Bestand</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Enkele HTML file</div>
                        </div>
                    </button>
                    <button class="btn btn-secondary export-option" data-type="zip">
                        <i class="fas fa-file-archive"></i>
                        <div>
                            <div style="font-weight: 600;">ZIP Archief</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">HTML + CSS bestanden</div>
                        </div>
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">Website instellingen:</h4>
                <div class="form-group">
                    <label class="form-label">Website titel</label>
                    <input type="text" class="form-control" id="websiteTitle" value="Mijn Website" placeholder="Voer website titel in">
                </div>
                <div class="form-group">
                    <label class="form-label">Meta beschrijving</label>
                    <textarea class="form-control" id="websiteDescription" placeholder="Korte beschrijving van je website" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Favicon URL (optioneel)</label>
                    <input type="text" class="form-control" id="faviconUrl" placeholder="https://example.com/favicon.ico">
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">Geavanceerde opties:</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="includeBootstrap" checked>
                        <span>Bootstrap CSS toevoegen</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="includeAnimations" checked>
                        <span>Animaties toevoegen</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="responsiveDesign" checked>
                        <span>Responsive design</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="minifyCode">
                        <span>Code minimaliseren</span>
                    </label>
                </div>
            </div>
        `;
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Event listeners
        const closeBtn2 = modalHeader.querySelector('.modal-close');
        const closeModal2 = () => { document.body.removeChild(modal); };
        closeBtn2.onclick = closeModal2;
        modal.onclick = (e) => { if (e.target === modal) closeModal2(); };
        
        const exportOptions = modalBody.querySelectorAll('.export-option');
        exportOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                const options = this.getExportOptions(modalBody);
                this.exportWebsite(type, options);
                closeModal2();
            });
        });
        return {
            title: modalBody.querySelector('#websiteTitle').value || 'Mijn Website',
            description: modalBody.querySelector('#websiteDescription').value || '',
            favicon: modalBody.querySelector('#faviconUrl').value || '',
            includeBootstrap: modalBody.querySelector('#includeBootstrap').checked,
            includeAnimations: modalBody.querySelector('#includeAnimations').checked,
            responsiveDesign: modalBody.querySelector('#responsiveDesign').checked,
            minifyCode: modalBody.querySelector('#minifyCode').checked
        };
    }

    exportWebsite(type, options) {
        if (type === 'html') {
            this.exportAsHTML(options);
        } else if (type === 'zip') {
            this.exportAsZip(options);
        }
    }

    exportAsHTML(options) {
        const html = this.generateHTML(options);
        const blob = new Blob([html], { type: 'text/html' });
        this.downloadFile(blob, `${this.sanitizeFilename(options.title)}.html`);
    }

    async exportAsZip(options) {
        // Voor deze demo maken we een eenvoudige ZIP export
        // In een echte implementatie zou je een library zoals JSZip gebruiken
        const html = this.generateHTML(options, true); // Separate CSS
        const css = this.generateCSS(options);
        
        // Create a simple "zip" by combining files
        const zipContent = `
<!-- Dit is een gesimuleerde ZIP export -->
<!-- In een echte implementatie zou dit een echt ZIP bestand zijn -->

=== index.html ===
${html}

=== styles.css ===
${css}

=== README.txt ===
Website Builder Export
======================

Bestanden:
- index.html: Hoofdpagina van je website
- styles.css: Stylesheet voor styling

Upload deze bestanden naar je webserver om je website live te zetten.
        `;
        
        const blob = new Blob([zipContent], { type: 'text/plain' });
        this.downloadFile(blob, `${this.sanitizeFilename(options.title)}_export.txt`);
    }

    async generatePreviewHTML() {
        const canvas = document.getElementById('canvas');
        const bodyHtml = canvas ? canvas.innerHTML : '<div></div>';
        
        // Fetch CSS files inline
        let inlineCSS = '';
        try {
            const baseUrl = window.location.origin;
            const cssFiles = [
                `${baseUrl}/styles/components.css`,
                `${baseUrl}/styles/travel-templates.css`
            ];
            
            const cssPromises = cssFiles.map(url => 
                fetch(url)
                    .then(res => res.ok ? res.text() : '')
                    .catch(() => '')
            );
            
            const cssContents = await Promise.all(cssPromises);
            inlineCSS = cssContents.filter(css => css).join('\n\n');
        } catch (e) {
            console.warn('[Preview] Could not fetch CSS:', e);
        }
        
        // Get brand primary color from root element
        const brandPrimary = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim() || '#84cc16';
        
        // Wrap with layout if available
        let bodyWrapped = `\n  ${bodyHtml}`;
        try {
            const saved = localStorage.getItem('wb_project');
            const layout = saved ? (JSON.parse(saved).layout || null) : null;
            if (window.Layouts && typeof window.Layouts.renderWithLayout === 'function') {
                bodyWrapped = window.Layouts.renderWithLayout(bodyWrapped, layout);
            }
        } catch (e) {}
        
        return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  
  <!-- Font Awesome Icons -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  
  <!-- Inline CSS -->
  <style>
    :root {
      --brand-primary: ${brandPrimary};
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    img { max-width: 100%; height: auto; }
    
    ${inlineCSS}
  </style>
</head>
<body>
  ${bodyWrapped}
</body>
</html>`;
    }

    generateHTML(options = {}, separateCSS = false) {
        const canvas = document.getElementById('canvas');
        const canvasContent = this.cleanCanvasContent(canvas.innerHTML);
        
        const title = options.title || 'Mijn Website';
        const description = options.description || '';
        const favicon = options.favicon || '';
        const includeBootstrap = options.includeBootstrap !== false;
        const includeAnimations = options.includeAnimations !== false;
        const responsiveDesign = options.responsiveDesign !== false;
        const useBuilderCss = options.useBuilderCss === true; // preview mode
        
        let cssLinks = '';
        let inlineCSS = '';
        
        if (includeBootstrap) {
            cssLinks += '    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">\n';
        }
        
        cssLinks += '    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">\n';
        
        // In preview, also include the project's own CSS so sections look identical
        if (useBuilderCss) {
            const origin = window.location.origin;
            cssLinks += `    <link rel="stylesheet" href="${origin}/styles/main.css">\n`;
            cssLinks += `    <link rel="stylesheet" href="${origin}/styles/components.css">\n`;
        }
        
        if (separateCSS) {
            cssLinks += '    <link rel="stylesheet" href="styles.css">\n';
        } else {
            inlineCSS = `    <style>\n${this.generateCSS(options)}\n    </style>\n`;
        }
        
        const faviconTag = favicon ? `    <link rel="icon" href="${favicon}">\n` : '';
        const metaDescription = description ? `    <meta name="description" content="${description}">\n` : '';
        
        // Optionally wrap body with chosen layout (for preview/export)
        let bodyWrapped = `\n    <div class="container-fluid">\n${canvasContent}\n    </div>`;
        try {
            const saved = localStorage.getItem('wb_project');
            const layout = saved ? (JSON.parse(saved).layout || null) : null;
            if ((options.wrapWithLayout || options.useBuilderCss) && window.Layouts && typeof window.Layouts.renderWithLayout === 'function') {
                bodyWrapped = window.Layouts.renderWithLayout(bodyWrapped, layout);
            }
        } catch (e) { /* ignore */ }

        return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
${metaDescription}${faviconTag}${cssLinks}${inlineCSS}</head>
<body>
${bodyWrapped}
    
    ${includeBootstrap ? '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>' : ''}
    ${includeAnimations ? this.generateAnimationScript() : ''}
</body>
</html>`;
    }

    generateCSS(options = {}) {
        const includeAnimations = options.includeAnimations !== false;
        const responsiveDesign = options.responsiveDesign !== false;
        const minifyCode = options.minifyCode === true;
        
        let css = `
/* Website Builder Generated CSS */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 0;
}

.wb-container {
    padding: 2rem;
    margin: 1rem 0;
}

.wb-row {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
}

.wb-column {
    flex: 1;
    padding: 1rem;
}

.wb-heading {
    margin: 1rem 0;
    font-weight: 600;
    line-height: 1.2;
}

.wb-heading.h1 { font-size: 2.5rem; }
.wb-heading.h2 { font-size: 2rem; }
.wb-heading.h3 { font-size: 1.5rem; }
.wb-heading.h4 { font-size: 1.25rem; }
.wb-heading.h5 { font-size: 1rem; }
.wb-heading.h6 { font-size: 0.875rem; }

.wb-text {
    margin: 1rem 0;
    line-height: 1.6;
}

.wb-image {
    margin: 1rem 0;
    text-align: center;
}

.wb-image img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

.wb-button {
    margin: 1rem 0;
    display: inline-block;
}

.wb-button button {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
}

.wb-button.primary button {
    background: #2196F3;
    color: white;
}

.wb-button.primary button:hover {
    background: #1976D2;
    transform: translateY(-2px);
}

.wb-button.secondary button {
    background: #6c757d;
    color: white;
}

.wb-button.secondary button:hover {
    background: #5a6268;
}

.wb-button.outline button {
    background: transparent;
    color: #2196F3;
    border: 2px solid #2196F3;
}

.wb-button.outline button:hover {
    background: #2196F3;
    color: white;
}

.wb-video {
    margin: 1rem 0;
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
    border-radius: 8px;
    overflow: hidden;
}

.wb-video iframe,
.wb-video video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
}

.wb-gallery {
    margin: 1rem 0;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.gallery-item {
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s ease;
}

.gallery-item:hover {
    transform: scale(1.05);
}

.gallery-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}
/* Full-bleed helper */
.wb-component.edge-to-edge {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    border-radius: 0;
}
/* Hero default spacing when full-bleed */
.wb-hero-travel.edge-to-edge { margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); }
`;

        if (responsiveDesign) {
            css += `
/* Responsive Design */
@media (max-width: 768px) {
    .wb-row {
        flex-direction: column;
    }
    
    .wb-heading.h1 { font-size: 2rem; }
    .wb-heading.h2 { font-size: 1.5rem; }
    
    .gallery-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    .gallery-item img {
        height: 150px;
    }
    
    .wb-container {
        padding: 1rem;
    }
}

@media (max-width: 480px) {
    .wb-heading.h1 { font-size: 1.5rem; }
    .wb-heading.h2 { font-size: 1.25rem; }
    
    .wb-button button {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
}
`;
        }

        if (includeAnimations) {
            css += `
/* Animations */
.wb-component {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.wb-button button:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.gallery-item {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gallery-item:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}
`;
        }

        if (minifyCode) {
            css = css.replace(/\s+/g, ' ').replace(/;\s+/g, ';').replace(/{\s+/g, '{').replace(/}\s+/g, '}').trim();
        }

        return css;
    }

    generateAnimationScript() {
        return `
    <script>
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = Math.random() * 0.3 + 's';
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.wb-component').forEach(el => {
            observer.observe(el);
        });
    </script>`;
    }

    cleanCanvasContent(html) {
        // Remove builder-specific classes and elements
        let cleaned = html;
        
        // Remove toolbars
        cleaned = cleaned.replace(/<div class="component-toolbar">.*?<\/div>/gs, '');
        
        // Remove builder-specific classes
        cleaned = cleaned.replace(/\s*(selected|dragging|drag-over|empty)\s*/g, ' ');
        cleaned = cleaned.replace(/class="\s*"/g, '');
        cleaned = cleaned.replace(/class=" "/g, '');
        
        // Remove drop zones
        cleaned = cleaned.replace(/<div class="drop-zone[^"]*">.*?<\/div>/gs, '');
        
        // Remove contenteditable attributes
        cleaned = cleaned.replace(/contenteditable="[^"]*"/g, '');
        
        // Remove data attributes used by builder
        cleaned = cleaned.replace(/data-component="[^"]*"/g, '');
        
        // Clean up empty attributes and whitespace
        cleaned = cleaned.replace(/\s+class=""/g, '');
        cleaned = cleaned.replace(/\s+style=""/g, '');
        cleaned = cleaned.replace(/\s{2,}/g, ' ');
        
        // Indent properly
        cleaned = this.formatHTML(cleaned);
        
        return cleaned;
    }

    formatHTML(html) {
        // Simple HTML formatting
        let formatted = html;
        let indent = 0;
        const tab = '    ';
        
        formatted = formatted.replace(/></g, '>\n<');
        
        const lines = formatted.split('\n');
        const formattedLines = lines.map(line => {
            line = line.trim();
            if (line === '') return '';
            
            if (line.startsWith('</')) {
                indent--;
            }
            
            const indentedLine = tab.repeat(Math.max(0, indent)) + line;
            
            if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
                indent++;
            }
            
            return indentedLine;
        });
        
        return formattedLines.join('\n');
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success message
        this.showNotification(`✅ ${filename} succesvol gedownload!`, 'success');
    }

    sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add notification animations
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;
document.head.appendChild(notificationStyle);

// Initialize export manager
window.ExportManager = new ExportManager();
// ===== Simple export helpers =====
// Haal huidige pagina-naam/slug uit localStorage state van de builder
function getCurrentPageMeta() {
  try {
    const saved = localStorage.getItem('wb_project');
    if (saved) {
      const data = JSON.parse(saved);
      if (data && Array.isArray(data.pages) && data.pages.length) {
        const currentId = data.currentPageId || (data.pages[0] && data.pages[0].id);
        const cur = data.pages.find(p => p.id === currentId) || data.pages[0];
        if (cur) {
          const name = (cur.name || 'Pagina').toString();
          // Slugify naam indien slug ontbreekt
          const slug = (cur.slug && cur.slug.toString().trim()) || name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
          return { title: name, slug };
        }
      }
    }
  } catch (e) { /* ignore */ }
  const fallback = `pagina-${Date.now()}`;
  return { title: 'Pagina', slug: fallback };
}

window.exportBuilderAsJSON = function exportBuilderAsJSON() {
  const canvas = document.getElementById('canvas');
  const meta = getCurrentPageMeta();
  // Prefer the full builder project JSON stored in localStorage so backend gets real content structure
  try {
    const saved = localStorage.getItem('wb_project');
    if (saved) {
      const project = JSON.parse(saved);
      if (project && typeof project === 'object') {
        // Ensure title/slug are present at top-level (used by save flows)
        try { project.title = meta.title; } catch (e) {}
        try { project.slug = meta.slug; } catch (e) {}
        // Attach latest html snapshot for convenience/debug
        try { project.htmlSnapshot = canvas ? canvas.innerHTML : ''; } catch (e) {}
        return project;
      }
    }
  } catch (e) {}
  // Fallback: minimal payload if no project present
  return {
    title: meta.title,
    slug: meta.slug,
    htmlSnapshot: canvas ? canvas.innerHTML : '',
  };
};

window.exportBuilderAsHTML = async function exportBuilderAsHTML(contentJson) {
  const canvas = document.getElementById('canvas');
  const bodyHtml = canvas ? canvas.innerHTML : '<div></div>';
  const title = (contentJson && contentJson.title) ? contentJson.title : getCurrentPageMeta().title;
  const layout = (contentJson && contentJson.layout) ? contentJson.layout : undefined;

  // Build body with optional layout wrapping (for parity with preview)
  let bodyWrapped = `\n  ${bodyHtml}`;
  try {
    if (window.Layouts && typeof window.Layouts.renderWithLayout === 'function') {
      bodyWrapped = window.Layouts.renderWithLayout(bodyWrapped, layout);
    }
  } catch (e) {}

  // Inline CSS - Fetch and embed all CSS files
  let inlineCSS = '';
  try {
    const baseUrl = window.location.origin;
    const cssFiles = [
      `${baseUrl}/styles/components.css`,
      `${baseUrl}/styles/travel-templates.css`
    ];
    
    // Fetch all CSS files in parallel
    const cssPromises = cssFiles.map(url => 
      fetch(url)
        .then(res => res.ok ? res.text() : '')
        .catch(() => '')
    );
    
    const cssContents = await Promise.all(cssPromises);
    inlineCSS = cssContents.filter(css => css).join('\n\n');
  } catch (e) {
    console.warn('[Export] Could not fetch CSS files for inline embedding:', e);
  }
  
  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  
  <!-- Font Awesome Icons -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  
  <!-- Inline CSS for maximum compatibility -->
  <style>
    /* Reset & Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    img {
      max-width: 100%;
      height: auto;
    }
    
    /* Component Styles */
    ${inlineCSS}
  </style>
</head>
<body>
  <span data-page-title-source style="display:none">${title}</span>
  ${bodyWrapped}
</body>
</html>`;
};