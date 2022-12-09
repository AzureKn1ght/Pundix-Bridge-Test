/*
	•	Write a script to query info on the fx-bridge (50 points)
	•	For each type of ERC20 token registered on this bridge (the ethereum side)
	•	The total supply of that token locked in the bridge
	•	Make your first commit of this script to the git repository
*/

// Imports
const { ethers } = require("ethers");
const ERC20ABI = require("./erc20ABI");
const ABI = require("./abi");

const main = () => {
  return fetchBalances();
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

    console.log("---- Tokens Locked ----");

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
      let balance = ethers.utils.formatUnits(result, dec);
      balance = ethers.utils.commify(balance);

      // Display the token balances
      console.log(symbol, balance);
    }
    return tokenList;
  } catch (error) {
    console.error(error);
    return false;
  }
};

main();
