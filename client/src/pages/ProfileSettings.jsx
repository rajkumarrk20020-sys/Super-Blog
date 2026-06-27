import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProfileSettings = () => {
  const { user, updateProfile, changePassword, showToast } = useContext(AuthContext);
  const navigate = useNavigate();

  // Profile fields state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setFacebook(user.socialLinks?.facebook || '');
      setTwitter(user.socialLinks?.twitter || '');
      setLinkedin(user.socialLinks?.linkedin || '');
      setGithub(user.socialLinks?.github || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name field cannot be empty.', 'warning');
      return;
    }

    try {
      setSavingProfile(true);
      const data = new FormData();
      data.append('name', name);
      data.append('bio', bio);
      data.append('facebook', facebook);
      data.append('twitter', twitter);
      data.append('linkedin', linkedin);
      data.append('github', github);
      if (profileImageFile) {
        data.append('profileImage', profileImageFile);
      }

      const res = await updateProfile(data);
      if (res?.success) {
        setProfileImageFile(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all password fields.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'danger');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await changePassword(currentPassword, newPassword);
      if (res?.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <h1 className="fw-bold mb-0">Account Settings</h1>
            <Link to="/profile" className="btn btn-outline-secondary rounded-3">
              <i className="bi bi-arrow-left me-1"></i> Back to Profile
            </Link>
          </div>

          <div className="row g-4">
            
            {/* Left Column - Profile Settings Form */}
            <div className="col-md-7">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h5 className="fw-bold mb-4 text-primary">Edit Profile Details</h5>
                
                <form onSubmit={handleProfileSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Full Name</label>
                      <input
                        type="text"
                        className="form-control form-control-premium"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label fw-semibold">Bio</label>
                      <textarea
                        className="form-control form-control-premium"
                        rows="3"
                        placeholder="Write a brief bio about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Avatar Image</label>
                      <input
                        type="file"
                        className="form-control form-control-premium"
                        accept="image/*"
                        onChange={(e) => setProfileImageFile(e.target.files[0])}
                      />
                    </div>

                    <hr className="my-4 text-muted opacity-25" />
                    <h6 className="fw-bold text-secondary mb-2">Social Links</h6>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold"><i className="bi bi-facebook text-primary me-1"></i> Facebook</label>
                      <input
                        type="url"
                        className="form-control form-control-premium"
                        placeholder="https://facebook.com/username"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold"><i className="bi bi-twitter-x text-dark me-1"></i> Twitter</label>
                      <input
                        type="url"
                        className="form-control form-control-premium"
                        placeholder="https://twitter.com/username"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold"><i className="bi bi-linkedin text-info me-1"></i> LinkedIn</label>
                      <input
                        type="url"
                        className="form-control form-control-premium"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold"><i className="bi bi-github text-dark me-1"></i> GitHub</label>
                      <input
                        type="url"
                        className="form-control form-control-premium"
                        placeholder="https://github.com/username"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                      />
                    </div>

                    <div className="col-12 mt-4">
                      <button type="submit" className="btn btn-premium-primary rounded-3 px-4" disabled={savingProfile}>
                        {savingProfile ? 'Saving Changes...' : 'Save Profile Settings'}
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Change Password Form */}
            <div className="col-md-5">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold mb-4 text-danger">Security Settings</h5>
                
                <form onSubmit={handlePasswordSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Current Password</label>
                      <input
                        type="password"
                        className="form-control form-control-premium"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label fw-semibold">New Password</label>
                      <input
                        type="password"
                        className="form-control form-control-premium"
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control form-control-premium"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12 mt-4">
                      <button type="submit" className="btn btn-danger w-100 rounded-3" disabled={savingPassword}>
                        {savingPassword ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
