class GoogleMap {
  constructor({ mapContainer, type }) {
    // Elements du DOM
    this.mapContainer = mapContainer;
    // Datas Google
    this.googleMap = null;
    // Type de données recherchées
    this.type = type;
    // Binder le this pour méthodes qui ne le reconnaissent pas
    this.getGooglePlacesDatas = this.getGooglePlacesDatas.bind(this);

    // Initialiser la map à l'appel de la class CityMap (démarrage du site)
    this.initMap();
  }

  // Méthodes

  // Initialiser la map
  initMap() {
    //Permettre la géolocaliation du navigateur
    /*const x = navigator.geolocation;
    // Appeler la méthode pour succes ou echec
    x.getCurrentPosition(this.createMap, this.failure);*/
    const pos = {
      coords: {
        latitude: 48.8871668,
        longitude: 2.3357223,
      },
    };
    this.createMap(pos);
    // REMETTRE LA GEOLOC DU NAVIGATOR QUAND CONNEXION OK
  }

  // Méthode pour créer la map
  createMap(position) {
    // Définir des coordonnées
    const myLat = position.coords.latitude;
    const myLong = position.coords.longitude;
    const coordinates = new google.maps.LatLng(myLat, myLong);
    // Définir des options d'affichage
    const mapOptions = {
      center: coordinates,
      zoom: 16,
    };
    // Insérer map dans HTML
    this.googleMap = new google.maps.Map(this.mapContainer, mapOptions);
    // Mettre un marqueur de couleur différente pour position user
    new google.maps.Marker({
      position: coordinates,
      map: this.googleMap,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/pink-dot.png",
      },
    });
    // Créer requête avec caractéritiques pour recherche GooglePlaces
    const request = {
      location: coordinates,
      radius: "500",
      type: this.type,
    };
    // Relier Google Places à la map dans le DOM
    const service = new google.maps.places.PlacesService(this.googleMap);
    // Lancer la recherche des datas sur la map
    service.nearbySearch(request, this.getGooglePlacesDatas);
  }

  // Méthode stockage toutes datas trouvées par GooglePlaces dans zone user
  getGooglePlacesDatas(results, status) {
    // Vérification du chargement des données
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      document.dispatchEvent(
        new CustomEvent("AvailableResults", {
          detail: {
            results: results,
          },
        })
      );
      this.detectMapMove();
    } else {
      this.failure();
    }
  }

  // Méthode affichage markers sur map
  displayMarkers(restaurants) {
    // Afficher les markers filtrés
    restaurants.forEach((rest) => {
      rest.marker.setMap(this.googleMap);
    });
  }

  // Méthode suppression marker sur map
  removeMarkerFromMap(marker) {
    marker.setMap(null);
  }

  // Méthode de détection des mouvements sur map pour affichage restaurants
  detectMapMove() {
    this.googleMap.addListener("bounds_changed", () => {
      document.dispatchEvent(new Event("mapMoving"));
    });
  }

  // Méthode en cas d'échec de chargement de la map
  failure() {
    alert("Mauvaise connexion ! Rafraîchir la page");
  }
}

export default GoogleMap;
