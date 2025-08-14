// === Replace with your actual contract address and ABI ===
const contractAddress = "YOUR_CONTRACT_ADDRESS";
const contractABI = [ /* Your contract ABI JSON here */ ];

// Replace with your Web3.Storage API key (for IPFS)
const WEB3_STORAGE_TOKEN = "YOUR_WEB3_STORAGE_API_KEY";

let provider, signer, contract;
let web3StorageClient;

async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  contract = new ethers.Contract(contractAddress, contractABI, signer);

  alert(`Wallet connected: ${await signer.getAddress()}`);

  // Initialize Web3.Storage client after wallet connection
  if (!web3StorageClient) {
    web3StorageClient = new Web3Storage.Web3Storage({ token: WEB3_STORAGE_TOKEN });
  }
}

function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

async function uploadMetadataToIPFS(metadata) {
  try {
    const blob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
    const files = [new File([blob], "metadata.json")];
    const cid = await web3StorageClient.put(files);
    return `ipfs://${cid}/metadata.json`;
  } catch (err) {
    alert("IPFS upload failed: " + err.message);
    throw err;
  }
}

async function issueCert(type) {
  if (!contract || !signer) {
    alert("Please connect your wallet first.");
    return;
  }

  let metadata = { certificateType: type, issueDate: new Date().toISOString() };
  let walletAddress;

  try {
    if (type === "10th") {
      metadata.registerNumber = document.getElementById("regNumber10th").value.trim();
      metadata.studentName = document.getElementById("studentName10th").value.trim();
      metadata.dob = document.getElementById("dob10th").value.trim();
      walletAddress = document.getElementById("studentAddress10th").value.trim();
    } else if (type === "12th") {
      metadata.registerNumber = document.getElementById("regNumber12th").value.trim();
      metadata.studentName = document.getElementById("studentName12th").value.trim();
      metadata.dob = document.getElementById("dob12th").value.trim();
      walletAddress = document.getElementById("studentAddress12th").value.trim();
    } else if (type === "diploma") {
      metadata.diplomaNumber = document.getElementById("diplomaNumber").value.trim();
      metadata.studentName = document.getElementById("studentNameDiploma").value.trim();
      metadata.department = document.getElementById("departmentDiploma").value.trim();
      metadata.dob = document.getElementById("dobDiploma").value.trim();
      walletAddress = document.getElementById("studentAddressDiploma").value.trim();
    } else if (type === "college") {
      metadata.rollNumber = document.getElementById("rollNumberCollege").value.trim();
      metadata.studentName = document.getElementById("studentNameCollege").value.trim();
      metadata.degreeTitle = document.getElementById("degreeTitleCollege").value.trim();
      metadata.department = document.getElementById("departmentCollege").value.trim();
      metadata.dob = document.getElementById("dobCollege").value.trim();
      walletAddress = document.getElementById("studentAddressCollege").value.trim();
    } else {
      alert("Unknown certificate type");
      return;
    }

    if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
      alert("Please enter a valid Ethereum wallet address");
      return;
    }

    // Show "minting..." status
    const resultDiv = document.getElementById(`${type}Result`);
    resultDiv.innerHTML = "Uploading metadata to IPFS...";

    // Upload metadata JSON to IPFS
    const tokenURI = await uploadMetadataToIPFS(metadata);

    resultDiv.innerHTML = `Metadata uploaded. Minting NFT...`;

    // Call smart contract mintCredential function
    const tx = await contract.mintCredential(walletAddress, type, tokenURI);
    resultDiv.innerHTML += `<br>Transaction sent: ${tx.hash}`;
    await tx.wait();
    resultDiv.innerHTML += `<br>✅ Credential NFT minted successfully!`;

  } catch (error) {
    alert("Error issuing certificate: " + error.message);
  }
}

async function verifyCredential() {
  if (!contract) {
    alert("Connect your wallet first");
    return;
  }

  const tokenId = document.getElementById("verifyTokenId").value.trim();
  if (!tokenId) {
    alert("Please enter Token ID to verify");
    return;
  }

  try {
    const type = await contract.getCertificateType(tokenId);
    const owner = await contract.ownerOf(tokenId);
    document.getElementById("verifyResult").innerHTML =
      `<p><strong>Certificate Type:</strong> ${type}</p>
       <p><strong>Owner Address:</strong> ${owner}</p>`;
  } catch (err) {
    alert("Verification failed: " + err.message);
  }
}

async function loadMyCredentials() {
  if (!contract || !signer) {
    alert("Connect your wallet first");
    return;
  }

  try {
    const userAddress = await signer.getAddress();
    let balance = await contract.balanceOf(userAddress);

    let display = `<p>You own ${balance.toString()} credential(s):</p><ul>`;

    // For simplicity, let's assume tokens are sequential starting 1 to balance
    // For production, you would need contract enumeration support or event-based indexing
    for (let i = 1; i <= balance; i++) {
      try {
        const owner = await contract.ownerOf(i);
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          const type = await contract.getCertificateType(i);
          display += `<li>Token #${i}: ${type}</li>`;
        }
      } catch {
        // Token i might not be minted; skip
      }
    }
    display += "</ul>";
    document.getElementById("myCredentials").innerHTML = display;
  } catch (err) {
    alert("Error loading credentials: " + err.message);
  }
}
