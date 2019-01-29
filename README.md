
---


# Table generator widget version

This small project was an idea I had when i was learning js.

The idea of the project is create html tables and get the html code, from an csv file, or from a form, with the idea to use it in different webpages
I also added the option to save as pdf (experimental version)

to get the design is necessary add bootstrap css


[Link to github webpage](https://vdiazroa.github.io/table-generator/)


---
Using **Uploadfile Class:**
usefull to upload csv file and convert them into html tables

using options = { container: "#container-0" } to select the container where will be inserted
```
const table1 = new UploadFile({ container: "#container-0" });
```

---
Using **TableFromForm() Class** without any option as argument, this insctance will use the default container (#cointainer-1)

```
const table2 = new TableFromForm();
```


---

also using **TableFromForm Class, but given data formated as an object**

and using the method "**generateTable**" to show as an example


```
const options = {
  title: "Example",
  data: [
    "Red Dead Redemption 2,Rockstar Games,2018",
    "The Witcher 3,CD Projekt RED,2015",
    "Nier: Automata,Platinum Games,2017",
    "Overwatch,Blizzard,2016"
  ],
  details: { Title: "text", Studio: "text", Year: "number" },
  container: "#container-2"
};

const table3 = new TableFromForm(options);
table3.generateTable();

```
