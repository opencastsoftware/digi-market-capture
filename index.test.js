const oppFinder = require("./index");
const nock = require("nock");
const fs = require("fs");
const { join } = require("path");

describe("Find opportunites", () => {
  beforeEach(() => {
    const fixture = fs
      .readFileSync(join(__dirname, "fixtures/test.html"), "utf-8")
      .toString();

    nock("https://www.digitalmarketplace.service.gov.uk")
      .get("/digital-outcomes-and-specialists/opportunities")
      .reply(200, fixture);
  });

  it("should gather the opportunities from the page", async () => {
    const data = await oppFinder.findOpportunities();
    expect(data.length).not.toEqual(0);
  });

  it("should set the title", async () => {
    const data = await oppFinder.findOpportunities();
    expect(data[0].title).toEqual(
      "UK SBS DDaT20358 UKRI Website Content Transition"
    );
  });

  it("should set the link", async () => {
    const data = await oppFinder.findOpportunities();
    expect(data[0].link).toEqual(
      "/digital-outcomes-and-specialists/opportunities/13608"
    );
  });

  it("should set the organisation", async () => {
    const data = await oppFinder.findOpportunities();
    expect(data[0].organisation).toEqual("UK Research and Innovation (UKRI)");
  });

  it("should set the location", async () => {
    const data = await oppFinder.findOpportunities();
    expect(data[0].location).toEqual("South West England");
  });

  it("should set the type", async () => {
    const data = await oppFinder.findOpportunities();
    expect(data[0].type).toEqual("Digital outcomes");
  });

  it("should set the published date timestamp", async () => {
    const data = await oppFinder.findOpportunities();
    expect(data[0].publishedDate).toEqual(1606694400000);
  });

  it("should set the questions deadline date", async () => {
    const data = await oppFinder.findOpportunities();
    expect(data[0].questionsDeadlineDate).toEqual(1607299200000);
  });

  it("should set the closing date", async () => {
    const data = await oppFinder.findOpportunities();
    expect(data[0].closingDate).toEqual(1607904000000);
  });
});
