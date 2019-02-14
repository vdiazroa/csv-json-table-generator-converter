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

    this.conditions = {
      "=": (a, b) => a == b,
      "!=": (a, b) => a != b,
      ">": (a, b) => a > b,
      "> or =": (a, b) => a >= b,
      "<": (a, b) => a < b,
      "< or =": (a, b) => a <= b,
      contains: (a, b) => a.includes(b),
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
    this.orderCount = -1;
    return data.reduce((collection, element) => {
      const singleItem = {};
      const items = element.split(",");
      for (let i in items) singleItem[this.options.titles[i]] = items[i];
      collection.push(singleItem);
      return collection;
    }, []);
  }

  addFilters() {
    return this.filters.reduce((acc, filter) => {
      return acc.filter(data => {
        const condition = this.conditions[filter.condition];
        let a = data[filter.title];
        let b = filter.value;
        if (
          (a - b).toString() === "NaN" ||
          filter.condition === "contains" ||
          filter.condition === "starts with" ||
          filter.condition === "ends with"
        ) {
          return condition(a.toLowerCase(), b.toLowerCase());
        }
        return condition(Number(a), Number(b));
      });
    }, this.collection);
  }

  collectionToCsv() {
    return this.addFilters().reduce((string, col) => {
      return string + "\n" + Object.values(col).join(",");
    }, Object.keys(this.collection[0]).join(","));
  }

  collectionToJSON() {
    let json = this.addFilters().map(element => {
      for (let key in element) {
        if (element[key] === "") delete element[key];
      }
      return element;
    });
    return JSON.stringify(json, null, 1);
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
    <form class="form-inline add-filters mb-0">
      <div class="select-wrapper mb-2">
        <select class="form-control mr-2" id="title-filter" data-label="wave">
        ${titles}
        </select>
      </div>
      <div class="select-wrapper mb-2">
        <select class="form-control mr-2" id="condition-filter" data-label="wave">
        ${conditions}
        </select>
      </div>
      <div class="form-group mb-2">
        <label for="filter-value" class="sr-only">value</label>
        <input type="text" class="form-control mr-2" id="filter-value" placeholder="value">
      </div>
      <button class="btn btn-primary addFilter mb-2">add Filter</button>
    </form>
    <div class="filters text-center row"><div>`;
  }

  addFilterStatus(filter) {
    return `
    <div class="col-3 filter text-dark mt-3" number=${filter.count}>
      <div class="rounded p-0">
        <div class="bg-warning btn-group w-100 d-flex justify-content-between">
          <div></div>
          <strong class="">Filter by ${filter.title}</strong>
          <button class="close text-danger pr-1 pl-1"><span aria-hidden="true">&times;</span></button>
        </div>
        <div class="border border-warning">${filter.title} ${
      filter.condition
    } "${filter.value}"</div>
      </div>
    </div>`;
  }

  parseTable(collection) {
    const titles = this.options.titles.reduce((string, title) => {
      return `${string}
        <th>
          <button value="${title}" class='btn btn-secondary w-100'>
            ${title}<i class="fas fa-long-arrow-alt-up"></i><i class="fas fa-long-arrow-alt-down"></i>
          </button>
        </th>`;
    }, "");

    const data = collection.reduce((string, data) => {
      let tds = "";
      for (let i in data) {
        tds += `
          <td>${data[i]}</td>`;
      }
      return `${string}
      <tr>${tds}
      </tr>`;
    }, "");

    return `<table class="table table-striped table-dark text-center mt-2 border">
    <thead>
      <tr>${titles}
      </tr>
    </thead>
    <tbody>${data}
    </tbody>
  </table>`;
  }

  copyToClipboard() {
    const element = document.createElement("textarea");
    element.value = this.elements.container.querySelector(".code").innerText;
    document.body.appendChild(element);
    element.select();
    document.execCommand("copy");
    document.body.removeChild(element);
    alert("Code copied");
  }

  tableEvents() {
    this.elements.container
      .querySelector("table")
      .addEventListener("click", e => {
        const button = e.target.closest("button");
        e.stopPropagation();
        if (button) {
          this.orderCount = this.changeOrder(this.orderCount, button.value);
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
          this.generateTable();
        }
      });

    this.elements.container
      .querySelector(".filters")
      .addEventListener("click", e => {
        e.preventDefault();
        if (e.target.closest(".close")) {
          e.stopPropagation();
          const counter = filterDiv.getAttribute("number");
          this.filters = this.filters.filter(
            element => element.count != counter
          );
          const filterDiv = e.target.closest(".filter");
          e.stopPropagation();
          filterDiv.remove();
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
    ).innerHTML = `<span class="row">
      <span class="btn-group col mb-3" role="group" >
        <button type="button" class="btn btn-secondary csv-file">CSV File</button>
        <button type="button" class="btn btn-secondary json-data">JSON Data</button>
      </span>

      <span class="btn-group btn-group-toggle table-theme col mb-3 custom-control-inline" >
        <label class="btn btn-dark active dark-theme">
          <input type="radio" name="options" id="dark-theme" autocomplete="off" ${this
            .theme === "dark-theme" && "checked"}> Dark Theme
        </label>
        <label class="btn btn-light light-theme">
          <input type="radio" name="options" id="light-theme" autocomplete="off" ${this
            .theme === "light-theme" && "checked"}> Light Theme
        </label>
      </span>

      <span class="pdfOrientation mb-3 col d-flex">
        <span class="mr-3 ml-4 text-left ">
          <div class="custom-radio">
            <input type="radio" id="l" name="pdf-orientation" class="custom-control-input" 
              ${this.orientation === "l" && "checked"}>        
            <label class="custom-control-label" for="l">landscape</label>
          </div>
          <div class="custom-radio">
            <input type="radio" id="p" name="pdf-orientation" class="custom-control-input 
              ${this.orientation === "p" && "checked"}">        
            <label class="custom-control-label" for="p">portrait</label>
          </div>
        </span>
        <button class="btn save-as-pdf">Save as PDF</button>
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
    const tableBns = this.elements.table.querySelectorAll("button");
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
