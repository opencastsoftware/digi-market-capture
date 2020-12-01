const osmosis = require("osmosis");

const base_url =
  "https://www.digitalmarketplace.service.gov.uk/digital-outcomes-and-specialists/opportunities";

function findLatestOpportunities(url, dateFrom) {
  return new Promise((resolve) => {
    let opportunities = [];
    osmosis
      .get(url)
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
      .data((x) => (x.id = parseInt(x.link.match(/\d+/).pop())))
      .data((x) => {
        if (x.publishedDate > dateFrom) opportunities.push(x);
      })
      .done(() => resolve(opportunities));
  });
}

async function findAllOpportunities() {
  let findAllOpportunities = [];
  var totlPages = totalNumberOfPages();
  for (i = totalNumberOfPages; i > 0; i--) {
    findAllOpportunities.push(
      findLatestOpportunities(base_url + "/?page=" + i)
    );
  }
}

// findOpportunities().then((opportunity) => console.log(opportunity));

function totalNumberOfPages() {
  return new Promise((resolve) => {
    let total;
    osmosis
      .get(base_url)
      .find('//*[@id="js-dm-live-search-results"]/nav/ul/li/a/span[3]')
      .set("total")
      .data((x) => {
        console.log("****HELLO*****");
        total = parseInt(x.total.match(/\d+ of (\d+)/).pop());
      })
      .done(() => resolve(total));
  });
}

module.exports = {
  findLatestOpportunities,
  findAllOpportunities,
  totalNumberOfPages,
};

//totalNumberOfPages().then((total) => console.log(total));
