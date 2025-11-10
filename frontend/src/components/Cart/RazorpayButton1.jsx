// import React, { useEffect } from 'react';

// const RazorpayButton = ({ 
//   amount, 
//   currency = "INR", 
//   name, 
//   email, 
//   contact, 
//   onSuccess, 
//   onError 
// }) => {
  
//   useEffect(() => {
//     // Load Razorpay script dynamically
//     const script = document.createElement('script');
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.async = true;
//     document.body.appendChild(script);

//     return () => {
//       // Cleanup script on component unmount
//       document.body.removeChild(script);
//     };
//   }, []);

//   const handlePayment = () => {
//     // Check if Razorpay is loaded
//     if (!window.Razorpay) {
//       alert('Razorpay SDK not loaded. Please try again.');
//       return;
//     }

//     const options = {
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo_key', // Demo key for testing
//       amount: Math.round(amount * 100), // Amount in paise
//       currency: currency,
//       name: 'Your Store Name',
//       description: 'Purchase from Your Store',
//       image: '/logo.png', // Optional: Add your logo
//       order_id: '', // Optional: If you have order_id from backend
//       handler: function (response) {
//         // Payment successful
//         const paymentData = {
//           razorpay_payment_id: response.razorpay_payment_id,
//           razorpay_order_id: response.razorpay_order_id,
//           razorpay_signature: response.razorpay_signature,
//           amount: amount,
//           currency: currency,
//           status: 'success'
//         };
//         onSuccess(paymentData);
//       },
//       prefill: {
//         name: name || '',
//         email: email || '',
//         contact: contact || ''
//       },
//       notes: {
//         address: 'Customer Address'
//       },
//       theme: {
//         color: '#3399cc'
//       },
//       modal: {
//         ondismiss: function() {
//           console.log('Payment modal closed');
//         }
//       }
//     };

//     try {
//       const rzp = new window.Razorpay(options);
      
//       rzp.on('payment.failed', function (response) {
//         const errorData = {
//           code: response.error.code,
//           description: response.error.description,
//           source: response.error.source,
//           step: response.error.step,
//           reason: response.error.reason,
//           metadata: response.error.metadata
//         };
//         onError(errorData);
//       });

//       rzp.open();
//     } catch (error) {
//       console.error('Error initializing Razorpay:', error);
//       onError({ message: 'Failed to initialize payment gateway' });
//     }
//   };

//   return (
//     <div className="razorpay-button-container">
//       <button
//         type="button"
//         onClick={handlePayment}
//         className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-lg flex items-center justify-center gap-2"
//       >
//         <svg 
//           className="w-5 h-5" 
//           fill="currentColor" 
//           viewBox="0 0 24 24"
//         >
//           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
//         </svg>
//         Pay ₹{amount?.toLocaleString()} with Razorpay
//       </button>
      
//       <div className="mt-3 text-center">
//         <p className="text-xs text-gray-500">
//           Secure payment powered by Razorpay
//         </p>
//         <div className="flex justify-center items-center gap-2 mt-2">
//           <span className="text-xs text-gray-400">Accepts:</span>
//           <div className="flex gap-1">
//             <span className="text-xs bg-gray-100 px-2 py-1 rounded">UPI</span>
//             <span className="text-xs bg-gray-100 px-2 py-1 rounded">Cards</span>
//             <span className="text-xs bg-gray-100 px-2 py-1 rounded">Net Banking</span>
//             <span className="text-xs bg-gray-100 px-2 py-1 rounded">Wallets</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RazorpayButton;
import React, { useEffect } from 'react';

const RazorpayButton = ({
  amount,
  currency = 'INR',
  name,
  email,
  contact,
  orderId, // Razorpay order_id from backend
  onSuccess,
  onError
}) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!window.Razorpay) {
      alert('Razorpay SDK not loaded. Please try again.');
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo_key',
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      name: 'Raphaaa by Citimart',
      description: 'Fashion Purchase',
      image: '/logo.png',
      order_id: orderId, // 🟢 Order ID must be passed from backend
      handler: function (response) {
        const paymentData = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          amount,
          currency,
          status: 'success'
        };
        onSuccess(paymentData);
      },
      prefill: {
        name: name || '',
        email: email || '',
        contact: contact || ''
      },
      notes: {
        address: 'Customer Address'
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal closed by user.');
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        const errorData = {
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason,
          metadata: response.error.metadata
        };
        onError(errorData);
      });

      rzp.open();
    } catch (error) {
      console.error('❌ Razorpay init error:', error);
      onError({ message: 'Failed to initialize payment gateway' });
    }
  };

  return (
    <div className="razorpay-button-container">
      <button
        type="button"
        onClick={handlePayment}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-lg flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        Pay ₹{amount?.toLocaleString()} with Razorpay
      </button>

      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">Secure payment powered by Razorpay</p>
        <div className="flex justify-center items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">Accepts:</span>
          <div className="flex gap-1">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">UPI</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Cards</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Net Banking</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Wallets</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayButton;