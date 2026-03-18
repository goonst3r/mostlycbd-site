/* ── Gang Bang Eats — App Logic ──────────────────────────────── */
/* Alpine.js reactive store + components, zero build step        */

// ── SVG Icon helpers (replaces Phosphor Icons) ──────────────────
const ICONS = {
  heart:    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M240,98a57.63,57.63,0,0,1-17,41L128,236,33,139A58,58,0,0,1,114.77,57.23L128,70.46l13.23-13.23A58,58,0,0,1,240,98Z"/></svg>',
  fire:     '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM232,144a104,104,0,0,1-208,0c0-35.78,21.94-67.8,34.56-82.83A8,8,0,0,1,72,64.5l35.48,40.23a8,8,0,0,0,12-10.56L85.34,56.89A8,8,0,0,1,97.21,44.87c.45.5,44.73,49.42,62.79,68a8,8,0,0,0,11.5.39,24,24,0,0,0,.87-34.11,4,4,0,0,1,5.42-5.66C206.64,96.9,232,124,232,144Z"/></svg>',
  skull:    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16C70.65,16,24,60.86,24,116c0,34.1,18.27,66,48,86v18a16,16,0,0,0,16,16h80a16,16,0,0,0,16-16V202c29.73-20,48-51.86,48-86C232,60.86,185.35,16,128,16ZM92,152a20,20,0,1,1,20-20A20,20,0,0,1,92,152Zm72,0a20,20,0,1,1,20-20A20,20,0,0,1,164,152Z"/></svg>',
  fork:     '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M72,32V80a40,40,0,0,0,32,39.2V224a8,8,0,0,0,16,0V200h24a8,8,0,0,0,8-8V119.2A40,40,0,0,0,184,80V32a8,8,0,0,0-16,0V80a24,24,0,0,1-16,22.62V32a8,8,0,0,0-16,0v70.62A24,24,0,0,1,120,80V32a8,8,0,0,0-16,0V80a24,24,0,0,1-16-22.62V32A8,8,0,0,0,72,32Z"/></svg>',
  globe:    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-120h48a8,8,0,0,0,0-16H136V40a8,8,0,0,0-16,0V80H72a8,8,0,0,0,0,16h48v64H72a8,8,0,0,0,0,16h48v40a8,8,0,0,0,16,0V176h48a8,8,0,0,0,0-16H136Z"/></svg>',
  shuffle:  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M237.66,178.34a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32-11.32L212.69,192H200.94a72.12,72.12,0,0,1-58.59-30.15l-14.28-20.1L96.73,192H40a8,8,0,0,1,0-16H88.34l36.49-51.31L88.34,80H40a8,8,0,0,1,0-16H96.73l31.34,44.07L142.35,88.15A72.12,72.12,0,0,1,200.94,64h11.75L202.34,53.66a8,8,0,0,1,11.32-11.32l24,24a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32-11.32L212.69,80H200.94a56.09,56.09,0,0,0-45.57,23.42L143.28,120l12.09,17,0,.05A56.09,56.09,0,0,0,200.94,160h11.75l-10.35-10.34a8,8,0,0,1,11.32-11.32Z"/></svg>',
  pin:      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,56a32,32,0,1,1-32,32A32,32,0,0,1,128,72Z"/></svg>',
  arrow:    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69l-58.35-58.34a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>',
  x:        '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>',
  pencil:   '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120Z"/></svg>',
  check:    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>',
  plus:     '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/></svg>',
  users:    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M164.47,195.63a8,8,0,0,1-6.7,12.37H10.23a8,8,0,0,1-6.7-12.37,80.15,80.15,0,0,1,44.07-34.09,48,48,0,1,1,72.8,0A80.15,80.15,0,0,1,164.47,195.63ZM252.47,195.63a80.15,80.15,0,0,0-44.07-34.09,48,48,0,0,0-40-79.24,8,8,0,0,0,2.24,15.72,32,32,0,0,1,0,63.52,8,8,0,0,0-2.24,15.72,80.15,80.15,0,0,1,44.07,34.09,8,8,0,0,0,6.7,12.37h26.6A8,8,0,0,0,252.47,195.63Z"/></svg>',
  store:    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M232,96H216V72a8,8,0,0,0-8-8H48a8,8,0,0,0-8,8V96H24a8,8,0,0,0-8,8,104.35,104.35,0,0,0,56,92.28V208a16,16,0,0,0,16,16H168a16,16,0,0,0,16-16v-11.72A104.35,104.35,0,0,0,240,104,8,8,0,0,0,232,96Z"/></svg>',
  upload:   '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H80a8,8,0,0,1,0,16H32v64H224V136H176a8,8,0,0,1,0-16h48A16,16,0,0,1,240,136ZM85.66,77.66,120,43.31V128a8,8,0,0,0,16,0V43.31l34.34,34.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,77.66Z"/></svg>',
  warning:  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"/></svg>',
  back:     '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>',
  camera:   '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.72,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm-80,104a36,36,0,1,1,36-36A36,36,0,0,1,128,160Z"/></svg>',
  chat:     '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H40A16,16,0,0,0,24,64V224a15.85,15.85,0,0,0,9.24,14.5A16.13,16.13,0,0,0,40,240a15.89,15.89,0,0,0,10.25-3.78L83.43,208H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM80,144H64a8,8,0,0,1,0-16H80a8,8,0,0,1,0,16Zm96-32H64a8,8,0,0,1,0-16H176a8,8,0,0,1,0,16Z"/></svg>',
  checkcircle: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/></svg>',
  nav:      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M237.33,106.21,61.41,41.53a16,16,0,0,0-20.67,21L66.75,128,40.74,193.49a16,16,0,0,0,20.67,21l175.92-64.68a16,16,0,0,0,0-30Z"/></svg>',
  menu:     '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/></svg>',
  trash:    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/></svg>',
};

function faviconUrl(website) {
  if (!website) return '';
  return 'https://www.google.com/s2/favicons?domain_url=' + encodeURIComponent(website) + '&sz=32';
}

function icon(name, size) {
  const s = size || 16;
  return ICONS[name].replace(/width="1em"/g, `width="${s}"`).replace(/height="1em"/g, `height="${s}"`);
}

// ── Helpers ─────────────────────────────────────────────────────
function getPrimaryType(ratings) {
  if (!ratings || ratings.length === 0) return 'unrated';
  const c = { marry: 0, fuck: 0, kill: 0 };
  ratings.forEach(r => c[r.rating]++);
  if (c.marry >= c.fuck && c.marry >= c.kill) return 'marry';
  if (c.fuck > c.marry && c.fuck >= c.kill) return 'fuck';
  return 'kill';
}

function buildRankingString(ratings) {
  if (!ratings || ratings.length === 0) return '----';
  return ratings.map(r => r.rating[0].toUpperCase()).join('').padEnd(4, '-').slice(0, 8);
}

function typeIcon(type) {
  return { marry: 'heart', fuck: 'fire', kill: 'skull', unrated: 'store' }[type] || 'store';
}

function ratingImg(type, size) {
  const s = size || 24;
  const src = { marry: 'marry.jpg', fuck: 'fuck.jpg', kill: 'kill.jpg' }[type];
  if (!src) return '';
  return `<img src="./${src}" width="${s}" height="${s}" alt="${type}" style="display:block;border-radius:50%;">`;
}

// ── Alpine Store ────────────────────────────────────────────────
document.addEventListener('alpine:init', () => {

  Alpine.store('app', {
    // State
    view: 'feed',
    loading: true,
    restaurants: [],
    ratings: [],
    members: [],
    selectedRestaurantId: null,
    showMembers: false,
    confirmDeleteRestaurant: false,

    // Menu
    menuOpen: false,
    menuFilter: null,
    menuAddOpen: false,
    menuNewSpot: '',
    menuNewStyle: '',
    menuNewWebsite: '',

    // Picker
    pickedSpot: null,
    isSpinning: false,
    spinDisplay: null,
    _spinRef: null,

    // Unsubs
    _unsubs: [],

    // Computed-like
    get enriched() {
      const byRest = {};
      this.ratings.forEach(r => {
        if (!byRest[r.restaurantId]) byRest[r.restaurantId] = [];
        byRest[r.restaurantId].push(r);
      });
      return this.restaurants.map(rest => {
        const ratings = byRest[rest.id] || [];
        return {
          ...rest,
          ratings,
          rankingString: buildRankingString(ratings),
          primaryType: getPrimaryType(ratings),
        };
      });
    },

    get sorted() {
      const rank = { marry: 0, fuck: 1, kill: 2, unrated: 3 };
      return [...this.enriched].sort((a, b) => {
        const d = rank[a.primaryType] - rank[b.primaryType];
        if (d !== 0) return d;
        if (a.primaryType !== 'unrated') {
          const ac = a.ratings.filter(r => r.rating === a.primaryType).length;
          const bc = b.ratings.filter(r => r.rating === b.primaryType).length;
          if (bc !== ac) return bc - ac;
          return b.ratings.length - a.ratings.length;
        }
        return a.spot.localeCompare(b.spot);
      });
    },

    get unvisited() {
      return this.enriched.filter(r => r.primaryType === 'unrated');
    },

    get selectedRestaurant() {
      if (!this.selectedRestaurantId) return null;
      return this.enriched.find(r => r.id === this.selectedRestaurantId) || null;
    },

    get cuisineTypes() {
      const types = new Set(this.restaurants.map(r => r.style).filter(Boolean));
      return [...types].sort();
    },

    get menuRestaurants() {
      let list = this.enriched;
      if (this.menuFilter) list = list.filter(r => r.style === this.menuFilter);
      return [...list].sort((a, b) => a.spot.localeCompare(b.spot));
    },

    toggleMenu() { this.menuOpen = !this.menuOpen; },
    closeMenu() {
      this.menuOpen = false;
      this.menuFilter = null;
      this.menuAddOpen = false;
      this.menuNewSpot = '';
      this.menuNewStyle = '';
      this.menuNewWebsite = '';
    },

    async addNewRestaurant() {
      if (!this.menuNewSpot.trim()) return;
      await DB.addRestaurant({
        spot: this.menuNewSpot.trim(),
        style: this.menuNewStyle.trim() || 'Restaurant',
        website: this.menuNewWebsite.trim() || null,
        img: 'https://picsum.photos/seed/' + encodeURIComponent(this.menuNewSpot.trim()) + '/800/600',
      });
      this.menuNewSpot = '';
      this.menuNewStyle = '';
      this.menuNewWebsite = '';
      this.menuAddOpen = false;
    },

    // Init
    init() {
      let rLoaded = false, ratLoaded = false;
      const check = () => { if (rLoaded && ratLoaded) this.loading = false; };

      this._unsubs.push(
        DB.subscribeRestaurants(data => { this.restaurants = data; rLoaded = true; check(); }),
        DB.subscribeRatings(data => { this.ratings = data; ratLoaded = true; check(); }),
        DB.subscribeMembers(data => { this.members = data; })
      );
    },

    // Actions
    selectRestaurant(r) { this.selectedRestaurantId = r.id; this.confirmDeleteRestaurant = false; document.body.style.overflow = 'hidden'; Alpine.store('changePic').close(); },
    closeModal() { this.selectedRestaurantId = null; this.confirmDeleteRestaurant = false; document.body.style.overflow = ''; Alpine.store('addPhotos').reset(); Alpine.store('changePic').close(); },

    async deleteRestaurant() {
      const rest = this.selectedRestaurant;
      if (!rest || rest.ratings.length > 0) return;
      await DB.deleteRestaurant(rest.id);
      this.closeModal();
    },

    handleRandomPick() {
      const unv = this.unvisited;
      if (unv.length === 0 || this.isSpinning) return;
      this.isSpinning = true;
      this.pickedSpot = null;
      let tick = 0;
      const total = 20;
      this._spinRef = setInterval(() => {
        this.spinDisplay = unv[Math.floor(Math.random() * unv.length)].spot;
        tick++;
        if (tick >= total) {
          clearInterval(this._spinRef);
          const winner = unv[Math.floor(Math.random() * unv.length)];
          this.spinDisplay = null;
          this.pickedSpot = winner;
          this.isSpinning = false;
        }
      }, 60);
    },

    isLargeCard(item, idx) {
      return idx === 0;
    },
  });

  // ── Rate form store (used inside restaurant modal) ──────────
  Alpine.store('rate', {
    rating: null,
    memberId: '',
    notes: '',
    isGuest: false,
    guestName: '',
    submitting: false,
    submitted: false,
    foodPhotos: [],
    foodPreviews: [],
    selfiePhotos: [],
    selfiePreviews: [],

    reset() {
      this.rating = null;
      this.memberId = '';
      this.notes = '';
      this.isGuest = false;
      this.guestName = '';
      this.submitting = false;
      this.submitted = false;
      this.foodPhotos = [];
      this.foodPreviews = [];
      this.selfiePhotos = [];
      this.selfiePreviews = [];
    },

    get availableMembers() {
      const sel = Alpine.store('app').selectedRestaurant;
      if (!sel || !sel.ratings) return Alpine.store('app').members;
      const voted = new Set(sel.ratings.map(r => r.memberId));
      return Alpine.store('app').members.filter(m => !m.guest && !voted.has(m.id));
    },

    get canSubmit() {
      if (!this.rating) return false;
      if (this.isGuest) return this.guestName.trim().length > 0;
      return !!this.memberId;
    },

    addFoodPhotos(input) {
      const files = Array.from(input.files);
      const remaining = 4 - this.foodPhotos.length;
      const toAdd = files.slice(0, remaining);
      toAdd.forEach(f => {
        this.foodPhotos.push(f);
        this.foodPreviews.push(URL.createObjectURL(f));
      });
      input.value = '';
    },

    removeFoodPhoto(idx) {
      URL.revokeObjectURL(this.foodPreviews[idx]);
      this.foodPhotos.splice(idx, 1);
      this.foodPreviews.splice(idx, 1);
    },

    addSelfiePhotos(input) {
      const files = Array.from(input.files);
      const remaining = 2 - this.selfiePhotos.length;
      const toAdd = files.slice(0, remaining);
      toAdd.forEach(f => {
        this.selfiePhotos.push(f);
        this.selfiePreviews.push(URL.createObjectURL(f));
      });
      input.value = '';
    },

    removeSelfiePhoto(idx) {
      URL.revokeObjectURL(this.selfiePreviews[idx]);
      this.selfiePhotos.splice(idx, 1);
      this.selfiePreviews.splice(idx, 1);
    },

    async submit() {
      if (!this.canSubmit || this.submitting) return;
      this.submitting = true;

      try {
        const restId = Alpine.store('app').selectedRestaurant.id;

        // If guest, create the member first
        let voteMemberId = this.memberId;
        let voteMemberName = '';
        if (this.isGuest) {
          const newId = await DB.addMember(this.guestName.trim(), { guest: true });
          voteMemberId = newId;
          voteMemberName = this.guestName.trim();
        } else {
          const member = Alpine.store('app').members.find(m => m.id === voteMemberId);
          voteMemberName = member ? member.name : '';
        }

        // Server-side duplicate guard
        const isDup = await DB.checkDuplicate(voteMemberId, restId);
        if (isDup) {
          alert('This member has already voted on this restaurant.');
          this.submitting = false;
          return;
        }

        const allFiles = [...this.foodPhotos, ...this.selfiePhotos];
        const photoUrls = allFiles.length > 0 ? await DB.uploadPhotos(allFiles, restId) : [];

        await DB.addRating({
          restaurantId: restId,
          memberId: voteMemberId,
          memberName: voteMemberName,
          rating: this.rating,
          notes: this.notes,
          photos: photoUrls,
        });

        this.submitted = true;
        setTimeout(() => { this.reset(); }, 2000);
      } catch (err) {
        console.error('Submit failed:', err);
        this.submitting = false;
      }
    },
  });

  // ── Edit rating store ───────────────────────────────────────
  Alpine.store('edit', {
    active: false,
    ratingId: null,
    memberName: '',
    restaurantName: '',
    newRating: null,
    notes: '',
    saving: false,

    open(rating, restaurant) {
      this.active = true;
      this.ratingId = rating.id;
      this.memberName = rating.memberName;
      this.restaurantName = restaurant.spot;
      this.newRating = rating.rating;
      this.notes = rating.notes || '';
      this.saving = false;
    },

    close() {
      this.active = false;
      this.ratingId = null;
    },

    async save() {
      if (!this.newRating || this.saving) return;
      this.saving = true;
      try {
        await DB.updateRating(this.ratingId, {
          rating: this.newRating,
          notes: this.notes,
        });
        this.close();
      } catch (err) {
        console.error('Edit failed:', err);
        this.saving = false;
      }
    },

    async remove() {
      if (this.saving) return;
      this.saving = true;
      try {
        await DB.deleteRating(this.ratingId);
        this.close();
      } catch (err) {
        console.error('Delete failed:', err);
        this.saving = false;
      }
    },
  });

  // ── Lightbox store ─────────────────────────────────────────
  Alpine.store('lightbox', {
    open: false,
    photos: [],
    index: 0,
    confirmDelete: false,
    deleting: false,
    tagging: false,
    tagText: '',
    tagMemberId: '',
    tagSaving: false,
    confirmDeleteTag: null,
    tagDeleting: false,

    _touchStartX: 0,

    show(photos, index) {
      this.photos = photos;
      this.index = index;
      this.open = true;
      this.confirmDelete = false;
      this.deleting = false;
    },

    handleTouchStart(e) {
      this._touchStartX = e.touches[0].clientX;
    },

    handleTouchEnd(e) {
      const dx = e.changedTouches[0].clientX - this._touchStartX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) this.next();
        else this.prev();
      }
    },

    close() {
      this.open = false;
      this.photos = [];
      this.index = 0;
      this.confirmDelete = false;
      this.deleting = false;
      this.tagging = false;
      this.tagText = '';
      this.tagMemberId = '';
      this.tagSaving = false;
      this.confirmDeleteTag = null;
      this.tagDeleting = false;
    },

    prev() {
      if (this.confirmDelete || this.tagging) return;
      this.index = (this.index - 1 + this.photos.length) % this.photos.length;
    },

    next() {
      if (this.confirmDelete || this.tagging) return;
      this.index = (this.index + 1) % this.photos.length;
    },

    get currentUrl() {
      return this.photos[this.index] || '';
    },

    promptDelete() {
      this.confirmDelete = true;
    },

    cancelDelete() {
      this.confirmDelete = false;
    },

    async executeDelete() {
      if (this.deleting) return;
      const url = this.currentUrl;
      const sel = Alpine.store('app').selectedRestaurant;
      if (!sel) return;

      // Find which rating has this photo
      const rating = (sel.ratings || []).find(r => (r.photos || []).includes(url));
      const isRestaurantPhoto = !rating && (sel.photos || []).includes(url);
      if (!rating && !isRestaurantPhoto) return;

      this.deleting = true;
      try {
        if (rating) {
          await DB.removePhotoFromRating(rating.id, url);
        } else {
          await DB.removePhotoFromRestaurant(sel.id, url);
        }
        // Remove from local array and adjust index
        this.photos.splice(this.index, 1);
        if (this.photos.length === 0) {
          this.close();
        } else {
          if (this.index >= this.photos.length) this.index = this.photos.length - 1;
          this.confirmDelete = false;
          this.deleting = false;
        }
      } catch (err) {
        console.error('Delete photo failed:', err);
        this.deleting = false;
      }
    },

    // ── Tagging ────────────────────────────────────────────────
    promptTag() {
      this.tagging = true;
      this.tagText = '';
      this.tagMemberId = '';
      this.tagWarning = false;
      this.tagSaving = false;
    },

    cancelTag() {
      this.tagging = false;
      this.tagText = '';
      this.tagMemberId = '';
      this.tagSaving = false;
    },

    get tagCanSubmit() {
      return this.tagText.trim().length > 0 && !!this.tagMemberId;
    },

    async submitTag() {
      if (!this.tagCanSubmit || this.tagSaving) return;
      const url = this.currentUrl;
      const sel = Alpine.store('app').selectedRestaurant;
      if (!sel) return;

      const member = Alpine.store('app').members.find(m => m.id === this.tagMemberId);
      if (!member) return;

      const tag = {
        photoUrl: url,
        text: this.tagText.trim(),
        memberId: member.id,
        memberName: member.name,
        avatarUrl: member.avatarUrl || '',
      };

      this.tagSaving = true;
      try {
        const rating = (sel.ratings || []).find(r => (r.photos || []).includes(url));
        if (rating) {
          await DB.addPhotoTag(rating.id, tag);
        } else {
          await DB.addRestaurantPhotoTag(sel.id, tag);
        }
        this.cancelTag();
      } catch (err) {
        console.error('Tag failed:', err);
        this.tagSaving = false;
      }
    },

    get currentTags() {
      const url = this.currentUrl;
      const sel = Alpine.store('app').selectedRestaurant;
      if (!sel || !url) return [];
      const rating = (sel.ratings || []).find(r => (r.photos || []).includes(url));
      const source = rating || sel;
      return (source.photoTags || []).filter(t => t.photoUrl === url);
    },

    promptDeleteTag(tag) {
      this.confirmDeleteTag = tag;
    },

    cancelDeleteTag() {
      this.confirmDeleteTag = null;
    },

    async executeDeleteTag() {
      if (!this.confirmDeleteTag || this.tagDeleting) return;
      const tag = this.confirmDeleteTag;
      const url = this.currentUrl;
      const sel = Alpine.store('app').selectedRestaurant;
      if (!sel) return;

      this.tagDeleting = true;
      try {
        const rating = (sel.ratings || []).find(r => (r.photos || []).includes(url));
        if (rating) {
          await DB.removePhotoTag(rating.id, tag);
        } else {
          await DB.removeRestaurantPhotoTag(sel.id, tag);
        }
        this.confirmDeleteTag = null;
      } catch (err) {
        console.error('Delete tag failed:', err);
      } finally {
        this.tagDeleting = false;
      }
    },
  });

  // ── Change Main Photo store ─────────────────────────────────
  Alpine.store('changePic', {
    open: false,
    saving: false,

    get allPhotos() {
      const sel = Alpine.store('app').selectedRestaurant;
      if (!sel) return [];
      const votePhotos = (sel.ratings || []).flatMap(r => r.photos || []);
      const restPhotos = sel.photos || [];
      const all = [...new Set([...votePhotos, ...restPhotos])];
      return all.filter(url => url !== sel.img);
    },

    toggle() { this.open = !this.open; this.saving = false; },
    close() { this.open = false; this.saving = false; },

    async _applyNewImg(url) {
      const sel = Alpine.store('app').selectedRestaurant;
      if (!sel) return;
      const oldImg = sel.img;
      const existing = [...(sel.ratings || []).flatMap(r => r.photos || []), ...(sel.photos || [])];
      if (oldImg && !existing.includes(oldImg)) {
        await DB.addRestaurantPhotos(sel.id, [oldImg]);
      }
      await DB.updateRestaurant(sel.id, { img: url });
    },

    async selectPhoto(url) {
      if (this.saving) return;
      this.saving = true;
      try {
        await this._applyNewImg(url);
        this.close();
      } catch (err) {
        console.error('Change pic failed:', err);
        this.saving = false;
      }
    },

    async uploadPhoto(input) {
      const file = input.files[0];
      input.value = '';
      if (!file || this.saving) return;
      const sel = Alpine.store('app').selectedRestaurant;
      if (!sel) return;
      this.saving = true;
      try {
        const [url] = await DB.uploadPhotos([file], sel.id);
        await this._applyNewImg(url);
        this.close();
      } catch (err) {
        console.error('Upload pic failed:', err);
        this.saving = false;
      }
    },
  });

  // ── Add Photos store (detail view upload) ──────────────────
  Alpine.store('addPhotos', {
    open: false,
    photos: [],
    previews: [],
    uploading: false,

    toggle() {
      this.open = !this.open;
      if (!this.open) this.reset();
    },

    reset() {
      this.open = false;
      this.previews.forEach(p => URL.revokeObjectURL(p));
      this.photos = [];
      this.previews = [];
      this.uploading = false;
    },

    addFiles(input) {
      const files = Array.from(input.files);
      const remaining = 6 - this.photos.length;
      const toAdd = files.slice(0, remaining);
      toAdd.forEach(f => {
        this.photos.push(f);
        this.previews.push(URL.createObjectURL(f));
      });
      input.value = '';
    },

    removePhoto(idx) {
      URL.revokeObjectURL(this.previews[idx]);
      this.photos.splice(idx, 1);
      this.previews.splice(idx, 1);
    },

    async upload() {
      if (this.photos.length === 0 || this.uploading) return;
      const sel = Alpine.store('app').selectedRestaurant;
      if (!sel) return;

      this.uploading = true;
      try {
        const urls = await DB.uploadPhotos(this.photos, sel.id);
        await DB.addRestaurantPhotos(sel.id, urls);
        this.reset();
      } catch (err) {
        console.error('Photo upload failed:', err);
        this.uploading = false;
      }
    },
  });

  // ── Add Note store (detail view) ────────────────────────────
  Alpine.store('addNote', {
    open: false,
    text: '',
    memberId: '',
    memberName: '',
    isGuest: false,
    guestName: '',
    saving: false,
    pendingDelete: null, // { type: 'rating'|'restaurant', payload }
    deleting: false,

    toggle() {
      this.open = !this.open;
      if (!this.open) this.resetForm();
    },

    resetForm() {
      this.text = '';
      this.memberId = '';
      this.memberName = '';
      this.isGuest = false;
      this.guestName = '';
      this.saving = false;
    },

    reset() {
      this.open = false;
      this.resetForm();
    },

    selectMember(m) {
      this.isGuest = false;
      this.guestName = '';
      this.memberId = m.id;
      this.memberName = m.name;
    },

    selectGuest() {
      this.isGuest = true;
      this.memberId = '';
      this.memberName = '';
    },

    get canSave() {
      if (!this.text.trim()) return false;
      if (this.isGuest) return this.guestName.trim().length > 0;
      return !!this.memberId;
    },

    async save() {
      if (!this.canSave || this.saving) return;
      const sel = Alpine.store('app').selectedRestaurant;
      if (!sel) return;

      const noteMemberId = this.isGuest ? '' : this.memberId;
      const noteMemberName = this.isGuest ? this.guestName.trim() : this.memberName;

      this.saving = true;
      try {
        await DB.addRestaurantNote(sel.id, {
          id: Date.now(),
          text: this.text.trim(),
          memberId: noteMemberId,
          memberName: noteMemberName,
        });
        this.reset();
      } catch (err) {
        console.error('Add note failed:', err);
        this.saving = false;
      }
    },

    promptDelete(type, payload) {
      this.pendingDelete = { type, payload };
    },

    cancelDelete() {
      this.pendingDelete = null;
      this.deleting = false;
    },

    async confirmDelete() {
      if (!this.pendingDelete || this.deleting) return;
      const sel = Alpine.store('app').selectedRestaurant;
      if (!sel) return;
      this.deleting = true;
      try {
        if (this.pendingDelete.type === 'rating') {
          await DB.clearRatingNote(this.pendingDelete.payload.id);
        } else {
          await DB.deleteRestaurantNote(sel.id, this.pendingDelete.payload);
        }
        this.pendingDelete = null;
      } catch (err) {
        console.error('Delete note failed:', err);
      } finally {
        this.deleting = false;
      }
    },
  });

  // ── Members store ───────────────────────────────────────────
  Alpine.store('mem', {
    editing: null,
    editName: '',
    avatarFile: null,
    avatarPreview: '',
    saving: false,
    fromRestaurant: false,

    openEdit(member, fromRestaurant = false) {
      this.editing = member;
      this.editName = member.name;
      this.avatarPreview = member.avatarUrl || '';
      this.avatarFile = null;
      this.saving = false;
      this.fromRestaurant = fromRestaurant;
    },

    closeEdit() {
      if (this.avatarPreview && this.avatarFile) URL.revokeObjectURL(this.avatarPreview);
      if (this.fromRestaurant) Alpine.store('app').showMembers = false;
      this.editing = null;
      this.editName = '';
      this.avatarFile = null;
      this.avatarPreview = '';
      this.saving = false;
      this.fromRestaurant = false;
    },

    async setAvatar(input) {
      const file = input.files[0];
      if (!file) return;
      input.value = '';

      // Apply cartoon filter via canvas
      const filtered = await this._applyCartoonFilter(file);
      this.avatarFile = filtered;
      this.avatarPreview = URL.createObjectURL(filtered);
    },

    _applyCartoonFilter(file) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const size = 512;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          // Draw image cropped to square (center crop)
          const s = Math.min(img.width, img.height);
          const sx = (img.width - s) / 2;
          const sy = (img.height - s) / 2;
          ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);

          // Get pixel data
          const imageData = ctx.getImageData(0, 0, size, size);
          const d = imageData.data;

          // Posterize (reduce to ~6 levels per channel) + boost saturation
          const levels = 6;
          const step = 255 / (levels - 1);
          for (let i = 0; i < d.length; i += 4) {
            let r = d[i], g = d[i + 1], b = d[i + 2];

            // Posterize
            r = Math.round(Math.round(r / step) * step);
            g = Math.round(Math.round(g / step) * step);
            b = Math.round(Math.round(b / step) * step);

            // Boost saturation
            const avg = (r + g + b) / 3;
            const sat = 1.4;
            r = Math.min(255, Math.max(0, avg + (r - avg) * sat));
            g = Math.min(255, Math.max(0, avg + (g - avg) * sat));
            b = Math.min(255, Math.max(0, avg + (b - avg) * sat));

            // Increase contrast
            const contrast = 1.2;
            r = Math.min(255, Math.max(0, (r - 128) * contrast + 128));
            g = Math.min(255, Math.max(0, (g - 128) * contrast + 128));
            b = Math.min(255, Math.max(0, (b - 128) * contrast + 128));

            d[i] = r;
            d[i + 1] = g;
            d[i + 2] = b;
          }
          ctx.putImageData(imageData, 0, 0);

          // Edge detection overlay for comic-book outlines
          const edgeCanvas = document.createElement('canvas');
          edgeCanvas.width = size;
          edgeCanvas.height = size;
          const ectx = edgeCanvas.getContext('2d');
          ectx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
          const edgeData = ectx.getImageData(0, 0, size, size);
          const ed = edgeData.data;

          // Simple Sobel-like edge detection
          const gray = new Float32Array(size * size);
          for (let i = 0; i < size * size; i++) {
            gray[i] = (ed[i * 4] * 0.299 + ed[i * 4 + 1] * 0.587 + ed[i * 4 + 2] * 0.114);
          }

          const edges = new Float32Array(size * size);
          for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
              const idx = y * size + x;
              const gx = -gray[idx - size - 1] + gray[idx - size + 1]
                       - 2 * gray[idx - 1] + 2 * gray[idx + 1]
                       - gray[idx + size - 1] + gray[idx + size + 1];
              const gy = -gray[idx - size - 1] - 2 * gray[idx - size] - gray[idx - size + 1]
                       + gray[idx + size - 1] + 2 * gray[idx + size] + gray[idx + size + 1];
              edges[idx] = Math.sqrt(gx * gx + gy * gy);
            }
          }

          // Draw dark edges on top of posterized image
          ctx.globalAlpha = 0.35;
          for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
              const e = edges[y * size + x];
              if (e > 40) {
                const alpha = Math.min(1, e / 120);
                const px = imageData.data;
                const idx = (y * size + x) * 4;
                px[idx] = Math.max(0, px[idx] - 80 * alpha);
                px[idx + 1] = Math.max(0, px[idx + 1] - 80 * alpha);
                px[idx + 2] = Math.max(0, px[idx + 2] - 80 * alpha);
              }
            }
          }
          ctx.globalAlpha = 1;
          ctx.putImageData(imageData, 0, 0);

          canvas.toBlob(blob => resolve(blob), 'image/png');
        };
        img.src = URL.createObjectURL(file);
      });
    },

    async saveProfile() {
      if (!this.editing || !this.editName.trim()) return;
      this.saving = true;

      try {
        const updates = { name: this.editName.trim() };

        if (this.avatarFile) {
          const avatarUrl = await DB.uploadAvatar(this.avatarFile, this.editing.id);
          updates.avatarUrl = avatarUrl;
        }

        await DB.updateMember(this.editing.id, updates);
        this.closeEdit();
      } catch (err) {
        console.error('Save profile failed:', err);
        this.saving = false;
      }
    },
  });
});

// Expose dev helpers
window.resetDB = () => Seed.resetDatabase();
window.seedDB = () => Seed.seedDatabase();
window.markGuest = (name) => firebase.firestore().collection('members')
  .where('name', '==', name).get()
  .then(snap => { snap.docs.forEach(d => d.ref.update({ guest: true })); console.log(`Marked ${snap.size} member(s) as guest.`); });
