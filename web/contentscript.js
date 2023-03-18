const filterBtnEmptySelector = "#asana_main_page > div.ProjectPage > div.ProjectPage-board > div > div > div > div.FullWidthPageStructureWithDetailsOverlay-mainContent > div.Board > div.PageToolbarStructure.PageToolbarStructure--medium.ProjectBoardPageToolbar.Board-pageToolbar > div.PageToolbarStructure-leftChildren > div:nth-child(1)";
const filterBtnSelector = "div.ThemeableRectangularButtonPresentation--isEnabled.ThemeableRectangularButtonPresentation.ThemeableRectangularButtonPresentation--medium.SubtleToggleButton--isPressed.SubtleToggleButton--standardTheme.SubtleToggleButton";
const addFilterDropdownBtnSelector = "div.ThemeableRectangularButtonPresentation--isEnabled.ThemeableRectangularButtonPresentation.ThemeableRectangularButtonPresentation--medium.SubtleButton--standardTheme.SubtleButton.AddItemButton-button";
const addFilterDropdownListSelector = "div.Scrollable--withCompositingLayer.Scrollable.Scrollable--vertical.MenuPresentation-scrollable";
const applicationsDropdownBtnSelector = "div.CustomPropertyEnumOptionsMultiPickerInput-option--empty.CustomPropertyEnumOptionsMultiPickerInput-label";
const applicationsDropdownListSelector = "div.Menu.CustomPropertyEnumOptionsMultiPickerInput-dropdownMenu";
const applyFilterBtnSelector = "div.ThemeableRectangularButtonPresentation--isEnabled.ThemeableRectangularButtonPresentation.ThemeableRectangularButtonPresentation--large.PrimaryButton--standardTheme.PrimaryButton.MultiSortFilterFooter-applyButton";

const clearApplitcationsFilterBtnSelector = "body > div:nth-child(20) > div > div > div.FocusTrap > div > div > div > div.DynamicBorderScrollable.MultiSortFilterDialog-scrollable > div > div > div.FormRowStructure--labelPlacementTop.FormRowStructure.MultiFilterMenuContentsRow.CustomPropertyMultiEnumFilter.MultiFilterMenuContents-filterRow > div.FormRowStructure-contents > div > div.ThemeableIconButtonPresentation--isEnabled.ThemeableIconButtonPresentation.ThemeableIconButtonPresentation--medium.SubtleIconButton--standardTheme.SubtleIconButton.MultiFilterMenuContentsRow-removeFilterButton.SubtleIconButton--standardTheme.SubtleIconButton.MultiFilterMenuContentsRow-removeFilterButton";

const filterBtnsId = "asana_utils_buttons_container";

const asanaUrlScheme = "app.asana.com";
const asanaUrlSchemeBoardPart = "board";

window.addEventListener("load", (_) => onUrlChange(window.location.href));

chrome.runtime.onMessage.addListener((request, _, __) => onUrlChange(request.url));

function onUrlChange(url) {
  if (isOnAsanaBoard(url)) {
    addAppFilterButtons();
  }
}

function isOnAsanaBoard(url) {
  return url && url.includes(asanaUrlScheme) && url.split('/').pop() == asanaUrlSchemeBoardPart;
}

/// Check if we have added the filter buttons already
function hasAddedFilterButtons() {
  return !!document.getElementById(filterBtnsId);
}

async function addAppFilterButtons() {
  const boardColumn = await pollSelector('div.Board');

  if (!hasAddedFilterButtons()) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.setAttribute("id", filterBtnsId);
    buttonsContainer.style.padding = "12px 24px";

    const buttons = [
      createFilterButton('Assistant', () => applyFilter('Assistant')),
      createFilterButton('Backoffice', () => applyFilter('Backoffice')),
      createFilterButton('Checkout', () => applyFilter('Checkout')),
      createFilterButton('Core', () => applyFilter('Core')),
      createFilterButton('Flowbox', () => applyFilter('Flowbox')),
      createFilterButton('Sales', () => applyFilter('Sales')),
      createFilterButton('GC Core', () => applyFilter('GC Core')),
      createFilterButton('GC Admin', () => applyFilter('GC Admin')),
      createFilterButton('FC Core', () => applyFilter('FC Core')),
    ];

    buttons.forEach(button => buttonsContainer.appendChild(button));

    insertAfter(buttonsContainer, boardColumn.children[0]);
  }

  setTimeout(() => addAppFilterButtons(), 4000);
}

function createFilterButton(text, onclick) {
  const buttonElement = document.createElement('button');

  buttonElement.classList.add('ThemeableRectangularButtonPresentation--isEnabled');
  buttonElement.style.padding = "8px 12px";
  buttonElement.style.backgroundColor = "white";
  buttonElement.style.margin = "0px 12px 0px 0px";
  buttonElement.style.borderRadius = "6px";
  buttonElement.onclick = onclick;
  buttonElement.innerHTML = text;

  return buttonElement;
}

function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

async function clickOpenFilterButton() {
  const filterBtn = await pollSelector(filterBtnSelector, 1);

  if (filterBtn) {
    filterBtn.click();
  } else {
    const filterBtnEmpty = await pollSelector(filterBtnEmptySelector, 1);
    filterBtnEmpty.click();
  }
}

async function applyFilter(appName) {
  await clickOpenFilterButton();
  
  await maybeClearAppFilter();

  await addApplicationFilterType();
  await addAppToApplicationFilter(appName);

  document.querySelector(applyFilterBtnSelector).click();

  addAppFilterButtons();
}

async function addApplicationFilterType() {
  const addFilterDropdownBtn = await pollSelector(addFilterDropdownBtnSelector);
  addFilterDropdownBtn.click();

  const addFilterDropdownList = await pollSelector(addFilterDropdownListSelector);
  const addFilterDropdownListApplicationItem = grabChildWithInnerHTML(addFilterDropdownList, 'Application');
  addFilterDropdownListApplicationItem.click();
}

async function addAppToApplicationFilter(appName) {
  const applicationsDropdownBtn = await pollSelector(applicationsDropdownBtnSelector);
  applicationsDropdownBtn.click();

  const applicationsDropdownList = await pollSelector(applicationsDropdownListSelector);
  const applicationsDropdownListAppItem = grabChildWithInnerHTML(applicationsDropdownList, appName);
  applicationsDropdownListAppItem.click();
}

async function maybeClearAppFilter() {
  const clearButton = await pollSelector(clearApplitcationsFilterBtnSelector);
    
  if (clearButton) {
    clearButton.click();
  }
}

async function pollSelector(selector, retries = 5) {
  const element = document.querySelector(selector);

  if (element) {
    return element;
  } else if (retries > 0) {
    await sleep(200);
    return pollSelector(selector, retries - 1);
  } else {
    return undefined;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function grabChildWithInnerHTML(parentElement, innerHTML) {
  for (let i = 0; i < parentElement.children.length; i++) {
    const child = parentElement.children[i];
    if (child.innerText.toLowerCase() == innerHTML.toLowerCase()) {
      return child;
    }
  }
}