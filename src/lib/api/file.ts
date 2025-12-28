import { useSemester } from '../contexts/semester-context'
import { getValidAccessToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://be.thaily.id.vn'

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
export async function getFileURL(fileId: string, semester: string, excel: boolean): Promise<string> {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('No access token available')
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/files/${fileId}/url${excel ? '?excel=true' : ''}`, {
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
export async function deleteFile(fileId: string, semester: string, excel: boolean = false): Promise<void> {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('No access token available')
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/files/${fileId}${excel ? '?excel=true' : ''}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-semester': semester,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete file' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }
}


/**
 * Download file using presigned URL
 */
export async function downloadFile(fileId: string, semester: string, filename?: string, excel: boolean = false): Promise<void> {
  try {
    const url = await getFileURL(fileId, semester, excel)
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
  currentSemesterCode: string,
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
  formData.append('semester_code', semesterCode)
  const response = await fetch(`${API_BASE_URL}/api/v1/files/upload/${type}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-semester': currentSemesterCode,
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

/**
 * Excel import job interface
 */
export interface ExcelJob {
  id: string
  file: string
  title: string
  option: string
  table_type: number
  table_id: string
  status: 'pending' | 'processing'
  // messages can be string[] (errors) or object[] (success data)
  messages: (string | Record<string, unknown>)[]
  upload_type: string
  sum: number
  current: number
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * Get list of Excel import jobs
 */
export async function getExcelJobs(semesterCode: string, role: string = "affair"): Promise<ExcelJob[]> {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('No access token available')
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/files/list/excel`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-semester': semesterCode,
      'x-role': role
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get excel jobs' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.data || data || []
}

