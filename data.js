function makeDummyNominees(seed, title) {
  var safeSeed = String(seed || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return [1, 2, 3, 4, 5, 6].map(function (index) {
    return {
      id: safeSeed + "-nominee-" + index,
      title: title + " Nominee " + index,
      subtitle: "Nominee",
      summary: "Placeholder copy for the nominations browser.",
      image: "https://picsum.photos/seed/" + safeSeed + "-" + index + "/400/560",
      votes: 0,
      accent: ["#d9c7a0", "#654432"]
    };
  });
}

function makeNominationCategory(id, title, linkedVotingCategoryId) {
  return {
    id: id,
    title: title,
    description: title + " category.",
    nominees: makeDummyNominees(id, title),
    isPublicVotingCategory: Boolean(linkedVotingCategoryId),
    linkedVotingCategoryId: linkedVotingCategoryId || ""
  };
}

function makePreviousEditionsMenuItem() {
  return {
    label: "Previous Editions",
    icon: "previousYears",
    submenuId: "previous-editions",
    submenu: [
      { label: "Season 1", pageUrl: "https://www.prajavani.net/cinesamman/", external: true },
      { label: "Season 2", pageUrl: "https://www.prajavani.net/cinesamman/season2", external: true },
      { label: "Season 3", pageUrl: "https://www.prajavani.net/cinesamman/season3", external: true }
    ]
  };
}

window.CINE_SITE_DATA = {
  votingCategories: [
    {
      id: "best-film",
      label: "ವಿಭಾಗ",
      title: "ಅತ್ಯುತ್ತಮ ಚಿತ್ರ",
      description: "ಕಥೆ, ತಾಂತ್ರಿಕತೆ ಮತ್ತು ಪ್ರೇಕ್ಷಕರ ಸ್ಪಂದನವನ್ನು ಸಮತೋಲನವಾಗಿ ಕಟ್ಟಿದ ಚಿತ್ರವನ್ನು ಆರಿಸಿ.",
      hint: "ನಾಮಿನಿಗಳ ನಡುವೆ ಹೋಗಲು ಅಡ್ಡವಾಗಿ ಸ್ವೈಪ್ ಮಾಡಿ. ಮಧ್ಯದಲ್ಲಿರುವ ಕಾರ್ಡ್‌ನಲ್ಲಿ Vote Now ಒತ್ತಿ.",
      nominees: [
        {
          id: "sunlit-frames",
          title: "ಕರಾವಳಿಯ ಬೆಳಕು",
          subtitle: "ಕಥಾನಕ ನಾಟಕ",
          summary: "ಪಾತ್ರಗಳ ಭಾವನೆಗೆ ಆದ್ಯತೆ ನೀಡಿದ ಈ ಚಿತ್ರ, ಮೃದುವಾದ ದೃಶ್ಯಭಾಷೆ ಮತ್ತು ಗಾಢ ಅಂತ್ಯದೊಂದಿಗೆ ಮನಸೆಳೆಯುತ್ತದೆ.",
          image: "https://picsum.photos/seed/sunlit/400/560",
          votes: 184,
          accent: ["#ffca77", "#8f2d3a"]
        },
        {
          id: "midnight-harbor",
          title: "ಅರ್ಧರಾತ್ರಿ ಬಂದರು",
          subtitle: "ರಹಸ್ಯ ಥ್ರಿಲ್ಲರ್",
          summary: "ವಾತಾವರಣ, ವೇಗ ಮತ್ತು ಬಲವಾದ ಕ್ಲೈಮ್ಯಾಕ್ಸ್‌ ಮೇಲೆ ಕಟ್ಟಿದ ತೀಕ್ಷ್ಣ ರಹಸ್ಯಕಥೆ.",
          image: "https://picsum.photos/seed/midnight/400/560",
          votes: 223,
          accent: ["#8dd8ff", "#27406f"]
        },
        {
          id: "river-of-dust",
          title: "ಧೂಳಿನ ನದಿ",
          subtitle: "ಪೀರಿಯಡ್ ಎನ್ಸೆಂಬಲ್",
          summary: "ಸಹಜ ಅಭಿನಯ ಮತ್ತು ನೆನಪಿನಲ್ಲಿ ಉಳಿಯುವ ಅಂತಿಮ ಭಾಗದೊಂದಿಗೆ ಸಾಗುವ ಮನೋಜ್ಞ ಸಮೂಹ ನಾಟಕ.",
          image: "https://picsum.photos/seed/riverdust/400/560",
          votes: 156,
          accent: ["#ffd1ad", "#6c452e"]
        }
      ]
    },
    {
      id: "best-director",
      label: "ವಿಭಾಗ",
      title: "ಅತ್ಯುತ್ತಮ ನಿರ್ದೇಶಕ",
      description: "ದೃಶ್ಯಕಥನದ ನಿಯಂತ್ರಣ ಮತ್ತು ಟೋನ್‌ ಹಿಡಿತ ಅತ್ಯುತ್ತಮವಾಗಿ ತೋರಿಸಿದ ನಿರ್ದೇಶಕನನ್ನು ಆರಿಸಿ.",
      hint: "ಪಕ್ಕದ ಬಾಣಗಳನ್ನು ಬಳಸಿ ಅಥವಾ ಸ್ವೈಪ್ ಮಾಡಿ ಬೇರೆ ನಾಮಿನಿಯನ್ನು ನೋಡಿ.",
      nominees: [
        {
          id: "anand-rao",
          title: "ಅನಂದ್ ರಾವ್",
          subtitle: "ಮೌನದ ಫ್ರೇಮ್",
          summary: "ಪ್ರತಿ ಫ್ರೇಮ್‌ಗೂ ಅರ್ಥ ತುಂಬುವ, ಅಭಿನಯಕ್ಕೆ ಅಗತ್ಯವಾದ ಜಾಗ ನೀಡುವ ನಿಖರ ನಿರ್ದೇಶನ.",
          image: "https://picsum.photos/seed/anandrao/400/560",
          votes: 142,
          accent: ["#ffe09b", "#7a2a33"]
        },
        {
          id: "meera-iyer",
          title: "ಮೀರಾ ಅಯ್ಯರ್",
          subtitle: "ಗ್ಲಾಸ್ ಸಿಟಿ",
          summary: "ಆಧುನಿಕ ದೃಶ್ಯಲಯ, ಸ್ಪಷ್ಟ ಬ್ಲಾಕಿಂಗ್ ಮತ್ತು ಧೈರ್ಯವಾದ ಟೋನ್ ಬದಲಾವಣೆಗಳೊಂದಿಗೆ ಮೆಚ್ಚಿಸುವ ಕೆಲಸ.",
          image: "https://picsum.photos/seed/meeraiyer/400/560",
          votes: 197,
          accent: ["#c7f1ff", "#27556f"]
        },
        {
          id: "karthik-venkat",
          title: "ಕಾರ್ತಿಕ್ ವೆಂಕಟ್",
          subtitle: "ಎರಡನೇ ಬೆಳಕು",
          summary: "ಭಾವನಾತ್ಮಕ ನಿಯಂತ್ರಣ ಮತ್ತು ಶಕ್ತಿಯುತ ಅಂತಿಮ ಭಾಗವನ್ನು ಹೊಂದಿದ ಕಟ್ಟುನಿಟ್ಟಿನ ನಿರ್ದೇಶನ.",
          image: "https://picsum.photos/seed/karthikv/400/560",
          votes: 161,
          accent: ["#ffe3b7", "#6d4931"]
        }
      ]
    },
    {
      id: "best-performance",
      label: "ವಿಭಾಗ",
      title: "ಅತ್ಯುತ್ತಮ ಅಭಿನಯ",
      description: "ಪರದೆಯ ಮೇಲೆ ಅತ್ಯಂತ ನೈಸರ್ಗಿಕ, ಪದರಗಳಿರುವ ಮತ್ತು ನೆನಪಿನಲ್ಲಿ ಉಳಿಯುವ ಅಭಿನಯವನ್ನು ಆರಿಸಿ.",
      hint: "ಮಧ್ಯದಲ್ಲಿರುವ ಮುಖ್ಯ ಕಾರ್ಡ್‌ನಲ್ಲೇ ಮತ ಚಲಾಯಿಸಬೇಕು. ಪಕ್ಕದ ಎರಡು ಕಾರ್ಡ್‌ಗಳು ಪೂರ್ವದೃಶ್ಯ ಮಾತ್ರ.",
      nominees: [
        {
          id: "niranjana",
          title: "ನಿರಂಜನಾ",
          subtitle: "ಮುಖ್ಯ ನಟಿ",
          summary: "ಶಾಂತ ಅಭಿನಯದಿಂದ ಆರಂಭಿಸಿ ಕಥೆ ಗಾಢವಾಗುತ್ತಂತೆ ತೀವ್ರತೆಗೆ ಏರಿದ ಪ್ರಭಾವಿ ನಿರ್ವಹಣೆ.",
          image: "https://picsum.photos/seed/niranjana/400/560",
          votes: 205,
          accent: ["#ffdca8", "#8a3242"]
        },
        {
          id: "rahul-shetty",
          title: "ರಾಹುಲ್ ಶೆಟ್ಟಿ",
          subtitle: "ಮುಖ್ಯ ನಟ",
          summary: "ಉತ್ಸಾಹಭರಿತ ಅಭಿನಯ, ಕಟುಕ ಹಾಸ್ಯ ಟೈಮಿಂಗ್ ಮತ್ತು ಭಾವಪೂರ್ಣ ತಿರುವುಗಳೊಂದಿಗೆ ಗಮನಸೆಳೆಯುವ ಪಾತ್ರ.",
          image: "https://picsum.photos/seed/rahulshetty/400/560",
          votes: 188,
          accent: ["#a6e2ff", "#31567c"]
        },
        {
          id: "sahana-prakash",
          title: "ಸಾಹನಾ ಪ್ರಕಾಶ್",
          subtitle: "ಪೋಷಕ ಪಾತ್ರ",
          summary: "ಸಣ್ಣ ಕ್ಷಣಗಳಲ್ಲಿಯೇ ತೀವ್ರತೆ ಮತ್ತು ಉಷ್ಣತೆ ತಂದ, ನೆನಪಿನಲ್ಲಿ ಉಳಿಯುವ ಪೋಷಕ ಅಭಿನಯ.",
          image: "https://picsum.photos/seed/sahanaprakash/400/560",
          votes: 173,
          accent: ["#ffe4bf", "#734b2e"]
        }
      ]
    },
    {
      id: "audience-choice",
      label: "ವಿಭಾಗ",
      title: "ಜನಪ್ರಿಯ ಆಯ್ಕೆ",
      description: "ವಿಭಿನ್ನ ಪ್ರಕಾರಗಳಲ್ಲೂ ಹೆಚ್ಚಿನ ಪ್ರೇಕ್ಷಕ ಮೆಚ್ಚುಗೆ ಪಡೆದ ಚಿತ್ರವನ್ನು ಆರಿಸುವ ವಿಭಾಗ.",
      hint: "ಮತ ಚಲಾಯಿಸಿದ ನಂತರ ಮುಂದಿನ ವಿಭಾಗಕ್ಕೆ ಕೆಳಗೆ ಸ್ಕ್ರೋಲ್ ಮಾಡಿ.",
      nominees: [
        {
          id: "film-a",
          title: "ಕೊನೆಯ ರೀಲ್",
          subtitle: "ಉತ್ಸವ ಮೆಚ್ಚುಗೆ",
          summary: "ವೇಗ ಕಳೆದುಕೊಳ್ಳದೆ ಭಾವನಾತ್ಮಕ ಕ್ಷಣಗಳನ್ನು ತಲುಪಿಸುವ ಜನಮೆಚ್ಚಿನ ಪದರಗಳ ಕಥೆ.",
          image: "https://picsum.photos/seed/lastreel/400/560",
          votes: 236,
          accent: ["#ffd9a2", "#835a23"]
        },
        {
          id: "film-b",
          title: "ನಗರದ ನಾದ",
          subtitle: "ಸಂಗೀತ ನಾಟಕ",
          summary: "ಜೋರಾದ ಶಕ್ತಿ, ಪರಿಣಾಮಕಾರಿ ಸಂಗೀತ ಕ್ಷಣಗಳು ಮತ್ತು ಪಾಲಿಶ್ ಆದ ಅಂತ್ಯದೊಂದಿಗೆ ಪ್ರೇಕ್ಷಕರನ್ನು ಗೆದ್ದ ಚಿತ್ರ.",
          image: "https://picsum.photos/seed/cityparade/400/560",
          votes: 219,
          accent: ["#c2f4ff", "#2d6281"]
        },
        {
          id: "film-c",
          title: "ಮಳೆಯ ನಂತರ",
          subtitle: "ಕುಟುಂಬ ನಾಟಕ",
          summary: "ಪ್ರತಿ ಪಾತ್ರಕ್ಕೂ ಮೌಲ್ಯ ನೀಡುವ, ಮನಸಿಗೆ ಹತ್ತಿರವಾದ ಸರಳ ಮತ್ತು ಹೃದಯಸ್ಪರ್ಶಿ ಕಥನ.",
          image: "https://picsum.photos/seed/afterrain/400/560",
          votes: 201,
          accent: ["#ffe0c0", "#6f4c33"]
        }
      ]
    }
  ],
  nominationCategories: [
    makeNominationCategory("best-actor", "Best actor", "best-performance"),
    makeNominationCategory("best-actress", "Best actress", "best-performance"),
    makeNominationCategory("excellent-direction", "Excellent direction", "best-director"),
    makeNominationCategory("best-debut-direction", "Best debut direction"),
    makeNominationCategory("best-supporting-actor", "Best supporting actor"),
    makeNominationCategory("best-supporting-actress", "Best Supporting Actress"),
    makeNominationCategory("best-music-direction", "Best Music Direction"),
    makeNominationCategory("best-background-singer", "Best background singer"),
    makeNominationCategory("excellent-background-singer", "Excellent background singer"),
    makeNominationCategory("excellent-screenplay", "Excellent screenplay"),
    makeNominationCategory("excellent-song-lyrics", "Excellent song lyrics"),
    makeNominationCategory("excellent-compilation", "Excellent compilation"),
    makeNominationCategory("excellent-aduaya-eclipse", "Excellent aduaya eclipse"),
    makeNominationCategory("best-picture-of-the-year-2022", "Best Picture of the Year (2022)", "best-film"),
    makeNominationCategory("excellent-construction-design", "Excellent construction design"),
    makeNominationCategory("vfx-sfx-post-production-and-animation-excellence", "VFX,SFX, Post Production and Animation Excellence"),
    makeNominationCategory("excellent-soundtrack-and-sound-design", "Excellent soundtrack and sound design"),
    makeNominationCategory("best-picture-social-impact", "The best picture that has had a social impact"),
    makeNominationCategory("excellent-dance-direction", "Excellent dance direction")
  ],
  publicVoteCategoryIds: [
    "best-film",
    "best-director",
    "best-performance",
    "audience-choice"
  ],
  defaultStage: "pre-vote",
  eventDate: "2026-05-17",
  districts: [
    "Others",
    "Bagalkot",
    "Ballari",
    "Belagavi",
    "Bengaluru Rural",
    "Bengaluru Urban",
    "Bidar",
    "Chamarajanagar",
    "Chikkaballapur",
    "Chikkamagaluru",
    "Chitradurga",
    "Dakshina Kannada",
    "Davangere",
    "Dharwad",
    "Gadag",
    "Hassan",
    "Haveri",
    "Kalaburagi",
    "Kodagu",
    "Kolar",
    "Koppal",
    "Mandya",
    "Mysuru",
    "Raichur",
    "Ramanagara",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Uttara Kannada",
    "Vijayapura",
    "Vijayanagara",
    "Yadgir"
  ],
  winnerHighlights: [
    {
      id: "best-film",
      category: "Best Film",
      title: "Midnight Harbor",
      subtitle: "Public voting winner",
      summary: "The leading public vote in the best film category, surfaced as the headline result for the post-vote hero.",
      image: "https://picsum.photos/seed/midnight/400/560"
    },
    {
      id: "best-director",
      category: "Best Director",
      title: "Meera Iyer",
      subtitle: "Public voting winner",
      summary: "A sharp and disciplined directorial profile that takes the public category spotlight.",
      image: "https://picsum.photos/seed/meeraiyer/400/560"
    },
    {
      id: "best-performance",
      category: "Best Performance",
      title: "Niranjana",
      subtitle: "Public voting winner",
      summary: "The performance category leader, framed as one of the key post-vote highlight cards.",
      image: "https://picsum.photos/seed/niranjana/400/560"
    },
    {
      id: "audience-choice",
      category: "Audience Choice",
      title: "Last Reel",
      subtitle: "Public voting winner",
      summary: "The audience-led result card for the public voting group.",
      image: "https://picsum.photos/seed/lastreel/400/560"
    },
    {
      id: "jury-spotlight",
      category: "Jury Spotlight",
      title: "Special Recognition",
      subtitle: "Extended winners surface",
      summary: "A slot reserved for the additional winners page treatment beyond the four public voting categories.",
      image: "https://picsum.photos/seed/spotlight/400/560"
    },
    {
      id: "lifetime-honour",
      category: "Lifetime Honour",
      title: "Honorary Winner",
      subtitle: "Extended winners surface",
      summary: "A supporting winners tile so the post-vote page is not limited to the public ballot categories.",
      image: "https://picsum.photos/seed/honour/400/560"
    }
  ],
  popup: {
    title: "ಪ್ರಜಾವಾಣಿ ಸಿನಿ ಸಮ್ಮಾನ",
    description:
      "2026ರಲ್ಲಿ ಬಿಡುಗಡೆಯಾದ ಕನ್ನಡ ಚಲನಚಿತ್ರಗಳ ಶ್ರೇಷ್ಠ ಪ್ರತಿಭೆಗಳನ್ನು ಗುರುತಿಸುವ ಮೂರನೇ ಆವೃತ್ತಿಯ ವೇದಿಕೆ.",
    ctaLabel: "ಆಯ್ಕೆ ಪ್ರಕ್ರಿಯೆ ನೋಡಿ",
    ctaLink: "#/process"
  },
  sponsors: [
    {
      label: "Presenting Sponsor",
      imageUrl: "https://images.assettype.com/prajavani/2025-06-10/jifsfjno/caslogo.png",
      destination: "#/contest"
    },
    {
      label: "Powered By",
      imageUrl: "https://images.assettype.com/prajavani/2025-06-25/kvceh6g6/trends.png",
      destination: "#/process"
    },
    {
      label: "Special Partner",
      imageUrl: "https://images.assettype.com/prajavani/2025-06-25/zgfksb8d/shree-sai-gold-palace-logo.png",
      destination: "#/about"
    },
    {
      label: "Associate Sponsor",
      imageUrl: "https://images.assettype.com/prajavani/2025-06-10/1yiqcgi1/prestige.png",
      destination: "#/jury"
    },
    {
      label: "Associate Sponsor",
      imageUrl: "https://images.assettype.com/prajavani/2025-06-10/7vnztg6q/freedomlogo.png",
      destination: "#/previous-years"
    },
    {
      label: "Telecast Partner",
      imageUrl: "https://images.assettype.com/prajavani/2025-06-10/wz3lj1z6/zlogo.png",
      destination: "#/terms"
    }
  ],
  menuLinks: [
    { label: "ಪ್ರಸ್ತಾವನೆ", pageUrl: "#/about" },
    { label: "ತೀರ್ಪುಗಾರರು", pageUrl: "#/jury" },
    { label: "ಸಿನಿ ಕಾರ್ನರ್", pageUrl: "#/cine-corner" },
    { label: "ಹಿಂದಿನ ಆವೃತ್ತಿಗಳು", pageUrl: "#/previous-years" },
    { label: "ನಿಯಮಗಳು", pageUrl: "#/terms" }
  ],
  bottomNav: [
    { label: "ಮುಖಪುಟ", pageUrl: "#/", icon: "home" },
    { label: "ವೋಟಿಂಗ್", pageUrl: "#/voting", icon: "vote", emphasis: true },
    { label: "ಸ್ಪರ್ಧೆ", pageUrl: "#/contest", icon: "contest" },
    { label: "ಪ್ರಕ್ರಿಯೆ", pageUrl: "#/process", icon: "process" },
    { label: "ಮೆನು", pageUrl: "#menu", icon: "menu", menuTrigger: true }
  ],
  navigation: {
    "pre-vote": {
      desktop: [
        { label: "Home", pageUrl: "#/", icon: "home" },
        { label: "Contests", pageUrl: "#/contest", icon: "contest" },
        { label: "Photos", pageUrl: "#/", icon: "photo", scrollTarget: "home-photo-section" },
        { label: "Videos", pageUrl: "#/", icon: "video", scrollTarget: "home-video-section" },
        { label: "Process", pageUrl: "#/process", icon: "process" },
        { label: "About Us", pageUrl: "#/about", icon: "about" }
      ],
      mobile: [
        { label: "Home", pageUrl: "#/", icon: "home" },
        { label: "Contests", pageUrl: "#/contest", icon: "contest" },
        { label: "Photos", pageUrl: "#/", icon: "photo", scrollTarget: "home-photo-section" },
        { label: "Videos", pageUrl: "#/", icon: "video", scrollTarget: "home-video-section" },
        { label: "Menu", pageUrl: "#menu", icon: "menu", menuTrigger: true }
      ],
      menu: [
        { label: "Home", pageUrl: "#/", icon: "home" },
        { label: "Contests", pageUrl: "#/contest", icon: "contest" },
        { label: "Photos", pageUrl: "#/", icon: "photo", scrollTarget: "home-photo-section" },
        { label: "Videos", pageUrl: "#/", icon: "video", scrollTarget: "home-video-section" },
        { label: "Process", pageUrl: "#/process", icon: "process" },
        { label: "About Us", pageUrl: "#/about", icon: "about" },
        { label: "Jury", pageUrl: "#/jury", icon: "jury" },
        { label: "Cine Corner", pageUrl: "#/cine-corner", icon: "cineCorner" },
        makePreviousEditionsMenuItem(),
        { label: "Terms and Conditions", pageUrl: "#/terms", icon: "terms" }
      ]
    },
    "during-vote": {
      desktop: [
        { label: "Home", pageUrl: "#/", icon: "home" },
        { label: "Vote Now", pageUrl: "#/voting", icon: "vote", emphasis: true },
        { label: "Contests", pageUrl: "#/contest", icon: "contest" },
        { label: "Nominees", pageUrl: "#/nominations", icon: "nominees" },
        { label: "Photos", pageUrl: "#/", icon: "photo", scrollTarget: "home-photo-section" },
        { label: "Videos", pageUrl: "#/", icon: "video", scrollTarget: "home-video-section" },
        { label: "Process", pageUrl: "#/process", icon: "process" }
      ],
      mobile: [
        { label: "Home", pageUrl: "#/", icon: "home" },
        { label: "Vote Now", pageUrl: "#/voting", icon: "vote", emphasis: true },
        { label: "Contests", pageUrl: "#/contest", icon: "contest" },
        { label: "Nominees", pageUrl: "#/nominations", icon: "nominees" },
        { label: "Menu", pageUrl: "#menu", icon: "menu", menuTrigger: true }
      ],
      menu: [
        { label: "Home", pageUrl: "#/", icon: "home" },
        { label: "Vote Now", pageUrl: "#/voting", icon: "vote", emphasis: true },
        { label: "Contests", pageUrl: "#/contest", icon: "contest" },
        { label: "Nominees", pageUrl: "#/nominations", icon: "nominees" },
        { label: "Photos", pageUrl: "#/", icon: "photo", scrollTarget: "home-photo-section" },
        { label: "Videos", pageUrl: "#/", icon: "video", scrollTarget: "home-video-section" },
        { label: "Process", pageUrl: "#/process", icon: "process" },
        { label: "About Us", pageUrl: "#/about", icon: "about" },
        { label: "Jury", pageUrl: "#/jury", icon: "jury" },
        { label: "Cine Corner", pageUrl: "#/cine-corner", icon: "cineCorner" },
        makePreviousEditionsMenuItem(),
        { label: "Terms and Conditions", pageUrl: "#/terms", icon: "terms" }
      ]
    },
    "post-vote": {
      desktop: [
        { label: "Home", pageUrl: "#/", icon: "home" },
        { label: "Winners", pageUrl: "#/winners", icon: "winners", emphasis: true },
        { label: "Contests", pageUrl: "#/contest", icon: "contest" },
        { label: "Nominees", pageUrl: "#/nominations", icon: "nominees" },
        { label: "Photos", pageUrl: "#/", icon: "photo", scrollTarget: "home-photo-section" },
        { label: "Videos", pageUrl: "#/", icon: "video", scrollTarget: "home-video-section" },
        { label: "Process", pageUrl: "#/process", icon: "process" }
      ],
      mobile: [
        { label: "Home", pageUrl: "#/", icon: "home" },
        { label: "Winners", pageUrl: "#/winners", icon: "winners", emphasis: true },
        { label: "Photos", pageUrl: "#/", icon: "photo", scrollTarget: "home-photo-section" },
        { label: "Videos", pageUrl: "#/", icon: "video", scrollTarget: "home-video-section" },
        { label: "Menu", pageUrl: "#menu", icon: "menu", menuTrigger: true }
      ],
      menu: [
        { label: "Home", pageUrl: "#/", icon: "home" },
        { label: "Winners", pageUrl: "#/winners", icon: "winners", emphasis: true },
        { label: "Contests", pageUrl: "#/contest", icon: "contest" },
        { label: "Nominees", pageUrl: "#/nominations", icon: "nominees" },
        { label: "Photos", pageUrl: "#/", icon: "photo", scrollTarget: "home-photo-section" },
        { label: "Videos", pageUrl: "#/", icon: "video", scrollTarget: "home-video-section" },
        { label: "Process", pageUrl: "#/process", icon: "process" },
        { label: "About Us", pageUrl: "#/about", icon: "about" },
        { label: "Jury", pageUrl: "#/jury", icon: "jury" },
        { label: "Cine Corner", pageUrl: "#/cine-corner", icon: "cineCorner" },
        makePreviousEditionsMenuItem(),
        { label: "Terms and Conditions", pageUrl: "#/terms", icon: "terms" }
      ]
    }
  }
};
