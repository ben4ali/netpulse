import scapy.all as scapy
import io

class ScapyHelper:
    def __init__(self):
        self.interfaces = self.get_interfaces()
        self.interface = scapy.conf.iface
        self.sniffed_packets = []
        self.stop_filter = lambda x: False

    def get_interfaces(self):
        interfaces = []
        for interface in scapy.ifaces.values():
            interfaces.append(interface.name)
        return interfaces

    def set_interface(self, interface_name):
        print("Interface set to: ", interface_name)
        scapy.conf.iface = interface_name

    def start_sniffing(self):
        self.sniffed_packets = []
        scapy.sniff(iface="Wi-Fi", prn=lambda x: self.packet_handler(x))

    def packet_handler(self, packet):
        packet_details = repr(packet)
        self.sniffed_packets.append(packet_details)


    def stop_sniffing(self):
        scapy.sniff(iface="Wi-Fi", stop_filter=self.stop_filter)


    def get_sniffed_packets(self):
        packets = self.sniffed_packets
        self.sniffed_packets = []
        return packets