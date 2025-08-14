import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// ======= CONFIGURATION =======
const RPC_URL = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID"; 
const PRIVATE_KEY = "YOUR_UNIVERSITY_PRIVATE_KEY"; // For minting NFTs
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
const CONTRACT_ABI = [
  "function mintCredential(address to, string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [tokenURI, setTokenURI] = useState("");
  const [mintStatus, setMintStatus] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [credentials, setCredentials] = useState([]);
  const [viewAddress, setViewAddress] = useState("");

  // Initialize with static RPC provider + backend private key
  useEffect(() => {
    const ethProvider = new ethers.providers.JsonRpcProvider(RPC_URL);
    setProvider(ethProvider);

    const ethSigner = new ethers.Wallet(PRIVATE_KEY, ethProvider);
    setSigner(ethSigner);

    const nftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ethSigner);
    setContract(nftContract);
  }, []);

  // Mint NFT Credential (University action)
  const mintCredential = async () => {
    if (!contract || !studentAddress || !tokenURI) {
      alert("Fill required fields");
      return;
    }
    try {
      setMintStatus("Minting...");
      const tx = await contract.mintCredential(studentAddress, tokenURI);
      await tx.wait();
      setMintStatus("Credential minted successfully!");
    } catch (error) {
      console.error(error);
      setMintStatus("Minting failed. See console for details.");
    }
  };

  // Load NFTs for a specific address
  const loadCredentials = async () => {
    if (!contract || !viewAddress) return;
    try {
      const balance = await contract.balanceOf(viewAddress);
      const creds = [];
      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(viewAddress, i);
        const uri = await contract.tokenURI(tokenId);
        creds.push({ tokenId: tokenId.toString(), uri });
      }
      setCredentials(creds);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20, fontFamily: "Arial" }}>
      <h2>NFT Academic Credential Verification (No Wallet Required)</h2>

      {/* UNIVERSITY MINTING PANEL */}
      <div>
        <h3>University: Issue Credential</h3>
        <input
          type="text"
          placeholder="Student Ethereum Address"
          value={studentAddress}
          onChange={(e) => setStudentAddress(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          type="text"
          placeholder="Credential Metadata URI (JSON URL)"
          value={tokenURI}
          onChange={(e) => setTokenURI(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <button onClick={mintCredential}>Mint Credential NFT</button>
        <p>{mintStatus}</p>
      </div>

      <hr />

      {/* VERIFICATION PANEL */}
      <div>
        <h3>View Credentials by Address</h3>
        <input
          type="text"
          placeholder="Enter Ethereum Address to View Credentials"
          value={viewAddress}
          onChange={(e) => setViewAddress(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <button onClick={loadCredentials}>Load Credentials</button>
        <ul>
          {credentials.map((cred) => (
            <li key={cred.tokenId}>
              Token ID: {cred.tokenId} | Metadata URI:
              <a href={cred.uri} target="_blank" rel="noreferrer">
                {" "}{cred.uri}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
