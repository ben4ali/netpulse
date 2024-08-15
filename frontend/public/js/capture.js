const { ipcRenderer } = require('electron');

const tabs = document.querySelectorAll('.tab');
const packetHolder = document.querySelector('.packetHolder');
const clearBtn = document.getElementById('clearBtn');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const restartBtn = document.getElementById('restartBtn');
const offBtn = document.getElementById('offBtn');
const serverStatusText = document.getElementById('serverStatusText');
const filterInput = document.getElementById('filterInput');
const sheetBtn = document.getElementById('sheetBtn');
const cheatSheet = document.querySelector('.cheatSheet');
const infoHolder = document.querySelector('.infoContent');
const rawHolder = document.querySelector('.rawEncryption');
const interfaceName= document.getElementById('interfaceName');

let packetStream = false;
let packetInterval;
let currentPacketInfo = null;
let sheetOpen = false;


//-----EVENT LISTENERS-----
filterInput.addEventListener('keyup', () => {
    checkFilter();
});
sheetBtn.addEventListener("click",()=>{
    if (sheetOpen){
        gsap.to(cheatSheet,{
            height:"0",
            opacity:0
        })
    }else{
        gsap.to(cheatSheet,{
            height:"8rem",
            opacity:1,
            ease:"back"
        })
    }
    sheetOpen = !sheetOpen
})
playBtn.addEventListener('click', () => {
    console.log(packetStream);
    if (packetStream){return;}
    packetStream=true;
    console.log("Packet Stream Started");
    gsap.to(playBtn, {
        fill: "rgba(35, 140, 108, 0.825)",
    })
    getPacketStream();
});
stopBtn.addEventListener('click', () => {
    console.log("Stopping packet stream");
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
    if (packetStream){return;}
    gsap.to(restartBtn, {
        rotate: 360,
        duration: 0.25,
        onComplete: () => {
            gsap.set(restartBtn, {
                rotate: 0
            })
        }
    })
    gsap.to(playBtn, {
        fill: "rgba(35, 140, 108, 0.825)",
    })
    clearPacketHolder();
    getPacketStream();
});
offBtn.addEventListener('click', () => {
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
tabs[0].addEventListener('click', () => {
    showFrameInfo();
});
tabs[1].addEventListener('click', () => {
    showEthernetInfo();
});
tabs[2].addEventListener('click', () => {
    showIPInfo();
});
tabs[3].addEventListener('click', () => {
    showTransportInfo();
});

//-----FUNCTIONS-----

//--Filtering--
function checkFilter(){
    const filterValue = filterInput.value.toLowerCase();
    filterValue.replace(/\s/g, '');

    if (filterValue.includes("ip.src==")){
        displayIpSrc(filterValue.slice(8));
    }
    else if (filterValue.includes("ip.dst==")){
        displayIpDst(filterValue.slice(8));
    }
    else if (filterValue.includes("port.src==")){
        displayPortSrc(filterValue.slice(9));
    }
    else if (filterValue.includes("port.dst==")){
        displayPortDst(filterValue.slice(9));
    }
    else if (filterValue.includes("protocol==")){
        displayProtocol(filterValue.slice(10));
    }
    else if (filterValue.includes("length==")){
        displayLength(filterValue.slice(8));
    }else{
        displayAll();
    }
}
function displayIpSrc(ip){
    const packets = document.querySelectorAll('.packet');
    packets.forEach(packet => {
        const src = packet.children[2].textContent;
        if (src.includes(ip)){
            packet.style.display = "flex";
        }
        else{
            packet.style.display = "none";
        }
    });
}
function displayIpDst(ip){
    const packets = document.querySelectorAll('.packet');
    packets.forEach(packet => {
        const dst = packet.children[3].textContent;
        if (dst.includes(ip)){
            packet.style.display = "flex";
        }
        else{
            packet.style.display = "none";
        }
    });
}
function displayPortSrc(port){
    const packets = document.querySelectorAll('.packet');
    packets.forEach(packet => {
        const src = packet.children[0].textContent.split(">")[0];
        src.replace(/\s/g, '');
        port = port.slice(1);
        if (src.includes(port)){
            packet.style.display = "flex";
        }
        else{
            packet.style.display = "none";
        }
    });
}
function displayPortDst(port){
    const packets = document.querySelectorAll('.packet');
    packets.forEach(packet => {
        const dst = packet.children[0].textContent.split(">")[1];
        dst.replace(/\s/g, '');
        port = port.slice(1);
        if (dst.includes(port)){
            packet.style.display = "flex";
        }
        else{
            packet.style.display = "none";
        }
    });
}
function displayProtocol(protocol){
    const packets = document.querySelectorAll('.packet');
    packets.forEach(packet => {
        const proto = packet.children[4].textContent.toLowerCase();
        if (proto.includes(protocol)){
            packet.style.display = "flex";
        }
        else{
            packet.style.display = "none";
        }
    });
}
function displayLength(length){
    const packets = document.querySelectorAll('.packet');
    packets.forEach(packet => {
        const len = packet.children[5].textContent;
        if (len.includes(length)){
            packet.style.display = "flex";
        }
        else{
            packet.style.display = "none";
        }
    });
}
function displayAll(){
    const packets = document.querySelectorAll('.packet');
    packets.forEach(packet => {
        packet.style.display = "flex";
    });
}

//-- Packet info display --
function selectTab(tab){
    tabs.forEach(t => {
        t.classList.remove('selectedTab');
    });
    tab.classList.add('selectedTab');
}
function selectPacket(packetDiv) {
    selectTab(tabs[0]);
    showFrameInfo();
    const packets = document.querySelectorAll('.packet');
    packets.forEach(packet => {
        packet.classList.remove('selectedPacket');
    });
    packetDiv.classList.add('selectedPacket');
    const packetFullInfo = packetDiv.getAttribute('data-fullInfo');
    if (currentPacketInfo === packetFullInfo) {
        return;
    }
    rawHolder.firstElementChild.textContent = packetDiv.getAttribute('data-raw');
    currentPacketInfo = packetFullInfo;
}
function showFrameInfo() {
    if (currentPacketInfo === null){return}
    selectTab(tabs[0]);
    // Extracting the length of the packet (from the 'len=' field in the IP section)
    let lengthMatch = currentPacketInfo.match(/len=(\d+)/);
    let frameLength = lengthMatch ? parseInt(lengthMatch[1]) : "Unknown";

    // Calculate the frame size in bits
    let frameBits = frameLength * 8;

    // Extracting protocols by identifying the sections of the packet
    let protocols = [];
    if (currentPacketInfo.includes('<Ether')) protocols.push("Ethernet");
    if (currentPacketInfo.includes('type=IPv4')) protocols.push("IPv4");
    if (currentPacketInfo.includes('proto=tcp')) protocols.push("TCP");
    if (currentPacketInfo.includes('<Raw')) protocols.push("Raw");

    // Generate the current timestamp for arrival time
    let arrivalTime = new Date().toLocaleString();

    // Create the frame information string
    let frameInfo = `
        Frame 1: ${frameLength} bytes on wire (${frameBits} bits), ${frameLength} bytes captured (${frameBits} bits)
        Arrival Time: ${arrivalTime}
        Protocols in frame: ${protocols.join(', ')}
    `;

    // Clear the previous info and display the new frame information
    infoHolder.innerHTML = "";
    frameInfo.split('\n').forEach(info => {
        const p = document.createElement('p');
        p.textContent = info.trim();
        infoHolder.appendChild(p);
    });
}
function showEthernetInfo() {
    if (currentPacketInfo === null){return}
    selectTab(tabs[1]);
    // get ethernet info
    let ethernetMatch = currentPacketInfo.match(/<Ether\s+dst=(\S+)\s+src=(\S+)\s+type=(\S+)/);
    if (ethernetMatch) {
        let destination = ethernetMatch[1];
        let source = ethernetMatch[2];
        let type = ethernetMatch[3];

        // determine type of frame
        let typeDescription = type === "IPv4" ? "IPv4 (0x0800)" : "Unknown";

        // format ethernet info
        let ethernetInfo = `
            Ethernet II
                Destination: ${destination} (Unicast)
                Source: ${source} (Unicast)
                Type: ${typeDescription}
        `;

        // clear element and display new info
        infoHolder.innerHTML = "";
        ethernetInfo.split('\n').forEach(info => {
            const p = document.createElement('p');
            p.textContent = info.trim();
            infoHolder.appendChild(p);
        });
    }
}
function showIPInfo() {
    if (currentPacketInfo === null){return}
    selectTab(tabs[2]);

    // regex
    let ipMatch = currentPacketInfo.match(/<IP\s+version=(\d+)\s+ihl=(\d+)\s+tos=0x(\w+)\s+len=(\d+)\s+id=(\d+)\s+flags=(\S+)\s+frag=(\d+)\s+ttl=(\d+)\s+proto=(\S+)\s+chksum=0x(\w+)\s+src=(\S+)\s+dst=(\S+)/);
    if (ipMatch) {
        let version = ipMatch[1];
        let ihl = ipMatch[2] * 4;
        let dscp = ipMatch[3];
        let totalLength = ipMatch[4];
        let identification = parseInt(ipMatch[5]).toString(16);
        let flags = ipMatch[6];
        let fragOffset = ipMatch[7];
        let ttl = ipMatch[8];
        let protocol = ipMatch[9] === "tcp" ? "TCP (6)" : "Unknown";
        let checksum = ipMatch[10];
        let srcIP = ipMatch[11];
        let dstIP = ipMatch[12];

        // format information
        let ipInfo = `
            Internet Protocol Version ${version}, Src: ${srcIP}, Dst: ${dstIP}
                Version: ${version}
                Header Length: ${ihl} bytes
                Differentiated Services Field: 0x${dscp}
                Total Length: ${totalLength} bytes
                Identification: 0x${identification} (${parseInt(ipMatch[5])})
                Flags: ${flags} (Don't Fragment: ${flags.includes('DF')}, More fragments: ${flags.includes('MF')})
                Fragment offset: ${fragOffset}
                Time to Live: ${ttl}
                Protocol: ${protocol}
                Header checksum: 0x${checksum} [Incorrect, should be corrected]
                Source: ${srcIP}
                Destination: ${dstIP}
        `;

        // clear element and display new info
        infoHolder.innerHTML = "";
        ipInfo.split('\n').forEach(info => {
            const p = document.createElement('p');
            p.textContent = info.trim();
            infoHolder.appendChild(p);
        });
    }
}
function showTransportInfo() {
    if (currentPacketInfo === null){return}
    selectTab(tabs[3]);

    let transportMatch = currentPacketInfo.match(/<TCP\s+sport=(\d+)\s+dport=(\S+)\s+seq=(\d+)\s+ack=(\d+)\s+dataofs=(\d+)\s+reserved=(\d+)\s+flags=(\S+)\s+window=(\d+)\s+chksum=0x(\w+)\s+urgptr=(\d+)/);
    let isTCP = transportMatch !== null;
    
    let transportInfo = "";
    if (isTCP) {
        // TCP packet details
        let srcPort = transportMatch[1];
        let dstPort = transportMatch[2];
        let seqNum = transportMatch[3];
        let ackNum = transportMatch[4];
        let headerLength = transportMatch[5] * 4;
        let flags = transportMatch[7];
        let windowSize = transportMatch[8];
        let checksum = transportMatch[9];
        let urgentPointer = transportMatch[10];

        transportInfo = `
            Transmission Control Protocol, Src Port: ${srcPort}, Dst Port: ${dstPort}
                Source Port: ${srcPort}
                Destination Port: ${dstPort}
                Sequence Number: ${seqNum}
                Acknowledgment Number: ${ackNum}
                Header Length: ${headerLength} bytes
                Flags: ${flags} (Parsed flags here)
                Window Size: ${windowSize}
                Checksum: 0x${checksum}
                Urgent Pointer: ${urgentPointer}
        `;

        tabs[3].firstElementChild.textContent = "TCP";
    } else {
        transportMatch = currentPacketInfo.match(/<UDP\s+sport=(\d+)\s+dport=(\d+)\s+len=(\d+)\s+chksum=0x(\w+)/);
        if (transportMatch) {
            let srcPort = transportMatch[1];
            let dstPort = transportMatch[2];
            let length = transportMatch[3];
            let checksum = transportMatch[4];

            transportInfo = `
                User Datagram Protocol, Src Port: ${srcPort}, Dst Port: ${dstPort}
                    Source Port: ${srcPort}
                    Destination Port: ${dstPort}
                    Length: ${length} bytes
                    Checksum: 0x${checksum}
            `;

            tabs[3].firstElementChild.textContent = "UDP";
        }
    }
    if (transportInfo) {
        infoHolder.innerHTML = "";
        transportInfo.split('\n').forEach(info => {
            const p = document.createElement('p');
            p.textContent = info.trim();
            infoHolder.appendChild(p);
        });
    }
}

//-- Packet Stream
function getPacketStream(){
    fetch('http://localhost:5001/start_sniffing')
        .then(response => response.json())
    packetInterval = setInterval(() => {
        getPacket();
    }, 500);
}
function getPacket() {
    fetch('http://localhost:5001/get_packets')
        .then(response => response.json())
        .then(data => {
            const parsedPackets = data.map((packet, index) => parsePacket(packet));
            parsedPackets.forEach(packet => {
                const packetDiv = document.createElement('div');
                packetDiv.classList.add('packet');

                //add values
                Object.values(packet).forEach(value => {
                    const p = document.createElement('p');
                    if (value !== packet.FullPacketInfo && value !== packet.Raw) {
                        p.textContent = value;
                    }
                    packetDiv.appendChild(p);
                    packetDiv.setAttribute('data-fullInfo', packet.FullPacketInfo);
                    packetDiv.setAttribute('data-raw', packet.Raw);
                    packetDiv.style.opacity = 0;
                    gsap.to(packetDiv, {
                        opacity: 1,
                        duration: 1
                    });
                    packetDiv.addEventListener('click', () => {
                        selectPacket(packetDiv);
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
    const udpRegex = /<UDP\s+sport=(\w+)\s+dport=(\w+)\s+len=(\d+)\s+chksum=\S+\s*\|/;
    const rawRegex = /<Raw\s+load='(.+?)'\s+\|/;

    const etherMatch = packet.match(etherRegex);
    const ipMatch = packet.match(ipRegex);

    if (!ipMatch) {
        return {
            Info: "Packet details could not be parsed."
        };
    }

    const protocol = ipMatch[2].toLowerCase();
    let transportMatch, info;

    // match raw data
    const rawMatch = packet.match(rawRegex);
    let rawHexDump = "";
    if (rawMatch) {
        rawHexDump = formatHexDump(rawMatch[1]);
    }

    // match and parse TCP or UDP
    if (protocol === 'tcp') {
        transportMatch = packet.match(tcpRegex);
        if (transportMatch) {
            info = `${transportMatch[1]} [${transportMatch[5]}] Seq=${transportMatch[3]} Ack=${transportMatch[4]} Len=${rawMatch ? rawMatch[1].length : 0}`;
        }
    } else if (protocol === 'udp') {
        transportMatch = packet.match(udpRegex);
        if (transportMatch) {
            info = `${transportMatch[1]} > ${transportMatch[2]} Len=${transportMatch[3]}`;
        }
    }

    if (etherMatch && transportMatch) {
        return {
            Port: `${transportMatch[1]} > ${transportMatch[2]}`,
            Time: new Date().toLocaleTimeString(),
            Source: ipMatch[3],
            Destination: ipMatch[4],
            Protocol: protocol.toUpperCase(),
            Length: ipMatch[1],
            Info: info || "No additional information available",
            FullPacketInfo: packet,
            Raw: rawHexDump
        };
    } else {
        return {
            Info: "Packet details could not be parsed."
        };
    }
}
function formatHexDump(rawData) {
    let hexDump = "";
    for (let i = 0; i < rawData.length; i++) {
        const hex = rawData.charCodeAt(i).toString(16).padStart(2, '0');
        hexDump += hex + " ";
        if ((i + 1) % 16 === 0) {
            hexDump += "\n";
        }
    }
    return hexDump.trim();
}
function stopPacketStream(){
    fetch('http://localhost:5001/stop_sniffing')
        .then(response => response.json())
        .then(data => {
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

//--status and info
function checkServerOnline(){
    setInterval(() => {
        fetch('http://localhost:5001/check_server_online')
            .then(response => response.json())
            .then(data => {
                serverStatusText.textContent = "Server Status: Online";
                serverStatusText.style.color = "rgb(35, 190, 108,0.9)";
                interfaceName.textContent = data.interface;
            })
            .catch(error => {
                serverStatusText.style.color = "rgba(244, 91, 88, 0.967)";
                serverStatusText.textContent = "Server Status: Offline";
            });
    }, 1000);
}

//-----INIT-----
checkServerOnline()
setTimeout(() => {
    stopPacketStream();
}, 10500);