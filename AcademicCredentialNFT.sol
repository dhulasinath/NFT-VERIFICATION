// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*
 * Academic Credential NFT Contract
 * ---------------------------------
 * - Mints NFTs representing academic certificates.
 * - Only the contract owner (university/admin) can mint.
 * - Stores credential type and metadata URI (usually an IPFS link).
 */
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.0/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.0/contracts/access/Ownable.sol";

contract AcademicCredentialNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // Maps tokenId => certificate type (e.g., "10th", "12th", "Diploma", "College")
    mapping(uint256 => string) private _certificateTypes;

    // Event fired when a credential is issued
    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed to,
        string certificateType,
        string tokenURI
    );

    constructor() ERC721("AcademicCredential", "ACRED") {}

    /**
     * @dev Mint a new academic credential NFT.
     * @param recipient The wallet address of the student
     * @param certificateType The type of certificate ("10th", "Diploma", etc.)
     * @param tokenURI The metadata URI (IPFS link to metadata.json)
     */
    function mintCredential(
        address recipient,
        string memory certificateType,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(certificateType).length > 0, "Certificate type required");
        require(bytes(tokenURI).length > 0, "Token URI required");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _certificateTypes[newTokenId] = certificateType;

        emit CredentialIssued(newTokenId, recipient, certificateType, tokenURI);

        return newTokenId;
    }

    /**
     * @dev Returns the certificate type for a given token ID.
     */
    function getCertificateType(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _certificateTypes[tokenId];
    }
}
