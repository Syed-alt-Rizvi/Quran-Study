const fs = require('fs');
let code = fs.readFileSync('src/components/DiscussionModal.tsx', 'utf8');

code = code.replace("const [content, setContent] = useState('');", 
`const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);`);

fs.writeFileSync('src/components/DiscussionModal.tsx', code);
