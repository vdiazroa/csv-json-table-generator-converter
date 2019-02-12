---
# csv-json-table-generator-converter widget version

This small project was an idea I had when i was learning js.

written in Vanilla JS ES6 Syntax

the only 2 libraries I used are html2canvas and jspdf to export the data as pdf (experimental version)

The idea of the project is create html tables and get the html code, from an csv file, or from a form, with the idea to use it in different webpages
added filter and sort
addes export as csv, export as json

to get the design it's necessary add bootstrap css

---
**The project consists in 3 classes**

the first one is called **TableGenerator**: this one includes the kernel of the another 2, it's also functional by itself using options as data, for example
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
the second one is called **UploadFromFile**, and it works to upload a csv file from your computer (in the repo there is a sample data called "sample-csv-data.csv"

example

using options = { container: "#container-0" } to select the container where will be inserted

```
const table1 = new UploadFile({ container: "#container-0" });
```

then it creates a table with the data from the csv file, and the html code (maybe not usefull because it's a long file of data)


---


Using **TableFromForm() Class** without any option as argument, this instance will use the default container (#cointainer-1)

how there is no data provide in options, it will generate an empty form where it can be added some data to generate the table 
```
const table2 = new TableFromForm();
```

---

