import { comments } from "./Comments";

class Restaurant {
  constructor(name, lat, long, marker) {
    // Datas
    this.name = name;
    this.lat = lat;
    this.long = long;
    this.stars = 0;
    this.comments = [];
    this.newComments = [];
    // Position du marker associé sur map
    this.marker = marker;
    // Image unique pour chaque restaurant
    this.imgSource = null;
    // ID unique pour chaque restaurant
    this.id = null;

    // Créer un id
    this.getUniqueId();

    // Attribuer une image
    this.getDynamicSource();

    // Créer et stocker des commentaires pour chaque restaurant
    this.generateUsersReview();

    // Calculer la moyenne d'étoiles de chaque restaurant
    this.calcRating();
  }

  // Méthodes //

  // Méthode pour générer une unique ID
  getUniqueId() {
    this.id = Math.random().toString(16).slice(2);
  }

  // Méthode pour générer une image unique
  getDynamicSource() {
    const random = Math.floor(Math.random() * 50);
    this.imgSource = `../img/restaurants/${random}.jpg`;
  }

  // Méthode pour générer commentaires étoilés aléatoirement selon restaurant
  generateUsersReview() {
    // Générer un nombre de commentaire
    const numComments = Math.ceil(Math.random() * 5);
    // Je boucle sur nombre de commentaire pour les créer
    for (let i = 0; i < numComments; i++) {
      // Sélectionner un commentaire
      const randomComment = comments[Math.ceil(Math.random() * 45)];
      // Générer un nombre d'étoiles pour chq commentaire
      const randomStar = Math.ceil(Math.random() * 5);
      // Créer objet à partir de ces données
      const review = {
        com: randomComment,
        stars: randomStar,
      };
      // Mettre l'objet dans le tableau des comments
      this.comments.push(review);
    }
  }

  // Créer un nouveau commentaire
  createNewComment(comment, stars) {
    // Créer objet à partir de ces données
    const newReview = {
      com: comment,
      stars: stars,
    };
    this.comments.push(newReview);
    this.calcRating();
  }

  // Méthode calcul moyenne note
  calcRating() {
    // Boucler sur tableau des ratings
    const sum = this.comments
      .map((item) => item.stars)
      .reduce((prev, curr) => prev + curr, 0);
    this.stars = (sum / this.comments.length).toFixed();
  }
}

export default Restaurant;
