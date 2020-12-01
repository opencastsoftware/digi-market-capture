const oppFinder = require("./index");
const nock = require("nock");
const fs = require("fs");
const { join } = require("path");

describe("Find latest opportunites", () => {
  const dateFrom = 1606435199000; //26 November 2020 23:59:59
  let data;
  beforeEach(async () => {
    const fixture = fs
      .readFileSync(join(__dirname, "fixtures/test.html"), "utf-8")
      .toString();

    nock("https://www.digitalmarketplace.service.gov.uk")
      .get("/digital-outcomes-and-specialists/opportunities")
      .reply(200, fixture);

    data = await oppFinder.findLatestOpportunities(dateFrom);
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
