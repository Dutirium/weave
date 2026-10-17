import httpx
import trafilatura 
from urllib.parse import urlparse

def validate_url(url:str):
    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only HTTP and HTTPS URLs are alowed ")

    if not parsed.netloc:
        raise ValueError("Invalid URL")

    hostname = parsed.hostname

    if not hostname:
        raise ValueError("Invalid hostname")

    blocked_hosts = {
        "localhost",
        "127.0.0.1",
        "::1"
    }

    if hostname.lower() in blocked_hosts:
        raise ValueError("This hostname is not allowed")

def crawl_url(url: str):

    validate_url(url)

    headers = {
        "User-Agent":(
            "Mozilla/5.0 (X11; Linux x86_64)"
            "AppleWebkit/537.36"
            "(KHTML, like Gecko)"
            "Chrome/140.0 Safari/537.36"
        )
    }
    try:
        response = httpx.get(
            url,
            headers=headers,
            timeout=15,
            follow_redirects=True,
        )

        response.raise_for_status()

        html =response.text

        text = trafilatura.extract(
            html,
            include_comments=False,
            include_tables=True,
        )

        if not text:
            raise ValueError("Could not extract remote content")

        return {
            "url": str(response.url),
            "text": text,
            "word_count": len(text.split()),
        }

    except httpx.HTTPError as e:
        raise RuntimeError(f"Failed to fetch URL:{e}")
    
    except Exception as e:
        raise RuntimeError(f"Failed to process page: {e}")
    
if __name__ == "__main__":
    result = crawl_url("https://en.wikipedia.org/wiki/Artificial_intelligence")

    print("URL:", result["url"])
    print("Word count:", result["word_count"])
    print()
    print(result["text"][:2000])