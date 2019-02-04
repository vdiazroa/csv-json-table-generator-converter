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
  }

  generatePDF() {
    html2canvas(this.elements.container.querySelector("table"), {
      onrendered: canvas => {
        const imgData = canvas.toDataURL();
        const doc = new jsPDF(this.orientation, "pt", "a4");
        doc.addImage(imgData, "png;base64", 20, 10);
        doc.save("table.pdf");
      }
    });
  }

  generateTable() {
    this.elements.table = this.elements.container.querySelector(
      ".insert-table"
    );
    this.elements.table.innerHTML = this.parseTable();
    this.tableEvents();
    this.insertCode();
    this.codeEvents();
  }

  dataToObject(data) {
    const array = data.reduce((collection, element) => {
      const singleItem = {};
      const items = element.split(",");
      for (let i in items) singleItem[this.options.titles[i]] = items[i];
      collection.push(singleItem);
      return collection;
    }, []);
    this.count = [];
    this.options.titles.forEach(() => this.count.push(0));
    return array;
  }

  collectionToCsv() {
    let string = Object.keys(this.collection[0]).join(",");
    this.collection.forEach(
      col => (string += "\n" + Object.values(col).join(","))
    );
    return string;
  }

  collectionToJSON() {
    let json = this.collection.map(element => {
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

  parseTable() {
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
    this.collection.forEach(element => {
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
          this.changeOrder(button.value);
          this.elements.table.innerHTML = this.parseTable();
          this.tableEvents();
          this.insertCode();
          this.codeEvents();
        }
      });
  }

  insertCode() {
    this.elements.container.querySelector(".insert-code").innerHTML = `
    <span class="justify-content-between d-flex">
      <span class="btn-group mr-5" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-secondary csv-file">CSV File</button>
        <button type="button" class="btn btn-secondary json-data">JSON Data</button>
      </span>

      <span class="text-right">
        <span class="text-left pdfOrientation">
          <div class="custom-control custom-radio custom-control-inline">
            <input type="radio" id="l" name="pdf-orientation" class="custom-control-input" checked>
            <label class="custom-control-label" for="l">landscape</label>
          </div>
          <div class="custom-control custom-radio custom-control-inline">
            <input type="radio" id="p" name="pdf-orientation" class="custom-control-input">
            <label class="custom-control-label" for="p">portrait</label>
          </div>
        </span>
        <button class="btn save-as-pdf">Save as PDF</button>
      </span>
    </span>

    <span class="card border-dark mb-3 mt-4">
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
  }

  codeEvents() {
    this.elements.container
      .querySelector(".json-data")
      .addEventListener("click", e => {
        const json = this.collectionToJSON();
        window.open().document.write(`<pre>${json}</pre>`);
      });
    this.elements.container.querySelector(".csv-file").addEventListener(
      "click",
      e => {
        const file = this.collectionToCsv();
        this.download("data.csv", file);
      },
      false
    );
    this.elements.container
      .querySelector(".copy-to-clipboard")
      .addEventListener("click", e => {
        this.copyToClipboard();
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
  }

  changeOrder(sortBy) {
    const index = this.options.titles.indexOf(sortBy);
    const compare = this.count[index];
    this.collection.sort((a, b) => {
      let [valA, valB] = [a[sortBy], b[sortBy]];

      if (compare === 1) [valA, valB] = [valB, valA];
      if (`${valA - valB}` !== "NaN") return valA - valB;

      [valA, valB] = [valA.toLowerCase(), valB.toLowerCase()];
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    });
    for (let i in this.count) this.count[i] = 0;
    if (compare === 0) this.count[index] = 1;
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
