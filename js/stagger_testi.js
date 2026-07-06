const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
  {
    "id": 0,
    "testimonial": "GoCare is the place to be for y'all who seek professional healthcare training. I loved it here. Thank you to the teachers and all staff. God Bless you.",
    "by": "Klavert Daniel, Student",
    "imgSrc": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80"
  },
  {
    "id": 1,
    "testimonial": "The institute is very professional and organized. I acquired more than I anticipated. Your dedication, passion, and love to train are so amazing. Continue with the good and amazing work.",
    "by": "James Wambui, Graduate",
    "imgSrc": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80"
  },
  {
    "id": 2,
    "testimonial": "The best decision I did was to train with GoCare. They are the best training facility for the certificate and diploma medical and health courses. Best professional study, equipment, and guaranteed attachment.",
    "by": "Joseph Karani, Medical Student",
    "imgSrc": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&q=80"
  },
  {
    "id": 3,
    "testimonial": "Training the best Caregiving and Home Care experts. I approve and recommend anyone who intends to take a course involving Caregiving and Home Care services.",
    "by": "Loise Wairimu, Caregiving Specialist",
    "imgSrc": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&q=80"
  },
  {
    "id": 4,
    "testimonial": "It was great being part of the GoCare Training Institute. I believe I'm now an expert. God bless you GoCare!",
    "by": "Wycliff Mugwimi, Alumni",
    "imgSrc": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80"
  },
  {
    "id": 5,
    "testimonial": "I fully recommend GoCare Training Institute 100%. Have faith, apply, join, and finish with a smile, never regret! And enjoy your fulfilling medical career thereafter.",
    "by": "Cynthia Wambui, Medical Graduate",
    "imgSrc": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80"
  },
  {
    "id": 6,
    "testimonial": "I like the fact that the programs are all about learning how to help people, especially the people who are in need of health care. You get comprehensive skills in a short period of time.",
    "by": "Susan Kimani, Health Care Student",
    "imgSrc": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&q=80"
  },
  {
    "id": 7,
    "testimonial": "You have played a great role in my life and now I am better than before. Thank you so much GoCare.",
    "by": "Judith Arogo, Successful Graduate",
    "imgSrc": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&q=80"
  },
  {
    "id": 8,
    "testimonial": "They gave me the best they could when I was training with them. GoCare is the place to be when you think of medical and healthcare careers training.",
    "by": "Joyce Gathoni, Healthcare Professional",
    "imgSrc": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80"
  },
  {
    "id": 9,
    "testimonial": "I'd recommend everyone who wishes to do a health care course to study at GoCare Training Institute. It's a very good training institution and the teachers are very friendly.",
    "by": "Peter Kamau, Student",
    "imgSrc": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80"
  },
  {
    "id": 10,
    "testimonial": "The training was interesting and informative. Well detailed. Friendly lectures and staff. Registered and accredited by the government. GoCare you are the Best!",
    "by": "Sir Ogada, Alumni",
    "imgSrc": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&q=80"
  },
  {
    "id": 11,
    "testimonial": "GoCare trainers are the best. They are pioneers who have Identified the need for caregiving, there is no other comparison with them.",
    "by": "Ian Chege, Caregiving Specialist",
    "imgSrc": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&q=80"
  },
  {
    "id": 12,
    "testimonial": "They have just what's needed for home best medical and health care Education. They also have a very friendly and willing to help fraternity.",
    "by": "Vellah Chebet, Student",
    "imgSrc": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80"
  },
  {
    "id": 13,
    "testimonial": "This organization is really good and reliable.",
    "by": "George Odhiambo, Graduate",
    "imgSrc": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&q=80"
  },
  {
    "id": 14,
    "testimonial": "An institution of excellence, growth, and advancement. For learners willing to expand their knowledge and soar higher in their careers, GoCare is the place to be.",
    "by": "Grace Wanjiru, Professional Nurse",
    "imgSrc": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&q=80"
  },
  {
    "id": 15,
    "testimonial": "Thanks for the training and the passionate tutors. I learned a lot and am ready to go take care of patients and offer community health services.",
    "by": "Florence Adipo, Community Health Worker",
    "imgSrc": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&q=80"
  },
  {
    "id": 16,
    "testimonial": "The best school for learning health-related courses. They offer the best attachment also. This is the school you are looking for!",
    "by": "Meet Veshi, Student",
    "imgSrc": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80"
  },
  {
    "id": 17,
    "testimonial": "As a training institute for TVET courses, this place has been amazing. Top-notch lecturers who offer nothing but the best.",
    "by": "Muthoni Njora, TVET Graduate",
    "imgSrc": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&q=80"
  },
  {
    "id": 18,
    "testimonial": "I was trained at GoCare. It's a good school. Thank you!",
    "by": "Fatma Hussein, Graduate",
    "imgSrc": "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=120&q=80"
  },
  {
    "id": 19,
    "testimonial": "The best place to be, to grow, and nature your career. Thank you for the experience.",
    "by": "Cecilia Mwangi, Career Professional",
    "imgSrc": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&q=80"
  },
  {
    "id": 20,
    "testimonial": "Big up GoCare. A place everyone would wish to be trained.",
    "by": "Judith Dutira, Graduate",
    "imgSrc": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&q=80"
  },
  {
    "id": 21,
    "testimonial": "After completing the course at GoCare and now working, I value the knowledge and skills I acquired. I am forever grateful for that decision. Long live GoCare!",
    "by": "Maureen Wafula, Working Professional",
    "imgSrc": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&q=80"
  },
  {
    "id": 22,
    "testimonial": "The school fees are very affordable and fair. Compared to the quality training they offer, I confirm value for money, and I will recommend the college any time.",
    "by": "Nancy Njoroge, Graduate",
    "imgSrc": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&q=80"
  },
  {
    "id": 23,
    "testimonial": "Beyond the quality training, I loved the excellent customer care services. Top notch!",
    "by": "Enock Owino, Student",
    "imgSrc": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&q=80"
  },
  {
    "id": 24,
    "testimonial": "I am grateful that the school looks for attachment placement for students in good hospitals. Thus, saving time and money for students.",
    "by": "Winfred Mwende, Graduate",
    "imgSrc": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&q=80"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('stagger-testimonials-container');
  if (!container) return;

  const prevBtn = document.getElementById('stagger-prev');
  const nextBtn = document.getElementById('stagger-next');

  let cardSize = window.matchMedia("(min-width: 640px)").matches ? 365 : 290;
  let order = testimonials.map(t => t.id);

  const cardMap = new Map();

  function getCard(id) {
    if (cardMap.has(id)) return cardMap.get(id);

    const t = testimonials.find(t => t.id === id);
    const card = document.createElement('div');
    card.className = 'stagger-card side-card';
    card.dataset.tid = id;

    card.innerHTML = `
      <span class="stagger-corner"></span>
      <img class="stagger-avatar" src="${t.imgSrc}" alt="${t.by.split(',')[0]}">
      <h3 class="stagger-quote text-muted">"${t.testimonial}"</h3>
      <p class="stagger-author text-muted-sub">- ${t.by}</p>
    `;

    card.addEventListener('click', () => {
      const idx = order.indexOf(id);
      const position = order.length % 2
        ? idx - (order.length + 1) / 2
        : idx - order.length / 2;
      handleMove(position);
    });

    container.insertBefore(card, container.querySelector('.stagger-controls'));
    cardMap.set(id, card);
    return card;
  }

  function applyStyles(card, testimonial, isCenter, position) {
    const translateX = (cardSize / 1.5) * position;
    const translateY = isCenter ? -65 : (position % 2 ? 15 : -15);
    const rotate = isCenter ? 0 : (position % 2 ? 2.5 : -2.5);

    card.style.width = `${cardSize}px`;
    card.style.height = `${cardSize}px`;
    card.style.clipPath = `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`;
    card.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`;
    card.style.boxShadow = isCenter ? "0px 8px 0px 4px var(--p)" : "0px 0px 0px 0px transparent";

    card.className = `stagger-card ${isCenter ? 'center-card' : 'side-card'}`;

    const corner = card.querySelector('.stagger-corner');
    corner.style.right = '-2px';
    corner.style.top = '48px';
    corner.style.width = `${SQRT_5000}px`;
    corner.style.height = '2px';

    const img = card.querySelector('.stagger-avatar');
    img.src = testimonial.imgSrc;
    img.alt = testimonial.by.split(',')[0];

    const title = card.querySelector('.stagger-quote');
    title.className = `stagger-quote ${isCenter ? 'text-primary' : 'text-muted'}`;
    title.textContent = `"${testimonial.testimonial}"`;

    const author = card.querySelector('.stagger-author');
    author.className = `stagger-author ${isCenter ? 'text-primary-sub' : 'text-muted-sub'}`;
    author.textContent = `- ${testimonial.by}`;
  }

  const handleMove = (steps) => {
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = order.shift();
        order.push(item);
      }
    } else {
      for (let i = steps; i < 0; i--) {
        const item = order.pop();
        order.unshift(item);
      }
    }
    render();
  };

  const render = () => {
    order.forEach((id, index) => {
      const position = order.length % 2
        ? index - (order.length + 1) / 2
        : index - order.length / 2;

      const isCenter = position === 0;
      const t = testimonials.find(t => t.id === id);
      const card = getCard(id);
      applyStyles(card, t, isCenter, position);
    });
  };

  window.addEventListener("resize", () => {
    const newSize = window.matchMedia("(min-width: 640px)").matches ? 365 : 290;
    if (newSize !== cardSize) {
      cardSize = newSize;
      render();
    }
  });

  if (prevBtn) prevBtn.addEventListener('click', () => handleMove(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => handleMove(1));

  render();
});
