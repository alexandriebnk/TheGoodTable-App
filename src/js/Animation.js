// Importer GSAP
import { gsap } from 'gsap';

// Importer Bowser
import Bowser from 'bowser';

class Animation {
  constructor() {
    // Loading page //
    this.loadingPage = document.querySelector('.loading__page');
    this.loaderIcon = document.querySelector('.loader');
    this.loaderLineOn = document.querySelector('.loader__line-on');
    // Header //
    this.headerTitle = document.querySelector(
      '.header__presentation-title',
    ).children;
    // Fiche restaurant sur map //
    this.map = document.querySelector('.map');
    this.layerRestaurant = document.querySelector(
      '.layer__restaurant',
    );
    this.backward = document.querySelector('.backward');
    // Ajouter un restaurant //
    this.listRestaurants = document.querySelector('.list');
    this.addRestaurantBtn = document.querySelector('.button__add');
    this.newRestaurantLayout = document.querySelector(
      '.newRestaurant',
    );
    this.concept = document.querySelector('.concept');
    // Créer propriété pour savoir la device utilisée
    this.bowser = Bowser.parse(window.navigator.userAgent);

    // Timeline en attente
    this.newRestaurantTl = null;

    // Lancer les timelines au début
    this.createTimelineLoading();
    this.createTimelines();
  }

  // Méthodes GSAP //

  // Animation de la page loading
  createTimelineLoading() {
    // Créer timeline
    const tlLoading = new gsap.timeline();
    tlLoading
      .add('fade')
      .to(this.loaderLineOn, { duration: '1', width: '50%' })
      .to(this.loaderLineOn, { duration: '1', width: '100%' })
      .to(
        this.loaderIcon,
        {
          duration: '1',
          opacity: '0',
          ease: 'power4.inOut',
        },
        'fade+=1.3',
      )
      .to(
        this.loadingPage,
        {
          duration: '1.8',
          height: '0',
          ease: 'power4.inOut',
        },
        'fade+=1.6',
      )
      .add(() => {
        this.createTimelineHeader();
      }, 'fade+=2.55');
  }

  // Animation du header
  createTimelineHeader() {
    // Créer timeline
    const tlHeader = new gsap.timeline();
    // Permettre au user de scroller qu'après un délai d'animation
    tlHeader.set('body', { overflow: 'auto' });
    tlHeader.fromTo(
      this.headerTitle,
      { y: '10rem' },
      {
        duration: '1',
        opacity: '1',
        y: '0',
        ease: 'power4.Out',
        stagger: 0.2,
      },
    );
  }

  // Création de timeline
  createTimelines() {
    this.newRestaurantTl = new gsap.timeline({ paused: true });
    this.newRestaurantTl.to(this.newRestaurantLayout, {
      duration: '1',
      left: '0',
      ease: 'power4.inOut',
    });
    this.newRestaurantTl.to(
      this.listRestaurants,
      {
        opacity: '0',
        pointerEvents: 'none',
      },
      '-=1',
    );

    this.layerRestaurantTl = new gsap.timeline({ paused: true });
    this.layerRestaurantTl.to(this.map, {
      duration: '.2',
      opacity: '0',
    });
    this.layerRestaurantTl.to(
      this.layerRestaurant,
      {
        duration: '1',
        left: '0',
        ease: 'power4.inOut',
      },
      '-=.2',
    );

    // Condition lancement sur mobile
    if (
      this.bowser.platform.type != 'desktop' &&
      window.innerWidth < 769
    ) {
      this.layerRestaurantTl.to(
        this.listRestaurants,
        {
          opacity: '0',
          pointerEvents: 'none',
        },
        '-=1',
      );
    }
  }

  // Afficher layer details restaurant
  showDetailsRestaurant() {
    this.layerRestaurantTl.play();
  }

  // Cacher layer details restaurant
  hideDetailsRestaurant() {
    this.layerRestaurantTl.reverse();
  }

  // Afficher layer ajout restaurant
  showNewRestaurant() {
    this.newRestaurantTl.play();
    if (this.bowser.platform.type == 'desktop') {
      // Remettre map visible
      this.hideDetailsRestaurant();
    }
  }

  // Cacher layer ajout restaurant
  hideNewRestaurant() {
    this.newRestaurantTl.reverse();
  }
}

export default Animation;
