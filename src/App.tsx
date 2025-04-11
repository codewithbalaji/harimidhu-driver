import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icons in Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Order {
  id: string;
  address: string;
  status: 'pending' | 'in-progress' | 'delivered';
  customerName: string;
  location: {
    lat: number;
    lng: number;
  };
  distance?: number;
}

// Routing component
const Routing = ({ from, to }: { from: [number, number], to: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(from[0], from[1]),
        L.latLng(to[0], to[1])
      ],
      routeWhileDragging: true,
      show: true,
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, from, to]);

  return null;
};

const App = () => {
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      address: 'Ambattur OT',
      status: 'pending',
      customerName: 'Ramesh Kumar',
      location: {
        lat: 13.11993005811054,
        lng: 80.15061845202142
      }
    },
    {
      id: '2',
      address: 'Avadi Bus Depot',
      status: 'pending',
      customerName: 'Suresh Babu',
      location: {
        lat: 13.120812213440539,
        lng: 80.10200465256429
      }
    },
    {
      id: '3',
      address: 'Kalikuppam Tea Kadai Bus Stop',
      status: 'pending',
      customerName: 'Mohan Raj',
      location: {
        lat: 13.133081544676076,
        lng: 80.17413532133594
      }
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortedOrders, setSortedOrders] = useState<Order[]>([]);

  // Get driver's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Sort orders by distance when driver location changes
  useEffect(() => {
    if (driverLocation) {
      const ordersWithDistance = orders.map(order => {
        const distance = L.latLng(driverLocation[0], driverLocation[1])
          .distanceTo(L.latLng(order.location.lat, order.location.lng));
        return {
          ...order,
          distance: distance
        };
      });

      const sorted = [...ordersWithDistance].sort((a, b) => 
        (a.distance || 0) - (b.distance || 0)
      );

      setSortedOrders(sorted);
    }
  }, [driverLocation, orders]);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  if (!driverLocation) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Nearby Orders</h2>
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <div
              key={order.id}
              className={`p-4 rounded-lg cursor-pointer ${
                selectedOrder?.id === order.id ? 'bg-blue-100' : 'bg-white'
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <h3 className="font-semibold">{order.customerName}</h3>
              <p className="text-sm text-gray-600">{order.address}</p>
              <div className="flex justify-between items-center mt-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {order.status}
                </span>
                {order.distance && (
                  <span className="text-sm text-gray-500">
                    {(order.distance / 1000).toFixed(1)} km away
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="w-3/4">
        <MapContainer
          center={driverLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={driverLocation} icon={icon}>
            <Popup>Your Location</Popup>
          </Marker>
          {orders.map((order) => (
            <Marker
              key={order.id}
              position={[order.location.lat, order.location.lng]}
              icon={icon}
            >
              <Popup>
                <div>
                  <h3 className="font-semibold">{order.customerName}</h3>
                  <p>{order.address}</p>
                  <p className={`text-sm ${
                    order.status === 'pending' ? 'text-yellow-800' :
                    order.status === 'in-progress' ? 'text-blue-800' :
                    'text-green-800'
                  }`}>
                    Status: {order.status}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
          {selectedOrder && (
            <Routing
              from={driverLocation}
              to={[selectedOrder.location.lat, selectedOrder.location.lng]}
            />
          )}
        </MapContainer>
      </div>

      {/* Status Update Panel */}
      {selectedOrder && (
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-semibold mb-2">Update Status</h3>
          <div className="space-x-2">
            <button
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded"
              onClick={() => updateOrderStatus(selectedOrder.id, 'pending')}
            >
              Pending
            </button>
            <button
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded"
              onClick={() => updateOrderStatus(selectedOrder.id, 'in-progress')}
            >
              In Progress
            </button>
            <button
              className="px-3 py-1 bg-green-100 text-green-800 rounded"
              onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
            >
              Delivered
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;