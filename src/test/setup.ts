import '@testing-library/jest-dom/vitest';

// O jsdom não implementa a rolagem da janela.
window.scrollTo = () => {};
