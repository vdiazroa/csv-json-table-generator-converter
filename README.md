---
# csv-json-table-generator-converter widget version

This small project was an idea I had when I was learning js.

Written in Vanilla JS ES6 Syntax

The only 2 libraries used are html2canvas and jspdf to export the data as pdf (experimental version => UNCLEAR ? WHAT IT EXPERIMENTAL ? YOUR PROJECT OR jspdf?)

The idea of the project is to create html tables and generate the html code from a csv file, or from a form, and to be able to use is in different webpages.
It allows to filter and sort the data.
Data can be exported as csv and as json.

To get the design it is necessary to add bootstrap css.
---

**The project consists of 3 classes**

The first one is called **TableGenerator**: this one includes the kernel of the other 2, it's also functional by itself using options as data, for example

```
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

```

and it can be applied filters, and sort the table by title, and export as csv or as json (features also available in UploadFromFile and in TableFromForm classes)

---

the second one is called **UploadFromFile**, and it can be used to upload a csv file from your computer (in the repo there is a sample data called "sample-csv-data.csv")

example

using options = { container: "#container-0" } to select the container where will be inserted

```
const table1 = new UploadFile({ container: "#container-0" });
```

then it creates a table with the data from the csv file, and the html code (maybe not useful because it's a long file of data)

---

Using **TableFromForm() Class** without any option as argument, this instance will use the default container (#cointainer-1)

how there is no data provide in options, it will generate an empty form where it can be added some data to generate the table => UNCLEAR quieres decir "si no hay data en "options" ?

```
const table2 = new TableFromForm();
```

---
