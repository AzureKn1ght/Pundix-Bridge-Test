const fetch = require("cross-fetch");
const fs = require("fs");

const main = async () => {
  try {
    const data = await fetchData();
    console.log(data.length);

    const str = JSON.stringify(data);
    fs.writeFileSync("genesis validators.json", str);

    console.log("Data stored successfully!");
  } catch (error) {
    console.error(error);
  }
};

// Get Data Function
const fetchData = async () => {
  try {
    const url_string =
      "https://fx-json.functionx.io/validators?height=1&page=1&per_page=20";
    const response = await fetch(url_string);
    const data = await response.json();
    console.log(data.result.validators);
    return data.result.validators;
  } catch (error) {
    console.error(error);
  }
};

main();
