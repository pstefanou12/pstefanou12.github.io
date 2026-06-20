"""
Scraper — fetch web pages and return BeautifulSoup objects.

Uses cloudscraper when available (Cloudflare bypass), otherwise falls back
to a plain requests session. Optionally drives a headless Firefox browser
via Selenium for JavaScript-heavy pages.

Usage:
    s = Scraper()            # cloudscraper or requests (auto-detected)
    s = Scraper(use_driver=True)  # Selenium headless Firefox

    soup = s.fetch('https://example.com')
    s.close()
"""
import bs4

try:
    import cloudscraper as _cloudscraper_mod
    _HAS_CLOUDSCRAPER = True
except ImportError:
    _HAS_CLOUDSCRAPER = False

try:
    from selenium import webdriver
    from selenium.webdriver.firefox.options import Options
    from selenium.webdriver.firefox.service import Service
    _HAS_SELENIUM = True
except ImportError:
    _HAS_SELENIUM = False

_DEFAULT_HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/120.0.0.0 Safari/537.36'
    )
}

_FIREFOX_BINARY = '/snap/firefox/current/usr/lib/firefox/firefox'
_GECKODRIVER_PATH = '/snap/bin/geckodriver'


class Scraper:
    def __init__(
        self,
        use_driver: bool = False,
        headers: dict = None,
    ):
        self._headers: dict = headers or _DEFAULT_HEADERS
        self._driver = None
        self._session = None

        if use_driver:
            if not _HAS_SELENIUM:
                raise RuntimeError('selenium is not installed; cannot use --driver')
            opts = Options()
            opts.add_argument('--headless')
            opts.binary_location = _FIREFOX_BINARY
            self._driver = webdriver.Firefox(
                service=Service(_GECKODRIVER_PATH),
                options=opts,
            )
        elif _HAS_CLOUDSCRAPER:
            self._session = _cloudscraper_mod.create_scraper()
        else:
            import requests
            self._session = requests.Session()
            self._session.headers.update(self._headers)

    def fetch(self, url: str) -> bs4.BeautifulSoup:
        """Fetch url and return a BeautifulSoup object."""
        if self._driver is not None:
            self._driver.get(url)
            return bs4.BeautifulSoup(self._driver.page_source, 'html.parser')
        resp = self._session.get(url, headers=self._headers, timeout=15)
        resp.raise_for_status()
        return bs4.BeautifulSoup(resp.content, 'html.parser')

    def close(self) -> None:
        """Quit the Selenium driver if one was created."""
        if self._driver is not None:
            self._driver.quit()
            self._driver = None
