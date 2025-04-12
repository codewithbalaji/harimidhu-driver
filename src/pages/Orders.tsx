import { useState, useEffect } from 'react'
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import TabBar from '../components/TabBar'

interface OrderItem {
  name: string
  price: number
  productId: string
  quantity: number
}

interface Order {
  id: string
  createdAt: string
  customerId: string
  customerName: string
  customerPhone: string
  deliveryAddress: string
  items: OrderItem[]
  latitude: number
  longitude: number
  status: 'pending' | 'out-for-delivery' | 'delivered'
  total: number
  updatedAt: string
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedStatus, setSelectedStatus] = useState<'out-for-delivery' | 'delivered'>('out-for-delivery')
  const [orderToDeliver, setOrderToDeliver] = useState<Order | null>(null)

  // Fetch orders from Firebase
  useEffect(() => {
    const ordersRef = collection(db, 'orders')
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
      // Filter out pending orders
      const filteredOrders = ordersData.filter(order => 
        order.status === 'out-for-delivery' || order.status === 'delivered'
      )
      setOrders(filteredOrders)
    })

    return () => unsubscribe()
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      setOrderToDeliver(null)
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const filteredOrders = orders.filter(order => 
    selectedStatus === 'out-for-delivery' ? order.status === 'out-for-delivery' : order.status === 'delivered'
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>

        {/* Status Filter */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedStatus('out-for-delivery')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              selectedStatus === 'out-for-delivery' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            Out for Delivery
          </button>
          <button
            onClick={() => setSelectedStatus('delivered')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              selectedStatus === 'delivered' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            Delivered
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{order.customerName}</h3>
                  <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                  <p className="text-sm text-gray-500 mt-1">{order.customerPhone}</p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  order.status === 'out-for-delivery' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {order.status === 'out-for-delivery' ? 'Out for Delivery' : 'Delivered'}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">₹{order.total}</span>
                </div>
              </div>

              {order.status === 'out-for-delivery' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setOrderToDeliver(order)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {orderToDeliver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delivery</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to mark this order as delivered?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setOrderToDeliver(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => updateOrderStatus(orderToDeliver.id, 'delivered')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  )
}

export default Orders