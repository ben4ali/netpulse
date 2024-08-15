import scapy.all as scapy
import threading

class ScapyHelper:
    def __init__(self):
        self.interfaces = self.get_interfaces()
        self.interface = scapy.conf.iface
        self.sniffed_packets = []
        self.stop_sniffing_event = threading.Event()  # Event to stop sniffing

    def get_interfaces(self):
        interfaces = []
        for interface in scapy.ifaces.values():
            interfaces.append(interface.name)
        return interfaces

    def set_interface(self, interface_name):
        print("Interface set to: ", interface_name)
        scapy.conf.iface = interface_name

    def start_sniffing(self):
        print("STARTING SNIFFING")
        self.sniffed_packets = []
        self.stop_sniffing_event.clear()  # Clear the event before starting sniffing
        scapy.sniff(iface=self.interface, prn=self.packet_handler, stop_filter=self.stop_filter)

    def packet_handler(self, packet):
        if self.stop_sniffing_event.is_set():
            return  # Exit if stopping sniffing
        packet_details = repr(packet)
        self.sniffed_packets.append(packet_details)

    def stop_sniffing(self):
        print("STOPPING SNIFFING")
        self.stop_sniffing_event.set()  # Set the event to stop sniffing

    def stop_filter(self, packet):
        return self.stop_sniffing_event.is_set()

    def get_sniffed_packets(self):
        packets = self.sniffed_packets
        self.sniffed_packets = []
        return packets
