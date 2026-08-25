const fs = require('fs');

const fixFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  
  // Remove the old addDoc logic that remained due to bad regex replacement
  const startIdx = content.indexOf('const submitDiscussion');
  const endIdx = content.indexOf('  };', startIdx) + 4;
  
  // Find the exact function bounds using curly braces counting
  if (startIdx !== -1) {
    let brackets = 0;
    let end = -1;
    let started = false;
    for(let i = startIdx; i < content.length; i++) {
      if (content[i] === '{') {
        brackets++;
        started = true;
      }
      if (content[i] === '}') {
        brackets--;
      }
      if (started && brackets === 0) {
        end = i + 1;
        break;
      }
    }
    if (end !== -1) {
       // the function is completely found.
       content = content.substring(0, startIdx) + "\n/* SUBMIT_REPLACED */\n" + content.substring(end);
    }
  }

  // Remove the old query logic
  const qStart = content.indexOf('const q = query');
  if (qStart !== -1) {
    let endQ = content.indexOf('return () => unsubscribe();', qStart);
    if (endQ !== -1) {
      endQ = content.indexOf('}', endQ) + 1;
      let veryEnd = content.indexOf(');', endQ) + 2;
      content = content.substring(0, qStart) + "/* QUERY_REPLACED */" + content.substring(veryEnd);
    }
  }
  
  fs.writeFileSync(path, content);
}

fixFile('src/components/GlobalDiscussions.tsx');
fixFile('src/components/DiscussionModal.tsx');
