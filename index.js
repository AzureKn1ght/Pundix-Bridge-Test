/*
	•	Execute the script and store the data (30 points)
	•	Run the script every 5 seconds for 1 minute
	•	Write the data with the timestamp and block height to a csv file labelled “fx-bridge token supply”
	⁃	Present the data in a understandable and presentable format
	•	Stage your changes and make your next commit and to the git repository
*/

// Imports
const { ethers } = require("ethers");
const ERC20ABI = require("./erc20ABI");
const ABI = require("./abi");
const fs = require("fs");

const main = async () => {
  // refreshes clean file to test for each run
  fs.writeFileSync("fx-bridge token supply.csv", "");
  let count = 0;

  // repeat every 5 sec for 1 min
  let repeat = setInterval(() => {
    getBalances();
    count++;

    if (count === 12) clearInterval(repeat);
  }, 5000);
};

const getBalances = async () => {
  const list = await fetchBalances();
  await appendData(list);
};

const fetchBalances = async () => {
  try {
    // connect to some public ethereum rpc provider
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/eth"
    );

    // get list of tokens registered on the bridge
    const con_addr = "0x6f1D09Fed11115d65E1071CD2109eDb300D80A27";
    const contract = new ethers.Contract(con_addr, ABI, provider);
    const tokenList = await contract.getBridgeTokenList();
    let formattedList = new Array();

    // Loop through list of tokens
    for (const token of tokenList) {
      // get token details
      const addr = token.addr;
      const dec = token.decimals;
      const symbol = token.symbol;

      // Get account balance from the token contract
      const tkn = new ethers.Contract(addr, ERC20ABI, provider);
      const result = await tkn.balanceOf(con_addr);

      // Convert the balance to human readable format
      const balance = ethers.utils.formatUnits(result, dec);

      // Add detail
      const row = {
        name: token.name,
        symbol: symbol,
        balance: balance,
        decimals: dec,
        address: addr,
      };
      formattedList.push(row);
    }
    return formattedList;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const appendData = async (items) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/eth"
    );

    // get block height and timestamp
    const blockHeight = await provider.getBlockNumber();
    const block = await provider.getBlock(blockHeight);
    const timestamp = block.timestamp;
    const convertedDate = new Date(timestamp * 1000);

    let csv = "";
    // Loop the array of objects
    for (let row = 0; row < items.length; row++) {
      let keysAmount = Object.keys(items[row]).length;
      let keysCounter = 0;

      // If this is the first row, generate the headings
      if (row === 0) {
        // Append the block and timestamp header first
        csv += "Block Height, Timestamp, Date\r\n";
        csv += `${blockHeight}, ${timestamp}, ${convertedDate}\r\n`;
        csv += "\r\n";

        // Loop each property of the object
        for (let key in items[row]) {
          // This is to not add a comma at the last cell
          // The '\r\n' adds a new line
          csv += key + (keysCounter + 1 < keysAmount ? "," : "\r\n");
          keysCounter++;
        }
      } else {
        for (let key in items[row]) {
          csv +=
            items[row][key] + (keysCounter + 1 < keysAmount ? "," : "\r\n");
          keysCounter++;
        }
      }

      keysCounter = 0;
    }
    csv += "\r\n\r\n";

    // Append data to the file
    fs.appendFileSync("fx-bridge token supply.csv", csv);
    console.log(csv);
  } catch (error) {
    console.error(error);
  }
};

main();
