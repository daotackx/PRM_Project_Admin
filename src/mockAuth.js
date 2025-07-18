// Mock authentication service cho development
const MOCK_USERS = [
  {
    email: "admin@petshop.com",
    password: "admin123",
    user: {
      uid: "admin-001",
      email: "admin@petshop.com",
      fullName: "Admin PetShop",
      role: "admin",
      isActive: true,
      loginTime: Date.now()
    }
  },
  {
    email: "manager@petshop.com", 
    password: "manager123",
    user: {
      uid: "manager-001",
      email: "manager@petshop.com",
      fullName: "Manager PetShop",
      role: "manager",
      isActive: true,
      loginTime: Date.now()
    }
  },
  {
    email: "user@petshop.com",
    password: "user123", 
    user: {
      uid: "user-001",
      email: "user@petshop.com",
      fullName: "User Test",
      role: "user",
      isActive: true,
      loginTime: Date.now()
    }
  }
];

// Mock login function
export const mockLogin = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
  
  if (mockUser) {
    return {
      success: true,
      user: mockUser.user
    };
  } else {
    throw new Error('Email hoặc password không đúng');
  }
};

// Mock get users function
export const mockGetUsers = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return MOCK_USERS.map(u => ({
    ...u.user,
    createdAt: Date.now() - Math.random() * 86400000,
    lastLogin: Date.now() - Math.random() * 3600000,
    emailVerified: true,
    disabled: false
  }));
};

export default { mockLogin, mockGetUsers };
