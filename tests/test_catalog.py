"""Browser regression checks; synthetic data only, no live portal requests."""
import functools
import json
import os
from pathlib import Path
import shutil
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import unittest

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class CatalogueTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
        Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.runtime = sync_playwright().start()
        executable = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
        cls.browser = cls.runtime.chromium.launch(executable_path=executable, headless=True, args=['--no-sandbox'])
        cls.url = f'http://127.0.0.1:{cls.server.server_port}/preview/catalog.html'

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.runtime.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        self.page = self.browser.new_page(viewport={'width': 1440, 'height': 1000})
        self.page.goto(self.url)
        self.widget = self.page.locator('.pw-data-browser').first

    def tearDown(self):
        self.page.close()

    def visible_rows(self, widget=None):
        return (widget or self.widget).locator('tbody tr:not([hidden]):not(.pw-table-empty)')

    def selected_codes(self):
        return self.page.locator('#labels-form').evaluate("form => new FormData(form).getAll('label_codes[]')")

    def test_search_combined_filters_and_empty_results(self):
        self.assertEqual(self.visible_rows().count(), 25)
        self.widget.get_by_label('Search', exact=True).fill('frame orders-a')
        self.assertEqual(self.visible_rows().count(), 20)
        self.widget.get_by_role('button', name='Clear filters', exact=True).click()
        self.widget.get_by_label('Supplier', exact=True).select_option('Supplier A')
        self.widget.get_by_label('Status', exact=True).select_option('Enabled')
        self.widget.get_by_label('Order unit', exact=True).select_option('box')
        self.assertEqual(self.visible_rows().count(), 20)
        self.widget.get_by_label('Supplier', exact=True).select_option('Supplier C')
        self.assertEqual(self.visible_rows().count(), 0)
        self.assertTrue(self.widget.locator('.pw-table-empty').is_visible())
        self.assertTrue(self.widget.get_by_role('button', name='Next', exact=True).is_disabled())

    def test_natural_sort_and_accessible_sort_state(self):
        self.assertEqual(self.visible_rows().first.locator('td').nth(1).inner_text(), 'ITEM-001')
        heading = self.widget.locator('thead th').nth(1)
        heading.get_by_role('button').click()
        self.assertEqual(heading.get_attribute('aria-sort'), 'descending')
        self.assertEqual(self.visible_rows().first.locator('td').nth(1).inner_text(), 'ITEM-120')
        self.widget.get_by_label('Sort by', exact=True).select_option('1:asc')
        self.assertEqual(self.visible_rows().first.locator('td').nth(1).inner_text(), 'ITEM-001')
        supplier = self.page.locator('.pw-data-browser').nth(1)
        supplier.get_by_label('Sort by', exact=True).select_option('3:asc')
        self.assertEqual(self.visible_rows(supplier).first.locator('td').nth(3).inner_text(), '2')

    def test_native_selection_survives_pagination_filtering_and_sorting(self):
        first = self.widget.locator('input[value="ITEM-001"]')
        first.check()
        self.assertTrue(first.evaluate('input => document.activeElement === input'))
        self.widget.get_by_role('button', name='Next', exact=True).click()
        self.widget.locator('input[value="ITEM-026"]').check()
        self.widget.get_by_label('Search', exact=True).fill('ITEM-120')
        self.assertEqual(sorted(self.selected_codes()), ['ITEM-001', 'ITEM-026'])
        data = self.page.locator('#labels-form').evaluate('form => Object.fromEntries(new FormData(form))')
        self.assertEqual(data['action'], 'pwqr_labels')
        self.assertEqual(data['_wpnonce'], 'synthetic-example')
        self.assertEqual(self.widget.locator('input[name="label_codes[]"]').count(), 120)
        self.assertEqual(self.widget.locator('tbody a').first.get_attribute('href').split('-')[0], '#label')
        self.widget.get_by_role('button', name='Clear selection', exact=True).click()
        self.assertEqual(self.selected_codes(), [])
        self.widget.get_by_role('button', name='Clear filters', exact=True).click()
        self.widget.get_by_label('Status', exact=True).select_option('Draft / disabled')
        self.widget.get_by_role('button', name='Select 40 matching parts', exact=True).click()
        self.assertEqual(len(self.selected_codes()), 40)
        self.widget.get_by_role('button', name='Next', exact=True).click()
        self.assertTrue(self.widget.get_by_label('Select this page', exact=True).is_checked())
        self.widget.get_by_label('Select this page', exact=True).uncheck()
        self.assertEqual(len(self.selected_codes()), 25)

    def test_page_sizes_and_no_accidental_submit_buttons(self):
        self.widget.get_by_label('Per page', exact=True).select_option('50')
        self.assertEqual(self.visible_rows().count(), 50)
        self.widget.get_by_role('button', name='Next', exact=True).click()
        self.assertEqual(self.visible_rows().count(), 50)
        self.widget.get_by_role('button', name='Next', exact=True).click()
        self.assertEqual(self.visible_rows().count(), 20)
        self.assertTrue(self.widget.get_by_role('button', name='Next', exact=True).is_disabled())
        self.assertTrue(self.widget.locator('button').evaluate_all("buttons => buttons.every(button => button.type === 'button')"))

    def test_mobile_reflow_and_checkbox_regression(self):
        for width in [320, 375, 390, 600, 700, 701, 768, 1024, 1440, 1920]:
            with self.subTest(width=width):
                self.page.set_viewport_size({'width': width, 'height': 900})
                self.page.reload()
                # The native mobile label rule used to stretch include_drafts.
                self.page.add_style_tag(content='@media(max-width:640px){.pwqr-catalog form p label input{display:block;width:100%}}')
                self.page.add_style_tag(content=(ROOT / 'assets/portal-forms.css').read_text())
                value = self.page.evaluate('''() => {
                    const input=document.querySelector('[name="include_drafts"]');
                    const rect=input.getBoundingClientRect();
                    const scroll=document.querySelector('.pw-table-scroll');
                    return {overflow:document.documentElement.scrollWidth>innerWidth,checkWidth:rect.width,checkHeight:rect.height,tableHeight:scroll.getBoundingClientRect().height};
                }''')
                self.assertFalse(value['overflow'], value)
                self.assertEqual(value['checkWidth'], 20)
                self.assertEqual(value['checkHeight'], 20)
                self.assertLess(value['tableHeight'], 700)
                self.assertEqual(self.visible_rows().count(), 10 if width <= 700 else 25)
                if width <= 700:
                    self.assertTrue(self.page.locator('.pw-table-scroll').evaluate_all('wrappers => wrappers.every(w => w.querySelector("table").getBoundingClientRect().width <= w.clientWidth + 1)'))

    def test_stock_form_checkbox_and_field_alignment(self):
        self.page.goto(self.url.replace('catalog.html', 'forms.html'))
        for width in [320, 390, 768, 1024, 1440]:
            with self.subTest(width=width):
                self.page.set_viewport_size({'width': width, 'height': 900})
                value = self.page.evaluate('''() => ({
                    overflow:document.documentElement.scrollWidth>innerWidth,
                    checks:[...document.querySelectorAll('input[type="checkbox"]')].map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,display:getComputedStyle(e.parentElement).display})),
                    border:getComputedStyle(document.querySelector('.work-search input')).borderTopWidth,
                    weight:getComputedStyle(document.querySelector('.work-search input')).fontWeight
                })''')
                self.assertFalse(value['overflow'], value)
                self.assertTrue(all(c['width']==20 and c['height']==20 and c['display']=='flex' for c in value['checks']))
                self.assertEqual(value['border'], '1px')
                self.assertEqual(value['weight'], '400')


if __name__ == '__main__':
    unittest.main()
