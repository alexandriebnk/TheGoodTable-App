// Importer fichiers à prendre en compte
import "./sass/main.scss";

import App from "./js/App";

import Bowser from "bowser";

// Créer variable pour savoir la navigateur utilisée
const {
  browser: { name },
} = Bowser.parse(window.navigator.userAgent);

const setSafariStyle = () => {
  if (name === "Safari") {
    document.querySelector(".header__presentation-title").style.lineHeight =
      "15rem";
    document.querySelector(".header__presentation-title").style.fontSize =
      "19rem";
  }
};

// Attendre que le DOM soit chargé pour afficher site
window.addEventListener("load", () => {
  // Instancier la class qui permet de lancer l'app
  new App();
  setSafariStyle();
});
