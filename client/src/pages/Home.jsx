import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    axios.get('http://localhost:5000/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error("Error fetching courses:", err));
  }, []);

  const filteredCourses = courses.filter(c => {
    // 🔥 ACTIVE COURSE FILTER (Sirf wahi courses dikhenge jo inactive nahi hain)
    const isCourseActive = c.isActive !== false;

    const matchesSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.creator?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase());

    // FIXED CATEGORY FILTER
    const matchesCategory =
      selectedCategory === 'All' ||
      c.category?.trim().toLowerCase() ===
      selectedCategory.trim().toLowerCase();

    // Ab filter active status ko bhi check karega
    return isCourseActive && matchesSearch && matchesCategory;
  });

  return (
    <div className="main-wrapper">
      <h1 className="page-title">Our Premium Courses</h1>

      {/* Categories */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '25px'
        }}
      >
        {['All', 'Web Development', 'Data Science', 'AI', 'Design'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? 'btn-blue' : 'btn-tab'}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div
        className="top-section"
        style={{ maxWidth: '600px', margin: '0 auto 30px auto' }}
      >
        <input
          type="text"
          placeholder="🔍 Search by title, instructor, category..."
          className="custom-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ textAlign: 'center' }}
        />
      </div>

      {/* Courses */}
      <div className="course-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(c => (
            <div
              key={c._id}
              className="course-box"
            >
              <div className="course-img-wrapper">
                <img
                  src={c.thumbnail || 'https://via.placeholder.com/350x200?text=Course+Thumbnail'}
                  alt={c.title}
                  className='course-thumbnail'
                />
              </div>

              <div className='course-content'>
                <div
                  style={{
                    color: '#8e44ad',
                    fontWeight: 'bold',
                    marginBottom: '8px'
                  }}
                >
                  {c.category}
                </div>

                <h3 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>
                  {c.title}
                </h3>

                <p
                  style={{
                    color: '#666',
                    fontSize: '0.9rem',
                    minHeight: '50px'
                  }}
                >
                  {c.description ? c.description.substring(0, 80) : "No Description available"}...
                </p>

                <p style={{ fontSize: '14px', color: '#555' }}>
                  Instructor: {c.creator}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '15px'
                  }}
                >
                  <div
                    className="price-tag"
                    style={{ margin: '0', fontSize: '1.1rem' }}
                  >
                    ₹{c.price}
                  </div>

                  <Link to={`/course/${c._id}`}>
                    <button
                      className="btn-blue"
                      style={{ padding: '8px 15px' }}
                    >
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              gridColumn: '1/-1',
              textAlign: 'center',
              padding: '50px'
            }}
          >
            <h3>No courses found matching your search.</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;