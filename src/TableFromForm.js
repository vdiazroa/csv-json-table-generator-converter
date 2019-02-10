import TableGenerator from "./TableGenerator.js";
export default class TableFromForm extends TableGenerator {
  constructor(options) {
    super(options);
    this.init();
  }
  init() {
    this.collection = this.dataToObject(this.options.data);
    this.parseForm();
    this.getElements();
    this.registerEvents(this.elements);
    this.setRemoveAttributeDisabled();
    this.elements.container.querySelector(
      ".insert-filters"
    ).innerHTML = this.parseFilters();
    this.filterEvents();
  }
  getElements() {
    this.elements.form = this.elements.container.querySelector(".table-form");
    this.elements.inputs = this.elements.container.querySelector(".inputs");
    this.elements.addCol = this.elements.container.querySelector(".addCol");
    this.elements.titlesContainer = this.elements.container.querySelector(
      ".titlesContainer"
    );
  }
  registerEvents({ form, container, inputs }) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      this.collection = this.dataToObject(this.collectData());
      this.elements.container.querySelector(
        ".insert-filters"
      ).innerHTML = this.parseFilters();
      this.filterEvents();
      this.generateTable();
    });
    inputs.addEventListener("click", e => {
      e.preventDefault();
      if (e.target.closest(".addField")) {
        e.stopPropagation();
        this.setRemoveAttributeDisabled();
        const currentDiv = e.target.closest(".divRow");
        e.stopPropagation();
        this.addEmptyRow(currentDiv);
      } else if (e.target.closest(".delField")) {
        e.stopPropagation();
        const currentDiv = e.target.closest(".divRow");
        e.stopPropagation();
        currentDiv.remove();
        this.setRemoveAttributeDisabled();
      } else if (e.target.closest(".addCol")) {
        e.stopPropagation();
        const colNumber = container.querySelectorAll(".title").length;
        this.generateCol(colNumber);
      }
    });

    inputs.addEventListener("keyup", e => {
      const title = e.target.closest(".title");
      e.stopPropagation();
      if (title) {
        const colNumber = title.getAttribute("col");
        this.titleValidator(title, colNumber);
        const col = form.querySelectorAll(`.divRow input[col='${colNumber}']`);
        this.options.titles[colNumber] = title.value;
        col.forEach(el => {
          title.value === ""
            ? el.setAttribute("placeholder", `input ${parseInt(colNumber) + 1}`)
            : el.setAttribute("placeholder", title.value);
        });
      }
    });
  }

  generateCol(colNumber) {
    colNumber === 5 && this.elements.addCol.setAttribute("disabled", true);
    const newTitle = this.generateNewInput(colNumber);
    newTitle.classList.add("title");
    newTitle.setAttribute("required", true);
    this.elements.titlesContainer.appendChild(newTitle);

    this.elements.container.querySelectorAll(".divRow").forEach(col => {
      const newInput = this.generateNewInput(colNumber);
      const inputContainer = col.querySelector(".inputContainer");
      inputContainer.appendChild(newInput);
    });
    this.options.titles.push(`input ${colNumber + 1}`);
  }

  generateNewInput(colNumber) {
    const newInput = document.createElement("input");
    const inputAttributes = {
      type: "text",
      placeholder: `input ${colNumber + 1}`,
      col: `${colNumber}`,
      class: "input col form-control"
    };
    for (let attribute in inputAttributes) {
      newInput.setAttribute(attribute, inputAttributes[attribute]);
    }
    return newInput;
  }

  setRemoveAttributeDisabled() {
    const delFields = this.elements.container.querySelectorAll(".delField");
    if (delFields.length === 1) {
      delFields.forEach(element => {
        element.hasAttribute("disabled")
          ? element.removeAttribute("disabled")
          : element.setAttribute("disabled", true);
      });
    }
  }

  titleValidator(title, colNumber) {
    const titles = this.elements.container.querySelectorAll(".title");
    const titleValues = Array.from(titles).map(title => title.value);
    const allAddFields = this.elements.container.querySelectorAll(".addField");
    const tableBtn = this.elements.container.querySelector(".generate-table");
    titleValues.splice(colNumber, 1);

    if (titleValues.includes(title.value) && title.value != "") {
      allAddFields.forEach(btn => btn.setAttribute("disabled", true));
      tableBtn.setAttribute("disabled", true);
      titles.forEach(element => {
        if (element.value === title.value) element.classList.add("border-red");
      });
    } else if (tableBtn.hasAttribute("disabled")) {
      title.classList.remove("border-red");
      const redBorder = this.elements.container.querySelectorAll(".border-red");
      if (redBorder.length === 1) redBorder[0].classList.remove("border-red");
    }
    if (!this.elements.container.querySelector(".border-red")) {
      allAddFields.forEach(btn => btn.removeAttribute("disabled"));
      tableBtn.removeAttribute("disabled");
    }
  }

  collectData() {
    this.options.data = [];
    this.elements.container.querySelectorAll(".divRow").forEach(element => {
      let singleData = [];
      element.querySelectorAll("input").forEach(element => {
        singleData.push(element.value);
      });
      singleData = singleData.join(",");

      if (singleData.length >= this.options.titles.length) {
        this.options.data.push(singleData);
      }
    });
    return this.options.data;
  }
  parseForm() {
    let inputText = `
      <form action="" class="table-form form ml-3"><h1>${
        this.options.title
      }</h1>
        <div class="inputs">
          <div class="titles row">
            <div class="col-9 col-lg-10 titlesContainer row">`;

    this.options.titles.forEach(element => {
      const index = this.options.titles.indexOf(element);
      inputText += `<input type='text' value="${element}"
      placeholder='${"input " + (index + 1)}' 
      class='title input col form-control' col='${index}' required>`;
    });
    inputText += `</div>
      <div class="div-green-btn col-3 col-lg-2 mt-1">
        <button class="addCol btn btn-success">+</button>
      </div>
    </div>`;

    this.collection.forEach(element => {
      inputText += this.parseRow(element);
    });
    inputText += `
      </div>
      <button class='btn generate-table'>Update Data</button>
      </form>
      <div class='insert-filters m-3'></div>
      <div class='insert-table m-3'></div>
      <div class="insert-table-btns container"></div>
      <div class="insert-code container"></div>`;
    this.elements.container.innerHTML = inputText;
  }
  parseRow(element) {
    let inputText = `<div class='divRow row'>
                      <div class="col-9 col-lg-10 row inputContainer">`;
    for (let i in element) {
      const index = this.options.titles.indexOf(i);
      inputText += `
        <input type="text" value='${element[i]}' col='${index}' 
        placeholder='${i || "input " + (index + 1)}'
        class='input col form-control'>`;
    }
    inputText += `</div><div class="col-3 col-lg-2 mt-2">
      <button class="addField btn btn-primary">+</button>
      <button class="delField btn btn-danger">-</button></div>
    </div>`;
    return inputText;
  }
  addEmptyRow(currentDiv) {
    const emptyCollection = {};
    this.options.titles.forEach(input => {
      emptyCollection[input] = "";
    });
    const newRow = this.parseRow(emptyCollection);
    currentDiv.insertAdjacentHTML("afterEnd", newRow);
  }
}
