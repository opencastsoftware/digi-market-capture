const osmosis = require("osmosis");

const base_url =
  "https://www.digitalmarketplace.service.gov.uk/digital-outcomes-and-specialists/opportunities";

function findOpportunitiesOnPage(url, dateFrom) {
  return new Promise((resolve) => {
    const opportunities = [];
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
      .data((x) => {
        if (x.publishedDate)
          x.publishedDate = Date.parse(x.publishedDate.match(/\d+ \w+ \d+/));
        if (x.questionsDeadlineDate)
          x.questionsDeadlineDate = Date.parse(
            x.questionsDeadlineDate.match(/\d+ \w+ \d+/)
          );
        if (x.closingDate)
          x.closingDate = Date.parse(x.closingDate.match(/\d+ \w+ \d+/));
        x.id = parseInt(x.link.match(/\d+/).pop());
        if (!x.publishedDate || x.publishedDate > dateFrom)
          opportunities.push(x);
      })
      .done(() => resolve(opportunities));
  });
}

async function findAllOpportunities() {
  const allOpportunities = [];
  const totalPages = await totalNumberOfPages();
  for (i = 4; i > 0; i--) {
    const opportunities = await findOpportunitiesOnPage(
      base_url + "?page=" + i,
      0
    );
    opportunities.map((x) => allOpportunities.push(x));
  }
  return allOpportunities;
}

//findAllOpportunities().then((opportunity) => console.log(opportunity));

function totalNumberOfPages() {
  return new Promise((resolve) => {
    let total;
    osmosis
      .get(base_url)
      .find('//*[@id="js-dm-live-search-results"]/nav/ul/li/a/span[3]')
      .set("total")
      .data((x) => {
        total = parseInt(x.total.match(/\d+ of (\d+)/).pop());
      })
      .done(() => resolve(total));
  });
}

const handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda and Github!"),
  };
  return response;
};

module.exports = {
  findOpportunitiesOnPage,
  findAllOpportunities,
  totalNumberOfPages,
  handler,
};

//totalNumberOfPages().then((total) => console.log(total));
