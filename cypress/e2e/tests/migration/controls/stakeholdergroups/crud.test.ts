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

import * as data from "../../../../../utils/data_utils";
import { exists, expandRowDetails, login, notExists } from "../../../../../utils/utils";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { stakeHoldersTable } from "../../../../views/stakeholders.view";

describe(["@tier2"], "Stakeholder group CRUD operations", () => {
    const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());

    before("Login", function () {
        login();
    });

    beforeEach("Interceptors", function () {
        // Interceptors
        cy.intercept("POST", "/hub/stakeholdergroups*").as("postStakeholdergroups");
        cy.intercept("GET", "/hub/stakeholdergroups*").as("getStakeholdergroups");
    });

    it("Stakeholder group CRUD", function () {
        const stakeholdergroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription()
        );
        // Create new stakeholder group
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        exists(stakeholdergroup.name);

        // Edit stakeholder group's name
        var updateStakeholdergroupName = data.getCompanyName();
        stakeholdergroup.edit({ name: updateStakeholdergroupName });
        cy.wait("@getStakeholdergroups");

        // Assert that stakeholder group name got edited
        exists(updateStakeholdergroupName);

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that newly created stakeholder group is deleted
        notExists(stakeholdergroup.name);
    });

    it("Stakeholder group CRUD with stakeholder member attached", function () {
        // Create stakeholder
        stakeholder.create();
        exists(stakeholder.email, stakeHoldersTable);
        var memberStakeholderName = stakeholder.name;

        // Create new object of stakeholder group with members
        const stakeholdergroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription(),
            [memberStakeholderName]
        );

        // Create new stakeholder group
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        exists(stakeholdergroup.name);

        // Check if stakeholder member is attached to stakeholder group
        expandRowDetails(stakeholdergroup.name);
        exists(memberStakeholderName);

        // Edit the current stakeholder group's name, description and member
        stakeholdergroup.edit({
            name: data.getCompanyName(),
            description: data.getDescription(),
            members: [memberStakeholderName],
        });
        cy.wait("@getStakeholdergroups");

        // Check if stakeholder group's member is removed
        expandRowDetails(stakeholdergroup.name);
        notExists(memberStakeholderName);

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that newly created stakeholder group is deleted
        notExists(stakeholdergroup.name);

        // Delete stakeholder
        stakeholder.delete();

        // Assert that created stakeholder is deleted
        notExists(stakeholder.email, stakeHoldersTable);
    });
});
