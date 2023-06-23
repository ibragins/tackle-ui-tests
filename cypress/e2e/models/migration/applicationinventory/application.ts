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
import {
    applicationInventory,
    tdTag,
    trTag,
    button,
    createNewButton,
    deleteAction,
    assessment,
    tagCount,
    assessAppButton,
    createAppButton,
    SEC,
    analysis,
    analyzeButton,
    reviewAppButton,
    migration,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    applicationNameInput,
    applicationDescriptionInput,
    applicationBusinessServiceSelect,
    applicationTagsSelect,
    applicationCommentInput,
    applicationTag,
    closeDetailsPage,
    editButton,
    selectBox,
    sourceRepository,
    branch,
    rootPath,
    group,
    artifact,
    version,
    packaging,
    kebabMenu,
    repoTypeSelect,
} from "../../../views/applicationinventory.view";
import * as commonView from "../../../views/common.view";
import {
    clickByText,
    inputText,
    click,
    submitForm,
    cancelForm,
    selectFormItems,
    checkSuccessAlert,
    performRowActionByIcon,
    selectUserPerspective,
    selectItemsPerPage,
    doesExistSelector,
    doesExistText,
    clickTab,
} from "../../../../utils/utils";
import { applicationData, RbacValidationRules } from "../../../types/types";
import { rightSideMenu, sourceDropdown } from "../../../views/analysis.view";

export class Application {
    name: string;
    business?: string;
    description?: string;
    tags?: Array<string>;
    comment?: string;
    analysis?: boolean;
    repoType?: string;
    sourceRepo?: string;
    branch?: string;
    rootPath?: string;
    group?: string;
    artifact?: string;
    version?: string;
    packaging?: string;

    constructor(appData: applicationData) {
        this.init(appData);
    }

    protected init(appData: applicationData) {
        const {
            name,
            business,
            description,
            tags,
            comment,
            analysis,
            repoType,
            sourceRepo,
            branch,
            rootPath,
            group,
            artifact,
            version,
            packaging,
        } = appData;
        this.name = name;
        if (business) this.business = business;
        if (description) this.description = description;
        if (comment) this.comment = comment;
        if (tags) this.tags = tags;
        if (analysis) this.analysis = analysis;
        if (repoType) this.repoType = repoType;
        if (sourceRepo) this.sourceRepo = sourceRepo;
        if (branch) this.branch = branch;
        if (rootPath) this.rootPath = rootPath;
        if (group) this.group = group;
        if (artifact) this.artifact = artifact;
        if (version) this.version = version;
        if (packaging) this.packaging = packaging;
    }

    //Navigate to the Application inventory
    public static open(): void {
        selectUserPerspective(migration);
        clickByText(navMenu, applicationInventory);
        clickByText(navTab, assessment);
    }

    protected fillName(name: string): void {
        inputText(applicationNameInput, name);
    }

    protected fillDescription(description: string): void {
        inputText(applicationDescriptionInput, description);
    }

    protected fillComment(comment: string): void {
        inputText(applicationCommentInput, comment);
    }

    protected selectBusinessService(service: string): void {
        selectFormItems(applicationBusinessServiceSelect, service);
    }

    protected selectTags(tags: Array<string>): void {
        tags.forEach(function (tag) {
            selectFormItems(applicationTagsSelect, tag);
        });
    }

    protected selectRepoType(repoType: string): void {
        selectFormItems(repoTypeSelect, repoType);
    }

    protected fillSourceModeFields(): void {
        //Fields relevant to source code analysis
        clickByText(button, "Source code");
        if (this.repoType) this.selectRepoType(this.repoType);
        inputText(sourceRepository, this.sourceRepo);
        if (this.branch) inputText(branch, this.branch);
        if (this.rootPath) inputText(rootPath, this.rootPath);
    }

    protected fillBinaryModeFields(): void {
        //Fields relevant to binary mode analysis
        clickByText(button, "Binary");
        inputText(group, this.group);
        if (this.artifact) inputText(artifact, this.artifact);
        if (this.version) inputText(version, this.version);
        if (this.packaging) inputText(packaging, this.packaging);
    }

    create(cancel = false): void {
        cy.contains("button", createNewButton, { timeout: 20000 }).should("be.enabled").click();
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            if (this.business) this.selectBusinessService(this.business);
            if (this.description) this.fillDescription(this.description);
            if (this.comment) this.fillComment(this.comment);
            if (this.tags) this.selectTags(this.tags);
            if (this.sourceRepo) this.fillSourceModeFields();
            if (this.group) this.fillBinaryModeFields();
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `application ${this.name} was successfully saved.`
            );
        }
    }

    edit(
        updatedValues: {
            name?: string;
            description?: string;
            business?: string;
            tags?: Array<string>;
            comment?: string;
            repoType?: string;
        },
        cancel = false
    ): void {
        cy.wait(2000);
        performRowActionByIcon(this.name, editButton);

        if (cancel) {
            cancelForm();
        } else {
            if (updatedValues.name && updatedValues.name != this.name) {
                this.fillName(updatedValues.name);
                this.name = updatedValues.name;
            }
            if (updatedValues.description && updatedValues.description != this.description) {
                this.fillDescription(updatedValues.description);
                this.description = updatedValues.description;
            }
            if (updatedValues.business && updatedValues.business != this.business) {
                this.selectBusinessService(updatedValues.business);
                this.business = updatedValues.business;
            }
            if (updatedValues.tags && updatedValues.tags != this.tags) {
                this.selectTags(updatedValues.tags);
                this.tags = updatedValues.tags;
            }
            if (updatedValues.comment && updatedValues.comment != this.comment) {
                this.fillComment(updatedValues.comment);
                this.comment = updatedValues.comment;
            }
            if (updatedValues.repoType && updatedValues.repoType != this.repoType) {
                this.selectRepoType(updatedValues.repoType);
                this.repoType = updatedValues.repoType;
            }
            if (updatedValues) {
                submitForm();
            }
        }
    }

    removeBusinessService(): void {
        cy.wait(2000);
        performRowActionByIcon(this.name, editButton);
        cy.get(applicationBusinessServiceSelect)
            .parent("div")
            .next("button")
            .then(($a) => {
                if ($a.hasClass("pf-c-select__toggle-clear")) $a.click();
            });
        submitForm();
    }

    delete(cancel = false): void {
        cy.wait(2000);
        performRowActionByIcon(this.name, kebabMenu);
        clickByText(button, deleteAction);
        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
            cy.wait(2000);
        }
    }

    selectApplication(): void {
        cy.wait(4000);
        cy.get(tdTag)
            .contains(this.name)
            // .parent(tdTag)
            .closest(trTag)
            .within(() => {
                click(selectBox);
                cy.wait(2000);
            });
    }

    getColumnText(columnSelector, columnText: string): void {
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                cy.get(columnSelector).find("span").should("contain", columnText);
            });
    }

    applicationDetailsTab(tab: string): void {
        // Navigate to the application details page and click desired tab
        this.selectApplicationRow();
        cy.get(rightSideMenu).within(() => {
            clickTab(tab);
        });
    }

    closeApplicationDetails(): void {
        // closes application details page
        click(closeDetailsPage);
    }

    selectApplicationRow(): void {
        cy.get(tdTag, { timeout: 10 * SEC })
            .contains(this.name)
            .closest(trTag)
            .click();
    }

    tagAndCategoryExists(tags: string | string[][]): void {
        // Verify that tags and categories are present on Application details -> Tags page
        this.applicationDetailsTab("Tags");
        if (Array.isArray(tags)) {
            // For Tags and Categories
            for (var tagIndex = 0; tagIndex < tags.length; tagIndex++) {
                cy.get(applicationTag, { timeout: 10 * SEC }).should("contain", tags[tagIndex][1]);
                cy.get("div[class='pf-c-content'] > h4").should("contain", tags[tagIndex][0]);
            }
        }
        // For Tags
        else cy.get(applicationTag).should("contain", tags);
        this.closeApplicationDetails();
    }

    static validateAssessButton(rbacRules: RbacValidationRules) {
        Application.open();
        doesExistSelector(assessAppButton, rbacRules["Assess"]);
    }

    static validateReviewButton(rbacRules: RbacValidationRules) {
        Application.open();
        doesExistSelector(reviewAppButton, rbacRules["Review"]);
    }

    static validateCreateAppButton(rbacRules: RbacValidationRules) {
        Application.open();
        doesExistSelector(createAppButton, rbacRules["Create new"]);
    }

    validateAnalysisAvailableActions(rbacRules: RbacValidationRules): void {
        Application.open();
        clickByText(navTab, analysis);
        selectItemsPerPage(100);
        cy.wait(5 * SEC);
        cy.get(tdTag)
            .contains(this.name)
            .closest(trTag)
            .within(() => {
                click(selectBox);
                cy.wait(SEC);
                click('button[aria-label="Actions"]');
                doesExistText(
                    "Analysis details",
                    rbacRules["analysis applicable options"]["Analysis details"]
                );
                doesExistText(
                    "Cancel analysis",
                    rbacRules["analysis applicable options"]["Cancel analysis"]
                );
                doesExistText(
                    "Manage credentials",
                    rbacRules["analysis applicable options"]["Manage credentials"]
                );
                doesExistText("Delete", rbacRules["analysis applicable options"]["Delete"]);
            });
    }

    validateAssessmentAvailableOptions(rbacRules: RbacValidationRules): void {
        Application.open();
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(this.name)
            .closest(trTag)
            .within(() => {
                click(selectBox);
                cy.wait(SEC);
                click('button[aria-label="Actions"]');
                doesExistText(
                    "Discard assessment",
                    rbacRules["assessment applicable options"]["Discard assessment"]
                );
                doesExistText(
                    "Copy assessment",
                    rbacRules["assessment applicable options"]["Copy assessment"]
                );
                doesExistText(
                    "Manage dependencies",
                    rbacRules["assessment applicable options"]["Manage dependencies"]
                );
            });
    }
    validateUploadBinary(rbacRules: RbacValidationRules): void {
        Application.open();
        clickByText(button, analysis);
        selectItemsPerPage(100);
        this.selectApplication();
        cy.contains("button", analyzeButton, { timeout: 20 * SEC })
            .should("be.enabled")
            .click();
        cy.get(sourceDropdown).click();
        doesExistText("Upload a local binary", rbacRules["Upload binary"]);
        clickByText(button, "Cancel");
    }
}