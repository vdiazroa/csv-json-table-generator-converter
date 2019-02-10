export default class TableGenerator {
  constructor(options) {
    this.options = {
      container: "#container-1",
      title: "Table Generator",
      titles: [""],
      data: [""]
    };
    Object.assign(this.options, options);
    this.elements = {
      container: document.querySelector(this.options.container)
    };
    this.orientation = "l";
    this.theme = "dark-theme";

    // this.conditions = {
    //   equals: (a, b) => a == b,
    //   isNot: (a, b) => a != b,
    //   greaterThan: (a, b) => a > b,
    //   greaterOrEqualThan: (a, b) => a >= b,
    //   lessThan: (a, b) => a < b,
    //   lessOrEqualThan: (a, b) => a <= b,
    //   includes: (a, b) => a.includes(b),
    //   startsWith: (a, b) => a.startsWith(b),
    //   endsWith: (a, b) => a.endsWith(b)
    // };

    this.conditions = {
      "=": (a, b) => a == b,
      "!=": (a, b) => a != b,
      ">": (a, b) => a > b,
      "> or =": (a, b) => a >= b,
      "<": (a, b) => a < b,
      "< or =": (a, b) => a <= b,
      includes: (a, b) => a.includes(b),
      "starts with": (a, b) => a.startsWith(b),
      "ends with": (a, b) => a.endsWith(b)
    };
    this.filters = [];
    this.filtersCount = 0;
  }

  generatePDF() {
    const table = this.elements.container.querySelector("table");
    if (this.orientation === "p") table.setAttribute("style", "width:730px");
    html2canvas(table, {
      onrendered: canvas => {
        const imgData = canvas.toDataURL();
        const doc = new jsPDF(this.orientation, "px", "a4");
        doc.addImage(imgData, "png;base64", 20, 10);
        doc.save("table.pdf");
      }
    });
    table.removeAttribute("style");
  }

  generateTable() {
    this.elements.table = this.elements.container.querySelector(
      ".insert-table"
    );
    this.elements.table.innerHTML = this.parseTable(this.addFilters());
    this.tableEvents();
    this.insertTableBtns();
    this.tableBtnsEvents();
    this.tableTheme();
    this.insertCode();
  }

  dataToObject(data) {
    const array = data.reduce((collection, element) => {
      const singleItem = {};
      const items = element.split(",");
      for (let i in items) singleItem[this.options.titles[i]] = items[i];
      collection.push(singleItem);
      return collection;
    }, []);
    this.count = -1;
    // this.options.titles.forEach(() => this.count.push(0));
    return array;
  }

  addFilters() {
    return this.filters.reduce((acc, filter) => {
      return acc.filter(data => {
        const condition = this.conditions[filter.condition];
        let a = data[filter.title];
        let b = filter.value;
        if (
          (a - b).toString() === "NaN" ||
          filter.condition === "includes" ||
          filter.condition === "starts with" ||
          filter.condition === "ends with"
        ) {
          return condition(a.toLowerCase(), b.toLowerCase());
        } else condition(Number(a), Number(b));
      });
    }, this.collection);
  }

  collectionToCsv() {
    let string = Object.keys(this.addFilters()[0]).join(",");
    this.addFilters().forEach(
      col => (string += "\n" + Object.values(col).join(","))
    );
    return string;
  }

  collectionToJSON() {
    let json = this.addFilters().map(element => {
      for (let key in element) {
        if (element[key] === "") delete element[key];
      }
      return element;
    });
    json = JSON.stringify(json, null, 1);
    return json;
  }

  download(filename, text) {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  parseFilters() {
    const titles = this.options.titles.reduce((string, title) => {
      return string + `<option value="${title}">${title}</option>`;
    }, "");
    let conditions = "";
    for (let i in this.conditions) {
      conditions += `<option value="${i}">${i}</option>`;
    }
    return `
    <form class="form-inline add-filters">
      <div class="select-wrapper">
        <select class="form-control mr-2" id="title-filter" data-label="wave">
        ${titles}
        </select>
      </div>
      <div class="select-wrapper">
        <select class="form-control mr-2" id="condition-filter" data-label="wave">
        ${conditions}
        </select>
      </div>
      <div class="form-group">
        <label for="filter-value" class="sr-only">value</label>
        <input type="text" class="form-control mr-2" id="filter-value" placeholder="value">
      </div>
      <button class="btn btn-primary addFilter">add Filter</button>
    </form>
    <div class="filters text-center row"><div>`;
  }

  addFilterStatus(filter) {
    return `
    <div class="col-3 filter text-dark" number=${filter.count}>
      <div class="rounded p-0">
        <div class="bg-warning">
          <strong class="text-dark">Filter: ${filter.title}</strong>
          <button class="close"><span aria-hidden="true">&times;</span></button>
        </div>
        <div class="bg-light">${filter.condition} "${filter.value}"</div>
      </div>
    </div>`;
  }

  parseTable(collection) {
    let table = `<table class="table table-striped table-dark text-center">
    <thead>
      <tr>`;
    this.options.titles.forEach(element => {
      table += `
        <th>
          <button value="${element}" class='btn btn-secondary w-100'>
            ${element}<i class="fas fa-long-arrow-alt-up"></i><i class="fas fa-long-arrow-alt-down"></i>
          </button>
        </th>`;
    });
    table += `
      </tr>
    </thead>
    <tbody>`;
    collection.forEach(element => {
      table += `
      <tr>`;
      for (let i in element) {
        table += `
          <td>${element[i]}</td>`;
      }
      table += `
      </tr>`;
    });
    table += `
    </tbody>
  </table>`;
    return table;
  }

  copyToClipboard() {
    const el = document.createElement("textarea");
    el.value = this.elements.container.querySelector(".code").innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    alert("Code copied");
  }

  tableEvents() {
    this.elements.container
      .querySelector("table")
      .addEventListener("click", e => {
        const button = e.target.closest("button");
        e.stopPropagation();
        if (button) {
          this.count = this.changeOrder(this.count, button.value);
          this.elements.table.innerHTML = this.parseTable(this.addFilters());
          this.generateTable();
        }
      });
  }

  filterEvents() {
    this.elements.container
      .querySelector(".add-filters")
      .addEventListener("submit", e => {
        e.preventDefault();
        if (e.target["filter-value"].value) {
          const filter = {
            title: e.target["title-filter"].value,
            condition: e.target["condition-filter"].value,
            value: e.target["filter-value"].value,
            count: this.filtersCount
          };
          this.elements.container.querySelector(
            ".filters"
          ).innerHTML += this.addFilterStatus(filter);
          this.filters.push(filter);
          this.filtersCount++;
          const filtersQ = this.elements.container.querySelectorAll(".filter");
          if (filtersQ.length === 4)
            this.elements.container
              .querySelector(".addFilter")
              .setAttribute("disabled", true);

          this.elements.table.innerHTML = this.parseTable(this.addFilters());
          this.generateTable();
        }
      });

    this.elements.container
      .querySelector(".filters")
      .addEventListener("click", e => {
        e.preventDefault();
        if (e.target.closest(".close")) {
          e.stopPropagation();
          const filterDiv = e.target.closest(".filter");
          e.stopPropagation();
          const counter = filterDiv.getAttribute("number");

          const toDelete = this.filters.find(elem => elem.count == counter);
          const index = this.filters.indexOf(toDelete);
          this.filters.splice(index, 1);
          filterDiv.remove();

          this.elements.table.innerHTML = this.parseTable(this.addFilters());
          this.generateTable();
          const filtersQ = this.elements.container.querySelectorAll(".filter");
          if (filtersQ.length === 3)
            this.elements.container
              .querySelector(".addFilter")
              .removeAttribute("disabled");
        }
      });
  }
  insertTableBtns() {
    this.elements.container.querySelector(
      ".insert-table-btns"
    ).innerHTML = `    <span class="justify-content-between d-flex">
    <span class="btn-group mr-5" role="group" style="height:40px   ">
      <button type="button" class="btn btn-secondary csv-file">CSV File</button>
      <button type="button" class="btn btn-secondary json-data">JSON Data</button>
    </span>

    <span class="text-right border">
      <span class="btn-group btn-group-toggle mr-3 table-theme data-toggle="buttons">
        <label class="btn btn-dark active dark-theme">
          <input type="radio" name="options" id="dark-theme" autocomplete="off" ${this
            .theme === "dark-theme" && "checked"}> Dark Theme
        </label>
        <label class="btn btn-light light-theme">
          <input type="radio" name="options" id="light-theme" autocomplete="off" ${this
            .theme === "light-theme" && "checked"}> Light Theme
        </label>
      </span>

      <span class="text-left pdfOrientation custom-control-inline mt-2">
        <span class="custom-control custom-radio custom-control-inline">
          <input type="radio" id="l" name="pdf-orientation" class="custom-control-input" 
            ${this.orientation === "l" && "checked"}>        
          <label class="custom-control-label" for="l">landscape</label>
        </span>
        <span class="custom-control custom-radio custom-control-inline">
          <input type="radio" id="p" name="pdf-orientation" class="custom-control-input 
            ${this.orientation === "p" && "checked"}">        
          <label class="custom-control-label" for="p">portrait</label>
        </span>
      </span>
    
      <button class="btn save-as-pdf mt-2">Save as PDF</button>
    </span>
  </span>`;
  }

  insertCode() {
    this.elements.container.querySelector(".insert-code").innerHTML = `
    <span class="card border-secondary mb-3 mt-4">
      <div class="card-header">
        <button class='btn copy-to-clipboard mb-3'>Copy Code to Clipboard</button>
        <h5>HTML Code</h5>
      </div>
      <div class="card-body text-dark">
       <pre class="card-text code"></pre>
      </div>
    </span>
    `;
    const code = this.elements.container.querySelector(".code");
    this.elements.table = this.elements.container.querySelector(
      ".insert-table"
    );
    code.innerText = this.elements.table.innerHTML;
    this.elements.container
      .querySelector(".copy-to-clipboard")
      .addEventListener("click", e => {
        this.copyToClipboard();
      });
  }

  tableBtnsEvents() {
    this.elements.container
      .querySelector(".json-data")
      .addEventListener("click", e => {
        const json = this.collectionToJSON();
        window.open().document.write(`<pre>${json}</pre>`);
      });
    this.elements.container
      .querySelector(".csv-file")
      .addEventListener("click", e => {
        const file = this.collectionToCsv();
        this.download("data.csv", file);
      });
    this.elements.container
      .querySelector(".save-as-pdf")
      .addEventListener("click", e => {
        this.generatePDF();
      });
    this.elements.container
      .querySelector(".pdfOrientation")
      .addEventListener("change", e => {
        this.orientation = e.target.id;
      });
    this.elements.container
      .querySelector(".table-theme")
      .addEventListener("change", e => {
        this.theme = e.target.id;
        this.tableTheme();
      });
  }

  tableTheme() {
    const table = this.elements.container.querySelector(".table");
    const darkTheme = this.elements.container.querySelector(".dark-theme");
    const lightTheme = this.elements.container.querySelector(".light-theme");
    const tableBns = this.elements.container.querySelectorAll("table button");
    if (this.theme === "dark-theme") {
      table.classList.remove("table-light");
      table.classList.add("table-dark");
      lightTheme.classList.remove("active");
      darkTheme.classList.add("active");
      tableBns.forEach(btn => btn.classList.add("btn-secondary"));
    } else if (this.theme === "light-theme") {
      table.classList.remove("table-dark");
      table.classList.add("table-light");
      lightTheme.classList.add("active");
      darkTheme.classList.remove("active");
      tableBns.forEach(btn => btn.classList.remove("btn-secondary"));
    }
    this.insertCode();
  }

  changeOrder(count, sortBy) {
    const index = this.options.titles.indexOf(sortBy);
    this.collection.sort((a, b) => {
      [a, b] = [a[sortBy], b[sortBy]];
      if (count === index) [a, b] = [b, a];

      if ((a - b).toString() !== "NaN") return a - b;

      [a, b] = [a.toLowerCase(), b.toLowerCase()];
      return a > b ? 1 : a < b ? -1 : 0;
    });
    return count === index ? -1 : index;
  }

  // changeOrder(itemTitle) {
  //   const newArray = [...this.collection];
  //   this.newOrder(newArray, itemTitle);

  //   this.areNotEquals(this.collection, newArray)
  //     ? (this.collection = newArray)
  //     : this.newOrder(this.collection, itemTitle, "desc-order");
  // }

  // areNotEquals(arrayOne, arrayTwo) {
  //   return arrayOne.some((obj, i) => !Object.is(obj, arrayTwo[i]));
  // }

  // newOrder(array, sortBy, orderBy) {
  //   array.sort((a, b) => {
  //     let valA = a[sortBy];
  //     let valB = b[sortBy];
  //     if (orderBy === "desc-order") [valA, valB] = [valB, valA];
  //     if (`${valA - valB}` !== "NaN") return valA - valB;
  //     valA = valA.toLowerCase();
  //     valB = valB.toLowerCase();
  //     return valA > valB ? 1 : valA < valB ? -1 : 0;
  //   });
  // }
}
