import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import TabBar from '../components/TabBar';

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

interface OrderItem {
  name: string;
  price: number;
  productId: string;
  quantity: number;
}

interface Order {
  id: string;
  createdAt: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  latitude: number;
  longitude: number;
  status: 'pending' | 'in-progress' | 'delivered';
  total: number;
  updatedAt: string;
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

const Map = () => {
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
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

  // Fetch orders from Firebase
  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, []);

  // Sort orders by distance when driver location changes
  useEffect(() => {
    if (driverLocation) {
      const ordersWithDistance = orders.map(order => {
        const distance = L.latLng(driverLocation[0], driverLocation[1])
          .distanceTo(L.latLng(order.latitude, order.longitude));
        return {
          ...order,
          distance
        };
      });

      const sorted = [...ordersWithDistance].sort((a, b) => 
        (a.distance || 0) - (b.distance || 0)
      );

      setSortedOrders(sorted);
    }
  }, [driverLocation, orders]);

  if (!driverLocation) return <div>Loading...</div>;

  return (
    <div className="h-screen flex flex-col">
      {/* Map */}
      <div className="flex-1 relative">
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
              position={[order.latitude, order.longitude]}
              icon={icon}
            >
              <Popup>
                <div>
                  <h3 className="font-semibold">{order.customerName}</h3>
                  <p>{order.deliveryAddress}</p>
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
              to={[selectedOrder.latitude, selectedOrder.longitude]}
            />
          )}
        </MapContainer>
      </div>

      {/* Orders List */}
      <div className="h-1/3 bg-white border-t border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Nearby Orders</h2>
          <div className="space-y-2">
            {sortedOrders.map((order) => (
              <div
                key={order.id}
                className={`p-3 rounded-lg cursor-pointer ${
                  selectedOrder?.id === order.id ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{order.customerName}</h3>
                    <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                {order.distance && (
                  <p className="text-sm text-gray-500 mt-1">
                    {(order.distance / 1000).toFixed(1)} km away
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
};

export default Map;