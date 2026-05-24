export const pageVariants = {
  initial: {
    opacity: 0,
    y: 18
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.28,
      ease: 'easeIn'
    }
  }
};
