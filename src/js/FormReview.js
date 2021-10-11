class FormReview {
  constructor() {
    // Element du DOM
    this.reviewUser = document.querySelector(
      '.personal__content-paragraph',
    );
    this.starToSelect = document.querySelector(
      '.personal__notation',
    ).children;
    this.validBtn = document.querySelector('.review__validation');
    this.cancelBtn = document.querySelector('.review__annulation');
    this.encouragementQuote = document.createElement('p');
    // Datas
    this.selectedStar = 0;
    this.activeRestaurant = null;
  }

  // Méthodes //

  // Méthode pour associer commentaire au restaurant actif
  putReviewInActiveRestaurant(activeRestaurant) {
    this.activeRestaurant = activeRestaurant;
  }

  // Méthode regEx vérification commentaire restaurant par user
  checkRegExInput() {
    const regEx = /[^\s]+[A-Za-zàäâéèëêïîôùüÿçœ\'-' ']+$/;
    // Vérification de la bonne valeur rentrée par user
    if (
      this.reviewUser.value.length >= 3 &&
      regEx.test(this.reviewUser.value)
    ) {
      this.activateStarToSelect();
    } else if (
      this.reviewUser.value.length <= 2 ||
      !regEx.test(this.reviewUser.value)
    ) {
      this.desactivateStarToSelect();
      this.desactivateValidBtn();
    }
  }

  // Méthode pour activer la selection d'étoile pour commentaire user
  activateStarToSelect() {
    for (let star of this.starToSelect) {
      star.style.cursor = 'pointer';
      star.style.opacity = '.6';
      star.style.pointerEvents = 'auto';
    }
    // Activer les étoiles pour selection
    this.checkSelectedStar();
  }

  // Méthode pour désactiver la selection d'étoile pour commentaire user
  desactivateStarToSelect() {
    for (let star of this.starToSelect) {
      star.style.opacity = '.3';
      star.style.pointerEvents = 'none';
    }
  }

  // Méthode pour vérifier si étoile choisie
  checkSelectedStar() {
    for (let i = 0; i < this.starToSelect.length; i++) {
      this.starToSelect[i].addEventListener('click', () => {
        this.starToSelect[i].style.opacity = '1';
        // Récupérer valeur de l'étoile choisie
        this.selectedStar = i + 1;
        // Mettre en avant le nombre d'étoiles
        this.updateLightingStars();
        // Activer bouton valider
        this.activateValidBtn();
      });
    }
  }

  // Méthode pour mettre en valeur nombre d'étoiles choisi
  updateLightingStars() {
    for (let star of this.starToSelect) {
      star.classList.remove('starFilter-highlight');
      star.style.opacity = '.6';
    }
    // Boucler sur le nombre d'étoiles choisies
    for (let i = 0; i < this.selectedStar; i++) {
      // Ajouter la class qui change le CSS
      this.starToSelect[i].classList.add('starFilter-highlight');
      this.starToSelect[i].style.opacity = '1';
    }
  }

  // Méthode pour activer bouton valider pour ajouter commentaire
  activateValidBtn() {
    this.validBtn.style.border = '.1rem solid #F19686';
    this.validBtn.style.color = '#F19686';
    this.validBtn.style.cursor = 'pointer';
    this.validBtn.disabled = false;
  }

  // Méthode pour reset la partie commentaire user
  resetCommentContent() {
    this.reviewUser.value = '';
    for (let star of this.starToSelect) {
      star.classList.remove('starFilter-highlight');
      star.style.opacity = '.3';
    }
    this.desactivateStarToSelect();
    this.desactivateValidBtn();
  }

  // Méthode pour désactiver bouton valider pour ajouter commentaire
  desactivateValidBtn() {
    this.validBtn.style.border = '.1rem solid rgb(147, 142, 142)';
    this.validBtn.style.color = 'rgb(147, 142, 142)';
    this.validBtn.disabled = true;
  }
}

export default FormReview;
