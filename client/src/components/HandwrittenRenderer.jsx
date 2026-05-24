import { motion } from 'framer-motion';

function isQuote(paragraph) {
  return paragraph.trim().startsWith('>') || paragraph.trim().startsWith('"');
}

function HandwrittenRenderer({ content, language = 'mixed' }) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className={`handwritten-renderer notebook-paper language-${language}`} lang={language === 'english' ? 'en' : 'hi'}>
      {paragraphs.map((paragraph, index) => (
        <motion.p
          key={`${paragraph.slice(0, 16)}-${index}`}
          className={isQuote(paragraph) ? 'quote-line' : ''}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: index * 0.08 }}
        >
          {paragraph.replace(/^>\s?/, '')}
        </motion.p>
      ))}
    </div>
  );
}

export default HandwrittenRenderer;
