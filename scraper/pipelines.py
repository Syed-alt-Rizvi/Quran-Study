import json
import logging
from scrapy.exceptions import DropItem
import psycopg2

class BillionDollarIntegrityPipeline:
    def process_item(self, item, spider):
        surah_number = item.get('surah_number')
        ayah_number = item.get('ayah_number')
        
        # Mathematical Boundaries
        if not isinstance(surah_number, int) or not (1 <= surah_number <= 114):
            self.log_error(item, f"Invalid surah_number boundary: {surah_number}")
            raise DropItem(f"Invalid surah_number: {surah_number}")
            
        if not isinstance(ayah_number, int) or ayah_number < 1:
            self.log_error(item, f"Invalid ayah_number boundary: {ayah_number}")
            raise DropItem(f"Invalid ayah_number: {ayah_number}")

        # UTF-8 Isolation
        for field in ['urdu_translation', 'urdu_tafseer']:
            val = item.get(field)
            if val:
                # Force explicit UTF-8 string encoding compliance
                item[field] = val.encode('utf-8', 'ignore').decode('utf-8')

        # Content Length Floor
        for field in ['english_tafseer', 'urdu_tafseer']:
            val = item.get(field)
            if not val or not str(val).strip() or len(str(val).strip()) < 15:
                self.log_error(item, f"Content length floor violated for {field}")
                raise DropItem(f"Content length too short for {field}")
                
        return item
        
    def log_error(self, item, reason):
        error_payload = {
            "surah_number": item.get('surah_number'),
            "ayah_number": item.get('ayah_number'),
            "source_url": item.get('source_url'),
            "error_reason": reason
        }
        # Intercept and explicitly generate a high-priority JSON alert payload
        logging.critical(f"INTEGRITY ALERT - Scraping_Error_Log: {json.dumps(error_payload)}")


class DatabaseUpsertPipeline:
    def open_spider(self, spider):
        # Database connection details should be injected securely via environment or settings
        db_config = spider.settings.get('DB_CONFIG', {})
        self.connection = psycopg2.connect(
            host=db_config.get("host", "localhost"),
            database=db_config.get("database", "quran_app"),
            user=db_config.get("user", "postgres"),
            password=db_config.get("password", "")
        )
        self.cursor = self.connection.cursor()
        
    def close_spider(self, spider):
        self.connection.commit()
        self.cursor.close()
        self.connection.close()

    def process_item(self, item, spider):
        # Bulk UPSERT execution statement using ON CONFLICT DO UPDATE
        query = """
            INSERT INTO quran_tafseer (
                surah_number, 
                ayah_number, 
                english_translation, 
                urdu_translation, 
                english_tafseer, 
                urdu_tafseer, 
                source_url
            ) VALUES (
                %(surah_number)s, 
                %(ayah_number)s, 
                %(english_translation)s, 
                %(urdu_translation)s, 
                %(english_tafseer)s, 
                %(urdu_tafseer)s, 
                %(source_url)s
            )
            ON CONFLICT (surah_number, ayah_number) 
            DO UPDATE SET 
                english_translation = EXCLUDED.english_translation,
                urdu_translation = EXCLUDED.urdu_translation,
                english_tafseer = EXCLUDED.english_tafseer,
                urdu_tafseer = EXCLUDED.urdu_tafseer,
                source_url = EXCLUDED.source_url;
        """
        
        try:
            self.cursor.execute(query, dict(item))
            self.connection.commit()
        except Exception as e:
            self.connection.rollback()
            spider.logger.error(f"Database insertion error for Surah {item.get('surah_number')}:{item.get('ayah_number')} - {e}")
            
        return item
