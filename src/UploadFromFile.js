import TableGenerator from "./TableGenerator.js";
export default class UploadFile extends TableGenerator {
  constructor(options) {
    super(options);
    this.init();
  }
  init() {
    this.elements.container.innerHTML = this.parseHTML();
    this.elements.container
      .querySelector(".form-control-file")
      .addEventListener("change", e => {
        this.generateTableFromFile(e.target.files[0]);
      });
  }
  generateTableFromFile(file) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = file => {
      this.formatData(file);
      this.collection = this.dataToObject(this.options.data);
      this.elements.container.querySelector(
        ".insert-filters"
      ).innerHTML = this.parseFilters();
      this.filterEvents();
      this.generateTable();
    };
  }
  formatData(csv) {
    this.options.titles = {};
    this.options.data = csv.target.result.replace(/\r/g, "").split("\n");
    this.options.titles = this.options.data.shift().split(",");
  }
  parseHTML() {
    return `<label for="csv">Choose a valid csv file:</label>
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
