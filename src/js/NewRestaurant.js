class NewRestaurant {
  constructor() {
    // Elements du DOM
    this.layoutNewRestaurant = document.querySelector(
      '.newRestaurant',
    );
    this.nameInput = document.getElementById(
      'newRestaurant__elements-content',
    );
    this.validateButton = document.querySelector(
      '.newRestaurant__validation',
    );
    this.cancelButton = document.querySelector(
      '.newRestaurant__annulation',
    );
    // Datas //
    // Valeur écrite comme nom par user initialisée à null
    this.restaurantName = null;

    // Event sur l'input restaurantName si user écrit
    this.nameInput.addEventListener('input', () => {
      if (this.nameInput.value != null) {
        this.checkRegExInput();
      }
    });
  }

  // Méthodes //

  // Méthode pour faire apparaitre le layout pour ajout restaurant
  displayLayout() {
    this.nameInput.value = '';
    this.validateButton.disabled = true;
  }

  // Méthode pour mettre le layout en attente d'un click sur map
  waitingLayout() {
    this.validateButton.disabled = true;
    this.validateButton.style.opacity = '.5';
    this.nameInput.style.color = 'rgb(147, 142, 142)';
  }

  // Méthode pour remove le layout
  removeLayout() {
    if (this.nameInput.value != null) {
      this.nameInput.value = '';
    }
  }

  // Méthode regEx vérification nom restaurant par user
  checkRegExInput() {
    // Définition du regEx
    let regEx = /^[A-Za-zàäâéèëêïîôùüÿçœ\'-' ']+$/;
    // Vérification de la bonne valeur rentrée par user
    if (
      this.nameInput.value.length >= 2 &&
      regEx.test(this.nameInput.value)
    ) {
      this.validateButton.style.border = '.1rem solid #F19686';
      this.validateButton.style.color = '#F19686';
      this.validateButton.style.opacity = '1';
      this.validateButton.disabled = false;
    } else if (
      this.nameInput.value.length <= 1 ||
      !regEx.test(this.nameInput.value)
    ) {
      this.disableValidation();
    }
  }

  disableValidation() {
    this.validateButton.style.border =
      '.1rem solid rgb(147, 142, 142)';
    this.validateButton.style.color = 'rgb(147, 142, 142)';
    this.validateButton.disabled = true;
  }

  // Méthode pour stocker la valeur du nom du restau écrit par user
  getName() {
    // Actualiser la valeur au click pour la récupérer
    this.restaurantName = this.nameInput.value;
  }
}

export default NewRestaurant;
