/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />

import { Analysis } from "../../../../../models/migration/applicationinventory/analysis";
import {
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validatePagination,
} from "../../../../../../utils/utils";
import { SEC } from "../../../../../types/constants";
import { Issues } from "../../../../../models/migration/dynamic-report/issues/issues";

describe(["@tier3"], "Single application issues pagination validation", function () {
    let application: Analysis;
    before("Load data", function () {
        login();
        cy.fixture("application")
            .then(function (appData) {
                this.appData = appData;
            })
            .then(function () {
                cy.fixture("analysis").then(function (analysisData) {
                    this.analysisData = analysisData;
                });
            })
            .then(function () {
                application = new Analysis(
                    getRandomApplicationData("daytrader-app", {
                        sourceData: this.appData["daytrader-app"],
                    }),
                    getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
                );
                application.create();
                application.analyze();
                cy.wait(2 * SEC);
                application.verifyAnalysisStatus("Completed");
            });
    });

    it("Pagination validation", function () {
        Issues.openSingleApplication(application.name);
        validatePagination();
    });

    after("Clean up", function () {
        application.delete();
    });
});
