const osmosis = require("osmosis");

function findOpportunities() {
  return new Promise((resolve) => {
    let opportunities = [];
    osmosis
      .get(
        "https://www.digitalmarketplace.service.gov.uk/digital-outcomes-and-specialists/opportunities"
      )
      .find('//*[@id="js-dm-live-search-results"]/ul/li')
      .set({
        title: "h2/a",
        link: "h2/a@href",
        organisation: "ul[1]/li[1]/text()[normalize-space()]",
        location: "ul[1]/li[2]/text()[normalize-space()]",
        type: "ul[2]/li[1]",
        publishedDate: "ul[3]/li[1]",
        questionsDeadlineDate: "ul[3]/li[2]",
        closingDate: "ul[3]/li[3]",
      })
      .data(
        (x) =>
          (x.publishedDate = Date.parse(x.publishedDate.match(/\d+ \w+ \d+/)))
      )
      .data(
        (x) =>
          (x.questionsDeadlineDate = Date.parse(
            x.questionsDeadlineDate.match(/\d+ \w+ \d+/)
          ))
      )
      .data(
        (x) => (x.closingDate = Date.parse(x.closingDate.match(/\d+ \w+ \d+/)))
      )
      .data((x) => {
        opportunities.push(x);
      })
      .done(() => resolve(opportunities));
  });
}

// findOpportunities().then((opportunity) => console.log(opportunity));

module.exports = {
  findOpportunities,
};
