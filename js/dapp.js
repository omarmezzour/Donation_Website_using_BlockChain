import { fundingContractConfig } from "./config.js"
let web3;
let fundingContract;
const connectButton = document.getElementById("connectWallet");

connectButton.addEventListener("click", async () => {
    if (window.ethereum == undefined)
        return alert("please install metamask or any other compatible ethereum provider")

    console.log("metamask or other providers are installed")
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        let myAddress = await getMyAddress()
        myAddressEle.innerText = myAddress

        web3 = new Web3(window.ethereum)
        fundingContract = new web3.eth.Contract(fundingContractConfig.ABI, fundingContractConfig.address)

        const balanceWei = await web3.eth.getBalance(myAddress)
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether')
        const balanceDiv = document.getElementById('balanceDiv')
        balanceDiv.innerText = `Balance: ${balanceEth} ETH`

        await loadInfo()
    }
    catch (e) {
        alert(e.message)
    }
});

const loadInfo = async() => {
    fundingContract.methods.status().call()
        .then(data => {
            statusDiv.innerText = data.toString() == "true" ? "In Progress" : "Terminated"
        }).catch(e => console.log(e))

    fundingContract.methods.receipient().call().then(data => {
            receipientDiv.innerText = data
        }).catch(e => console.log(e))

    fundingContract.methods.seuil().call()
        .then(data => {
            seuilDiv.innerText = parseFloat(data) / (10 ** 18) + " ETH"
        }).catch(e => console.log(e))

    web3.eth.getBalance(fundingContractConfig.address).then(data => {
            amountCollectedDiv.innerText = parseFloat(data) /(10 ** 18) +" ETH"
        }).catch(e => console.log(e))

    let nbrDonations = await fundingContract.methods.nbr_donations().call()
    listeDonator.innerHTML = ""
    for (let i = 0; i < nbrDonations; i++)
        fundingContract.methods.donaters(i).call()
            .then(async addrDonator => {
                let amount = await fundingContract.methods.donations(addrDonator).call()
                addDonater(addrDonator, amount)
            })
            .catch(e => console.log(e))
}

const getMyAddress = async () => {
    return (await window.ethereum.request({ method: "eth_accounts" }))[0]
}

const addDonater = (addrDonator, amount) => {
    let tr = document.createElement("tr")
    let td1 = document.createElement("td")
    let td2 = document.createElement("td")
    tr.appendChild(td1)
    tr.appendChild(td2)
    td1.innerText = addrDonator
    td2.innerText = parseFloat(amount) / (10 ** 18)
    listeDonator.appendChild(tr)
}

donateBtn.addEventListener("click", async () => {
    showLoading()
    fundingContract.methods.donate().send({
        from: await getMyAddress(),
        to: fundingContractConfig.address,
        value: amountInput.value
    }).then(async receipt => {

        console.log(receipt)
        amountInput.value = ""
        await loadInfo()
    })
        .catch(e => {
            console.log(e)
        })
        .finally(() => hideLoading())
})

redeemBtn.addEventListener("click", async () => {
    showLoading()
    fundingContract.methods.redeem().send({
        from: await getMyAddress(),
        to: fundingContractConfig.address
    }).then(receipt => {
        console.log(receipt)
        showLinkScan(receipt)
    })
        .catch(e => {
            console.log(e)
            showLinkScan(e)
        }).finally(() => hideLoading())
})
const showLinkScan = (data) => {
    let txHash = data.transactionHash
    let link = "https://sepolia.etherscan.io/tx/" + txHash
    redeemBtn.nextElementSibling.classList.remove("hidden")
    redeemBtn.nextElementSibling.children[0].setAttribute("href", link)
}

main()


const hideLoading = () => {
    loading.classList.add("hidden")
}
const showLoading = () => {
    loading.classList.remove("hidden")
}