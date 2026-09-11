# Octoparse Automated Extraction Instructions: imamandscience.com

Follow these automated steps to configure Octoparse for systematic crawling of `https://imamandscience.com/all-topics/`:

---

### Phase 1: Task Initialization & URL List
1. Open **Octoparse** and select **"New Task" > "Advanced Mode"**.
2. **Start URL**:
   - `https://imamandscience.com/all-topics/`
3. Check the page settings:
   - User Agent: Chrome / Desktop modern
   - Timeout: 25 seconds
   - Cookie handling: Default

---

### Phase 2: Loop Through Topic Cards (List & Detail Extraction)
1. **Locate Article Cards**:
   - Selector: `div.p-art, div.grid-item.post`
   - Select one card and choose **"Select all sub-elements"**.
2. **Click Each Article Card Link**:
   - Target Link: `a.ttl-link, a.link-ovrl`
   - Action: **"Loop click each element"**
   - Configure to open each article in the active browser tab.

---

### Phase 3: Field Extraction Mapping
Inside the **"Extract Data"** step for each article page, configure the following fields:

| Field Name | Extraction Type | Selector / XPath | Post-processing / Clean-up |
| :--- | :--- | :--- | :--- |
| **Title** | Text | `//h1[contains(@class, 'entry-title')] \| //h1` | Trim leading/trailing whitespace, remove surrounding tags |
| **FeaturedImage** | Image URL (`src` / `data-src`) | `//div[contains(@class, 'post-thumb')]//img \| //article//img[1]` | Match non-gravatar image URL, preserve original resolution |
| **ImageAlt** | Attribute (`alt`) | `//div[contains(@class, 'post-thumb')]//img/@alt \| //article//img[1]/@alt` | Fallback to Title if empty |
| **Category** | Text | `//a[@rel='category tag'] \| //span[contains(@class, 'p-cat')]` | Comma-separated list |
| **Highlights** | Text (Blockquotes) | `//blockquote` | Extract emphasized summaries or quotes |
| **Excerpt** | Text | `//meta[@name='description']/@content \| //div[contains(@class, 'entry-content')]/p[1]` | Trim to 250 characters |
| **ContentHtml** | Inner HTML | `//div[contains(@class, 'entry-content')]` | Retain semantic tags (`<h2>`, `<h3>`, `<blockquote>`, `<p>`, `<ul>`) |
| **ContentText** | Text | `//div[contains(@class, 'entry-content')]` | Clean text stream for search index |
| **HeadingsList** | Text List | `//div[contains(@class, 'entry-content')]//h2 \| //div[contains(@class, 'entry-content')]//h3` | Outline table of contents |
| **SourceURL** | Current Page URL | System variable: `Page URL` | Full canonical link |

---

### Phase 4: Pagination / Dynamic Loading Handling
1. If "Load More" or pagination button appears:
   - Click Action: `//a[contains(@class, 'next') or contains(@class, 'load-more')]`
   - Execution: Repeat loop until no more items appear.
2. Anti-blocking settings:
   - Set request delay between 1.0 to 2.5 seconds.
   - Disable images rendering in Octoparse preview for maximum extraction speed.

---

### Phase 5: Export Settings
1. Export format: **JSON** or **CSV**.
2. Save destination: `public/imam_science_data.json`.
