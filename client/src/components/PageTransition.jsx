import { motion } from 'framer-motion';
import { pageVariants } from '../animations/pageVariants';

function PageTransition({ children, className = '' }) {
  return (
    <motion.main
      className={`page-shell ${className}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.main>
  );
}

export default PageTransition;
