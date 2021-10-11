// Importer fichiers à prendre en compte
import Animation from "./Animation";
import GoogleMap from "./GoogleMap";
import Restaurant from "./Restaurant";
import NewRestaurant from "./NewRestaurant";
import FormReview from "./FormReview";
import SvgStar from "./SvgStar";
import SvgMarker from "../img/marker.svg";

class SearchApp {
  constructor() {
    // Elements du DOM
    this.DOM = {
      // Map
      map: document.querySelector(".map"),
      // Restaurants list //
      list: document.querySelector(".list__restaurants-all"),
      // Filtre étoiles
      starsOnFilter: Array.from(
        document.querySelectorAll(".filter__stars-light")
      ),
      resetBtnFilter: document.querySelector(".filter__reset-svg"),
      // Restaurant //
      // Nom du restaurant
      restaurantTitleInput: document.querySelector(
        ".presentation__details-title"
      ),
      // Nombre d'étoile du restaurant
      restaurantStarsInput: document.querySelector(
        ".presentation__details-notation"
      ),
      // Icône de retour à la map
      backward: document.querySelector(".backward"),
      // Ajout restaurant //
      addRestaurantBtn: document.querySelector(".button__add"),
      inputNameNewRestaurant: document.querySelector(
        ".newRestaurant__elements-content"
      ),
    };
    ///////////
    // Datas //
    ///////////
    // Restaurant sélectionné dans liste
    this.currentRestaurant = null;
    // Restaurant sélectionné pour mettre commentaire
    this.activeRestaurant = null;
    // Valeur d'étoile sélectionnée dans filtre
    this.filterValue = null;
    // Array avec tous les restaurants
    this.restaurants = [];
    // Array pour les restaurants filtrés selon nombre d'étoiles
    this.filteredRestaurants = [];
    // Array pour tous les restaurants créés par user
    this.arrayNewRestaurants = [];
    // Array pour restaurants créés par user + datas Google
    this.allRestaurants = [];

    // Instanciation de toutes les classes
    this.animation = new Animation();
    this.map = new GoogleMap({
      mapContainer: document.querySelector(".map"),
      type: ["restaurant"],
    });
    this.restaurant = new Restaurant();
    this.newRestaurant = new NewRestaurant();
    this.formReview = new FormReview();

    // Initialisation des restaurants à afficher
    this.loadApp();

    // Event au click retour map
    this.DOM.backward.addEventListener("click", () => {
      this.removeHighlight();
      // Animation: display map et remove fiche restaurant
      this.animation.hideDetailsRestaurant();
    });

    // Event pour reset filtre des restaurants
    this.DOM.resetBtnFilter.addEventListener("click", () => {
      // Reset toutes les données affichées (restaurant + marker)
      this.resetList();
      this.animation.hideDetailsRestaurant();
      // Remettre étoiles dans filtre en opacité minimum
      this.removeStarsFilterHighlight();
      // Ajouter dans array restaurants filtrés selon valeur choisie
      // + ceux qui ont été ajoutés (si ajout)
      this.filteredRestaurants = this.restaurants.concat(
        this.arrayNewRestaurants
      );
      // Afficher restaurants et markers correspondants sur map
      this.displayVisiblesMarkers();
      this.map.displayMarkers(this.filteredRestaurants);
      // Remove le highlight du restaurant précédemment sélectionné
      this.removeHighlight();
    });

    // Event pour ajouter nouveau restaurant
    this.DOM.addRestaurantBtn.addEventListener("click", () => {
      // Déclencher animation affichage layout nouveau restaurant
      this.animation.showNewRestaurant();
      // Désactiver bouton valider si pas de nom
      this.newRestaurant.displayLayout();
      // Remove le highlight du restaurant précédemment sélectionné
      this.removeHighlight();
    });

    // Event btn validation pour récupérer nom restaurant écrit par user
    this.newRestaurant.validateButton.addEventListener("click", () => {
      this.newRestaurant.getName();
      this.newRestaurant.waitingLayout();
      this.newRestaurant.validateButton.opacity = ".5";
      this.listenToMapClick();
      // Remettre étoiles dans filtre en opacité minimum
      this.removeStarsFilterHighlight();
    });

    // Event btn annulation d'ajout d'un restaurant par user
    this.newRestaurant.cancelButton.addEventListener("click", () => {
      // Lancer animation
      this.animation.hideNewRestaurant();
      // Effacer input
      this.newRestaurant.removeLayout();
      // Remettre bouton ajouter commme avant
      this.newRestaurant.disableValidation();
      // Remettre étoiles dans filtre en opacité minimum
      this.removeStarsFilterHighlight();
    });

    // Event pour activer btn valider pour ajout commentaire
    this.formReview.reviewUser.addEventListener("input", () => {
      this.formReview.checkRegExInput();
    });

    // Event pour validation ajout du commentaire
    this.formReview.validBtn.addEventListener("click", () => {
      document.querySelector(
        ".items__infos-notation-" + this.activeRestaurant.id
      ).innerHTML = "";
      this.displayRestaurantsList(this.filteredRestaurants);
      // Afficher nouveau commentaire dans restaurant
      this.displayNewRating(this.activeRestaurant);
      // Calculer nouvelle moyenne du restaurant
      this.activeRestaurant.calcRating();
      // Mettre à jour / update les étoiles en grand
      this.displayNotationRestaurant(
        this.activeRestaurant.stars,
        this.activeRestaurant.id
      );
      // Update étoiles restaurant dans liste
      this.updateStarsRestaurant(this.activeRestaurant);
      // Reset le commentaire dans l'input du content
      this.formReview.resetCommentContent();
    });

    // Event si user clique sur btn annuler l'ajout de commentaire
    this.formReview.cancelBtn.addEventListener("click", () => {
      // Reset le commentaire dans l'input du content
      this.formReview.resetCommentContent();
      // Revenir à la map
      this.removeHighlight();
      // Animation: display map et remove fiche restaurant
      this.animation.hideDetailsRestaurant();
    });

    // Event si user se déplace dans la map
    // Initialisation des nouveaux restaurants à afficher
    document.addEventListener("mapMoving", () => {
      this.displayVisiblesMarkers();
    });
  }

  //////////////////
  //// METHODES ////
  //////////////////

  /////////////////////////////////////////////
  //// LOADING APP + CREATION RESTAURANTS ////
  ////////////////////////////////////////////

  // Méthode pour lancer l'application
  loadApp() {
    // Reset liste restaurants et restaurants filtrés
    this.restaurants = [];
    this.filteredRestaurants = [];
    // Récupérer datas de map quand elles sont dispo
    document.addEventListener("AvailableResults", (e) => {
      // Génerer les restaurants
      this.generateRestaurants(e.detail.results);
      // Afficher les restaurants
      this.displayRestaurantsList(this.filteredRestaurants);
    });
  }

  // Méthode pour instancier tous les restaurants
  generateRestaurants(e) {
    // Stocker datas dans constructor
    e.forEach((data) => {
      // Instancier un nouveau restaurant pour chaque data
      const newRestaurant = new Restaurant(
        data.name.toUpperCase(),
        data.geometry.location.lat(),
        data.geometry.location.lng(),
        new google.maps.Marker({
          position: {
            lat: data.geometry.location.lat(),
            lng: data.geometry.location.lng(),
          },
          icon: SvgMarker,
          map: this.map.googleMap,
        })
      );
      // Stocker le restaurant dans le tableau des restaurants
      this.restaurants.push(newRestaurant);
    });
    // Appeler la méthode d'écoute des étoiles pour filtrer
    this.listenStarsFilter(this.starsOnFilter);
    // Si aucune valeur n'a été choisie avant
    if (!this.filterValue) {
      // J'affiche tous les restaurants des datas récupérées
      this.filteredRestaurants = this.restaurants;
    } else {
      // Sinon je filtre restaurants qui sont = à valeur choisie par user
      this.filteredRestaurants = this.restaurants.filter(
        (restaurant) => restaurant.stars == this.filterValue
      );
    }
  }

  /////////////////////////////////////
  //// AFFICHAGE LISTE RESTAURANTS ////
  ////////////////////////////////////

  // Méthode pour ajouter éléments DOM pour chaque restaurant
  addRestaurantToList(item) {
    // Ajout d'un restaurant avec ligne (img + nom + note)
    const restaurant = document.createElement("div");
    restaurant.classList.add(
      "list__restaurants-items-" + item.id,
      "list__restaurants-items"
    );

    const img = document.createElement("img");
    img.classList.add("items__img-" + item.id, "items__img");
    // Mettre image random de restaurants
    img.src = item.imgSource;

    const infosRestaurant = document.createElement("div");
    infosRestaurant.classList.add("items__infos-" + item.id, "items__infos");

    const title = document.createElement("h3");
    title.classList.add("items__infos-title-" + item.id, "items__infos-title");

    const notation = document.createElement("div");
    notation.classList.add(
      "items__infos-notation-" + item.id,
      "items__infos-notation"
    );

    // Insérer éléments dans DOM
    restaurant.appendChild(img);
    restaurant.appendChild(infosRestaurant);
    infosRestaurant.appendChild(title);
    infosRestaurant.appendChild(notation);
    this.DOM.list.appendChild(restaurant);
    // Afficher datas
    title.innerHTML = item.name;
    // Afficher étoiles
    if (item.stars) {
      this.displayStars(item, notation);
      // Si pas d'étoiles, afficher '-'
    } else {
      this.displayDash(item, notation);
    }
    // Créer liste de tous les restaurants dans DOM
    this.allRestaurants.push(restaurant);
    // Permettre actions sur chaque restaurant au click
    this.activateRestaurant(restaurant, item);
  }

  // Méthode pour activer un restaurant (details + highlight)
  activateRestaurant(restaurant, item) {
    this.allRestaurants.forEach((element) => {
      restaurant.addEventListener("click", () => {
        // Highlighter le restaurant sélectionné par user dans la liste
        this.highlightRestaurant(element);
        // Lancer l'animation pour faire apparaitre fiche restaurant
        this.animation.showDetailsRestaurant();
        // Afficher détails infos du restaurant
        this.displayRestaurantDetails(item);
        // Le désigner comme currentRestaurant
        this.activeRestaurant = item;
        // A revoir si je ne le mets pas dans methode où j'appuie sur valider
        this.formReview.putReviewInActiveRestaurant(this.activeRestaurant);
      });
    });
  }

  // Méthode affichage étoiles restaurant
  displayStars(restaurant, notation) {
    const number = Math.floor(restaurant.stars);
    // Je boucle sur nombre d'étoiles pour les créer sur interface
    for (let i = 0; i < number; i++) {
      const starRestaurant = document.createElement("div");
      starRestaurant.classList.add(
        "star-restaurant-" + restaurant.id,
        "star-restaurant"
      );
      starRestaurant.innerHTML = SvgStar;
      // Je les fais entrer dans le DOM
      notation.appendChild(starRestaurant);
    }
  }

  // Méthode affichage '-' si pas d'étoiles
  displayDash(restaurant, notation) {
    // Créer div où se placeront futures étoiles
    const starRestaurant = document.createElement("div");
    starRestaurant.classList.add(
      "star-restaurant-" + restaurant.id,
      "star-restaurant"
    );
    // Afficher que ce n'est pas noté
    starRestaurant.innerHTML = "-";
    // Je les fais entrer dans le DOM
    notation.appendChild(starRestaurant);
  }

  // Méthode affichage restaurants
  displayRestaurantsList(array) {
    // Afficher les restaurants
    array.forEach((restaurant) => {
      this.addRestaurantToList(restaurant);
    });
  }

  // M2thode pour n'afficher que les restaurants dont markers visibles sur map
  displayVisiblesMarkers() {
    this.filteredRestaurants.forEach((restaurant) => {
      // Si marker est toujours dans la map
      if (
        this.map.googleMap.getBounds().contains(restaurant.marker.getPosition())
      ) {
        // Afficher les restaurants selon markers visibles
        // Si resto déjà supprimé : le remettre dans liste
        if (
          !document
            .querySelector(".list__restaurants-all")
            .contains(
              document.querySelector(
                ".list__restaurants-items-" + restaurant.id
              )
            )
        ) {
          this.addRestaurantToList(restaurant);
        }
      } else {
        // Reset la liste d'affichage restaurants
        this.removeRestaurantFromList(restaurant);
      }
    });
  }

  // Méthode pour changer style restaurant dans liste au click du user
  highlightRestaurant(restaurant) {
    // Si un restaurant a dejà été cliqué
    if (this.currentRestaurant) {
      // Remove highlight pour permettre au nouveau restaurant cliqué
      // d'être highlighté
      // Reset background rose et color blanc
      this.currentRestaurant.classList.remove("restaurant-highlight");
      // Remove blanc étoile au clic sur autre restaurant
      this.currentRestaurant
        .querySelectorAll(".star-restaurant")
        .forEach((restau) => {
          restau.classList.remove("star-highlight");
        });
      // Dash du nouveau resto: remettre en rose si click autre restaurant
      this.currentRestaurant
        .querySelector(".star-restaurant")
        .classList.remove("dash-light");
    }
    // Attribuer current au restaurant cliqué
    this.currentRestaurant = restaurant;
    // Ajout background rose et color blanc clic
    this.currentRestaurant.classList.add("restaurant-highlight");
    // Mettre en blanc étoile au clic
    this.currentRestaurant
      .querySelectorAll(".star-restaurant")
      .forEach((restau) => {
        restau.classList.add("star-highlight");
      });
    // Mettre en blacn le '-' si non noté
    this.currentRestaurant
      .querySelector(".star-restaurant")
      .classList.add("dash-light");
  }

  ///////////////////////////////////////////////
  /////////// FILTRE RESTAURANTS  ///////////////
  ///////////////////////////////////////////////

  // Méthode filtrage restos affichés selon choix étoiles user
  filterSelectedRestaurant() {
    if (this.filterValue) {
      // Reset toutes les données affichées (restaurant)
      this.resetList();
      this.resetMarkers();
      // Ajouter dans array les restaurants filtrés selon valeur choisie
      this.filteredRestaurants = this.restaurants.filter(
        (restaurant) => restaurant.stars == this.filterValue
      );
      // Afficher restaurant et markers correspondants
      this.displayRestaurantsList(this.filteredRestaurants);
      this.map.displayMarkers(this.filteredRestaurants);
    }
  }

  // Méthode pour écouter click user sur les étoiles
  listenStarsFilter() {
    for (let i = 0; i < this.DOM.starsOnFilter.length; i++) {
      this.DOM.starsOnFilter[i].addEventListener("click", () => {
        this.animation.hideDetailsRestaurant();
        this.removeHighlight();
        // Enregistrer le choix du nmbre d'étoiles choisi par user
        this.updateFilterValue(i);
        // Filtrer restaurants à afficher + markers
        this.filterSelectedRestaurant();
      });
    }
  }

  // Méthode pour enregistrer le choix du user sur étoiles
  updateFilterValue(i) {
    this.filterValue = i + 1;
    this.updateFilterCss();
  }

  // Méthode pour update le css
  updateFilterCss() {
    this.removeStarsFilterHighlight();
    // Boucler sur le nombre d'étoiles choisies
    for (let i = 0; i < this.filterValue; i++) {
      // Ajouter la class qui change le CSS
      this.DOM.starsOnFilter[i].classList.add("starFilter-highlight");
    }
  }

  // Méthode pour reset liste des restaurants du DOM
  resetList() {
    this.DOM.list.innerHTML = "";
  }

  //////////////////////////////////////
  //// AFFICHAGE DETAILS RESTAURANT ////
  //////////////////////////////////////

  // Méthode pour afficher détails de chaque restaurant
  displayRestaurantDetails(restaurant) {
    // Reset détails du previous restaurant (etoiles + comments)
    while (this.DOM.restaurantStarsInput.firstChild) {
      this.DOM.restaurantStarsInput.firstChild.remove();
    }
    while (document.querySelector(".users__review").firstChild) {
      document.querySelector(".users__review").firstChild.remove();
    }
    this.displayBackgroundImage(restaurant.imgSource);
    this.displayNameRestaurant(restaurant.name);
    this.displayNotationRestaurant(restaurant.stars, restaurant.id);
    this.displayRestaurantReviews(restaurant);
  }

  // Méthode pour afficher image du restaurant en background
  displayBackgroundImage(img) {
    document.querySelector(
      ".presentation"
    ).style.backgroundImage = `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%), url(${img})`;
  }

  // Méthode pour afficher nom du restaurant au click
  displayNameRestaurant(name) {
    document.querySelector(".presentation__details-title").innerHTML = name;
  }

  // Méthode pour afficher étoiles du restaurant au click
  displayNotationRestaurant(stars, id) {
    // Reset de l'ancienne note
    this.DOM.restaurantStarsInput.innerHTML = "";
    if (stars) {
      for (let i = 0; i < stars; i++) {
        const starNotation = document.createElement("div");
        starNotation.classList.add("star__notation-" + id, "star__notation");
        starNotation.innerHTML = SvgStar;
        // Je les fais entrer dans le DOM
        this.DOM.restaurantStarsInput.appendChild(starNotation);
      }
    } else {
      this.DOM.restaurantStarsInput.innerHTML = "<p>Non noté</p>";
    }
  }

  // Méthode pour afficher les commentaires de chaque restaurant
  displayRestaurantReviews(restaurant) {
    // Reset liste de reviews precédentes
    this.resetReviewsList();
    // Si le restaurant a été créé par user
    if (restaurant.id.includes("NC")) {
      // Créer paragraphe pour encourager user à commenter
      this.formReview.encouragementQuote.classList.add(
        "users__review-encouragement-" + restaurant.id,
        "users__review-encouragement"
      );
      this.formReview.encouragementQuote.innerHTML =
        "Soyez le premier à donner votre avis !";

      document
        .querySelector(".users__review")
        .appendChild(this.formReview.encouragementQuote);
    }
    // Pour chaque commentaire
    restaurant.comments.forEach((review) => {
      // Reset la phrase d'encouragement à commenter (s'il y en a une)
      if (
        document
          .querySelector(".users__review")
          .contains(this.formReview.encouragementQuote)
      ) {
        document
          .querySelector(".users__review")
          .removeChild(this.formReview.encouragementQuote);
      }
      this.createReview(restaurant, review);
    });
  }

  // Méthode pour créer un commentaire
  createReview(restaurant, review) {
    // Créer une div de contenu
    const content = document.createElement("div");
    content.classList.add(
      "users__review-content-" + restaurant.id,
      "users__review-content"
    );
    // Afficher le contenu dans DOM
    content.innerHTML = review.com;
    // Créer une div dans laquelle placer étoiles
    const notation = document.createElement("div");
    notation.classList.add(
      "users__review-notation-" + restaurant.id,
      "users__review-notation"
    );
    // Boucler sur nmbre étoiles de chq commentaire pour les ajouter au DOM
    for (let i = 0; i < review.stars; i++) {
      // Créer une div pour chaque étoile
      const star = document.createElement("div");
      star.classList.add(
        "users__review-star-" + restaurant.id,
        "users__review-star"
      );
      // Afficher contenu dans DOM
      star.innerHTML = SvgStar;
      // Les faire apparaitre dans DOM
      notation.appendChild(star);
      content.appendChild(notation);
      document.querySelector(".users__review").appendChild(content);
    }
  }

  // Méthode reset liste reviews (ne pas afficher plusieurs fois mêmes reviews)
  resetReviewsList() {
    document.querySelector(".users__review").innerHTML = "";
  }

  /////////////////////////////////////////////////
  //////////////  AJOUT RESTAURANTS  /////////////
  ///////////////////////////////////////////////

  // Méthode pour écouter au click sur la map pour ajouter marqueur
  listenToMapClick() {
    google.maps.event.addDomListener(
      this.map.googleMap,
      "click",
      (mapsMouseEvent) => {
        // Lancer l'animation
        this.animation.hideNewRestaurant();
        // Remettre bouton ajouter commme avant
        this.newRestaurant.disableValidation();
        // Reset liste restaurants pour l'afficher ensuite avec nouveau
        // restaurant inclus
        this.resetList();
        this.resetMarkers();
        // Créer nouveau restaurant
        this.generateNewRestaurant(
          mapsMouseEvent.latLng.lat(),
          mapsMouseEvent.latLng.lng(),
          new google.maps.Marker({
            position: {
              lat: mapsMouseEvent.latLng.lat(),
              lng: mapsMouseEvent.latLng.lng(),
            },
            icon: SvgMarker,
            map: this.map.googleMap,
          })
        );
      }
    );
  }

  // Méthode pour remove l'écouteur au click sur la map
  removeListenerMapClick() {
    google.maps.event.clearListeners(this.map.googleMap, "click");
  }

  // Méthode pour générer le restaurant créé par user dans liste
  generateNewRestaurant(lat, lng, marker) {
    // Instancier un nouveau restaurant avec datas correspondantes
    const newRestaurant = new Restaurant(
      this.upperCaseFirst(this.newRestaurant.restaurantName),
      lat,
      lng,
      marker
    );
    // Pour pouvoir les générer sans commentaire
    newRestaurant.comments = [];
    newRestaurant.stars = 0;
    // Les distinguer en ajoutant indice dans leur ID
    const NC = "NC";
    const noCommentsRestaurantID = NC + newRestaurant.id;
    newRestaurant.id = noCommentsRestaurantID;
    // Stocker nouveau restaurant dans tableau restaurants
    this.restaurants.push(newRestaurant);
    this.map.displayMarkers(this.restaurants);
    // Afficher à nouveau liste restaurants
    this.displayRestaurantsList(this.restaurants);
    // Remove l'écouteur sur map
    this.removeListenerMapClick();
  }

  // Méthode pour mettre première lettre en majuscule
  upperCaseFirst(name) {
    return name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
  }

  ///////////////////////////////////////////
  //// NOUVEAU COMMENTAIRE + UPDATE NOTE ////
  //////////////////////////////////////////

  // Méthode pour afficher nouveau commentaire à la liste
  displayNewRating(restaurant) {
    const comment = document.createElement("div");
    comment.classList.add(
      "users__review-content-" + restaurant.id,
      "users__review-content"
    );

    // Afficher le commentaire du user
    const newComment = this.upperCaseFirst(this.formReview.reviewUser.value);
    comment.innerHTML = newComment;
    // Je crée une div dans laquelle placer étoiles
    const notation = document.createElement("div");
    notation.classList.add(
      "users__review-notation-" + restaurant.id,
      "users__review-notation"
    );
    // Je boucle sur nombre d'étoiles pour les créer
    for (let i = 0; i < this.formReview.selectedStar; i++) {
      const star = document.createElement("div");
      star.classList.add(
        "users__review-star-" + restaurant.id,
        "users__review-star"
      );
      // Les faire apparaitre dans DOM (liste de tous les commentaires)
      star.innerHTML = SvgStar;
      notation.appendChild(star);
      comment.appendChild(notation);
      document.querySelector(".users__review").appendChild(comment);
    }
    // Créer l'objet de la review
    const reviewObject = {
      com: newComment,
      stars: this.formReview.selectedStar,
    };
    // Ajouter review Object dans liste de commentaire du restaurant
    restaurant.comments.push(reviewObject);
    // Afficher les commentaires + nouveau  commentaire
    this.displayRestaurantReviews(restaurant);
  }

  // Méthode pour update étoiles restaurant dans liste
  updateStarsRestaurant(restaurant) {
    const number = Math.floor(restaurant.stars);
    // Je boucle sur nombre d'étoiles pour les créer sur interface
    for (let i = 0; i < number; i++) {
      const starRestaurant = document.createElement("div");
      starRestaurant.classList.add(
        "star-restaurant-" + restaurant.id,
        "star-restaurant"
      );
      // Insérer étoiles dans DOM
      starRestaurant.innerHTML = SvgStar;
      // Ajouter class qui les rendent blanches
      starRestaurant.classList.add("star-highlight");
      // Je les fais entrer dans le DOM
      document
        .querySelector(".items__infos-notation-" + restaurant.id)
        .appendChild(starRestaurant);
    }
  }

  ///////////////////////////////////
  /////////// RESETS  ///////////////
  //////////////////////////////////

  // Méthode pour reset markers sur map
  resetMarkers() {
    this.restaurants.forEach((restaurant) => {
      this.map.removeMarkerFromMap(restaurant.marker);
    });
  }

  // Méthode pour reset liste restaurants
  removeRestaurantFromList(restaurant) {
    const restaurantToRemove = document.querySelector(
      ".list__restaurants-items-" + restaurant.id
    );
    if (restaurantToRemove) {
      document
        .querySelector(".list__restaurants-all")
        .removeChild(restaurantToRemove);
    }
  }

  // Méthode pour remove le highlight sur restaurant
  removeHighlight() {
    // Tableau de tous les restaurants ajoutés à liste
    const arrayRestaurants = Array.from(
      document.querySelectorAll(".list__restaurants-items")
    );
    // Remove le highlight du restaurant s'il contient cette classe HTML
    arrayRestaurants.forEach((restaurant) => {
      if (restaurant.classList.contains("restaurant-highlight")) {
        restaurant.classList.remove("restaurant-highlight");
        restaurant.querySelectorAll(".star-restaurant").forEach((restau) => {
          restau.classList.remove("star-highlight");
        });
      }
    });
  }

  // Méthode pour réinitialiser couleur étoiles dans filtre
  removeStarsFilterHighlight() {
    this.DOM.starsOnFilter.forEach((star) => {
      star.classList.remove("starFilter-highlight");
    });
  }
}

export default SearchApp;
