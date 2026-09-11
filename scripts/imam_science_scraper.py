#!/usr/bin/env python3
"""
Imam & Science (imamandscience.com) Scrapy Spider & Data Pipeline
Extracts articles with high fidelity:
- Clean raw titles
- Full-fidelity images (source URL, alt, dimensions, responsive aspect ratio)
- Highlights / Key blockquotes
- Rich structured content and semantic layout elements (nested headings, styled callouts, lists, markdown conversion)
"""

import json
import re
from urllib.parse import urljoin
import scrapy
from scrapy.crawler import CrawlerProcess

class ImamAndScienceSpider(scrapy.Spider):
    name = "imam_and_science"
    allowed_domains = ["imamandscience.com"]
    start_urls = [
        "https://imamandscience.com/all-topics/",
        "https://imamandscience.com/post-sitemap.xml",
    ]

    custom_settings = {
        "ROBOTSTXT_OBEY": False,
        "CONCURRENT_REQUESTS": 8,
        "DOWNLOAD_DELAY": 0.25,
        "COOKIES_ENABLED": False,
        "USER_AGENT": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "FEED_EXPORT_ENCODING": "utf-8",
    }

    def parse(self, response):
        """Parse all-topics page and sitemap to discover all individual article URLs."""
        article_urls = set()

        # If sitemap XML
        if "xml" in response.headers.get("Content-Type", b"").decode("utf-8") or response.url.endswith(".xml"):
            locs = response.xpath("//*[local-name()='loc']/text()").getall()
            for loc in locs:
                if not loc.endswith("/all-topics/") and not loc.endswith("/blog/"):
                    article_urls.add(loc)
        else:
            # HTML page links from all-topics grid
            links = response.css(".p-art a.ttl-link::attr(href), .p-art a.link-ovrl::attr(href), .grid-item a::attr(href)").getall()
            for href in links:
                full_url = response.urljoin(href)
                if "imamandscience.com" in full_url and "/category/" not in full_url and "/author/" not in full_url and not full_url.endswith("/all-topics/"):
                    article_urls.add(full_url)

        for url in article_urls:
            yield scrapy.Request(url, callback=self.parse_article)

    def parse_article(self, response):
        """Extract high-fidelity data objects from a single article page."""
        # 1. Clean Title without tag artifacts or HTML entities
        raw_title = response.css("h1.entry-title::text, h1.post-title::text, h1::text").get()
        if not raw_title:
            raw_title = response.xpath("//title/text()").get() or ""
        title = re.sub(r"\s+", " ", raw_title).strip()
        title = re.sub(r" - Imam and Science.*$", "", title).strip()

        # 2. Categories & Topics
        categories = response.css(".cat-links a::text, .post-cat a::text, a[rel='category tag']::text, .p-cat::text").getall()
        categories = [re.sub(r"\s+", " ", c).strip() for c in categories if c.strip() and c.strip().lower() != "uncategorized"]
        if not categories:
            categories = ["Ahlebait Teachings"]

        # 3. Featured & In-Content Images (Source URL, Alt, Aspect Ratio mapping)
        images = []
        raw_imgs = response.css("article img, .entry-content img, .post-thumb img, .entry-thumb img")
        for img in raw_imgs:
            src = img.attrib.get("data-src") or img.attrib.get("src") or ""
            if not src or "gravatar.com" in src:
                continue
            src = response.urljoin(src)
            alt = img.attrib.get("alt") or title
            width = img.attrib.get("width")
            height = img.attrib.get("height")
            aspect_ratio = f"{width}/{height}" if (width and height) else "16/9"
            
            images.append({
                "src": src,
                "alt": alt.strip(),
                "width": width,
                "height": height,
                "aspectRatio": aspect_ratio
            })

        featured_image = images[0]["src"] if images else "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80"
        featured_alt = images[0]["alt"] if images else title

        # 4. Highlights / Key Blockquotes / Emphasized Summary
        blockquotes = response.css("blockquote p::text, blockquote::text").getall()
        highlights = [re.sub(r"\s+", " ", b).strip() for b in blockquotes if len(b.strip()) > 15]

        # 5. Excerpt / Summary
        meta_desc = response.xpath("//meta[@name='description']/@content").get()
        first_para = response.css(".entry-content p::text").get() or ""
        excerpt = meta_desc or (highlights[0] if highlights else first_para)
        excerpt = re.sub(r"\s+", " ", excerpt).strip()
        if len(excerpt) > 280:
            excerpt = excerpt[:277] + "..."

        # 6. Nested Headings (H2, H3 Table of Contents)
        headings = []
        for h in response.css(".entry-content h2, .entry-content h3"):
            tag_name = h.root.tag.lower()
            h_text = "".join(h.css("*::text").getall()).strip()
            if h_text:
                headings.append({
                    "level": tag_name,
                    "text": re.sub(r"\s+", " ", h_text)
                })

        # 7. Semantic Rich Content & Layout Extraction
        content_nodes = response.css(".entry-content > *, article > .post-content > *")
        markdown_blocks = []

        for node in content_nodes:
            tag = node.root.tag.lower()
            text = "".join(node.css("*::text").getall()).strip()
            if not text and not node.css("img"):
                continue

            if tag in ["h1", "h2"]:
                markdown_blocks.append(f"\n\n## {text}\n\n")
            elif tag == "h3":
                markdown_blocks.append(f"\n\n### {text}\n\n")
            elif tag in ["h4", "h5", "h6"]:
                markdown_blocks.append(f"\n\n#### {text}\n\n")
            elif tag == "blockquote":
                markdown_blocks.append(f"\n\n> {text}\n\n")
            elif tag == "ul":
                items = node.css("li")
                list_md = "\n".join([f"* {''.join(li.css('*::text').getall()).strip()}" for li in items])
                markdown_blocks.append(f"\n{list_md}\n\n")
            elif tag == "ol":
                items = node.css("li")
                list_md = "\n".join([f"{idx+1}. {''.join(li.css('*::text').getall()).strip()}" for idx, li in enumerate(items)])
                markdown_blocks.append(f"\n{list_md}\n\n")
            elif tag == "p":
                # Check for inline media
                node_img = node.css("img")
                if node_img:
                    isrc = node_img.attrib.get("data-src") or node_img.attrib.get("src") or ""
                    if isrc and "gravatar" not in isrc:
                        ialt = node_img.attrib.get("alt") or "Illustration"
                        markdown_blocks.append(f"\n\n![{ialt}]({response.urljoin(isrc)})\n\n")
                if text:
                    markdown_blocks.append(f"\n\n{text}\n\n")
            else:
                classes = node.attrib.get("class", "").lower()
                if any(c in classes for c in ["callout", "box", "note", "alert"]):
                    markdown_blocks.append(f"\n\n> **Key Insight:** {text}\n\n")
                elif text:
                    markdown_blocks.append(f"\n\n{text}\n\n")

        full_content = "".join(markdown_blocks).strip()
        slug = response.url.rstrip("/").split("/")[-1]
        words = len(re.findall(r"\w+", full_content))
        reading_time = f"{max(1, round(words / 200))} min read"

        yield {
            "id": slug,
            "slug": slug,
            "url": response.url,
            "title": title,
            "excerpt": excerpt,
            "content": full_content,
            "categories": categories,
            "primaryCategory": categories[0] if categories else "General",
            "featuredImage": featured_image,
            "featuredImageAlt": featured_alt,
            "images": images,
            "highlights": highlights,
            "headings": headings,
            "wordCount": words,
            "readingTime": reading_time,
            "source": "Imam & Science (imamandscience.com)",
            "scrapedAt": response.headers.get("Date", b"").decode("utf-8", "ignore")
        }


def run():
    process = CrawlerProcess(settings={
        "FEEDS": {
            "imam_science_articles.json": {"format": "json", "encoding": "utf8", "indent": 2},
        },
        "LOG_LEVEL": "INFO",
    })
    process.crawl(ImamAndScienceSpider)
    process.start()

if __name__ == "__main__":
    run()
