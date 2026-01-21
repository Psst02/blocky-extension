console.log("This works");

const toggleSwitch = document.querySelector('input[type="checkbox"]');
const statusText = document.getElementById("status")
toggleSwitch.addEventListener("change", (e) => {
    if (e.target.checked) {
        statusText.innerHTML = 'Ad blocking is <strong>ON</strong>';
    } else {
        statusText.innerHTML = 'Ad blocking is <strong>OFF</strong>';
    }
});