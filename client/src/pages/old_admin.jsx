import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import '../App.css';
import { useNavigate } from 'react-router-dom';



const cleanYouTubeUrl = (url) => {
  if (!url) return "";

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

function Admin() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  
  // Analytics State
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
    playlist: [{ id: Date.now(), title: '', videoUrl: '' }]
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
    axios.get('http://localhost:5000/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  };

  const fetchEnrolledStudents = () => {
    axios.get('http://localhost:5000/api/courses/enrolled-students')
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  };

  const fetchAnalytics = () => {
    axios.get('http://localhost:5000/api/courses/admin/analytics')
      .then(res => setAnalytics(res.data))
      .catch(err => console.error(err));
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
      playlist: [...formData.playlist, { id: Date.now() + Math.random(), title: '', videoUrl: '' }]
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
          id: Date.now() + index,
          title: video.title,
          videoUrl: video.videoUrl,
        }))
      : [{ id: Date.now(), title: "", videoUrl: "" }];

  setFormData({
    title: course.title,
    description: course.description,
    price: course.price,
    creator: course.creator,
    thumbnail: course.thumbnail || "",
    category: course.category || "",
    playlist: formattedPlaylist,
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
      playlist: [{ id: Date.now(), title: '', videoUrl: '' }]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const processedPlaylist = formData.playlist.map(video => ({
      title: video.title,
      videoUrl: cleanYouTubeUrl(video.videoUrl)
    }));

    const finalData = { ...formData, playlist: processedPlaylist };

    if (isEditing) {
      axios.put(`http://localhost:5000/api/courses/${editCourseId}`, finalData, { headers: { 'x-auth-token': token } })
        .then(() => {
          alert("Course updated successfully!");
          cancelEdit();
          fetchCourses();
          fetchAnalytics();
        })
        .catch(err => console.error(err));
    } else {
      axios.post('http://localhost:5000/api/courses', finalData, { headers: { 'x-auth-token': token } })
        .then(() => {
          alert("Course added successfully!");
          cancelEdit();
          fetchCourses();
          fetchAnalytics();
        })
        .catch(err => console.error(err));
    }
  };

  const deleteCourse = (id) => {
    if (window.confirm("Are you sure?")) {
      axios.delete(`http://localhost:5000/api/courses/${id}`, getAuthHeader())
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
      axios.delete(`http://localhost:5000/api/courses/enrollment/${id}`, getAuthHeader())
        .then(() => {
          alert("Student removed!");
          fetchEnrolledStudents();
          fetchAnalytics();
        })
        .catch(err => console.error(err));
    }
  };

  return (
    <div className="main-wrapper" style={{ padding: '30px', backgroundColor: '#f4f7f9', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      
      <h1 className="page-title" style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px', fontWeight: '700' }}>
        Admin Control Center
      </h1>

      {/* 📈 ANALYTICS CARDS SECTION */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '35px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', minWidth: '200px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #3498db', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d', fontWeight: '600', textTransform: 'uppercase' }}>Total Courses</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50', marginTop: '5px' }}>{analytics.totalCourses}</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', minWidth: '200px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #2ecc71', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d', fontWeight: '600', textTransform: 'uppercase' }}>Total Students</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50', marginTop: '5px' }}>{analytics.totalStudents}</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', minWidth: '200px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #e67e22', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d', fontWeight: '600', textTransform: 'uppercase' }}>Estimated Signups</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50', marginTop: '5px' }}>{analytics.totalStudents} Users</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
        <button
          onClick={() => { setActiveTab('courses'); cancelEdit(); }}
          style={{ padding: '10px 24px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: activeTab === 'courses' ? '#2c3e50' : '#fff', color: activeTab === 'courses' ? '#fff' : '#2c3e50', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        >
          📚 Course Manager
        </button>
        <button
          onClick={() => setActiveTab('students')}
          style={{ padding: '10px 24px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: activeTab === 'students' ? '#2c3e50' : '#fff', color: activeTab === 'students' ? '#fff' : '#2c3e50', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        >
          👥 Student Enrollment List
        </button>
      </div>

      {activeTab === 'courses' ? (
        <>
          {/* Add/Edit Course Form Block */}
          <div style={{ maxWidth: '650px', margin: '0 auto 40px auto', background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: isEditing ? '2px solid #e67e22' : 'none' }}>
            <h3 style={{ textAlign: 'center', margin: '0 0 25px 0', color: isEditing ? '#e67e22' : '#2c3e50', fontSize: '1.3rem' }}>
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

              <h4 style={{ color: '#34495e', margin: '25px 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Video Syllabus Entries</h4>

              {formData.playlist.map((video) => (
                <div key={video.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eaedf1', borderRadius: '10px', backgroundColor: '#fcfdfd' }}>
                  <input className="custom-input" type="text" placeholder="Video Chapter Title" value={video.title} onChange={(e) => handlePlaylistChange(video.id, 'title', e.target.value)} required />
                  <input className="custom-input" type="text" placeholder="YouTube Link URL" value={video.videoUrl} onChange={(e) => handlePlaylistChange(video.id, 'videoUrl', e.target.value)} required />
                  <button type="button" onClick={() => removeVideoField(video.id)} style={{ padding: '6px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                    Remove Row
                  </button>
                </div>
              ))}

              <button type="button" onClick={addVideoField} style={{ marginBottom: '25px', padding: '8px 16px', background: '#34495e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                + Append Video Lesson
              </button>

              <button type="submit" style={{ width: '100%', padding: '12px', background: isEditing ? '#e67e22' : '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: '0.2s' }}>
                {isEditing ? "Save Configuration Changes" : "Deploy Course Stream"}
              </button>

              {isEditing && (
                <button type="button" onClick={cancelEdit} style={{ width: '100%', marginTop: '10px', padding: '12px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                  Dismiss Actions
                </button>
              )}
            </form>
          </div>

          {/* Cards Display Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
            {courses.map(c => (
              <div key={c._id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <img src={c.thumbnail || 'https://via.placeholder.com/300x180'} alt={c.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.category}</span>
                    <h3 style={{ margin: '5px 0 10px 0', color: '#2c3e50', fontSize: '1.1rem' }}>{c.title}</h3>
                    <p style={{ color: '#7f8c8d', fontSize: '0.9rem', margin: '0 0 12px 0' }}>{c.description.substring(0, 70)}...</p>
                    <div style={{ fontSize: '0.85rem', color: '#34495e', marginBottom: '10px' }}>Instructor: <b>{c.creator}</b></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2ecc71', marginBottom: '15px' }}>₹{c.price}</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleEditClick(c)} style={{ flex: 1, padding: '8px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                      <button onClick={() => deleteCourse(c._id)} style={{ flex: 1, padding: '8px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Enrolled Students Table Card Panel Layout */
        <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Active System Enrollments</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #edf2f7', color: '#7f8c8d', fontSize: '0.9rem' }}>
                <th style={{ padding: '12px' }}>Student Profile</th>
                <th style={{ padding: '12px' }}>Course Title</th>
                <th style={{ padding: '12px' }}>Transaction Context</th>
                <th style={{ padding: '12px' }}>Timestamp</th>
                <th style={{ padding: '12px' }}>Management Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid #f2f4f8', fontSize: '0.95rem', color: '#2c3e50' }}>
                  <td style={{ padding: '12px' }}><b>{s.userName}</b><br/><span style={{ fontSize: '0.8rem', color: '#95a5a6' }}>{s.userEmail}</span></td>
                  <td style={{ padding: '12px' }}>{s.courseTitle}</td>
                  <td style={{ padding: '12px' }}><code style={{ background: '#f1f2f6', padding: '4px 8px', borderRadius: '4px' }}>{s.transactionId || 'N/A'}</code></td>
                  <td style={{ padding: '12px' }}>{s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => deleteStudent(s._id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>
                      Revoke
                    </button>
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