import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // 👈 useNavigate add kiya
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 
import '../App.css';

// YouTube URL → Embed URL
const makeEmbedUrl = (url) => {
  if (!url) return '';

  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

  const match = url.match(regExp);

  const videoId =
    match && match[2].length === 11
      ? match[2]
      : null;

  return videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
    : url;
};

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // 👈 navigate function initialize kiya

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false); 
  const [uttrNumber, setUtrNumber] = useState(''); 
  const [submitting, setSubmitting] = useState(false);

  const [studentInfo, setStudentInfo] = useState({
    userName: '',
    userEmail: '',
    phoneNumber: '',
    password: ''
  });

  const [upiString, setUpiString] = useState(''); 

  // Fetch course
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/courses/${id}`)
      .then((res) => {
        setCourse(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Stage 1: Form Validation & UPI Processing Link Initiation
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // ⚠️ CHANGER: Yahan apni actual UPI ID aur company/owner ka naam set karein
    const upiId = "9431277115@ybl"; 
    const payeeName = "SmartLearn"; 
    const amount = course.price;
    const transactionNote = `Enrollment for ${course.title}`.substring(0, 50);
    const trackingRef = `TXN${Date.now()}`;

    const generatedUpiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${trackingRef}`;
    
    setUpiString(generatedUpiString);
    setShowForm(false); 
    setShowQRModal(true);
  };

  // Stage 2: ENROLL FUNCTION
  const handleEnrollAndVerify = async (e) => {
    e.preventDefault();
    
    if(uttrNumber.length < 12) {
      alert("Please enter a valid 12-digit UPI Transaction Ref / UTR Number.");
      return;
    }

    setSubmitting(true);

    try {
      const enrollData = {
        userName: studentInfo.userName,
        userEmail: studentInfo.userEmail,
        phoneNumber: studentInfo.phoneNumber,
        password: studentInfo.password,

        courseId: course._id,
        courseTitle: course.title,

        creator: course.creator || "Admin",
        description: course.description,

        thumbnail: course.thumbnail,

        // SAVE PLAYLIST
        playlist: course.playlist || [],

        // Progress Tracking
        completedLessons: [],
        progress: 0,

        status: "Pending Approval", 
        utr: uttrNumber 
      };
      
      console.log(course);
      console.log("Thumbnail:", course.thumbnail);
 
      const res = await axios.post(
        "http://localhost:5000/api/courses/enroll",
        enrollData
      );

      // ⚠️ CHANGES HERE: Automatic automatic login (localStorage.setItem) hata diya hai
      // taaki user direct dashbaord par na ja sake aur use login karna pade.

      // Success message
      alert(res.data.message || "Enrollment request submitted! Please login to check status.");

      // Close modal views and interfaces completely
      setShowQRModal(false);
      setUtrNumber('');

      // Clear form
      setStudentInfo({
        userName: '',
        userEmail: '',
        phoneNumber: '',
        password: ''
      });

      // 🚀 REDIRECT TO LOGIN: User ko direct student login page par bhej diya
      navigate('/user-login');

    } catch (err) {
      console.log(err);
      alert(
        err.response?.data?.message ||
        "Enrollment request submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="main-wrapper">
        <h2 style={{ textAlign: 'center' }}>
          Loading course details...
        </h2>
      </div>
    );
  }

  // Course not found
  if (!course) {
    return (
      <div
        className="main-wrapper"
        style={{ textAlign: 'center' }}
      >
        <h2>Course not found!</h2>

        <Link to="/" className="back-link">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="details-container">

      <Link to="/" className="back-link">
        ← Back to Courses
      </Link>

      <div className="details-card">

        <h1 className="details-title">
          {course.title}
        </h1>

        <span className="details-instructor">
          Instructed by:
          <strong> {course.creator}</strong>
        </span>

        {/* Thumbnail */}
        <div
          className="details-image-container"
          style={{
            margin: '25px 0',
            textAlign: 'center'
          }}
        >
          <img
            src={
              course.thumbnail ||
              'https://via.placeholder.com/600x350?text=No+Image'
            }
            alt={course.title}
            style={{
              width: '100%',
              maxHeight: '450px',
              objectFit: 'cover',
              borderRadius: '15px',
              boxShadow:
                '0 10px 30px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        {/* Description */}
        <h3 style={{ marginTop: '20px' }}>
          About this course:
        </h3>

        <p
          className="details-desc"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {course.description}
        </p>

        {/* Footer */}
        <div className="details-footer">

          <div>
            <span
              style={{
                color: '#7f8c8d',
                fontSize: '0.9rem',
                display: 'block'
              }}
            >
              Total Investment:
            </span>

            <span className="price-big">
              ₹{course.price}
            </span>
          </div>

          <button
            className="btn-buy"
            onClick={() => setShowForm(true)}
          >
            Enroll Now
          </button>

        </div>
      </div>

      {/* ENROLL FORM MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop">
            <h2>📝 Course Registration</h2>
            <p>Fill your details to enroll</p>

            <form onSubmit={handleFormSubmit}>
              <input
                className="custom-input"
                placeholder="Full Name"
                value={studentInfo.userName}
                onChange={(e) =>
                  setStudentInfo({
                    ...studentInfo,
                    userName: e.target.value
                  })
                }
                required
              />

              <input
                className="custom-input"
                type="email"
                placeholder="Email"
                value={studentInfo.userEmail}
                onChange={(e) =>
                  setStudentInfo({
                    ...studentInfo,
                    userEmail: e.target.value
                  })
                }
                required
              />

              <input
                className="custom-input"
                type="tel"
                placeholder="Phone Number"
                value={studentInfo.phoneNumber}
                onChange={(e) =>
                  setStudentInfo({
                    ...studentInfo,
                    phoneNumber: e.target.value
                  })
                }
                required
              />

              <input
                className="custom-input"
                type="password"
                placeholder="Create Password"
                value={studentInfo.password}
                onChange={(e) =>
                  setStudentInfo({
                    ...studentInfo,
                    password: e.target.value
                  })
                }
                required
              />

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn-blue-full"
                >
                  Proceed to Payment
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-red-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💳 DYNAMIC UPI QR CODE MODAL */}
      {showQRModal && (
        <div className="modal-overlay" style={{ zIndex: 99999 }}>
          <div className="modal-content animate-pop" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h2> Scan QR Code to Pay</h2>
            <p style={{ margin: '5px 0 15px 0', fontSize: '0.95rem', color: '#64748b' }}>
              Amount Payable: <strong style={{ color: '#2563eb', fontSize: '1.2rem' }}>₹{course.price}</strong>
            </p>

            <div style={{ background: '#ffffff', padding: '15px', borderRadius: '12px', display: 'inline-block', marginBottom: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <QRCodeSVG value={upiString} size={220} includeMargin={false} />
            </div>

            

            <form onSubmit={handleEnrollAndVerify} style={{ marginTop: '20px' }}>
              <input
                className="custom-input"
                type="text"
                maxLength="12"
                placeholder="Enter 12-Digit UPI Ref / UTR No."
                value={uttrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, ''))} 
                style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem', letterSpacing: '1px' }}
                required
              />

              <div className="modal-actions" style={{ marginTop: '15px' }}>
                <button
                  type="submit"
                  className="btn-blue-full"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit & Complete Registration"}
                </button>

                <button
                  type="button"
                  onClick={() => { setShowQRModal(false); setShowForm(true); }}
                  className="btn-red-outline"
                  disabled={submitting}
                >
                  ← Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetails;