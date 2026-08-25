const fs = require('fs');

function fix(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Replace handleSubmit
  content = content.replace(/const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?setSubmitting\(false\);\s+\}\s+\};/,
`  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setRetryError(null);
    const idempotencyKey = uuidv4();
    const tempId = uuidv4();
    
    // Optimistic UI
    const newComment = {
      id: tempId,
      content: content.trim(),
      author: author.trim() || 'Anonymous',
      email: email.trim(),
      createdAt: new Date().toISOString(),
      replyToId: replyTo,
      surahNumber: citationSurah ? parseInt(citationSurah) : null,
      ayahNumber: citationAyah ? parseInt(citationAyah) : null
    };
    
    setDiscussions(prev => [newComment, ...prev]);
    setPendingDraft(newComment);

    const payload = {
      id: tempId,
      idempotencyKey,
      content: content.trim(),
      author: author.trim() || 'Anonymous',
      email: email.trim(),
      replyToId: replyTo,
      surahNumber: citationSurah ? parseInt(citationSurah) : undefined,
      ayahNumber: citationAyah ? parseInt(citationAyah) : undefined
    };

    const attemptRequest = async (retries = 3, delay = 1000): Promise<boolean> => {
      try {
        const res = await fetch('/api/discussions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) return true;
        throw new Error(\`Status \${res.status}\`);
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptRequest(retries - 1, delay * 2);
        }
        return false;
      }
    };

    const success = await attemptRequest();
    
    if (success) {
      setContent("");
      setReplyTo(null);
      setCitationSurah("");
      setCitationAyah("");
      setPendingDraft(null);
    } else {
      setRetryError("Failed to send message. Please try again.");
      setDiscussions(prev => prev.filter(d => d.id !== tempId));
    }
    setSubmitting(false);
  };`
  );

  content = content.replace(/const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?setSubmitting\(false\);\s+\}\s+\};/g, "/* SHOULD BE REPLACED */");

  // In DiscussionModal, citationSurah doesn't exist, it uses surah.number
  if (path.includes('DiscussionModal')) {
    content = content.replace("surahNumber: citationSurah ? parseInt(citationSurah) : null,", "surahNumber: surah.number,");
    content = content.replace("ayahNumber: citationAyah ? parseInt(citationAyah) : null", "ayahNumber: ayah.numberInSurah");
    content = content.replace("surahNumber: citationSurah ? parseInt(citationSurah) : undefined,", "surahNumber: surah.number,");
    content = content.replace("ayahNumber: citationAyah ? parseInt(citationAyah) : undefined", "ayahNumber: ayah.numberInSurah, surahName: surah.englishName");
    content = content.replace("setCitationSurah(\"\");", "");
    content = content.replace("setCitationAyah(\"\");", "");
  }

  // Update retryError UI
  content = content.replace(/onClick=\{submitDiscussion\}/g, "onClick={handleSubmit}");
  fs.writeFileSync(path, content);
}

fix('src/components/GlobalDiscussions.tsx');
fix('src/components/DiscussionModal.tsx');
