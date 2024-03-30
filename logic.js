gsap.registerPlugin('ScrollTrigger');

document.addEventListener('DOMContentLoaded', function main(){
    // Check if page ID is already saved in local storage
    const savedInc = localStorage.getItem('income');
    const savedPageId = localStorage.getItem('pageId');
    if (savedPageId) {
        // If page ID is already saved, set the input field value to the saved page ID
        document.getElementById("page_id_input").value = savedPageId;
    }
    if (savedInc){
        document.getElementById('incomes').innerText = '₹' + savedInc;
    }
    fetchData();

    document.getElementById("form").addEventListener('submit', function submit(event) {
        postData(event);
    })


})

function postData(event){
    event.preventDefault();
    //Post the data to the db
    //dont forget to call fetchData function after updating the code
    //Status: Task completed by Saurabh Suman on 9th March, 2024

    const item = document.getElementById("text").value;
    const price = document.getElementById("amount").value;
    const date = document.getElementById("date").value;
    const pageId = document.getElementById("page_id_input").value; // Get page ID from input field
    if ( item!= "" && price !="" && date !="" && pageId != ""){
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "item": item,
            "price": price,
            "date": date,
            "page_id": pageId // Include page ID in the JSON data
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch("https://notion-api-xrh0.onrender.com/insert-data", requestOptions)
            .then((response) => {
                if (response.ok) {
                    console.log("Posted");
                    document.getElementById("text").value = ""; // Clear the text input field
                    document.getElementById("amount").value = ""; // Clear the amount input field
                    document.getElementById("date").value = ""; // Clear the date input field
                    fetchData(); // Call fetchData function after updating the data
                } else {
                    throw new Error('Failed to add transaction');
                }
            })
            .catch((error) => console.error(error));

        // Save page ID to local storage
        localStorage.setItem('pageId', pageId);
    }
    else{
        document.getElementById('dialog-alert1').style.opacity = 1;
        setTimeout(()=>{document.getElementById('dialog-alert1').style.opacity = 0;}, 2000);
    }
    
}

function manageBalance(){
    let exp =parseFloat((document.getElementById('expenses').innerText).replace('₹',''));
    let inc =parseFloat((document.getElementById('incomes').innerText).replace('₹',''));
    console.log(exp,inc);
    let bal = inc - exp;
    console.log(bal);
    let elem = document.getElementById('balance_amount');
    elem.innerText =bal;
    (bal && bal > 0 ? elem.style.color = 'green' : elem.style.color = 'red')
}

function fetchData() {
    try {
        let expense = 0;
        const ul = document.querySelector('.list-group')
        ul.innerHTML = '';

        fetch('https://notion-api-xrh0.onrender.com/get-data')
        .then((response) => response.json())
        .then((data) => {
            data.results.map((result, index) => {
                let snippet = result.table_row.cells;
                if (index > 18) {
                    expense += parseInt(snippet[1][0].text.content);
                    ul.insertAdjacentHTML('beforeend', `<li id='anim' class="list-group-item d-flex justify-content-between align-items-center">
                                                            <span class="expense-type">${snippet[0][0].text.content}</span>
                                                            <span class="expense-price ml-2">${snippet[1][0].text.content}</span>
                                                            <span class="expense-date ml-2">${snippet[2][0].mention.date.start}</span>
                                                        </li>`);
                }
            });
            gsap.from('#anim',{
                y:"50%",
                opacity:0,
                duration:1,
                delay:0.5,
                scrollTrigger:{
                    trigger:"#anim"
                }
            });
            document.getElementById('expenses').innerText = '₹' + expense;
            manageBalance(); 
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
    } catch (error) {
        console.error(error);
    }
}


// Function to open the modal for managing page ID
function openModal(bool) {
    console.log(bool);
    if (bool === 1){
        document.getElementById("amount_modal").style.display = "block";
    }
    else{
        document.getElementById("page_id_modal").style.display = "block"; 
    }

}

// Function to close the modal for managing page ID
function closeModal(bool) {
    if (bool){
        document.getElementById("amount_modal").style.display = "none";
    }
    else{
        document.getElementById("page_id_modal").style.display = "none";
    }
}

// Function to save the page ID to local storage
function savePageId() {
    const pageId = document.getElementById("page_id_input").value;
    localStorage.setItem('pageId', pageId);
    closeModal(0);
}

function updateIncome(arg){
    const amt = parseFloat(document.getElementById('amt_').value);
    const element = document.getElementById('incomes');
    let inc =parseFloat((element.innerText).replace('₹',''));
    if (isNaN(amt) || amt < 0 || (amt > inc && arg === 'min')){
        console.log(amt);
        document.getElementById('dialog-alert2').style.opacity = 1;
        setTimeout(()=>{document.getElementById('dialog-alert2').style.opacity = 0;}, 2000);
    }
    else{
        arg === 'add' ?  inc = inc + amt : inc = inc - amt;
        element.innerText = '₹' + inc;
        localStorage.setItem('income',inc);
        document.getElementById('amt_').value = '';
        closeModal(1);
        manageBalance();
    }

}