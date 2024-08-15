# Netpulse - Network Analyzer Native App

**⚠️ **WARNING** ⚠️**

**This application is intended for use only on your own network or with explicit permission. Unauthorized network monitoring is illegal and unethical.**

---

## Overview

**Network Analyzer** is a native application designed to help you capture and analyze network packets. The app provides a simple and intuitive user interface to view and interpret the data packets transmitted over your network.

The application is built using:

- **Electron (Node.js)** for the frontend, offering a user-friendly interface.
- **Flask** for the backend server, handling the processing and management of network data.
- **Scapy** library for Python, used for capturing and manipulating network packets.

## Features

- **Capture Packets:** Monitor and capture network packets on your local network.
- **Detailed Analysis:** View detailed information about each packet, including Ethernet, IP, TCP, and UDP protocols.
- **Simple UI:** An easy-to-use interface for understanding and analyzing network basics.

## Getting Started

To get started with the Network Analyzer app, follow these steps:

1. **Set Up the Backend**

   Navigate to the `backend` folder and run the Flask server:

   ```bash
   python app.py


2. **Set Up the Frontend**

   Open a new terminal, navigate to the frontend folder, and start the Electron app:

   ```bash
   npm start

The application will launch, allowing you to start capturing packets and analyzing their details through the UI.



## Usage

- **Capture Packets:** Use the interface to start capturing packets from your network.
- **Analyze Packets:** Click on packets to view detailed information about their contents, including Ethernet, IP, TCP, and UDP data.


---

© 2024 Ali Benkarrouch. Made and designed by Ali Benkarrouch.
