'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on page load
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userInfo = localStorage.getItem('userInfo')
    
    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo)
        setCurrentUser(user)
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
      }
    }
    setLoading(false)
  }, [])

  const signup = async (email, password, firstName, lastName, userType = 'user') => {
    const endpoint = userType === 'doctor' ? '/doctor/sign-up' : 
                    userType === 'admin' ? '/admin/sign-up' : '/user/sign-up'

    const userData = {
      email,
      password,
      firstName,
      lastName
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Registration failed')
      }

      const userData_response = await response.json()
      return userData_response
    } catch (error) {
      throw new Error(error.message || 'Registration failed')
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Login failed')
      }

      const data = await response.json()
      const { token, role } = data

      // Store token and user info
      localStorage.setItem('token', token)
      
      // Get user details
      const userInfo = await getUserDetails(email, token)
      const userData = {
        email,
        role,
        ...userInfo
      }
      
      localStorage.setItem('userInfo', JSON.stringify(userData))
      setCurrentUser(userData)
      console.log('Login successful - User data:', userData)
      console.log('User role:', userData.role)
      console.log('Has doctor role:', userData.role?.toLowerCase() === 'doctor')
      
      return userData
    } catch (error) {
      throw new Error(error.message || 'Login failed')
    }
  }

  const getUserDetails = async (email, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        return await response.json()
      }
      return {}
    } catch (error) {
      console.error('Error fetching user details:', error)
      return {}
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    setCurrentUser(null)
  }

  // Get token for API calls
  const getToken = () => {
    return localStorage.getItem('token')
  }

  // Check if user has specific role
  const hasRole = (role) => {
    if (!currentUser?.role) return false
    const userRole = currentUser.role.toLowerCase()
    const checkRole = role.toLowerCase()
    console.log('Checking role:', { userRole, checkRole, match: userRole === checkRole })
    return userRole === checkRole || userRole === `role_${checkRole}`
  }

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
    getToken,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}