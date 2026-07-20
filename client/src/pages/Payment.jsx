import React, { useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; // QR code render karne ke liye

function CourseDetail({ courseId }) {
  const [paymentData, setPaymentData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState(''); // Verification ke liye

  const initiatePayment = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/payment/upi-intent/${courseId}`);
      setPaymentData(res.data);
      setShowModal(true);
    } catch (err) {
      alert("Error initiating payment");
    }
  };

  const handleVerifyPayment = async (e) => {
    e.preventDefault();
    if(!utrNumber) return alert("Please enter the 12-digit UPI Ref/UTR No.");

    // Send UTR to backend for admin verification or payment log
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/courses/verify-payment`, {
        courseId,
        txnId: paymentData.txnId,
        utr: utrNumber,
        amount: paymentData.amount
      }, { headers: { 'x-auth-token': token } });

      alert("Payment submitted! Admin will verify and unlock your course shortly.");
      setShowModal(false);
    } catch (err) {
      alert("Verification submission failed.");
    }
  };

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <button onClick={initiatePayment} style={{ padding: '12px 24px', background: '#6366f1', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontWeight: 'bold' }}>
        ⚡ Scan QR to Enroll
      </button>

      {/* 🎯 PAYMENT MODAL POPUP */}
      {showModal && paymentData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ background: '#1e293b', padding: '30px', borderRadius: '20px', width: '360px', textAlignment: 'center', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
            
            <h3 style={{ margin: '0 0 10px 0' }}>Pay Securely via UPI</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>Course: {paymentData.courseTitle}</p>
            
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8', marginBottom: '20px' }}>
              ₹{paymentData.amount}
            </div>

            {/* QR Code Container */}
            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px' }}>
              <QRCodeSVG value={paymentData.upiUrl} size={200} includeMargin={true} />
            </div>

            <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '20px' }}>
              Scan this QR code using GPay, PhonePe, Paytm, or any UPI App.
            </p>

            {/* Manual Verification Form */}
            <form onSubmit={handleVerifyPayment}>
              <input 
                type="text" 
                placeholder="Enter 12-digit UPI Ref / UTR No." 
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box', marginBottom: '12px' }}
                required
              />
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#22c55e', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                Submit Reference Number
              </button>
            </form>

            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', marginTop: '15px', cursor: 'pointer' }}>
              Cancel Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetail;