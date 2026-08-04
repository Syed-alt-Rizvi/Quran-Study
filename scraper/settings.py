ROBOTSTXT_OBEY = False
FEED_EXPORT_ENCODING = 'utf-8' # Forces correct Urdu character compilation
CONCURRENT_REQUESTS = 16
DOWNLOAD_DELAY = 0.25
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1.0
AUTOTHROTTLE_MAX_DELAY = 10.0
RETRY_TIMES = 5
RETRY_HTTP_CODES = [500, 502, 503, 504, 522, 524, 408, 429]

ITEM_PIPELINES = {
   'scraper.pipelines.BillionDollarIntegrityPipeline': 300,
   'scraper.pipelines.DatabaseUpsertPipeline': 400,
}
