const oppFinder = require("./index");
const nock = require("nock");
const fs = require("fs");
const { join } = require("path");
const { data } = require("osmosis");

describe("Find latest opportunites", () => {
  const dateFrom = 1606435199000; //26 November 2020 23:59:59
  const url =
    "https://www.digitalmarketplace.service.gov.uk/digital-outcomes-and-specialists/opportunities";
  let data;
  beforeEach(async () => {
    const fixture = fs
      .readFileSync(join(__dirname, "fixtures/test.page1.html"), "utf-8")
      .toString();

    nock("https://www.digitalmarketplace.service.gov.uk")
      .get("/digital-outcomes-and-specialists/opportunities")
      .reply(200, fixture);

    data = await oppFinder.findOpportunitiesOnPage(url, dateFrom);
  });

  it("should gather the opportunities from the page", () => {
    expect(data.length).not.toEqual(0);
  });

  it("should set the title", () => {
    expect(data[0].title).toEqual(
      "UK SBS DDaT20358 UKRI Website Content Transition"
    );
  });

  it("should set the id", () => {
    expect(data[0].id).toEqual(13608);
  });

  it("should set the link", () => {
    expect(data[0].link).toEqual(
      "/digital-outcomes-and-specialists/opportunities/13608"
    );
  });

  it("should set the organisation", () => {
    expect(data[0].organisation).toEqual("UK Research and Innovation (UKRI)");
  });

  it("should set the location", () => {
    expect(data[0].location).toEqual("South West England");
  });

  it("should set the type", () => {
    expect(data[0].type).toEqual("Digital outcomes");
  });

  it("should set the published date timestamp", () => {
    expect(data[0].publishedDate).toEqual(1606694400000);
  });

  it("should set the questions deadline date", () => {
    expect(data[0].questionsDeadlineDate).toEqual(1607299200000);
  });

  it("should set the closing date", () => {
    expect(data[0].closingDate).toEqual(1607904000000);
  });

  it("should not return opportunities we've already seen", () => {
    expect(data.length).toEqual(4);
  });
});

describe("Find total pages of opportunites", () => {
  it("should return the number of pages of opportunities", async () => {
    const fixture = fs
      .readFileSync(join(__dirname, "fixtures/test.page1.html"), "utf-8")
      .toString();
    nock("https://www.digitalmarketplace.service.gov.uk")
      .get("/digital-outcomes-and-specialists/opportunities")
      .reply(200, fixture);

    const total = await oppFinder.totalNumberOfPages();
    expect(total).toEqual(4);
  });
});

describe("Find all opportunites", () => {
  it("should find all the opportunites", async () => {
    const page1 = fs
      .readFileSync(join(__dirname, "fixtures/test.page1.html"), "utf-8")
      .toString();
    const page2 = fs
      .readFileSync(join(__dirname, "fixtures/test.page2.html"), "utf-8")
      .toString();
    const page3 = fs
      .readFileSync(join(__dirname, "fixtures/test.page3.html"), "utf-8")
      .toString();
    const page4 = fs
      .readFileSync(join(__dirname, "fixtures/test.page4.html"), "utf-8")
      .toString();

    nock("https://www.digitalmarketplace.service.gov.uk")
      .get("/digital-outcomes-and-specialists/opportunities?page=1")
      .reply(200, page1);

    nock("https://www.digitalmarketplace.service.gov.uk")
      .get("/digital-outcomes-and-specialists/opportunities?page=2")
      .reply(200, page2);

    nock("https://www.digitalmarketplace.service.gov.uk")
      .get("/digital-outcomes-and-specialists/opportunities?page=3")
      .reply(200, page3);

    nock("https://www.digitalmarketplace.service.gov.uk")
      .get("/digital-outcomes-and-specialists/opportunities?page=4")
      .reply(200, page4);

    const data = await oppFinder.findAllOpportunities();
    expect(data.length).toEqual(117);
  });
});

describe("lamdba handler", () => {
  it("should return a status of 200", async () => {
    const response = await oppFinder.handler({});
    expect(response.statusCode).toEqual(200);
  });
});
