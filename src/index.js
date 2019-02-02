import TableFromForm from "./TableFromForm.js";
import UploadFile from "./UploadFromFile.js";

const table1 = new UploadFile({ container: "#container-0" });

const table2 = new TableFromForm();

const options = {
  title: "Example",
  data: [
    "Red Dead Redemption 2,Rockstar Games,2018",
    "The Witcher 3,CD Projekt RED,2015",
    "Nier: Automata,Platinum Games,2017",
    "Overwatch,Blizzard,2016"
  ],
  titles: ["Title", "Studio", "Year"],
  container: "#container-2"
};

const table3 = new TableFromForm(options);
table3.generateTable();
