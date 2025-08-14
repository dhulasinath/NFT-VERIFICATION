async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying using account:", deployer.address);

  const CredentialNFT = await ethers.getContractFactory("CredentialNFT");
  const contract = await CredentialNFT.deploy();

  console.log("Contract deployed at:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
