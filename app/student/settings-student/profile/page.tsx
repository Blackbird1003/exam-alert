"use client";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StudentLayout } from "@/components/student-layout";
import { getStudentProfile, updateStudentProfile } from "../../actions";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    matricNumber: "",
    phone: "",
    email: "",
    faculty: "",
    department: "",
    level: "",
    profileImage: null as File | null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const result = await getStudentProfile();
        if (result.success && result.profile) {
          setProfile({
            firstName: result.profile.firstName,
            lastName: result.profile.lastName,
            matricNumber: result.profile.matricNumber,
            phone: result.profile.phone,
            email: result.profile.email,
            faculty: result.profile.faculty,
            department: result.profile.department,
            level: result.profile.level,
            profileImage: null,
          });
        } else {
          toast.error(result.message || "Failed to load profile");
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "profileImage") {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        setProfile({ ...profile, profileImage: fileInput.files[0] });
      }
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const result = await updateStudentProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        email: profile.email,
        faculty: profile.faculty,
        department: profile.department,
        level: profile.level,
      });

      if (result.success) {
        toast.success(result.message || "Profile updated successfully!");
        if (result.profile) {
          setProfile(prev => ({
            ...prev,
            ...result.profile
          }));
        }
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-white px-4 pt-6 pb-12 text-sm">
          <div className="max-w-6xl mx-auto p-4 space-y-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-white px-4 pt-6 pb-12 text-sm">
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          <header className="flex items-center space-x-2">
            <h1 className="text-lg font-bold">Profile</h1>
          </header>
          {/* Profile avatar */}
          <div className="flex flex-col  mb-4">
            <label className="cursor-pointer ">
              <input
                type="file"
                name="profileImage"
                className="hidden "
                onChange={handleProfileChange}
                disabled={saving}
              />
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-1">
                <User className="h-6 w-6 text-gray-700" />
              </div>
              <p className="text-xs text-purple-600 underline">
                Change Picture
              </p>
            </label>
          </div>

          {/* Profile Fields */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-600 mb-1">First Name</label>
              <input
                name="firstName"
                value={profile.firstName}
                onChange={handleProfileChange}
                disabled={saving}
                required
                className="w-100 px-3 py-2 rounded-lg bg-gray-100 focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Last Name</label>
              <input
                name="lastName"
                value={profile.lastName}
                onChange={handleProfileChange}
                disabled={saving}
                required
                className="w-100 px-3 py-2 rounded-lg bg-gray-100 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Matric Number</label>
              <input
                name="matricNumber"
                value={profile.matricNumber}
                readOnly
                className="w-100 px-3 py-2 rounded-lg bg-gray-200 focus:outline-none cursor-not-allowed"
                title="Matric number cannot be changed"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Phone Number</label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                disabled={saving}
                required
                className="w-100 px-3 py-2 rounded-lg bg-gray-100 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
                disabled={saving}
                required
                className="w-100 px-3 py-2 rounded-lg bg-gray-100 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Faculty</label>
              <input
                name="faculty"
                value={profile.faculty}
                onChange={handleProfileChange}
                disabled={saving}
                required
                className="w-100 px-3 py-2 rounded-lg bg-gray-100 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Department</label>
              <input
                name="department"
                value={profile.department}
                onChange={handleProfileChange}
                disabled={saving}
                required
                className="w-100 px-3 py-2 rounded-lg bg-gray-100 focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Level</label>
              <select
                className="input w-100 px-3 py-2 rounded-lg bg-gray-100 focus:outline-none disabled:opacity-50"
                name="level"
                value={profile.level}
                onChange={handleProfileChange}
                disabled={saving}
                required
              >
                <option value="">Select Level</option>
                <option value="100 Level">100 Level</option>
                <option value="200 Level">200 Level</option>
                <option value="300 Level">300 Level</option>
                <option value="400 Level">400 Level</option>
                <option value="500 Level">500 Level</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
}
