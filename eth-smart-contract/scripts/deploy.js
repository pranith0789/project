const hre = require("hardhat");

async function main() {
  const MedicalRecords = await hre.ethers.getContractFactory("MedicalRecords");
  const medicalRecords = await MedicalRecords.deploy();

  await medicalRecords.waitForDeployment();
  console.log("✅ Contract deployed to:", await medicalRecords.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
