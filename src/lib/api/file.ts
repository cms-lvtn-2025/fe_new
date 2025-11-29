import { getValidAccessToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface FileInfo {
  id: string
  title: string
  file: string
  status: string
  table: string
  option: string
  tableId: string
  createdAt?: string
  updatedAt?: string
}

export interface FileURLResponse {
  success: boolean
  data: {
    download_url: string
    expires_in: string
    file_id: string
    filename: string
  }
}

/**
 * Get file info by ID
 */
export async function getFileInfo(fileId: string, semester: string): Promise<FileInfo> {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('No access token available')
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/files/${fileId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-semester': semester
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get file info' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.data || data
}

/**
 * Get presigned download URL for a file
 */
export async function getFileURL(fileId: string, semester: string): Promise<string> {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('No access token available')
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/files/${fileId}/url`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-semester': semester
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get file URL' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  const data: FileURLResponse = await response.json()
  if (data.success && data.data?.download_url) {
    return data.data.download_url
  }
  throw new Error('No download URL available')
}

/**
 * Delete a file by ID
 */
export async function deleteFile(fileId: string): Promise<void> {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('No access token available')
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete file' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }
}

/**
 * Get file blob (public endpoint, uses token in query string)
 * Returns a blob URL that can be used to view the file
 */
export async function getFileBlobURL(fileId: string): Promise<string> {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('No access token available')
  }

  const url = new URL(`${API_BASE_URL}/api/v1/files/blob`)
  url.searchParams.append('id', fileId)
  url.searchParams.append('token', token)

  // Return the URL directly - browser will handle the blob
  return url.toString()
}

/**
 * Download file using presigned URL
 */
export async function downloadFile(fileId: string, semester: string, filename?: string): Promise<void> {
  try {
    const url = await getFileURL(fileId, semester)
    if (!url) {
      throw new Error('No download URL available')
    }

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'download'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

/**
 * Upload midterm file
 */
export async function uploadMidtermFile(
  file: File,
  tableId: string,
  semesterCode: string,
  title?: string,
  enrollmentId?: string,
  option?: string
): Promise<FileInfo> {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('No access token available')
  }

  if (!tableId) {
    throw new Error('tableId (midtermId) is required')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('table_id', tableId)
  if (title) {
    formData.append('title', title)
  }
  if (enrollmentId) {
    formData.append('enrollment_id', enrollmentId)
  }
  formData.append('table_type', 'MIDTERM')
  if (option) {
    formData.append('option', option)
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/files/upload/midterm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-semester': semesterCode
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to upload midterm file' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.data || data
}

/**
 * Upload final file
 */
export async function uploadFinalFile(
  file: File,
  tableId: string,
  semesterCode: string,
  title?: string,
  enrollmentId?: string,
  option?: string

): Promise<FileInfo> {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('No access token available')
  }

  if (!tableId) {
    throw new Error('tableId (finalId) is required')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('table_id', tableId)
  if (title) {
    formData.append('title', title)
  }
  if (enrollmentId) {
    formData.append('enrollment_id', enrollmentId)
  }
  formData.append('table_type', 'FINAL')
  if (option) {
    formData.append('option', option)
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/files/upload/final`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-semester': semesterCode
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to upload final file' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.data || data
}


export async function uploadFileExcel(
  file: File,
  semesterCode: string,
  type: string = 'user-for-affair',
  title?: string,
): Promise<FileInfo> {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('No access token available')
  }

  const formData = new FormData()
  formData.append('file', file)
  if (title) {
    formData.append('title', title)
  }
  formData.append('table_type', "ORDER")

  const response = await fetch(`${API_BASE_URL}/api/v1/files/upload/${type}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-semester': semesterCode
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to upload excel file' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.data || data
}