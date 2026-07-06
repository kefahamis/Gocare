<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// ── Should the chatbot appear on this request? ────────────────────────────────
function cs_chatbot_should_load() {
    $show = cs_chatbot_get( 'show_on', 'all' );
    if ( $show === 'none' )                          return false;
    if ( $show === 'home' && ! is_front_page() )     return false;
    return true;
}

// ── Enqueue JS only (CSS is inlined in footer to guarantee load order) ────────
add_action( 'wp_enqueue_scripts', 'cs_chatbot_enqueue' );
function cs_chatbot_enqueue() {
    if ( ! cs_chatbot_should_load() ) return;

    wp_enqueue_script(
        'cs-chatbot',
        CS_CHATBOT_URL . 'assets/js/chatbot.js',
        array(),
        CS_CHATBOT_VERSION,
        true
    );

    $wa = cs_chatbot_get( 'whatsapp_number' );
    $fb_enabled = cs_chatbot_get( 'firebase_enabled' ) ? '1' : '0';
    wp_localize_script( 'cs-chatbot', 'csChatbotConfig', array(
        'companyName'     => cs_chatbot_get( 'company_name', get_bloginfo( 'name' ) ),
        'tagline'         => cs_chatbot_get( 'tagline', 'Typically replies instantly' ),
        'whatsappUrl'     => $wa ? 'https://wa.me/' . ltrim( $wa, '+' ) : '',
        'supportEmail'    => cs_chatbot_get( 'support_email' ),
        'brandColor'      => cs_chatbot_get( 'brand_color', '#2563eb' ),
        'brandDark'       => cs_chatbot_get( 'brand_dark',  '#1d4ed8' ),
        'hours'           => cs_chatbot_get( 'hours', 'Mon – Sat, 8 AM – 8 PM' ),
        'welcomeMessage'  => cs_chatbot_get( 'welcome_message', "Hi there! 👋 How can I help you today?" ),
        'kbJson'          => cs_chatbot_get( 'kb_json', '' ),
        'firebaseEnabled' => $fb_enabled,
        'firebaseConfig'  => cs_chatbot_get( 'firebase_enabled' ) ? array(
            'apiKey'      => cs_chatbot_get( 'firebase_api_key' ),
            'authDomain'  => cs_chatbot_get( 'firebase_auth_domain' ),
            'projectId'   => cs_chatbot_get( 'firebase_project_id' ),
            'databaseURL' => cs_chatbot_get( 'firebase_db_url' ),
        ) : null,
    ) );
}

// ── Render styles + HTML into footer ─────────────────────────────────────────
add_action( 'wp_footer', 'cs_chatbot_render', 999 );
function cs_chatbot_render() {
    if ( ! cs_chatbot_should_load() ) return;

    $brand   = cs_chatbot_get( 'brand_color', '#2563eb' );
    $dark    = cs_chatbot_get( 'brand_dark',  '#1d4ed8' );
    $wa      = cs_chatbot_get( 'whatsapp_number' );
    $wa_url  = $wa ? esc_url( 'https://wa.me/' . ltrim( $wa, '+' ) ) : '';
    $email   = esc_attr( cs_chatbot_get( 'support_email' ) );
    $company = esc_html( cs_chatbot_get( 'company_name', get_bloginfo( 'name' ) ) );
    $tagline = esc_html( cs_chatbot_get( 'tagline', 'Typically replies instantly' ) );

    // Sanitise colour values for safe inline CSS output
    $brand_css = sanitize_hex_color( $brand ) ?: '#2563eb';
    $dark_css  = sanitize_hex_color( $dark )  ?: '#1d4ed8';

    ?>
<!-- CS Chatbot v<?php echo CS_CHATBOT_VERSION; ?> -->
<style id="cs-chatbot-styles">
/* ── Keyframes ── */
@keyframes cs-slide-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes cs-badge{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
@keyframes cs-dot{0%,80%,100%{transform:scale(0);opacity:.3}40%{transform:scale(1);opacity:1}}

/* ── Toggle button ── */
#csChatToggle{
    all:unset!important;
    position:fixed!important;bottom:24px!important;right:24px!important;
    z-index:2147483647!important;
    width:60px!important;height:60px!important;
    border-radius:50%!important;
    background:<?php echo $brand_css; ?>!important;
    color:#fff!important;
    cursor:pointer!important;
    display:flex!important;align-items:center!important;justify-content:center!important;
    box-shadow:0 6px 24px rgba(0,0,0,.3)!important;
    box-sizing:border-box!important;
    transition:filter .2s!important;
    -webkit-tap-highlight-color:transparent!important;
}
#csChatToggle:hover{filter:brightness(1.1)!important;}
#csChatToggle:active{transform:scale(.93)!important;}
#csChatToggle svg{width:26px!important;height:26px!important;display:block!important;flex-shrink:0!important;}
#csNotifBadge{
    position:absolute!important;top:-4px!important;right:-4px!important;
    width:20px!important;height:20px!important;
    background:#ef4444!important;color:#fff!important;
    font-size:11px!important;font-weight:700!important;
    border-radius:50%!important;
    display:flex!important;align-items:center!important;justify-content:center!important;
    animation:cs-badge 2s infinite!important;
    pointer-events:none!important;
    line-height:1!important;
}

/* ── Chat window ── */
#csChatWindow{
    position:fixed!important;bottom:96px!important;right:24px!important;
    top:auto!important;left:auto!important;
    z-index:2147483646!important;
    width:370px!important;max-width:calc(100vw - 32px)!important;
    height:540px!important;max-height:calc(100vh - 120px)!important;
    background:#fff!important;
    border-radius:18px!important;
    box-shadow:0 12px 48px rgba(0,0,0,.22)!important;
    display:flex!important;flex-direction:column!important;
    overflow:hidden!important;
    transition:opacity .25s,transform .25s!important;
    margin:0!important;padding:0!important;
    box-sizing:border-box!important;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif!important;
    font-size:14px!important;line-height:1.5!important;color:#334155!important;
}
#csChatWindow *{box-sizing:border-box!important;}
#csChatWindow.cs-chat-hidden{opacity:0!important;transform:translateY(16px) scale(.97)!important;pointer-events:none!important;}
#csChatWindow.cs-chat-visible{opacity:1!important;transform:translateY(0) scale(1)!important;pointer-events:auto!important;}

/* ── Header ── */
#csChatHeader{
    background:<?php echo $brand_css; ?>!important;
    padding:12px 14px!important;
    display:flex!important;align-items:center!important;gap:10px!important;
    flex-shrink:0!important;margin:0!important;
    width:100%!important;
}
.cs-avatar-wrap{position:relative!important;flex-shrink:0!important;}
.cs-avatar{
    width:38px!important;height:38px!important;
    border-radius:50%!important;
    background:rgba(255,255,255,.2)!important;
    display:flex!important;align-items:center!important;justify-content:center!important;
    font-size:18px!important;
}
.cs-online-dot{
    position:absolute!important;bottom:1px!important;right:1px!important;
    width:10px!important;height:10px!important;
    background:#4ade80!important;
    border:2px solid <?php echo $brand_css; ?>!important;
    border-radius:50%!important;
}
.cs-header-info{flex:1!important;min-width:0!important;}
.cs-company-name{
    color:#fff!important;font-size:13px!important;font-weight:600!important;
    margin:0!important;padding:0!important;
    white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
    background:none!important;border:none!important;display:block!important;
}
.cs-tagline{
    color:rgba(255,255,255,.78)!important;font-size:11px!important;
    margin:0!important;padding:0!important;
    background:none!important;border:none!important;display:block!important;
}
.cs-header-actions{display:flex!important;gap:6px!important;flex-shrink:0!important;}
.cs-icon-btn{
    all:unset!important;
    width:30px!important;height:30px!important;
    border-radius:50%!important;
    background:rgba(255,255,255,.2)!important;
    color:#fff!important;
    cursor:pointer!important;
    display:flex!important;align-items:center!important;justify-content:center!important;
    text-decoration:none!important;
    transition:background .15s!important;
    flex-shrink:0!important;
    box-sizing:border-box!important;
}
.cs-icon-btn:hover{background:rgba(255,255,255,.35)!important;}
.cs-icon-btn svg{width:15px!important;height:15px!important;display:block!important;flex-shrink:0!important;}

/* ── Messages ── */
#csChatMessages{
    flex:1!important;overflow-y:auto!important;overflow-x:hidden!important;
    padding:14px!important;
    display:flex!important;flex-direction:column!important;gap:10px!important;
    background:#f8fafc!important;margin:0!important;
}
#csChatMessages::-webkit-scrollbar{width:4px!important;}
#csChatMessages::-webkit-scrollbar-thumb{background:#cbd5e1!important;border-radius:99px!important;}
.cs-msg-row-user{display:flex!important;justify-content:flex-end!important;margin:0!important;animation:cs-slide-up .25s ease-out!important;}
.cs-msg-row-bot{display:flex!important;align-items:flex-start!important;gap:8px!important;margin:0!important;animation:cs-slide-up .25s ease-out!important;}
.cs-bot-icon{
    width:26px!important;height:26px!important;min-width:26px!important;
    border-radius:50%!important;background:#eff6ff!important;
    display:flex!important;align-items:center!important;justify-content:center!important;
    font-size:13px!important;flex-shrink:0!important;margin-top:2px!important;
}
.cs-bubble-user{
    max-width:78%!important;
    background:<?php echo $brand_css; ?>!important;color:#fff!important;
    padding:9px 14px!important;
    border-radius:16px 16px 4px 16px!important;
    font-size:13px!important;line-height:1.5!important;
    word-break:break-word!important;
    box-shadow:0 1px 3px rgba(0,0,0,.1)!important;
    margin:0!important;
}
.cs-bubble-bot{
    max-width:80%!important;
    background:#fff!important;color:#334155!important;
    padding:9px 14px!important;
    border-radius:16px 16px 16px 4px!important;
    font-size:13px!important;line-height:1.6!important;
    word-break:break-word!important;
    box-shadow:0 1px 4px rgba(0,0,0,.07)!important;
    border:1px solid #e2e8f0!important;
    margin:0!important;
}
.cs-bubble-bot a{color:<?php echo $brand_css; ?>!important;}
.cs-bubble-bot b{font-weight:600!important;}
.cs-typing-dots{display:flex!important;gap:4px!important;padding:2px 0!important;align-items:center!important;}
.cs-dot{
    display:inline-block!important;
    width:7px!important;height:7px!important;
    border-radius:50%!important;background:#94a3b8!important;
    animation:cs-dot 1.4s infinite ease-in-out!important;
    flex-shrink:0!important;
}
.cs-dot:nth-child(2){animation-delay:.2s!important;}
.cs-dot:nth-child(3){animation-delay:.4s!important;}

/* ── Quick replies ── */
#csQuickReplies{
    padding:8px 12px!important;
    display:flex!important;flex-wrap:wrap!important;gap:6px!important;
    background:#fff!important;border-top:1px solid #f1f5f9!important;
    flex-shrink:0!important;margin:0!important;
}
.cs-chip{
    all:unset!important;
    font-size:11px!important;padding:4px 12px!important;
    border-radius:99px!important;
    border:1px solid <?php echo $brand_css; ?>!important;
    color:<?php echo $brand_css; ?>!important;
    background:#fff!important;cursor:pointer!important;
    transition:background .15s,color .15s!important;
    box-sizing:border-box!important;display:inline-block!important;
    line-height:1.4!important;
}
.cs-chip:hover{background:<?php echo $brand_css; ?>!important;color:#fff!important;}

/* ── Input bar ── */
#csChatInputBar{
    display:flex!important;align-items:center!important;gap:8px!important;
    padding:10px 12px!important;
    background:#fff!important;border-top:1px solid #f1f5f9!important;
    flex-shrink:0!important;margin:0!important;
}
#csChatInput{
    all:unset!important;
    flex:1!important;min-width:0!important;
    background:#f1f5f9!important;
    border-radius:99px!important;
    padding:9px 16px!important;
    font-size:13px!important;color:#334155!important;
    box-sizing:border-box!important;
    transition:box-shadow .15s!important;
}
#csChatInput:focus{box-shadow:0 0 0 3px rgba(37,99,235,.2)!important;}
#csChatInput::placeholder{color:#94a3b8!important;opacity:1!important;}
#csSendBtn{
    all:unset!important;
    width:38px!important;height:38px!important;min-width:38px!important;
    border-radius:50%!important;
    background:<?php echo $brand_css; ?>!important;color:#fff!important;
    cursor:pointer!important;
    display:flex!important;align-items:center!important;justify-content:center!important;
    flex-shrink:0!important;
    box-sizing:border-box!important;
    transition:filter .15s,transform .1s!important;
}
#csSendBtn:hover{filter:brightness(1.1)!important;}
#csSendBtn:active{transform:scale(.9)!important;}
#csSendBtn svg{width:18px!important;height:18px!important;display:block!important;flex-shrink:0!important;}

/* ── Footer ── */
#csChatFooter{
    all:unset!important;
    display:block!important;
    text-align:center!important;font-size:10px!important;color:#94a3b8!important;
    padding:5px 12px 8px!important;background:#fff!important;
    flex-shrink:0!important;line-height:1.4!important;
    box-sizing:border-box!important;
}
#csChatFooter span{font-weight:600!important;color:<?php echo $brand_css; ?>!important;}
#csChatFooter a{color:#94a3b8!important;text-decoration:none!important;}
#csChatFooter a:hover{text-decoration:underline!important;}

/* ── Utility ── */
.cs-hidden{display:none!important;visibility:hidden!important;}

/* ── Toggle icon states — explicit so all:unset can't interfere ── */
#csIconOpen{display:block!important;}
#csIconOpen.cs-hidden{display:none!important;visibility:hidden!important;}
#csIconClose{display:none!important;visibility:hidden!important;}
#csIconClose:not(.cs-hidden){display:block!important;visibility:visible!important;}
#csNotifBadge.cs-hidden{display:none!important;visibility:hidden!important;}

/* ── Mobile ── */
@media(max-width:480px){
    #csChatWindow{
        bottom:0!important;right:0!important;left:0!important;
        width:100%!important;max-width:100%!important;
        height:100%!important;max-height:100%!important;
        border-radius:0!important;
    }
    #csChatToggle{bottom:16px!important;right:16px!important;}
}
</style>

<!-- Toggle button -->
<button
    id="csChatToggle"
    onclick="csChatbotToggle()"
    aria-label="<?php esc_attr_e( 'Open customer support chat', 'cs-chatbot' ); ?>"
>
    <svg id="csIconOpen" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:26px;height:26px;display:block;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
    </svg>
    <svg id="csIconClose" width="26" height="26" class="cs-hidden" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="width:26px;height:26px;display:none;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
    <span id="csNotifBadge">1</span>
</button>

<!-- Chat window -->
<div id="csChatWindow" role="dialog" aria-label="<?php esc_attr_e( 'Customer support chat', 'cs-chatbot' ); ?>" class="cs-chat-hidden">

    <!-- Header -->
    <div id="csChatHeader">
        <div class="cs-avatar-wrap">
            <div class="cs-avatar">🎧</div>
            <span class="cs-online-dot"></span>
        </div>
        <div class="cs-header-info">
            <p class="cs-company-name"><?php echo $company; ?></p>
            <p class="cs-tagline"><?php echo $tagline; ?></p>
        </div>
        <div class="cs-header-actions">
            <?php if ( $wa_url ) : ?>
            <a href="<?php echo $wa_url; ?>" target="_blank" class="cs-icon-btn" title="WhatsApp" aria-label="<?php esc_attr_e( 'WhatsApp', 'cs-chatbot' ); ?>">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" style="width:15px;height:15px;display:block;">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.887.502 3.659 1.381 5.193L2 22l4.878-1.361A9.937 9.937 0 0012 22c5.523 0 10-4.477 10-10S17.522 2 12 2zm0 18.182a8.181 8.181 0 01-4.164-1.133l-.299-.177-3.091.863.872-3.018-.194-.31A8.183 8.183 0 013.818 12c0-4.512 3.67-8.182 8.182-8.182s8.182 3.67 8.182 8.182c0 4.513-3.67 8.182-8.182 8.182z"/>
                </svg>
            </a>
            <?php endif; ?>
            <?php if ( $email ) : ?>
            <a href="mailto:<?php echo $email; ?>" class="cs-icon-btn" title="Email" aria-label="<?php esc_attr_e( 'Email', 'cs-chatbot' ); ?>">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:15px;height:15px;display:block;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
            </a>
            <?php endif; ?>
            <button onclick="csChatbotToggle()" class="cs-icon-btn" aria-label="<?php esc_attr_e( 'Close', 'cs-chatbot' ); ?>">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="width:15px;height:15px;display:block;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    </div>

    <!-- Messages -->
    <div id="csChatMessages"></div>

    <!-- Quick replies -->
    <div id="csQuickReplies"></div>

    <!-- Input bar -->
    <div id="csChatInputBar">
        <input
            type="text"
            id="csChatInput"
            placeholder="<?php esc_attr_e( 'Type a message…', 'cs-chatbot' ); ?>"
            maxlength="300"
            onkeydown="csChatbotHandleKey(event)"
            aria-label="<?php esc_attr_e( 'Type your message', 'cs-chatbot' ); ?>"
        />
        <button id="csSendBtn" onclick="csChatbotSend()" aria-label="<?php esc_attr_e( 'Send', 'cs-chatbot' ); ?>">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="width:18px;height:18px;display:block;transform:rotate(45deg) translateY(-1px);">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
        </button>
    </div>

    <!-- Footer bar -->
    <p id="csChatFooter">
        <?php
        printf(
            esc_html__( 'Powered by %s', 'cs-chatbot' ),
            '<span>' . $company . '</span>'
        );
        if ( $email ) {
            echo ' &middot; <a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a>';
        }
        ?>
    </p>
</div>

<script>
/* Move chatbot elements to <body> to escape any theme transform context */
(function(){
    var b = document.body;
    var t = document.getElementById('csChatToggle');
    var w = document.getElementById('csChatWindow');
    if(t && t.parentNode !== b) b.appendChild(t);
    if(w && w.parentNode !== b) b.appendChild(w);
})();
</script>
<!-- /CS Chatbot -->
    <?php
}
