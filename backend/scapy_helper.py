import scapy.all as scapy
import threading

class ScapyHelper:
    def __init__(self):
        self.interfaces = self.get_interfaces()
        self.interface = scapy.conf.iface
        self.sniffed_packets = []
        self.stop_sniffing_event = threading.Event()

    def get_interfaces(self):
        interfaces = []
        for interface in scapy.ifaces.values():
            interfaces.append(interface.name)
        return interfaces

    def set_interface(self, human_interface_name):
        for interface in scapy.ifaces.values():
            if interface.name == human_interface_name:
                self.interface = human_interface_name
                scapy.conf.iface = human_interface_name
                return
        raise Exception(f"Interface {human_interface_name} not found")


    def start_sniffing(self):
        print("STARTING SNIFFING")
        self.sniffed_packets = []
        self.stop_sniffing_event.clear()
        scapy.sniff(iface=self.interface, prn=self.packet_handler, stop_filter=self.stop_filter)

    def packet_handler(self, packet):
        if self.stop_sniffing_event.is_set():
            return 
        packet_details = repr(packet)
        self.sniffed_packets.append(packet_details)

    def stop_sniffing(self):
        print("STOPPING SNIFFING")
        self.stop_sniffing_event.set()

    def stop_filter(self, packet):
        return self.stop_sniffing_event.is_set()

    def get_sniffed_packets(self):
        packets = self.sniffed_packets
        self.sniffed_packets = []
        return packets
    
    def get_inteface(self):
        return self.interface
