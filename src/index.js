// Importer fichiers à prendre en compte
import './sass/main.scss';

import App from './js/App';

// Attendre que le DOM soit chargé pour afficher site
window.addEventListener('load', () => {
  // Instaurer un delai d'affichage
  //setTimeout(() => {
  // Instancier la class qui permet de lancer l'app
  new App();
  // Afficher le site après le delai
  //document.querySelector('.loader').style.display = 'none';
  //}, 1500);
});
