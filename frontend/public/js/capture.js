const { ipcRenderer } = require('electron');

const switchInterfaceBtn = document.getElementById("switchInterface")
const tabs = document.querySelectorAll('.tab');
const packetHolder = document.querySelector('.packetHolder');
const clearBtn = document.getElementById('clearBtn');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const restartBtn = document.getElementById('restartBtn');
const offBtn = document.getElementById('offBtn');

let packetStream = false;

playBtn.addEventListener('click', () => {
    if (packetStream){return;}
    gsap.to(playBtn, {
        fill: "rgba(35, 140, 108, 0.825)",
    })
    getPacketStream();
});
stopBtn.addEventListener('click', () => {
    gsap.to(stopBtn, {
        fill: "rgba(1950, 22, 108, 0.825)",
        duration: 0.25,
        onComplete:()=>{
            stopBtn.style.fill = "rgb(255,255,255,0.6)";
        }
    })
    playBtn.style.fill = "rgb(255,255,255,0.6)";
    stopPacketStream();
});
restartBtn.addEventListener('click', () => {
    gsap.to(restartBtn, {
        rotate: 360,
        onComplete: () => {
            gsap.set(restartBtn, {
                rotate: 0
            })
        }
    })
    clearPacketHolder();
    getPacketStream();
});
offBtn.addEventListener('click', () => {
    ipcRenderer.invoke('change-page', 'index.html');
});

switchInterfaceBtn.addEventListener('click', () => {
    ipcRenderer.invoke('change-page', 'index.html');
});
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        selectTab(tab);
    });
});
clearBtn.addEventListener('click', () => {
    clearPacketHolder();
});

function selectTab(tab){
    tabs.forEach(t => {
        t.classList.remove('selectedTab');
    });
    tab.classList.add('selectedTab');
}


let packetInterval;

function getPacketStream(){
    fetch('http://localhost:5001/start_sniffing')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            packetStream = true;
        })
        .catch(error => {
            console.error(error);
        });

    packetInterval = setInterval(() => {
        getPacket();
    }, 2000);
}

function getPacket() {
    fetch('http://localhost:5001/get_packets')
        .then(response => response.json())
        .then(data => {
            const parsedPackets = data.map((packet, index) => parsePacket(packet));
            console.log(parsedPackets);

            parsedPackets.forEach(packet => {
                const packetDiv = document.createElement('div');
                packetDiv.classList.add('packet');

                // Append only the values, without labels
                Object.values(packet).forEach(value => {
                    const p = document.createElement('p');
                    p.textContent = value;
                    packetDiv.appendChild(p);
                    packetDiv.style.opacity = 0;
                    gsap.to(packetDiv, {
                        opacity: 1,
                        duration: 1
                    });
                });
                if (packetDiv.lastElementChild.textContent !== "Packet details could not be parsed.") {
                    packetHolder.appendChild(packetDiv);
                }
            });
            packetHolder.scrollTop = packetHolder.scrollHeight;
        })
        .catch(error => {
            console.error(error);
        });
}

function parsePacket(packet) {
    const etherRegex = /<Ether\s+dst=([a-f0-9:]+)\s+src=([a-f0-9:]+)\s+type=\w+\s+\|/;
    const ipRegex = /<IP\s+version=\d\s+ihl=\d+\s+tos=\S+\s+len=(\d+)\s+id=\d+\s+flags=\S+\s+frag=\d+\s+ttl=\d+\s+proto=(\w+)\s+chksum=\S+\s+src=([0-9.]+)\s+dst=([0-9.]+)\s+\|/;
    const tcpRegex = /<TCP\s+sport=(\w+)\s+dport=(\w+)\s+seq=(\d+)\s+ack=(\d+)\s+dataofs=\d+\s+reserved=\d+\s+flags=(\S+)\s+window=\d+\s+chksum=\S+\s+urgptr=\d+\s*\|/;
    const rawRegex = /<Raw\s+load='(.+?)'\s+\|/;

    const etherMatch = packet.match(etherRegex);
    const ipMatch = packet.match(ipRegex);
    const tcpMatch = packet.match(tcpRegex);
    const rawMatch = packet.match(rawRegex);

    if (etherMatch && ipMatch && tcpMatch) {
        return {
            Port: `${tcpMatch[1]} -> ${tcpMatch[2]}`,
            Time: new Date().toLocaleTimeString(),
            Source: ipMatch[3],
            Destination: ipMatch[4],
            Protocol: ipMatch[2].toUpperCase(),
            Length: ipMatch[1],
            Info: `${tcpMatch[1]} [${tcpMatch[5]}] Seq=${tcpMatch[3]} Ack=${tcpMatch[4]} Len=${rawMatch ? rawMatch[1].length : 0}`
        };
    } else {
        return {
            Info: "Packet details could not be parsed."
        };
    }
}

function stopPacketStream(){
    fetch('http://localhost:5001/stop_sniffing')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            packetStream = false;
        })
        .catch(error => {
            console.error(error);
        });
    clearInterval(packetInterval);
}

function clearPacketHolder(){
    packetHolder.innerHTML = "";
}

getPacketStream();
setTimeout(() => {
    stopPacketStream();
}, 10500);