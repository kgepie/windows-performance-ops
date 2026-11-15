<?php
/**
 * Plugin Name: Performance Windows Portal UI
 * Description: Responsive portal forms and catalogue search, filters, sorting and pagination. Preserves native catalogue forms and permissions.
 * Version: 1.2.0
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * License: MIT
 */
declare(strict_types=1);

namespace PWPortalUI;

if (!defined('ABSPATH')) { exit; }

const VERSION = '1.2.0';

function may_manage(): bool {
    return current_user_can('manage_options') || (function_exists('PWQR\\can_manage') && \PWQR\can_manage());
}

function asset(string $name): string {
    return add_query_arg('ver', VERSION, plugins_url('assets/' . $name, __FILE__));
}

add_action('wp_enqueue_scripts', static function(): void {
    if (!is_user_logged_in()) { return; }
    wp_enqueue_style('pw-portal-forms', asset('portal-forms.css'), [], VERSION);
}, 100);

add_action('admin_enqueue_scripts', static function(string $hook): void {
    if ($hook === 'toplevel_page_pwqr-ordering' && may_manage()) {
        wp_enqueue_style('pw-portal-forms', asset('portal-forms.css'), [], VERSION);
        wp_enqueue_script('pw-portal-catalog', asset('portal-catalog.js'), [], VERSION, true);
    }
}, 100);

// The native manager is a standalone document and does not call wp_head/wp_footer.
// Start before its native route, keep native authentication and handlers intact,
// and add static assets only when the resulting document contains the catalogue.
add_action('template_redirect', static function(): void {
    if (($_GET['pwqr_manage'] ?? '') !== '1' || !is_user_logged_in() || !may_manage()) { return; }
    ob_start(static function(string $html): string {
        if (strpos($html, 'pwqr-catalog') === false || strpos($html, 'pw-portal-ui-assets') !== false) { return $html; }
        $head = strripos($html, '</head>');
        $body = strripos($html, '</body>');
        if ($head === false || $body === false || $body <= $head) { return $html; }
        $script = '<script id="pw-portal-catalog-js" src="' . esc_url(asset('portal-catalog.js')) . '" defer></script>';
        $html = substr_replace($html, $script, $body, 0);
        $css = '<link id="pw-portal-ui-assets" rel="stylesheet" href="' . esc_url(asset('portal-forms.css')) . '">';
        return substr_replace($html, $css, $head, 0);
    });
}, -50);

add_action('rest_api_init', static function(): void {
    register_rest_route('pw-portal-ui/v1', '/status', [
        'methods' => 'GET',
        'permission_callback' => __NAMESPACE__ . '\\may_manage',
        'callback' => static function(): array {
            return [
                'version' => VERSION,
                'features' => ['responsive_forms', 'catalog_search', 'catalog_filters', 'catalog_sort', 'catalog_pagination'],
                'css_sha256' => hash_file('sha256', __DIR__ . '/assets/portal-forms.css'),
                'js_sha256' => hash_file('sha256', __DIR__ . '/assets/portal-catalog.js'),
            ];
        },
    ]);
});
