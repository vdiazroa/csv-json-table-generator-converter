import TableGenerator from "./TableGenerator.js";
export default class TableFromForm extends TableGenerator {
  constructor(options) {
    super(options);
    this.init();
  }
  init() {
    this.dataToObject(this.options.data);
    this.parseForm();
    this.getElements();
    this.registerEvents(this.elements);
    this.setRemoveAttributeDisabled();
  }
  getElements() {
    this.elements.form = this.elements.container.querySelector(".table-form");
    this.elements.addCol = this.elements.container.querySelector(".addCol");
    this.elements.titlesContainer = this.elements.container.querySelector(
      ".titlesContainer"
    );
  }
  registerEvents({ form, container }) {
    form.addEventListener("click", e => {
      e.preventDefault();
      if (e.target.closest(".generate-table")) {
        e.stopPropagation();
        this.dataToObject(this.collectData());
        this.generateTable();
      } else if (e.target.closest(".addField")) {
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
    form.addEventListener("keyup", e => {
      const title = e.target.closest(".title");
      e.stopPropagation();
      if (title) {
        const colNumber = title.getAttribute("col");
        this.titleValidator(title, colNumber);
        const col = form.querySelectorAll(`.divRow input[col='${colNumber}']`);
        this.options.detailsKeys[colNumber] = title.value;
        col.forEach(element => {
          element.setAttribute("placeholder", title.value);
        });
      }
    });
  }

  generateCol(colNumber) {
    colNumber === 5 && this.elements.addCol.setAttribute("disabled", true);
    const newTitle = this.generateNewInput(colNumber);
    newTitle.classList.add("title");
    this.elements.titlesContainer.appendChild(newTitle);

    this.elements.container.querySelectorAll(".divRow").forEach(col => {
      const newInput = this.generateNewInput(colNumber);
      const inputContainer = col.querySelector(".inputContainer");
      inputContainer.appendChild(newInput);
    });
    this.options.details[`input ${colNumber + 1}`] = "text";
    this.options.detailsKeys.push(`input ${colNumber + 1}`);
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
    titleValues.splice(colNumber, 1);
    const allAdFields = this.elements.container.querySelectorAll(".addField");
    const tableBtn = this.elements.container.querySelector(".generate-table");
    if (titleValues.includes(title.value)) {
      allAdFields.forEach(btn => btn.setAttribute("disabled", true));
      tableBtn.setAttribute("disabled", true);
      title.classList.add("border-red");
    } else if (tableBtn.hasAttribute("disabled")) {
      allAdFields.forEach(btn => btn.removeAttribute("disabled"));
      tableBtn.removeAttribute("disabled");
      title.classList.remove("border-red");
    }
  }

  collectData() {
    let data = [];
    this.elements.container.querySelectorAll(".divRow").forEach(element => {
      let singleData = [];
      element.querySelectorAll("input").forEach(element => {
        singleData.push(element.value);
      });
      singleData = singleData.join(",");

      if (
        singleData.length > 0 &&
        singleData.length != this.options.detailsKeys.length - 1
      ) {
        data.push(singleData);
      }
    });
    return data;
  }
  parseForm() {
    let inputText = `
      <form action="" class="table-form form ml-5"><h1>${
        this.options.title
      }</h1>
        <div class="inputs">
          <div class="titles row">
            <div class="col-9 col-lg-10 titlesContainer row">`;

    this.options.detailsKeys.forEach(element => {
      const index = this.options.detailsKeys.indexOf(element);
      inputText += `<input type='text' value="${element}" placeholder='input ${index +
        1}' class='title input col form-control' col='${index}'>`;
    });
    inputText +=
      '</div><div class="div-green-btn col-3 col-lg-2 mt-1"><button class="addCol btn btn-success">+</button></div></div>';

    this.collection.forEach(element => {
      inputText += this.parseRow(element);
    });
    inputText += `
      </div>
      <button class='btn generate-table'>Generate Table</button>
      </form>
      <div class='insert-table m-5'></div>
      <div class="insert-code container"></div>`;
    this.elements.container.innerHTML = inputText;
  }
  parseRow(element) {
    let inputText = `<div class='divRow row'>
                      <div class="col-9 col-lg-10 row inputContainer">`;
    for (let i in element) {
      const index = this.options.detailsKeys.indexOf(i);
      inputText += `
        <input type='${this.options.details[i]}' value='${
        element[i]
      }' col='${index}' placeholder='${i || "input " + (index + 1)}'
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
    this.options.detailsKeys.forEach(input => {
      emptyCollection[input] = "";
    });
    const newRow = document.createElement("div");
    newRow.innerHTML = this.parseRow(emptyCollection);
    currentDiv.after(newRow);
  }
}
