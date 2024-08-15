const { ipcRenderer } = require('electron');
const capturePlaceHolder = document.getElementById("capturePlaceHolder");
const startBtn = document.getElementById("startBtn");
const interfaces = document.querySelectorAll(".interface");
const interfaceHolder =document.querySelector(".interfaceHolder")

let interfaceChosen = false;
let currentInterface = null;


setTimeout(() => {
    getAllInterfaces();
}, 1000);




function getAllInterfaces() {
    fetch('http://localhost:5001/interfaces')
    .then(response => response.json())
    .then(data => {

        //disable loader
        gsap.to(".loader",{
            opacity: 0,
            duration: 1
        })


        data.interfaces.forEach(interface => {
            const interfaceDiv = document.createElement("div");
            interfaceDiv.classList.add("interface");
            const h5 = document.createElement("h5");
            h5.textContent = interface;
            interfaceDiv.appendChild(h5);
            const graph = document.createElement("div");
            graph.classList.add("graph");
            interfaceDiv.appendChild(graph);
            interfaceHolder.appendChild(interfaceDiv);
            
            interfaceDiv.addEventListener("click", () => {
                setSelectedInterface(interfaceDiv);
                capturePlaceHolder.textContent = "Capture "+interfaceDiv.firstElementChild.textContent;

                startBtn.style.color = "white";
                startBtn.style.opacity = 1;
                startBtn.style.backgroundColor = "rgba(35, 22, 108, 0.825)";

                if (!interfaceChosen) {
                    interfaceChosen = true;
                    startBtn.addEventListener("click", () => {
                        setInterface(currentInterface);
                        ipcRenderer.invoke('change-page', 'capture.html');
                    });
                }


            });
        });
        gsap.from(interfaceHolder.children, {
            duration: 0.75,
            x: 100,
            opacity: 0,
            stagger: 0.15
        });

    })
    .catch(error => {
        setTimeout(() => {
            getAllInterfaces();
        }, 2000);
        console.error(error);
    });
}

function setInterface(interfaceName){
    fetch("http://localhost:5001/set_interface", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({interface_name: interfaceName})
    })
}

function setSelectedInterface(interface) {
    document.querySelectorAll(".interface").forEach(interface => {
        interface.classList.remove("selectedInterface");
    });
    currentInterface = interface.firstElementChild.textContent;
    interface.classList.add("selectedInterface");
    console.log("currentInterface: ", currentInterface);
}