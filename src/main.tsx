import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import {
  customLinksRepository,
  favoritesRepository,
  getCatalog,
  guideNotesRepository,
  layoutRepository,
  screenNameRepository,
} from './config/container';
import { App } from './presentation/App';
import './presentation/styles/tokens.css';
import './presentation/styles/base.css';
import './presentation/styles/header.css';
import './presentation/styles/buttons.css';
import './presentation/styles/catalog.css';
import './presentation/styles/carousel.css';
import './presentation/styles/card.css';
import './presentation/styles/assistant.css';
import './presentation/styles/hero.css';
import './presentation/styles/dialog.css';
import './presentation/styles/guide.css';
import './presentation/styles/filters.css';
import './presentation/styles/states.css';
import './presentation/styles/responsive.css';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      getCatalog={getCatalog}
      favoritesRepository={favoritesRepository}
      customLinksRepository={customLinksRepository}
      screenNameRepository={screenNameRepository}
      layoutRepository={layoutRepository}
      guideNotesRepository={guideNotesRepository}
    />
  </StrictMode>,
);
