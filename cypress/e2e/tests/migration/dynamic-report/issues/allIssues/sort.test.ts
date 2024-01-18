import { Analysis } from "../../../../../models/migration/applicationinventory/analysis";
import {
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validateSortBy,
} from "../../../../../../utils/utils";
import { SEC } from "../../../../../types/constants";
import { Issues } from "../../../../../models/migration/dynamic-report/issues/issues";

describe(["@tier2"], "Issues sort validations", function () {
    let applicationsList: Array<Analysis> = [];
    let application: Analysis;

    before("Load data, create Analysis instance and run analysis", function () {
        login();
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it(
        ["@tier2"],
        "BUG MTA-2067 - Source Analysis on daytrader app and its issues sorting validation",
        function () {
            // Create Analysis instance in before hook
            application = new Analysis(
                getRandomApplicationData("daytrader-app", {
                    sourceData: this.appData["daytrader-app"],
                }),
                getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
            );
            application.create();
            applicationsList.push(application);
            cy.wait("@getApplication");
            application.analyze();
            cy.wait(2 * SEC);
            application.verifyAnalysisStatus("Completed");
            Issues.openList(10);
            validateSortBy("Issue");
        }
    );

    after("Perform test data clean up", function () {
        Analysis.open(true);
        deleteByList(applicationsList);
    });
});