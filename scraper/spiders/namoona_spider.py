import scrapy
import json
from ..items import TafseerItem

class NamoonaSpider(scrapy.Spider):
    name = "namoona"
    
    # Placeholder Base URL
    base_url = "https://example-tafseer.com/surah/{surah}/ayah/{ayah}"
    
    def start_requests(self):
        firecrawl_api_key = self.settings.get('FIRECRAWL_API_KEY', 'default-key')
        firecrawl_endpoint = "https://api.firecrawl.dev/v1/scrape"
        
        # Structural loop for Surahs 1-114
        for surah in range(1, 115):
            # Assuming max 286 ayahs logic, adapt upper bound per actual surah metadata
            for ayah in range(1, 287):
                target_url = self.base_url.format(surah=surah, ayah=ayah)
                
                payload = {
                    "url": target_url,
                    "formats": ["markdown"]
                }
                
                yield scrapy.Request(
                    url=firecrawl_endpoint,
                    method='POST',
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {firecrawl_api_key}'
                    },
                    body=json.dumps(payload),
                    callback=self.parse,
                    errback=self.errback_http,
                    meta={'surah_number': surah, 'ayah_number': ayah, 'source_url': target_url}
                )
                
    def parse(self, response):
        surah = response.meta['surah_number']
        ayah = response.meta['ayah_number']
        source_url = response.meta['source_url']
        
        try:
            data = json.loads(response.body)
            markdown_content = data.get('data', {}).get('markdown', '')
        except json.JSONDecodeError:
            markdown_content = ""
        
        item = TafseerItem()
        item['surah_number'] = surah
        item['ayah_number'] = ayah
        item['english_translation'] = "Parsed English Translation here"
        item['urdu_translation'] = "Parsed Urdu Translation here"
        item['english_tafseer'] = markdown_content
        item['urdu_tafseer'] = markdown_content
        item['source_url'] = source_url
        
        yield item

    def errback_http(self, failure):
        request = failure.request
        surah = request.meta.get('surah_number')
        ayah = request.meta.get('ayah_number')
        
        self.logger.critical(
            f"Failed to fetch Surah {surah}, Ayah {ayah} via Firecrawl. "
            f"Error: {repr(failure)}"
        )
        
        # Automatically re-queue the task; Exponential backoff relies on AUTOTHROTTLE & RETRY settings
        yield request.copy()
