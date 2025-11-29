/**
 * Utility functions for exporting data to Excel
 * Frontend-only export using xlsx library
 */

import { Student, Teacher } from '@/types/graphql'
import * as XLSXX from 'xlsx'
import XLSX from 'xlsx-js-style'; // Dùng thư viện này để có màu sắc

/**
 * Export data array to Excel file
 * @param data - Array of objects to export
 * @param filename - Name of the exported file
 * @param sheetName - Name of the Excel sheet (default: 'Sheet1')
 */
export function exportToExcel(
  data: any[],
  filename: string,
  sheetName: string = 'Sheet1'
): void {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất')
    return
  }

  try {
    // Create a new workbook
    const wb = XLSXX.utils.book_new()
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    
    // Generate Excel file and download
    XLSX.writeFile(wb, filename)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    alert('Lỗi khi xuất dữ liệu: ' + (error as Error).message)
  }
}

/**
 * Export students to Excel
 * @param students - Array of student objects
 * @param includeFields - Optional array of field names to include (if not provided, includes all fields)
 */
export function exportStudents(
  students: Student[],
  includeFields?: string[]
): void {
  if (!students || students.length === 0) {
    alert('Không có dữ liệu sinh viên để xuất')
    return
  }

  // Map data to export format
  const exportData = students.map((student) => {
    const row: any = {
      'Mã sinh viên': student.mssv || '',
      'Họ và tên': student.username || '',
      'Email': student.email || '',
      'Số điện thoại': student.phone || '',
      'Giới tính': student.gender || '',
      'Mã ngành': student.majorCode || '',
      'Mã lớp': student.classCode || '',
      'Mã học kỳ': student.semesterCode || '',
      'Ngày tạo': student.createdAt 
        ? new Date(student.createdAt).toLocaleDateString('vi-VN')
        : '',
      'Ngày cập nhật': student.updatedAt
        ? new Date(student.updatedAt).toLocaleDateString('vi-VN')
        : '',
    }

    // If includeFields is provided, only include those fields
    if (includeFields) {
      const filteredRow: any = {}
      includeFields.forEach((field) => {
        if (row[field] !== undefined) {
          filteredRow[field] = row[field]
        }
      })
      return filteredRow
    }

    return row
  })

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `students_${timestamp}.xlsx`
  
  exportToExcel(exportData, filename, 'Sinh viên')
}

/**
 * Export teachers to Excel
 * @param teachers - Array of teacher objects
 * @param includeFields - Optional array of field names to include (if not provided, includes all fields)
 */
export function exportTeachers(
  teachers: Teacher[],
  includeFields?: string[]
): void {
  if (!teachers || teachers.length === 0) {
    alert('Không có dữ liệu giáo viên để xuất')
    return
  }

  // Map data to export format
  const exportData = teachers.map((teacher) => {
    const row: any = {
      'Mã giáo viên': teacher.id || teacher.msgv || '',
      'Họ và tên': teacher.username || '',
      'Email': teacher.email || '',
      'Giới tính': teacher.gender == "MALE" ? 'Nam' : teacher.gender == "FEMALE" ? 'Nữ' : 'Khác',
      'Mã ngành': teacher.majorCode || '',
      'Mã học kỳ': teacher.semesterCode || '',
      'x-teacher': teacher.roles?.some(role => role.role === 'TEACHER') ? 'X' : '', 
      'x-department': teacher.roles?.some(role => role.role === 'DEPARTMENT_LECTURER') ? 'X' : '',
      'x-affair': teacher.roles?.some(role => role.role === 'ACADEMIC_AFFAIRS_STAFF') ? 'X' : '',
      'Ngày tạo': teacher.createdAt
        ? new Date(teacher.createdAt).toLocaleDateString('vi-VN')
        : '',
      'Ngày cập nhật': teacher.updatedAt
        ? new Date(teacher.updatedAt).toLocaleDateString('vi-VN')
        : '',
    }

    // If includeFields is provided, only include those fields
    if (includeFields) {
      const filteredRow: any = {}
      includeFields.forEach((field) => {
        if (row[field] !== undefined) {
          filteredRow[field] = row[field]
        }
      })
      return filteredRow
    }

    return row
  })

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `teachers_${timestamp}.xlsx`
  
  exportToExcel(exportData, filename, 'Giáo viên')
}

/**
 * Export council data to Excel in a single comprehensive sheet
 * One row per student with all information in a flat table format
 * @param councils - Array of council data objects OR single council object
 */

export function councilExport(councils: any): void {
  const councilArray = Array.isArray(councils) ? councils : [councils];

  if (!councilArray || councilArray.length === 0) {
    alert('Không có dữ liệu để xuất');
    return;
  }

  try {
    const wb = XLSX.utils.book_new();

    // 1. Style: Cần wrapText để xuống dòng hiển thị list tiêu chí
    const commonStyle = {
      font: { name: "Times New Roman", sz: 11 },
      border: {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
      },
      alignment: { vertical: "top", wrapText: true } // "Top" để tiêu đề luôn ở trên
    };

    const headerStyle = {
      ...commonStyle,
      font: { name: "Times New Roman", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "2F5496" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true }
    };

    const centerStyle = {
      ...commonStyle,
      alignment: { ...commonStyle.alignment, horizontal: "center" }
    };

    // Style riêng cho cột điểm GV: Căn trái để nhìn list tiêu chí cho thẳng hàng
    const gradeCellStyle = {
      ...commonStyle,
      alignment: { vertical: "top", wrapText: true, horizontal: "left" } 
    };

    const allRows: any[] = [];
    const merges: any[] = [];
    let currentRowIndex = 1; 
    let sttHoiDong = 1;

    councilArray.forEach((council: any) => {
      const startRowCouncil = currentRowIndex;
      const topics = council.topicCouncils || [];
      
      topics.forEach((tc: any) => {
        const startRowTopic = currentRowIndex;
        const enrollments = tc.enrollments || [];

        enrollments.forEach((enrollment: any) => {
          const student = enrollment.student;
          const supervisor = tc.supervisors?.[0]?.teacher;

          // Helper: Format thông tin GV
          const formatTeacherHeader = (teacher: any) => {
            if (!teacher) return '';
            return `${teacher.username.toUpperCase()}\n(MSGV: ${teacher.msgv || '---'})`;
          };

          // Helper: Lấy thông tin chi tiết điểm + tiêu chí
          const getMemberGradeDetail = (pos: string) => {
            const defence = council.defences?.find((d: any) => d.position === pos);
            if (!defence) return '-';
            
            const gradeInfo = defence.gradeDefences?.find((gd: any) => 
              gd.enrollment?.student?.id === student?.id
            );
            
            const teacherHeader = formatTeacherHeader(defence.teacher);

            if (!gradeInfo) {
              return `${teacherHeader}\n\n[ Chưa chấm ]`;
            }

            // Xử lý list tiêu chí
            let criteriaText = '';
            if (gradeInfo.criteria && gradeInfo.criteria.length > 0) {
              criteriaText = gradeInfo.criteria.map((c: any, idx: number) => {
                // Format: • Tên tiêu chí: Điểm/Max
                return `• ${c.name}: ${c.score ?? 0}/${c.maxScore}`;
              }).join('\n');
            } else {
              criteriaText = '(Chưa có chi tiết tiêu chí)';
            }

            const totalScore = gradeInfo.totalScore ?? '?';
            const note = gradeInfo.note ? `\nNote: ${gradeInfo.note}` : '';

            // Layout trong 1 ô:
            // TÊN GV (MSGV)
            // ----------------
            // • Nội dung: 3/4
            // • Thuyết trình: 2/3
            // ----------------
            // TỔNG: 5.0
            return `${teacherHeader}\n------------------\n${criteriaText}\n------------------\n➤ TỔNG: ${totalScore}${note}`;
          };

          // Tính điểm TB Hội đồng
          const councilScores: number[] = [];
          (council.defences || []).forEach((defence: any) => {
            const gradeDefence = defence.gradeDefences?.find((gd: any) =>
              gd.enrollment?.student?.id === student?.id
            );
            if (gradeDefence && typeof gradeDefence.totalScore === 'number') {
              councilScores.push(gradeDefence.totalScore);
            }
          });
          const avgScore = councilScores.length > 0
            ? (councilScores.reduce((a, b) => a + b, 0) / councilScores.length).toFixed(2)
            : '';

          // Đẩy data vào row
          allRows.push([
            sttHoiDong,
            council.title,
            tc.topic?.title || 'Chưa có tên',
            student?.mssv,
            student?.username,
            formatTeacherHeader(supervisor), // GVHD thường ko chấm chi tiết ở bảng này nên để gọn
            getMemberGradeDetail('PRESIDENT'),
            getMemberGradeDetail('SECRETARY'),
            getMemberGradeDetail('REVIEWER'),
            getMemberGradeDetail('MEMBER'),
            avgScore,
            enrollment.final?.finalGrade || '',
          ]);

          currentRowIndex++;
        });

        // Merge Đề tài & GVHD
        if (currentRowIndex - 1 > startRowTopic) {
          merges.push({ s: { r: startRowTopic, c: 2 }, e: { r: currentRowIndex - 1, c: 2 } }); // Tên đề tài
          merges.push({ s: { r: startRowTopic, c: 5 }, e: { r: currentRowIndex - 1, c: 5 } }); // GVHD
        }
      });

      // Merge Hội đồng & STT
      if (currentRowIndex - 1 > startRowCouncil) {
        merges.push({ s: { r: startRowCouncil, c: 0 }, e: { r: currentRowIndex - 1, c: 0 } });
        merges.push({ s: { r: startRowCouncil, c: 1 }, e: { r: currentRowIndex - 1, c: 1 } });
      }
      sttHoiDong++;
    });

    const headers = [
      "STT", "Hội đồng", "Đề tài", 
      "MSSV", "Sinh viên", "GV Hướng dẫn",
      "Chủ tịch", "Thư ký", "Phản biện", "Ủy viên",
      "TB", "Tổng"
    ];

    const wsData = [headers, ...allRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    if (merges.length > 0) ws['!merges'] = merges;

    // Tăng độ rộng cột vì giờ nội dung nhiều hơn
    ws['!cols'] = [
      { wch: 5 },  // STT
      { wch: 15 }, // Hội đồng
      { wch: 30 }, // Đề tài
      { wch: 10 }, // MSSV
      { wch: 18 }, // Sinh viên
      { wch: 20 }, // GVHD
      { wch: 35 }, // Chủ tịch (Rộng để hiển thị list tiêu chí đẹp)
      { wch: 35 }, // Thư ký
      { wch: 35 }, // Phản biện
      { wch: 35 }, // Ủy viên
      { wch: 6 },  // TB
      { wch: 6 },  // Tổng
    ];

    // Apply Style
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        if (R === 0) {
          ws[cellAddress].s = headerStyle;
        } else {
          // Logic chọn style:
          // Cột 6,7,8,9 là các cột điểm chi tiết -> Căn trái (Left)
          // Các cột khác -> Căn giữa (Center) hoặc default
          if ([6, 7, 8, 9].includes(C)) {
            ws[cellAddress].s = gradeCellStyle; 
          } else if ([0, 3, 10, 11].includes(C)) {
             ws[cellAddress].s = centerStyle;
          } else {
             ws[cellAddress].s = commonStyle; // Căn top-left mặc định (cho tên đề tài, tên gvhd)
          }
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Bang_diem_chi_tiet');
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Hoi_dong_Chi_tiet_${timestamp}.xlsx`);

  } catch (error) {
    console.error(error);
    alert('Lỗi xuất file: ' + (error as Error).message);
  }
}