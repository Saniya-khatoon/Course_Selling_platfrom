const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User'); // Mongoose User Model
const auth = require('../middleware/authMiddleware');

const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Temporary storage for OTPs
const otpStore = {}; 

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

// ==========================================
// 🚀 1. USER SIGNUP (Fixed Typo & Model Mapping)
// ==========================================
router.post('/user-signup', async (req, res) => {
  try {
    const { userName, userEmail, phoneNumber, password } = req.body;

    // Check empty fields
    if (!userName || !userEmail || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields."
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(userEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    // Phone validation
    if (phoneNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits."
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters."
      });
    }

    // Existing user check
    const existingUser = await User.findOne({ email: userEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered! Please login."
      });
    }

    // Create new user
    const newUser = new User({
      username: userName,
      email: userEmail,
      phoneNumber,
      password
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Signup Successful! You can now login. "
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
});
// ==========================================
// 🚀 2. USER LOGIN (MAPPED TO MODERN ENTRANCE SYSTEM)
// ==========================================
router.post('/user-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await User.findOne({ email: email });
    if (!student) {
      return res.status(404).json({ success: false, message: "User not found! Please signup first." });
    }

    if (student.password !== password) {
      return res.status(401).json({ success: false, message: "Wrong password!" });
    }

    res.json({
      success: true,
      email: student.email,       
      userName: student.username, 
      message: "Login successful"
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});
router.put("/reset-password", async (req,res)=>{

try{

const {email,newPassword}=req.body;

const user=await User.findOne({
userEmail:email
});

if(!user){

return res.status(404).json({
message:"Email not found"
});

}

user.password=newPassword;

await user.save();

res.json({
message:"Password Updated Successfully"
});

}

catch(err){

res.status(500).json({
message:"Server Error"
});

}

});

// ==========================================
// 🚀 3. SEND OTP FOR PASSWORD RESET (Fixed Schema Query)
// ==========================================
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // 🔥 FIXED: userEmail ki jagah base key 'email' ka use kiya query mein
    const student = await User.findOne({ email: email });
    if (!student) {
      return res.status(444).json({ success: false, message: "This email is not registered with us!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp: otp,
      expiresAt: Date.now() + 5 * 60 * 1000 
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔒 Password Reset OTP - SmartLearn',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px;">
          <h2 style="color: #4f46e5; text-align: center;">SmartLearn Security</h2>
          <p>Hello,</p>
          <p>We received a request to reset your course dashboard password. Use the verification code below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; background: #f3f4f6; padding: 10px 20px; border-radius: 4px; border: 1px dashed #4f46e5; color: #111827;">
              ${otp}
            </span>
          </div>
          <p style="color: #ef4444; font-size: 0.85rem;">*This OTP is valid for 5 minutes only. Do not share this code with anyone.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent successfully to your Gmail! 📬" });

  } catch (err) {
    console.error("OTP Send Error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP. Server Error." });
  }
});

// ==========================================
// 🚀 4. VERIFY OTP & RESET PASSWORD (Fixed System Updates)
// ==========================================
router.post('/reset-password-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ success: false, message: "OTP expired or request not initiated." });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[email]; 
      return res.status(400).json({ success: false, message: "OTP has expired! Please request a new one." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP! Please cross-check." });
    }

    // 🔥 FIXED: Dono jagah collection key sahi ki (User mein schema format: email)
    await User.updateOne({ email: email }, { $set: { password: newPassword } });
    await Enrollment.updateMany({ userEmail: email }, { $set: { password: newPassword } });

    delete otpStore[email];
    res.json({ success: true, message: "Password updated successfully! 🎉 You can login now." });

  } catch (err) {
    console.error("Password Reset Error:", err);
    res.status(500).json({ success: false, message: "Server error during password update." });
  }
});

// ==========================================
// ✨ ENROLL SYSTEM WITH UPI QR CODE VALIDATION
// ==========================================
// ==========================================
// ✨ ENROLL SYSTEM WITH EMAIL
// ==========================================
router.post('/enroll', async (req, res) => {
  try {
    console.log("Thumbnail received:", req.body.thumbnail);

    const {
      userName,
      userEmail,
      phoneNumber,
      password,
      courseId,
      courseTitle,
      creator,
      description,
      playlist,
      status,
      utr
    } = req.body;

    // Check duplicate enrollment
    const existingEnrollment = await Enrollment.findOne({ userEmail, courseId });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted an enrollment request for this course!"
      });
    }

    // Check duplicate UTR
    if (utr) {
      const existingTxn = await Enrollment.findOne({ transactionId: utr });

      if (existingTxn) {
        return res.status(400).json({
          success: false,
          message: "This UTR/Reference number has already been used!"
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "UTR/Reference number is required."
      });
    }

    // Playlist
    const processedPlaylist =
      playlist && Array.isArray(playlist)
        ? playlist.map(video => ({
            title: video.title,
            videoUrl: video.videoUrl,
            resources: video.resources || ""
          }))
        : [];

    // Save Enrollment
    const newEnrollment = new Enrollment({
      userName,
      userEmail,
      phoneNumber,
      password,
      courseId,
      courseTitle,
      creator: creator || "Admin",
      description: description || "No Description",
      thumbnail: req.body.thumbnail,
      playlist: processedPlaylist,
      completedLessons: [],
      progress: 0,
      status: status || "Pending Approval",
      transactionId: utr,
      utr: utr
    });

    await newEnrollment.save();

    // ================= EMAIL =================

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🎉 Enrollment Successful - ${courseTitle}`,

      html: `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:10px;">

        <h2 style="color:#4f46e5;text-align:center;">
          🎉 Welcome to SmartLearn
        </h2>

        <p>Hi <b>${userName}</b>,</p>

        <p>
          Thank you for enrolling with <b>SmartLearn</b>.
          Your enrollment request has been received successfully.
        </p>

        <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0;">

          <h3>📘 Course Details</h3>

          <p><b>Course :</b> ${courseTitle}</p>

          <p><b>Instructor :</b> ${creator}</p>

          <p><b>Payment Status :</b> Received ✅</p>

          <p><b>Enrollment Status :</b> Pending Approval</p>

          <p><b>Transaction ID :</b> ${utr}</p>

        </div>

        <p>
          Our admin team will verify your payment shortly.
        </p>

        <p>
          Once approved, your course videos and resources will automatically appear in your dashboard.
        </p>

        <p>
          We hope you enjoy learning with SmartLearn.
        </p>

        <br>

        <p>
          Happy Learning 🚀
        </p>

        <hr>

        <p style="color:gray;font-size:13px;text-align:center;">
          © SmartLearn Team
        </p>

      </div>
      `
    };
    //console.log("Mail will be sent to:", userEmail);

    await transporter.sendMail(mailOptions);

    console.log("Enrollment Email Sent Successfully");

    // Response
    res.status(201).json({
      success: true,
      message: "Enrollment Successful"
    });

  } catch (err) {

    console.error("Backend Enrollment Error:", err);

    res.status(500).json({
      success: false,
      message: "Server Error: " + err.message
    });

  }
});
// ==========================================
// GET ALL ENROLLED STUDENTS (ADMIN)
// ==========================================
router.get('/enrolled-students', async (req, res) => {
  try {
    const students = await Enrollment.find();

    res.status(200).json(students);

  } catch (err) {
    console.error("Enrolled Students Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// GET MY COURSES (USER DASHBOARD)
router.get("/my-orders/:email", async (req, res) => {
  try {
    const orders = await Enrollment.find({
      userEmail: req.params.email
    });

    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error"
    });
  }
});
// STUDENTS KE LIYE ACTIVE COURSES
router.get('/active', async (req, res) => {
  try {
    const activeCourses = await Course.find({ isActive: { $ne: false } }); 
    res.json(activeCourses);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// COURSE MANAGEMENT
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    let courseData = { ...req.body };
    
    if (courseData.playlist && Array.isArray(courseData.playlist)) {
      courseData.playlist = courseData.playlist.map(video => ({
        title: video.title,
        videoUrl: video.videoUrl,
        resources: video.resources || "" 
      }));
    }

    const newCourse = new Course(courseData);
    const course = await newCourse.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/update-progress', async (req, res) => {
  try {
    const { userEmail, courseId, lessonTitle } = req.body;
    const enrollment = await Enrollment.findOne({ userEmail, courseId });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    if (!enrollment.completedLessons.includes(lessonTitle)) {
      enrollment.completedLessons.push(lessonTitle);
      const totalLessons = enrollment.playlist.length;
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
      await enrollment.save();
    }

    res.json({ success: true, progress: enrollment.progress });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Progress update failed" });
  }
});

// MASTER PUT ROUTE
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, price, creator, thumbnail, category, playlist, isActive } = req.body;

    let processedPlaylist = [];
    if (playlist && Array.isArray(playlist)) {
      processedPlaylist = playlist.map(video => ({
        title: video.title,
        videoUrl: video.videoUrl,
        resources: video.resources || "" 
      }));
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title, description, price, creator, thumbnail, category,
          playlist: processedPlaylist,
          isActive: isActive !== undefined ? isActive : true 
        }
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    await Enrollment.updateMany(
      { courseId: req.params.id },
      { $set: { playlist: processedPlaylist } }
    );

    res.json(updatedCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.json(course);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ADMIN ANALYTICS METRICS
router.get('/admin/analytics', async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalStudents = await Enrollment.countDocuments();
    
    const approvedEnrollments = await Enrollment.find({ status: "Approved" });
    let totalRevenue = 0;

    for (let enrollment of approvedEnrollments) {
      if (enrollment.price) {
        totalRevenue += Number(enrollment.price);
      } else if (enrollment.courseId) {
        const matchedCourse = await Course.findById(enrollment.courseId);
        if (matchedCourse && matchedCourse.price) {
          totalRevenue += Number(matchedCourse.price);
        }
      }
    }

    res.json({ totalCourses, totalStudents, totalRevenue });
  } catch (err) {
    console.error("Analytics Calculation Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// APPROVE STUDENT ENROLLMENT STATUS
router.put('/enrollment/approve/:id', async (req, res) => {
  try {
    const enrollmentDoc = await Enrollment.findById(req.params.id);
    if (!enrollmentDoc) {
      return res.status(404).json({ success: false, message: "Enrollment record not found" });
    }

    const latestCourseData = await Course.findById(enrollmentDoc.courseId);
    if (!latestCourseData) {
      return res.status(404).json({ success: false, message: "Main course dataset missing" });
    }

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
  req.params.id,
  {
    status: "Approved",
    playlist: latestCourseData.playlist
  },
  { new: true }
);

// ================= SEND APPROVAL EMAIL =================

const approvalMail = {
  from: process.env.EMAIL_USER,
  to: updatedEnrollment.userEmail,
  subject: `🎉 Your Course is Approved - ${updatedEnrollment.courseTitle}`,

  html: `
  <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:10px;">

    <h2 style="color:#16a34a;text-align:center;">
      🎉 Congratulations!
    </h2>

    <p>Hello <b>${updatedEnrollment.userName}</b>,</p>

    <p>Your payment has been verified successfully.</p>

    <div style="background:#f5f5f5;padding:15px;border-radius:8px;">

      <h3>📘 Course Details</h3>

      <p><b>Course:</b> ${updatedEnrollment.courseTitle}</p>

      <p><b>Status:</b> Approved ✅</p>

      <p><b>Transaction ID:</b> ${updatedEnrollment.utr}</p>

    </div>

    <p>
      Your course is now active and available in your dashboard.
    </p>

    <p>
      Login to SmartLearn and start learning today.
    </p>

    <br>

    <p><b>Happy Learning 🚀</b></p>

    <hr>

    <p style="text-align:center;color:gray;">
      SmartLearn Team
    </p>

  </div>
  `
};


await transporter.sendMail(approvalMail);

console.log("Approval Email Sent Successfully");

res.json({
  success: true,
  message: "Student enrollment approved & email sent successfully!",
  data: updatedEnrollment
});
  } catch (error) {
    console.error("Approval sync error:", error);
    res.status(500).json({ success: false, message: "Server error during approval and sync" });
  }
});

module.exports = router;