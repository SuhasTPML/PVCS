(function () {
  var siteData = window.CINE_SITE_DATA;
  if (!siteData || !siteData.votingCategories) {
    return;
  }

  var suffixes = [
    "ವಿಶೇಷ ಆವೃತ್ತಿ",
    "ರಾತ್ರಿ ಕಟ್",
    "ಜನರ ಆಯ್ಕೆ",
    "ಅಂತಿಮ ಕಟ್",
    "ಉತ್ಸವ ಆವೃತ್ತಿ",
    "ಸುವರ್ಣ ರೀಲ್",
    "ಸ್ಟುಡಿಯೋ ಆಯ್ಕೆ",
    "ವಿಸ್ತೃತ ಆವೃತ್ತಿ",
    "ವಿಶೇಷ ಬೆಳಕು"
  ];

  siteData.votingCategories = siteData.votingCategories.map(function (category) {
    var seed = category.nominees.slice();
    var nominees = seed.slice();

    suffixes.forEach(function (suffix, index) {
      var source = seed[index % seed.length];
      nominees.push({
        id: category.id + "-" + String(index + 4),
        title: source.title + " " + suffix,
        subtitle: source.subtitle,
        summary: source.summary + " ಕಾರುಸೆಲ್ ಪರೀಕ್ಷೆಗೆ ರೂಪಾಂತರ " + String(index + 4) + ".",
        votes: source.votes + (index + 1) * 7,
        accent: source.accent
      });
    });

    return Object.assign({}, category, {
      nominees: nominees
    });
  });
})();
