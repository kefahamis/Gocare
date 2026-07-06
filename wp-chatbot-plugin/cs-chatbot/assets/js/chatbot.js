/* ═══════════════════════════════════════════════════════════════
   CS Chatbot – Frontend Logic
   Config is injected by WordPress via wp_localize_script as
   window.csChatbotConfig
═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    // ── Config from WordPress ─────────────────────────────────────────────
    const cfg = window.csChatbotConfig || {};
    const COMPANY      = cfg.companyName    || 'Support';
    const EMAIL        = cfg.supportEmail   || '';
    const WHATSAPP_URL = cfg.whatsappUrl    || '';
    const HOURS        = cfg.hours          || 'Mon – Sat, 8 AM – 8 PM';
    const WELCOME      = cfg.welcomeMessage || "Hi there! 👋 How can I help you today?";
    const BRAND        = cfg.brandColor     || '#2563eb';
    const BRAND_DARK   = cfg.brandDark      || '#1d4ed8';

    // Apply brand colours as inline styles — more reliable than CSS variables
    // across varied WordPress themes. Called after DOM ready.
    function applyBrandColours() {
        var toggle = document.getElementById('csChatToggle');
        var header = document.getElementById('csChatHeader');
        var sendBtn = document.getElementById('csSendBtn');
        if (toggle)  toggle.style.setProperty('background', BRAND, 'important');
        if (header)  header.style.setProperty('background', BRAND, 'important');
        if (sendBtn) sendBtn.style.setProperty('background', BRAND, 'important');
    }

    // ── Built-in Knowledge Base ───────────────────────────────────────────
    const DEFAULT_KB = [
        {
            patterns: [/^(hi|hello|hey|good\s?(morning|afternoon|evening)|howdy|greetings)/i],
            response: 'Hello there! 👋 Welcome to ' + COMPANY + ' Support. How can I help you today?',
            chips: ['Track my order', 'Return & Refund', 'Payment issue', 'Product enquiry']
        },
        {
            patterns: [/track|order\s?status|where.*order|dispatch|shipped|delivery\s?status/i],
            response: '📦 To track your order:\n1. Go to <b>My Orders</b> in your account.\n2. Click the order and select <b>Track Shipment</b>.\n3. You\'ll see real-time courier updates.\n\nOrders typically ship within <b>1–2 business days</b> and arrive in <b>3–5 days</b>.',
            chips: ['Order not arrived', 'Change delivery address', 'Talk to an agent']
        },
        {
            patterns: [/return|refund|exchange|money\s?back|cancel.*order/i],
            response: '↩️ Our <b>Return & Refund Policy</b>:\n• Returns accepted within <b>14 days</b> of delivery.\n• Items must be unused and in original packaging.\n• Refunds are processed in <b>5–7 business days</b>.\n\nStart a return from <b>My Orders → Return Item</b>.',
            chips: ['How to return', 'Refund timeline', 'Talk to an agent']
        },
        {
            patterns: [/pay|payment|card|mpesa|billing|charge|invoice|receipt/i],
            response: '💳 We accept <b>M-Pesa, Visa, Mastercard</b>, and bank transfers.\n\nIf you were charged but your order wasn\'t placed, the hold is released automatically in <b>24–48 hours</b>.\n\nFor billing disputes, email <b>' + EMAIL + '</b> with your order number.',
            chips: ['Payment failed', 'Request receipt', 'Talk to an agent']
        },
        {
            patterns: [/product|stock|availab|size|colour|color|specification|feature/i],
            response: '🛍️ You can check product availability, sizes, and specs directly on the product page.\n\nNeed help finding something specific? Tell me the product name and I\'ll point you in the right direction!',
            chips: ['Out of stock item', 'Product comparison', 'Talk to an agent']
        },
        {
            patterns: [/shipping|delivery\s?fee|free\s?delivery|how\s?long.*deliver/i],
            response: '🚚 <b>Shipping Info:</b>\n• Free delivery on orders above a minimum order value.\n• Standard shipping: 3–5 days.\n• Express shipping: next day (selected areas).\n\nOrders placed before 2 PM ship same day.',
            chips: ['Track my order', 'Change delivery address', 'Talk to an agent']
        },
        {
            patterns: [/account|login|password|sign\s?in|forgot|reset\s?password/i],
            response: '🔐 <b>Account help:</b>\n• Use <b>Forgot Password</b> on the login page to reset via email or SMS.\n• If your account is locked, wait 15 minutes or contact support.\n\nStill stuck? Email <b>' + EMAIL + '</b> with your registered phone number.',
            chips: ['Reset password', 'Talk to an agent']
        },
        {
            patterns: [/promo|discount|coupon|voucher|offer|deal|sale/i],
            response: '🎉 <b>Current promotions:</b>\n• Sign up for our newsletter for exclusive weekly deals.\n• Follow us on social media for flash sales!',
            chips: ['Apply a coupon', 'Newsletter signup', 'Talk to an agent']
        },
        {
            patterns: [/agent|human|person|representative|staff|speak.*someone|live\s?chat/i],
            response: '👤 Our support team is available <b>' + HOURS + '</b>.\n\nFor the fastest response, reach us on:\n' +
                (WHATSAPP_URL ? '📱 <b>WhatsApp:</b> ' + WHATSAPP_URL + '\n' : '') +
                (EMAIL        ? '📧 <b>Email:</b> ' + EMAIL : ''),
            chips: ['WhatsApp now', 'Send email', 'Continue self-service']
        },
        {
            patterns: [/whatsapp/i],
            response: WHATSAPP_URL
                ? '📱 Click to message us directly on WhatsApp: <a href="' + WHATSAPP_URL + '" target="_blank" style="color:var(--cs-brand);">' + WHATSAPP_URL + '</a>'
                : '📱 Please use the email button in the chat header to contact us.',
            chips: ['Talk to an agent', 'Back to main menu']
        },
        {
            patterns: [/thank|thanks|thank\s?you|appreciate|helpful/i],
            response: "You're very welcome! 😊 Is there anything else I can help you with today?",
            chips: ['Track my order', 'Return & Refund', "No, I'm good!"]
        },
        {
            patterns: [/no.*good|all\s?good|that.*all|nothing|bye|goodbye|done|sorted/i],
            response: "Great! Have a wonderful day! 🌟 Don't hesitate to reach out if you need anything else. Goodbye! 👋",
            chips: []
        }
    ];

    // Merge custom KB from settings (if provided)
    let KB = DEFAULT_KB;
    if (cfg.kbJson && cfg.kbJson.trim()) {
        try {
            const custom = JSON.parse(cfg.kbJson);
            if (Array.isArray(custom) && custom.length) {
                // Convert string patterns to RegExp, prepend custom entries
                const parsed = custom.map(function (entry) {
                    return {
                        patterns: (entry.patterns || []).map(function (p) {
                            return new RegExp(p, 'i');
                        }),
                        response: entry.response || '',
                        chips: entry.chips || []
                    };
                });
                KB = parsed.concat(DEFAULT_KB);
            }
        } catch (e) {
            console.warn('CS Chatbot: invalid kb_json, using defaults.');
        }
    }

    const FALLBACKS = [
        "I'm not quite sure about that. Could you rephrase? Or I can connect you with a live agent.",
        "Hmm, I didn't catch that. Try asking about orders, returns, payments, or shipping.",
        "I want to help! Could you give me a bit more detail? Or choose an option below."
    ];

    // ── Firebase / Live Agent config ──────────────────────────────────────
    var FB_ENABLED = cfg.firebaseEnabled === '1';
    var FB_CFG     = cfg.firebaseConfig  || null;

    // ── State ─────────────────────────────────────────────────────────────
    let chatOpen      = false;
    let isTyping      = false;
    let fallbackIndex = 0;

    // Live agent state
    var liveMode     = false;
    var chatId       = null;
    var fbDb         = null;
    var fbPush       = null;
    var fbRef        = null;
    var fbOnValue    = null;
    var fbUpdate     = null;
    var fbServerTs   = null;
    var msgUnsubscribe = null;

    // ── DOM refs ──────────────────────────────────────────────────────────
    function $id(id) { return document.getElementById(id); }
    function msgs()  { return $id('csChatMessages'); }

    // ── Scroll ────────────────────────────────────────────────────────────
    function scrollBottom() {
        var el = msgs();
        if (el) el.scrollTop = el.scrollHeight;
    }

    // ── Toggle open/close ─────────────────────────────────────────────────
    window.csChatbotToggle = function () {
        chatOpen = !chatOpen;
        var win    = $id('csChatWindow');
        var iOpen  = $id('csIconOpen');
        var iClose = $id('csIconClose');
        var badge  = $id('csNotifBadge');

        if (!win) return;
        win.classList.toggle('cs-chat-hidden',  !chatOpen);
        win.classList.toggle('cs-chat-visible',  chatOpen);

        // Toggle via both class AND inline style for maximum theme compatibility
        if (iOpen) {
            iOpen.classList.toggle('cs-hidden', chatOpen);
            iOpen.style.display = chatOpen ? 'none' : 'block';
        }
        if (iClose) {
            iClose.classList.toggle('cs-hidden', !chatOpen);
            iClose.style.display = chatOpen ? 'block' : 'none';
        }
        if (badge) {
            badge.classList.add('cs-hidden');
            badge.style.display = 'none';
        }

        if (chatOpen) {
            var input = $id('csChatInput');
            if (input) input.focus();
            if (msgs() && msgs().children.length === 0) {
                setTimeout(function () {
                    addBotMessage(
                        WELCOME.replace(/\n/g, '<br>'),
                        ['Track my order', 'Return & Refund', 'Payment issue', 'Talk to an agent']
                    );
                }, 350);
            }
        }
    };

    // ── Send ──────────────────────────────────────────────────────────────
    window.csChatbotSend = function () {
        var input = $id('csChatInput');
        if (!input) return;
        var text = input.value.trim();
        if (!text || isTyping) return;
        input.value = '';
        handleInput(text);
    };

    window.csChatbotHandleKey = function (e) {
        if (e.key === 'Enter') window.csChatbotSend();
    };

    function handleInput(text) {
        // In live-agent mode forward directly to Firebase
        if (liveMode && chatId) {
            addUserMessage(text);
            setChips([]);
            fbSendCustomerMsg(text);
            return;
        }

        if (isTyping) return;
        addUserMessage(text);
        setChips([]);

        // Detect agent escalation request
        if (FB_ENABLED && FB_CFG && /agent|human|person|representative|staff|speak.*someone|live\s?chat/i.test(text)) {
            isTyping = true;
            showTyping();
            setTimeout(function () {
                removeTyping();
                isTyping = false;
                addBotMessage(
                    '👤 Connecting you to a live agent…<br>Please wait a moment.',
                    []
                );
                initLiveAgent();
            }, 800);
            return;
        }

        isTyping = true;
        showTyping();
        var delay = 700 + Math.random() * 600;
        setTimeout(function () {
            removeTyping();
            var res = getResponse(text);
            typeMessage(res.response, res.chips);
        }, delay);
    }

    // ── Messages ──────────────────────────────────────────────────────────
    function addUserMessage(text) {
        var row = document.createElement('div');
        row.className = 'cs-msg-row-user';
        var bubble = document.createElement('div');
        bubble.className = 'cs-bubble-user';
        bubble.textContent = text;
        row.appendChild(bubble);
        msgs().appendChild(row);
        scrollBottom();
    }

    function addBotMessage(html, chips) {
        var row = document.createElement('div');
        row.className = 'cs-msg-row-bot';
        row.innerHTML = '<div class="cs-bot-icon">🎧</div>';
        var bubble = document.createElement('div');
        bubble.className = 'cs-bubble-bot';
        bubble.innerHTML = html;
        row.appendChild(bubble);
        msgs().appendChild(row);
        setChips(chips || []);
        scrollBottom();
    }

    function showTyping() {
        var row = document.createElement('div');
        row.id = 'csTypingRow';
        row.className = 'cs-msg-row-bot';
        row.innerHTML = '<div class="cs-bot-icon">🎧</div>' +
            '<div class="cs-bubble-bot"><div class="cs-typing-dots">' +
            '<span class="cs-dot"></span><span class="cs-dot"></span><span class="cs-dot"></span>' +
            '</div></div>';
        msgs().appendChild(row);
        scrollBottom();
    }

    function removeTyping() {
        var el = $id('csTypingRow');
        if (el) el.remove();
    }

    // ── Typing effect ─────────────────────────────────────────────────────
    function typeMessage(html, chips) {
        var row = document.createElement('div');
        row.className = 'cs-msg-row-bot';
        row.innerHTML = '<div class="cs-bot-icon">🎧</div>';
        var bubble = document.createElement('div');
        bubble.className = 'cs-bubble-bot';
        row.appendChild(bubble);
        msgs().appendChild(row);
        scrollBottom();

        var stripped = stripHtml(html);
        var len      = stripped.length;
        var delay    = Math.max(10, Math.min(25, 1200 / len));
        var i        = 0;
        var chunk    = Math.ceil(len / 60);

        var iv = setInterval(function () {
            i += chunk;
            bubble.textContent = stripped.slice(0, i);
            scrollBottom();
            if (i >= len) {
                clearInterval(iv);
                bubble.innerHTML = formatHtml(html);
                setChips(chips || []);
                isTyping = false;
                scrollBottom();
            }
        }, delay);
    }

    // ── Quick reply chips ─────────────────────────────────────────────────
    function setChips(chips) {
        var el = $id('csQuickReplies');
        if (!el) return;
        el.innerHTML = '';
        chips.forEach(function (label) {
            var btn = document.createElement('button');
            btn.className = 'cs-chip';
            btn.textContent = label;
            btn.addEventListener('click', function () { handleInput(label); });
            el.appendChild(btn);
        });
    }

    // ── Matching ──────────────────────────────────────────────────────────
    function getResponse(text) {
        for (var i = 0; i < KB.length; i++) {
            var entry = KB[i];
            for (var j = 0; j < entry.patterns.length; j++) {
                if (entry.patterns[j].test(text)) {
                    return { response: entry.response, chips: entry.chips || [] };
                }
            }
        }
        var resp = FALLBACKS[fallbackIndex % FALLBACKS.length];
        fallbackIndex++;
        return { response: resp, chips: ['Track my order', 'Return & Refund', 'Talk to an agent'] };
    }

    // ── Live Agent via Firebase ───────────────────────────────────────────
    function initLiveAgent() {
        if (!FB_CFG || !FB_CFG.apiKey) {
            addBotMessage('⚠️ Live agent is not configured yet. Please contact us via WhatsApp or email.', []);
            return;
        }

        // Dynamically load Firebase SDK (ES module via importmap-less dynamic import)
        var fbBase = 'https://www.gstatic.com/firebasejs/10.12.0/';
        Promise.all([
            import(fbBase + 'firebase-app.js'),
            import(fbBase + 'firebase-database.js')
        ]).then(function (mods) {
            var initializeApp = mods[0].initializeApp;
            fbRef      = mods[1].ref;
            fbPush     = mods[1].push;
            fbOnValue  = mods[1].onValue;
            fbUpdate   = mods[1].update;
            fbServerTs = mods[1].serverTimestamp;

            var app = initializeApp(FB_CFG, 'cs-chatbot-customer');
            fbDb = mods[1].getDatabase(app);

            // Create conversation
            chatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
            var convRef = fbRef(fbDb, 'cs_chatbot_chats/' + chatId);
            fbUpdate(convRef, {
                status: 'waiting',
                customerName: 'Visitor',
                createdAt: Date.now(),
                lastMessage: 'Waiting for agent…',
            });

            // Copy bot conversation history into Firebase
            var area = msgs();
            if (area) {
                var bubbles = area.querySelectorAll('.cs-bubble-user, .cs-bubble-bot');
                bubbles.forEach(function (el) {
                    var sender = el.classList.contains('cs-bubble-user') ? 'customer' : 'bot';
                    fbPush(fbRef(fbDb, 'cs_chatbot_chats/' + chatId + '/messages'), {
                        sender: sender,
                        text: el.textContent.trim(),
                        ts: Date.now() - 1,
                    });
                });
            }

            liveMode = true;
            showLiveAgentStatus('waiting');

            // Listen for incoming agent messages
            msgUnsubscribe = fbOnValue(fbRef(fbDb, 'cs_chatbot_chats/' + chatId + '/messages'), function (snap) {
                if (!snap.val()) return;
                var allMsgs = snap.val();
                var keys = Object.keys(allMsgs).sort();
                var lastKey = keys[keys.length - 1];
                var latest = allMsgs[lastKey];

                // Only show new incoming agent messages
                if (latest.sender === 'agent' && latest._shown !== true) {
                    allMsgs[lastKey]._shown = true;
                    addAgentMessage(latest.text, latest.agentName || 'Agent');
                }
            });

            // Listen for status changes (agent joined / chat closed)
            fbOnValue(fbRef(fbDb, 'cs_chatbot_chats/' + chatId + '/status'), function (snap) {
                var status = snap.val();
                if (status === 'active' && !document.getElementById('csLiveStatus')
                    ?.textContent.includes('Agent')) {
                    showLiveAgentStatus('active');
                }
                if (status === 'closed') {
                    endLiveMode();
                }
            });

        }).catch(function (err) {
            console.error('CS Chatbot: Firebase load failed', err);
            addBotMessage('⚠️ Could not connect to live agent. Please try WhatsApp or email.', []);
        });
    }

    function fbSendCustomerMsg(text) {
        if (!fbDb || !chatId) return;
        fbPush(fbRef(fbDb, 'cs_chatbot_chats/' + chatId + '/messages'), {
            sender: 'customer',
            text: text,
            ts: Date.now(),
        });
        fbUpdate(fbRef(fbDb, 'cs_chatbot_chats/' + chatId), {
            lastMessage: text,
            lastTs: Date.now(),
        });
    }

    function addAgentMessage(text, agentName) {
        var row = document.createElement('div');
        row.className = 'cs-msg-row-bot';
        row.innerHTML =
            '<div class="cs-bot-icon" style="background:#dcfce7;">👤</div>';
        var col = document.createElement('div');
        var label = document.createElement('div');
        label.style.cssText = 'font-size:10px;color:#16a34a;margin-bottom:3px;font-weight:600;';
        label.textContent = agentName;
        var bubble = document.createElement('div');
        bubble.className = 'cs-bubble-bot';
        bubble.style.cssText = 'border-color:#bbf7d0;background:#f0fdf4;';
        bubble.textContent = text;
        col.appendChild(label);
        col.appendChild(bubble);
        row.appendChild(col);
        msgs().appendChild(row);
        scrollBottom();
    }

    function showLiveAgentStatus(status) {
        var existing = document.getElementById('csLiveStatus');
        if (existing) existing.remove();

        var bar = document.createElement('div');
        bar.id = 'csLiveStatus';
        bar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 14px;' +
            'background:' + (status === 'active' ? '#f0fdf4' : '#fefce8') + ';' +
            'border-top:1px solid ' + (status === 'active' ? '#bbf7d0' : '#fde68a') + ';' +
            'font-size:12px;flex-shrink:0;';

        var dot = document.createElement('span');
        dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' +
            (status === 'active' ? '#4ade80' : '#facc15') + ';';

        var txt = document.createElement('span');
        txt.style.color = status === 'active' ? '#15803d' : '#92400e';
        txt.textContent = status === 'active'
            ? '✅ Agent connected — you\'re chatting live'
            : '⏳ Waiting for an available agent…';

        if (status === 'waiting') {
            var endBtn = document.createElement('button');
            endBtn.textContent = 'Cancel';
            endBtn.style.cssText = 'margin-left:auto;font-size:11px;border:none;background:none;color:#94a3b8;cursor:pointer;';
            endBtn.onclick = endLiveMode;
            bar.appendChild(dot); bar.appendChild(txt); bar.appendChild(endBtn);
        } else {
            var endBtn2 = document.createElement('button');
            endBtn2.textContent = 'End chat';
            endBtn2.style.cssText = 'margin-left:auto;font-size:11px;border:none;background:none;color:#dc2626;cursor:pointer;font-weight:600;';
            endBtn2.onclick = endLiveMode;
            bar.appendChild(dot); bar.appendChild(txt); bar.appendChild(endBtn2);
        }

        // Insert above input bar
        var inputBar = document.getElementById('csChatInputBar');
        if (inputBar) inputBar.parentNode.insertBefore(bar, inputBar);
    }

    function endLiveMode() {
        liveMode = false;
        if (msgUnsubscribe) { msgUnsubscribe(); msgUnsubscribe = null; }
        if (fbDb && chatId) {
            fbUpdate(fbRef(fbDb, 'cs_chatbot_chats/' + chatId), { status: 'closed' });
        }
        chatId = null;
        var bar = document.getElementById('csLiveStatus');
        if (bar) bar.remove();
        addBotMessage('Chat ended. Is there anything else I can help with?',
            ['Track my order', 'Return & Refund', 'Talk to an agent']);
    }

    // ── Utilities ─────────────────────────────────────────────────────────
    function stripHtml(html) {
        return html
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g,  '&')
            .replace(/&lt;/g,   '<')
            .replace(/&gt;/g,   '>')
            .replace(/&nbsp;/g, ' ');
    }

    function formatHtml(text) {
        return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    }

    // ── Init ──────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyBrandColours);
    } else {
        applyBrandColours();
    }

})();
