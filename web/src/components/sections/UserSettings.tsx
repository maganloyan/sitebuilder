import React, { useState, useEffect, useRef } from 'react';
import { X, User, Paintbrush, Sliders, Mail, Camera } from 'lucide-react';
import { useFrappeGetDoc,useFrappeAuth } from 'frappe-react-sdk';
import SetPassword from '@/auth/SetPassword';

const settingsItems = [
  { icon: User, label: 'Profile' },
  { icon: Paintbrush, label: 'Appearance' },
  { icon: Sliders, label: 'Settings' },
];

const Settings = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [activeItem, setActiveItem] = useState('Profile');
  const modalRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useFrappeAuth();

  
  const { data: userData, error, isLoading } = useFrappeGetDoc('User', currentUser || '', {
    fields: ['name', 'full_name', 'user_image', 'email'],
  });

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const renderProfileContent = () => {
    if (isLoading) return <p>Loading user data...</p>;
    if (error) return <p>Error loading user data. Please try again.</p>;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {userData?.user_image ? (
              <img
                src={userData.user_image}
                alt={userData?.full_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h4 className="text-xl font-semibold">{userData?.full_name}</h4>
            <p className="text-muted-foreground">{userData?.name}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={userData?.full_name}
              className="mt-1 block w-full rounded-md border-border bg-background px-3 py-2"
              readOnly
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
              Email
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-border bg-accent px-3 text-muted-foreground sm:text-sm">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                id="email"
                value={userData?.email}
                className="block w-full flex-1 rounded-none rounded-r-md border-border bg-background px-3 py-2 sm:text-sm"
                readOnly
              />
            </div>
          </div>
        </div>
        {/* <SetPassword open={true} onOpenChange={() => {}} /> */}
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          Edit Profile
        </button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-background w-4/5 h-4/5 rounded-lg flex overflow-hidden">
        <div className="w-64 border-r border-border">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-xl font-semibold">Settings</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-2">
            {settingsItems.map((item, index) => (
              <button
                key={index}
                className={`flex items-center p-2 w-full text-left rounded-md ${
                  activeItem === item.label
                    ? 'bg-accent text-primary font-semibold'
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => setActiveItem(item.label)}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          <h3 className="text-2xl font-semibold mb-4">{activeItem}</h3>
          {activeItem === 'Profile' ? (
            renderProfileContent()
          ) : (
            <p>Content for {activeItem} goes here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;