import uiautomation as auto
import urllib.parse
from .config import cfg

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from common import logger


# ── Known site name → domain mappings ──
_SITE_TO_DOMAIN: dict[str, str | None] = {
    'youtube':          'youtube.com',
    'google search':    'google.com',
    'google':           'google.com',
    'gmail':            'mail.google.com',
    'google docs':      'docs.google.com',
    'google sheets':    'sheets.google.com',
    'google slides':    'slides.google.com',
    'google drive':     'drive.google.com',
    'google maps':      'maps.google.com',
    'google calendar':  'calendar.google.com',
    'google meet':      'meet.google.com',
    'google photos':    'photos.google.com',
    'google translate': 'translate.google.com',
    'google colab':     'colab.research.google.com',
    'reddit':           'reddit.com',
    'twitter':          'twitter.com',
    'x':                'x.com',
    'facebook':         'facebook.com',
    'instagram':        'instagram.com',
    'linkedin':         'linkedin.com',
    'github':           'github.com',
    'stackoverflow':    'stackoverflow.com',
    'stack overflow':   'stackoverflow.com',
    'wikipedia':        'wikipedia.org',
    'amazon':           'amazon.com',
    'amazon.in':        'amazon.in',
    'flipkart':         'flipkart.com',
    'netflix':          'netflix.com',
    'prime video':      'primevideo.com',
    'disney+ hotstar':  'hotstar.com',
    'hotstar':          'hotstar.com',
    'twitch':           'twitch.tv',
    'discord':          'discord.com',
    'whatsapp web':     'web.whatsapp.com',
    'whatsapp':         'web.whatsapp.com',
    'telegram':         'web.telegram.org',
    'spotify':          'open.spotify.com',
    'notion':           'notion.so',
    'figma':            'figma.com',
    'canva':            'canva.com',
    'chatgpt':          'chatgpt.com',
    'claude':           'claude.ai',
    'perplexity':       'perplexity.ai',
    'pinterest':        'pinterest.com',
    'quora':            'quora.com',
    'medium':           'medium.com',
    'tumblr':           'tumblr.com',
    'tiktok':           'tiktok.com',
    'snapchat':         'web.snapchat.com',
    'slack':            'slack.com',
    'trello':           'trello.com',
    'jira':             'atlassian.net',
    'confluence':       'atlassian.net',
    'zoom':             'zoom.us',
    'microsoft teams':  'teams.microsoft.com',
    'teams':            'teams.microsoft.com',
    'outlook':          'outlook.live.com',
    'onedrive':         'onedrive.live.com',
    'dropbox':          'dropbox.com',
    'coursera':         'coursera.org',
    'udemy':            'udemy.com',
    'khan academy':     'khanacademy.org',
    'leetcode':         'leetcode.com',
    'codeforces':       'codeforces.com',
    'hackerrank':       'hackerrank.com',
    'codepen':          'codepen.io',
    'replit':           'replit.com',
    'vercel':           'vercel.com',
    'netlify':          'netlify.app',
    'heroku':           'heroku.com',
    'aws':              'aws.amazon.com',
    'azure':            'portal.azure.com',
    'ebay':             'ebay.com',
    'etsy':             'etsy.com',
    'walmart':          'walmart.com',
    'target':           'target.com',
    'imdb':             'imdb.com',
    'rotten tomatoes':  'rottentomatoes.com',
    'hulu':             'hulu.com',
    'crunchyroll':      'crunchyroll.com',
    'soundcloud':       'soundcloud.com',
    'apple music':      'music.apple.com',
    'bing':             'bing.com',
    'duckduckgo':       'duckduckgo.com',
    'yahoo':            'yahoo.com',
    'msn':              'msn.com',
    'cnn':              'cnn.com',
    'bbc':              'bbc.com',
    'nytimes':          'nytimes.com',
    'the new york times':'nytimes.com',
    'washington post':  'washingtonpost.com',
    # Pages to ignore
    'new tab':          None,
    'start':            None,
    'settings':         None,
    'extensions':       None,
    'downloads':        None,
    'history':          None,
    'about:blank':      None,
}

# ── Browser name suffixes to strip from window titles ──
_BROWSER_SUFFIXES = [
    ' - Microsoft​ Edge',   # note: Edge sometimes uses a special char
    ' - Microsoft Edge',
    ' — Microsoft Edge',
    ' - Google Chrome',
    ' — Google Chrome',
    ' - Brave',
    ' — Brave',
    ' - Mozilla Firefox',
    ' — Mozilla Firefox',
    ' - Opera',
    ' — Opera',
    ' - Vivaldi',
    ' — Vivaldi',
    ' - Arc',
    ' — Arc',
    ' - Waterfox',
    ' - Chromium',
    ' - Brave Search',
]

# ── Address bar names for UI Automation ──
_ADDRESS_BAR_NAMES = [
    'Address and search bar',              # Chrome, Edge
    'Search or enter web address',         # Firefox
    'Search with Google or enter address', # Firefox (newer)
    'Address field',                       # Opera
    'Address bar',                         # Brave
    'Address',                             # Generic
]


def _extract_site_from_title(title: str) -> tuple[str | None, str | None]:
    """Extract a site domain from the browser window title.
    
    Works by stripping the browser suffix, then looking for a known site name
    in the remaining title text. This is the most reliable method because
    window titles are always available regardless of UI Automation support
    or browser privacy mode.
    
    Returns (domain, full_url_or_None).
    """
    if not title or len(title) < 3:
        return None, None
    
    # Strip browser suffix
    clean = title
    for suffix in _BROWSER_SUFFIXES:
        if clean.endswith(suffix):
            clean = clean[:-len(suffix)].strip()
            break
    
    if not clean or clean == title:
        # No browser suffix found — might not be a browser, or title is unusual.
        # Try anyway with the full title.
        clean = title
    
    # Strategy 1: Check if the first or last segment after a separator is a known site
    separators = [' - ', ' | ', ' — ', ' · ', ' – ']
    for sep in separators:
        if sep in clean:
            parts = clean.split(sep)
            # Check first part (e.g., "GitHub - page-title")
            candidate_first = parts[0].strip().lower()
            if candidate_first in _SITE_TO_DOMAIN:
                domain = _SITE_TO_DOMAIN[candidate_first]
                return domain, f"https://{domain}/" if domain else (None, None)
            # Check last part (e.g., "page-title - YouTube")
            candidate_last = parts[-1].strip().lower()
            if candidate_last in _SITE_TO_DOMAIN:
                domain = _SITE_TO_DOMAIN[candidate_last]
                return domain, f"https://{domain}/" if domain else (None, None)
    
    # Strategy 2: Check if the whole cleaned title is a known site
    lower_clean = clean.strip().lower()
    if lower_clean in _SITE_TO_DOMAIN:
        domain = _SITE_TO_DOMAIN[lower_clean]
        return domain, f"https://{domain}/" if domain else (None, None)
    
    # Strategy 3: The cleaned title itself might contain a domain-like string
    # e.g. "example.com" or "docs.example.com/page"
    for word in lower_clean.replace('/', ' ').split():
        if '.' in word and len(word) > 4 and ' ' not in word:
            # Looks like a domain
            domain = word.split('/')[0]
            if domain.startswith('www.'):
                domain = domain[4:]
            return domain, f"https://{domain}/"
    
    return None, None


def _try_ui_automation(hwnd: int) -> tuple[str | None, str | None]:
    """Try to read the URL from the browser address bar via UI Automation.
    
    Returns (domain, full_url) or (None, None) on failure.
    """
    try:
        win = auto.ControlFromHandle(hwnd)
        if not win:
            return None, None
        
        bar = None
        
        # Strategy 1: Find by Chromium class name (most reliable for Chrome/Edge)
        try:
            candidate = win.EditControl(ClassName='OmniboxViewViews', searchDepth=15)
            if candidate.Exists(0.05):
                bar = candidate
        except Exception:
            pass
        
        # Strategy 2: Find by known address bar names
        if bar is None:
            for name in _ADDRESS_BAR_NAMES:
                try:
                    candidate = win.EditControl(Name=name, searchDepth=12)
                    if candidate.Exists(0.05):
                        bar = candidate
                        break
                except Exception:
                    continue
        
        # Strategy 3: Generic EditControl with deep search
        if bar is None:
            try:
                candidate = win.EditControl(searchDepth=15)
                if candidate.Exists(0.1):
                    bar = candidate
            except Exception:
                pass
        
        if bar is None:
            return None, None
        
        # Read the URL value
        val = None
        try:
            val = bar.GetValuePattern().Value
        except Exception:
            pass
        
        if not val:
            try:
                val = bar.GetLegacyIAccessiblePattern().Value
            except Exception:
                pass
        
        if not val or len(val.strip()) < 3:
            return None, None
        
        val = val.strip()
        if not val.startswith("http"):
            val = "https://" + val
        
        parsed = urllib.parse.urlparse(val)
        domain = parsed.netloc
        if domain.startswith("www."):
            domain = domain[4:]
        if "." not in domain and "localhost" not in domain:
            return None, None
        
        return domain, val
    except Exception:
        return None, None


def get_browser_url(exe: str, hwnd: int, title: str = "") -> tuple[str | None, str | None]:
    """Extract the current website from a browser window.
    
    Uses a two-pronged approach:
    1. UI Automation — reads the actual URL from the address bar
    2. Window title parsing — extracts site name from the window title
    
    Both methods work in incognito/InPrivate mode.
    
    Returns (domain, full_url_or_title_url).
    """
    if exe.lower() not in cfg.browsers.tracked:
        return None, None
    
    logger.debug(f"Extracting URL for {exe} (hwnd={hwnd}, title='{title}')")
    
    # Method 1: Try UI Automation (gives exact URL)
    domain, full_url = _try_ui_automation(hwnd)
    if domain:
        logger.info(f"Website tracked via UI Automation for {exe}: {domain} ({full_url})")
        return domain, full_url
        
    logger.debug(f"UI Automation failed for {exe} (hwnd={hwnd}). Trying window title fallback...")
    
    # Method 2: Parse window title (always works, even in incognito)
    domain, pseudo_url = _extract_site_from_title(title)
    if domain:
        logger.info(f"Website tracked via window title fallback for {exe}: {domain} (title: '{title}')")
        return domain, pseudo_url
    
    logger.debug(f"Failed to extract domain from window title: '{title}'")
    return None, None
