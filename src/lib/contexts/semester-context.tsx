'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apolloClient } from '@/lib/graphql/client'
import { GET_MY_SEMESTERS } from '@/lib/graphql/queries/student.queries'

interface Semester {
  id: string
  code: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

interface TeacherRole {
  semesterId: string
  roleSystem: string[] // e.g., ['REVIEWER', 'ADVISOR', 'COUNCIL_MEMBER']
}

interface SemesterContextType {
  currentSemester: Semester | null
  semesters: Semester[]
  teacherRoles: TeacherRole[]
  currentTeacherRole: string[]
  setCurrentSemester: (semesterId: string) => Promise<void>
  refreshSemesters: () => Promise<void>
  loading: boolean
}

const SemesterContext = createContext<SemesterContextType | undefined>(undefined)

export function SemesterProvider({ children }: { children: React.ReactNode }) {
  const [currentSemester, setCurrentSemesterState] = useState<Semester | null>(null)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [teacherRoles, setTeacherRoles] = useState<TeacherRole[]>([])
  const [loading, setLoading] = useState(true)

  // Get current teacher roles for selected semester
  const currentTeacherRole = React.useMemo(() => {
    if (!currentSemester) return []
    const roleData = teacherRoles.find((r) => r.semesterId === currentSemester.code)
    return roleData?.roleSystem || []
  }, [currentSemester, teacherRoles])

  // Fetch semesters and teacher roles
  const refreshSemesters = async () => {
    setLoading(true)
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        setLoading(false)
        return
      }

      const userRole = localStorage.getItem('userRole')

      // Fetch semesters using GraphQL query
      const semestersResult = await apolloClient.query({
        query: GET_MY_SEMESTERS,
        variables: {
          search: {
            pagination: { page: 1, pageSize: 100 },
            filters: [],
          },
        },
        fetchPolicy: 'network-only',
      })

      if ((semestersResult.data as any)?.getMySemesters?.data) {
        const sems = (semestersResult.data as any).getMySemesters.data.map((s: any) => ({
          id: s.id,
          code: s.id,
          name: s.title,
          startDate: s.createdAt,
          endDate: s.updatedAt,
          isCurrent: false, // Will be set based on saved or first one
        }))

        // Sort by createdAt descending (newest first)
        sems.sort((a: Semester, b: Semester) => {
          const dateA = new Date(a.startDate).getTime()
          const dateB = new Date(b.startDate).getTime()
          return dateB - dateA
        })

        setSemesters(sems)

        // Set current semester from saved or default to first
        const savedSemesterId = localStorage.getItem('currentSemesterId')
        const semester = savedSemesterId
          ? sems.find((s: Semester) => s.id === savedSemesterId)
          : sems[0]

        if (semester) {
          setCurrentSemesterState(semester)
        }
      }

      // Note: Teacher roles are now fetched from profile.roles
      // No need to calculate dynamic roles here
    } catch (error) {
      console.error('Error fetching semesters:', error)
    } finally {
      setLoading(false)
    }
  }

  // Change current semester
  const setCurrentSemester = async (semesterId: string) => {
    const semester = semesters.find((s) => s.id === semesterId)
    if (semester) {
      setCurrentSemesterState(semester)
      localStorage.setItem('currentSemesterId', semesterId)

      // Reload page data when semester changes
      window.location.reload()
    }
  }

  useEffect(() => {
    refreshSemesters()
  }, [])

  return (
    <SemesterContext.Provider
      value={{
        currentSemester,
        semesters,
        teacherRoles,
        currentTeacherRole,
        setCurrentSemester,
        refreshSemesters,
        loading,
      }}
    >
      {children}
    </SemesterContext.Provider>
  )
}

export function useSemester() {
  const context = useContext(SemesterContext)
  if (context === undefined) {
    throw new Error('useSemester must be used within a SemesterProvider')
  }
  return context
}
