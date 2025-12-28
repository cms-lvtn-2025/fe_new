"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { createDetailSearch } from "@/lib/graphql/utils/search-helpers";
import { GET_TOPIC_COUNCIL_DETAIL } from "@/lib/graphql/queries/teacher";
import {
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  Download,
  Upload,
  User,
  Mail,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  AlertCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { downloadFile } from "@/lib/api/file";
import { useState } from "react";
import GradeMidtermModal from "@/components/teacher/grading/GradeMidtermModal";
import GradeFinalModal from "@/components/teacher/grading/GradeFinalModal";
import { useSemester } from "@/lib/contexts/semester-context";

const STATUS_LABELS: Record<string, string> = {
  SUBMIT: "Đã nộp",
  TOPIC_PENDING: "Chờ duyệt",
  APPROVED_1: "Duyệt lần 1",
  APPROVED_2: "Duyệt lần 2",
  IN_PROGRESS: "Đang thực hiện",
  TOPIC_COMPLETED: "Hoàn thành",
  REJECTED: "Từ chối",
};

const STAGE_LABELS: Record<string, string> = {
  STAGE_1: "Giai đoạn 1",
  STAGE_2: "Giai đoạn 2",
};

export default function TeacherTopicDetailPage() {
  const router = useRouter();
  const params = useParams();
  const topicCouncilId = params.id as string;
  const backUrl = new URLSearchParams(window.location.search).get("backUrl") || "/teacher/topics";
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [isGradeMidtermModalOpen, setIsGradeMidtermModalOpen] = useState(false);
  const [isGradeFinalModalOpen, setIsGradeFinalModalOpen] = useState(false);
  const semesterCode = useSemester();
  const { data, loading, error, refetch } = useQuery(GET_TOPIC_COUNCIL_DETAIL, {
    variables: { search: createDetailSearch(topicCouncilId) },
    skip: !topicCouncilId,
  });

  const handleBack = () => {
    router.push(backUrl);
  };

  const handleDownloadFile = async (fileId: string, filename: string) => {
    try {
      await downloadFile(fileId, semesterCode.currentSemester?.id || "", filename);
    } catch (error) {
      alert("Lỗi khi tải xuống file: " + (error as Error).message);
    }
  };


  const handleOpenGradeMidterm = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setIsGradeMidtermModalOpen(true);
  };

  const handleOpenGradeFinal = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setIsGradeFinalModalOpen(true);
  };

  const handleGradeSuccess = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }


  const topicCouncilData = (data as any)?.teacher?.supervisor?.topicCouncils
    ?.data?.[0];

  const topic = topicCouncilData?.topic;
  const canGrade = topic?.status === "IN_PROGRESS";

  if (error && !topicCouncilData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Không tìm thấy thông tin đề tài
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          TopicCouncil với ID {topicCouncilId} không tồn tại
        </p>
        <button
          onClick={() => router.push(backUrl)}
          className="cursor-pointer mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const enrollments = topicCouncilData.enrollments || [];
  const supervisors = topicCouncilData.supervisors || [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="cursor-pointer flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {topic?.title || "Chi tiết đề tài"}
              </h1>
              <StatusBadge
                status={topic?.status || "UNKNOWN"}
                label={STATUS_LABELS[topic?.status] || topic?.status || "N/A"}
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Mã: {topic?.id || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {topic?.major?.title || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {topic?.semester?.title || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {topic.files && topic.files.length > 0 && (
              <button
                onClick={() => handleDownloadFile(topic.files[0].id, topic.files[0].title)}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                title="Download file đề tài"
              >
                <Download className="w-5 h-5" />
                Download File
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Topic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topic Council Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Thông tin Hội đồng
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Giai đoạn
                </label>
                <div className="mt-1">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded">
                    {STAGE_LABELS[topicCouncilData.stage] ||
                      topicCouncilData.stage ||
                      "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Mã hội đồng
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100 font-mono">
                  {topicCouncilData.councilCode || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Thời gian bắt đầu
                </label>
                <div className="mt-1 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {topicCouncilData.timeStart ? (
                    <div>
                      {new Date(topicCouncilData.timeStart).toLocaleDateString(
                        "vi-VN"
                      )}{" "}
                      {new Date(topicCouncilData.timeStart).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Chưa có lịch</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Thời gian kết thúc
                </label>
                <div className="mt-1 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {topicCouncilData.timeEnd ? (
                    <div>
                      {new Date(topicCouncilData.timeEnd).toLocaleDateString(
                        "vi-VN"
                      )}{" "}
                      {new Date(topicCouncilData.timeEnd).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Chưa có lịch</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tiến độ thực hiện
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Giai đoạn 1
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {topic?.percentStage1 || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${topic?.percentStage1 || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Giai đoạn 2
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {topic?.percentStage2 || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${topic?.percentStage2 || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Danh sách sinh viên ({enrollments.length})
              </h2>
            </div>

            {/* Grading Status Notice */}
            {!canGrade && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Chưa thể chấm điểm
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Chỉ có thể chấm điểm khi đề tài ở trạng thái "Đang thực hiện". Trạng thái hiện tại: {STATUS_LABELS[topic?.status] || topic?.status}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Chưa có sinh viên nào
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment: any) => {
                  const student = enrollment.student;
                  const midterm = enrollment.midterm;
                  const final = enrollment.final;

                  return (
                    <div
                      key={enrollment.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {student?.username || "N/A"}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span className="font-mono">
                                {student?.id || "N/A"}
                              </span>
                              <span>•</span>
                              <Mail className="w-4 h-4" />
                              <span>{student?.email || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Grades */}
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {/* Midterm */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-500 dark:text-gray-400">
                              Điểm giữa kỳ
                            </label>
                            {canGrade && (
                              <>
                                {midterm?.status === "PASS" || midterm?.status === "FAIL" ? (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                    Đã hoàn thành
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleOpenGradeMidterm(enrollment)}
                                    className="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                    title="Chấm điểm giữa kỳ"
                                  >
                                    <Edit className="w-3 h-3" />
                                    {midterm?.grade !== null && midterm?.grade !== undefined ? "Sửa" : "Chấm"}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {midterm?.grade !== null &&
                            midterm?.grade !== undefined ? (
                              <>
                                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {midterm.grade}
                                </span>
                                {midterm.status === "PASS" && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                                {midterm.status === "FAIL" && (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                {(midterm.status === "NOT_SUBMITTED" || midterm.status === "SUBMITTED") && (
                                  <span className="text-xs text-yellow-600 dark:text-yellow-400">(Nháp)</span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">
                                Chưa chấm
                              </span>
                            )}
                          </div>
                          {midterm?.status === "PASS" || midterm?.status === "FAIL" ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ⚠️ Điểm đã được finalize, không thể chỉnh sửa
                            </p>
                          ) : null}
                        </div>

                        {/* Final */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-500 dark:text-gray-400">
                              Điểm cuối kỳ
                            </label>
                            {canGrade && (
                              <>
                                {final?.status === "PASSED" || final?.status === "FAILED" || final?.status === "COMPLETED" ? (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                    Đã hoàn thành
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleOpenGradeFinal(enrollment)}
                                    className="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                    title="Chấm điểm cuối kỳ"
                                  >
                                    <Edit className="w-3 h-3" />
                                    {final?.supervisorGrade !== null && final?.supervisorGrade !== undefined ? "Sửa" : "Chấm"}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {final?.supervisorGrade !== null &&
                            final?.supervisorGrade !== undefined ? (
                              <>
                                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {final.supervisorGrade}
                                </span>
                                {final.status === "PASSED" && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                                {final.status === "FAILED" && (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                {final.status === "COMPLETED" && (
                                  <CheckCircle className="w-4 h-4 text-blue-600" />
                                )}
                                {final.status === "PENDING" && (
                                  <span className="text-xs text-yellow-600 dark:text-yellow-400">(Nháp)</span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">
                                Chưa chấm
                              </span>
                            )}
                          </div>
                          {final?.status === "PASSED" || final?.status === "FAILED" || final?.status === "COMPLETED" ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ⚠️ Điểm đã được finalize, không thể chỉnh sửa
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Midterm Files */}
                      {midterm?.files && midterm.files.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            File báo cáo giữa kỳ
                          </label>
                          <div className="space-y-2">
                            {midterm.files.map((file: any) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                    {file.title}
                                  </span>
                                  <StatusBadge
                                    status={file.status}
                                    label={file.status}
                                  />
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => handleDownloadFile(file.id, file.title)}
                                    className="cursor-pointer p-1.5 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded transition-colors"
                                    title="Tải xuống"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Final Files */}
                      {final?.files && final.files.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            File báo cáo cuối kỳ
                          </label>
                          <div className="space-y-2">
                            {final.files.map((file: any) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <FileText className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                    {file.title}
                                  </span>
                                  <StatusBadge
                                    status={file.status}
                                    label={file.status}
                                  />
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  
                                  <button
                                    onClick={() => handleDownloadFile(file.id, file.title)}
                                    className="cursor-pointer p-1.5 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded transition-colors"
                                    title="Tải xuống"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Supervisors & Additional Info */}
        <div className="space-y-6">
          {/* Supervisors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Giảng viên hướng dẫn
            </h2>
            {supervisors.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Chưa có thông tin
              </p>
            ) : (
              <div className="space-y-3">
                {supervisors.map((supervisor: any) => {
                  const teacher = supervisor.teacher;
                  return (
                    <div
                      key={supervisor.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {teacher?.username || "N/A"}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">
                            {teacher?.email || "N/A"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                          {teacher?.id || "N/A"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Thông tin khác
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-500 dark:text-gray-400">
                  Ngày tạo
                </label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {topicCouncilData.createdAt
                    ? new Date(topicCouncilData.createdAt).toLocaleDateString(
                        "vi-VN"
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500 dark:text-gray-400">
                  Cập nhật lần cuối
                </label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {topicCouncilData.updatedAt
                    ? new Date(topicCouncilData.updatedAt).toLocaleDateString(
                        "vi-VN"
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedEnrollment && (
        <>
          <GradeMidtermModal
            isOpen={isGradeMidtermModalOpen}
            onClose={() => {
              setIsGradeMidtermModalOpen(false);
              setSelectedEnrollment(null);
            }}
            enrollment={selectedEnrollment}
            onSuccess={handleGradeSuccess}
          />
          <GradeFinalModal
            isOpen={isGradeFinalModalOpen}
            onClose={() => {
              setIsGradeFinalModalOpen(false);
              setSelectedEnrollment(null);
            }}
            enrollment={selectedEnrollment}
            onSuccess={handleGradeSuccess}
          />
        </>
      )}
    </div>
  );
}
