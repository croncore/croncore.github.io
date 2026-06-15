/* ============================================================
   Sanity client + Portable Text renderer (vanilla JS, no deps)
   Used by index.html (home preview), insights.html, article.html
   ============================================================ */
(function (global) {
    'use strict';

    var PROJECT_ID = 'b5z10ias';
    var DATASET = 'production';
    var API_VERSION = '2024-10-01';

    // Use the CDN endpoint (cached, fast). For draft previews use api.sanity.io.
    var API_BASE = 'https://' + PROJECT_ID + '.apicdn.sanity.io/v' + API_VERSION + '/data/query/' + DATASET;

    /**
     * Run a GROQ query against the public dataset.
     * @param {string} groq
     * @param {object} [params]  Bound parameters (e.g. {slug: "..."})
     * @returns {Promise<any>}   The query result
     */
    function fetchGroq(groq, params) {
        var url = API_BASE + '?query=' + encodeURIComponent(groq);
        if (params) {
            Object.keys(params).forEach(function (k) {
                url += '&$' + encodeURIComponent(k) + '=' + encodeURIComponent(JSON.stringify(params[k]));
            });
        }
        return fetch(url).then(function (r) {
            if (!r.ok) throw new Error('Sanity API ' + r.status);
            return r.json();
        }).then(function (json) { return json.result; });
    }

    /**
     * Build a Sanity CDN image URL with optional resize params.
     * Accepts either { asset: { _ref } } or { url } style objects.
     */
    function imageUrl(image, opts) {
        if (!image) return '';
        var base = '';
        if (image.asset && image.asset.url) {
            base = image.asset.url;
        } else if (image.asset && image.asset._ref) {
            // Ref looks like: image-<id>-<W>x<H>-<format>
            var parts = image.asset._ref.split('-');
            if (parts[0] !== 'image' || parts.length < 4) return '';
            var format = parts[parts.length - 1];
            var dims = parts[parts.length - 2];
            var id = parts.slice(1, parts.length - 2).join('-');
            base = 'https://cdn.sanity.io/images/' + PROJECT_ID + '/' + DATASET + '/' + id + '-' + dims + '.' + format;
        } else if (typeof image === 'string') {
            base = image;
        }
        if (!base) return '';
        var qs = [];
        opts = opts || {};
        if (opts.width) qs.push('w=' + opts.width);
        if (opts.height) qs.push('h=' + opts.height);
        if (opts.fit) qs.push('fit=' + opts.fit);
        if (opts.quality) qs.push('q=' + opts.quality);
        if (opts.auto !== false) qs.push('auto=format');
        return qs.length ? base + '?' + qs.join('&') : base;
    }

    /* ------------------------------------------------------------
       Portable Text -> HTML renderer
       Handles: blocks (normal/h2/h3/h4/blockquote), lists (bullet, number),
       marks (strong, em, code, underline, strike-through, link),
       inline images, codeBlocks
       ------------------------------------------------------------ */

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(str) { return escapeHtml(str); }

    var DECORATOR_TAGS = {
        'strong': 'strong',
        'em': 'em',
        'code': 'code',
        'underline': 'u',
        'strike-through': 's'
    };

    function renderSpan(child, markDefs) {
        if (child._type !== 'span') return '';
        var text = escapeHtml(child.text || '').replace(/\n/g, '<br>');
        var marks = (child.marks || []).slice();
        if (!marks.length) return text;

        // Wrap with each mark, innermost first
        var openTags = [];
        var closeTags = [];
        marks.forEach(function (mark) {
            if (DECORATOR_TAGS[mark]) {
                var tag = DECORATOR_TAGS[mark];
                openTags.push('<' + tag + '>');
                closeTags.unshift('</' + tag + '>');
            } else if (markDefs && markDefs[mark]) {
                var def = markDefs[mark];
                if (def._type === 'link') {
                    var href = escapeAttr(def.href || '#');
                    var rel = def.blank ? ' target="_blank" rel="noopener noreferrer"' : '';
                    openTags.push('<a href="' + href + '"' + rel + '>');
                    closeTags.unshift('</a>');
                }
            }
        });
        return openTags.join('') + text + closeTags.join('');
    }

    function renderBlock(block) {
        var children = (block.children || []);
        var markDefs = {};
        (block.markDefs || []).forEach(function (m) { markDefs[m._key] = m; });
        var inner = children.map(function (c) { return renderSpan(c, markDefs); }).join('');

        var style = block.style || 'normal';
        if (style === 'normal') return '<p>' + inner + '</p>';
        if (style === 'blockquote') return '<blockquote>' + inner + '</blockquote>';
        if (style === 'h1' || style === 'h2' || style === 'h3' || style === 'h4' || style === 'h5' || style === 'h6') {
            return '<' + style + '>' + inner + '</' + style + '>';
        }
        return '<p>' + inner + '</p>';
    }

    function renderImage(node) {
        var src = imageUrl(node, {width: 1200, fit: 'max', quality: 85});
        if (!src) return '';
        var alt = escapeAttr(node.alt || '');
        var caption = node.caption ? '<figcaption>' + escapeHtml(node.caption) + '</figcaption>' : '';
        return '<figure><img src="' + src + '" alt="' + alt + '" loading="lazy">' + caption + '</figure>';
    }

    function renderCodeBlock(node) {
        var lang = node.language ? ' class="language-' + escapeAttr(node.language) + '"' : '';
        return '<pre><code' + lang + '>' + escapeHtml(node.code || '') + '</code></pre>';
    }

    /**
     * Convert Portable Text block array to HTML string.
     */
    function portableTextToHtml(blocks) {
        if (!blocks || !blocks.length) return '';
        var html = '';
        var i = 0;
        while (i < blocks.length) {
            var block = blocks[i];

            if (block._type === 'block' && block.listItem) {
                // Group consecutive list items of the same listItem + level
                var listType = block.listItem === 'number' ? 'ol' : 'ul';
                var startLevel = block.level || 1;
                html += '<' + listType + '>';
                while (i < blocks.length && blocks[i]._type === 'block' && blocks[i].listItem === block.listItem && (blocks[i].level || 1) === startLevel) {
                    var item = blocks[i];
                    var children = item.children || [];
                    var markDefs = {};
                    (item.markDefs || []).forEach(function (m) { markDefs[m._key] = m; });
                    var inner = children.map(function (c) { return renderSpan(c, markDefs); }).join('');
                    html += '<li>' + inner + '</li>';
                    i++;
                }
                html += '</' + listType + '>';
                continue;
            }

            if (block._type === 'block') {
                html += renderBlock(block);
            } else if (block._type === 'image') {
                html += renderImage(block);
            } else if (block._type === 'codeBlock') {
                html += renderCodeBlock(block);
            }
            i++;
        }
        return html;
    }

    /**
     * Pull a plain-text excerpt from a Portable Text array.
     */
    function portableTextToPlain(blocks, maxLen) {
        if (!blocks || !blocks.length) return '';
        var out = '';
        for (var i = 0; i < blocks.length && out.length < (maxLen || 200); i++) {
            var b = blocks[i];
            if (b._type === 'block' && b.children) {
                out += b.children.map(function (c) { return c.text || ''; }).join('') + ' ';
            }
        }
        out = out.trim();
        if (maxLen && out.length > maxLen) out = out.substring(0, maxLen).replace(/\s\S*$/, '') + '…';
        return out;
    }

    global.Sanity = {
        fetch: fetchGroq,
        imageUrl: imageUrl,
        portableTextToHtml: portableTextToHtml,
        portableTextToPlain: portableTextToPlain,
        projectId: PROJECT_ID,
        dataset: DATASET
    };
})(window);
