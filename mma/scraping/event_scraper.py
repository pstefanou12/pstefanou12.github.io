"""
EventScraper — abstract base class for MMA event scrapers.

Concrete implementations: SherdogEventScraper (sherdog.py).
"""
from abc import ABC, abstractmethod


class EventScraper(ABC):
    @abstractmethod
    def scrape_event(self, url: str, mode: str = 'both') -> dict:
        """
        Scrape an event page for preview or recap use.

        Args:
            url:  Source URL for the event page.
            mode: 'preview' omits result fields; 'recap' or 'both' includes them.

        Returns:
            {
                event_name: str,
                date:       str,   # ISO YYYY-MM-DD
                location:   str,
                fights: [{
                    card_placement:    str,        # 'Main Card' | 'Prelims' | 'Early Prelims'
                    fighter1:          str,
                    fighter2:          str,
                    method_of_victory: str | None, # None when mode == 'preview'
                    time_of_victory:   str | None,
                }]
            }
        """

    @abstractmethod
    def scrape_event_research(self, url: str) -> tuple[str, list[dict]]:
        """
        Scrape an event page for research, returning fighter profile URLs.

        Returns: (event_name, bouts) where each bout dict contains:
            {
                fighter1_name:  str,
                fighter1_url:   str,
                fighter2_name:  str,
                fighter2_url:   str,
                weight_class:   str,
                card_placement: str,
            }
        """

    @abstractmethod
    def scrape_fighter(self, name: str, url: str) -> dict:
        """
        Scrape a fighter profile page.

        Returns:
            {
                name:          str,
                profile_url:   str,
                record:        str | None,  # e.g. '22-7-0'
                streak:        str | None,  # e.g. '3 Win'
                recent_fights: [{
                    result:   str,  # 'Win' | 'Loss' | 'Draw' | 'NC'
                    opponent: str,
                    method:   str,
                    date:     str,  # e.g. 'December 13, 2025'
                }]
            }
        """
