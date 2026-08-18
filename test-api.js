fetch('https://quranandscience.com/wp-json/wp/v2/posts?per_page=1')
  .then(res => res.json())
  .then(data => console.log("Success! Array length:", data.length))
  .catch(console.error);
