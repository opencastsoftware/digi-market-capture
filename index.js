const osmosis = require("osmosis");
const AWS = require("aws-sdk");
AWS.config.update({ region: "eu-west-2" });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const base_url =
  "https://www.digitalmarketplace.service.gov.uk/digital-outcomes-and-specialists/opportunities";

function findOpportunitiesOnPage(url, dateFrom) {
  console.log(
    "finding opportunities [url: " + url + " dateFrom: " + dateFrom + "]"
  );
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
        console.log(x);
      })
      .done(() => resolve(opportunities));
  });
}

async function findAllOpportunities() {
  const allOpportunities = [];
  const totalPages = await totalNumberOfPages();
  for (let i = totalPages; i > 0; i--) {
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

function convertDataToMessage(data) {
  return {
    DelaySeconds: 10,
    MessageAttributes: {
      Title: {
        DataType: "String",
        StringValue: data.title,
      },
      Link: {
        DataType: "String",
        StringValue: data.link,
      },
      Organisation: {
        DataType: "String",
        StringValue: data.organisation,
      },
      Location: {
        DataType: "String",
        StringValue: data.location,
      },
      Type: {
        DataType: "String",
        StringValue: data.type,
      },
      ID: {
        DataType: "Number",
        StringValue: data.id,
      },
      PublishedDate: {
        DataType: "Number",
        StringValue: data.publishedDate.toString(),
      },
      QuestionsDeadlineDate: {
        DataType: "Number",
        StringValue: data.questionsDeadlineDate.toString(),
      },
      ClosingDate: {
        DataType: "Number",
        StringValue: data.closingDate.toString(),
      },
    },
    MessageBody: data.title,
    QueueUrl: process.env.SQS_QUEUE_URL.toString(),
  };
}

const handler = async (event) => {
  const yesterday = Date.now() - 86400000;
  console.log("finding opportunities from last 24 hours: " + yesterday);
  const opps = findOpportunitiesOnPage(base_url, yesterday);
  opps.then((x) =>
    x.map((opp) => {
      const message = convertDataToMessage(opp);
      sqs.sendMessage(message, function (err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data.MessageId);
        }
      });
    })
  );
  const response = {
    statusCode: 201,
    body: JSON.stringify("Finding the new opportunities!"),
  };
  return response;
};

module.exports = {
  findOpportunitiesOnPage,
  findAllOpportunities,
  totalNumberOfPages,
  convertDataToMessage,
  handler,
  sqs,
};

//totalNumberOfPages().then((total) => console.log(total));
