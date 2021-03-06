import TableGenerator from "./TableGenerator.js";
export default class TableFromForm extends TableGenerator {
  constructor(options) {
    super(options);
    this.init();
  }
  init() {
    this.collection = this.dataToObject(this.options.data);
    this.parseForm();
    this.colcurrent = this.options.titles.length;
    this.getElements();
    this.registerEvents(this.elements);
    this.setRemoveAttributeDisabled();
    this.setRemoveAttributeDisabled(".delColBtn");
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
  registerEvents({ form, container, inputs, addCol }) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      this.collection = this.dataToObject(this.collectData());
      container.querySelector(
        ".insert-filters"
      ).innerHTML = this.parseFilters();
      this.filterEvents();
      this.generateTable();
    });
    inputs.addEventListener("click", e => {
      const removeCol = e.target.closest(".delColBtn");
      e.stopPropagation();
      if (removeCol) {
        const delColBtnQ = container.querySelectorAll(".delColBtn").length;
        if (delColBtnQ === 6) addCol.removeAttribute("disabled");
        const colNumber = removeCol.getAttribute("col");
        const colSelector = `[col="${colNumber}"]`;
        const col = inputs.querySelectorAll(colSelector);
        col.forEach(element => element.remove());
        this.setRemoveAttributeDisabled(".delColBtn");
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
        colNumber === 5 && addCol.setAttribute("disabled", true);
        this.generateCol();
      }
    });

    inputs.addEventListener("keyup", e => {
      const title = e.target.closest(".title");
      e.stopPropagation();
      if (title) {
        this.titleValidator(title);
        const colNumber = title.getAttribute("col");
        const col = form.querySelectorAll(`.divRow input[col='${colNumber}']`);
        col.forEach(el => {
          title.value === ""
            ? el.setAttribute("placeholder", `input ${parseInt(colNumber) + 1}`)
            : el.setAttribute("placeholder", title.value);
        });
      }
    });
  }

  generateCol() {
    this.elements.container
      .querySelector(".delColBtn")
      .removeAttribute("disabled");
    const newTitle = this.generateNewInput(this.colcurrent);
    newTitle.classList.add("title");
    newTitle.setAttribute("required", true);
    this.elements.titlesContainer.appendChild(newTitle);

    this.elements.container.querySelectorAll(".divRow").forEach(col => {
      const newInput = this.generateNewInput(this.colcurrent);
      const inputContainer = col.querySelector(".inputContainer");
      inputContainer.appendChild(newInput);
    });
    const delColBtn = `
    <div class="col text-left p-0 pl-1" col='${this.colcurrent}'>
      <button class="delColBtn btn btn-outline-danger" col='${this.colcurrent}'>
      - 
      </button>
    </div>`;
    this.elements.delBtnsContainer.insertAdjacentHTML("beforeend", delColBtn);
    this.colcurrent++;
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

  setRemoveAttributeDisabled(btnClass = ".delField") {
    const btns = this.elements.container.querySelectorAll(btnClass);
    if (btns.length === 1) {
      btns.forEach(btn => {
        btn.hasAttribute("disabled")
          ? btn.removeAttribute("disabled")
          : btn.setAttribute("disabled", true);
      });
    }
  }

  titleValidator(title) {
    const titles = this.elements.container.querySelectorAll(".title");
    const titleValues = Array.from(titles).map(title => title.value);
    const allAddFields = this.elements.container.querySelectorAll(".addField");
    const tableBtn = this.elements.container.querySelector(".generate-table");
    titleValues.splice(titleValues.indexOf(title.value), 1);

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
      <div class="col text-left p-0 pl-1" col='${i}'>
        <button class="delColBtn btn btn-outline-danger" col='${i}'>- </button>
      </div>`;
    }, "");

    this.elements.container.innerHTML = `
    <form action="" class="table-form form ml-3">
      <h1>${this.options.title}</h1>
      <div class="inputs mt-4"">      
        <div class="delCol row">
          <div class="col-9 col-lg-10 delBtnsContainer row">
            ${delColBtns}
          </div>
        <div class="col-3 col-lg-2"></div>
      </div>

        <div class="titles row mt-1">
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
  parseRow(element, cols) {
    let inputs = "";
    const titles = Object.keys(element);
    let colIndex = 0;
    for (let i in element) {
      const index = (cols && cols[colIndex]) || titles.indexOf(i);
      colIndex++;
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
    const colNumbers = [];
    this.elements.container.querySelectorAll(".title").forEach(input => {
      emptyCollection[input.value || input.placeholder] = "";
      colNumbers.push(input.getAttribute("col"));
    });
    const newRow = this.parseRow(emptyCollection, colNumbers);
    currentDiv.insertAdjacentHTML("afterEnd", newRow);
  }
}
