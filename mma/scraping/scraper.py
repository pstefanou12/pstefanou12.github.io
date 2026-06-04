"""
Scraper — fetch web pages and return BeautifulSoup objects.

Usage:
    # Requests-based (default)
    s = Scraper()

    # Selenium WebDriver (Firefox headless)
    s = Scraper(use_driver=True)

    soup = s.fetch('https://example.com')
    s.close()
"""
import bs4
import cloudscraper
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service

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
        self._cloudscraper = None

        if use_driver:
            opts = Options()
            opts.add_argument('--headless')
            opts.binary_location = _FIREFOX_BINARY
            self._driver = webdriver.Firefox(
                service=Service(_GECKODRIVER_PATH),
                options=opts,
            )
        else:
            self._cloudscraper = cloudscraper.create_scraper()

    def fetch(self, url: str) -> bs4.BeautifulSoup:
        """Fetch url and return a BeautifulSoup object."""
        if self._driver is not None:
            self._driver.get(url)
            return bs4.BeautifulSoup(self._driver.page_source, 'html.parser')
        resp = self._cloudscraper.get(url, headers=self._headers, timeout=15)
        resp.raise_for_status()
        return bs4.BeautifulSoup(resp.content, 'html.parser')

    def close(self) -> None:
        """Quit the Selenium driver if one was created."""
        if self._driver is not None:
            self._driver.quit()
            self._driver = None
