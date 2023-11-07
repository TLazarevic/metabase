import { WRITABLE_DB_ID } from "e2e/support/cypress_data";
import {
  restore,
  startNewQuestion,
  enterCustomColumnDetails,
  visualize,
  popover,
  resetTestTable,
  setupWritableDB,
  addPostgresDatabase,
  addMySQLDatabase,
} from "e2e/support/helpers";

["postgres", "mysql"].forEach(dialect => {
  describe(`issue 27745 (${dialect})`, { tags: "@external" }, () => {
    const tableName = "colors27745";

    before(() => {
      restore("default");
      cy.signInAsAdmin();

      setupWritableDB(dialect);

      if (dialect === "postgres") {
        addPostgresDatabase("Writable Postgres12", true);
      } else {
        addMySQLDatabase("Writable MySQL8", true);
      }
    });

    beforeEach(() => {
      resetTestTable({ type: dialect, table: tableName });
      cy.request("POST", `/api/database/${WRITABLE_DB_ID}/sync_schema`);
    });

    it("should display all summarize options if the only numeric field is a custom column (metabase#27745)", () => {
      startNewQuestion();
      cy.findByPlaceholderText(/Search for some data/).type("colors");
      popover()
        .findByRole("heading", { name: /colors/i })
        .click();
      cy.icon("add_data").click();
      enterCustomColumnDetails({
        formula: "case([ID] > 1, 25, 5)",
        name: "Numeric",
      });
      cy.button("Done").click();

      visualize();

      cy.findAllByTestId("header-cell").contains("Numeric").click();
      popover().findByText(/^Sum$/).click();

      cy.wait("@dataset");
      cy.get(".ScalarValue").invoke("text").should("eq", "55");

      cy.findByTestId("sidebar-right")
        .should("be.visible")
        .within(() => {
          cy.findByTestId("aggregation-item").should(
            "contain",
            "Sum of Numeric",
          );
        });
    });
  });
});
