<?php

/*
 * Plugin Name: Test Autocomplete
 * Plugin URI: https://test.dev/
 * Description: A plugin that provides Tailwind CSS class autocompletion and utilities for WordPress.
 * Version: 1.0.0
 * Author: test
 * Author URI: https://test.dev/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: test
 * Domain Path: /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

/**
 * Enqueue Gutenberg block assets for both frontend + backend.
 */
function test_enqueue_block_assets() {
    $asset_file = include(plugin_dir_path(__FILE__) . 'build/gutenberg/index.asset.php');

    wp_enqueue_script(
        'test-block-editor',
        plugins_url('build/gutenberg/index.js', __FILE__),
        $asset_file['dependencies'],
        $asset_file['version']
    );

    wp_enqueue_style(
        'test-block-editor',
        plugins_url('build/gutenberg/index.css', __FILE__),
        array(),
        $asset_file['version']
    );
}
add_action('enqueue_block_editor_assets', 'test_enqueue_block_assets');

