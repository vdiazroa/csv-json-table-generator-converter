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
    this.alert();
    this.elements.container
      .querySelector(".form-control-file")
      .addEventListener("change", e => {
        this.generateTableFromFile(e.target.files[0]);
      });
  }
  generateTableFromFile(file) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = file => this.formatData(file);
  }
  next() {
    this.collection = this.dataToObject(this.options.data);
    this.elements.container.querySelector(
      ".insert-filters"
    ).innerHTML = this.parseFilters();
    this.filterEvents();
    this.generateTable();
  }
  formatData(csv) {
    try {
      const text = csv.target.result
        .replace(/\r/g, "")
        .replace(/\t/g, ",")
        .replace(/;/g, ",");

      const regex = /([^\n,]+,)+[^\n,]+\n/g;
      if (!regex.test(text)) throw new Error("Not Valid CSV file");

      this.options.data = text.split(/\r?\n/);
      while (this.options.data.slice(-1)[0] === "") this.options.data.pop();
      this.options.titles = this.options.data.shift().split(",");
      const titlesLenght = this.options.titles.length;

      const checkLength = this.options.data.some(element => {
        return element.split(",").length !== titlesLenght;
      });

      if (checkLength) throw new Error("Not Valid CSV file");
      this.elements.alertError.style.display = "none";
      this.elements.alertSuccess.style.display = "block";
      this.next();
    } catch (error) {
      this.elements.alertSuccess.style.display = "none";
      this.elements.alertError.style.display = "block";
    }
  }
  alert() {
    this.elements.alertError = this.elements.container.querySelector(
      ".alert-error"
    );
    this.elements.alertSuccess = this.elements.container.querySelector(
      ".alert-uploaded"
    );
    this.elements.container
      .querySelector(".close-error")
      .addEventListener("click", e => {
        this.elements.alertError.style.display = "none";
      });
    this.elements.container
      .querySelector(".close-success")
      .addEventListener("click", e => {
        this.elements.alertSuccess.style.display = "none";
      });
  }
  parseHTML() {
    return `
    <div class="alert alert-success top alert-uploaded" role="alert" style="display:none">
      <strong>SUCCESS!</strong> CSV File has been successfully uploaded.
      <button type="button" class="close-success close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>    
    <div class="alert alert-danger top alert-error" role="alert" style="display:none">
      <strong>ERROR!</strong> Not Valid CSV file.
      <button type="button" class="close-error close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>  
    <label for="csv">Choose a valid csv file:</label>
    <input type="file" id="csv" name="csv" accept=".csv" class="form-control-file mb-4">
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
