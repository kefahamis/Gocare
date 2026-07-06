<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// ── Admin menu ────────────────────────────────────────────────────────────────
add_action( 'admin_menu', 'cs_chatbot_admin_menu' );
function cs_chatbot_admin_menu() {
    add_options_page(
        __( 'CS Chatbot Settings', 'cs-chatbot' ),
        __( 'CS Chatbot', 'cs-chatbot' ),
        'manage_options',
        'cs-chatbot',
        'cs_chatbot_settings_page'
    );
}

// ── Register settings ─────────────────────────────────────────────────────────
add_action( 'admin_init', 'cs_chatbot_register_settings' );
function cs_chatbot_register_settings() {
    register_setting(
        'cs_chatbot_group',
        'cs_chatbot_settings',
        array( 'sanitize_callback' => 'cs_chatbot_sanitize_settings' )
    );
}

function cs_chatbot_sanitize_settings( $input ) {
    $clean = array();
    $clean['company_name']    = sanitize_text_field( $input['company_name'] ?? '' );
    $clean['tagline']         = sanitize_text_field( $input['tagline'] ?? '' );
    $clean['whatsapp_number'] = preg_replace( '/[^0-9+]/', '', $input['whatsapp_number'] ?? '' );
    $clean['support_email']   = sanitize_email( $input['support_email'] ?? '' );
    $clean['brand_color']     = sanitize_hex_color( $input['brand_color'] ?? '#2563eb' );
    $clean['brand_dark']      = sanitize_hex_color( $input['brand_dark'] ?? '#1d4ed8' );
    $clean['hours']           = sanitize_text_field( $input['hours'] ?? '' );
    $clean['show_on']         = in_array( $input['show_on'] ?? 'all', array( 'all', 'home', 'none' ) ) ? $input['show_on'] : 'all';
    $clean['welcome_message'] = sanitize_textarea_field( $input['welcome_message'] ?? '' );
    $clean['kb_json']         = wp_kses_post( $input['kb_json'] ?? '' );
    // Firebase / Live Agent
    $clean['firebase_enabled']     = ! empty( $input['firebase_enabled'] ) ? '1' : '';
    $clean['firebase_api_key']     = sanitize_text_field( $input['firebase_api_key']     ?? '' );
    $clean['firebase_auth_domain'] = sanitize_text_field( $input['firebase_auth_domain'] ?? '' );
    $clean['firebase_project_id']  = sanitize_text_field( $input['firebase_project_id']  ?? '' );
    $clean['firebase_db_url']      = esc_url_raw( $input['firebase_db_url'] ?? '' );
    return $clean;
}

// ── Helper ────────────────────────────────────────────────────────────────────
function cs_chatbot_get( $key, $default = '' ) {
    $opts = get_option( 'cs_chatbot_settings', array() );
    return isset( $opts[ $key ] ) ? $opts[ $key ] : $default;
}

// ── Admin page HTML ───────────────────────────────────────────────────────────
function cs_chatbot_settings_page() {
    if ( ! current_user_can( 'manage_options' ) ) return;
    $saved = get_option( 'cs_chatbot_settings', array() );
    ?>
    <div class="wrap">
        <h1 style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:28px;">💬</span>
            <?php esc_html_e( 'CS Chatbot Settings', 'cs-chatbot' ); ?>
        </h1>
        <p style="color:#666;"><?php esc_html_e( 'Configure your floating customer-service chatbot. Changes apply immediately — no rebuild required.', 'cs-chatbot' ); ?></p>

        <form method="post" action="options.php" style="max-width:720px;">
            <?php settings_fields( 'cs_chatbot_group' ); ?>

            <!-- ── Branding ─────────────────────────────────────────────── -->
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin-top:20px;">
                <h2 style="margin-top:0;border-bottom:1px solid #f1f5f9;padding-bottom:10px;">
                    🎨 <?php esc_html_e( 'Branding', 'cs-chatbot' ); ?>
                </h2>
                <table class="form-table" style="margin:0;">
                    <tr>
                        <th><?php esc_html_e( 'Company / Bot Name', 'cs-chatbot' ); ?></th>
                        <td><input type="text" name="cs_chatbot_settings[company_name]" value="<?php echo esc_attr( $saved['company_name'] ?? '' ); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Header Tagline', 'cs-chatbot' ); ?></th>
                        <td><input type="text" name="cs_chatbot_settings[tagline]" value="<?php echo esc_attr( $saved['tagline'] ?? 'Typically replies instantly' ); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Brand Colour', 'cs-chatbot' ); ?></th>
                        <td>
                            <input type="color" name="cs_chatbot_settings[brand_color]" value="<?php echo esc_attr( $saved['brand_color'] ?? '#2563eb' ); ?>" />
                            <p class="description"><?php esc_html_e( 'Used for header, toggle button, and user message bubbles.', 'cs-chatbot' ); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Brand Colour (Hover)', 'cs-chatbot' ); ?></th>
                        <td><input type="color" name="cs_chatbot_settings[brand_dark]" value="<?php echo esc_attr( $saved['brand_dark'] ?? '#1d4ed8' ); ?>" /></td>
                    </tr>
                </table>
            </div>

            <!-- ── Contact & Handoff ────────────────────────────────────── -->
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin-top:16px;">
                <h2 style="margin-top:0;border-bottom:1px solid #f1f5f9;padding-bottom:10px;">
                    📞 <?php esc_html_e( 'Contact & Human Handoff', 'cs-chatbot' ); ?>
                </h2>
                <table class="form-table" style="margin:0;">
                    <tr>
                        <th><?php esc_html_e( 'WhatsApp Number', 'cs-chatbot' ); ?></th>
                        <td>
                            <input type="text" name="cs_chatbot_settings[whatsapp_number]" value="<?php echo esc_attr( $saved['whatsapp_number'] ?? '' ); ?>" class="regular-text" placeholder="+254700000000" />
                            <p class="description"><?php esc_html_e( 'Include country code. Leave blank to hide the WhatsApp button.', 'cs-chatbot' ); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Support Email', 'cs-chatbot' ); ?></th>
                        <td><input type="email" name="cs_chatbot_settings[support_email]" value="<?php echo esc_attr( $saved['support_email'] ?? '' ); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Support Hours', 'cs-chatbot' ); ?></th>
                        <td>
                            <input type="text" name="cs_chatbot_settings[hours]" value="<?php echo esc_attr( $saved['hours'] ?? 'Mon – Sat, 8 AM – 8 PM' ); ?>" class="regular-text" />
                            <p class="description"><?php esc_html_e( 'Shown in "Talk to an agent" responses.', 'cs-chatbot' ); ?></p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- ── Messages ─────────────────────────────────────────────── -->
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin-top:16px;">
                <h2 style="margin-top:0;border-bottom:1px solid #f1f5f9;padding-bottom:10px;">
                    💬 <?php esc_html_e( 'Welcome Message', 'cs-chatbot' ); ?>
                </h2>
                <table class="form-table" style="margin:0;">
                    <tr>
                        <th><?php esc_html_e( 'Welcome Message', 'cs-chatbot' ); ?></th>
                        <td>
                            <textarea name="cs_chatbot_settings[welcome_message]" rows="4" class="large-text"><?php echo esc_textarea( $saved['welcome_message'] ?? '' ); ?></textarea>
                            <p class="description"><?php esc_html_e( 'Shown on first open. Use \\n for new lines. Basic HTML like &lt;b&gt; is supported.', 'cs-chatbot' ); ?></p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- ── Display ──────────────────────────────────────────────── -->
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin-top:16px;">
                <h2 style="margin-top:0;border-bottom:1px solid #f1f5f9;padding-bottom:10px;">
                    🖥️ <?php esc_html_e( 'Display', 'cs-chatbot' ); ?>
                </h2>
                <table class="form-table" style="margin:0;">
                    <tr>
                        <th><?php esc_html_e( 'Show chatbot on', 'cs-chatbot' ); ?></th>
                        <td>
                            <select name="cs_chatbot_settings[show_on]">
                                <option value="all"  <?php selected( $saved['show_on'] ?? 'all', 'all' ); ?>><?php esc_html_e( 'All pages', 'cs-chatbot' ); ?></option>
                                <option value="home" <?php selected( $saved['show_on'] ?? 'all', 'home' ); ?>><?php esc_html_e( 'Front page only', 'cs-chatbot' ); ?></option>
                                <option value="none" <?php selected( $saved['show_on'] ?? 'all', 'none' ); ?>><?php esc_html_e( 'Disabled (hidden everywhere)', 'cs-chatbot' ); ?></option>
                            </select>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- ── Custom KB ────────────────────────────────────────────── -->
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin-top:16px;">
                <h2 style="margin-top:0;border-bottom:1px solid #f1f5f9;padding-bottom:10px;">
                    📚 <?php esc_html_e( 'Custom Knowledge Base (optional)', 'cs-chatbot' ); ?>
                </h2>
                <p style="color:#666;margin-top:0;"><?php esc_html_e( 'Override or extend the built-in Q&A with your own entries in JSON format. If left blank the built-in responses are used.', 'cs-chatbot' ); ?></p>
                <details>
                    <summary style="cursor:pointer;color:#2563eb;font-weight:500;"><?php esc_html_e( 'Show JSON format example', 'cs-chatbot' ); ?></summary>
                    <pre style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:12px;overflow-x:auto;margin-top:8px;">[
  {
    "patterns": ["delivery", "shipping", "how long"],
    "response": "We deliver in 2–4 business days nationwide.",
    "chips": ["Track order", "Talk to agent"]
  },
  {
    "patterns": ["return", "refund"],
    "response": "Returns accepted within 30 days.",
    "chips": ["Start return", "Talk to agent"]
  }
]</pre>
                </details>
                <textarea name="cs_chatbot_settings[kb_json]" rows="10" class="large-text code" style="margin-top:12px;font-family:monospace;"><?php echo esc_textarea( $saved['kb_json'] ?? '' ); ?></textarea>
            </div>

            <!-- ── Firebase / Live Agent ────────────────────────────── -->
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin-top:16px;">
                <h2 style="margin-top:0;border-bottom:1px solid #f1f5f9;padding-bottom:10px;">
                    🔴 <?php esc_html_e( 'Live Agent (Firebase Real-Time Chat)', 'cs-chatbot' ); ?>
                </h2>
                <p style="color:#666;margin-top:0;"><?php esc_html_e( 'Connect a free Firebase Realtime Database to allow your agents to chat live with customers. Agents respond from the Live Chats dashboard in this admin panel.', 'cs-chatbot' ); ?></p>
                <details style="margin-bottom:16px;">
                    <summary style="cursor:pointer;color:#2563eb;font-weight:500;"><?php esc_html_e( 'How to get your Firebase credentials', 'cs-chatbot' ); ?></summary>
                    <ol style="color:#555;line-height:1.8;margin-top:8px;">
                        <li>Go to <strong>console.firebase.google.com</strong> → Create project</li>
                        <li>Add a <strong>Web app</strong> (the &lt;/&gt; icon)</li>
                        <li>Copy the <code>firebaseConfig</code> values into the fields below</li>
                        <li>In Firebase console → <strong>Build → Realtime Database</strong> → Create database (Start in test mode)</li>
                        <li>Copy the Database URL (ends in <code>.firebaseio.com</code>)</li>
                    </ol>
                </details>
                <table class="form-table" style="margin:0;">
                    <tr>
                        <th><?php esc_html_e( 'Enable Live Agent', 'cs-chatbot' ); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="cs_chatbot_settings[firebase_enabled]" value="1" <?php checked( $saved['firebase_enabled'] ?? '', '1' ); ?> />
                                <?php esc_html_e( 'Enable real-time agent handoff via Firebase', 'cs-chatbot' ); ?>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'API Key', 'cs-chatbot' ); ?></th>
                        <td><input type="text" name="cs_chatbot_settings[firebase_api_key]" value="<?php echo esc_attr( $saved['firebase_api_key'] ?? '' ); ?>" class="regular-text" placeholder="AIzaSy..." /></td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Auth Domain', 'cs-chatbot' ); ?></th>
                        <td><input type="text" name="cs_chatbot_settings[firebase_auth_domain]" value="<?php echo esc_attr( $saved['firebase_auth_domain'] ?? '' ); ?>" class="regular-text" placeholder="your-project.firebaseapp.com" /></td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Project ID', 'cs-chatbot' ); ?></th>
                        <td><input type="text" name="cs_chatbot_settings[firebase_project_id]" value="<?php echo esc_attr( $saved['firebase_project_id'] ?? '' ); ?>" class="regular-text" placeholder="your-project-id" /></td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Database URL', 'cs-chatbot' ); ?></th>
                        <td><input type="url" name="cs_chatbot_settings[firebase_db_url]" value="<?php echo esc_attr( $saved['firebase_db_url'] ?? '' ); ?>" class="regular-text" placeholder="https://your-project-default-rtdb.firebaseio.com" /></td>
                    </tr>
                </table>
                <?php if ( ! empty( $saved['firebase_enabled'] ) ) : ?>
                <p style="margin-top:12px;">
                    <a href="<?php echo esc_url( admin_url( 'admin.php?page=cs-chatbot-live' ) ); ?>" class="button button-primary">
                        💬 <?php esc_html_e( 'Open Live Agent Dashboard', 'cs-chatbot' ); ?>
                    </a>
                </p>
                <?php endif; ?>
            </div>

            <?php submit_button( __( 'Save Settings', 'cs-chatbot' ) ); ?>
        </form>
    </div>
    <?php
}
