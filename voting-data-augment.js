(function () {
  var siteData = window.CINE_SITE_DATA;
  if (!siteData || !siteData.votingCategories) {
    return;
  }

  var suffixes = [
    "Encore",
    "Midnight Cut",
    "Audience Pick",
    "Final Cut",
    "Festival Edit",
    "Gold Reel",
    "Studio Pick",
    "Extended Cut",
    "Spotlight"
  ];

  siteData.votingCategories = siteData.votingCategories.map(function (category) {
    var seed = category.nominees.slice();
    var nominees = seed.slice();

    suffixes.forEach(function (suffix, index) {
      var source = seed[index % seed.length];
      nominees.push({
        id: category.id + "-" + String(index + 4) + "-" + suffix.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: source.title + " " + suffix,
        subtitle: source.subtitle,
        summary: source.summary + " Demo variant " + String(index + 4) + " for carousel testing.",
        votes: source.votes + (index + 1) * 7,
        accent: source.accent
      });
    });

    return Object.assign({}, category, {
      nominees: nominees
    });
  });
})();
