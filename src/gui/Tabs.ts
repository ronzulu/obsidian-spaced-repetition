/*
 * 'Shell commands' plugin for Obsidian.
 * Copyright (C) 2021 - 2023 Jarkko Linnanvirta
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.0 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * Contact the author (Jarkko Linnanvirta): https://github.com/Taitava/
 */

import { setIcon } from "obsidian";

export interface TabDefinition {
    title: string;
    icon: string;
    content_generator: (container_element: HTMLElement) => Promise<void>;
}

export interface TabDefinitionList {
    [key: string]: TabDefinition;
}

interface TabInstance {
    tabDefinition: TabDefinition;
    contentContainer: HTMLElement;
    button: HTMLButtonElement;
}

export class TabPosition {
    
}

export class TabStrip {
    containerEl: HTMLElement;
    header: HTMLElement;
    activeTabId: string;
    tabInstanceMap: Map<string, TabInstance>;
    makeTabsEqualsSize: boolean;

    init(
        containerElement: HTMLElement,
        tabDefinitionList: TabDefinitionList,
        activateTabId: string,
    ) {
        this.containerEl = containerElement;
        this.header = containerElement.createEl("div", { attr: { class: "sr-tab-header" } });
        this.activeTabId = Object.keys(tabDefinitionList)[0] as string; // Indicate that the first tab is active. This does not affect what tab is active in practise, it just reports the active tab.
        this.tabInstanceMap = new Map<string, TabInstance>;

        for (const tabId in tabDefinitionList) {
            const tabDefinition = tabDefinitionList[tabId];

            // Create button in the header element
            const button: HTMLButtonElement = this.createButton(this.header,  tabId, tabDefinition)

            // Create content container
            const contentContainer = containerElement.createDiv("sr-tab-content");
            contentContainer.setAttribute("data-tab-id", tabId);

            // Generate content
            tabDefinition.content_generator(contentContainer);

            const tabInstance: TabInstance = {
                button, contentContainer, tabDefinition
            };
            this.tabInstanceMap.set(tabId, tabInstance);
        }

        // Open a tab
        this.tabInstanceMap.get(activateTabId).button.click();
    }

    private createButton(headerEl: HTMLElement, tabId: string, tabDefinition: TabDefinition): HTMLButtonElement {
        const button: HTMLButtonElement = headerEl.createEl("button");
        button.addClass("sr-tab-header-button");
        button.setAttribute("data-tab-id", tabId);
        button.addEventListener("click", (e) => {
            // const tab_button = this as HTMLElement; // Use 'this' instead of event.target because this way we'll always get a button element, not an element inside the  button (i.e. an icon).

            this.handleTabButtonClick(button);
                
            // Do nothing else (I don't know if this is needed or not)
            e.preventDefault();

        });
        if (tabDefinition.icon) setIcon(button, tabDefinition.icon);

        button.insertAdjacentText("beforeend", " " + tabDefinition.title);
        return button;
    }

    private handleTabButtonClick(tabButton: HTMLElement) {
        const tabId = this.getTabIdForButton(tabButton);
        const tabInstance = this.tabInstanceMap.get(tabId);

        // Do not get all tab contents that exist, because there might be multiple tab systems open at the same time.
        this.deactivateAllButtons();
        this.deactivateAllTabContents();

        // Activate the clicked tab
        tabButton.addClass("sr-tab-active");
        tabInstance.contentContainer.addClass("sr-tab-active");
        this.activeTabId = tabId;

        // Focus an element (if a focusable element is present)
        tabInstance.contentContainer.find(".sr-focus-element-on-tab-opening")?.focus(); // ? = If not found, do nothing.
    };

    private deactivateAllButtons() {
        // Remove active status from all buttons within this tab strip
        const tabButtonsList: HTMLElement[] = this.header.findAll(".sr-tab-header-button");
        for (const index in tabButtonsList) {
            const tabButton = tabButtonsList[index];
            tabButton.removeClass("sr-tab-active");
        }
    }

    private deactivateAllTabContents() {
        const tabContents: HTMLElement[] = this.containerEl.findAll("div.sr-tab-content");
        for (const index in tabContents) {
            const tabContent = tabContents[index];
            tabContent.removeClass("sr-tab-active");
        }
    }

    private getTabIdForButton(tabButton: HTMLElement): string {
        const tabIdAttribute: Attr | null =
            tabButton.attributes.getNamedItem("data-tab-id");
        if (null === tabIdAttribute) {
            throw new Error("Tab button has no 'data-tab-id' HTML attribute! Murr!");
        }
        return tabIdAttribute.value;
    }
}
