import TableGenerator from "./TableGenerator.js";
export default class UploadFile extends TableGenerator {
  constructor(options) {
    super(options);
    this.init();
  }

  init() {
    this.elements.container.innerHTML = this.parseHTML();
    this.elements.table = this.elements.container.querySelector(
      ".insert-table"
    );
    this.elements.alert = this.elements.container.querySelector(".alert-csv");
    this.elements.container
      .querySelector(".csv-input")
      .addEventListener("change", e => {
        this.readFile(e.target.files[0]);
      });
  }

  readFile(file) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = file => this.formatData(file.target.result);
  }

  formatData(csv) {
    try {
      const text = csv.replace(/\t|;/g, ",");
      const regex = /[^\n,]+(,[^\n,]+)?\n?/g;
      if (!regex.test(text)) throw new Error("Not Valid CSV file");

      const data = text.split(/\r?\n/);
      while (data.slice(-1)[0] === "") data.pop();
      const titles = data.shift().split(",");
      const titlesLenght = titles.length;

      const checkLength = data.some(element => {
        return element.split(",").length !== titlesLenght;
      });
      if (checkLength) throw new Error("Not Valid CSV file");

      this.options.data = data;
      this.options.titles = titles;
      this.alert();
      this.generateTableFromFile();
    } catch (error) {
      this.alert(error);
    }
  }

  generateTableFromFile() {
    this.collection = this.dataToObject(this.options.data);
    this.elements.container.querySelector(
      ".insert-filters"
    ).innerHTML = this.parseFilters();
    this.filterEvents();
    this.generateTable();
  }

  alert(error) {
    let alertType = "success";
    error && (alertType = "error");

    this.elements.alert.innerHTML = `
    <div class="alert alert-${error ? "danger" : alertType}" 
      role="alert">
      <strong>${alertType.toUpperCase()}!</strong> 
      ${(error && error.message) || " CSV File has been successfully uploaded"}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
    this.elements.alert.querySelector(".close").addEventListener("click", e => {
      this.elements.alert.innerHTML = "";
    });
  }

  parseHTML() {
    return `
    <div class="alert-csv"></div>
      <span class="custom-file mb-4">
        <input type="file" class="custom-file-input csv-input" id="csv" accept=".csv, .txt">
        <label class="custom-file-label" for="csv">Choose CSV file</label>
      </span>
    <span class="card border-secondary">
      <div class="card-header">
        <h5>Table generated from file</h5>
      </div>
      <div class='insert-filters card-body'></div>
      <div class='insert-table mr-2 ml-2'></div>
      <div class="insert-table-btns container"></div>
    </span>
    <div class="insert-code container"></div>`;
  }
}
