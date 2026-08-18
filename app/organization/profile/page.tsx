"use client";
import axios from "axios";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCookie } from "@/hooks/use-cookie";
import { useCompany } from "@/hooks/query-hooks/use-company";

const ProfilePage = () => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [logo, setLogo] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const cropperRef = useRef(null);
  const companyId = useCookie("user")?.companyId;
  const { company, companyLoading, updateCompany, companyUpdating } =
    useCompany(companyId);

  useEffect(() => {
    if (company) {
      setName(company?.name);
      setContact(company?.phone);
      setLogo(company?.logo);
      setEmail(company?.email);
      setBio(company?.bio);
      setUrl(company?.website);
    }
  }, [company]);

  const uploadFileToS3 = async (file: Blob) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/attachment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCrop = () => {
    setProfileLoading(true);
    if (cropperRef.current) {
      const cropperRefCur = cropperRef.current;
      if (cropperRefCur) {
        const croppedCanvas = cropperRefCur.cropper.getCroppedCanvas();
        croppedCanvas?.toBlob(async (blob) => {
          if (blob) {
            const croppedImageUrl = await uploadFileToS3(blob);
            setCroppedImage(croppedImageUrl);
          }
        });
        setProfileLoading(false);
      } else {
        console.error(
          "Cropper is not initialized or getCroppedCanvas is not available."
        );
        setProfileLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const accountData = {
        name,
        contact,
        logo: croppedImage || logo,
        bio,
        url,
        email,
      };

      updateCompany(accountData);
      setLogo(croppedImage || logo);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error updating account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setCroppedImage(null);
  };

  return (
    <div className="min-h-screen p-6 text-white dark:bg-darkSprint-0">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto max-w-full space-y-8"
      >
        <div className="flex items-center justify-between">
          <Link href="/project">
            <button className="rounded bg-button px-4 py-2 text-white transition hover:bg-buttonHover dark:bg-dark-0">
              Back
            </button>
          </Link>

          <h1 className="text-3xl font-bold text-gray-700 dark:text-dark-50">
            Organization Profile
          </h1>
          <button
            type="button"
            disabled={companyUpdating}
            onClick={handleSave}
            className="rounded bg-button px-4 py-2 text-white transition hover:bg-buttonHover disabled:bg-gray-500 dark:bg-dark-0"
          >
            {companyUpdating ? "Updating..." : "Update"}
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-[2fr,1fr] ">
          <div className="space-y-2 rounded-lg bg-header dark:bg-darkSprint-10">
            <h2 className=" p-6 text-center text-xl font-semibold">
              Information
            </h2>

            {/* Organization Information Fields */}
            {companyLoading ? (
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-black" />
            ) : (
              <div className="space-y-2 rounded-lg bg-white p-6  dark:bg-darkSprint-20">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm  font-medium text-gray-700 dark:text-dark-50"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    id="name"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded border border-gray-300 bg-gray-200 px-3 py-2 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-darkSprint-20 dark:bg-darkSprint-30 dark:text-white dark:placeholder:text-darkSprint-50"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-dark-50"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email address"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded border border-gray-300 bg-gray-200 px-3 py-2 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-darkSprint-20 dark:bg-darkSprint-30 dark:text-white dark:placeholder:text-darkSprint-50"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact"
                    className="block text-sm font-medium text-gray-700 dark:text-dark-50"
                  >
                    Number
                  </label>
                  <input
                    type="number"
                    placeholder="Phone number"
                    id="contact"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full rounded border border-gray-300 bg-gray-200 px-3 py-2 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-darkSprint-20 dark:bg-darkSprint-30 dark:text-white dark:placeholder:text-darkSprint-50"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 dark:text-dark-50"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell us a little bit about yourself"
                    className="w-full rounded border border-gray-300 bg-gray-200 px-3 py-2 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-darkSprint-20 dark:bg-darkSprint-30 dark:text-white dark:placeholder:text-darkSprint-50"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="url"
                    className="block text-sm font-medium text-gray-700 dark:text-dark-50"
                  >
                    Website
                  </label>
                  <input
                    type="url"
                    placeholder="www.example.com"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded border border-gray-300 bg-gray-200 px-3 py-2 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-darkSprint-20 dark:bg-darkSprint-30 dark:text-white dark:placeholder:text-darkSprint-50"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="h-1/2 space-y-2 rounded-lg bg-header dark:bg-darkSprint-10">
            <h2 className="p-6 text-center text-xl  font-semibold">
              Profile Picture
            </h2>
            <div className="rounded-lg bg-white p-6  dark:bg-darkSprint-20">
              <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-full !bg-white dark:bg-darkSprint-10">
                {/* Show the cropped image if available, otherwise show the default image */}
                {croppedImage ? (
                  <img
                    src={croppedImage}
                    alt="Cropped profile picture"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  !selectedFile && (
                    <Image
                      src={logo ? logo : "/images/tasqx-logo.svg"}
                      alt="Profile picture"
                      width={150}
                      height={150}
                      className="rounded-full object-cover"
                    />
                  )
                )}

                {selectedFile && !croppedImage && (
                  <Cropper
                    ref={cropperRef}
                    src={URL.createObjectURL(selectedFile)}
                    style={{ height: 200, width: "100%" }}
                    aspectRatio={1}
                    guides={false}
                    cropBoxResizable={false}
                  />
                )}

                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-2 right-2 cursor-pointer text-white"
                >
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="rounded-full bg-button p-2 dark:bg-darkSprint-10">
                    ✏️
                  </span>
                </label>
              </div>

              {selectedFile && !croppedImage && (
                <div className="mt-4 space-x-4">
                  <button
                    onClick={handleCrop}
                    className="rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                  >
                    {profileLoading ? "Cropping..." : "Crop"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="rounded-xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
