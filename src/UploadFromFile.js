import TableGenerator from "./TableGenerator.js";
export default class UploadFile extends TableGenerator {
  constructor(options) {
    super(options);
    this.init();
  }
  init() {
    this.elements.container.innerHTML = this.parseHTML();
    this.elements.container
      .querySelector("#csv")
      .addEventListener("change", e => {
        this.generateTableFromFile(e.target.files[0]);
      });
  }
  generateTableFromFile(file) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = file => {
      this.formatData(file);
      this.dataToObject(this.options.data);
      this.generateTable();
    };
  }
  formatData(csv) {
    this.options.details = {};
    this.options.data = csv.target.result.replace(/\r/g, "").split("\n");
    this.options.detailsKeys = this.options.data.shift().split(",");
    this.options.detailsKeys.forEach(title => {
      this.options.details[title] = "text";
    });
  }
  parseHTML() {
    return `<label for="csv">Choose a valid csv file:</label>
            <input type="file" id="csv" name="csv" accept=".csv">
            <div class='insert-table container'></div>
            <div class="insert-code container"></div>`;
  }
}
