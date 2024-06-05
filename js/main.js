let amountDiv = document.getElementById("amountDiv")
let amountInput = document.getElementById("amountInput")
amountInput.addEventListener("input",()=>{
    if(!parseInt(amountInput.value))
        amountDiv.innerText="0 ETH"
    else
        amountDiv.innerText = parseFloat(amountInput.value)/10**18 +" ETH"
})