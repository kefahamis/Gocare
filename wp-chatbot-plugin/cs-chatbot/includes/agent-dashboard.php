<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// ── Register agent dashboard menu page ───────────────────────────────────────
add_action( 'admin_menu', 'cs_chatbot_agent_menu' );
function cs_chatbot_agent_menu() {
    if ( ! cs_chatbot_get( 'firebase_enabled' ) ) return;

    add_menu_page(
        __( 'Live Chats', 'cs-chatbot' ),
        __( 'Live Chats', 'cs-chatbot' ),
        'edit_posts',
        'cs-chatbot-live',
        'cs_chatbot_agent_page',
        'dashicons-format-chat',
        58
    );
}

// ── Agent dashboard page ─────────────────────────────────────────────────────
function cs_chatbot_agent_page() {
    if ( ! current_user_can( 'edit_posts' ) ) {
        wp_die( esc_html__( 'Access denied.', 'cs-chatbot' ) );
    }

    $company   = esc_html( cs_chatbot_get( 'company_name', get_bloginfo( 'name' ) ) );
    $brand     = cs_chatbot_get( 'brand_color', '#2563eb' );
    $agent_name = esc_html( wp_get_current_user()->display_name );
    $fb_cfg    = cs_chatbot_firebase_config();
    ?>
    <div id="cs-agent-app">

    <!-- ── Inline styles ─────────────────────────────────────────────────── -->
    <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    #cs-agent-app{display:flex;height:calc(100vh - 32px);background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;font-size:14px;color:#334155;overflow:hidden;}

    /* Sidebar */
    #cs-sidebar{width:300px;min-width:300px;background:#fff;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;overflow:hidden;}
    #cs-sidebar-header{background:<?php echo esc_attr($brand); ?>;color:#fff;padding:16px;flex-shrink:0;}
    #cs-sidebar-header h2{font-size:15px;font-weight:700;margin-bottom:2px;}
    #cs-sidebar-header p{font-size:11px;opacity:.8;}
    #cs-status-bar{padding:10px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:8px;flex-shrink:0;}
    #cs-status-dot{width:10px;height:10px;border-radius:50%;background:#4ade80;flex-shrink:0;}
    #cs-status-bar span{font-size:12px;color:#64748b;}
    #cs-chat-list{flex:1;overflow-y:auto;}
    .cs-chat-item{padding:14px 16px;border-bottom:1px solid #f1f5f9;cursor:pointer;transition:background .15s;display:flex;flex-direction:column;gap:4px;}
    .cs-chat-item:hover,.cs-chat-item.active{background:#eff6ff;}
    .cs-chat-item-top{display:flex;justify-content:space-between;align-items:center;}
    .cs-chat-item-name{font-weight:600;font-size:13px;color:#1e293b;}
    .cs-chat-item-time{font-size:10px;color:#94a3b8;}
    .cs-chat-item-preview{font-size:12px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .cs-badge{display:inline-flex;align-items:center;font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;}
    .cs-badge-waiting{background:#fef3c7;color:#d97706;}
    .cs-badge-active{background:#dcfce7;color:#16a34a;}
    .cs-badge-closed{background:#f1f5f9;color:#94a3b8;}
    .cs-empty-list{padding:40px 20px;text-align:center;color:#94a3b8;font-size:13px;}

    /* Main chat panel */
    #cs-main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
    #cs-no-chat{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#94a3b8;gap:12px;}
    #cs-no-chat svg{opacity:.3;}
    #cs-no-chat p{font-size:14px;}

    /* Active chat */
    #cs-active-chat{display:none;flex:1;flex-direction:column;overflow:hidden;}
    #cs-active-chat.visible{display:flex;}
    #cs-chat-topbar{background:#fff;border-bottom:1px solid #e2e8f0;padding:12px 20px;display:flex;align-items:center;gap:12px;flex-shrink:0;}
    #cs-chat-customer-info{flex:1;}
    #cs-chat-customer-name{font-weight:700;font-size:15px;color:#1e293b;}
    #cs-chat-customer-meta{font-size:11px;color:#94a3b8;margin-top:1px;}
    #cs-end-btn{padding:6px 14px;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;transition:background .15s;}
    #cs-end-btn:hover{background:#fecaca;}

    #cs-messages-area{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:10px;background:#f8fafc;}
    #cs-messages-area::-webkit-scrollbar{width:4px;}
    #cs-messages-area::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:99px;}
    .cs-msg-agent{display:flex;justify-content:flex-end;}
    .cs-msg-customer{display:flex;justify-content:flex-start;gap:8px;}
    .cs-msg-bot{display:flex;justify-content:flex-start;gap:8px;opacity:.7;}
    .cs-bubble-a{background:<?php echo esc_attr($brand); ?>;color:#fff;padding:9px 14px;border-radius:16px 16px 4px 16px;max-width:72%;font-size:13px;line-height:1.5;word-break:break-word;}
    .cs-bubble-c{background:#fff;color:#334155;padding:9px 14px;border-radius:16px 16px 16px 4px;max-width:72%;font-size:13px;line-height:1.5;border:1px solid #e2e8f0;word-break:break-word;}
    .cs-bubble-b{background:#e0e7ff;color:#3730a3;padding:8px 13px;border-radius:16px 16px 16px 4px;max-width:72%;font-size:12px;line-height:1.5;border:1px solid #c7d2fe;word-break:break-word;}
    .cs-msg-time{font-size:10px;color:#94a3b8;margin-top:2px;text-align:right;}
    .cs-msg-label{font-size:10px;color:#94a3b8;margin-bottom:3px;}
    .cs-icon-c{width:26px;height:26px;border-radius:50%;background:#eff6ff;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-top:2px;}

    #cs-reply-bar{background:#fff;border-top:1px solid #e2e8f0;padding:12px 16px;display:flex;gap:10px;align-items:flex-end;flex-shrink:0;}
    #cs-reply-input{flex:1;border:1px solid #e2e8f0;border-radius:12px;padding:10px 14px;font-size:13px;resize:none;outline:none;max-height:120px;overflow-y:auto;line-height:1.5;color:#334155;background:#fff;font-family:inherit;}
    #cs-reply-input:focus{border-color:<?php echo esc_attr($brand); ?>;}
    #cs-reply-btn{width:42px;height:42px;border-radius:50%;background:<?php echo esc_attr($brand); ?>;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:filter .15s;}
    #cs-reply-btn:hover{filter:brightness(1.1);}
    #cs-reply-btn svg{width:18px;height:18px;display:block;}

    /* Notification toast */
    #cs-toast{position:fixed;top:40px;right:20px;background:#1e293b;color:#fff;padding:12px 18px;border-radius:10px;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,.25);display:none;z-index:9999;max-width:280px;}
    #cs-toast.show{display:block;animation:cs-fadein .3s ease;}
    @keyframes cs-fadein{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

    @media(max-width:700px){
        #cs-sidebar{width:100%;position:absolute;top:0;bottom:0;left:0;z-index:10;transform:translateX(0);transition:transform .3s;}
        #cs-sidebar.hidden{transform:translateX(-100%);}
        #cs-main{width:100%;}
    }
    </style>

    <!-- ── Toast ── -->
    <div id="cs-toast"></div>

    <!-- ── Sidebar ────────────────────────────────────────────────────────── -->
    <div id="cs-sidebar">
        <div id="cs-sidebar-header">
            <h2>💬 <?php esc_html_e( 'Live Chats', 'cs-chatbot' ); ?></h2>
            <p><?php echo $company; ?> &mdash; <?php echo $agent_name; ?></p>
        </div>
        <div id="cs-status-bar">
            <span id="cs-status-dot"></span>
            <span id="cs-status-text"><?php esc_html_e( 'Connecting…', 'cs-chatbot' ); ?></span>
        </div>
        <div id="cs-chat-list">
            <div class="cs-empty-list" id="cs-empty-msg">
                <?php esc_html_e( 'No active chats yet. Waiting for customers…', 'cs-chatbot' ); ?>
            </div>
        </div>
    </div>

    <!-- ── Main panel ─────────────────────────────────────────────────────── -->
    <div id="cs-main">
        <div id="cs-no-chat">
            <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
            </svg>
            <p><?php esc_html_e( 'Select a conversation to start chatting', 'cs-chatbot' ); ?></p>
        </div>

        <div id="cs-active-chat">
            <div id="cs-chat-topbar">
                <div class="cs-icon-c" style="width:36px;height:36px;font-size:16px;">👤</div>
                <div id="cs-chat-customer-info">
                    <div id="cs-chat-customer-name">—</div>
                    <div id="cs-chat-customer-meta">—</div>
                </div>
                <button id="cs-end-btn" onclick="csAgentEndChat()">⛔ <?php esc_html_e( 'End Chat', 'cs-chatbot' ); ?></button>
            </div>
            <div id="cs-messages-area"></div>
            <div id="cs-reply-bar">
                <textarea id="cs-reply-input" rows="1" placeholder="<?php esc_attr_e( 'Type your reply… (Enter to send)', 'cs-chatbot' ); ?>"></textarea>
                <button id="cs-reply-btn" onclick="csAgentSend()">
                    <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="transform:rotate(45deg) translateY(-1px);">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
    </div><!-- /cs-agent-app -->

    <!-- ── Firebase SDK ───────────────────────────────────────────────────── -->
    <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
    import { getDatabase, ref, onValue, push, update, serverTimestamp, query, orderByChild }
        from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

    const FB_CFG = <?php echo wp_json_encode( $fb_cfg ); ?>;
    const AGENT_NAME = <?php echo wp_json_encode( $agent_name ); ?>;
    const AGENT_ID   = <?php echo wp_json_encode( (string) get_current_user_id() ); ?>;

    const app = initializeApp(FB_CFG);
    const db  = getDatabase(app);

    // ── State ────────────────────────────────────────────────────────────────
    let activeChatId   = null;
    let msgListener    = null;
    let conversations  = {};

    // ── Status indicator ─────────────────────────────────────────────────────
    document.getElementById('cs-status-dot').style.background = '#4ade80';
    document.getElementById('cs-status-text').textContent = 'Online';

    // ── Listen to all conversations ───────────────────────────────────────────
    const chatsRef = ref(db, 'cs_chatbot_chats');
    onValue(chatsRef, snap => {
        conversations = snap.val() || {};
        renderList();
    });

    function renderList() {
        const list = document.getElementById('cs-chat-list');
        const empty = document.getElementById('cs-empty-msg');
        const entries = Object.entries(conversations)
            .filter(([,v]) => v.status !== 'closed')
            .sort((a,b) => (b[1].createdAt||0) - (a[1].createdAt||0));

        if (!entries.length) {
            list.innerHTML = '';
            list.appendChild(empty);
            return;
        }
        empty.remove();

        list.innerHTML = '';
        entries.forEach(([id, chat]) => {
            const div = document.createElement('div');
            div.className = 'cs-chat-item' + (id === activeChatId ? ' active' : '');
            div.onclick = () => openChat(id, chat);
            const ago = timeAgo(chat.createdAt);
            const badge = chat.status === 'waiting'
                ? '<span class="cs-badge cs-badge-waiting">Waiting</span>'
                : '<span class="cs-badge cs-badge-active">Active</span>';
            div.innerHTML = `
                <div class="cs-chat-item-top">
                    <span class="cs-chat-item-name">${esc(chat.customerName||'Visitor')}</span>
                    <span class="cs-chat-item-time">${ago}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;">
                    <span class="cs-chat-item-preview">${esc(chat.lastMessage||'—')}</span>
                    ${badge}
                </div>`;
            list.appendChild(div);
        });

        // Notify on new waiting chat
        const waiting = entries.filter(([,v]) => v.status === 'waiting');
        if (waiting.length) showToast('💬 New customer waiting for an agent');
    }

    // ── Open a chat ───────────────────────────────────────────────────────────
    window.openChat = function(id, chat) {
        activeChatId = id;
        document.querySelectorAll('.cs-chat-item').forEach(el => el.classList.remove('active'));
        document.getElementById('cs-no-chat').style.display = 'none';
        const panel = document.getElementById('cs-active-chat');
        panel.classList.add('visible');
        document.getElementById('cs-chat-customer-name').textContent = chat.customerName || 'Visitor';
        document.getElementById('cs-chat-customer-meta').textContent =
            'Started ' + timeAgo(chat.createdAt) + ' · ' + (chat.status === 'waiting' ? 'Waiting for agent' : 'Active');

        // Mark as active and assign agent
        update(ref(db, 'cs_chatbot_chats/' + id), {
            status: 'active',
            agentName: AGENT_NAME,
            agentId: AGENT_ID,
        });

        // Detach previous listener
        if (msgListener) msgListener();

        // Listen to messages
        const msgsRef = ref(db, 'cs_chatbot_chats/' + id + '/messages');
        const area = document.getElementById('cs-messages-area');
        area.innerHTML = '';

        msgListener = onValue(msgsRef, snap => {
            area.innerHTML = '';
            const msgs = snap.val() || {};
            Object.values(msgs).sort((a,b) => (a.ts||0)-(b.ts||0)).forEach(m => {
                renderMsg(area, m);
            });
            area.scrollTop = area.scrollHeight;
        });

        renderList();
        document.getElementById('cs-reply-input').focus();
    };

    function renderMsg(area, m) {
        const wrap = document.createElement('div');
        if (m.sender === 'agent') {
            wrap.className = 'cs-msg-agent';
            wrap.innerHTML = `<div>
                <div class="cs-msg-label" style="text-align:right">${esc(m.agentName||'Agent')}</div>
                <div class="cs-bubble-a">${esc(m.text)}</div>
                <div class="cs-msg-time">${fmtTime(m.ts)}</div>
            </div>`;
        } else if (m.sender === 'bot') {
            wrap.className = 'cs-msg-bot';
            wrap.innerHTML = `<div class="cs-icon-c">🤖</div><div>
                <div class="cs-msg-label">Bot</div>
                <div class="cs-bubble-b">${esc(m.text)}</div>
            </div>`;
        } else {
            wrap.className = 'cs-msg-customer';
            wrap.innerHTML = `<div class="cs-icon-c">👤</div><div>
                <div class="cs-msg-label">Customer</div>
                <div class="cs-bubble-c">${esc(m.text)}</div>
                <div class="cs-msg-time">${fmtTime(m.ts)}</div>
            </div>`;
        }
        area.appendChild(wrap);
    }

    // ── Send agent message ────────────────────────────────────────────────────
    window.csAgentSend = function() {
        if (!activeChatId) return;
        const input = document.getElementById('cs-reply-input');
        const text  = input.value.trim();
        if (!text) return;
        input.value = '';

        push(ref(db, 'cs_chatbot_chats/' + activeChatId + '/messages'), {
            sender: 'agent',
            text: text,
            agentName: AGENT_NAME,
            agentId: AGENT_ID,
            ts: Date.now(),
        });
        update(ref(db, 'cs_chatbot_chats/' + activeChatId), { lastMessage: text, lastTs: Date.now() });
    };

    // Enter to send (Shift+Enter for newline)
    document.getElementById('cs-reply-input').addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); csAgentSend(); }
    });

    // ── End chat ──────────────────────────────────────────────────────────────
    window.csAgentEndChat = function() {
        if (!activeChatId || !confirm('End this chat session?')) return;
        update(ref(db, 'cs_chatbot_chats/' + activeChatId), { status: 'closed' });
        push(ref(db, 'cs_chatbot_chats/' + activeChatId + '/messages'), {
            sender: 'agent', text: '✅ This chat has been closed by the agent. Thank you!',
            agentName: AGENT_NAME, ts: Date.now(),
        });
        activeChatId = null;
        if (msgListener) { msgListener(); msgListener = null; }
        document.getElementById('cs-active-chat').classList.remove('visible');
        document.getElementById('cs-no-chat').style.display = '';
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    function esc(s){ const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
    function fmtTime(ts){ if(!ts) return ''; const d=new Date(ts); return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); }
    function timeAgo(ts) {
        if (!ts) return '';
        const s = Math.floor((Date.now()-ts)/1000);
        if (s < 60) return 'just now';
        if (s < 3600) return Math.floor(s/60)+'m ago';
        if (s < 86400) return Math.floor(s/3600)+'h ago';
        return Math.floor(s/86400)+'d ago';
    }
    function showToast(msg) {
        const t = document.getElementById('cs-toast');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 4000);
    }
    </script>
    <?php
}

// ── Helper: build Firebase config array ──────────────────────────────────────
function cs_chatbot_firebase_config() {
    return array(
        'apiKey'      => cs_chatbot_get( 'firebase_api_key' ),
        'authDomain'  => cs_chatbot_get( 'firebase_auth_domain' ),
        'projectId'   => cs_chatbot_get( 'firebase_project_id' ),
        'databaseURL' => cs_chatbot_get( 'firebase_db_url' ),
    );
}
