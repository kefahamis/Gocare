<?php
/**
 * Plugin Name:       CS Chatbot
 * Plugin URI:        https://example.com/cs-chatbot
 * Description:       Floating customer-service chatbot with automated responses, live agent handoff via Firebase, typing effects, quick-reply chips, and WhatsApp/Email escalation. Configurable from WP admin.
 * Version:           2.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Kefa Hamisi
 * Author URI:        https://example.com
 * License:           GPL v2 or later
 * Text Domain:       cs-chatbot
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'CS_CHATBOT_VERSION', '2.0.0' );
define( 'CS_CHATBOT_DIR', plugin_dir_path( __FILE__ ) );
define( 'CS_CHATBOT_URL', plugin_dir_url( __FILE__ ) );

require_once CS_CHATBOT_DIR . 'includes/settings.php';
require_once CS_CHATBOT_DIR . 'includes/frontend.php';
require_once CS_CHATBOT_DIR . 'includes/agent-dashboard.php';

register_activation_hook( __FILE__, 'cs_chatbot_activate' );
function cs_chatbot_activate() {
    $defaults = array(
        'company_name'    => get_bloginfo( 'name' ),
        'tagline'         => 'Typically replies instantly',
        'whatsapp_number' => '',
        'support_email'   => get_option( 'admin_email' ),
        'brand_color'     => '#2563eb',
        'brand_dark'      => '#1d4ed8',
        'hours'           => 'Mon – Sat, 8 AM – 8 PM',
        'show_on'         => 'all',
        'welcome_message' => "Hi there! 👋 I'm your virtual assistant. I can help with orders, returns, payments, and more.\n\nWhat can I help you with today?",
        'kb_json'         => '',
        'firebase_enabled'    => '',
        'firebase_api_key'    => '',
        'firebase_auth_domain'=> '',
        'firebase_project_id' => '',
        'firebase_db_url'     => '',
    );
    if ( ! get_option( 'cs_chatbot_settings' ) ) {
        add_option( 'cs_chatbot_settings', $defaults );
    }
}

register_deactivation_hook( __FILE__, 'cs_chatbot_deactivate' );
function cs_chatbot_deactivate() {}
