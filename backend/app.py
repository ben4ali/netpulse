from flask import Flask, request, jsonify
import scapy_helper
import threading

app = Flask(__name__)

scapy_helper = scapy_helper.ScapyHelper()

@app.route("/interfaces", methods=["GET"])
def get_interfaces():
    return jsonify({"interfaces": scapy_helper.interfaces})

@app.route('/set_interface', methods=['POST'])
def set_interface():
    interface_name = request.get_json()['interface_name']
    scapy_helper.set_interface(interface_name)
    return jsonify({'message': 'Interface set successfully'})

@app.route('/get_packets')
def get_packets():
    packets = scapy_helper.get_sniffed_packets()
    return jsonify(packets)

@app.route('/start_sniffing')
def start_sniffing():
    threading.Thread(target=scapy_helper.start_sniffing).start()
    return jsonify({'message': 'Started sniffing packets'})

@app.route('/stop_sniffing')
def stop_sniffing():
    scapy_helper.stop_sniffing()
    return jsonify({'message': 'Stopped sniffing packets'})

@app.route('/check_server_online')
def check_server_online():
    return jsonify({'message': 'Server is online'})

if __name__ == "__main__":
    print("Flask server is now running on port 5001")
    app.run(debug=True, port=5001)