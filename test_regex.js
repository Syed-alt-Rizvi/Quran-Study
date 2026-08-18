const text = `(“And thy Lord taught the Bee to build its cells in hills, on trees, and in (men’s) habitations; * Then to eat of all the produce (of the earth), and find with skill the spacious paths of its Lord: there issues from within their bodies a drink of varying colours, wherein is healing for men: verily in this is a Sign for those who give thought”) (16: 68, 69).`;
const regex = /(\(*[“"”][\s\S]*?[“"”]\)*\s*\(\s*(?:Quran|Surah)?\s*(\d+)\s*[:.]\s*(\d+(?:\s*,\s*\d+|\s*-\s*\d+)?)\s*\))/gi;
console.log(regex.exec(text));
