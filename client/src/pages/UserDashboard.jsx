import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import '../App.css';

function UserDashboard() {

  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null); // ✨ Changed state to hold the complete active lesson object
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');


  // FIX YOUTUBE URL
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("embed")) {
      return url;
    }
    let videoId = "";
    try {
      if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1];
      } else {
        return url;
      }
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {
      return url;
    }
  };

  // FETCH COURSES
  useEffect(() => {
    if (userEmail) {
      axios
        .get(`http://localhost:5000/api/courses/my-orders/${userEmail}`)
        .then((res) => {
          console.log("ENROLLED COURSES:", res.data);
          setEnrolledCourses(res.data);

          // AUTO PLAY ONLY IF THE COURSE IS APPROVED
          if (
            res.data.length > 0 &&
            res.data[0].status === 'Approved' && 
            res.data[0].playlist &&
            res.data[0].playlist.length > 0
          ) {
            setActiveLesson(res.data[0].playlist[0]); // ✨ Store the whole object instead of just strings
          } else {
            setActiveLesson(null);
          }

          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userEmail]);

  // MARK COMPLETE
  const markLessonComplete = async (courseId, lessonTitle) => {
    try {
      await axios.put(
        "http://localhost:5000/api/courses/update-progress",
        {
          userEmail,
          courseId,
          lessonTitle
        }
      );

      const res = await axios.get(
        `http://localhost:5000/api/courses/my-orders/${userEmail}`
      );
      setEnrolledCourses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome {userName || "Student"} 👋
        </h1>
        <p className="dashboard-subtitle">
          Continue your learning journey
        </p>
      </div>

      {loading ? (
  <h2 className="loading-text">Loading...</h2>
) : enrolledCourses.length === 0 ? (

  <div
    style={{
      textAlign: "center",
      padding: "60px 20px"
    }}
  >
    <h2>No Courses Purchased Yet 📚</h2>

    <p style={{ color: "#666", marginTop: "10px" }}>
      You haven't purchased any course yet.
      <br />
      Explore our courses and start learning today.
    </p>

    <button
      onClick={() => navigate("/home")}
      style={{
        marginTop: "20px",
        padding: "12px 25px",
        border: "none",
        borderRadius: "8px",
        background: "#4f46e5",
        color: "#fff",
        cursor: "pointer"
      }}
    >
      Browse Courses
    </button>
  </div>

) : (

<div className="learning-layout">
          
          {/* LEFT PLAYLIST */}
          <div className="playlist-section">
            <h2 className="playlist-title">Your Courses</h2>

            {enrolledCourses.map((course, index) => (
              <div key={index} className="course-card">
                <h3 className="course-title">{course.courseTitle}</h3>

                <div className="progress-section">
                  <div className="progress-top">
                    <span>Progress</span>
                    <span>{course.progress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* 🛡️ CONDITIONALLY RENDER PLAYLIST OR ENGLISH BLOCK MESSAGE */}
                {course.status !== 'Approved' ? (
                  <div style={{
                    padding: '15px',
                    background: 'rgba(241, 196, 15, 0.1)',
                    border: '1px dashed #f1c40f',
                    borderRadius: '6px',
                    color: '#d35400',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    marginTop: '15px'
                  }}>
                    🔒 <b>Syllabus Locked</b> <br />
                    Your payment verification is currently under process. All videos will become available once the admin approves your enrollment request. <br />
                    <small style={{ color: '#7f8c8d' }}>UTR/Ref: {course.utr || "N/A"}</small>
                  </div>
                ) : (
                  <div className="lesson-list">
                    {course.playlist?.map((lesson, i) => {
                      const completed = course.completedLessons?.includes(lesson.title);
                      return (
                        <div key={i} className="lesson-item">
                          <button
                            className={completed ? "lesson-btn completed" : "lesson-btn"}
                            onClick={() => {
                              setActiveLesson(lesson); // ✨ Passing entire lesson object here
                            }}
                          >
                            {completed ? "✅" : "▶"} {lesson.title}
                          </button>

                          {!completed && (
                            <button
                              className="complete-btn"
                              onClick={() => markLessonComplete(course.courseId, lesson.title)}
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* RIGHT VIDEO PLAYER SECTION */}
          <div className="video-section">
            <div className="video-card">
              {/* DOUBLE PROTECTION GUARD */}
              {activeLesson && activeLesson.videoUrl && enrolledCourses.some(c => c.status === 'Approved') ? (
                <div className="video-wrapper">
                  <iframe
                    src={getEmbedUrl(activeLesson.videoUrl)}
                    title="Course Video"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="no-video" style={{ padding: '60px 20px', textAlign: 'center', color: '#7f8c8d' }}>
                  {enrolledCourses.length > 0 && enrolledCourses[0].status !== 'Approved' ? (
                    <div style={{ fontSize: '1.2rem', color: '#e67e22' }}>
                      🚫 Access Restricted <br />
                      <span style={{ fontSize: '0.95rem', color: '#95a5a6' }}>
                        Please wait for admin activation to initialize the video stream player.
                      </span>
                    </div>
                  ) : (
                    "Select an approved lesson to begin streaming"
                  )}
                </div>
              )}

              {/* ✨ UPDATED: VIDEO INFO CONTAINER WITH IN-LINE FLEXBOX FOR DOWNLOAD BUTTON */}
              <div className="video-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
                <div style={{ flex: 1 }}>
                  <h2>
                    {activeLesson && enrolledCourses.some(c => c.status === 'Approved') 
                      ? activeLesson.title 
                      : "No Active Lesson"}
                  </h2>
                </div>

                {/* 👇 CHECK IF CURRENT LESSON HAS AN AVAILABLE RESOURCE LINK */}
                {activeLesson && activeLesson.resources && enrolledCourses.some(c => c.status === 'Approved') && (
                  <a 
                    href={activeLesson.resources} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '10px 18px',
                      backgroundColor: '#6366f1',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)'
                    }}
                  >
                    📥 Download Resources
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default UserDashboard;