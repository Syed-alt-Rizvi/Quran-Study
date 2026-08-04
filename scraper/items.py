import scrapy

class TafseerItem(scrapy.Item):
    surah_number = scrapy.Field()      # Must be Integer (1 to 114)
    ayah_number = scrapy.Field()       # Must be Integer
    english_translation = scrapy.Field() # Clean String
    urdu_translation = scrapy.Field()    # Clean UTF-8 String (RTL Nastaliq)
    english_tafseer = scrapy.Field()    # Clean Markdown or JSON string
    urdu_tafseer = scrapy.Field()       # Clean Markdown or JSON string UTF-8
    source_url = scrapy.Field()         # String
