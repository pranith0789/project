# Medical Report Classification and Blockchain Storage

## Overview

This project classifies medical reports, extracts medical terms, and stores results securely using IPFS and blockchain technology. The key steps include:

1. **Upload Medical Reports**: Users upload medical reports in a supported format.
2. **Medical Term Extraction**: The system uses `d4data/biomedical-ner-all` for Named Entity Recognition (NER) to extract relevant medical terms.
3. **Summarization**: The extracted text is summarized using the `t5-small` model.
4. **COVID Classification**: A CNN model classifies whether the uploaded report indicates COVID-positive or negative.
5. **IPFS Storage**: The uploaded file and results are stored in the local IPFS system.
6. **Blockchain Storage**: The IPFS hash of the stored file is written to an Ethereum blockchain (Sepolia testnet) using a smart contract.

---

## Setup Instructions

### 1. Install Dependencies

Ensure you have Python (>=3.10.7) and Node.js installed.

```sh
pip install torch torchvision transformers fastapi uvicorn ipfshttpclient
npm install -g hardhat ethers dotenv
```

### 2. Start the FastAPI Server

Run the FastAPI server to process files and classify reports.

```sh
uvicorn main:app --reload
```

### 3. IPFS Setup

Start the local IPFS daemon:

```sh
ipfs daemon
```

### 4. Smart Contract Deployment

#### **a. Initialize Hardhat Project**

```sh
npx hardhat init
```

#### **b. Compile and Deploy**

```sh
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Fund Your Ethereum Account

Use a Sepolia faucet to get test ETH for transaction fees:

- Visit [Sepolia Faucet](https://sepolia-faucet.pk910.de/)
- Enter your wallet address and request ETH.

---

## Usage

1. **Upload a medical report** via the frontend.
2. **Medical terms are extracted and summarized** automatically.
3. **COVID classification** is performed using the CNN model.
4. **Results and files are stored in IPFS**, and the hash is recorded on the blockchain.
5. **Users can verify the stored hash** through the Ethereum network.

---

## Technologies Used

- **Machine Learning**: `torch`, `transformers`, `biomedical-ner-all`, `t5-small`
- **Backend**: FastAPI, Python
- **Frontend**: React (to be developed)
- **IPFS**: Local storage for files and results
- **Blockchain**: Ethereum smart contracts (Hardhat, Solidity)

---

## Future Enhancements

- Implement Hyperledger Fabric for private blockchain storage.
- Develop a React-based user-friendly frontend.
- Optimize the CNN model for improved COVID detection accuracy.

---

## Author

Developed by Praneeth Reddy.

