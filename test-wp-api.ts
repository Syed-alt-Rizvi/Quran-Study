async function test() {
  const res = await fetch('https://quranandscience.com/wp-json/wp/v2/posts?per_page=1');
  const posts = await res.json();
  console.log(posts[0].content.rendered.length);
}
test();
