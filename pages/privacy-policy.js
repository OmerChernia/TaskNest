/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import Image from 'next/image';


export default function PrivacyPolicy() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="fixed top-0 left-0 right-0 mb-6 flex items-center space-x-4 bg-white p-4 rounded shadow-md z-[9999]">
      <Image src="/tasknest-logo.png" alt="TaskNest Logo" width={150} height={50} className="mr-4" />      </div>
      
      <div className="pt-[110px] pb-20 px-4">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 text-gray-800">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <p className="mb-4">Last Updated: March 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="mb-4">TaskNest ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our TaskNest application ("Service").</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="mb-4">We collect the following types of information:</p>
            <ul className="list-disc ml-6 mt-2 mb-4">
              <li>Account information (email, name)</li>
              <li>Task data that you create in the application</li>
              <li>Calendar data with your explicit permission</li>
              <li>Usage information to improve our service</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc ml-6 mt-2 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Create and sync tasks with Google Calendar when requested</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Google API Services</h2>
            <p className="mb-4">TaskNest uses Google Calendar API to allow users to sync their tasks with Google Calendar. Our use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-blue-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="mb-4">We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="mb-4">You have the right to access, correct, or delete your personal information. You can do this by contacting us at omer12899@gmail.com.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p className="mb-4">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at omer12899@gmail.com.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Sharing of Google User Data</h2>
            <p className="mb-4"><strong>TaskNest does not share, transfer, or disclose Google user data to any third parties</strong>, except in the following limited circumstances:</p>
            
            <ul className="list-disc ml-6 mt-2 mb-4">
              <li><strong>With your explicit consent</strong>: We will only share your Google data with third parties if you explicitly request us to do so.</li>
              <li><strong>For legal compliance</strong>: We may share information when required to comply with applicable laws, regulations, legal processes, or enforceable governmental requests.</li>
              <li><strong>Service providers</strong>: We may share limited information with trusted service providers who help us operate our service (such as hosting providers), under strict confidentiality agreements that prohibit them from using the data for any other purpose.</li>
            </ul>
            
            <p className="mb-4">TaskNest does not sell, rent, or monetize your Google user data or content in any way. All calendar data accessed through Google Calendar API is only used for the specific purpose of creating and syncing tasks as requested by you.</p>
            
            <p className="mb-4">Our use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-blue-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
          </section>
          
          <button 
            onClick={() => router.push('/')} 
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}