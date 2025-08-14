// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CredentialNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    event CredentialMinted(uint256 tokenId, address recipient, string tokenURI);

    constructor() ERC721("AcademicCredential", "ACRED") {
        tokenCounter = 0;
    }

    function mintCredential(address recipient, string memory metadataURI) public onlyOwner returns (uint256) {
        tokenCounter++;
        uint256 newTokenId = tokenCounter;
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        emit CredentialMinted(newTokenId, recipient, metadataURI);
        return newTokenId;
    }

    function totalSupply() public view returns (uint256) {
        return tokenCounter;
    }
}
