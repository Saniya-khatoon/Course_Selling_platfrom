import React, { useState, useEffect } from 'react';
// import axios from 'react-redux'; 
import axiosDefault from 'axios';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import "./Admin.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const axiosInstance = axiosDefault;

const cleanYouTubeUrl = (url) => {
  if (!url) return "";

  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  let videoId = "";

  if (url.includes("v=")) {
    videoId = url.split("v=")[1].split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  } else {
    videoId = url;
  }

  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
};

// 🔥 SAFE INLINE STYLES OBJECTS (Baki page se koi lena dena nahi, ek dum safe)
const tableStyles = {
  wrapper: {
    width: '100%',
    overflowX: 'auto',
    padding: '20px',
    backgroundColor: '#111827',
    borderRadius: '10px',
    marginTop: '20px'
  },
  heading: {
    color: '#ffffff',
    marginBottom: '15px',
    fontSize: '1.2rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
    textAlign: 'left'
  },
  th: {
    color: '#9ca3af',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '12px'
  },
  row: {
    backgroundColor: '#1f2937'
  },
  td: {
    padding: '14px 12px',
    color: '#e5e7eb',
    fontSize: '0.9rem',
    verticalAlign: 'middle'
  },
  profileName: {
    color: '#ffffff',
    fontSize: '0.95rem',
    display: 'block',
    marginBottom: '2px'
  },
  profileEmail: {
    color: '#9ca3af',
    fontSize: '0.85rem'
  },
  utrBadge: {
    fontWeight: '600',
    color: '#818cf8',
    fontSize: '0.85rem',
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'inline-block'
  },
  pill: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    display: 'inline-block',
    textAlign: 'center',
    minWidth: '130px',
    whiteSpace: 'nowrap'
  },
  approvedPill: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#4ade80',
    border: '1px solid rgba(34, 197, 94, 0.3)'
  },
  pendingPill: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    color: '#facc15',
    border: '1px solid rgba(234, 179, 8, 0.3)'
  },
  actionsFlex: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  btnApprove: {
    backgroundColor: '#22c55e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap'
  },
  btnDelete: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap'
  },
  verifiedText: {
    color: '#4ade80',
    fontWeight: '700',
    fontSize: '0.85rem',
    padding: '0 5px'
  }
};

function Admin() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  
  const [analytics, setAnalytics] = useState({ totalCourses: 0, totalStudents: 0, totalRevenue: 0 });

  const [isEditing, setIsEditing] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    creator: '',
    thumbnail: '',
    category: '',
    playlist: [{ id: Date.now(), title: '', videoUrl: '', resources: '' }], 
    isActive: true 
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchCourses();
      fetchEnrolledStudents();
      fetchAnalytics();
    }
  }, [navigate]);

  const getAuthHeader = () => ({
    headers: { 'x-auth-token': localStorage.getItem('token') }
  });

  const fetchCourses = () => {
    axiosInstance.get('http://localhost:5000/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  };

  const fetchEnrolledStudents = () => {
    axiosInstance.get('http://localhost:5000/api/courses/enrolled-students')
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  };

  const fetchAnalytics = () => {
    axiosInstance.get('http://localhost:5000/api/courses/admin/analytics')
      .then(res => setAnalytics(res.data))
      .catch(err => console.error(err));
  };

  const handleApprove = (id) => {
    if (window.confirm("Have you checked whether the payment has been credited to your bank account?")) {
      axiosInstance.put(`http://localhost:5000/api/courses/enrollment/approve/${id}`, {}, getAuthHeader())
        .then(res => {
          alert("Course Approved Successfully! 🎉");
          fetchEnrolledStudents(); 
          fetchAnalytics();        
        })
        .catch(err => {
          console.error("Approval error details:", err);
          alert("Approval failed!");
        });
    }
  };

  const handlePlaylistChange = (id, field, value) => {
    const updated = formData.playlist.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setFormData({ ...formData, playlist: updated });
  };

  const addVideoField = () => {
    setFormData({
      ...formData,
      playlist: [...formData.playlist, { id: Date.now() + Math.random(), title: '', videoUrl: '', resources: '' }] 
    });
  };

  const removeVideoField = (id) => {
    if (formData.playlist.length === 1) {
      alert("A course must have at least one video!");
      return;
    }
    const filtered = formData.playlist.filter(item => item.id !== id);
    setFormData({ ...formData, playlist: filtered });
  };

  const handleEditClick = (course) => {
    setIsEditing(true);
    setEditCourseId(course._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    const formattedPlaylist =
      course.playlist && course.playlist.length > 0
        ? course.playlist.map((video, index) => ({
            id: video._id || `local-${index}-${Date.now()}`, 
            title: video.title || "",
            videoUrl: video.videoUrl || "",
            resources: video.resources || "", 
          }))
        : [{ id: Date.now(), title: "", videoUrl: "", resources: "" }];

    setFormData({
      title: course.title || "",
      description: course.description || "",
      price: course.price || "",
      creator: course.creator || "",
      thumbnail: course.thumbnail || "",
      category: course.category || "",
      playlist: formattedPlaylist,
      isActive: course.isActive !== undefined ? course.isActive : true 
    });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditCourseId(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      creator: '',
      thumbnail: '',
      category: '',
      playlist: [{ id: Date.now(), title: '', videoUrl: '', resources: '' }],
      isActive: true
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const processedPlaylist = formData.playlist.map(video => ({
      title: video.title,
      videoUrl: cleanYouTubeUrl(video.videoUrl),
      resources: video.resources || "" 
    }));

    const finalData = {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      creator: formData.creator,
      thumbnail: formData.thumbnail,
      category: formData.category,
      playlist: processedPlaylist, 
      isActive: formData.isActive 
    };

    if (isEditing) {
      axiosInstance.put(`http://localhost:5000/api/courses/${editCourseId}`, finalData, { headers: { 'x-auth-token': token } })
        .then(() => {
          alert("Course updated successfully! 🎉");
          cancelEdit();
          fetchCourses(); 
          fetchAnalytics();
        })
        .catch(err => console.error("Frontend Edit Error:", err));
    } else {
      axiosInstance.post('http://localhost:5000/api/courses', finalData, { headers: { 'x-auth-token': token } })
        .then(() => {
          alert("Course added successfully! 🎉");
          cancelEdit();
          fetchCourses(); 
          fetchAnalytics();
        })
        .catch(err => console.error("Frontend Post Error:", err));
    }
  };

  const deleteCourse = (id) => {
    if (window.confirm("Are you sure?")) {
      axiosInstance.delete(`http://localhost:5000/api/courses/${id}`, getAuthHeader())
        .then(() => {
          fetchCourses();
          fetchAnalytics();
          if(isEditing && editCourseId === id) cancelEdit();
        })
        .catch(err => console.error(err));
    }
  };

  const deleteStudent = (id) => {
    if (window.confirm("Remove student?")) {
      axiosInstance.delete(`http://localhost:5000/api/courses/enrollment/${id}`, getAuthHeader())
        .then(() => {
          alert("Student removed!");
          fetchEnrolledStudents();
          fetchAnalytics();
        })
        .catch(err => console.error(err));
    }
  };
  const downloadPDFReport = () => {
  const doc = new jsPDF();

  // ===== Report Title =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Course Selling System", 70, 15);

  doc.setFontSize(14);
  doc.text("Admin Dashboard Report", 72, 23);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated On: ${new Date().toLocaleString()}`,
    14,
    32
  );

  // ===== Summary =====
  const approvedStudents = students.filter(
    (s) => s.status === "Approved"
  ).length;

  const pendingStudents = students.filter(
    (s) => s.status !== "Approved"
  ).length;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Dashboard Summary", 14, 45);

  autoTable(doc, {
    startY: 50,
    theme: "grid",
    head: [["Metric", "Value"]],
    body: [
      ["Total Courses", analytics.totalCourses],
      ["Total Students", analytics.totalStudents],
      ["Approved Students", approvedStudents],
      ["Pending Students", pendingStudents],
      ["Total Revenue", `Rs. ${analytics.totalRevenue}`],
    ],
  });

  // ===== Course Wise Report =====
  const courseStats = {};

  students.forEach((student) => {
    const course = student.courseTitle;
    courseStats[course] = (courseStats[course] || 0) + 1;
  });

  const courseData = Object.keys(courseStats).map((course) => [
    course,
    courseStats[course],
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 12,
    head: [["Course Name", "Enrolled Students"]],
    body: courseData,
    theme: "striped",
  });

  // ===== Student Details =====
  const studentRows = students.map((s) => [
  s.userName,
  s.userEmail,
  s.courseTitle,
  s.utr || s.transactionId || "N/A",
  s.status,
  s.enrolledAt
    ? new Date(s.enrolledAt).toLocaleDateString()
    : "N/A",
]);

  autoTable(doc, {
  startY: doc.lastAutoTable.finalY + 12,
  head: [[
    "Student Name",
    "Email",
    "Course",
    "Transaction ID",
    "Status",
    "Date"
  ]],
  body: studentRows,
  theme: "grid",
  styles: {
    fontSize: 8,
    cellPadding: 2,
  },
  headStyles: {
    fillColor: [41, 128, 185], // Blue Header
    textColor: 255,
    fontStyle: "bold",
  },
});

  doc.save("Admin_Report.pdf");
};

  return (
    <div className="main-wrapper">
      
      <h1 className="page-title">
        Admin Control Center
      </h1>

      <div className="analytics-container">
        <button
  onClick={downloadPDFReport}
  style={{
    marginTop: "10px",
    padding: "10px 15px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
  📄 Download PDF Report
</button>
        <div className="analytics-card">
          <h4>Total Courses</h4>
          <h2>{analytics.totalCourses}</h2>
        </div>

        <div className="analytics-card">
          <h4>Total Students</h4>
          <h2>{analytics.totalStudents}</h2>
        </div>

        <div className="analytics-card" style={{ borderLeft: '4px solid #2ecc71' }}>
          <h4> Total Earnings </h4>
          <h2 style={{ color: '#2ecc71' }}>₹{analytics.totalRevenue || 0}</h2>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='tab-buttons'>
        <button
          className={activeTab === 'courses' ? 'active' : ''}
          onClick={() => { setActiveTab('courses'); cancelEdit(); }}
        >
          📚 Course Manager
        </button>
        <button
          className={activeTab === 'students' ? 'active' : ''}
          onClick={() => setActiveTab('students')}
        >
          👥 Student Enrollment List
        </button>
      </div>

      {activeTab === 'courses' ? (
        <>
          <div className="form-container">
            <h3>
              {isEditing ? "✏️ Modifying Course Details" : "✨ Create New Course Offering"}
            </h3>

            <form onSubmit={handleSubmit}>
              <input className="custom-input" type="text" placeholder="Course Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <textarea className="custom-input" placeholder="Course Description Summary" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required style={{ minHeight: '80px' }} />
              <input className="custom-input" type="number" placeholder="Price (INR)" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              <input className="custom-input" type="text" placeholder="Lead Instructor / Creator Name" value={formData.creator} onChange={(e) => setFormData({ ...formData, creator: e.target.value })} required />
              <input className="custom-input" type="text" placeholder="Thumbnail Image URL Address" value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} />

              <select className="custom-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                <option value="">Select Domain Category</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="AI">AI</option>
                <option value="Design">Design</option>
              </select>

              <div style={{ margin: '18px 0', padding: '10px', backgroundColor: '#0d2a4c', borderRadius: '6px', border: '1px solid #213d61', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  id="isActiveToggle" 
                  checked={formData.isActive} 
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isActiveToggle" style={{ fontWeight: '600', fontSize: '0.95rem', color: '#e7ecf2', cursor: 'pointer' }}>
                  Set Course Status as Active or InActive
                </label>
              </div>

              <h4>Video Syllabus Entries</h4>

              {formData.playlist.map((video) => (
                <div className='playlist-box' key={video.id}>
                  <input className="custom-input" type="text" placeholder="Video Chapter Title" value={video.title} onChange={(e) => handlePlaylistChange(video.id, 'title', e.target.value)} required />
                  <input className="custom-input" type="text" placeholder="YouTube Link URL" value={video.videoUrl} onChange={(e) => handlePlaylistChange(video.id, 'videoUrl', e.target.value)} required />
                  <input className="custom-input" type="text" placeholder="Resource Link (Drive/GitHub/Notes URL)" value={video.resources || ""} onChange={(e) => handlePlaylistChange(video.id, 'resources', e.target.value)} />
                  
                  <button className='remove-btn' type="button" onClick={() => removeVideoField(video.id)} >
                    Remove Row
                  </button>
                </div>
              ))}

              <button className="add-btn" type="button" onClick={addVideoField}>
                + Append Video Lesson
              </button>

              <button className='submit-btn' type="submit" >
                {isEditing ? "Save Configuration Changes" : "Deploy Course Stream"}
              </button>

              {isEditing && (
                <button className="cancel-btn" type="button" onClick={cancelEdit}>
                  Dismiss Actions
                </button>
              )}
            </form>
          </div>

          <div className='course-grid'>
            {courses.map(c => (
              <div key={c._id}>
                <img src={c.thumbnail || 'https://via.placeholder.com/300x180'} alt={c.title}/>
                <div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="category-tag">{c.category}</span>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: c.isActive !== false ? 'rgba(46, 204, 113, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: c.isActive !== false ? '#2ecc71' : '#ef4444',
                        border: c.isActive !== false ? '1px solid rgba(46, 204, 113, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                      }}>
                        {c.isActive !== false ? "● Active" : "○ Inactive"}
                      </span>
                    </div>
                    
                    <h3>{c.title}</h3>
                    <p>{c.description ? c.description.substring(0, 70) : ""}...</p>
                    <div>Instructor: <b>{c.creator}</b></div>
                  </div>
                  <div>
                    <div>₹{c.price}</div>
                    <div>
                      <button onClick={() => handleEditClick(c)}>Edit</button>
                      <button onClick={() => deleteCourse(c._id)} >Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* 🔥 SAFE STRUCTURED LOCAL-OBJECT TABLE LAYOUT */
        <div style={tableStyles.wrapper}>
          <h3 style={tableStyles.heading}>Active System Enrollments</h3>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Student Profile</th>
                <th style={tableStyles.th}>Course Title</th>
                <th style={tableStyles.th}>Transaction Context</th>
                <th style={{ ...tableStyles.th, textAlign: 'center' }}>Status</th>
                <th style={tableStyles.th}>Timestamp</th>
                <th style={{ ...tableStyles.th, textAlign: 'center' }}>Management Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} style={tableStyles.row}>
                  
                  {/* Profile */}
                  <td style={tableStyles.td}>
                    <b style={tableStyles.profileName}>{s.userName}</b>
                    <span style={tableStyles.profileEmail}>{s.userEmail}</span>
                  </td>
                  
                  {/* Course */}
                  <td style={tableStyles.td}>{s.courseTitle}</td>
                  
                  {/* Transaction */}
                  <td style={tableStyles.td}>
                    <span style={tableStyles.utrBadge}>{s.utr || s.transactionId || "N/A"}</span>
                  </td>
                  
                  {/* Status Pill */}
                  <td style={{ ...tableStyles.td, textAlign: 'center' }}>
                    <span style={{ 
                      ...tableStyles.pill, 
                      ...(s.status === 'Approved' ? tableStyles.approvedPill : tableStyles.pendingPill) 
                    }}>
                      {s.status === 'Approved' ? '● Approved' : '● Pending Approval'}
                    </span>
                  </td>
                  
                  {/* Timestamp */}
                  <td style={tableStyles.td}>
                    {s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : 'N/A'}
                  </td>
                  
                  {/* Buttons Controller */}
                  <td style={tableStyles.td}>
                    <div style={tableStyles.actionsFlex}>
                      {s.status !== 'Approved' ? (
                        <button onClick={() => handleApprove(s._id)} style={tableStyles.btnApprove}>
                          ✓ Approve
                        </button>
                      ) : (
                        <span style={tableStyles.verifiedText}>Verified ✓</span>
                      )}
                      <button onClick={() => deleteStudent(s._id)} style={tableStyles.btnDelete}>
                        Delete
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Admin;