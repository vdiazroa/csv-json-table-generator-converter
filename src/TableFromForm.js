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
    this.elements.table = this.elements.container.querySelector(
      ".insert-table"
    );
    this.elements.form = this.elements.container.querySelector(".table-form");
    this.elements.inputs = this.elements.container.querySelector(".inputs");
    this.elements.addCol = this.elements.container.querySelector(".addCol");
    this.elements.titlesContainer = this.elements.container.querySelector(
      ".titlesContainer"
    );
    this.elements.delBtnsContainer = this.elements.container.querySelector(
      ".delBtnsContainer"
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
      const removeCol = e.target.closest(".delColBtn");
      e.stopPropagation();
      if (removeCol) {
        const colNumber = removeCol.getAttribute("col");
        const colSelector = `[col="${colNumber}"]`;
        const col = inputs.querySelectorAll(colSelector);
        const removeBtns = inputs.querySelectorAll(".delColBtn");
        if (removeBtns.length === 2)
          removeBtns.forEach(btn => btn.setAttribute("disabled", true));
        col.forEach(element => element.remove());
      }
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
        col.forEach(el => {
          title.value === ""
            ? el.setAttribute("placeholder", `input ${parseInt(colNumber) + 1}`)
            : el.setAttribute("placeholder", title.value);
        });
      }
    });
  }

  generateCol(colNumber) {
    this.elements.container
      .querySelector(".delColBtn")
      .removeAttribute("disabled");
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
    const delColBtn = `
    <div class="col pr-2 text-right" col='${colNumber}'>
      <button class="delColBtn btn btn-secondary" col='${colNumber}'>- </button>
    </div>`;
    this.elements.delBtnsContainer.insertAdjacentHTML("beforeend", delColBtn);
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
      const redBorderVal = Array.from(redBorder).map(title => title.value);
      redBorder.forEach(elem => {
        const counter = redBorderVal.reduce((counter, val) => {
          if (val === elem.value) return counter + 1;
          return counter;
        }, 0);
        if (counter === 1) {
          elem.classList.remove("border-red");
        }
      });
      if (!this.elements.container.querySelector(".border-red")) {
        allAddFields.forEach(btn => btn.removeAttribute("disabled"));
        tableBtn.removeAttribute("disabled");
      }
    }
  }

  collectData() {
    this.options.titles = [];
    this.elements.container.querySelectorAll(".title").forEach(title => {
      this.options.titles.push(title.value);
    });
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
    const inputTitles = this.options.titles.reduce((string, title, i) => {
      return `${string}
      <input type='text' value="${title}" placeholder='${"input " + (i + 1)}' 
      class='title input col form-control' col='${i}' required>`;
    }, "");

    const delColBtns = this.options.titles.reduce((string, title, i) => {
      return `${string}
      <div class="col pr-2 text-right" col='${i}'>
        <button class="delColBtn btn btn-secondary" col='${i}'>- </button>
      </div>`;
    }, "");

    this.elements.container.innerHTML = `
    <form action="" class="table-form form ml-3">
      <h1>${this.options.title}</h1>
      <div class="inputs">      
        <div class="delCol row">
          <div class="col-9 col-lg-10 delBtnsContainer row">
            ${delColBtns}
          </div>
        <div class="col-3 col-lg-2 mt-2"></div>
      </div>

        <div class="titles row">
          <div class="col-9 col-lg-10 titlesContainer row">
            ${inputTitles}
          </div>
        <div class="div-green-btn col-3 col-lg-2 mt-1">
          <button class="addCol btn btn-success">+</button>
         </div>
      </div>
      
      ${this.collection.reduce((string, row) => {
        return string + this.parseRow(row);
      }, "")}
      </div>
      <button class='btn generate-table'>Update Data</button>
    </form>
    
    <span class="card border-secondary">
      <div class="card-header">
        <h5>Table generated from data</h5>
      </div>
      <div class='insert-filters card-body'></div>
      <div class='insert-table mr-2 ml-2'></div>
      <div class="insert-table-btns container"></div>
    </span>
    <div class="insert-code container"></div>`;
  }
  parseRow(element) {
    let inputs = "";
    const titles = Object.keys(element);
    for (let i in element) {
      const index = titles.indexOf(i);
      inputs += `
        <input type="text" value='${element[i]}' col='${index}' 
        placeholder='${i}'
        class='input col form-control'>`;
    }
    return `
    <div class='divRow row'>
      <div class="col-9 col-lg-10 row inputContainer">
        ${inputs}
      </div>
      <div class="col-3 col-lg-2 mt-2 pr-0">
        <button class="addField btn btn-primary">+</button>
        <button class="delField btn btn-danger">-</button>
      </div>
    </div>`;
  }
  addEmptyRow(currentDiv) {
    const emptyCollection = {};
    this.elements.container.querySelectorAll(".title").forEach(input => {
      emptyCollection[input.value || input.placeholder] = "";
    });
    const newRow = this.parseRow(emptyCollection);
    currentDiv.insertAdjacentHTML("afterEnd", newRow);
  }
}
