pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

contract SlonigirafToken is Context, ERC20, ERC20Detailed, ERC20Burnable {
    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () public ERC20Detailed("Slonigiraf Token", "SLON", 18) {
        _mint(_msgSender(), 10000000000000 * (10 ** uint256(decimals())));
    }
} 