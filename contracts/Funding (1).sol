// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract Funding {

    uint256 public seuil ; // un seuil à atteindre
    uint8 public constant ratio = 5;// TODO : constante, le pourcentage que va prendre le createur du contract
    address public owner ; // le createur du contract
    address[] public donaters;
    mapping(address => uint256) public donations; //doneter and amount
    address public receipient; // association
    bool public status; // si le contract atteint le seuil

    
    constructor(uint256 _seuil, address _recipient) {
        seuil = _seuil;
        owner = msg.sender; // L'adresse qui déploie le contrat devient le propriétaire
        receipient = _recipient;
        status = true; // Le contrat est actif dès son déploiement
    }

    function nbr_donations() public view returns(uint256){
        return donaters.length;
    }
    function changeOwner(address _owner) public {
        if(msg.sender==owner)
            owner = _owner;
        else 
            revert("you must be the owner");
    }

    function donate() public payable { //recoie de l'Eth
        if (!status) {
            revert("Le contrat n'est plus actif"); // revert transaction with an error message
        }
        if(donations[msg.sender]==0)
            donaters.push(msg.sender);
        //require(status, "Le contrat n'est plus actif"); //il faut que le contract soit tjrs actif
        uint256 donationAmount = msg.value; //montant Eth envoyé en wei
        uint256 ownerAmount = (donationAmount * ratio) / 100;
        donations[msg.sender] += donationAmount; //mapping entre donater et le montant de don
        payable(owner).transfer(ownerAmount); //donner le ownerAmount au owner
    }
    
    function redeem() public {
        /**require permet de s'assurer que certaines conditions sont 
        remplies avant de continuer l'exécution d'une fonction. Si ces conditions 
        ne sont pas remplies, la transaction est annulée**/
        //address(this).balance : le solde actuel en Ether du contrat.
        //seuil et address(this).balance doivent avoir la meme unité
        require(address(this).balance >= seuil, "Seuil non atteint"); //si el solde accumulé est encore infér au seuil, on ne fait pas le transfert à l'association
        require(status, "Le contrat n'est plus actif");
        payable(receipient).transfer(address(this).balance);
        status = false; // Désactiver le contrat*
        //selfdestruct(payable(receipient));
    }

    receive() external payable {
        donate();
    }

    fallback() external payable {
        donate();
    }

   /*
   TODO:
    functions: 
    constructor => init : seuil, owner, receipient, status
    donate => send ration*amount -> owner 
    redeem => teste seuil => si true => send all solde to receipient
        => update status false
        => ! self destruct !
    receive et fallback
   */
}